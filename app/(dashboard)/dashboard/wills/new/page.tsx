'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, FileDown, Clock } from 'lucide-react';
import type { Value } from '@udecode/plate';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlateEditor } from '@/components/will-editor/plate-editor';
import { TestatorSidebar } from '@/components/will-editor/testator-sidebar';
import { sampleWillContent, initialEditorContent } from '@/lib/data/sample-will';

export default function NewWillPage() {
  const [editorValue, setEditorValue] = useState<Value>(initialEditorContent as Value);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save operation
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLastSaved(new Date());
    setIsSaving(false);
  };

  const handleExport = () => {
    // TODO: Implement PDF export
    console.log('Export to PDF', editorValue);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/wills">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Wills
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Create New Will
            </h1>
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Badge variant="secondary">Draft</Badge>
              {lastSaved && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Last saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <FileDown className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Draft'}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor Section */}
        <div className="flex-1 overflow-auto p-6">
          <PlateEditor
            initialValue={editorValue}
            onChange={(value) => setEditorValue(value)}
            className="h-full"
          />
        </div>

        {/* Sidebar */}
        <aside className="w-96 border-l border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
          <TestatorSidebar willContent={sampleWillContent} />
        </aside>
      </div>
    </div>
  );
}
