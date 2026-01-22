// Section Detector - Parse Plate.js editor content to find existing articles

import type { Value } from '@udecode/plate';
import {
  WillArticle,
  DetectedSection,
  PlateNode,
  ARTICLE_TITLES,
} from './types';

/**
 * Article Detection Patterns
 * Regular expressions to match article headings
 */
const ARTICLE_PATTERNS: Record<WillArticle, RegExp[]> = {
  PREAMBLE: [
    /LAST\s+WILL\s+AND\s+TESTAMENT/i,
    /PREAMBLE/i,
    /TESTATOR\s*[:]/i,
  ],
  REVOCATION: [
    /ARTICLE\s+I\s*[-:]?\s*REVOCATION/i,          // Legacy: "ARTICLE I - REVOCATION"
    /ARTICLE\s+1\s*[-:]?\s*REVOCATION/i,          // Legacy: "ARTICLE 1 - REVOCATION"
    /^REVOCATION\s*$/i,                            // New: "REVOCATION"
    /REVOCATION\s+OF\s+PREVIOUS\s+WILLS/i,        // Alternative
  ],
  DECLARATION: [
    /ARTICLE\s+II\s*[-:]?\s*DECLARATION/i,        // Legacy: "ARTICLE II - DECLARATION"
    /ARTICLE\s+2\s*[-:]?\s*DECLARATION/i,         // Legacy: "ARTICLE 2 - DECLARATION"
    /^DECLARATION\s*$/i,                           // New: "DECLARATION"
  ],
  FAMILY_INFO: [
    /ARTICLE\s+III\s*[-:]?\s*FAMILY/i,            // Legacy
    /ARTICLE\s+3\s*[-:]?\s*FAMILY/i,              // Legacy
    /^FAMILY\s+INFORMATION\s*$/i,                  // New: "FAMILY INFORMATION"
    /FAMILY\s+INFORMATION/i,                       // General match
  ],
  EXECUTORS: [
    /ARTICLE\s+IV\s*[-:]?\s*EXECUTOR/i,           // Legacy
    /ARTICLE\s+4\s*[-:]?\s*EXECUTOR/i,            // Legacy
    /^APPOINTMENT\s+OF\s+EXECUTOR\s*$/i,           // New: "APPOINTMENT OF EXECUTOR"
    /APPOINTMENT\s+OF\s+EXECUTOR/i,                // General match
  ],
  GUARDIANS: [
    /ARTICLE\s+V\s*[-:]?\s*GUARDIAN/i,            // Legacy
    /ARTICLE\s+5\s*[-:]?\s*GUARDIAN/i,            // Legacy
    /^GUARDIANSHIP\s*$/i,                          // New: "GUARDIANSHIP"
    /GUARDIANSHIP/i,                               // General match
  ],
  MINOR_PROVISIONS: [
    /ARTICLE\s+VI\s*[-:]?\s*MINOR/i,              // Legacy
    /ARTICLE\s+6\s*[-:]?\s*MINOR/i,               // Legacy
    /^MINOR\s+BENEFICIARY\s+PROVISIONS\s*$/i,      // New: "MINOR BENEFICIARY PROVISIONS"
    /MINOR\s+BENEFICIARY\s+PROVISIONS/i,           // General match
  ],
  USUFRUCT_BEQUESTS: [
    /ARTICLE\s+VII\s*[-:]?\s*USUFRUCT/i,          // Legacy
    /ARTICLE\s+7\s*[-:]?\s*USUFRUCT/i,            // Legacy
    /^USUFRUCT\s+BEQUESTS\s*$/i,                   // New: "USUFRUCT BEQUESTS"
    /USUFRUCT\s+BEQUESTS/i,                        // General match
    /USUFRUCT\s+ARRANGEMENTS/i,                    // Alternative
  ],
  SPECIFIC_BEQUESTS: [
    /ARTICLE\s+VIII\s*[-:]?\s*SPECIFIC/i,         // Legacy (Article VIII)
    /ARTICLE\s+VII\s*[-:]?\s*SPECIFIC/i,          // Legacy (Article VII - old numbering)
    /ARTICLE\s+8\s*[-:]?\s*SPECIFIC/i,            // Legacy
    /ARTICLE\s+7\s*[-:]?\s*SPECIFIC/i,            // Legacy
    /^SPECIFIC\s+BEQUESTS\s*$/i,                   // New: "SPECIFIC BEQUESTS"
    /SPECIFIC\s+BEQUESTS/i,                        // General match
    /SPECIFIC\s+LEGACIES/i,                        // Alternative
  ],
  RESIDUARY_ESTATE: [
    /ARTICLE\s+IX\s*[-:]?\s*RESIDUARY/i,          // Legacy (Article IX)
    /ARTICLE\s+VIII\s*[-:]?\s*RESIDUARY/i,        // Legacy (Article VIII - old numbering)
    /ARTICLE\s+XI\s*[-:]?\s*RESIDUARY/i,          // Legacy (current PDF uses Article XI)
    /ARTICLE\s+9\s*[-:]?\s*RESIDUARY/i,           // Legacy
    /ARTICLE\s+8\s*[-:]?\s*RESIDUARY/i,           // Legacy
    /ARTICLE\s+11\s*[-:]?\s*RESIDUARY/i,          // Legacy
    /^RESIDUARY\s+ESTATE\s*$/i,                    // New: "RESIDUARY ESTATE"
    /RESIDUARY\s+ESTATE/i,                         // General match
    /RESIDUE\s+OF\s+ESTATE/i,                      // Alternative
  ],
  INHERITANCE_EXCLUSIONS: [
    /ARTICLE\s+X\s*[-:]?\s*INHERITANCE/i,         // Legacy
    /ARTICLE\s+IX\s*[-:]?\s*INHERITANCE/i,        // Legacy (old numbering)
    /ARTICLE\s+10\s*[-:]?\s*INHERITANCE/i,        // Legacy
    /ARTICLE\s+9\s*[-:]?\s*INHERITANCE/i,         // Legacy
    /^INHERITANCE\s+EXCLUSIONS\s*$/i,              // New: "INHERITANCE EXCLUSIONS"
    /INHERITANCE\s+EXCLUSIONS/i,                   // General match
    /COMMUNITY\s+OF\s+PROPERTY\s+EXCLUSION/i,      // Alternative
  ],
  RIGHT_OF_REPUDIATION: [
    /ARTICLE\s+XI\s*[-:]?\s*RIGHT\s+OF\s+REPUDIATION/i,  // Legacy
    /ARTICLE\s+X\s*[-:]?\s*RIGHT\s+OF\s+REPUDIATION/i,   // Legacy (old numbering)
    /ARTICLE\s+11\s*[-:]?\s*RIGHT\s+OF\s+REPUDIATION/i,  // Legacy
    /ARTICLE\s+10\s*[-:]?\s*RIGHT\s+OF\s+REPUDIATION/i,  // Legacy
    /^RIGHT\s+OF\s+REPUDIATION\s*$/i,              // New: "RIGHT OF REPUDIATION"
    /RIGHT\s+OF\s+REPUDIATION/i,                   // General match
    /REPUDIATION/i,                                // Alternative
  ],
  JOINT_ASSET_CLAUSE: [
    /ARTICLE\s+XII\s*[-:]?\s*JOINT\s+ASSET/i,     // Legacy
    /ARTICLE\s+XI\s*[-:]?\s*JOINT\s+ASSET/i,      // Legacy (old numbering)
    /ARTICLE\s+12\s*[-:]?\s*JOINT\s+ASSET/i,      // Legacy
    /ARTICLE\s+11\s*[-:]?\s*JOINT\s+ASSET/i,      // Legacy
    /^JOINT\s+ASSET\s+CLAUSE\s*$/i,                // New: "JOINT ASSET CLAUSE"
    /JOINT\s+ASSET\s+CLAUSE/i,                     // General match
    /JOINT\s+ASSET\s+DIVISION/i,                   // Alternative
    /BENEFICIARIES\s+TO\s+AGREE\s+AMONGST\s+THEMSELVES/i,  // Alternative
  ],
  COLLATION_EXCLUSION: [
    /ARTICLE\s+XIII\s*[-:]?\s*COLLATION/i,        // Legacy
    /ARTICLE\s+XII\s*[-:]?\s*COLLATION/i,         // Legacy (old numbering)
    /ARTICLE\s+13\s*[-:]?\s*COLLATION/i,          // Legacy
    /ARTICLE\s+12\s*[-:]?\s*COLLATION/i,          // Legacy
    /^COLLATION\s+EXCLUSION\s*$/i,                 // New: "COLLATION EXCLUSION"
    /COLLATION\s+EXCLUSION/i,                      // General match
    /PRINCIPLE\s+OF\s+COLLATION/i,                 // Alternative
  ],
  LIVING_WILL: [
    /ARTICLE\s+XIV\s*[-:]?\s*LIVING\s+WILL/i,     // Legacy
    /ARTICLE\s+XIII\s*[-:]?\s*LIVING\s+WILL/i,    // Legacy (old numbering)
    /ARTICLE\s+14\s*[-:]?\s*LIVING\s+WILL/i,      // Legacy
    /ARTICLE\s+13\s*[-:]?\s*LIVING\s+WILL/i,      // Legacy
    /^LIVING\s+WILL\s*$/i,                         // New: "LIVING WILL"
    /LIVING\s+WILL/i,                              // General match
    /MEDICAL\s+DIRECTIVES/i,                       // Alternative
    /ADVANCE\s+DIRECTIVE/i,                        // Alternative
  ],
  ATTESTATION: [
    /ATTESTATION/i,
    /ATTESTATION\s+AND\s+SIGNATURES/i,
    /SIGNATURE\s+CLAUSE/i,
  ],
};

/**
 * Extract text from a Plate node recursively
 * @param node PlateNode to extract text from
 * @returns Concatenated text content
 */
function extractText(node: PlateNode | { text?: string }): string {
  if ('text' in node && typeof node.text === 'string') {
    return node.text;
  }

  if ('children' in node && Array.isArray(node.children)) {
    return node.children.map((child) => extractText(child)).join('');
  }

  return '';
}

/**
 * Check if a node matches any article pattern
 * @param node PlateNode to check
 * @returns WillArticle type if matched, null otherwise
 */
function matchArticle(node: PlateNode): WillArticle | null {
  // Only check heading nodes
  if (!node.type?.match(/^h[123]$/)) {
    return null;
  }

  const text = extractText(node).trim();

  // Check each article pattern
  for (const [article, patterns] of Object.entries(ARTICLE_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        return article as WillArticle;
      }
    }
  }

  return null;
}

/**
 * Check if content appears to have manual edits
 * Heuristic based on non-standard formatting
 * @param nodes Array of PlateNodes
 * @returns true if manual edits detected
 */
function hasManualEdits(nodes: PlateNode[]): boolean {
  // Simple heuristic: check for unusual formatting, comments, or non-standard structure
  for (const node of nodes) {
    // Check for custom styling or properties that wouldn't be auto-generated
    const keys = Object.keys(node);
    const hasCustomProps = keys.some(
      (key) => !['type', 'children', 'id'].includes(key)
    );

    if (hasCustomProps) {
      return true;
    }

    // Check for inline comments or notes (presence of italic or certain keywords)
    const text = extractText(node).toLowerCase();
    if (
      text.includes('[note:') ||
      text.includes('[todo:') ||
      text.includes('xxx') ||
      text.includes('tbd')
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Detect all article sections in editor content
 * @param editorValue Plate.js editor Value
 * @returns Array of detected sections
 */
export function detectSections(editorValue: Value): DetectedSection[] {
  const sections: DetectedSection[] = [];
  const nodes = editorValue as PlateNode[];

  let currentSection: {
    article: WillArticle;
    startIndex: number;
  } | null = null;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const matchedArticle = matchArticle(node);

    if (matchedArticle) {
      // If we were tracking a previous section, close it
      if (currentSection) {
        const content = nodes.slice(currentSection.startIndex, i);
        sections.push({
          article: currentSection.article,
          startIndex: currentSection.startIndex,
          endIndex: i - 1,
          hasManualEdits: hasManualEdits(content),
          content,
        });
      }

      // Start tracking new section
      currentSection = {
        article: matchedArticle,
        startIndex: i,
      };
    }
  }

  // Close the last section if one is open
  if (currentSection) {
    const content = nodes.slice(currentSection.startIndex);
    sections.push({
      article: currentSection.article,
      startIndex: currentSection.startIndex,
      endIndex: nodes.length - 1,
      hasManualEdits: hasManualEdits(content),
      content,
    });
  }

  return sections;
}

/**
 * Check if a specific article exists in editor
 * @param editorValue Plate.js editor Value
 * @param article Article type to check
 * @returns true if article exists
 */
export function hasSection(
  editorValue: Value,
  article: WillArticle
): boolean {
  const sections = detectSections(editorValue);
  return sections.some((s) => s.article === article);
}

/**
 * Get a specific section from editor
 * @param editorValue Plate.js editor Value
 * @param article Article type to get
 * @returns DetectedSection if found, null otherwise
 */
export function getSection(
  editorValue: Value,
  article: WillArticle
): DetectedSection | null {
  const sections = detectSections(editorValue);
  return sections.find((s) => s.article === article) || null;
}

/**
 * Get missing articles from editor
 * @param editorValue Plate.js editor Value
 * @param requiredArticles Array of required articles
 * @returns Array of missing articles
 */
export function getMissingArticles(
  editorValue: Value,
  requiredArticles: WillArticle[]
): WillArticle[] {
  const sections = detectSections(editorValue);
  const existingArticles = sections.map((s) => s.article);

  return requiredArticles.filter((a) => !existingArticles.includes(a));
}

/**
 * Find insertion point for a new article
 * Articles should be in canonical order
 * @param editorValue Plate.js editor Value
 * @param article Article to insert
 * @returns Index where the article should be inserted
 */
export function findInsertionPoint(
  editorValue: Value,
  article: WillArticle
): number {
  const sections = detectSections(editorValue);

  if (sections.length === 0) {
    return 0; // Insert at beginning if no sections exist
  }

  // Define canonical order
  const order: WillArticle[] = [
    'REVOCATION',              // Article I
    'DECLARATION',             // Article II
    'FAMILY_INFO',             // Article III
    'EXECUTORS',               // Article IV
    'GUARDIANS',               // Article V
    'MINOR_PROVISIONS',        // Article VI
    'USUFRUCT_BEQUESTS',       // Article VII
    'SPECIFIC_BEQUESTS',       // Article VIII
    'RESIDUARY_ESTATE',        // Article IX
    'INHERITANCE_EXCLUSIONS',  // Article X
    'RIGHT_OF_REPUDIATION',    // Article XI
    'JOINT_ASSET_CLAUSE',      // Article XII
    'COLLATION_EXCLUSION',     // Article XIII
    'LIVING_WILL',             // Article XIV
    'ATTESTATION',
  ];

  const targetIndex = order.indexOf(article);

  // Find the last section that should come before this one
  let insertAfter: DetectedSection | null = null;

  for (const section of sections) {
    const sectionIndex = order.indexOf(section.article);
    if (sectionIndex < targetIndex) {
      if (!insertAfter || order.indexOf(insertAfter.article) < sectionIndex) {
        insertAfter = section;
      }
    }
  }

  if (insertAfter) {
    return insertAfter.endIndex + 1;
  }

  // Find the first section that should come after this one
  for (const section of sections) {
    const sectionIndex = order.indexOf(section.article);
    if (sectionIndex > targetIndex) {
      return section.startIndex;
    }
  }

  // Insert at end if no sections come after
  return (editorValue as PlateNode[]).length;
}
