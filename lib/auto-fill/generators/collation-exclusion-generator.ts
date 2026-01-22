// Collation Exclusion Generator
// Generates universal collation exclusion clause for all beneficiaries

import { WillArticle, WillSection, PlateNode, ARTICLE_TITLES } from '../types';
import { BaseGenerator } from './base-generator';
import { formatCollationExclusionClause } from '../legal-templates/south-african';

/**
 * Collation Exclusion Generator
 * Generates universal clause excluding the principle of collation from the estate
 *
 * Collation is a legal principle requiring beneficiaries to account for lifetime gifts
 * when calculating inheritance shares. This clause waives that requirement.
 *
 * This is a standard clause that applies to ALL beneficiaries automatically,
 * ensuring lifetime gifts do not reduce inheritance entitlements
 */
export class CollationExclusionGenerator extends BaseGenerator {
  /**
   * Check if generator should run
   * Returns true if there are any beneficiaries in the will
   */
  shouldGenerate(): boolean {
    const beneficiaries = this.context.willContent.beneficiaries;

    // Only generate if there are beneficiaries
    // No beneficiaries = no need for collation exclusion clause
    if (!beneficiaries || beneficiaries.length === 0) {
      return false;
    }

    return true;
  }

  /**
   * Generate Collation Exclusion section
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
    return 'COLLATION_EXCLUSION';
  }

  /**
   * Get source data IDs
   * Returns beneficiary IDs since this clause applies to all beneficiaries
   */
  protected getSourceDataIds(): string[] {
    const beneficiaries = this.context.willContent.beneficiaries || [];
    return beneficiaries.map((b) => b.id);
  }

  /**
   * Generate content nodes for collation exclusion section
   */
  private generateContent(): PlateNode[] {
    const content: PlateNode[] = [];

    // Section heading
    content.push(this.createEmptyParagraph());
    content.push(this.createHeading(2, ARTICLE_TITLES[this.getArticle()]));
    content.push(this.createEmptyParagraph());

    // Universal collation exclusion clause (applies to all beneficiaries)
    const clauseText = formatCollationExclusionClause();
    content.push(this.createParagraph(clauseText));

    return content;
  }
}
