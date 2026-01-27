// Document Relevance Scoring
// Determines which sections of the document are relevant to the user's command

import type { WillArticle, DetectedSection } from '@/lib/auto-fill/types';

/**
 * Relevance score for a document section
 */
export interface DocumentRelevanceScore {
  section: DetectedSection;
  score: number;
  matchedKeywords: string[];
  reason: string;
}

/**
 * Keyword patterns for different types of commands
 */
const COMMAND_KEYWORDS: Record<string, {
  keywords: string[];
  relevantArticles: WillArticle[];
  boost: number;
}> = {
  family: {
    keywords: [
      'child', 'children', 'son', 'daughter', 'minor', 'guardian', 'guardianship',
      'spouse', 'wife', 'husband', 'marriage', 'married', 'family', 'parent'
    ],
    relevantArticles: ['FAMILY_INFO', 'GUARDIANS', 'MINOR_PROVISIONS'],
    boost: 30,
  },
  executors: {
    keywords: [
      'executor', 'executors', 'execute', 'administer', 'administration', 'manage',
      'manager', 'appoint', 'appointment'
    ],
    relevantArticles: ['EXECUTORS'],
    boost: 30,
  },
  beneficiaries: {
    keywords: [
      'beneficiary', 'beneficiaries', 'inherit', 'inheritance', 'receive', 'bequest',
      'bequests', 'allocation', 'distribute', 'distribution', 'leave', 'legacy'
    ],
    relevantArticles: ['SPECIFIC_BEQUESTS', 'RESIDUARY_ESTATE'],
    boost: 30,
  },
  assets: {
    keywords: [
      'asset', 'assets', 'property', 'properties', 'estate', 'value', 'vehicle',
      'house', 'home', 'bank', 'account', 'investment', 'money', 'worth', 'wealth'
    ],
    relevantArticles: ['SPECIFIC_BEQUESTS', 'RESIDUARY_ESTATE'],
    boost: 25,
  },
  revocation: {
    keywords: [
      'revoke', 'revocation', 'cancel', 'previous', 'prior', 'earlier', 'old'
    ],
    relevantArticles: ['REVOCATION'],
    boost: 30,
  },
  declaration: {
    keywords: [
      'declare', 'declaration', 'testamentary', 'capacity', 'sound', 'mind'
    ],
    relevantArticles: ['DECLARATION'],
    boost: 25,
  },
  usufruct: {
    keywords: [
      'usufruct', 'life', 'interest', 'lifetime', 'use', 'enjoyment'
    ],
    relevantArticles: ['USUFRUCT_BEQUESTS'],
    boost: 30,
  },
  residuary: {
    keywords: [
      'residuary', 'residue', 'remainder', 'rest', 'remaining', 'leftover'
    ],
    relevantArticles: ['RESIDUARY_ESTATE'],
    boost: 30,
  },
  exclusions: {
    keywords: [
      'exclude', 'exclusion', 'community', 'property', 'accrual', 'protect'
    ],
    relevantArticles: ['INHERITANCE_EXCLUSIONS'],
    boost: 25,
  },
  repudiation: {
    keywords: [
      'repudiate', 'repudiation', 'refuse', 'reject', 'decline'
    ],
    relevantArticles: ['RIGHT_OF_REPUDIATION'],
    boost: 25,
  },
  jointAssets: {
    keywords: [
      'joint', 'jointly', 'together', 'agree', 'agreement', 'divide', 'division'
    ],
    relevantArticles: ['JOINT_ASSET_CLAUSE'],
    boost: 25,
  },
  collation: {
    keywords: [
      'collation', 'advance', 'gift', 'donation', 'inter', 'vivos'
    ],
    relevantArticles: ['COLLATION_EXCLUSION'],
    boost: 25,
  },
  livingWill: {
    keywords: [
      'living', 'will', 'medical', 'directive', 'treatment', 'resuscitation',
      'life', 'support', 'artificial'
    ],
    relevantArticles: ['LIVING_WILL'],
    boost: 30,
  },
  attestation: {
    keywords: [
      'attest', 'attestation', 'witness', 'witnesses', 'sign', 'signature',
      'execute', 'execution'
    ],
    relevantArticles: ['ATTESTATION'],
    boost: 30,
  },
};

/**
 * Score document sections based on relevance to user command
 * @param userCommand The user's command/request
 * @param sections Detected sections from document
 * @param activeSection The section where cursor is located (if any)
 * @returns Array of sections with relevance scores (sorted by score, highest first)
 */
export function scoreDocumentRelevance(
  userCommand: string,
  sections: DetectedSection[],
  activeSection: DetectedSection | null
): DocumentRelevanceScore[] {
  const commandLower = userCommand.toLowerCase();
  const scores: DocumentRelevanceScore[] = [];

  for (const section of sections) {
    let score = 0;
    const matchedKeywords: string[] = [];
    let reason = '';

    // Active section gets highest priority
    if (activeSection && section.article === activeSection.article) {
      score += 50;
      reason = 'active section (cursor location)';
    }

    // Check keyword matches
    for (const [category, config] of Object.entries(COMMAND_KEYWORDS)) {
      // Check if command contains any keywords from this category
      const categoryMatches = config.keywords.filter(keyword =>
        commandLower.includes(keyword)
      );

      if (categoryMatches.length > 0) {
        matchedKeywords.push(...categoryMatches);

        // If this section is relevant to the category, boost score
        if (config.relevantArticles.includes(section.article)) {
          score += config.boost;

          if (!reason) {
            reason = `matches ${category} keywords`;
          }
        }
      }
    }

    // Check if section name is directly mentioned
    const articleName = section.article.toLowerCase().replace(/_/g, ' ');
    if (commandLower.includes(articleName)) {
      score += 20;
      if (!reason) {
        reason = 'section name mentioned';
      }
    }

    // Adjacent sections get small boost (context)
    if (activeSection) {
      const activeSectionIndex = sections.findIndex(s => s.article === activeSection.article);
      const currentSectionIndex = sections.findIndex(s => s.article === section.article);

      if (Math.abs(activeSectionIndex - currentSectionIndex) === 1) {
        score += 10;
        if (!reason) {
          reason = 'adjacent to active section';
        }
      }
    }

    // PREAMBLE is often useful for context
    if (section.article === 'PREAMBLE' && score === 0) {
      score += 5;
      reason = 'preamble (general context)';
    }

    scores.push({
      section,
      score,
      matchedKeywords: [...new Set(matchedKeywords)], // Remove duplicates
      reason: reason || 'no specific match',
    });
  }

  // Sort by score (highest first)
  return scores.sort((a, b) => b.score - a.score);
}

/**
 * Find active section based on selection index
 * @param sections Detected sections
 * @param selectionIndex Current cursor/selection position
 * @returns Active section or null
 */
export function findActiveSection(
  sections: DetectedSection[],
  selectionIndex: number
): DetectedSection | null {
  return sections.find(
    section => selectionIndex >= section.startIndex && selectionIndex <= section.endIndex
  ) || null;
}
