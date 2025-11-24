'use client';

import * as React from 'react';
import { useEditorRef, useEditorState } from '@udecode/plate/react';
import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Sparkles,
} from 'lucide-react';
import {
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
} from '@/components/ui/toolbar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FloatingToolbarButtonsProps {
  onAIAction: (action: string, text: string) => void;
}

export function FloatingToolbarButtons({ onAIAction }: FloatingToolbarButtonsProps) {
  const editor = useEditorRef();
  const editorState = useEditorState();

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

  // Get selected text
  const selectedText = React.useMemo(() => {
    if (!editor.selection) return '';
    try {
      return editor.api.string(editor.selection);
    } catch {
      return '';
    }
  }, [editor, editorState]);

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

  return (
    <>
      {/* Text Formatting */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={toggleBold}
          pressed={isBoldActive}
          tooltip="Bold"
        >
          <Bold />
        </ToolbarButton>
        <ToolbarButton
          onClick={toggleItalic}
          pressed={isItalicActive}
          tooltip="Italic"
        >
          <Italic />
        </ToolbarButton>
        <ToolbarButton
          onClick={toggleUnderline}
          pressed={isUnderlineActive}
          tooltip="Underline"
        >
          <Underline />
        </ToolbarButton>
      </ToolbarGroup>

      {/* Block Types */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={() => setBlockType('h1')}
          pressed={currentType === 'h1'}
          tooltip="Heading 1"
        >
          <Heading1 />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => setBlockType('h2')}
          pressed={currentType === 'h2'}
          tooltip="Heading 2"
        >
          <Heading2 />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => setBlockType('h3')}
          pressed={currentType === 'h3'}
          tooltip="Heading 3"
        >
          <Heading3 />
        </ToolbarButton>
      </ToolbarGroup>

      {/* Lists */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={() => setBlockType('ul')}
          pressed={currentType === 'ul'}
          tooltip="Bulleted List"
        >
          <List />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => setBlockType('ol')}
          pressed={currentType === 'ol'}
          tooltip="Numbered List"
        >
          <ListOrdered />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => setBlockType('blockquote')}
          pressed={currentType === 'blockquote'}
          tooltip="Quote"
        >
          <Quote />
        </ToolbarButton>
      </ToolbarGroup>

      {/* AI Menu */}
      <ToolbarGroup>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <ToolbarButton tooltip="Ask AI" isDropdown>
              <Sparkles className="text-purple-500" />
              <span className="ml-1">Ask AI</span>
            </ToolbarButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem
              onClick={() => handleAICommand('improve')}
              disabled={!selectedText}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Improve writing
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAICommand('fix')}
              disabled={!selectedText}
            >
              Fix grammar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAICommand('simplify')}
              disabled={!selectedText}
            >
              Simplify language
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAICommand('formal')}
              disabled={!selectedText}
            >
              Make more formal
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAICommand('expand')}
              disabled={!selectedText}
            >
              Make longer
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAICommand('shorten')}
              disabled={!selectedText}
            >
              Make shorter
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAICommand('summarize')}
              disabled={!selectedText}
            >
              Summarize
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAICommand('continue')}
              disabled={!selectedText}
            >
              Continue writing
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAICommand('explain')}
              disabled={!selectedText}
            >
              Explain
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAICommand('emojify')}
              disabled={!selectedText}
            >
              Add emojis
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAICommand('generate')}>
              Generate content
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ToolbarGroup>
    </>
  );
}
