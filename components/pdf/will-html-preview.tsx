import type { Value } from '@udecode/plate'
import type { WillContent } from '@/lib/types/will'

interface WillHTMLPreviewProps {
  title: string
  editorContent: Value
  createdAt: Date
  willContent?: WillContent
}

// Helper type guards
const isTextNode = (node: any): node is { text: string; bold?: boolean; italic?: boolean; underline?: boolean } => {
  return typeof node === 'object' && node !== null && 'text' in node
}

const isEmptyParagraph = (node: any): boolean => {
  if (node.type !== 'p') return false
  if (!node.children || node.children.length === 0) return true
  if (node.children.length === 1 && isTextNode(node.children[0]) && node.children[0].text === '') {
    return true
  }
  return false
}

export function WillHTMLPreview({ title, editorContent, createdAt, willContent }: WillHTMLPreviewProps) {
  // Render text with formatting
  const renderText = (textNode: any) => {
    if (!isTextNode(textNode)) return null

    let className = ''
    if (textNode.bold) className += 'font-bold '
    if (textNode.italic) className += 'italic '
    if (textNode.underline) className += 'underline '

    if (className) {
      return (
        <span key={Math.random()} className={className.trim()}>
          {textNode.text}
        </span>
      )
    }

    return textNode.text
  }

  // Render inline children (text with formatting)
  const renderInlineChildren = (children: any[]) => {
    if (!children || children.length === 0) return null

    return children.map((child, index) => {
      if (isTextNode(child)) {
        return <span key={index}>{renderText(child)}</span>
      }
      return null
    })
  }

  // Render list item content (handles both inline text and nested blocks)
  const renderListItemContent = (children: any[]) => {
    if (!children || children.length === 0) return null

    return children.map((child, index) => {
      // If it's a text node, render it as text
      if (isTextNode(child)) {
        return <span key={index}>{renderText(child)}</span>
      }

      // If it's a paragraph inside a list item, render its children inline
      if (child.type === 'p') {
        return <span key={index}>{renderInlineChildren(child.children)}</span>
      }

      // For other block types, render them normally (without extra margins)
      if (child.type === 'ul' || child.type === 'ol') {
        return renderList(child, child.type === 'ol')
      }

      return null
    })
  }

  // Render list items recursively
  const renderList = (node: any, isOrdered: boolean) => {
    const ListTag = isOrdered ? 'ol' : 'ul'
    const listClassName = isOrdered
      ? 'mb-4 ml-6 list-decimal [&>li]:mt-2'
      : 'mb-4 ml-6 list-disc [&>li]:mt-2'

    return (
      <ListTag className={listClassName}>
        {node.children?.map((child: any, index: number) => {
          if (child.type === 'li') {
            return (
              <li key={index} className="mb-2">
                {renderListItemContent(child.children)}
              </li>
            )
          }
          return null
        })}
      </ListTag>
    )
  }

  // Render a single node
  const renderNode = (node: any, index: number) => {
    // Handle empty paragraphs (line breaks)
    if (isEmptyParagraph(node)) {
      return <div key={index} className="mb-3 h-3" />
    }

    // Heading 1
    if (node.type === 'h1') {
      return (
        <h1 key={index} className="mb-4 mt-6 text-3xl tracking-tight">
          {renderInlineChildren(node.children)}
        </h1>
      )
    }

    // Heading 2
    if (node.type === 'h2') {
      return (
        <h2 key={index} className="mb-3 mt-5 text-2xl tracking-tight">
          {renderInlineChildren(node.children)}
        </h2>
      )
    }

    // Heading 3
    if (node.type === 'h3') {
      return (
        <h3 key={index} className="mb-2 mt-4 text-xl tracking-tight">
          {renderInlineChildren(node.children)}
        </h3>
      )
    }

    // Paragraph
    if (node.type === 'p') {
      return (
        <p key={index} className="mb-4 leading-7">
          {renderInlineChildren(node.children)}
        </p>
      )
    }

    // Unordered list
    if (node.type === 'ul') {
      return <div key={index}>{renderList(node, false)}</div>
    }

    // Ordered list
    if (node.type === 'ol') {
      return <div key={index}>{renderList(node, true)}</div>
    }

    // Blockquote
    if (node.type === 'blockquote') {
      return (
        <blockquote
          key={index}
          className="mb-4 border-l-4 border-muted-foreground/30 pl-4 italic"
        >
          {renderInlineChildren(node.children)}
        </blockquote>
      )
    }

    // Fallback for unknown types
    return null
  }

  // Format date
  const formattedDate = createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="flex justify-center bg-neutral-100 p-8">
      <div className="a4-page">
        <div className="a4-content">
          {/* Testator Information Header */}
          {willContent?.testator && (
            <div className="mb-8 border-b pb-4">
              <h1 className="text-center text-2xl mb-4">LAST WILL AND TESTAMENT</h1>
              <div className="text-center text-sm space-y-1">
                <p className="font-semibold">{willContent.testator.fullName}</p>
                <p>ID Number: {willContent.testator.idNumber}</p>
                {willContent.testator.address && (
                  <p>
                    {willContent.testator.address.street}
                    {willContent.testator.address.city && `, ${willContent.testator.address.city}`}
                    {willContent.testator.address.state && `, ${willContent.testator.address.state}`}
                    {willContent.testator.address.postalCode && ` ${willContent.testator.address.postalCode}`}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Editor Content */}
          {editorContent.map((node: any, index: number) => renderNode(node, index))}
        </div>
        <div className="a4-footer">
          <div className="flex justify-between text-neutral-600">
            <span>Generated on {formattedDate}</span>
            <span>{title || 'Untitled Will'}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .a4-page {
          width: 210mm;
          min-height: 297mm;
          background: white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          position: relative;
          font-size: 11pt;
          font-family: Helvetica, Arial, sans-serif;
          line-height: 1.75;
        }

        .a4-content {
          padding: 50px;
          padding-bottom: 100px;
        }

        .a4-footer {
          position: absolute;
          bottom: 30px;
          left: 50px;
          right: 50px;
          font-size: 9pt;
          color: #666;
          border-top: 1px solid #ddd;
          padding-top: 10px;
        }
      `}</style>
    </div>
  )
}
