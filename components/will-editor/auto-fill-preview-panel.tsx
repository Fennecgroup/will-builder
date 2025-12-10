'use client';

import { useState } from 'react';
import { Check, X, ArrowRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { AutoFillSuggestion, WillArticle, ARTICLE_TITLES } from '@/lib/auto-fill';

interface AutoFillPreviewPanelProps {
  suggestions: AutoFillSuggestion[];
  onApply: (article: WillArticle, mode: 'replace' | 'merge') => void;
  onDismiss: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Extract plain text from Plate nodes for display
 */
function extractPlainText(nodes: any[]): string {
  const lines: string[] = [];

  for (const node of nodes) {
    if (node.text !== undefined) {
      lines.push(node.text);
    } else if (node.children) {
      lines.push(extractPlainText(node.children));
    }
  }

  return lines.join('\n');
}

/**
 * Auto-Fill Preview Panel
 * Shows suggestions with diff comparison and apply/dismiss actions
 */
export function AutoFillPreviewPanel({
  suggestions,
  onApply,
  onDismiss,
  open,
  onOpenChange,
}: AutoFillPreviewPanelProps) {
  const [selectedArticle, setSelectedArticle] = useState<WillArticle | null>(
    suggestions[0]?.section.article || null
  );

  if (suggestions.length === 0) {
    return null;
  }

  const handleApply = (article: WillArticle) => {
    onApply(article, 'replace');
  };

  const handleDismiss = () => {
    onDismiss();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Auto-Fill Suggestions</SheetTitle>
          <SheetDescription>
            Review and apply auto-generated will sections from your data
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Tabs
            value={selectedArticle || undefined}
            onValueChange={(value) => setSelectedArticle(value as WillArticle)}
          >
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${suggestions.length}, 1fr)` }}>
              {suggestions.map((suggestion) => (
                <TabsTrigger
                  key={suggestion.section.article}
                  value={suggestion.section.article}
                  className="text-xs"
                >
                  {suggestion.section.article === 'SPECIFIC_BEQUESTS'
                    ? 'Article VII'
                    : 'Article VIII'}
                </TabsTrigger>
              ))}
            </TabsList>

            {suggestions.map((suggestion) => (
              <TabsContent
                key={suggestion.section.article}
                value={suggestion.section.article}
                className="mt-4"
              >
                <SuggestionContent
                  suggestion={suggestion}
                  onApply={handleApply}
                  onKeepExisting={handleDismiss}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={handleDismiss}>
            <X className="mr-2 h-4 w-4" />
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/**
 * Suggestion Content Component
 * Shows diff comparison or generated content for a single suggestion
 */
function SuggestionContent({
  suggestion,
  onApply,
  onKeepExisting,
}: {
  suggestion: AutoFillSuggestion;
  onApply: (article: WillArticle) => void;
  onKeepExisting: () => void;
}) {
  const hasExisting = suggestion.existingContent !== null;
  const generatedText = extractPlainText(suggestion.generatedContent);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {ARTICLE_TITLES[suggestion.section.article]}
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {hasExisting
              ? 'This section already exists in your will'
              : 'This section is not yet in your will'}
          </p>
        </div>
        {suggestion.canAutoApply && (
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Safe to apply
          </Badge>
        )}
        {!suggestion.canAutoApply && (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            Manual edits detected
          </Badge>
        )}
      </div>

      <Separator />

      {/* Content Display */}
      {hasExisting && suggestion.diff ? (
        <DiffView suggestion={suggestion} />
      ) : (
        <NewContentView generatedText={generatedText} />
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {hasExisting ? (
          <>
            <Button
              onClick={() => onApply(suggestion.section.article)}
              className="flex-1"
            >
              <Check className="mr-2 h-4 w-4" />
              Replace with Generated
            </Button>
            <Button variant="outline" onClick={onKeepExisting} className="flex-1">
              Keep Existing
            </Button>
          </>
        ) : (
          <Button
            onClick={() => onApply(suggestion.section.article)}
            className="w-full"
          >
            <Check className="mr-2 h-4 w-4" />
            Insert Section
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Diff View Component
 * Shows side-by-side comparison of existing vs generated content
 */
function DiffView({ suggestion }: { suggestion: AutoFillSuggestion }) {
  if (!suggestion.existingContent || !suggestion.diff) {
    return null;
  }

  const existingText = extractPlainText(suggestion.existingContent);
  const generatedText = extractPlainText(suggestion.generatedContent);

  return (
    <div className="space-y-4">
      {/* Diff Summary */}
      {suggestion.diff.hasChanges && (
        <div className="rounded-md bg-neutral-100 p-3 dark:bg-neutral-900">
          <p className="text-sm font-medium">Changes:</p>
          <div className="mt-1 flex gap-4 text-xs text-neutral-600 dark:text-neutral-400">
            {suggestion.diff.additions > 0 && (
              <span className="text-green-600 dark:text-green-400">
                +{suggestion.diff.additions} additions
              </span>
            )}
            {suggestion.diff.deletions > 0 && (
              <span className="text-red-600 dark:text-red-400">
                -{suggestion.diff.deletions} deletions
              </span>
            )}
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4 text-neutral-500" />
            <h4 className="text-sm font-medium">Existing Content</h4>
          </div>
          <ScrollArea className="h-[400px] rounded-md border bg-neutral-50 p-4 dark:bg-neutral-950">
            <pre className="text-xs whitespace-pre-wrap font-mono">
              {existingText}
            </pre>
          </ScrollArea>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-purple-600" />
            <h4 className="text-sm font-medium">Generated Content</h4>
          </div>
          <ScrollArea className="h-[400px] rounded-md border bg-purple-50 p-4 dark:bg-purple-950/20">
            <pre className="text-xs whitespace-pre-wrap font-mono">
              {generatedText}
            </pre>
          </ScrollArea>
        </div>
      </div>

      {/* Unified Diff (Optional) */}
      {suggestion.diff.unifiedDiff && (
        <details className="rounded-md border p-4">
          <summary className="cursor-pointer text-sm font-medium">
            View Unified Diff
          </summary>
          <ScrollArea className="mt-2 h-[200px]">
            <pre className="text-xs whitespace-pre-wrap font-mono">
              {suggestion.diff.unifiedDiff}
            </pre>
          </ScrollArea>
        </details>
      )}
    </div>
  );
}

/**
 * New Content View Component
 * Shows generated content when no existing content exists
 */
function NewContentView({ generatedText }: { generatedText: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <FileText className="h-4 w-4 text-purple-600" />
        <h4 className="text-sm font-medium">Generated Content</h4>
        <Badge variant="secondary" className="text-xs">New</Badge>
      </div>
      <ScrollArea className="h-[400px] rounded-md border bg-purple-50 p-4 dark:bg-purple-950/20">
        <pre className="text-xs whitespace-pre-wrap font-mono">
          {generatedText}
        </pre>
      </ScrollArea>
    </div>
  );
}
