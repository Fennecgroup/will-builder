'use client'

import { useState } from 'react'
import { Will } from '@prisma/client'
import { WillCard } from '@/components/wills/will-card'
import { DeleteDialog } from '@/components/wills/delete-dialog'
import { deleteWill } from '@/lib/actions/wills'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface WillsClientProps {
  wills: Will[]
}

export function WillsClient({ wills }: WillsClientProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [willToDelete, setWillToDelete] = useState<Will | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteClick = (willId: string) => {
    const will = wills.find((w) => w.id === willId)
    if (will) {
      setWillToDelete(will)
      setDeleteDialogOpen(true)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!willToDelete) return

    setIsDeleting(true)
    try {
      await deleteWill(willToDelete.id)
      toast.success('Will deleted successfully')
      setDeleteDialogOpen(false)
      setWillToDelete(null)
      router.refresh()
    } catch (error) {
      toast.error('Failed to delete will')
      console.error('Error deleting will:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wills.map((will) => (
          <WillCard key={will.id} will={will} onDelete={handleDeleteClick} />
        ))}
      </div>

      {willToDelete && (
        <DeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          willTitle={willToDelete.title}
        />
      )}
    </>
  )
}
