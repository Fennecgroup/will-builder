// Document Context Builder
// Main module for building optimized document context with smart section selection

import type { Value } from '@udecode/plate';
import type { WillArticle, PlateNode, DetectedSection } from '@/lib/auto-fill/types';
import { detectSections } from '@/lib/auto-fill/section-detector';
import {
  scoreDocumentRelevance,
  findActiveSection,
  type DocumentRelevanceScore,
} from './document-relevance-scorer';
import {
  estimateSectionTokens,
  compressSectionToText,
  selectSectionsWithinBudget,
  compressSectionsToFit,
} from './document-token-budget';

/**
 * Token budget allocation for document context
 */
export const DOCUMENT_TOKEN_BUDGETS = {
  activeSection: 800,      // 40% - Full detail of active section
  relatedSections: 800,    // 40% - Summaries of related sections
  outline: 100,            // 5% - Document outline (article list)
  total: 1700,             // 85% of testator context budget
};

/**
 * Options for building document context
 */
export interface DocumentContextOptions {
  editorValue: Value;
  userCommand: string;
  activeSelectionIndex?: number;
  tokenBudget?: number;
}

/**
 * Document context result
 */
export interface DocumentContext {
  activeSectionContent: PlateNode[] | null;
  activeSectionArticle: WillArticle | null;
  relatedSectionsSummaries: Array<{
    article: WillArticle;
    summary: string;
  }>;
  documentOutline: WillArticle[];
  estimatedTokens: number;
  formattedContext: string;
  debug?: {
    totalSections: number;
    activeSection: string | null;
    scoredSections: Array<{ article: WillArticle; score: number; reason: string }>;
  };
}

/**
 * Build optimized document context with smart section selection
 * This is the main entry point for creating document context
 */
export function buildDocumentContext(
  options: DocumentContextOptions
): DocumentContext {
  const {
    editorValue,
    userCommand,
    activeSelectionIndex,
    tokenBudget = DOCUMENT_TOKEN_BUDGETS.total,
  } = options;

  try {
    // Step 1: Detect all sections in the document
    const sections = detectSections(editorValue);

    if (sections.length === 0) {
      // No sections detected, return minimal context
      return buildMinimalContext(editorValue);
    }

    // Step 2: Find active section (where cursor is located)
    const activeSection = activeSelectionIndex !== undefined
      ? findActiveSection(sections, activeSelectionIndex)
      : null;

    // Step 3: Score sections by relevance
    const scoredSections = scoreDocumentRelevance(
      userCommand,
      sections,
      activeSection
    );

    // Step 4: Allocate token budget
    const activeBudget = Math.floor(tokenBudget * 0.47); // 47% for active section
    const relatedBudget = Math.floor(tokenBudget * 0.47); // 47% for related sections
    const outlineBudget = Math.floor(tokenBudget * 0.06); // 6% for outline

    // Step 5: Build context components
    const activeContent = buildActiveContent(
      activeSection,
      scoredSections[0],
      activeBudget
    );

    const relatedSummaries = buildRelatedSummaries(
      scoredSections,
      activeSection,
      relatedBudget
    );

    const outline = sections.map(s => s.article);

    // Step 6: Format context as markdown
    const formattedContext = formatDocumentContext(
      activeContent,
      relatedSummaries,
      outline
    );

    // Step 7: Calculate total tokens
    const estimatedTokens = estimateContextTokens(
      activeContent.content,
      relatedSummaries,
      outline
    );

    // Build debug info
    const debug = {
      totalSections: sections.length,
      activeSection: activeSection?.article || null,
      scoredSections: scoredSections.slice(0, 5).map(s => ({
        article: s.section.article,
        score: s.score,
        reason: s.reason,
      })),
    };

    console.log('[Document Context]', {
      userCommand: userCommand.substring(0, 50),
      estimatedTokens,
      tokenBudget,
      activeSectionArticle: activeContent.article,
      relatedSectionsCount: relatedSummaries.length,
      debug,
    });

    return {
      activeSectionContent: activeContent.content,
      activeSectionArticle: activeContent.article,
      relatedSectionsSummaries: relatedSummaries,
      documentOutline: outline,
      estimatedTokens,
      formattedContext,
      debug,
    };
  } catch (error) {
    console.error('Error building document context:', error);
    return buildFallbackContext(editorValue);
  }
}

/**
 * Build active section content (full detail)
 */
function buildActiveContent(
  activeSection: DetectedSection | null,
  topScoredSection: DocumentRelevanceScore,
  tokenBudget: number
): {
  article: WillArticle | null;
  content: PlateNode[] | null;
  estimatedTokens: number;
} {
  // Use active section if available, otherwise use highest scored section
  const section = activeSection || topScoredSection.section;

  if (!section) {
    return { article: null, content: null, estimatedTokens: 0 };
  }

  const tokens = estimateSectionTokens(section.content);

  // If section is too large, we'll still include it but note the size
  // (API route can decide how to handle oversized sections)
  return {
    article: section.article,
    content: section.content,
    estimatedTokens: Math.min(tokens, tokenBudget),
  };
}

/**
 * Build related sections summaries
 */
function buildRelatedSummaries(
  scoredSections: DocumentRelevanceScore[],
  activeSection: DetectedSection | null,
  tokenBudget: number
): Array<{ article: WillArticle; summary: string }> {
  // Filter out active section and zero-score sections
  const candidateSections = scoredSections.filter(
    s => s.score > 0 && (!activeSection || s.section.article !== activeSection.article)
  );

  // Convert to format needed for token budget selection
  const sectionsWithTokens = candidateSections.map(scored => ({
    content: scored.section.content,
    estimatedTokens: Math.ceil(
      compressSectionToText(scored.section.content).length / 4
    ),
    score: scored.score,
    metadata: {
      article: scored.section.article,
      originalTokens: estimateSectionTokens(scored.section.content),
    },
  }));

  // Select sections that fit within budget
  const { selected, totalTokens, excluded } = selectSectionsWithinBudget(
    sectionsWithTokens,
    tokenBudget
  );

  // Build summaries
  const summaries: Array<{ article: WillArticle; summary: string }> = [];

  for (const section of selected) {
    summaries.push({
      article: section.metadata.article,
      summary: compressSectionToText(section.content),
    });
  }

  // If there's remaining budget and excluded sections, try to compress them
  const remainingBudget = tokenBudget - totalTokens;
  if (remainingBudget > 50 && excluded.length > 0) {
    const compressed = compressSectionsToFit(excluded, remainingBudget);

    for (const comp of compressed) {
      summaries.push({
        article: comp.metadata.article,
        summary: comp.summary,
      });
    }
  }

  return summaries;
}

/**
 * Format document context as markdown
 */
function formatDocumentContext(
  activeContent: { article: WillArticle | null; content: PlateNode[] | null },
  relatedSummaries: Array<{ article: WillArticle; summary: string }>,
  outline: WillArticle[]
): string {
  const parts: string[] = [];

  // Document outline
  if (outline.length > 0) {
    parts.push('## DOCUMENT STRUCTURE\n');
    parts.push('The will contains the following articles:\n');
    parts.push(outline.map(article => `- ${article.replace(/_/g, ' ')}`).join('\n'));
    parts.push('\n');
  }

  // Active section (full detail)
  if (activeContent.article && activeContent.content) {
    parts.push(`## ACTIVE SECTION: ${activeContent.article.replace(/_/g, ' ')}\n`);
    parts.push('This is the section where the user is currently editing:\n');
    parts.push('```\n');
    parts.push(compressSectionToText(activeContent.content));
    parts.push('\n```\n\n');
  }

  // Related sections (summaries)
  if (relatedSummaries.length > 0) {
    parts.push('## RELATED SECTIONS\n');
    parts.push('Context from other relevant sections:\n\n');

    for (const { article, summary } of relatedSummaries) {
      parts.push(`### ${article.replace(/_/g, ' ')}\n`);
      parts.push(summary);
      parts.push('\n\n');
    }
  }

  return parts.join('');
}

/**
 * Estimate total tokens for context
 */
function estimateContextTokens(
  activeContent: PlateNode[] | null,
  relatedSummaries: Array<{ article: WillArticle; summary: string }>,
  outline: WillArticle[]
): number {
  let total = 0;

  // Outline tokens
  total += outline.length * 5; // ~5 tokens per article name

  // Active section tokens
  if (activeContent) {
    total += estimateSectionTokens(activeContent);
  }

  // Related summaries tokens
  for (const { summary } of relatedSummaries) {
    total += Math.ceil(summary.length / 4);
  }

  // Markdown formatting overhead
  total += 100;

  return total;
}

/**
 * Build minimal context when no sections detected
 */
function buildMinimalContext(editorValue: Value): DocumentContext {
  const nodes = editorValue as PlateNode[];
  const text = compressSectionToText(nodes);
  const tokens = Math.ceil(text.length / 4);

  return {
    activeSectionContent: null,
    activeSectionArticle: null,
    relatedSectionsSummaries: [],
    documentOutline: [],
    estimatedTokens: tokens,
    formattedContext: `## DOCUMENT CONTENT\n\n${text}`,
  };
}

/**
 * Build fallback context (full document, compressed)
 */
function buildFallbackContext(editorValue: Value): DocumentContext {
  const nodes = editorValue as PlateNode[];
  const text = compressSectionToText(nodes);
  const tokens = Math.ceil(text.length / 4);

  console.warn('[Document Context] Using fallback context (full document)');

  return {
    activeSectionContent: nodes,
    activeSectionArticle: null,
    relatedSectionsSummaries: [],
    documentOutline: [],
    estimatedTokens: tokens,
    formattedContext: `## FULL DOCUMENT (COMPRESSED)\n\n${text}`,
  };
}
