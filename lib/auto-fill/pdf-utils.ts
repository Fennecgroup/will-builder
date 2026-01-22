// PDF Article Numbering Utilities
// Provides dynamic article numbering for PDF exports

import { WillContent } from '@/lib/types/will';
import { WillArticle, ARTICLE_TITLES_EDITOR } from './types';

/**
 * Determines which articles should be present based on WillContent data
 * Returns articles in the order they should appear
 */
export function getPresentArticles(content: WillContent): WillArticle[] {
  const present: WillArticle[] = ['PREAMBLE']; // Always present

  // Conditional articles - only include if data exists
  if (content.revocationClause) present.push('REVOCATION');
  if (content.testator) present.push('DECLARATION');
  if (content.marriage) present.push('FAMILY_INFO');
  if (content.executors?.length > 0) present.push('EXECUTORS');
  if (content.guardians?.length > 0) present.push('GUARDIANS');
  if (content.minorBeneficiaryProvisions) present.push('MINOR_PROVISIONS');

  // Check for usufruct in assets
  const hasUsufruct = content.assets?.some(asset => asset.usufruct);
  if (hasUsufruct) present.push('USUFRUCT_BEQUESTS');

  if (content.specificBequests && content.specificBequests.length > 0) present.push('SPECIFIC_BEQUESTS');

  // RESIDUARY_ESTATE can be present via beneficiaries list or residuary clause text
  if ((content.beneficiaries && content.beneficiaries.length > 0) || content.residuaryClause) present.push('RESIDUARY_ESTATE');

  // Check for optional clauses
  // Note: These fields may not exist in current WillContent, so we check carefully
  // Future implementation will add these optional clause types

  // Living Will - check both optionalClauses and livingWillDirectives
  const hasLivingWill = content.livingWillDirectives ||
    content.optionalClauses?.some(c => c.clauseType === 'living-will' && c.isSelected);
  if (hasLivingWill) present.push('LIVING_WILL');

  present.push('ATTESTATION'); // Always present

  return present;
}

/**
 * Converts a number to a Roman numeral (1-20)
 * Supports sequential article numbering
 */
function toRoman(num: number): string {
  const romanNumerals: [number, string][] = [
    [20, 'XX'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I']
  ];

  let result = '';
  let remaining = num;

  for (const [value, numeral] of romanNumerals) {
    while (remaining >= value) {
      result += numeral;
      remaining -= value;
    }
  }

  return result;
}

/**
 * Gets the clean article name without numbering
 * Uses ARTICLE_TITLES_EDITOR as the source of truth
 */
function getArticleName(article: WillArticle): string {
  return ARTICLE_TITLES_EDITOR[article];
}

/**
 * Creates dynamic article titles with sequential numbering for PDF export
 * Articles are numbered sequentially based on which ones are present
 *
 * @param presentArticles - Array of articles that should appear in the PDF
 * @returns Record mapping each article to its numbered title (for PDF display)
 *
 * @example
 * // If only PREAMBLE, REVOCATION, DECLARATION, EXECUTORS, ATTESTATION are present:
 * // Returns titles with sequential numbering I, II, III (skipping missing articles)
 */
export function createPdfArticleTitles(
  presentArticles: WillArticle[]
): Record<WillArticle, string> {
  const titles: Partial<Record<WillArticle, string>> = {};

  // PREAMBLE and ATTESTATION don't get numbered
  titles.PREAMBLE = 'PREAMBLE';
  titles.ATTESTATION = 'ATTESTATION AND SIGNATURES';

  // Filter to only numbered articles (exclude PREAMBLE and ATTESTATION)
  const numberedArticles = presentArticles.filter(
    a => a !== 'PREAMBLE' && a !== 'ATTESTATION'
  );

  // Assign sequential Roman numerals to numbered articles
  numberedArticles.forEach((article, index) => {
    const romanNumeral = toRoman(index + 1);
    const name = getArticleName(article);
    titles[article] = `ARTICLE ${romanNumeral} - ${name}`;
  });

  return titles as Record<WillArticle, string>;
}
