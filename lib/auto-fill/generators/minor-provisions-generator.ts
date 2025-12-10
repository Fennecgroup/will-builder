// Minor Provisions Generator (Article VI)
// Generates provisions for minor beneficiaries

import { WillArticle, WillSection, PlateNode } from '../types';
import { BaseGenerator } from './base-generator';
import { formatMinorProvisionsClause } from '../legal-templates/south-african';

/**
 * Minor Provisions Generator
 * Generates Article VI - Minor Beneficiary Provisions
 * Requires: at least one minor beneficiary
 */
export class MinorProvisionsGenerator extends BaseGenerator {
  /**
   * Check if generator should run
   * Requires at least one minor beneficiary
   */
  shouldGenerate(): boolean {
    const beneficiaries = this.context.willContent.beneficiaries;

    if (!beneficiaries || beneficiaries.length === 0) {
      return false;
    }

    // Check if any beneficiary is a minor
    const hasMinorBeneficiary = beneficiaries.some((b) => b.isMinor);
    if (!hasMinorBeneficiary) {
      return false;
    }

    return true;
  }

  /**
   * Generate Article VI - Minor Provisions
   */
  generate(): WillSection | null {
    if (!this.shouldGenerate()) {
      return null;
    }

    const content = this.generateContent();
    return this.buildSection(content);
  }

  /**
   * Get article type
   */
  getArticle(): WillArticle {
    return 'MINOR_PROVISIONS';
  }

  /**
   * Get source data IDs
   */
  protected getSourceDataIds(): string[] {
    const beneficiaries = this.context.willContent.beneficiaries || [];
    const minorBeneficiaries = beneficiaries.filter((b) => b.isMinor);
    return minorBeneficiaries.map((b) => b.id);
  }

  /**
   * Generate content nodes for Article VI
   */
  private generateContent() {
    const content: PlateNode[] = [];
    const beneficiaries = this.context.willContent.beneficiaries || [];
    const guardians = this.context.willContent.guardians || [];

    // Article heading
    content.push(this.createHeading(2, 'ARTICLE VI - MINOR BENEFICIARY PROVISIONS'));
    content.push(this.createEmptyParagraph());

    // Get primary guardian name if available (not alternate)
    const primaryGuardian = guardians.find((g) => !g.isAlternate);
    const guardianName = primaryGuardian?.fullName;

    // Minor provisions text
    const provisionsText = formatMinorProvisionsClause(beneficiaries, guardianName);

    if (provisionsText) {
      content.push(this.createParagraph(provisionsText));
    }

    return content;
  }
}
