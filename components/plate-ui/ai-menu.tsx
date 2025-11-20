'use client';

import * as React from 'react';
import {
  useEditorRef,
  useEditorSelection,
} from '@udecode/plate/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Wand2,
  FileText,
  CheckCircle,
  ArrowRight,
  Minimize2,
  Maximize2,
  Languages,
  MessageSquare,
} from 'lucide-react';

interface AIMenuProps {
  onAIAction: (action: string, text: string) => void;
  isLoading?: boolean;
}

export function AIMenu({ onAIAction, isLoading = false }: AIMenuProps) {
  const editor = useEditorRef();
  const selection = useEditorSelection();

  const getSelectedText = React.useCallback(() => {
    if (!selection) return '';
    return editor.api.string(selection);
  }, [editor, selection]);

  const handleAction = (action: string) => {
    const text = getSelectedText();
    onAIAction(action, text);
  };

  const hasSelection = selection && getSelectedText().length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          disabled={isLoading}
        >
          <Sparkles className="h-4 w-4" />
          AI
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuItem
          onClick={() => handleAction('generate')}
          disabled={isLoading}
        >
          <Wand2 className="mr-2 h-4 w-4" />
          Generate content
        </DropdownMenuItem>

        {hasSelection && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <FileText className="mr-2 h-4 w-4" />
                Edit selection
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onClick={() => handleAction('improve')}
                  disabled={isLoading}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Improve writing
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleAction('fix')}
                  disabled={isLoading}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Fix grammar & spelling
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleAction('simplify')}
                  disabled={isLoading}
                >
                  <Minimize2 className="mr-2 h-4 w-4" />
                  Simplify language
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleAction('formal')}
                  disabled={isLoading}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Make more formal
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <ArrowRight className="mr-2 h-4 w-4" />
                Transform
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onClick={() => handleAction('expand')}
                  disabled={isLoading}
                >
                  <Maximize2 className="mr-2 h-4 w-4" />
                  Expand
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleAction('summarize')}
                  disabled={isLoading}
                >
                  <Minimize2 className="mr-2 h-4 w-4" />
                  Summarize
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleAction('continue')}
                  disabled={isLoading}
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Continue writing
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleAction('explain')}
          disabled={isLoading || !hasSelection}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Explain selection
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
