import { redirect } from 'next/navigation'
import { createWill } from '@/lib/actions/wills'

export default async function NewWillPage() {
  // Create a new will and redirect to edit page
  const will = await createWill('Untitled Will')

  // Redirect automatically handles cache revalidation
  redirect(`/dashboard/wills/${will.id}`)
}
