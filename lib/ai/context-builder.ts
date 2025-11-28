// AI Context Builder
// Main module for building anonymized testator context with smart selection

import type { WillContent } from '@/lib/types/will';
import type { ContextOptions, TestatorContext } from './types';
import { TOKEN_BUDGETS } from './types';
import { Anonymizer } from './anonymizer';
import { scoreRelevance } from './relevance-scorer';
import { selectSectionsWithinBudget } from './token-budget';

/**
 * Build testator context with smart section selection and anonymization
 * This is the main entry point for creating AI context
 */
export function buildTestatorContext(options: ContextOptions): TestatorContext | null {
  const { action, selectedText, willContent, interactionType } = options;

  // Validate critical data
  if (!willContent || !willContent.testator) {
    console.warn('Cannot build context: missing testator information');
    return null;
  }

  if (!willContent.testator.fullName) {
    console.warn('Cannot build context: testator name is required');
    return null;
  }

  try {
    // Step 1: Determine relevant sections using keyword matching
    const relevanceScores = scoreRelevance(action, selectedText, willContent);

    // Step 2: Select sections within token budget
    const tokenBudget = TOKEN_BUDGETS[interactionType];
    const selectedSections = selectSectionsWithinBudget(
      relevanceScores,
      willContent,
      tokenBudget
    );

    // Step 3: Anonymize selected data
    const anonymizer = new Anonymizer();
    const context = anonymizer.anonymize(willContent, selectedSections);

    // Log for debugging (no PII)
    console.log('[AI Context]', {
      interactionType,
      action,
      includedSections: context.includedSections,
      estimatedTokens: context.estimatedTokens,
      tokenBudget,
      relevantSections: relevanceScores.slice(0, 5).map(s => ({
        section: s.section,
        score: s.score,
      })),
    });

    return context;
  } catch (error) {
    console.error('Error building testator context:', error);
    return null;
  }
}

/**
 * Build minimal context for copilot (autocomplete)
 * Only includes basic names for speed
 */
export function buildMinimalContext(willContent: WillContent): string {
  if (!willContent || !willContent.testator) {
    return '';
  }

  const parts: string[] = [];

  // Testator name
  if (willContent.testator.fullName) {
    parts.push(`Testator: ${willContent.testator.fullName}`);
  }

  // Spouse name
  if (willContent.marriage?.spouse?.fullName) {
    parts.push(`Spouse: ${willContent.marriage.spouse.fullName}`);
  }

  // Children count
  if (willContent.marriage?.children && willContent.marriage.children.length > 0) {
    parts.push(`Children: ${willContent.marriage.children.length}`);

    // Add first names of children
    const childNames = willContent.marriage.children.map(c => c.fullName).join(', ');
    parts.push(`Child names: ${childNames}`);
  }

  // Beneficiary count
  if (willContent.beneficiaries && willContent.beneficiaries.length > 0) {
    parts.push(`Beneficiaries: ${willContent.beneficiaries.length}`);
  }

  return parts.join('. ');
}

/**
 * De-anonymize text using token map
 * Wrapper around Anonymizer.deAnonymize for convenience
 */
export function deAnonymizeText(
  text: string,
  tokenMap: Record<string, string> | Map<string, string>
): string {
  const anonymizer = new Anonymizer();
  const mapInstance = tokenMap instanceof Map
    ? tokenMap
    : new Map(Object.entries(tokenMap));

  return anonymizer.deAnonymize(text, mapInstance);
}
