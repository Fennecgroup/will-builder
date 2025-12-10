import { redirect } from 'next/navigation'
import { createWill } from '@/lib/actions/wills'
import { sampleWillContent } from '@/lib/data/sample-will'

export default async function NewWillPage() {
  // Create a new will with sample content to generate initial document
  // User can then modify the testator data in the sidebar
  const will = await createWill('Untitled Will', sampleWillContent)

  // Redirect automatically handles cache revalidation
  redirect(`/dashboard/wills/${will.id}`)
}
