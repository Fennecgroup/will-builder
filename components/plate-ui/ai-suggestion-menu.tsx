'use client';

import * as React from 'react';
import { useEditorRef, useEditorSelection } from '@udecode/plate/react';
import { AIPlugin } from '@udecode/plate-ai/react';
import { Button } from '@/components/ui/button';
import {
  Check,
  X,
  RefreshCw,
  ArrowDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AISuggestionMenuProps {
  onAccept?: () => void;
  onReject?: () => void;
  onTryAgain?: () => void;
  className?: string;
}

export function AISuggestionMenu({
  onAccept,
  onReject,
  onTryAgain,
  className,
}: AISuggestionMenuProps) {
  const editor = useEditorRef();
  const selection = useEditorSelection();
  const [isVisible, setIsVisible] = React.useState(false);

  // Check if there's AI-marked text in the current selection or near cursor
  React.useEffect(() => {
    if (!editor || !selection) {
      setIsVisible(false);
      return;
    }

    try {
      // Check if the current selection contains AI marks
      const marks = editor.marks || {};
      const hasAIMark = marks[AIPlugin.key];

      setIsVisible(!!hasAIMark);
    } catch (error) {
      console.error('Error checking AI marks:', error);
      setIsVisible(false);
    }
  }, [editor, selection]);

  const handleAccept = React.useCallback(() => {
    if (!editor) return;

    try {
      // Remove AI marks from the text
      editor.tf.removeMark(AIPlugin.key);
      setIsVisible(false);
      onAccept?.();
    } catch (error) {
      console.error('Error accepting AI suggestion:', error);
    }
  }, [editor, onAccept]);

  const handleReject = React.useCallback(() => {
    if (!editor || !selection) return;

    try {
      // Delete the AI-marked text
      editor.tf.delete();
      setIsVisible(false);
      onReject?.();
    } catch (error) {
      console.error('Error rejecting AI suggestion:', error);
    }
  }, [editor, selection, onReject]);

  const handleTryAgain = React.useCallback(() => {
    if (!editor || !selection) return;

    try {
      // Delete current AI text and trigger regeneration
      editor.tf.delete();
      setIsVisible(false);
      onTryAgain?.();
    } catch (error) {
      console.error('Error retrying AI suggestion:', error);
    }
  }, [editor, selection, onTryAgain]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;

      // Tab or Ctrl+Enter to accept
      if (e.key === 'Tab' || (e.key === 'Enter' && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        handleAccept();
      }
      // Escape to reject
      else if (e.key === 'Escape') {
        e.preventDefault();
        handleReject();
      }
      // Ctrl+R to try again
      else if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleTryAgain();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, handleAccept, handleReject, handleTryAgain]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50',
        'flex items-center gap-2 rounded-lg border border-purple-200 bg-white p-2 shadow-lg',
        'dark:border-purple-800 dark:bg-neutral-900',
        'animate-in fade-in slide-in-from-bottom-2 duration-200',
        className
      )}
    >
      <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
        AI Suggestion
      </span>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAccept}
          className="h-7 gap-1 px-2 text-xs hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900/20 dark:hover:text-green-400"
          title="Accept (Tab or Ctrl+Enter)"
        >
          <Check className="h-3 w-3" />
          Accept
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleReject}
          className="h-7 gap-1 px-2 text-xs hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-400"
          title="Reject (Escape)"
        >
          <X className="h-3 w-3" />
          Reject
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleTryAgain}
          className="h-7 gap-1 px-2 text-xs hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
          title="Try Again (Ctrl+R)"
        >
          <RefreshCw className="h-3 w-3" />
          Try Again
        </Button>
      </div>

      <div className="ml-2 border-l border-neutral-200 pl-2 dark:border-neutral-700">
        <span className="text-xs text-neutral-500">
          Tab to accept • Esc to reject
        </span>
      </div>
    </div>
  );
}
