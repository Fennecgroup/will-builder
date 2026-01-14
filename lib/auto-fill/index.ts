// Auto-Fill System - Barrel Export

// Types
export type {
  WillArticle,
  PlateNode,
  PlateText,
  WillSection,
  GeneratorContext,
  DetectedSection,
  DiffResult,
  AutoFillSuggestion,
  AutoFillOptions,
  BeneficiaryAllocation,
  BeneficiaryAssetLink,
  AutoFillResult,
  ValidationResult,
} from './types';

export { ARTICLE_TITLES, ARTICLE_ORDER } from './types';

// Orchestrator
export { AutoFillOrchestrator } from './orchestrator';

// Generators
export { BaseGenerator } from './generators/base-generator';
export { PreambleGenerator } from './generators/preamble-generator';
export { RevocationGenerator } from './generators/revocation-generator';
export { DeclarationGenerator } from './generators/declaration-generator';
export { FamilyInfoGenerator } from './generators/family-info-generator';
export { ExecutorsGenerator } from './generators/executors-generator';
export { GuardiansGenerator } from './generators/guardians-generator';
//export { MinorProvisionsGenerator } from './generators/minor-provisions-generator';
export { SpecificBequestsGenerator } from './generators/specific-bequests-generator';
export { ResiduaryEstateGenerator } from './generators/residuary-estate-generator';
export { InheritanceExclusionsGenerator } from './generators/inheritance-exclusions-generator';
export { RightOfRepudiationGenerator } from './generators/right-of-repudiation-generator';
export { AttestationGenerator } from './generators/attestation-generator';

// Section Detection
export {
  detectSections,
  hasSection,
  getSection,
  getMissingArticles,
  findInsertionPoint,
} from './section-detector';

// Diff Engine
export {
  generateDiff,
  areNodesEqual,
  getDiffSummary,
} from './diff-engine';

// Legal Templates
export {
  formatAssetDescription,
  formatCurrency,
  formatBeneficiaryClause,
  formatSpecificBequest,
  formatResiduaryClause,
  formatBeneficiaryDistributions,
  formatSubstituteBeneficiaryClause,
  formatMinorProvisions,
  formatMinorProvisionsClause,
  formatRevocationClause,
  formatDeclarationClause,
  formatFamilyInfoSection,
  formatExecutorAppointment,
  formatGuardianAppointment,
  formatAttestationClause,
  formatGeneralInheritanceExclusionClause,
  formatRightOfRepudiationClause,
  getSpecificBequestsIntro,
  validateAndNormalizeAllocations,
} from './legal-templates/south-african';

/**
 * Simple usage function for auto-filling a will
 * @param willContent Structured will content
 * @param editorValue Current editor value
 * @returns New editor value with auto-filled sections
 */
import { WillContent } from '@/lib/types/will';
import type { Value } from '@udecode/plate';
import { AutoFillOrchestrator } from './orchestrator';

export function autoFillWill(
  willContent: WillContent,
  editorValue: Value
): Value {
  const orchestrator = new AutoFillOrchestrator(willContent, editorValue);
  return orchestrator.applyAllSuggestions();
}
