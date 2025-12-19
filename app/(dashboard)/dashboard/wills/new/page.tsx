// ============================================
// TEMPORARY DEVELOPMENT FEATURE
// This page has been modified to show sample selection dialog.
// See removal instructions in plan file.
//
// ORIGINAL IMPLEMENTATION (for restoration):
// import { redirect } from 'next/navigation'
// import { createWill } from '@/lib/actions/wills'
// import { sampleWillContent } from '@/lib/data/sample-will'
//
// export default async function NewWillPage() {
//   const will = await createWill('Untitled Will', sampleWillContent)
//   redirect(`/dashboard/wills/${will.id}`)
// }
// ============================================

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createWill } from '@/lib/actions/wills';
import { sampleWillOptions } from '@/lib/data/samples';
import { SampleWillSelector } from '@/components/wills/sample-will-selector';

export default function NewWillPage() {
  const [open, setOpen] = useState(true);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSelect = async (sampleId: string) => {
    const sample = sampleWillOptions.find((s) => s.id === sampleId);
    if (!sample) {
      console.error('Sample not found:', sampleId);
      return;
    }

    startTransition(async () => {
      try {
        const will = await createWill('Untitled Will', sample.content);
        router.push(`/dashboard/wills/${will.id}`);
      } catch (error) {
        console.error('Failed to create will:', error);
        // TODO: Show error toast to user
      }
    });
  };

  const handleClose = () => {
    setOpen(false);
    // Navigate back to wills list if dialog is closed without selection
    router.push('/dashboard/wills');
  };

  return (
    <SampleWillSelector
      open={open}
      onOpenChange={handleClose}
      onSelect={handleSelect}
      isLoading={isPending}
    />
  );
}
