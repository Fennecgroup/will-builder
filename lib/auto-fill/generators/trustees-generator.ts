// Trustees Generator (Article VI)
// Generates trustee appointment clause for minor beneficiaries
// Creates Article VI - Minor Beneficiary Provisions with trustee details

import { WillArticle, WillSection, PlateNode, ARTICLE_TITLES } from '../types';
import { BaseGenerator } from './base-generator';
import { formatTrusteeAppointment } from '../legal-templates/south-african';

/**
 * Trustees Generator
 * Generates Article VI - Minor Beneficiary Provisions with trustee appointment
 * Note: MinorProvisionsGenerator is currently disabled in orchestrator
 * Requires: trustees array AND minor beneficiaries
 */
export class TrusteesGenerator extends BaseGenerator {
  /**
   * Check if generator should run
   * Requires trustees AND at least one minor beneficiary/child
   */
  shouldGenerate(): boolean {
    const trustees = this.context.willContent.trustees;
    const beneficiaries = this.context.willContent.beneficiaries;
    const children = this.context.willContent.children;

    // Need trustees defined
    if (!trustees || trustees.length === 0) {
      return false; // Don't warn - trustees optional if no minor beneficiaries
    }

    // Need at least one minor beneficiary or child
    const hasMinorBeneficiary =
      (beneficiaries && beneficiaries.some((b) => b.isMinor)) ||
      (children && children.some((c) => c.isMinor));

    if (!hasMinorBeneficiary) {
      return false; // Don't warn - trustees not needed without minors
    }

    // Check if at least one trustee has a name and ID
    const hasValidTrustee = trustees.some((t) => t.fullName && t.idNumber);
    if (!hasValidTrustee) {
      this.warn('Trustees defined but no valid trustee found');
      return false;
    }

    return true;
  }

  /**
   * Generate trustee section
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
   * Merged into Minor Provisions
   */
  getArticle(): WillArticle {
    return 'MINOR_PROVISIONS';
  }

  /**
   * Get source data IDs
   */
  protected getSourceDataIds(): string[] {
    const ids: string[] = [];
    const trustees = this.context.willContent.trustees || [];
    const beneficiaries = this.context.willContent.beneficiaries || [];
    const children = this.context.willContent.children || [];

    ids.push(...trustees.map((t) => t.id));

    const minorBeneficiaries = beneficiaries.filter((b) => b.isMinor);
    ids.push(...minorBeneficiaries.map((b) => b.id));

    const minorChildren = children.filter((c) => c.isMinor);
    ids.push(...minorChildren.map((c) => c.id));

    return ids;
  }

  /**
   * Generate content nodes for Article VI
   * Includes heading and trustee appointment details
   */
  private generateContent(): PlateNode[] {
    const content: PlateNode[] = [];
    const trustees = this.context.willContent.trustees || [];
    const beneficiaries = this.context.willContent.beneficiaries || [];

    // Get age threshold from MinorBeneficiaryProvisions
    const ageOfInheritance = this.context.willContent.minorBeneficiaryProvisions?.ageOfInheritance;

    // Article heading
    content.push(this.createHeading(2, ARTICLE_TITLES[this.getArticle()]));
    content.push(this.createEmptyParagraph());

    // Generate trustee appointment text with age parameter
    const trusteeText = formatTrusteeAppointment(trustees, beneficiaries, ageOfInheritance);

    if (trusteeText) {
      content.push(this.createParagraph(trusteeText));
    }

    return content;
  }
}
