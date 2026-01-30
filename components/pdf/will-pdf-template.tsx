import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { WillContent } from '@/lib/types/will'
import type { Value } from '@udecode/plate'
import { PDF_STYLES } from '@/lib/styles/document-styles'

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 12,
    fontFamily: 'Helvetica',
    lineHeight: 1.75,
  },
  // Testator header
  testatorHeader: {
    ...PDF_STYLES.testatorInfo,
  },
  testatorTitle: {
    ...PDF_STYLES.title,
    marginBottom: 16,
  },
  testatorText: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 4,
  },
  // Content elements
  h1: {
    ...PDF_STYLES.h1,
  },
  h2: {
    ...PDF_STYLES.h2,
  },
  h3: {
    ...PDF_STYLES.h3,
  },
  paragraph: {
    ...PDF_STYLES.paragraph,
  },
  blockquote: {
    ...PDF_STYLES.blockquote,
  },
  ul: {
    ...PDF_STYLES.ul,
  },
  ol: {
    ...PDF_STYLES.ol,
  },
  li: {
    ...PDF_STYLES.li,
  },
  // Inline formatting
  bold: {
    ...PDF_STYLES.bold,
  },
  italic: {
    ...PDF_STYLES.italic,
  },
  underline: {
    ...PDF_STYLES.underline,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    fontSize: 9,
    color: '#666',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
  },
})

interface WillPDFTemplateProps {
  title: string
  editorContent: Value
  willContent?: WillContent
  createdAt: Date
}

// Helper type guards
const isTextNode = (node: any): boolean => {
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

export function WillPDFTemplate({ title, editorContent, willContent, createdAt }: WillPDFTemplateProps) {
  // Render text with formatting
  const renderText = (textNode: any, key: number | string) => {
    if (!isTextNode(textNode)) return null

    const textStyle: any = {}
    if (textNode.bold) textStyle.fontWeight = 'bold'
    if (textNode.italic) textStyle.fontStyle = 'italic'
    if (textNode.underline) textStyle.textDecoration = 'underline'

    return (
      <Text key={key} style={textStyle}>
        {textNode.text}
      </Text>
    )
  }

  // Render inline children (text with formatting)
  const renderInlineChildren = (children: any[]) => {
    if (!children || children.length === 0) return null

    return children.map((child, index) => {
      if (isTextNode(child)) {
        return renderText(child, index)
      }
      return null
    })
  }

  // Render list item content (handles both inline text and nested blocks)
  const renderListItemContent = (children: any[]) => {
    if (!children || children.length === 0) return null

    // Collect all text content from nested structures
    const textParts: any[] = []

    children.forEach((child, index) => {
      // If it's a text node, add it directly
      if (isTextNode(child)) {
        textParts.push(renderText(child, index))
      }
      // If it's a paragraph inside a list item, render its children
      else if (child.type === 'p' && child.children) {
        child.children.forEach((innerChild: any, innerIndex: number) => {
          if (isTextNode(innerChild)) {
            textParts.push(renderText(innerChild, `${index}-${innerIndex}`))
          }
        })
      }
    })

    return textParts
  }

  // Render list items recursively
  const renderList = (node: any, isOrdered: boolean, key: number) => {
    return (
      <View key={key} style={isOrdered ? styles.ol : styles.ul}>
        {node.children?.map((child: any, index: number) => {
          if (child.type === 'li') {
            return (
              <View key={index} style={styles.li}>
                <Text>
                  {isOrdered ? `${index + 1}. ` : '• '}
                  {renderListItemContent(child.children)}
                </Text>
              </View>
            )
          }
          return null
        })}
      </View>
    )
  }

  // Render a single node
  const renderNode = (node: any, index: number) => {
    // Handle empty paragraphs (line breaks)
    if (isEmptyParagraph(node)) {
      return <View key={index} style={{ marginBottom: 12 }} />
    }

    // Heading 1
    if (node.type === 'h1') {
      return (
        <Text key={index} style={styles.h1}>
          {renderInlineChildren(node.children)}
        </Text>
      )
    }

    // Heading 2
    if (node.type === 'h2') {
      return (
        <Text key={index} style={styles.h2}>
          {renderInlineChildren(node.children)}
        </Text>
      )
    }

    // Heading 3
    if (node.type === 'h3') {
      return (
        <Text key={index} style={styles.h3}>
          {renderInlineChildren(node.children)}
        </Text>
      )
    }

    // Paragraph
    if (node.type === 'p') {
      return (
        <Text key={index} style={styles.paragraph}>
          {renderInlineChildren(node.children)}
        </Text>
      )
    }

    // Unordered list
    if (node.type === 'ul') {
      return renderList(node, false, index)
    }

    // Ordered list
    if (node.type === 'ol') {
      return renderList(node, true, index)
    }

    // Blockquote
    if (node.type === 'blockquote') {
      return (
        <View key={index} style={styles.blockquote}>
          <Text>{renderInlineChildren(node.children)}</Text>
        </View>
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
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Testator Information Header */}
        {willContent?.testator && (
          <View style={styles.testatorHeader}>
            <Text style={styles.testatorTitle}>LAST WILL AND TESTAMENT</Text>
            <Text style={[styles.testatorText, { fontWeight: 'bold' }]}>
              {willContent.testator.fullName}
            </Text>
            <Text style={styles.testatorText}>
              ID Number: {willContent.testator.idNumber}
            </Text>
            {willContent.testator.address && (
              <Text style={styles.testatorText}>
                {willContent.testator.address.street}
                {willContent.testator.address.city && `, ${willContent.testator.address.city}`}
                {willContent.testator.address.state && `, ${willContent.testator.address.state}`}
                {willContent.testator.address.postalCode && ` ${willContent.testator.address.postalCode}`}
              </Text>
            )}
          </View>
        )}

        {/* Editor Content */}
        {editorContent && editorContent.map((node: any, index: number) => renderNode(node, index))}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Generated on {formattedDate}</Text>
          <Text>{title || 'Untitled Will'}</Text>
        </View>
      </Page>
    </Document>
  )
}
