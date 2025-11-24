'use client';

import * as React from 'react';
import { useEditorRef, useEditorState, useEditorSelection } from '@udecode/plate/react';
import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
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
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface FloatingSelectionToolbarProps {
  onAIAction: (action: string, text: string) => void;
}

export function FloatingSelectionToolbar({ onAIAction }: FloatingSelectionToolbarProps) {
  const editor = useEditorRef();
  const editorState = useEditorState();
  const selection = useEditorSelection();
  const toolbarRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState<{ top: number; left: number } | null>(null);
  const [isMouseDown, setIsMouseDown] = React.useState(false);

  // Track mouse down/up to prevent toolbar from showing during selection
  React.useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Don't hide toolbar if clicking on the toolbar itself
      if (toolbarRef.current && toolbarRef.current.contains(target)) {
        return;
      }

      // Don't hide toolbar if clicking on a dropdown menu item (rendered in portal)
      if (target.closest('[role="menu"]') || target.closest('[role="menuitem"]')) {
        return;
      }

      setIsMouseDown(true);
      setPosition(null); // Hide toolbar while selecting
    };

    const handleMouseUp = () => {
      setIsMouseDown(false);
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Check if there's a text selection
  const hasSelection = React.useMemo(() => {
    if (!selection || !editor) return false;
    try {
      const text = editor.api.string(selection);
      return text && text.length > 0;
    } catch {
      return false;
    }
  }, [editor, selection, editorState]);

  // Get selected text
  const selectedText = React.useMemo(() => {
    if (!hasSelection || !selection) return '';
    try {
      return editor.api.string(selection);
    } catch {
      return '';
    }
  }, [editor, selection, hasSelection]);

  // Calculate toolbar position based on selection (only when mouse is released)
  React.useEffect(() => {
    // Don't show toolbar while mouse is down (during selection)
    if (isMouseDown) {
      setPosition(null);
      return;
    }

    if (!hasSelection || !selection) {
      setPosition(null);
      return;
    }

    // Small delay to ensure selection is finalized after mouseup
    const timer = setTimeout(() => {
      try {
        const domSelection = window.getSelection();
        if (!domSelection || domSelection.rangeCount === 0) {
          setPosition(null);
          return;
        }

        const range = domSelection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Position toolbar above the selection
        setPosition({
          top: rect.top + window.scrollY - 50, // 50px above
          left: rect.left + window.scrollX + (rect.width / 2),
        });
      } catch (error) {
        setPosition(null);
      }
    }, 50); // Small delay for smooth appearance

    return () => clearTimeout(timer);
  }, [hasSelection, selection, editorState, isMouseDown]);

  // Check active marks
  const marks = editor.marks || {};
  const isBoldActive = !!marks[BoldPlugin.key];
  const isItalicActive = !!marks[ItalicPlugin.key];
  const isUnderlineActive = !!marks[UnderlinePlugin.key];

  // Check current block type
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
      currentType = 'p';
    }
  }

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

  const handleAICommand = (action: string) => {
    onAIAction(action, selectedText);
  };

  if (!position || !hasSelection) return null;

  // Prevent toolbar interactions from clearing the selection
  const handleToolbarMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div
      ref={toolbarRef}
      onMouseDown={handleToolbarMouseDown}
      className={cn(
        'fixed z-50 flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2 py-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-900',
        'animate-in fade-in slide-in-from-top-2 duration-200'
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
      }}
    >
      {/* Text Formatting */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleBold}
        className={cn(
          'h-8 w-8 p-0',
          isBoldActive && 'bg-neutral-200 dark:bg-neutral-800'
        )}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleItalic}
        className={cn(
          'h-8 w-8 p-0',
          isItalicActive && 'bg-neutral-200 dark:bg-neutral-800'
        )}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleUnderline}
        className={cn(
          'h-8 w-8 p-0',
          isUnderlineActive && 'bg-neutral-200 dark:bg-neutral-800'
        )}
        title="Underline"
      >
        <Underline className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Block Types */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setBlockType('h1')}
        className={cn(
          'h-8 w-8 p-0',
          currentType === 'h1' && 'bg-neutral-200 dark:bg-neutral-800'
        )}
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setBlockType('h2')}
        className={cn(
          'h-8 w-8 p-0',
          currentType === 'h2' && 'bg-neutral-200 dark:bg-neutral-800'
        )}
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setBlockType('h3')}
        className={cn(
          'h-8 w-8 p-0',
          currentType === 'h3' && 'bg-neutral-200 dark:bg-neutral-800'
        )}
        title="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Lists */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setBlockType('ul')}
        className={cn(
          'h-8 w-8 p-0',
          currentType === 'ul' && 'bg-neutral-200 dark:bg-neutral-800'
        )}
        title="Bulleted List"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setBlockType('ol')}
        className={cn(
          'h-8 w-8 p-0',
          currentType === 'ol' && 'bg-neutral-200 dark:bg-neutral-800'
        )}
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setBlockType('blockquote')}
        className={cn(
          'h-8 w-8 p-0',
          currentType === 'blockquote' && 'bg-neutral-200 dark:bg-neutral-800'
        )}
        title="Quote"
      >
        <Quote className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* AI Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 px-2"
            title="Ask AI"
          >
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span className="text-xs">Ask AI</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem onClick={() => handleAICommand('improve')}>
            <Sparkles className="mr-2 h-4 w-4" />
            Improve writing
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAICommand('fix')}>
            Fix grammar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAICommand('simplify')}>
            Simplify language
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAICommand('formal')}>
            Make more formal
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAICommand('expand')}>
            Make longer
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAICommand('shorten')}>
            Make shorter
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAICommand('summarize')}>
            Summarize
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAICommand('continue')}>
            Continue writing
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAICommand('explain')}>
            Explain
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAICommand('emojify')}>
            Add emojis
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
