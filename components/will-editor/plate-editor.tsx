'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import {
  Plate,
  PlateContent,
  PlateElement,
  PlateLeaf,
  ParagraphPlugin,
  createPlateEditor,
  useEditorRef,
  useEditorState,
} from '@udecode/plate/react';
import type { Value } from '@udecode/plate';
import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import { HeadingPlugin } from '@udecode/plate-heading/react';
import { ListPlugin, BulletedListPlugin, NumberedListPlugin, ListItemPlugin } from '@udecode/plate-list/react';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import {
  AIPlugin,
  AIChatPlugin,
  CopilotPlugin,
} from '@udecode/plate-ai/react';
import { BlockSelectionPlugin } from '@udecode/plate-selection/react';
import {
  SlashPlugin,
  SlashInputPlugin,
} from '@udecode/plate-slash-command/react';
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Pilcrow,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AIMenu } from '@/components/plate-ui/ai-menu';
import { AIToolbarButton } from '@/components/plate-ui/ai-toolbar-button';
import { AIChat } from '@/components/plate-ui/ai-chat';
import { AILeaf } from '@/components/plate-ui/ai-leaf';
import { SlashInputElement } from '@/components/plate-ui/slash-input-element';
import { AISuggestionMenu } from '@/components/plate-ui/ai-suggestion-menu';
import { AICommandCombobox } from '@/components/plate-ui/ai-command-combobox';

interface PlateEditorProps {
  initialValue?: Value;
  onChange?: (value: Value) => void;
  className?: string;
}

// Custom element components
function ParagraphElement({ children, attributes, ...props }: any) {
  return (
    <PlateElement
      {...props}
      attributes={attributes}
      as="p"
      className="mb-4 leading-7"
    >
      {children}
    </PlateElement>
  );
}

function H1Element({ children, attributes, ...props }: any) {
  return (
    <PlateElement
      {...props}
      attributes={attributes}
      as="h1"
      className="mb-4 mt-6 text-3xl font-bold tracking-tight"
    >
      {children}
    </PlateElement>
  );
}

function H2Element({ children, attributes, ...props }: any) {
  return (
    <PlateElement
      {...props}
      attributes={attributes}
      as="h2"
      className="mb-3 mt-5 text-2xl font-semibold tracking-tight"
    >
      {children}
    </PlateElement>
  );
}

function H3Element({ children, attributes, ...props }: any) {
  return (
    <PlateElement
      {...props}
      attributes={attributes}
      as="h3"
      className="mb-2 mt-4 text-xl font-semibold tracking-tight"
    >
      {children}
    </PlateElement>
  );
}

function BlockquoteElement({ children, attributes, ...props }: any) {
  return (
    <PlateElement
      {...props}
      attributes={attributes}
      as="blockquote"
      className="mb-4 border-l-4 border-neutral-300 pl-4 italic text-neutral-600 dark:border-neutral-700 dark:text-neutral-400"
    >
      {children}
    </PlateElement>
  );
}

function BulletedListElement({ children, attributes, ...props }: any) {
  return (
    <PlateElement
      {...props}
      attributes={attributes}
      as="ul"
      className="mb-4 ml-6 list-disc"
    >
      {children}
    </PlateElement>
  );
}

function NumberedListElement({ children, attributes, ...props }: any) {
  return (
    <PlateElement
      {...props}
      attributes={attributes}
      as="ol"
      className="mb-4 ml-6 list-decimal"
    >
      {children}
    </PlateElement>
  );
}

function ListItemElement({ children, attributes, ...props }: any) {
  return (
    <PlateElement
      {...props}
      attributes={attributes}
      as="li"
      className="mb-1"
    >
      {children}
    </PlateElement>
  );
}

// Custom leaf components
function BoldLeaf({ children, attributes, ...props }: any) {
  return (
    <PlateLeaf {...props} attributes={attributes} as="strong" className="font-bold">
      {children}
    </PlateLeaf>
  );
}

function ItalicLeaf({ children, attributes, ...props }: any) {
  return (
    <PlateLeaf {...props} attributes={attributes} as="em" className="italic">
      {children}
    </PlateLeaf>
  );
}

function UnderlineLeaf({ children, attributes, ...props }: any) {
  return (
    <PlateLeaf {...props} attributes={attributes} as="u" className="underline">
      {children}
    </PlateLeaf>
  );
}

// Toolbar button component
interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  title: string;
}

function ToolbarButton({ onClick, isActive, children, title }: ToolbarButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      title={title}
      className={cn(
        'h-8 w-8 p-0',
        isActive && 'bg-neutral-200 dark:bg-neutral-800'
      )}
    >
      {children}
    </Button>
  );
}

// Toolbar with AI features
interface EditorToolbarProps {
  onAIAction: (action: string, text: string) => void;
  onOpenChat: () => void;
  isLoading: boolean;
}

function EditorToolbar({ onAIAction, onOpenChat, isLoading }: EditorToolbarProps) {
  const editor = useEditorRef();
  const editorState = useEditorState();

  // Check active marks by reading editor.marks
  const marks = editor.marks || {};
  const isBoldActive = !!marks[BoldPlugin.key];
  const isItalicActive = !!marks[ItalicPlugin.key];
  const isUnderlineActive = !!marks[UnderlinePlugin.key];

  // Check active block types - get current node from selection
  let currentType = 'p';
  if (editor.selection) {
    try {
      const nodeEntry = editor.api.node({ at: editor.selection });
      if (nodeEntry) {
        const [node] = nodeEntry as [any, any];
        if (node && typeof node === 'object' && 'type' in node) {
          currentType = node.type || 'p';
        }
      }
    } catch (e) {
      // Fallback to 'p' if error
      currentType = 'p';
    }
  }

  const isH1Active = currentType === 'h1';
  const isH2Active = currentType === 'h2';
  const isH3Active = currentType === 'h3';
  const isParagraphActive = currentType === 'p';
  const isBlockquoteActive = currentType === 'blockquote';
  const isUlActive = currentType === 'ul';
  const isOlActive = currentType === 'ol';

  // Toggle functions
  const toggleBold = () => {
    const isActive = !!editor.marks?.[BoldPlugin.key];
    if (isActive) {
      editor.tf.removeMark(BoldPlugin.key);
    } else {
      editor.tf.addMark(BoldPlugin.key, true);
    }
  };

  const toggleItalic = () => {
    const isActive = !!editor.marks?.[ItalicPlugin.key];
    if (isActive) {
      editor.tf.removeMark(ItalicPlugin.key);
    } else {
      editor.tf.addMark(ItalicPlugin.key, true);
    }
  };

  const toggleUnderline = () => {
    const isActive = !!editor.marks?.[UnderlinePlugin.key];
    if (isActive) {
      editor.tf.removeMark(UnderlinePlugin.key);
    } else {
      editor.tf.addMark(UnderlinePlugin.key, true);
    }
  };

  const setBlockType = (type: string) => {
    editor.tf.setNodes({ type });
  };

  const toggleList = (type: 'ul' | 'ol') => {
    const isActive = currentType === type;
    if (isActive) {
      // Convert list back to paragraph
      editor.tf.setNodes({ type: 'p' });
    } else {
      // Convert to list
      editor.tf.setNodes({ type });
    }
  };

  const toggleBlockquote = () => {
    const isActive = currentType === 'blockquote';
    if (isActive) {
      editor.tf.setNodes({ type: 'p' });
    } else {
      editor.tf.setNodes({ type: 'blockquote' });
    }
  };

  return (
    <div className="flex items-center gap-1 border-b border-neutral-200 bg-neutral-50 px-3 py-2 dark:border-neutral-800 dark:bg-neutral-900">
      <ToolbarButton onClick={() => setBlockType('h1')} isActive={isH1Active} title="Heading 1">
        <Heading1 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => setBlockType('h2')} isActive={isH2Active} title="Heading 2">
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => setBlockType('h3')} isActive={isH3Active} title="Heading 3">
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => setBlockType('p')} isActive={isParagraphActive} title="Paragraph">
        <Pilcrow className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToolbarButton onClick={toggleBold} isActive={isBoldActive} title="Bold (Ctrl+B)">
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={toggleItalic} isActive={isItalicActive} title="Italic (Ctrl+I)">
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={toggleUnderline} isActive={isUnderlineActive} title="Underline (Ctrl+U)">
        <Underline className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToolbarButton onClick={() => toggleList('ul')} isActive={isUlActive} title="Bulleted List">
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => toggleList('ol')} isActive={isOlActive} title="Numbered List">
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={toggleBlockquote} isActive={isBlockquoteActive} title="Quote">
        <Quote className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* AI Features */}
      <AIMenu onAIAction={onAIAction} isLoading={isLoading} />
      <AIToolbarButton onClick={onOpenChat} isLoading={isLoading} tooltip="AI Chat" />

      <div className="ml-auto flex items-center gap-2">
        {isLoading && (
          <span className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            Processing...
          </span>
        )}
        <span className="text-xs text-neutral-500">
          Cmd+J for AI
        </span>
      </div>
    </div>
  );
}

export function PlateEditor({ initialValue, onChange, className }: PlateEditorProps) {
  const defaultValue: Value = [
    {
      type: 'p',
      children: [{ text: 'Start writing your will...' }],
    },
  ];

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAIAction, setLastAIAction] = useState<{ action: string; text: string } | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const editor = useMemo(
    () =>
      createPlateEditor({
        plugins: [
          // Block selection must come before other plugins
          BlockSelectionPlugin,

          // Basic formatting
          ParagraphPlugin,
          HeadingPlugin,
          BoldPlugin.configure({
            handlers: {
              onKeyDown: ({ editor, event }) => {
                if (event.key === 'b' && (event.ctrlKey || event.metaKey)) {
                  event.preventDefault();
                  const isActive = !!editor.marks?.[BoldPlugin.key];
                  if (isActive) {
                    editor.tf.removeMark(BoldPlugin.key);
                  } else {
                    editor.tf.addMark(BoldPlugin.key, true);
                  }
                  return true;
                }
                return false;
              },
            },
          }),
          ItalicPlugin.configure({
            handlers: {
              onKeyDown: ({ editor, event }) => {
                if (event.key === 'i' && (event.ctrlKey || event.metaKey)) {
                  event.preventDefault();
                  const isActive = !!editor.marks?.[ItalicPlugin.key];
                  if (isActive) {
                    editor.tf.removeMark(ItalicPlugin.key);
                  } else {
                    editor.tf.addMark(ItalicPlugin.key, true);
                  }
                  return true;
                }
                return false;
              },
            },
          }),
          UnderlinePlugin.configure({
            handlers: {
              onKeyDown: ({ editor, event }) => {
                if (event.key === 'u' && (event.ctrlKey || event.metaKey)) {
                  event.preventDefault();
                  const isActive = !!editor.marks?.[UnderlinePlugin.key];
                  if (isActive) {
                    editor.tf.removeMark(UnderlinePlugin.key);
                  } else {
                    editor.tf.addMark(UnderlinePlugin.key, true);
                  }
                  return true;
                }
                return false;
              },
            },
          }),
          BlockquotePlugin,
          ListPlugin,
          BulletedListPlugin,
          NumberedListPlugin,
          ListItemPlugin,

          // AI Plugins
          AIPlugin,
          AIChatPlugin.configure({
            options: {
              trigger: ' ',
              triggerPreviousCharPattern: /^\s?$/,
            },
          }),
          CopilotPlugin.configure({
            options: {
              debounceDelay: 500,
              completeOptions: {
                api: '/api/ai/copilot',
                body: {},
              },
            },
          }),

          // Slash Commands
          SlashPlugin.configure({
            options: {
              trigger: '/',
              triggerPreviousCharPattern: /^\s?$/,
            },
          }),
          SlashInputPlugin.withComponent(SlashInputElement),
        ],
        value: initialValue && Array.isArray(initialValue) && initialValue.length > 0
          ? initialValue
          : defaultValue,
      }),
    // Empty dependency array is intentional - editor should only be created once
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleAIAction = useCallback(async (action: string, selectedText: string) => {
    setIsLoading(true);
    setLastAIAction({ action, text: selectedText });

    const prompts: Record<string, string> = {
      generate: `Generate appropriate content for a legal will document. Be formal and clear.`,
      improve: `Improve the following text to be more clear and professional while maintaining its legal accuracy:\n\n${selectedText}`,
      fix: `Fix any grammar, spelling, or punctuation errors in the following text:\n\n${selectedText}`,
      simplify: `Simplify the following text while maintaining its legal meaning:\n\n${selectedText}`,
      formal: `Make the following text more formal and appropriate for a legal document:\n\n${selectedText}`,
      emojify: `Add appropriate emojis to the following text while maintaining its meaning:\n\n${selectedText}`,
      expand: `Make the following text longer and more detailed while maintaining a professional tone:\n\n${selectedText}`,
      shorten: `Make the following text more concise and brief:\n\n${selectedText}`,
      summarize: `Summarize the following text concisely:\n\n${selectedText}`,
      continue: `Continue writing from the following text, maintaining the same style and tone:\n\n${selectedText}`,
      explain: `Explain the following text in simpler terms:\n\n${selectedText}`,
      custom: selectedText, // For custom prompts, selectedText is actually the custom prompt
    };

    const prompt = prompts[action] || selectedText;

    try {
      const response = await fetch('/api/ai/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error('Failed to get AI response');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let result = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          result += decoder.decode(value);
        }
      }

      // Insert or replace text based on action with AI marks
      if (result && editor.selection) {
        if (selectedText && action !== 'generate' && action !== 'explain') {
          // Replace selection
          editor.tf.delete();
        }

        // Insert text with AI marks for visual distinction
        const aiMark = { [AIPlugin.key]: true };
        editor.tf.insertText(result, { marks: aiMark });
      }
    } catch (error) {
      console.error('AI action error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [editor]);

  const handleInsertFromChat = useCallback((text: string) => {
    editor.tf.insertText(text);
  }, [editor]);

  const handleTryAgain = useCallback(() => {
    if (lastAIAction) {
      handleAIAction(lastAIAction.action, lastAIAction.text);
    }
  }, [lastAIAction, handleAIAction]);

  // Listen for slash AI commands
  useEffect(() => {
    const handleSlashAICommand = (event: Event) => {
      const customEvent = event as CustomEvent<{ action: string; selectedText: string }>;
      const { action, selectedText } = customEvent.detail;
      handleAIAction(action, selectedText);
    };

    window.addEventListener('slash-ai-command', handleSlashAICommand);
    return () => {
      window.removeEventListener('slash-ai-command', handleSlashAICommand);
    };
  }, [handleAIAction]);

  // Ctrl+K keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle commands from command palette
  const handleCommandPaletteAction = useCallback(
    (action: string, customPrompt?: string) => {
      const selectedText = editor.selection
        ? editor.api.string(editor.selection)
        : '';

      // Handle formatting commands
      if (['h1', 'h2', 'h3', 'p', 'blockquote', 'ul', 'ol'].includes(action)) {
        editor.tf.setNodes({ type: action });
        return;
      }

      // Handle custom prompts - pass the custom prompt as the "selectedText"
      if (action === 'custom' && customPrompt) {
        handleAIAction('custom', customPrompt);
        return;
      }

      // Handle predefined AI commands with actual selected text
      handleAIAction(action, selectedText);
    },
    [editor, handleAIAction]
  );

  return (
    <div className={cn('flex flex-col rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950', className)}>
      <Plate
        editor={editor}
        onChange={({ value }) => onChange?.(value)}
      >
        <EditorToolbar
          onAIAction={handleAIAction}
          onOpenChat={() => setIsChatOpen(true)}
          isLoading={isLoading}
        />
        <PlateContent
          className="min-h-[500px] p-6 focus:outline-none"
          placeholder="Start typing your will..."
          renderElement={({ attributes, children, element }) => {
            switch (element.type) {
              case 'h1':
                return <H1Element attributes={attributes} element={element}>{children}</H1Element>;
              case 'h2':
                return <H2Element attributes={attributes} element={element}>{children}</H2Element>;
              case 'h3':
                return <H3Element attributes={attributes} element={element}>{children}</H3Element>;
              case 'blockquote':
                return <BlockquoteElement attributes={attributes} element={element}>{children}</BlockquoteElement>;
              case 'ul':
                return <BulletedListElement attributes={attributes} element={element}>{children}</BulletedListElement>;
              case 'ol':
                return <NumberedListElement attributes={attributes} element={element}>{children}</NumberedListElement>;
              case 'li':
                return <ListItemElement attributes={attributes} element={element}>{children}</ListItemElement>;
              default:
                return <ParagraphElement attributes={attributes} element={element}>{children}</ParagraphElement>;
            }
          }}
          renderLeaf={({ attributes, children, leaf }) => {
            let result = children;

            // Apply AI mark styling first for visual distinction
            if ((leaf as any)[AIPlugin.key]) {
              result = <AILeaf attributes={attributes} leaf={leaf}>{result}</AILeaf>;
            }

            if (leaf.bold) {
              result = <BoldLeaf attributes={attributes} leaf={leaf}>{result}</BoldLeaf>;
            }
            if (leaf.italic) {
              result = <ItalicLeaf attributes={attributes} leaf={leaf}>{result}</ItalicLeaf>;
            }
            if (leaf.underline) {
              result = <UnderlineLeaf attributes={attributes} leaf={leaf}>{result}</UnderlineLeaf>;
            }
            return <span {...attributes}>{result}</span>;
          }}
        />

        {/* AI Suggestion Menu - Must be inside Plate for hooks */}
        <AISuggestionMenu onTryAgain={handleTryAgain} />
      </Plate>

      {/* AI Chat Panel */}
      <AIChat
        onInsert={handleInsertFromChat}
        isOpen={isChatOpen}
        onOpenChange={setIsChatOpen}
      />

      {/* AI Command Palette (Ctrl+K) */}
      <AICommandCombobox
        open={isCommandPaletteOpen}
        onOpenChange={setIsCommandPaletteOpen}
        onCommand={handleCommandPaletteAction}
        hasSelection={
          editor.selection
            ? (editor.api.string(editor.selection)?.length > 0)
            : false
        }
      />
    </div>
  );
}
