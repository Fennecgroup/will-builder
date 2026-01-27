// Document Token Budget Management
// Estimates and manages token budgets for document context

import type { PlateNode, PlateText } from '@/lib/auto-fill/types';
import type { Value } from '@udecode/plate';

/**
 * Extract text from a Plate node recursively
 * @param node PlateNode or PlateText to extract text from
 * @returns Concatenated text content
 */
function extractText(node: PlateNode | PlateText): string {
  if ('text' in node && typeof node.text === 'string') {
    return node.text;
  }

  if ('children' in node && Array.isArray(node.children)) {
    return node.children.map((child) => extractText(child)).join('');
  }

  return '';
}

/**
 * Estimate tokens for a section's content
 * Uses the 1 token ≈ 4 characters heuristic
 * Includes overhead for Plate.js node structure
 * @param content Array of PlateNodes
 * @returns Estimated token count
 */
export function estimateSectionTokens(content: PlateNode[]): number {
  // Extract all text content
  const text = content.map(node => extractText(node)).join('\n');

  // Base text tokens (1 token ≈ 4 characters)
  const textTokens = Math.ceil(text.length / 4);

  // Add overhead for structure (node types, formatting)
  // Estimate ~5 tokens per node for structure overhead
  const structureTokens = content.length * 5;

  return textTokens + structureTokens;
}

/**
 * Compress a section to text-only format (removes formatting)
 * Used when a section is too large and needs to be summarized
 * @param content Array of PlateNodes
 * @returns Plain text summary
 */
export function compressSectionToText(content: PlateNode[]): string {
  // Extract all text and join with newlines
  const text = content.map(node => extractText(node)).join('\n');

  // Remove excessive whitespace
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
}

/**
 * Truncate text to fit within token budget
 * @param text Text to truncate
 * @param maxTokens Maximum tokens allowed
 * @returns Truncated text
 */
export function truncateToTokenBudget(text: string, maxTokens: number): string {
  const maxChars = maxTokens * 4; // 1 token ≈ 4 characters

  if (text.length <= maxChars) {
    return text;
  }

  // Try to truncate at a sentence boundary
  const truncated = text.substring(0, maxChars);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastNewline = truncated.lastIndexOf('\n');

  const breakPoint = Math.max(lastPeriod, lastNewline);

  if (breakPoint > maxChars * 0.7) {
    // Good break point found (at least 70% of budget used)
    return truncated.substring(0, breakPoint + 1) + '\n\n[Content truncated...]';
  }

  // No good break point, just cut at character limit
  return truncated + '...\n\n[Content truncated...]';
}

/**
 * Interface for section with relevance score
 */
interface ScoredSection {
  content: PlateNode[];
  estimatedTokens: number;
  score: number;
  metadata: any;
}

/**
 * Select sections within token budget using greedy algorithm
 * Prioritizes sections by score (relevance)
 * @param sections Array of sections with scores
 * @param maxTokens Maximum tokens allowed
 * @returns Selected sections and total tokens
 */
export function selectSectionsWithinBudget(
  sections: ScoredSection[],
  maxTokens: number
): {
  selected: ScoredSection[];
  totalTokens: number;
  excluded: ScoredSection[];
} {
  // Sort by score (highest first)
  const sorted = [...sections].sort((a, b) => b.score - a.score);

  const selected: ScoredSection[] = [];
  const excluded: ScoredSection[] = [];
  let totalTokens = 0;

  for (const section of sorted) {
    if (totalTokens + section.estimatedTokens <= maxTokens) {
      selected.push(section);
      totalTokens += section.estimatedTokens;
    } else {
      excluded.push(section);
    }
  }

  return { selected, totalTokens, excluded };
}

/**
 * Compress sections to fit within budget
 * First tries text-only summaries, then truncation
 * @param sections Sections that exceeded budget
 * @param remainingTokens Remaining token budget
 * @returns Compressed sections
 */
export function compressSectionsToFit(
  sections: ScoredSection[],
  remainingTokens: number
): Array<{
  summary: string;
  estimatedTokens: number;
  metadata: any;
}> {
  const compressed: Array<{
    summary: string;
    estimatedTokens: number;
    metadata: any;
  }> = [];

  let budgetLeft = remainingTokens;

  for (const section of sections) {
    if (budgetLeft <= 0) break;

    // Convert to text
    const text = compressSectionToText(section.content);
    const textTokens = Math.ceil(text.length / 4);

    if (textTokens <= budgetLeft) {
      // Fits without truncation
      compressed.push({
        summary: text,
        estimatedTokens: textTokens,
        metadata: section.metadata,
      });
      budgetLeft -= textTokens;
    } else {
      // Needs truncation
      const truncated = truncateToTokenBudget(text, budgetLeft);
      const truncatedTokens = Math.ceil(truncated.length / 4);

      compressed.push({
        summary: truncated,
        estimatedTokens: truncatedTokens,
        metadata: section.metadata,
      });
      budgetLeft -= truncatedTokens;
    }
  }

  return compressed;
}

/**
 * Estimate tokens for entire editor value
 * @param editorValue Plate.js editor value
 * @returns Estimated token count
 */
export function estimateEditorTokens(editorValue: Value): number {
  const nodes = editorValue as PlateNode[];
  return estimateSectionTokens(nodes);
}
