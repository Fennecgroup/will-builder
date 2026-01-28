import { NextRequest } from 'next/server'
import { renderToStream } from '@react-pdf/renderer'
import { auth } from '@clerk/nextjs/server'
import { getWillById } from '@/lib/actions/wills'
import { WillPDFTemplate } from '@/components/pdf/will-pdf-template'
import { WillContent } from '@/lib/types/will'
import type { Value } from '@udecode/plate'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()

  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const { id } = await params
    const will = await getWillById(id)

    // Render PDF
    const stream = await renderToStream(
      WillPDFTemplate({
        title: will.title,
        editorContent: (will.editorContent as unknown as Value) || [],
        willContent: (will.content as unknown as WillContent) || ({} as WillContent),
        createdAt: will.createdAt,
      })
    )

    // Convert stream to buffer
    const chunks: Buffer[] = []
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk))
    }
    const buffer = Buffer.concat(chunks)

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${will.title.replace(/[^a-z0-9]/gi, '_')}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return new Response('Error generating PDF', { status: 500 })
  }
}
