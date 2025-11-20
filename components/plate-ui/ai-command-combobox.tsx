'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { slashCommandItems } from '@/lib/slash-command-items';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AICommandComboboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommand: (action: string, customPrompt?: string) => void;
  hasSelection?: boolean;
}

export function AICommandCombobox({
  open,
  onOpenChange,
  onCommand,
  hasSelection = false,
}: AICommandComboboxProps) {
  const [search, setSearch] = React.useState('');
  const [customPrompt, setCustomPrompt] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Filter commands based on search
  const filteredCommands = React.useMemo(() => {
    if (!search) return slashCommandItems;

    const searchLower = search.toLowerCase();
    return slashCommandItems.filter(
      (item) =>
        item.label.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.action.toLowerCase().includes(searchLower)
    );
  }, [search]);

  // Group by category
  const aiCommands = filteredCommands.filter((cmd) => cmd.category === 'ai');
  const formattingCommands = filteredCommands.filter(
    (cmd) => cmd.category === 'formatting'
  );

  const handleSelect = React.useCallback(
    (action: string) => {
      onCommand(action);
      onOpenChange(false);
      setSearch('');
      setCustomPrompt('');
    },
    [onCommand, onOpenChange]
  );

  const handleCustomPrompt = React.useCallback(() => {
    if (!customPrompt.trim()) return;

    // Execute custom prompt
    onCommand('custom', customPrompt);
    onOpenChange(false);
    setSearch('');
    setCustomPrompt('');
  }, [customPrompt, onCommand, onOpenChange]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && search) {
        e.preventDefault();

        // If there's a matching command, select it
        if (filteredCommands.length > 0) {
          handleSelect(filteredCommands[0].action);
        } else if (search.trim()) {
          // Otherwise treat as custom prompt
          onCommand('custom', search);
          onOpenChange(false);
          setSearch('');
        }
      }
    },
    [search, filteredCommands, handleSelect, onCommand, onOpenChange]
  );

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!open) {
      setSearch('');
      setCustomPrompt('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>AI Command Palette</DialogTitle>
          <DialogDescription>
            Search for AI commands or type a custom prompt
          </DialogDescription>
        </DialogHeader>

        <Command className="rounded-lg border-0 shadow-none">
          <div className="flex items-center border-b px-3">
            <Sparkles className="mr-2 h-4 w-4 shrink-0 text-purple-500" />
            <CommandInput
              ref={inputRef}
              placeholder="Type a command or custom AI prompt..."
              value={search}
              onValueChange={setSearch}
              onKeyDown={handleKeyDown}
              className="border-0 focus:ring-0"
            />
          </div>

          <CommandList className="max-h-[400px]">
            {/* Custom Prompt Option */}
            {search && filteredCommands.length === 0 && (
              <CommandGroup heading="Custom Prompt">
                <CommandItem
                  onSelect={() => {
                    onCommand('custom', search);
                    onOpenChange(false);
                    setSearch('');
                  }}
                  className="cursor-pointer"
                >
                  <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
                  <div className="flex flex-col">
                    <span className="font-medium">
                      Execute: "{search}"
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Run custom AI prompt
                      {hasSelection && ' on selected text'}
                    </span>
                  </div>
                </CommandItem>
              </CommandGroup>
            )}

            {search && filteredCommands.length > 0 && (
              <div className="px-2 py-2 text-xs text-muted-foreground">
                Press Enter to execute "{search}" as custom prompt
              </div>
            )}

            {filteredCommands.length === 0 && !search && (
              <CommandEmpty>
                Type to search commands or enter a custom AI prompt...
              </CommandEmpty>
            )}

            {/* AI Commands */}
            {aiCommands.length > 0 && (
              <CommandGroup heading="AI Commands">
                {aiCommands.map((item) => {
                  const Icon = item.icon;
                  const requiresSelection = item.requiresSelection && !hasSelection;

                  return (
                    <CommandItem
                      key={item.action}
                      value={item.label}
                      onSelect={() => handleSelect(item.action)}
                      disabled={requiresSelection}
                      className={cn(
                        'cursor-pointer',
                        requiresSelection && 'opacity-50'
                      )}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      <div className="flex flex-col">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {item.description}
                          {requiresSelection && ' (requires selection)'}
                        </span>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}

            {/* Formatting Commands */}
            {formattingCommands.length > 0 && (
              <CommandGroup heading="Formatting">
                {formattingCommands.map((item) => {
                  const Icon = item.icon;

                  return (
                    <CommandItem
                      key={item.action}
                      value={item.label}
                      onSelect={() => handleSelect(item.action)}
                      className="cursor-pointer"
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      <div className="flex flex-col">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>

          {/* Footer hint */}
          <div className="border-t px-3 py-2 text-xs text-muted-foreground">
            <span className="font-medium">Tip:</span> Type any custom instruction
            and press Enter to execute
            {hasSelection && ' on selected text'}
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
