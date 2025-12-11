// AI Context Token Budget Management
// Ensures context stays within API token limits

import type { WillContent, MarriageInfo, Asset, Beneficiary, Executor, Witness, Guardian, Liability, DigitalAsset } from '@/lib/types/will';
import type { RelevanceScore } from './types';

/**
 * Token estimation functions for each WillContent section
 * These are rough estimates based on typical content sizes (1 token ≈ 4 characters)
 */
const SECTION_TOKEN_ESTIMATES: Record<keyof WillContent, (content: any, willContent?: WillContent) => number> = {
  willType: () => 5,  // Will type (individual/mutual/joint)

  testator: () => 150,  // Basic testator info

  maritalStatus: () => 10,  // Marital status

  marriage: (marriage: MarriageInfo) => {
    let tokens = 100;  // Base marriage info
    if (marriage.spouses && marriage.spouses.length > 0) {
      tokens += marriage.spouses.length * 40;  // ~40 tokens per spouse
    }
    return tokens;
  },

  children: (children: any[]) => {
    return 80 + (children.length * 50);  // Base + per child
  },

  assets: (assets: Asset[]) => {
    return 100 + (assets.length * 60);  // Base + per asset
  },

  beneficiaries: (beneficiaries: Beneficiary[]) => {
    return 80 + (beneficiaries.length * 50);  // Base + per beneficiary
  },

  executors: (executors: Executor[]) => {
    return 70 + (executors.length * 60);  // Base + per executor
  },

  witnesses: (witnesses: Witness[]) => {
    return 60 + (witnesses.length * 50);  // Base + per witness
  },

  guardians: (guardians: Guardian[]) => {
    return 70 + (guardians.length * 60);  // Base + per guardian
  },

  liabilities: (liabilities: Liability[]) => {
    return 80 + (liabilities.length * 45);  // Base + per liability
  },

  funeralWishes: () => 100,  // Funeral wishes section

  digitalAssets: (assets: DigitalAsset[]) => {
    return 60 + (assets.length * 35);  // Base + per digital asset
  },

  specificBequests: (bequests: any[]) => {
    return 70 + ((bequests?.length || 0) * 45);  // Base + per bequest
  },

  minorBeneficiaryProvisions: () => 120,  // Minor provisions

  revocationClause: () => 40,  // Revocation clause

  residuaryClause: () => 50,  // Residuary clause

  attestationClause: () => 60,  // Attestation clause

  specialInstructions: () => 150,  // Special instructions

  dateExecuted: () => 10,  // Execution date

  placeExecuted: () => 10,  // Execution place
};

/**
 * Select sections from relevance scores that fit within the token budget
 * Prioritizes sections by relevance score and token efficiency
 */
export function selectSectionsWithinBudget(
  relevanceScores: RelevanceScore[],
  willContent: WillContent,
  maxTokens: number
): (keyof WillContent)[] {
  const selected: (keyof WillContent)[] = ['testator'];  // Always include testator
  let currentTokens = SECTION_TOKEN_ESTIMATES.testator(willContent.testator, willContent);

  // Add sections in order of relevance until budget exhausted
  for (const { section } of relevanceScores) {
    // Skip if already selected or if section doesn't exist in WillContent
    if (selected.includes(section)) continue;

    const sectionContent = willContent[section];

    // Skip if section has no content
    if (!sectionContent) continue;
    if (Array.isArray(sectionContent) && sectionContent.length === 0) continue;
    if (typeof sectionContent === 'object' && Object.keys(sectionContent).length === 0) continue;

    // Estimate tokens for this section
    const estimator = SECTION_TOKEN_ESTIMATES[section];
    if (!estimator) continue;

    const estimate = typeof estimator === 'function'
      ? estimator(sectionContent, willContent)
      : estimator;

    // Add section if it fits within budget
    if (currentTokens + estimate <= maxTokens) {
      selected.push(section);
      currentTokens += estimate;
    } else {
      // Budget exceeded, check if we should stop or continue
      // Continue to see if smaller sections can still fit
      if (estimate > 200) {
        // Large section won't fit, continue to check smaller ones
        continue;
      } else {
        // Even small sections don't fit, stop searching
        break;
      }
    }
  }

  // If no relevant sections found and budget allows, add high-priority sections
  if (selected.length === 1 && currentTokens + 500 < maxTokens) {
    const prioritySections: (keyof WillContent)[] = ['marriage', 'beneficiaries', 'assets'];

    for (const section of prioritySections) {
      if (selected.includes(section)) continue;

      const sectionContent = willContent[section];
      if (!sectionContent) continue;
      if (Array.isArray(sectionContent) && sectionContent.length === 0) continue;

      const estimator = SECTION_TOKEN_ESTIMATES[section];
      if (!estimator) continue;

      const estimate = estimator(sectionContent, willContent);

      if (currentTokens + estimate <= maxTokens) {
        selected.push(section);
        currentTokens += estimate;
      }
    }
  }

  return selected;
}

/**
 * Estimate total tokens for selected sections
 */
export function estimateTotalTokens(
  sections: (keyof WillContent)[],
  willContent: WillContent
): number {
  let total = 0;

  for (const section of sections) {
    const sectionContent = willContent[section];
    if (!sectionContent) continue;

    const estimator = SECTION_TOKEN_ESTIMATES[section];
    if (!estimator) continue;

    total += estimator(sectionContent, willContent);
  }

  return total;
}
