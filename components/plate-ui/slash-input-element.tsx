'use client';

import * as React from 'react';
import { useEditorRef, useEditorSelection } from '@udecode/plate/react';
import { PlateElement, PlateElementProps } from '@udecode/plate/react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { slashCommandItems } from '@/lib/slash-command-items';
import { cn } from '@/lib/utils';

export function SlashInputElement({
  className,
  children,
  ...props
}: PlateElementProps) {
  const editor = useEditorRef();
  const selection = useEditorSelection();
  const [search, setSearch] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  // Get selected text if any
  const selectedText = React.useMemo(() => {
    if (!selection || !editor?.api) return '';
    try {
      return editor.api.string(selection);
    } catch {
      return '';
    }
  }, [editor, selection]);

  // Filter commands based on search and selection
  const filteredCommands = React.useMemo(() => {
    const hasSelection = selectedText.length > 0;
    return slashCommandItems.filter(item => {
      // Filter out commands that require selection if no selection exists
      if (item.requiresSelection && !hasSelection) return false;

      // Filter by search term
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          item.label.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower) ||
          item.action.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [search, selectedText]);

  // Group commands by category
  const aiCommands = filteredCommands.filter(cmd => cmd.category === 'ai');
  const formattingCommands = filteredCommands.filter(cmd => cmd.category === 'formatting');

  const handleSelect = React.useCallback(async (action: string) => {
    // Remove the slash command trigger first
    if (editor.selection) {
      editor.tf.delete();
    }

    // Handle formatting commands
    if (['h1', 'h2', 'h3', 'p', 'blockquote'].includes(action)) {
      editor.tf.setNodes({ type: action });
      return;
    }

    if (action === 'ul' || action === 'ol') {
      editor.tf.setNodes({ type: action });
      return;
    }

    // Handle AI commands - trigger AI action
    // This will be handled by custom event or state management
    // For now, we'll use a custom event to communicate with the parent editor
    const event = new CustomEvent('slash-ai-command', {
      detail: { action, selectedText },
    });
    window.dispatchEvent(event);
  }, [editor, selectedText]);

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredCommands[selectedIndex];
      if (selected) {
        handleSelect(selected.action);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      // Close the menu by removing the slash input
      if (editor.selection) {
        editor.tf.delete();
      }
    }
  }, [filteredCommands, selectedIndex, handleSelect, editor]);

  return (
    <PlateElement
      className={cn('inline-block', className)}
      {...props}
    >
      <div className="relative inline-block min-w-[300px]">
        <Command
          className="border rounded-lg shadow-lg bg-popover"
          onKeyDown={handleKeyDown}
        >
          <CommandInput
            placeholder="Search commands..."
            value={search}
            onValueChange={setSearch}
            className="h-9"
          />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>No commands found.</CommandEmpty>

            {aiCommands.length > 0 && (
              <CommandGroup heading="AI Commands">
                {aiCommands.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <CommandItem
                      key={item.action}
                      value={item.action}
                      onSelect={() => handleSelect(item.action)}
                      className={cn(
                        'cursor-pointer',
                        filteredCommands.indexOf(item) === selectedIndex && 'bg-accent'
                      )}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      <div className="flex flex-col">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-xs text-muted-foreground">{item.description}</span>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}

            {formattingCommands.length > 0 && (
              <CommandGroup heading="Formatting">
                {formattingCommands.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <CommandItem
                      key={item.action}
                      value={item.action}
                      onSelect={() => handleSelect(item.action)}
                      className={cn(
                        'cursor-pointer',
                        filteredCommands.indexOf(item) === selectedIndex && 'bg-accent'
                      )}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      <div className="flex flex-col">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-xs text-muted-foreground">{item.description}</span>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </div>
      {children}
    </PlateElement>
  );
}
