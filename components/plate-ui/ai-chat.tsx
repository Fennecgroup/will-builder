'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Sparkles, Loader2, User, Bot, X, Check } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import type { WillContent } from '@/lib/types/will';
import { buildTestatorContext, deAnonymizeText } from '@/lib/ai/context-builder';
import { buildDocumentContext } from '@/lib/ai/document-context-builder';
import { AI_FEATURES, type AgentChange, type AgentResponse } from '@/lib/ai/types';
import type { Value } from '@udecode/plate';

const QUICK_PROMPTS = [
  {
    id: 'translate-afrikaans',
    label: 'Translate to Afrikaans',
    prompt: 'Translate the entire document to Afrikaans while maintaining all legal formatting and structure'
  },
  {
    id: 'bold-headings',
    label: 'Make all headings bold',
    prompt: 'Make all heading text in the document bold'
  },
  {
    id: 'number-sections',
    label: 'Number all sections',
    prompt: 'Number all sections in the document with numbers like 1.2.3. etc.'
  }
] as const;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode?: 'ask' | 'agent';
  changes?: AgentChange[];
  isPending?: boolean;
}

interface AgentEditOptions {
  isPending: boolean;
  isStreaming?: boolean;
}

interface AIChatProps {
  onInsert: (text: string) => void;
  onAgentEdit?: (editorValue: Value, changes: AgentChange[], options?: AgentEditOptions) => void;
  onStreamingProgress?: (progress: { chars: number; status: string }) => void;
  onStreamingText?: (text: string) => void;
  willContent?: WillContent;
  editorValue?: Value;
  activeSelectionIndex?: number;
  className?: string;
}

/**
 * Unescape JSON string (handle \n, \", \\, etc.)
 */
function unescapeJsonString(str: string): string {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}

/**
 * Parse NDJSON stream incrementally
 * Returns parsed objects line-by-line
 * Also handles legacy single-JSON format
 */
async function* parseNDJSON(reader: ReadableStreamDefaultReader<Uint8Array>) {
  const decoder = new TextDecoder();
  let buffer = '';
  let isLegacyFormat = false;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      // Parse any remaining data
      const trimmedBuffer = buffer.trim();
      if (trimmedBuffer && (trimmedBuffer.startsWith('{') || trimmedBuffer.startsWith('['))) {
        try {
          const parsed = JSON.parse(trimmedBuffer);

          // Detect if this is legacy format (has modifiedDocument field)
          if (parsed.modifiedDocument && !parsed.type) {
            console.log('[NDJSON] Detected legacy JSON format');
            isLegacyFormat = true;
          }

          yield parsed;
        } catch (e) {
          // Only log parse errors if we haven't detected legacy format
          if (!isLegacyFormat) {
            console.error('[NDJSON] Failed to parse final buffer:', e);
          }
        }
      }
      break;
    }

    // Decode chunk and add to buffer
    const chunk = decoder.decode(value, { stream: true });
    buffer += chunk;

    // If buffer is getting large and doesn't contain newlines, likely legacy format
    if (buffer.length > 500 && !buffer.includes('\n')) {
      isLegacyFormat = true;
      console.log('[NDJSON] Detected legacy format (no newlines in large buffer)');
      continue; // Keep buffering until done
    }

    // Process complete lines
    const lines = buffer.split('\n');

    // Keep the last incomplete line in buffer
    buffer = lines.pop() || '';

    // Parse and yield complete lines
    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip empty lines
      if (!trimmedLine) continue;

      // Skip lines that don't look like JSON objects
      if (!trimmedLine.startsWith('{') && !trimmedLine.startsWith('[')) {
        // Only warn if not legacy format
        if (!isLegacyFormat) {
          console.warn('[NDJSON] Skipping non-JSON line:', trimmedLine.substring(0, 50));
        }
        continue;
      }

      try {
        const parsed = JSON.parse(trimmedLine);

        // Detect if this is legacy format
        if (parsed.modifiedDocument && !parsed.type) {
          console.log('[NDJSON] Detected legacy JSON format');
          isLegacyFormat = true;
        }

        yield parsed;
      } catch (e) {
        // Only log errors if:
        // 1. Not legacy format
        // 2. Line is substantial (> 10 chars)
        // 3. Line doesn't look like partial JSON
        if (!isLegacyFormat && trimmedLine.length > 10 && !trimmedLine.includes('...')) {
          console.warn('[NDJSON] Parse error (will retry):', trimmedLine.substring(0, 50));
        }
      }
    }
  }
}

/**
 * Recursively validate and clean editor value, removing any undefined nodes
 */
function validateEditorValue(value: any): any {
  if (!value) return null;

  // Handle arrays
  if (Array.isArray(value)) {
    return value
      .filter(item => item !== undefined && item !== null)
      .map(item => validateEditorValue(item))
      .filter(item => item !== null);
  }

  // Handle objects (editor nodes)
  if (typeof value === 'object') {
    const result: any = { ...value };

    // Recursively validate children
    if (Array.isArray(result.children)) {
      result.children = result.children
        .filter((child: any) => child !== undefined && child !== null)
        .map((child: any) => validateEditorValue(child))
        .filter((child: any) => child !== null);

      // If children array is empty and node has text, that's valid
      // Otherwise, ensure we have at least one child
      if (result.children.length === 0 && !('text' in result)) {
        return null;
      }
    }

    return result;
  }

  // Return primitive values as-is
  return value;
}

/**
 * Recursively remove pending flag from AI marks
 */
function removePendingMarks(value: Value): Value {
  const processNodes = (nodes: any[]): any[] => {
    return nodes.map(node => {
      if ('text' in node) {
        // Text node - remove pending flag but keep ai mark
        const { pending, ...rest } = node;
        return rest;
      }
      if ('children' in node && Array.isArray(node.children)) {
        return {
          ...node,
          children: processNodes(node.children),
        };
      }
      return node;
    });
  };

  return processNodes(value) as Value;
}

/**
 * Recursively deanonymize all text content in a Plate editor value
 */
function deAnonymizeEditorValue(value: any, tokenMap: Record<string, string>): any {
  if (!value) return value;

  // Handle arrays (like the top-level editor value)
  if (Array.isArray(value)) {
    return value.map(item => deAnonymizeEditorValue(item, tokenMap));
  }

  // Handle objects (editor nodes)
  if (typeof value === 'object') {
    const result: any = { ...value };

    // Deanonymize text content if present
    if (typeof result.text === 'string') {
      result.text = deAnonymizeText(result.text, tokenMap);
    }

    // Recursively process children
    if (Array.isArray(result.children)) {
      result.children = result.children.map((child: any) =>
        deAnonymizeEditorValue(child, tokenMap)
      );
    }

    return result;
  }

  // Return primitive values as-is
  return value;
}

/**
 * Count total characters in editor value
 */
function getTotalCharacterCount(value: Value): number {
  let count = 0;
  const traverse = (nodes: any[]) => {
    for (const node of nodes) {
      if ('text' in node && typeof node.text === 'string') {
        count += node.text.length;
      }
      if ('children' in node && Array.isArray(node.children)) {
        traverse(node.children);
      }
    }
  };
  traverse(value);
  return count;
}

/**
 * Extract editor value up to a specific character count
 * Returns a partial editor value with text truncated at the character limit
 */
function extractCharactersUpTo(value: Value, charLimit: number): Value {
  let charCount = 0;

  const extractNodes = (nodes: any[]): any[] => {
    const result: any[] = [];

    for (const node of nodes) {
      if (charCount >= charLimit) break;

      if ('text' in node && typeof node.text === 'string') {
        const remainingChars = charLimit - charCount;
        const textToInclude = node.text.slice(0, remainingChars);

        result.push({
          ...node,
          text: textToInclude
        });

        charCount += textToInclude.length;
      } else if ('children' in node && Array.isArray(node.children)) {
        const extractedChildren = extractNodes(node.children);

        if (extractedChildren.length > 0) {
          result.push({
            ...node,
            children: extractedChildren
          });
        }
      } else {
        result.push(node);
      }
    }

    return result;
  };

  return extractNodes(value) as Value;
}

export function AIChat({ onInsert, onAgentEdit, onStreamingProgress, onStreamingText, willContent, editorValue, activeSelectionIndex, className }: AIChatProps) {
  const [mode, setMode] = React.useState<'ask' | 'agent'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('ai-chat-mode') as 'ask' | 'agent') || 'ask';
    }
    return 'ask';
  });
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hello! I'm your AI writing assistant. I can help you draft, edit, and improve your will document. How can I assist you today?",
    },
  ]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const editorSnapshot = React.useRef<Value | null>(null);
  const [pendingChanges, setPendingChanges] = React.useState<{
    modifiedDocument: Value;
    changes: AgentChange[];
  } | null>(null);
  const [streamingMessageId, setStreamingMessageId] = React.useState<string | null>(null);
  const [characterBuffer, setCharacterBuffer] = React.useState<Value>([]);
  const characterBufferRef = React.useRef<Value>([]);
  const [characterIndex, setCharacterIndex] = React.useState(0);
  const animationFrameRef = React.useRef<number | null>(null);
  const lastAnimatedCharCount = React.useRef<number>(0);

  React.useEffect(() => {
    localStorage.setItem('ai-chat-mode', mode);
  }, [mode]);

  // Auto-scroll to bottom when messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Warn user if they try to navigate away with pending changes
  React.useEffect(() => {
    if (!pendingChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [pendingChanges]);

  // Cleanup animation on unmount
  React.useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        clearTimeout(animationFrameRef.current);
      }
    };
  }, []);

  // Character animation effect - runs when buffer updates
  React.useEffect(() => {
    if (characterBuffer.length === 0) return;

    // Update ref with latest buffer
    characterBufferRef.current = characterBuffer;

    const CHARS_PER_FRAME = 3;
    const FRAME_DELAY = 4;

    // If animation is already running, let it continue (it will pick up the new content from the ref)
    if (animationFrameRef.current) {
      return;
    }

    // Start animation from where we left off
    let currentIndex = lastAnimatedCharCount.current;

    const animate = () => {
      // Read the latest buffer from ref
      const currentBuffer = characterBufferRef.current;

      // Safety check: if buffer was cleared, stop animation
      if (!currentBuffer || currentBuffer.length === 0) {
        animationFrameRef.current = null;
        return;
      }

      const totalChars = getTotalCharacterCount(currentBuffer);

      if (currentIndex >= totalChars) {
        // Animation caught up with current buffer
        animationFrameRef.current = null;
        lastAnimatedCharCount.current = currentIndex;
        return;
      }

      // Extract partial content up to currentIndex
      const partialContent = extractCharactersUpTo(currentBuffer, currentIndex);

      // Apply to editor with streaming marks
      if (onAgentEdit && partialContent.length > 0) {
        onAgentEdit(partialContent, [], {
          isPending: true,
          isStreaming: true
        });
      }

      // Emit progress
      onStreamingProgress?.({
        chars: currentIndex,
        status: 'streaming'
      });

      currentIndex += CHARS_PER_FRAME;
      lastAnimatedCharCount.current = currentIndex;

      // Schedule next frame
      animationFrameRef.current = window.setTimeout(() => {
        requestAnimationFrame(animate);
      }, FRAME_DELAY);
    };

    requestAnimationFrame(animate);
  }, [characterBuffer, onAgentEdit, onStreamingProgress]);

  const handleAskMode = React.useCallback(async (userInput: string, context: any) => {
    console.log('Ask mode request:', { userInput, context: context?.contextData });

    const response = await fetch('/api/ai/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: userInput,
        mode: 'ask',
        system: `You are an AI assistant helping with legal document writing, specifically wills.
You should:
- Provide helpful suggestions for will content
- Answer questions about will structure and language
- Suggest improvements to existing text
- Help draft specific clauses or sections
- Always be clear that you're providing assistance, not legal advice
Format your responses in a clear, readable way.`,
        testatorContext: context?.contextData,
      }),
    });

    if (!response.ok) throw new Error('Failed to get AI response');

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let assistantContent = '';

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      mode: 'ask',
    };

    setMessages((prev) => [...prev, assistantMessage]);

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantContent += chunk;

        const displayContent = context
          ? deAnonymizeText(assistantContent, Object.fromEntries(context.tokenMap))
          : assistantContent;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id
              ? { ...msg, content: displayContent }
              : msg
          )
        );
      }
    }

    // Validate we received content
    if (!assistantContent.trim()) {
      console.error('Ask mode: No content received from AI');
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? { ...msg, content: 'Sorry, I received an empty response. Please try again.' }
            : msg
        )
      );
    }
  }, []);

  const handleAgentMode = React.useCallback(async (userInput: string, context: any) => {
    console.log('Agent mode request:', { userInput, context: context?.contextData });

    // Save current editor state as snapshot
    if (editorValue) {
      editorSnapshot.current = JSON.parse(JSON.stringify(editorValue));
    }

    // Clear any previous character buffer and animation
    if (animationFrameRef.current) {
      clearTimeout(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setCharacterBuffer([]);
    characterBufferRef.current = [];
    setCharacterIndex(0);
    lastAnimatedCharCount.current = 0;

    // Build request body - always include full document
    let requestBody: any = {
      prompt: userInput,
      mode: 'agent',
      testatorContext: context?.contextData,
      fullEditorValue: editorValue, // Always pass full document
    };

    // Build optimized document context if feature is enabled (as guidance only)
    if (AI_FEATURES.useOptimizedDocumentContext && editorValue) {
      try {
        const docContext = buildDocumentContext({
          editorValue,
          userCommand: userInput,
          activeSelectionIndex,
          tokenBudget: 1700, // 85% of command budget (2000 tokens)
        });

        console.log('[AIChat] Document context built:', {
          estimatedTokens: docContext.estimatedTokens,
          activeSectionArticle: docContext.activeSectionArticle,
          relatedSectionsCount: docContext.relatedSectionsSummaries.length,
        });

        // Pass optimized context as guidance only
        requestBody.documentContext = docContext.formattedContext;
      } catch (error) {
        console.error('[AIChat] Failed to build document context:', error);
        // Full document is already in requestBody, so we're fine
      }
    }

    const response = await fetch('/api/ai/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    console.log('[AIChat] Response status:', response.status);
    console.log('[AIChat] Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AIChat] API error:', errorText);
      throw new Error(`Failed to get AI response: ${response.status} - ${errorText}`);
    }

    // Create a placeholder message for streaming updates
    const messageId = (Date.now() + 1).toString();
    setStreamingMessageId(messageId);

    const assistantMessage: Message = {
      id: messageId,
      role: 'assistant',
      content: '',
      mode: 'agent',
      isPending: true,
    };

    setMessages((prev) => [...prev, assistantMessage]);

    // Parse NDJSON streaming response
    const reader = response.body?.getReader();
    let documentBlocks: any[] = [];
    let metadata: any = null;
    let receivedNDJSON = false;

    if (reader) {
      try {
        // Parse NDJSON stream
        for await (const item of parseNDJSON(reader)) {
          console.log('[AIChat] Received NDJSON item:', item.type);

          // Check if this is NDJSON format (has 'type' field)
          if (item.type === 'block' || item.type === 'complete') {
            receivedNDJSON = true;
          }

          if (item.type === 'block') {
            // Document block arrived
            const { index, node } = item;

            // Validate node exists
            if (!node) {
              console.warn('[AIChat] Received block with no node at index', index);
              continue;
            }

            // De-anonymize the node if needed
            const deAnonymizedNode = context
              ? deAnonymizeEditorValue(node, Object.fromEntries(context.tokenMap))
              : node;

            // Insert block at specified index
            documentBlocks[index] = deAnonymizedNode;

            // Filter out undefined blocks and deeply validate structure
            const validBlocks = validateEditorValue(documentBlocks) || [];

            // Buffer blocks for character-by-character rendering
            // The animation will be triggered by the effect when buffer updates
            setCharacterBuffer(validBlocks);

          } else if (item.type === 'complete') {
            // Final metadata arrived
            metadata = item;

            // De-anonymize explanation and changes
            if (context) {
              const tokenMap = Object.fromEntries(context.tokenMap);
              metadata.explanation = deAnonymizeText(metadata.explanation, tokenMap);
              metadata.changes = metadata.changes?.map((change: any) => ({
                ...change,
                location: deAnonymizeText(change.location, tokenMap),
                content: change.content ? deAnonymizeText(change.content, tokenMap) : undefined
              }));
            }

            // Show explanation in UI
            onStreamingText?.(metadata.explanation);
          } else if (!item.type && item.modifiedDocument) {
            // Legacy format detected - convert it
            console.log('[AIChat] Detected legacy JSON format during parsing');
            receivedNDJSON = false;

            // Apply deanonymization if needed
            let processedBlocks = item.modifiedDocument;
            if (context) {
              const tokenMap = Object.fromEntries(context.tokenMap);
              processedBlocks = deAnonymizeEditorValue(processedBlocks, tokenMap);
            }

            // Validate and clean the blocks
            documentBlocks = validateEditorValue(processedBlocks) || [];

            metadata = {
              explanation: item.explanation,
              changes: item.changes,
              totalBlocks: documentBlocks.length
            };

            // Deanonymize metadata
            if (context) {
              const tokenMap = Object.fromEntries(context.tokenMap);
              metadata.explanation = deAnonymizeText(metadata.explanation, tokenMap);
              metadata.changes = metadata.changes?.map((change: any) => ({
                ...change,
                location: deAnonymizeText(change.location, tokenMap),
                content: change.content ? deAnonymizeText(change.content, tokenMap) : undefined
              }));
            }

            // Show explanation
            onStreamingText?.(metadata.explanation);

            // Break out of loop since we have everything
            break;
          }
        }

        // Stream complete - validate and finalize
        console.log('[AIChat] Stream complete. Blocks:', documentBlocks.length, 'NDJSON:', receivedNDJSON);

        // Emit parsing status
        onStreamingProgress?.({
          chars: documentBlocks.length,
          status: 'parsing'
        });

        // Validate we received data
        if (!metadata || documentBlocks.length === 0) {
          console.error('[AIChat] No data received from stream');

          // Cancel animation and clear buffer
          if (animationFrameRef.current) {
            clearTimeout(animationFrameRef.current);
            animationFrameRef.current = null;
          }
          setCharacterBuffer([]);
          characterBufferRef.current = [];
          setCharacterIndex(0);
          lastAnimatedCharCount.current = 0;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId
                ? { ...msg, content: 'Error: No response received from AI. Please try again.', isPending: false }
                : msg
            )
          );
          setPendingChanges(null);
          setStreamingMessageId(null);

          // Reset streaming progress and clear text
          onStreamingProgress?.({
            chars: 0,
            status: 'idle'
          });
          onStreamingText?.('');

          return;
        }

        // Content loss detection
        const originalBlockCount = Array.isArray(editorValue) ? editorValue.length : 0;
        const modifiedBlockCount = documentBlocks.length;

        console.log('[AIChat] Content validation:', {
          originalBlocks: originalBlockCount,
          modifiedBlocks: modifiedBlockCount,
          changeType: metadata?.changes?.map((c: any) => c.type).join(', '),
        });

        // If AI returned significantly fewer blocks and it's not a delete operation, warn user
        const hasDeleteOperation = metadata?.changes?.some((c: any) => c.type === 'delete');
        const significantLoss = modifiedBlockCount < originalBlockCount * 0.5; // Lost more than 50% of blocks

        if (significantLoss && !hasDeleteOperation) {
          console.error('[AIChat] Potential content loss detected!', {
            original: originalBlockCount,
            modified: modifiedBlockCount,
          });

          const confirmed = confirm(
            `⚠️ CONTENT LOSS DETECTED\n\n` +
            `The AI response has ${modifiedBlockCount} blocks but your document has ${originalBlockCount} blocks.\n` +
            `This suggests the AI may have accidentally removed content.\n\n` +
            `Do you want to apply these changes anyway? (Not recommended)`
          );

          if (!confirmed) {
            // Cancel animation and clear buffer
            if (animationFrameRef.current) {
              clearTimeout(animationFrameRef.current);
              animationFrameRef.current = null;
            }
            setCharacterBuffer([]);
            characterBufferRef.current = [];
            setCharacterIndex(0);
            lastAnimatedCharCount.current = 0;

            // User rejected, restore snapshot
            if (editorSnapshot.current && onAgentEdit) {
              onAgentEdit(editorSnapshot.current, [], { isPending: false });
            }

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === messageId
                  ? { ...msg, content: 'Changes cancelled due to potential content loss.', isPending: false }
                  : msg
              )
            );

            setPendingChanges(null);
            setStreamingMessageId(null);

            // Reset streaming progress and clear text
            onStreamingProgress?.({
              chars: 0,
              status: 'idle'
            });
            onStreamingText?.('');

            return;
          }
        }

        // Check for destructive changes
        const destructiveChanges = metadata?.changes?.filter(
          (c: any) => c.type === 'delete' && c.confirmationRequired
        ) || [];

        if (destructiveChanges.length > 0) {
          const confirmed = confirm(
            `The AI wants to delete content:\n${destructiveChanges
              .map((c: any) => `• ${c.location}`)
              .join('\n')}\n\nAllow these changes?`
          );

          if (!confirmed) {
            // Cancel animation and clear buffer
            if (animationFrameRef.current) {
              clearTimeout(animationFrameRef.current);
              animationFrameRef.current = null;
            }
            setCharacterBuffer([]);
            characterBufferRef.current = [];
            setCharacterIndex(0);
            lastAnimatedCharCount.current = 0;

            // User rejected, restore snapshot
            if (editorSnapshot.current && onAgentEdit) {
              onAgentEdit(editorSnapshot.current, [], { isPending: false });
            }

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === messageId
                  ? { ...msg, content: 'Changes cancelled by user.', isPending: false }
                  : msg
              )
            );

            setPendingChanges(null);
            setStreamingMessageId(null);

            // Reset streaming progress and clear text
            onStreamingProgress?.({
              chars: 0,
              status: 'idle'
            });
            onStreamingText?.('');

            return;
          }
        }

        // Cancel any ongoing animation and clear buffer
        if (animationFrameRef.current) {
          clearTimeout(animationFrameRef.current);
          animationFrameRef.current = null;
        }

        // Clear buffer but DON'T reset lastAnimatedCharCount
        // This prevents restarting if effect somehow runs again
        setCharacterBuffer([]);
        characterBufferRef.current = [];
        setCharacterIndex(0);

        // Validate and clean final document blocks
        const finalValidBlocks = validateEditorValue(documentBlocks) || [];

        // Set pending changes for accept/reject
        setPendingChanges({
          modifiedDocument: finalValidBlocks,
          changes: metadata?.changes || [],
        });

        // Final application (remove streaming marks, keep pending)
        if (onAgentEdit) {
          onAgentEdit(finalValidBlocks, metadata?.changes || [], {
            isPending: true,
            isStreaming: false
          });
        }

        // Update message with explanation and changes (but changes still pending in editor)
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? {
                  ...msg,
                  content: metadata?.explanation || 'Document updated successfully.',
                  changes: metadata?.changes || [],
                  isPending: false
                }
              : msg
          )
        );

        // Reset streaming progress to idle and clear streaming text
        onStreamingProgress?.({
          chars: 0,
          status: 'idle'
        });
        onStreamingText?.('');
      } catch (error) {
        console.error('Stream processing error:', error);

        // Cancel animation and clear buffer
        if (animationFrameRef.current) {
          clearTimeout(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        setCharacterBuffer([]);
        characterBufferRef.current = [];
        setCharacterIndex(0);
        lastAnimatedCharCount.current = 0;

        // Restore snapshot on error
        if (editorSnapshot.current && onAgentEdit) {
          onAgentEdit(editorSnapshot.current, [], { isPending: false });
        }

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, content: 'Stream interrupted - changes not applied', isPending: false }
              : msg
          )
        );

        setPendingChanges(null);

        // Reset streaming progress and clear text
        onStreamingProgress?.({
          chars: 0,
          status: 'idle'
        });
        onStreamingText?.('');
      } finally {
        setStreamingMessageId(null);
      }
    }
  }, [editorValue, activeSelectionIndex, onAgentEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      mode,
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input.trim();
    setInput('');
    setIsLoading(true);

    const context = willContent
      ? buildTestatorContext({
          action: 'chat',
          selectedText: userInput,
          willContent,
          interactionType: mode === 'agent' ? 'command' : 'chat',
          conversationHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        })
      : null;

    try {
      if (mode === 'agent') {
        await handleAgentMode(userInput, context);
      } else {
        await handleAskMode(userInput, context);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        mode,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsertMessage = (content: string) => {
    onInsert(content);
  };

  const handleAcceptChanges = React.useCallback(() => {
    if (!pendingChanges || !onAgentEdit) return;

    // Remove pending marks, convert to confirmed
    const confirmedDocument = removePendingMarks(pendingChanges.modifiedDocument);
    onAgentEdit(confirmedDocument, pendingChanges.changes, {
      isPending: false,
    });

    setPendingChanges(null);
    editorSnapshot.current = null;
  }, [pendingChanges, onAgentEdit]);

  const handleRejectChanges = React.useCallback(() => {
    // Restore editor to pre-stream state
    if (editorSnapshot.current && onAgentEdit) {
      onAgentEdit(editorSnapshot.current, [], { isPending: false });
    }

    setPendingChanges(null);
    editorSnapshot.current = null;
  }, [onAgentEdit]);

  const handleQuickPrompt = React.useCallback((promptText: string) => {
    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: promptText,
      mode: 'agent',
    };

    // Update state
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setMode('agent'); // Switch to agent mode
    setIsLoading(true);

    // Build context
    const context = willContent
      ? buildTestatorContext({
          action: 'chat',
          selectedText: promptText,
          willContent,
          interactionType: 'command',
          conversationHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        })
      : null;

    // Execute agent mode
    handleAgentMode(promptText, context)
      .catch((error) => {
        console.error('Quick prompt error:', error);
        setMessages((prev) => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          mode: 'agent',
        }]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [willContent, messages, handleAgentMode, setMode, setInput, setMessages, setIsLoading]);

  return (
    <div
      className={cn(
        "flex flex-col h-full",
        "border-l border-neutral-200 dark:border-neutral-800",
        "bg-white dark:bg-neutral-950",
        className
      )}
    >
      {/* Header - Fixed */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 px-4 py-3 flex-shrink-0">
        <Sparkles className="h-5 w-5 text-purple-500" />
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          AI Writing Assistant
        </h2>
      </div>

      {/* Quick Prompts Bar */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 px-4 py-2 flex-shrink-0 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mb-1">
          {QUICK_PROMPTS.map((quickPrompt) => (
            <Button
              key={quickPrompt.id}
              variant="outline"
              size="sm"
              onClick={() => handleQuickPrompt(quickPrompt.prompt)}
              disabled={isLoading}
              className={cn(
                "flex-shrink-0 h-7 text-xs",
                "bg-white dark:bg-neutral-800",
                "border-emerald-200 dark:border-emerald-800",
                "text-emerald-700 dark:text-emerald-300",
                "hover:bg-emerald-50 dark:hover:bg-emerald-900/30",
                "hover:border-emerald-300 dark:hover:border-emerald-700",
                "transition-colors"
              )}
            >
              {quickPrompt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Messages - Scrollable */}
      <ScrollArea className="flex-1 min-h-0 px-4">
        <div className="space-y-4 py-4">
          {messages
            .filter(message => message.content.trim() !== '') // Only show messages with content
            .map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3 text-sm',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
              {message.role === 'assistant' && (
                <div className={cn(
                  'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                  message.mode === 'agent'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30'
                    : 'bg-purple-100 dark:bg-purple-900/30'
                )}>
                  <Bot className={cn(
                    'h-4 w-4',
                    message.mode === 'agent'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-purple-600 dark:text-purple-400'
                  )} />
                </div>
              )}
              <div
                className={cn(
                  'rounded-lg px-4 py-2 max-w-[80%]',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>

                {message.mode === 'agent' && message.changes && message.changes.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      <Check className="h-3 w-3" />
                      Changes applied
                    </div>
                    <ul className="mt-1 text-xs text-muted-foreground space-y-0.5">
                      {message.changes.map((change, i) => (
                        <li key={i}>• {change.type}: {change.location}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {message.role === 'assistant' && message.mode === 'ask' && message.content && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-7 text-xs"
                    onClick={() => handleInsertMessage(message.content)}
                  >
                    Insert into editor
                  </Button>
                )}
              </div>
              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className={cn(
                'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                mode === 'agent'
                  ? 'bg-emerald-100 dark:bg-emerald-900/30'
                  : 'bg-purple-100 dark:bg-purple-900/30'
              )}>
                <Loader2 className={cn(
                  'h-4 w-4 animate-spin',
                  mode === 'agent'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-purple-600 dark:text-purple-400'
                )} />
              </div>
              <div className="rounded-lg px-4 py-2 bg-muted">
                <p className="text-sm text-muted-foreground">
                  {mode === 'agent' ? 'Analyzing document...' : 'Thinking...'}
                </p>
              </div>
            </div>
          )}
          {/* Sentinel div for auto-scrolling */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Accept/Reject Changes - Shows when changes are pending */}
      {pendingChanges && (
        <div className="border-t border-neutral-200 dark:border-neutral-800 px-4 py-3 flex-shrink-0 bg-yellow-50 dark:bg-yellow-900/10">
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            Changes are pending in the editor
          </p>
          <div className="flex gap-2">
            <Button onClick={handleAcceptChanges} variant="default" size="sm">
              Accept Changes
            </Button>
            <Button onClick={handleRejectChanges} variant="outline" size="sm">
              Reject Changes
            </Button>
          </div>
        </div>
      )}

      {/* Mode Selector - Fixed above input */}
      <div className="border-t border-neutral-200 dark:border-neutral-800 px-4 py-2 flex-shrink-0">
        <RadioGroup value={mode} onValueChange={(v) => setMode(v as 'ask' | 'agent')} className="flex gap-4">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="ask" id="mode-ask" />
            <Label htmlFor="mode-ask" className="text-sm font-medium cursor-pointer">Ask</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="agent" id="mode-agent" />
            <Label htmlFor="mode-agent" className="text-sm font-medium cursor-pointer">Agent</Label>
          </div>
        </RadioGroup>
        <p className="text-xs text-muted-foreground mt-1">
          {mode === 'ask'
            ? 'AI responds in chat, you manually insert text'
            : 'AI can directly modify your document'}
        </p>
      </div>

      {/* Input Form - Fixed at Bottom */}
      <div className="border-t border-neutral-200 dark:border-neutral-800 px-4 py-3 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your will..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
