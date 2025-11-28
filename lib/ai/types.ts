// AI Context - TypeScript Type Definitions

import { WillContent } from '@/lib/types/will';

/**
 * Mapping between anonymization tokens and actual values
 * Used to de-anonymize AI responses before displaying to users
 */
export interface TokenMapping {
  token: string;        // e.g., "[TESTATOR]", "[SPOUSE]", "[CHILD-1]"
  actualValue: string;  // e.g., "Thabo Johannes Molefe"
  type: 'name' | 'id' | 'address' | 'phone' | 'email' | 'account';
}

/**
 * Built context containing anonymized testator data and token mappings
 */
export interface TestatorContext {
  contextData: string;                    // Anonymized markdown-formatted data for AI
  tokenMap: Map<string, string>;         // Token → actual value mapping
  includedSections: (keyof WillContent)[]; // Sections included in this context
  estimatedTokens: number;               // Approximate token count
  warning?: string;                      // Optional warning if data is incomplete
}

/**
 * Interaction type for token budget allocation
 */
export type InteractionType = 'command' | 'chat' | 'copilot';

/**
 * Options for building testator context
 */
export interface ContextOptions {
  action: string;                       // e.g., 'improve', 'generate', 'chat'
  selectedText: string;                 // Currently selected text in editor
  willContent: WillContent;             // Full testator data
  interactionType: InteractionType;     // Type of AI interaction
  conversationHistory?: Array<{         // For chat context
    role: 'user' | 'assistant';
    content: string;
  }>;
}

/**
 * Token budget limits by interaction type
 */
export const TOKEN_BUDGETS: Record<InteractionType, number> = {
  command: 2000,   // Comprehensive context for commands
  chat: 1500,      // Conversational context for chat
  copilot: 300,    // Lightweight context for autocomplete
};

/**
 * Relevance score for a WillContent section
 */
export interface RelevanceScore {
  section: keyof WillContent;
  score: number;
  matchedKeywords: string[];
}

/**
 * Context rule for keyword-based section selection
 */
export interface ContextRule {
  keywords: string[];
  sections: (keyof WillContent)[];
  maxTokens: number;
}

/**
 * Context rules mapping categories to keywords and sections
 */
export const CONTEXT_RULES: Record<string, ContextRule> = {
  family: {
    keywords: [
      'child', 'children', 'son', 'daughter', 'minor', 'guardian', 'guardianship',
      'spouse', 'wife', 'husband', 'marriage', 'married', 'family', 'parent'
    ],
    sections: ['marriage', 'guardians', 'minorBeneficiaryProvisions'],
    maxTokens: 600,
  },
  assets: {
    keywords: [
      'asset', 'assets', 'property', 'properties', 'estate', 'value', 'vehicle',
      'house', 'home', 'bank', 'account', 'investment', 'money', 'worth', 'wealth'
    ],
    sections: ['assets', 'liabilities', 'specificBequests'],
    maxTokens: 1000,
  },
  inheritance: {
    keywords: [
      'beneficiary', 'beneficiaries', 'inherit', 'inheritance', 'receive', 'bequest',
      'bequests', 'allocation', 'distribute', 'distribution', 'leave', 'legacy'
    ],
    sections: ['beneficiaries', 'specificBequests', 'residuaryClause'],
    maxTokens: 700,
  },
  administration: {
    keywords: [
      'executor', 'executors', 'execute', 'administer', 'administration', 'manage',
      'manager', 'witness', 'witnesses', 'sign', 'signature', 'attest', 'attestation'
    ],
    sections: ['executors', 'witnesses', 'attestationClause'],
    maxTokens: 500,
  },
  wishes: {
    keywords: [
      'funeral', 'burial', 'cremation', 'cremated', 'buried', 'wishes', 'ceremony',
      'digital', 'online', 'account', 'social', 'media', 'email', 'password'
    ],
    sections: ['funeralWishes', 'digitalAssets'],
    maxTokens: 400,
  },
};
