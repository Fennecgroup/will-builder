import type { Value } from '@udecode/plate'
import { FileDown, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { WillHTMLPreview } from '@/components/pdf/will-html-preview'

interface PDFPreviewPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  editorContent: Value
  createdAt: Date
  onExport?: () => void
}

export function PDFPreviewPanel({
  open,
  onOpenChange,
  title,
  editorContent,
  createdAt,
  onExport,
}: PDFPreviewPanelProps) {
  // Check if content is empty
  const hasContent = editorContent && editorContent.length > 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-4xl p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>PDF Preview</SheetTitle>
          <SheetDescription>
            Preview how your will document will look when exported as PDF
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 h-[calc(100vh-180px)]">
          {hasContent ? (
            <WillHTMLPreview
              title={title}
              editorContent={editorContent}
              createdAt={createdAt}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-neutral-500">
              <p>No content to preview</p>
            </div>
          )}
        </ScrollArea>

        <div className="border-t bg-white p-4 flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="mr-2 h-4 w-4" />
            Close
          </Button>
          {onExport && hasContent && (
            <Button onClick={onExport}>
              <FileDown className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
