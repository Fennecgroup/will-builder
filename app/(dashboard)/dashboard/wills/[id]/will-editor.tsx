'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, FileDown, Clock, Trash2, CheckCircle2, Pencil, AlertCircle, ListPlus, Eye } from 'lucide-react'
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
import { AIChat } from '@/components/plate-ui/ai-chat'
import { AutoFillNotification } from '@/components/will-editor/auto-fill-notification'
import { AutoFillPreviewPanel } from '@/components/will-editor/auto-fill-preview-panel'
import { PDFPreviewPanel } from '@/components/will-editor/pdf-preview-panel'
import { QuestionnaireModal } from '@/components/will-editor/questionnaire-modal'
import { OptionalClausesBrowser } from '@/components/will-editor/optional-clauses/optional-clauses-browser'
import { MissingInfoDetector } from '@/lib/questionnaire/missing-info-detector'
import { OptionalClausesDetector } from '@/lib/optional-clauses/detector'
import { MissingInfoContext } from '@/lib/types/questionnaire'
import { OptionalClauseType } from '@/lib/types/optional-clauses'
import { requiresQuestionnaire } from '@/lib/optional-clauses/clause-definitions'
import { initialEditorContent, sampleWillContent } from '@/lib/data/sample-will'
import { updateWill, deleteWill } from '@/lib/actions/wills'
import { DeleteDialog } from '@/components/wills/delete-dialog'
import { WillContent } from '@/lib/types/will'
import { AutoFillOrchestrator, AutoFillSuggestion, WillArticle } from '@/lib/auto-fill'
import { InitialDocumentGenerator } from '@/lib/will/initial-document-generator'
import { toast } from 'sonner'

interface WillEditorProps {
  will: Will
}

export function WillEditor({ will }: WillEditorProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [editorValue, setEditorValue] = useState<Value>(() => {
    // If editorContent exists and has content, use it (preserve user edits)
    if (will.editorContent && Array.isArray(will.editorContent) && will.editorContent.length > 0) {
      return will.editorContent as unknown as Value
    }

    // Generate dynamic content from willContent
    const content = will.content as unknown as WillContent
    if (content && Object.keys(content).length > 0) {
      // Check if we have minimum data to generate
      if (InitialDocumentGenerator.hasMinimumData(content)) {
        console.log('Generating initial document from testator data')
        return InitialDocumentGenerator.generate(content)
      }
    }

    // Ultimate fallback to sample content
    console.log('Using sample initial content as fallback')
    return initialEditorContent as Value
  })
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

  // Auto-fill state
  const [autoFillSuggestions, setAutoFillSuggestions] = useState<AutoFillSuggestion[]>([])
  const [showAutoFillPreview, setShowAutoFillPreview] = useState(false)

  // PDF preview state
  const [showPDFPreview, setShowPDFPreview] = useState(false)

  // Questionnaire state
  const [questionnaireContext, setQuestionnaireContext] = useState<MissingInfoContext | null>(null)
  const [showQuestionnaire, setShowQuestionnaire] = useState(false)

  // Optional clauses state
  const [showOptionalClausesBrowser, setShowOptionalClausesBrowser] = useState(false)

  // Track active selection index for document context
  const [activeSelectionIndex, setActiveSelectionIndex] = useState<number>(0)

  // Track mount state to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

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

  // useEffect(() => {
  //   setWillContent(sampleWillContent)
  // }, [])

  // Auto-save every 30 seconds if there are unsaved changes
  useEffect(() => {
    if (!hasUnsavedChanges) return

    const autoSaveInterval = setInterval(() => {
      saveWill()
    }, 30000) // 30 seconds

    return () => clearInterval(autoSaveInterval)
  }, [saveWill, hasUnsavedChanges])

  // Auto-fill suggestions (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const orchestrator = new AutoFillOrchestrator(willContent, editorValue)
        const suggestions = orchestrator.getSuggestions()
        setAutoFillSuggestions(suggestions)
      } catch (error) {
        console.error('Error generating auto-fill suggestions:', error)
      }
    }, 2000) // 2-second debounce

    return () => clearTimeout(timer)
  }, [willContent, editorValue])

  // Detect missing information (runs on load and when data changes)
  useEffect(() => {
    // Run immediately on mount if we have data
    const runDetection = () => {
      try {
        const detector = new MissingInfoDetector(willContent)
        const context = detector.analyze()

        // Also check for optional clauses that need questionnaires
        const optionalClausesDetector = new OptionalClausesDetector()
        const optionalContext = optionalClausesDetector.analyze(willContent.optionalClauses)

        // Merge contexts if both have questions
        if (context.questions.length > 0 && optionalContext) {
          const mergedContext = {
            ...context,
            questions: [...context.questions, ...optionalContext.questions],
            gaps: [...context.gaps, ...optionalContext.gaps],
          }
          setQuestionnaireContext(mergedContext)
        } else if (context.questions.length > 0) {
          setQuestionnaireContext(context)
        } else if (optionalContext) {
          setQuestionnaireContext(optionalContext)
        } else {
          setQuestionnaireContext(null)
        }
      } catch (error) {
        console.error('Error detecting missing info:', error)
      }
    }

    // Run immediately on mount
    runDetection()

    // Also run with debounce when data changes
    const timer = setTimeout(runDetection, 2000) // 2-second debounce for changes

    return () => clearTimeout(timer)
  }, [willContent])

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

  // Handle AI chat text insertion
  const handleInsertFromChat = useCallback((text: string) => {
    // Append text as new paragraph to editor
    setEditorValue(prev => {
      return [
        ...prev,
        {
          type: 'p',
          children: [{ text }],
        }
      ] as Value;
    });
    setHasUnsavedChanges(true);
    toast.success('Text inserted into editor');
  }, []);

  // Handle AI agent edits
  const handleAgentEdit = useCallback((newEditorValue: Value, changes: any[]) => {
    setEditorValue(newEditorValue);
    setHasUnsavedChanges(true);

    toast.success('AI updated your document', {
      description: `${changes.length} change${changes.length === 1 ? '' : 's'} applied`,
    });
  }, []);

  // Handle auto-fill apply
  const handleApplyAutoFill = useCallback((article: WillArticle, mode: 'replace' | 'merge') => {
    try {
      const orchestrator = new AutoFillOrchestrator(willContent, editorValue)
      const newValue = orchestrator.applySection(article, mode)
      setEditorValue(newValue)
      setHasUnsavedChanges(true)

      // Remove applied suggestion from list
      setAutoFillSuggestions(prev => prev.filter(s => s.section.article !== article))

      toast.success('Will section updated')
    } catch (error) {
      console.error('Error applying auto-fill:', error)
      toast.error('Failed to apply auto-fill')
    }
  }, [willContent, editorValue]);

  // Handle questionnaire completion
  const handleQuestionnaireComplete = useCallback(async (updates: Partial<WillContent>) => {
    try {
      // Merge updates into willContent
      const updatedContent = {
        ...willContent,
        ...updates,
      }

      setWillContent(updatedContent)
      setHasUnsavedChanges(true)

      // Save immediately
      await updateWill(will.id, {
        content: updatedContent,
      })

      // Trigger auto-fill regeneration with the updated content
      const orchestrator = new AutoFillOrchestrator(updatedContent, editorValue)

      // Get all suggestions (should include Living Will if questionnaire was completed)
      const suggestions = orchestrator.getSuggestions()

      // Auto-apply all safe suggestions (including new sections like Living Will)
      const newEditorValue = orchestrator.applyAllSuggestions()

      // Update editor if any suggestions were applied
      if (newEditorValue !== editorValue) {
        setEditorValue(newEditorValue)

        // Show specific success message based on what was added
        const addedSections = suggestions.filter(s => s.canAutoApply).map(s => s.section.article)

        if (addedSections.includes('LIVING_WILL')) {
          toast.success('Living Will clause added to document')
        } else if (addedSections.length > 0) {
          toast.success('Will sections added to document')
        }
      } else {
        toast.success('Information saved successfully')
      }

      // Update suggestions list (remove those that were auto-applied)
      const remainingSuggestions = suggestions.filter(s => !s.canAutoApply)
      setAutoFillSuggestions(remainingSuggestions)
    } catch (error) {
      toast.error('Failed to save information')
      console.error('Error saving questionnaire answers:', error)
    }
  }, [willContent, editorValue, will.id])

  // Handle optional clause toggle
  const handleOptionalClauseToggle = useCallback(async (clauseType: OptionalClauseType, isSelected: boolean) => {
    try {
      const existingClauses = willContent.optionalClauses || []

      if (isSelected) {
        // Add the clause
        const updatedClauses = [
          ...existingClauses.filter(c => c.clauseType !== clauseType),
          {
            clauseType,
            isSelected: true,
            // Commissioner clause is immediately complete (no form needed)
            questionnaireCompleted: clauseType === 'commissioner-of-oath-attestation' ? true : false,
            addedAt: new Date(),
          },
        ]

        const updatedContent = {
          ...willContent,
          optionalClauses: updatedClauses,
        }

        setWillContent(updatedContent)
        setHasUnsavedChanges(true)

        // Save immediately
        await updateWill(will.id, {
          content: updatedContent,
        })

        toast.success('Optional clause added')

        // Close the browser modal
        setShowOptionalClausesBrowser(false)

        // If clause requires questionnaire, trigger it
        if (requiresQuestionnaire(clauseType)) {
          const detector = new OptionalClausesDetector()
          const context = detector.analyze(updatedClauses)

          if (context) {
            setQuestionnaireContext(context)
            setShowQuestionnaire(true)
          }
        }

        // If commissioner clause, trigger auto-fill to add blank fields
        if (clauseType === 'commissioner-of-oath-attestation') {
          const orchestrator = new AutoFillOrchestrator(updatedContent, editorValue)
          const newEditorValue = orchestrator.applyAllSuggestions()

          if (newEditorValue !== editorValue) {
            setEditorValue(newEditorValue)
            toast.success('Commissioner section added to document')
          }

          const suggestions = orchestrator.getSuggestions()
          setAutoFillSuggestions(suggestions.filter(s => !s.canAutoApply))
        }

      } else {
        // Remove the clause
        const updatedClauses = existingClauses.filter(c => c.clauseType !== clauseType)

        const updatedContent: WillContent = {
          ...willContent,
          optionalClauses: updatedClauses,
        }

        setWillContent(updatedContent)
        setHasUnsavedChanges(true)

        // Save immediately
        await updateWill(will.id, {
          content: updatedContent,
        })

        toast.success('Optional clause removed')

        // If commissioner clause was removed, trigger auto-fill to remove blank fields
        if (clauseType === 'commissioner-of-oath-attestation') {
          const orchestrator = new AutoFillOrchestrator(updatedContent, editorValue)
          const newEditorValue = orchestrator.applyAllSuggestions()

          if (newEditorValue !== editorValue) {
            setEditorValue(newEditorValue)
            toast.success('Commissioner section removed from document')
          }

          const suggestions = orchestrator.getSuggestions()
          setAutoFillSuggestions(suggestions.filter(s => !s.canAutoApply))
        }
      }
    } catch (error) {
      toast.error('Failed to update optional clause')
      console.error('Error updating optional clause:', error)
    }
  }, [willContent, will.id])

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

  // Handle opening PDF preview
  const handleOpenPreview = useCallback(() => {
    if (!editorValue || editorValue.length === 0) {
      toast.error('No content to preview')
      return
    }
    setShowPDFPreview(true)
  }, [editorValue])

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
              {mounted ? (
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
              ) : (
                <Badge className={getStatusColor(status)} variant="secondary">
                  {status}
                </Badge>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {isSaving ? (
                  'Saving...'
                ) : hasUnsavedChanges ? (
                  'Unsaved changes'
                ) : mounted ? (
                  <>Saved {lastSaved.toLocaleTimeString()}</>
                ) : (
                  'Saved'
                )}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {autoFillSuggestions.length > 0 && (
            <AutoFillNotification
              suggestionCount={autoFillSuggestions.length}
              onOpenPreview={() => setShowAutoFillPreview(true)}
            />
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowOptionalClausesBrowser(true)}
            className="gap-2"
          >
            <ListPlus className="h-4 w-4" />
            Optional Clauses
          </Button>
          {questionnaireContext && questionnaireContext.questions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQuestionnaire(true)}
              className="gap-2"
            >
              <AlertCircle className="h-4 w-4" />
              Complete Missing Info ({questionnaireContext.questions.length})
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenPreview}
            disabled={!editorValue || editorValue.length === 0}
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview PDF
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

      {/* Main Content - 3 Column Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Testator Sidebar - Left Column */}
        <aside className="w-96 border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
          <TestatorSidebar willContent={willContent} />
        </aside>

        {/* Editor Section - Center Column */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 h-full">
            <PlateEditor
              initialValue={editorValue}
              onChange={handleEditorChange}
              willContent={willContent}
              className="h-full"
            />
          </div>
        </div>

        {/* AI Chat Panel - Right Column */}
        <aside className="w-[400px] h-full overflow-hidden">
          <AIChat
            onInsert={handleInsertFromChat}
            onAgentEdit={handleAgentEdit}
            willContent={willContent}
            editorValue={editorValue}
            activeSelectionIndex={activeSelectionIndex}
          />
        </aside>
      </div>

      {/* Auto-Fill Preview Panel */}
      <AutoFillPreviewPanel
        suggestions={autoFillSuggestions}
        onApply={handleApplyAutoFill}
        onDismiss={() => setShowAutoFillPreview(false)}
        open={showAutoFillPreview}
        onOpenChange={setShowAutoFillPreview}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        willTitle={title}
      />

      {/* Questionnaire Modal */}
      {questionnaireContext && (
        <QuestionnaireModal
          open={showQuestionnaire}
          onOpenChange={setShowQuestionnaire}
          context={questionnaireContext}
          currentWillContent={willContent}
          onComplete={handleQuestionnaireComplete}
        />
      )}

      {/* Optional Clauses Browser */}
      <OptionalClausesBrowser
        open={showOptionalClausesBrowser}
        onOpenChange={setShowOptionalClausesBrowser}
        selectedClauses={willContent.optionalClauses || []}
        onClauseToggle={handleOptionalClauseToggle}
      />

      {/* PDF Preview Panel */}
      <PDFPreviewPanel
        open={showPDFPreview}
        onOpenChange={setShowPDFPreview}
        title={title}
        editorContent={editorValue}
        createdAt={will.createdAt}
        onExport={handleExport}
        willContent={willContent}
      />
    </div>
  )
}
