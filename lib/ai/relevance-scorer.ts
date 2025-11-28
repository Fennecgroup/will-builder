// AI Context Relevance Scoring
// Determines which sections of will content are relevant to the user's request

import type { WillContent } from '@/lib/types/will';
import type { RelevanceScore } from './types';
import { CONTEXT_RULES } from './types';

/**
 * Score the relevance of each WillContent section based on the user's action and selected text
 * Returns an array of sections sorted by relevance (highest first)
 */
export function scoreRelevance(
  action: string,
  selectedText: string,
  willContent: WillContent
): RelevanceScore[] {
  const queryText = `${action} ${selectedText}`.toLowerCase();
  const scores: Map<keyof WillContent, RelevanceScore> = new Map();

  // Initialize scores for all potentially relevant sections
  const sections: (keyof WillContent)[] = [
    'marriage',
    'assets',
    'beneficiaries',
    'executors',
    'witnesses',
    'guardians',
    'liabilities',
    'funeralWishes',
    'digitalAssets',
    'specificBequests',
    'minorBeneficiaryProvisions',
    'residuaryClause',
    'revocationClause',
    'attestationClause',
    'specialInstructions',
  ];

  sections.forEach(section => {
    scores.set(section, { section, score: 0, matchedKeywords: [] });
  });

  // Score based on context rules (keyword matching)
  Object.entries(CONTEXT_RULES).forEach(([ruleName, rule]) => {
    rule.keywords.forEach(keyword => {
      if (queryText.includes(keyword)) {
        rule.sections.forEach(section => {
          const current = scores.get(section);
          if (current) {
            current.score += 10;
            if (!current.matchedKeywords.includes(keyword)) {
              current.matchedKeywords.push(keyword);
            }
          }
        });
      }
    });
  });

  // Boost score if section name mentioned directly
  scores.forEach((scoreObj, section) => {
    const sectionName = section.toLowerCase();
    if (queryText.includes(sectionName)) {
      scoreObj.score += 20;
    }
  });

  // Additional contextual scoring based on content analysis
  applyContextualScoring(queryText, willContent, scores);

  // Convert to array, filter out zero scores, and sort by score (highest first)
  return Array.from(scores.values())
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score);
}

/**
 * Apply additional contextual scoring based on the actual will content
 */
function applyContextualScoring(
  queryText: string,
  willContent: WillContent,
  scores: Map<keyof WillContent, RelevanceScore>
): void {
  // If asking about minors and there are minor children, boost relevant sections
  if ((queryText.includes('minor') || queryText.includes('child')) && willContent.marriage?.children) {
    const hasMinors = willContent.marriage.children.some(child => child.isMinor);
    if (hasMinors) {
      boostScore(scores, 'guardians', 15);
      boostScore(scores, 'minorBeneficiaryProvisions', 15);
    }
  }

  // If asking about debt/loans and there are liabilities, boost liabilities section
  if ((queryText.includes('debt') || queryText.includes('loan') || queryText.includes('owe')) &&
      willContent.liabilities && willContent.liabilities.length > 0) {
    boostScore(scores, 'liabilities', 15);
  }

  // If asking about specific asset types
  if (willContent.assets && willContent.assets.length > 0) {
    const assetKeywords = ['house', 'home', 'property', 'vehicle', 'car', 'bank', 'account'];
    if (assetKeywords.some(keyword => queryText.includes(keyword))) {
      boostScore(scores, 'assets', 10);
    }
  }

  // If asking about distribution and beneficiaries exist
  if ((queryText.includes('distribute') || queryText.includes('divide') || queryText.includes('split')) &&
      willContent.beneficiaries && willContent.beneficiaries.length > 0) {
    boostScore(scores, 'beneficiaries', 15);
    boostScore(scores, 'residuaryClause', 10);
  }

  // If asking about execution/signing
  if (queryText.includes('sign') || queryText.includes('execute') || queryText.includes('valid')) {
    boostScore(scores, 'executors', 10);
    boostScore(scores, 'witnesses', 15);
    boostScore(scores, 'attestationClause', 10);
  }

  // If asking about revocation or updating
  if (queryText.includes('revoke') || queryText.includes('update') || queryText.includes('previous')) {
    boostScore(scores, 'revocationClause', 15);
  }
}

/**
 * Helper to boost a section's score
 */
function boostScore(
  scores: Map<keyof WillContent, RelevanceScore>,
  section: keyof WillContent,
  points: number
): void {
  const scoreObj = scores.get(section);
  if (scoreObj) {
    scoreObj.score += points;
  }
}
