'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { WillContent } from '@/lib/types/will'
import { InitialDocumentGenerator } from '@/lib/will/initial-document-generator'
import { revalidatePath } from 'next/cache'

export async function createWill(title: string, content?: WillContent) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  // Generate initial editor content from testator data if available
  let editorContent: any = null
  if (content && InitialDocumentGenerator.hasMinimumData(content)) {
    try {
      editorContent = InitialDocumentGenerator.generate(content)
      console.log('Generated initial document for new will')
    } catch (error) {
      console.error('Error generating initial document:', error)
      // Continue without editorContent if generation fails
    }
  }

  const will = await prisma.will.create({
    data: {
      title,
      content: (content as any) || {},
      editorContent: editorContent,
      status: 'draft',
      user: {
        connectOrCreate: {
          where: { clerkId: userId },
          create: {
            clerkId: userId,
            email: '', // Will be updated by webhook
          },
        },
      },
    },
  })

  return will
}

export async function getWills() {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      wills: {
        orderBy: {
          updatedAt: 'desc',
        },
      },
    },
  })

  return user?.wills || []
}

export async function getWillById(willId: string) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  const will = await prisma.will.findFirst({
    where: {
      id: willId,
      user: {
        clerkId: userId,
      },
    },
  })

  if (!will) {
    throw new Error('Will not found or unauthorized')
  }

  return will
}

export async function updateWill(
  willId: string,
  data: {
    title?: string
    content?: WillContent
    editorContent?: any
    status?: string
  }
) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  // Verify ownership
  const existingWill = await prisma.will.findFirst({
    where: {
      id: willId,
      user: {
        clerkId: userId,
      },
    },
  })

  if (!existingWill) {
    throw new Error('Will not found or unauthorized')
  }

  const will = await prisma.will.update({
    where: { id: willId },
    data: {
      ...(data as any),
      updatedAt: new Date(),
    },
  })

  revalidatePath('/dashboard/wills')
  revalidatePath(`/dashboard/wills/${willId}`)
  return will
}

export async function deleteWill(willId: string) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  // Verify ownership
  const existingWill = await prisma.will.findFirst({
    where: {
      id: willId,
      user: {
        clerkId: userId,
      },
    },
  })

  if (!existingWill) {
    throw new Error('Will not found or unauthorized')
  }

  await prisma.will.delete({
    where: { id: willId },
  })

  revalidatePath('/dashboard/wills')
  return { success: true }
}

export async function getWillStats() {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      wills: {
        select: {
          status: true,
        },
      },
    },
  })

  const wills = user?.wills || []

  return {
    total: wills.length,
    draft: wills.filter((w) => w.status === 'draft').length,
    completed: wills.filter((w) => w.status === 'completed').length,
    finalized: wills.filter((w) => w.status === 'finalized').length,
  }
}
