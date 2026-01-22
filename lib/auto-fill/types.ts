// Auto-Fill System Type Definitions

import { WillContent, Asset, Beneficiary, SpecificBequest } from '@/lib/types/will';
import type { Value } from '@udecode/plate';

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
  | 'USUFRUCT_BEQUESTS'   // Article VII - Usufruct arrangements
  | 'SPECIFIC_BEQUESTS'   // Article VIII - Specific bequests (was VII)
  | 'RESIDUARY_ESTATE'    // Article IX - Residuary estate (was VIII)
  | 'INHERITANCE_EXCLUSIONS'  // Article X - Protection from community of property (was IX)
  | 'RIGHT_OF_REPUDIATION'    // Article XI - Right to repudiate inheritance (was X)
  | 'JOINT_ASSET_CLAUSE'      // Article XII - Joint asset division agreement (was XI)
  | 'COLLATION_EXCLUSION'     // Article XIII - Collation exclusion (was XII)
  | 'LIVING_WILL'             // Article XIV - Living Will (medical directives)
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
  mode?: 'suggestion' | 'auto-insert' | 'replace';
  sections?: WillArticle[];  // If specified, only generate these sections
  mergeStrategy?: 'append' | 'replace' | 'skip-if-exists';
  onlyFullAllocations?: boolean;  // Only generate bequests for 100% allocations (default: true)
  skipExisting?: boolean;  // Skip generating bequests for assets that already have bequests (default: true)
  updateEditorContent?: boolean;  // Update the editor content with generated bequests (default: true)
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
 * Beneficiary Asset Link
 * Represents the relationship between an asset and a beneficiary with allocation details
 */
export interface BeneficiaryAssetLink {
  assetId: string;
  asset: Asset;
  beneficiaryId: string;
  beneficiary: Beneficiary;
  percentage: number;  // 0-100 allocation percentage
}

/**
 * Auto-Fill Result
 * Result of the auto-fill operation with updated content and change tracking
 */
export interface AutoFillResult {
  newBequests: SpecificBequest[];
  updatedWillContent: WillContent;
  updatedEditorContent: Value;
  hasChanges: boolean;
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
 * Article Titles for Editor Display
 * Maps article types to their unnumbered titles (used in editor)
 */
export const ARTICLE_TITLES_EDITOR: Record<WillArticle, string> = {
  PREAMBLE: 'PREAMBLE',
  REVOCATION: 'REVOCATION',
  DECLARATION: 'DECLARATION',
  FAMILY_INFO: 'FAMILY INFORMATION',
  EXECUTORS: 'APPOINTMENT OF EXECUTOR',
  GUARDIANS: 'GUARDIANSHIP',
  MINOR_PROVISIONS: 'MINOR BENEFICIARY PROVISIONS',
  USUFRUCT_BEQUESTS: 'USUFRUCT BEQUESTS',
  SPECIFIC_BEQUESTS: 'SPECIFIC BEQUESTS',
  RESIDUARY_ESTATE: 'RESIDUARY ESTATE',
  INHERITANCE_EXCLUSIONS: 'INHERITANCE EXCLUSIONS',
  RIGHT_OF_REPUDIATION: 'RIGHT OF REPUDIATION',
  JOINT_ASSET_CLAUSE: 'JOINT ASSET CLAUSE',
  COLLATION_EXCLUSION: 'COLLATION EXCLUSION',
  LIVING_WILL: 'LIVING WILL',
  ATTESTATION: 'ATTESTATION AND SIGNATURES',
};

/**
 * Article Mapping
 * Maps article types to their standard titles (used by generators)
 * Now references the editor titles (without numbering)
 */
export const ARTICLE_TITLES: Record<WillArticle, string> = ARTICLE_TITLES_EDITOR;

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
  'USUFRUCT_BEQUESTS',
  'SPECIFIC_BEQUESTS',
  'RESIDUARY_ESTATE',
  'INHERITANCE_EXCLUSIONS',
  'RIGHT_OF_REPUDIATION',
  'JOINT_ASSET_CLAUSE',
  'COLLATION_EXCLUSION',
  'LIVING_WILL',
  'ATTESTATION',
];


