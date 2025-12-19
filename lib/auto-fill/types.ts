// Auto-Fill System Type Definitions

import { WillContent } from '@/lib/types/will';

/**
 * Will Article Types
 * Represents the different sections/articles in a South African will
 */
export type WillArticle =
  | 'PREAMBLE'            // Opening section with testator details
  | 'REVOCATION'          // Article I
  | 'DECLARATION'         // Article II
  | 'FAMILY_INFO'         // Article III
  | 'EXECUTORS'           // Article IV
  | 'GUARDIANS'           // Article V
  | 'MINOR_PROVISIONS'    // Article VI
  | 'SPECIFIC_BEQUESTS'   // Article VII (Phase 1 focus)
  | 'RESIDUARY_ESTATE'    // Article VIII (Phase 1 focus)
  | 'ATTESTATION';

/**
 * Plate.js Node Types
 * Simplified interface for Plate.js document nodes
 */
export interface PlateNode {
  type: string;  // 'h1', 'h2', 'h3', 'p', 'ul', 'li', etc.
  children: Array<PlateNode | PlateText>;
  [key: string]: any;  // Allow additional properties for Plate.js compatibility
}

/**
 * Plate.js Text Node
 * Represents text content with optional formatting marks
 */
export interface PlateText {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  [key: string]: any;  // Allow additional marks
}

/**
 * Will Section
 * Represents a generated will section with metadata
 */
export interface WillSection {
  article: WillArticle;
  title: string;  // e.g., "ARTICLE VII - SPECIFIC BEQUESTS"
  content: PlateNode[];
  metadata: {
    generatedAt: Date;
    sourceData: string[];  // Asset/beneficiary IDs used in generation
    version: number;
  };
}

/**
 * Generator Context
 * Context information passed to generators
 */
export interface GeneratorContext {
  willContent: WillContent;
  currency: string;  // Default currency for formatting
  jurisdiction: 'ZA' | 'US';  // Legal jurisdiction
}

/**
 * Detected Section
 * Information about an existing section found in the editor
 */
export interface DetectedSection {
  article: WillArticle;
  startIndex: number;  // Starting index in editor Value array
  endIndex: number;    // Ending index in editor Value array
  hasManualEdits: boolean;  // Heuristic: true if non-standard formatting detected
  content: PlateNode[];  // The actual content nodes
}

/**
 * Diff Result
 * Result of comparing existing vs generated content
 */
export interface DiffResult {
  hasChanges: boolean;
  unifiedDiff: string;  // Git-style unified diff
  additions: number;
  deletions: number;
  modifications: number;
  existingContent: PlateNode[];
  generatedContent: PlateNode[];
}

/**
 * Auto-Fill Suggestion
 * A suggestion to auto-fill a section
 */
export interface AutoFillSuggestion {
  section: WillSection;
  existingContent: PlateNode[] | null;  // null if section doesn't exist
  generatedContent: PlateNode[];
  diff: DiffResult | null;  // null if no existing content to compare
  canAutoApply: boolean;  // true if safe to apply without user review
}

/**
 * Auto-Fill Options
 * Configuration options for the auto-fill system
 */
export interface AutoFillOptions {
  mode: 'suggestion' | 'auto-insert' | 'replace';
  sections?: WillArticle[];  // If specified, only generate these sections
  mergeStrategy: 'append' | 'replace' | 'skip-if-exists';
}

/**
 * Beneficiary Allocation
 * For convenience when working with allocations
 */
export interface BeneficiaryAllocation {
  beneficiaryId: string;
  percentage: number;
}

/**
 * Validation Result
 * Result of validating an asset allocation or beneficiary distribution
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Article Mapping
 * Maps article types to their standard titles
 */
export const ARTICLE_TITLES: Record<WillArticle, string> = {
  PREAMBLE: 'PREAMBLE',
  REVOCATION: 'ARTICLE I - REVOCATION',
  DECLARATION: 'ARTICLE II - DECLARATION',
  FAMILY_INFO: 'ARTICLE III - FAMILY INFORMATION',
  EXECUTORS: 'ARTICLE IV - APPOINTMENT OF EXECUTOR',
  GUARDIANS: 'ARTICLE V - GUARDIANSHIP',
  MINOR_PROVISIONS: 'ARTICLE VI - MINOR BENEFICIARY PROVISIONS',
  SPECIFIC_BEQUESTS: 'ARTICLE VII - SPECIFIC BEQUESTS',
  RESIDUARY_ESTATE: 'ARTICLE VIII - RESIDUARY ESTATE',
  ATTESTATION: 'ATTESTATION AND SIGNATURES',
};

/**
 * Article Order
 * Defines the canonical order of articles in a will
 */
export const ARTICLE_ORDER: WillArticle[] = [
  'PREAMBLE',
  'REVOCATION',
  'DECLARATION',
  'FAMILY_INFO',
  'EXECUTORS',
  'GUARDIANS',
  'MINOR_PROVISIONS',
  'SPECIFIC_BEQUESTS',
  'RESIDUARY_ESTATE',
  'ATTESTATION',
];

