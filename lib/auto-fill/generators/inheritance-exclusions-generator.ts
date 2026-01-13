// Inheritance Exclusions Generator
// Generates general protection clause for all beneficiaries

import { WillArticle, WillSection, PlateNode } from '../types';
import { BaseGenerator } from './base-generator';
import { formatGeneralInheritanceExclusionClause } from '../legal-templates/south-african';

/**
 * Inheritance Exclusions Generator
 * Generates universal protection clause excluding all inheritances from
 * community of property and accrual systems
 *
 * This is a standard clause that applies to ALL beneficiaries automatically,
 * regardless of their current or future marital status
 */
export class InheritanceExclusionsGenerator extends BaseGenerator {
  /**
   * Check if generator should run
   * Returns true if there are any beneficiaries in the will
   */
  shouldGenerate(): boolean {
    const beneficiaries = this.context.willContent.beneficiaries;

    // Only generate if there are beneficiaries to protect
    if (!beneficiaries || beneficiaries.length === 0) {
      return false; // No beneficiaries = no need for protection clause
    }

    return true;
  }

  /**
   * Generate Inheritance Exclusions section
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
    return 'INHERITANCE_EXCLUSIONS';
  }

  /**
   * Get source data IDs
   * Returns beneficiary IDs since this clause protects all beneficiaries
   */
  protected getSourceDataIds(): string[] {
    const beneficiaries = this.context.willContent.beneficiaries || [];
    return beneficiaries.map((b) => b.id);
  }

  /**
   * Generate content nodes for inheritance exclusions section
   */
  private generateContent(): PlateNode[] {
    const content: PlateNode[] = [];

    // Section heading
    content.push(this.createEmptyParagraph());
    content.push(this.createHeading(2, 'ARTICLE IX - INHERITANCE EXCLUSIONS'));
    content.push(this.createEmptyParagraph());

    // General protection clause (applies to all beneficiaries)
    const clauseText = formatGeneralInheritanceExclusionClause();
    content.push(this.createParagraph(clauseText));

    return content;
  }
}
