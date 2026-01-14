// Joint Asset Clause Generator
// Generates universal joint asset division clause for multiple beneficiaries

import { WillArticle, WillSection, PlateNode } from '../types';
import { BaseGenerator } from './base-generator';
import { formatJointAssetClause } from '../legal-templates/south-african';

/**
 * Joint Asset Clause Generator
 * Generates universal clause allowing beneficiaries to agree amongst themselves
 * on the division of jointly bequeathed assets without executor involvement
 *
 * This clause only applies when there are 2+ beneficiaries,
 * as it requires multiple parties to agree on asset division
 */
export class JointAssetClauseGenerator extends BaseGenerator {
  /**
   * Check if generator should run
   * Returns true if there are 2+ beneficiaries (joint division requires multiple parties)
   */
  shouldGenerate(): boolean {
    const beneficiaries = this.context.willContent.beneficiaries || [];

    // Requires at least 2 beneficiaries for "joint" assets and "agreement amongst themselves"
    // Single beneficiary cannot agree "amongst themselves"
    return beneficiaries.length >= 2;
  }

  /**
   * Generate Joint Asset Clause section
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
    return 'JOINT_ASSET_CLAUSE';
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
   * Generate content nodes for joint asset clause section
   */
  private generateContent(): PlateNode[] {
    const content: PlateNode[] = [];

    // Section heading
    content.push(this.createEmptyParagraph());
    content.push(this.createHeading(2, 'ARTICLE XI - JOINT ASSET CLAUSE'));
    content.push(this.createEmptyParagraph());

    // Universal joint asset clause (applies to all jointly bequeathed assets)
    const clauseText = formatJointAssetClause();
    content.push(this.createParagraph(clauseText));

    return content;
  }
}
