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
}

interface AIChatProps {
  onInsert: (text: string) => void;
  onAgentEdit?: (editorValue: Value, changes: AgentChange[], options?: AgentEditOptions) => void;
  willContent?: WillContent;
  editorValue?: Value;
  activeSelectionIndex?: number;
  className?: string;
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

export function AIChat({ onInsert, onAgentEdit, willContent, editorValue, activeSelectionIndex, className }: AIChatProps) {
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

    // Parse streaming response
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let partialObject: Partial<AgentResponse> = {};

    if (reader) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log('[AIChat] Stream ended. Text buffer:', textBuffer);
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          console.log('[AIChat] Raw chunk received:', chunk);
          textBuffer += chunk;

          // Update message to show we're receiving data
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId
                ? {
                    ...msg,
                    content: 'Receiving response... (' + textBuffer.length + ' chars)',
                  }
                : msg
            )
          );
        }

        // Try to parse the complete text as JSON
        console.log('[AIChat] Attempting to parse complete response as JSON');
        try {
          // Try to extract JSON from the response (it might be wrapped in markdown)
          let jsonText = textBuffer.trim();

          // Remove markdown code blocks if present
          if (jsonText.startsWith('```json')) {
            jsonText = jsonText.substring(7);
          }
          if (jsonText.startsWith('```')) {
            jsonText = jsonText.substring(3);
          }
          if (jsonText.endsWith('```')) {
            jsonText = jsonText.substring(0, jsonText.length - 3);
          }
          jsonText = jsonText.trim();

          console.log('[AIChat] Cleaned JSON text:', jsonText);

          partialObject = JSON.parse(jsonText);
          console.log('[AIChat] Successfully parsed JSON:', partialObject);

          // Deanonymize the parsed object
          if (context) {
            const tokenMap = Object.fromEntries(context.tokenMap);

            if (partialObject.explanation) {
              partialObject.explanation = deAnonymizeText(partialObject.explanation, tokenMap);
            }

            if (partialObject.changes) {
              partialObject.changes = partialObject.changes.map(change => ({
                ...change,
                location: typeof change.location === 'string'
                  ? deAnonymizeText(change.location, tokenMap)
                  : change.location,
                content: change.content && typeof change.content === 'string'
                  ? deAnonymizeText(change.content, tokenMap)
                  : change.content,
              }));
            }

            if (partialObject.modifiedDocument) {
              partialObject.modifiedDocument = deAnonymizeEditorValue(
                partialObject.modifiedDocument,
                tokenMap
              );
            }
          }
        } catch (parseError) {
          console.error('[AIChat] Failed to parse JSON response:', parseError);
          console.error('[AIChat] Raw text was:', textBuffer);

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId
                ? {
                    ...msg,
                    content: 'Error: AI returned invalid JSON format. Please try again.',
                    isPending: false,
                  }
                : msg
            )
          );

          setPendingChanges(null);
          setStreamingMessageId(null);
          return;
        }

        // Final processing
        console.log('[AIChat] Stream complete. Final object:', partialObject);

        if (!partialObject.explanation && !partialObject.changes) {
          console.error('[AIChat] No data received from stream');
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId
                ? { ...msg, content: 'Error: No response received from AI. Please try again.', isPending: false }
                : msg
            )
          );
          setPendingChanges(null);
          setStreamingMessageId(null);
          return;
        }

        if (partialObject.explanation && partialObject.changes && partialObject.modifiedDocument) {
          // Validate that the AI didn't lose content (safety check)
          const originalBlockCount = Array.isArray(editorValue) ? editorValue.length : 0;
          const modifiedBlockCount = Array.isArray(partialObject.modifiedDocument)
            ? partialObject.modifiedDocument.length
            : 0;

          console.log('[AIChat] Content validation:', {
            originalBlocks: originalBlockCount,
            modifiedBlocks: modifiedBlockCount,
            changeType: partialObject.changes.map(c => c.type).join(', '),
          });

          // If AI returned significantly fewer blocks and it's not a delete operation, warn user
          const hasDeleteOperation = partialObject.changes.some(c => c.type === 'delete');
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
              return;
            }
          }

          // Check for destructive changes
          const destructiveChanges = partialObject.changes.filter(
            (c) => c.type === 'delete' && c.confirmationRequired
          );

          if (destructiveChanges.length > 0) {
            const confirmed = confirm(
              `The AI wants to delete content:\n${destructiveChanges
                .map((c) => `• ${c.location}`)
                .join('\n')}\n\nAllow these changes?`
            );

            if (!confirmed) {
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
              return;
            }
          }

          // Set pending changes for accept/reject
          setPendingChanges({
            modifiedDocument: partialObject.modifiedDocument,
            changes: partialObject.changes,
          });

          // Apply changes to editor with pending marks (show yellow highlighting immediately)
          if (onAgentEdit) {
            onAgentEdit(partialObject.modifiedDocument, partialObject.changes, {
              isPending: true,
            });
          }

          // Update message to not pending (but changes still pending in editor)
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId
                ? { ...msg, isPending: false }
                : msg
            )
          );
        }
      } catch (error) {
        console.error('Stream processing error:', error);

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

      {/* Messages - Scrollable */}
      <ScrollArea className="flex-1 min-h-0 px-4">
        <div className="space-y-4 py-4">
          {messages.map((message) => (
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
