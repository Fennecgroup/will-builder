/**
 * Shared Document Styles Configuration
 *
 * Single source of truth for styling across:
 * - Editor (Tailwind CSS classes)
 * - HTML Preview (Tailwind CSS classes)
 * - PDF Export (React-PDF numeric values)
 *
 * Key principle: Headers get visual distinction from SIZE, not weight.
 * Bold only applies when user explicitly formats text as bold.
 */

// Tailwind CSS classes for Editor and HTML Preview
export const EDITOR_STYLES = {
  // Headers - NO forced bold, distinction comes from size
  h1: "mb-4 mt-6 text-3xl tracking-tight",
  h2: "mb-3 mt-5 text-2xl tracking-tight",
  h3: "mb-2 mt-4 text-xl tracking-tight",

  // Text blocks
  paragraph: "mb-4 leading-7",
  blockquote: "mb-4 border-l-4 border-muted-foreground/30 pl-4 italic",

  // Lists
  ul: "mb-4 ml-6 list-disc [&>li]:mt-2",
  ol: "mb-4 ml-6 list-decimal [&>li]:mt-2",
  li: "mb-2",

  // Inline formatting (applied via leaf nodes)
  bold: "font-bold",
  italic: "italic",
  underline: "underline",
  strikethrough: "line-through",
  code: "rounded bg-muted px-1.5 py-0.5 font-mono text-sm",

  // Links
  link: "font-medium text-primary underline underline-offset-4",
} as const;

// React-PDF numeric values for PDF export
// Convert Tailwind sizes: text-3xl (30px) → 24pt, text-2xl (24px) → 20pt, etc.
export const PDF_STYLES = {
  // Headers - NO forced fontWeight, distinction comes from fontSize
  h1: {
    fontSize: 24, // ~text-3xl scaled for PDF
    marginTop: 24,
    marginBottom: 16,
    // fontWeight intentionally omitted - defaults to 'normal'
  },
  h2: {
    fontSize: 20, // ~text-2xl scaled for PDF
    marginTop: 20,
    marginBottom: 12,
    // fontWeight intentionally omitted
  },
  h3: {
    fontSize: 16, // ~text-xl scaled for PDF
    marginTop: 16,
    marginBottom: 8,
    // fontWeight intentionally omitted
  },

  // Text blocks
  paragraph: {
    marginBottom: 16,
    lineHeight: 1.75,
    fontSize: 12,
  },
  blockquote: {
    marginBottom: 16,
    paddingLeft: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#a3a3a3',
    fontStyle: 'italic',
  },

  // Lists
  ul: {
    marginBottom: 16,
    marginLeft: 20,
  },
  ol: {
    marginBottom: 16,
    marginLeft: 20,
  },
  li: {
    marginBottom: 8,
    fontSize: 12,
  },

  // Inline formatting (applied at text level)
  bold: {
    fontWeight: 'bold' as const,
  },
  italic: {
    fontStyle: 'italic' as const,
  },
  underline: {
    textDecoration: 'underline' as const,
  },
  strikethrough: {
    textDecoration: 'line-through' as const,
  },
  code: {
    fontFamily: 'Courier',
    fontSize: 10,
    backgroundColor: '#f5f5f5',
    padding: 2,
  },

  // Links
  link: {
    color: '#0066cc',
    textDecoration: 'underline' as const,
  },

  // Document metadata
  title: {
    fontSize: 18,
    textAlign: 'center' as const,
    marginBottom: 8,
    // fontWeight intentionally omitted
  },
  subtitle: {
    fontSize: 10,
    textAlign: 'center' as const,
    color: '#666666',
    marginBottom: 4,
  },
  testatorInfo: {
    fontSize: 10,
    textAlign: 'center' as const,
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
} as const;

/**
 * Helper to convert Tailwind spacing to pixels
 * Used for understanding the relationship between editor and PDF styles
 */
export const SPACING = {
  // Tailwind spacing scale
  1: 4,   // 0.25rem
  2: 8,   // 0.5rem
  3: 12,  // 0.75rem
  4: 16,  // 1rem
  5: 20,  // 1.25rem
  6: 24,  // 1.5rem
  7: 28,  // 1.75rem
  8: 32,  // 2rem
} as const;

/**
 * Helper to convert Tailwind font sizes to pixels
 */
export const FONT_SIZES = {
  'text-base': 16,   // 1rem
  'text-lg': 18,     // 1.125rem
  'text-xl': 20,     // 1.25rem
  'text-2xl': 24,    // 1.5rem
  'text-3xl': 30,    // 1.875rem
} as const;
