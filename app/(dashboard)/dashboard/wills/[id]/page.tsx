import { redirect } from 'next/navigation'
import { getWillById } from '@/lib/actions/wills'
import { WillEditor } from './will-editor'

interface EditWillPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditWillPage({ params }: EditWillPageProps) {
  const { id } = await params

  try {
    const will = await getWillById(id)
    return <WillEditor will={will} />
  } catch (error) {
    // Will not found or unauthorized, redirect to wills list
    redirect('/dashboard/wills')
  }
}
