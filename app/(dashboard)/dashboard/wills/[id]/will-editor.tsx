'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, FileDown, Clock, Trash2, CheckCircle2, Pencil } from 'lucide-react'
import type { Value } from '@udecode/plate'
import { Will } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PlateEditor } from '@/components/will-editor/plate-editor'
import { TestatorSidebar } from '@/components/will-editor/testator-sidebar'
import { initialEditorContent, sampleWillContent } from '@/lib/data/sample-will'
import { updateWill, deleteWill } from '@/lib/actions/wills'
import { DeleteDialog } from '@/components/wills/delete-dialog'
import { WillContent } from '@/lib/types/will'
import { toast } from 'sonner'

interface WillEditorProps {
  will: Will
}

export function WillEditor({ will }: WillEditorProps) {
  const router = useRouter()
  const [editorValue, setEditorValue] = useState<Value>(
    (will.editorContent as unknown as Value) || (initialEditorContent as Value)
  )
  const [willContent, setWillContent] = useState<WillContent>(() => {
    const content = will.content as unknown as WillContent
    // Use sample if content is falsy or an empty object
    if (!content || Object.keys(content).length === 0) {
      return sampleWillContent
    }
    return content
  })
  const [lastSaved, setLastSaved] = useState<Date>(new Date(will.updatedAt))
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [status, setStatus] = useState(will.status)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [title, setTitle] = useState(will.title)
  const [isSavingTitle, setIsSavingTitle] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)

  // Auto-save function
  const saveWill = useCallback(async () => {
    if (!hasUnsavedChanges) return

    setIsSaving(true)
    try {
      await updateWill(will.id, {
        editorContent: editorValue,
        content: willContent,
        status,
      })
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
      toast.success('Will saved successfully')
    } catch (error) {
      toast.error('Failed to save will')
      console.error('Error saving will:', error)
    } finally {
      setIsSaving(false)
    }
  }, [will.id, editorValue, willContent, status, hasUnsavedChanges])

  // Auto-save every 30 seconds if there are unsaved changes
  useEffect(() => {
    if (!hasUnsavedChanges) return

    const autoSaveInterval = setInterval(() => {
      saveWill()
    }, 30000) // 30 seconds

    return () => clearInterval(autoSaveInterval)
  }, [saveWill, hasUnsavedChanges])

  // Handle editor changes
  const handleEditorChange = (value: Value) => {
    setEditorValue(value)
    setHasUnsavedChanges(true)
  }

  // Handle status change
  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus)
    setHasUnsavedChanges(true)

    try {
      await updateWill(will.id, { status: newStatus })
      toast.success(`Status updated to ${newStatus}`)
      router.refresh()
    } catch (error) {
      toast.error('Failed to update status')
      console.error('Error updating status:', error)
    }
  }

  // Handle title save
  const saveTitle = async (newTitle: string) => {
    const trimmedTitle = newTitle.trim()

    // Don't save if title is empty or unchanged
    if (!trimmedTitle || trimmedTitle === will.title) {
      setTitle(will.title)
      setIsEditingTitle(false)
      return
    }

    setIsSavingTitle(true)
    try {
      await updateWill(will.id, { title: trimmedTitle })
      setTitle(trimmedTitle)
      toast.success('Will title updated')
      router.refresh()
    } catch (error) {
      toast.error('Failed to update title')
      console.error('Error updating title:', error)
      setTitle(will.title)
    } finally {
      setIsSavingTitle(false)
      setIsEditingTitle(false)
    }
  }

  // Handle title edit start
  const handleTitleEdit = () => {
    setIsEditingTitle(true)
    setTimeout(() => {
      titleInputRef.current?.focus()
      titleInputRef.current?.select()
    }, 0)
  }

  // Handle title input key down
  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      saveTitle(title)
    } else if (e.key === 'Escape') {
      setTitle(will.title)
      setIsEditingTitle(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    try {
      await deleteWill(will.id)
      toast.success('Will deleted successfully')
      router.push('/dashboard/wills')
    } catch (error) {
      toast.error('Failed to delete will')
      console.error('Error deleting will:', error)
    }
  }

  // Handle export to PDF
  const handleExport = async () => {
    try {
      toast.info('Generating PDF...')
      const response = await fetch(`/api/wills/${will.id}/pdf`)

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('PDF downloaded successfully!')
    } catch (error) {
      toast.error('Failed to generate PDF')
      console.error('Error exporting PDF:', error)
    }
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'finalized':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    }
  }

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
            {/* Editable Title */}
            <div className="group relative flex items-center gap-2">
              {isEditingTitle ? (
                <input
                  ref={titleInputRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => saveTitle(title)}
                  onKeyDown={handleTitleKeyDown}
                  disabled={isSavingTitle}
                  className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 bg-transparent border-b-2 border-neutral-300 dark:border-neutral-700 focus:border-neutral-900 dark:focus:border-neutral-100 outline-none px-1 py-0.5 w-full max-w-md"
                  placeholder="Enter will title"
                />
              ) : (
                <>
                  <h1
                    onClick={handleTitleEdit}
                    className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 cursor-pointer hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors px-1 py-0.5 rounded border-2 border-transparent hover:border-neutral-200 dark:hover:border-neutral-800"
                    title="Click to edit title"
                  >
                    {title}
                  </h1>
                  <Pencil className="h-3.5 w-3.5 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger className="h-6 w-auto border-0 p-0 focus:ring-0">
                  <Badge className={getStatusColor(status)} variant="secondary">
                    <SelectValue />
                  </Badge>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="finalized">Finalized</SelectItem>
                </SelectContent>
              </Select>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {isSaving ? (
                  'Saving...'
                ) : hasUnsavedChanges ? (
                  'Unsaved changes'
                ) : (
                  <>Saved {lastSaved.toLocaleTimeString()}</>
                )}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <FileDown className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button size="sm" onClick={saveWill} disabled={isSaving || !hasUnsavedChanges}>
            {isSaving ? (
              <>
                <Save className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {hasUnsavedChanges ? 'Save Now' : 'Saved'}
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor Section */}
        <div className="flex-1 overflow-auto p-6">
          <PlateEditor
            initialValue={editorValue}
            onChange={handleEditorChange}
            className="h-full"
          />
        </div>

        {/* Sidebar */}
        <aside className="w-96 border-l border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
          <TestatorSidebar willContent={willContent} />
        </aside>
      </div>

      {/* Delete Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        willTitle={title}
      />
    </div>
  )
}
