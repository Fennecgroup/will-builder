import type { Value } from '@udecode/plate'

interface WillHTMLPreviewProps {
  title: string
  editorContent: Value
  createdAt: Date
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

export function WillHTMLPreview({ title, editorContent, createdAt }: WillHTMLPreviewProps) {
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

  // Render list items recursively
  const renderList = (node: any, isOrdered: boolean) => {
    const ListTag = isOrdered ? 'ol' : 'ul'
    const listClassName = isOrdered
      ? 'mb-3 ml-4 list-decimal space-y-1'
      : 'mb-3 ml-4 list-disc space-y-1'

    return (
      <ListTag className={listClassName}>
        {node.children?.map((child: any, index: number) => {
          if (child.type === 'li') {
            return (
              <li key={index} className="ml-2">
                {renderInlineChildren(child.children)}
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
        <h1 key={index} className="text-2xl font-bold mb-3 mt-4">
          {renderInlineChildren(node.children)}
        </h1>
      )
    }

    // Heading 2
    if (node.type === 'h2') {
      return (
        <h2 key={index} className="text-xl font-semibold mb-2 mt-3.5">
          {renderInlineChildren(node.children)}
        </h2>
      )
    }

    // Heading 3
    if (node.type === 'h3') {
      return (
        <h3 key={index} className="text-base font-semibold mb-1.5 mt-2.5">
          {renderInlineChildren(node.children)}
        </h3>
      )
    }

    // Paragraph
    if (node.type === 'p') {
      return (
        <p key={index} className="mb-3 leading-[1.75]">
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
          className="mb-3 border-l-4 border-neutral-300 pl-3 italic text-neutral-600"
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
