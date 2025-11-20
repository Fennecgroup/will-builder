'use client';

import { useMemo, useState, useCallback } from 'react';
import {
  Plate,
  PlateContent,
  PlateElement,
  PlateLeaf,
  ParagraphPlugin,
  createPlateEditor,
  useEditorRef,
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
  return (
    <div className="flex items-center gap-1 border-b border-neutral-200 bg-neutral-50 px-3 py-2 dark:border-neutral-800 dark:bg-neutral-900">
      <ToolbarButton onClick={() => {}} title="Heading 1">
        <Heading1 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => {}} title="Heading 2">
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => {}} title="Heading 3">
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => {}} title="Paragraph">
        <Pilcrow className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToolbarButton onClick={() => {}} title="Bold (Ctrl+B)">
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => {}} title="Italic (Ctrl+I)">
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => {}} title="Underline (Ctrl+U)">
        <Underline className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToolbarButton onClick={() => {}} title="Bulleted List">
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => {}} title="Numbered List">
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => {}} title="Quote">
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
          Ctrl+J for AI
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

  const editor = useMemo(
    () =>
      createPlateEditor({
        plugins: [
          ParagraphPlugin,
          HeadingPlugin,
          BoldPlugin,
          ItalicPlugin,
          UnderlinePlugin,
          BlockquotePlugin,
          ListPlugin,
          BulletedListPlugin,
          NumberedListPlugin,
          ListItemPlugin,
        ],
        value: initialValue || defaultValue,
      }),
    []
  );

  const handleAIAction = useCallback(async (action: string, selectedText: string) => {
    setIsLoading(true);

    const prompts: Record<string, string> = {
      generate: `Generate appropriate content for a legal will document. Be formal and clear.`,
      improve: `Improve the following text to be more clear and professional while maintaining its legal accuracy:\n\n${selectedText}`,
      fix: `Fix any grammar, spelling, or punctuation errors in the following text:\n\n${selectedText}`,
      simplify: `Simplify the following text while maintaining its legal meaning:\n\n${selectedText}`,
      formal: `Make the following text more formal and appropriate for a legal document:\n\n${selectedText}`,
      expand: `Expand on the following text with more detail while maintaining a legal tone:\n\n${selectedText}`,
      summarize: `Summarize the following text concisely:\n\n${selectedText}`,
      continue: `Continue writing from the following text, maintaining the same style and tone:\n\n${selectedText}`,
      explain: `Explain the following text in simpler terms:\n\n${selectedText}`,
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

      // Insert or replace text based on action
      if (result && editor.selection) {
        if (selectedText && action !== 'generate' && action !== 'explain') {
          // Replace selection
          editor.tf.delete();
        }
        editor.tf.insertText(result);
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
      </Plate>

      {/* AI Chat Panel */}
      <AIChat
        onInsert={handleInsertFromChat}
        isOpen={isChatOpen}
        onOpenChange={setIsChatOpen}
      />
    </div>
  );
}
