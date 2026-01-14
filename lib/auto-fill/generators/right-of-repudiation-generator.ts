// Right of Repudiation Generator
// Generates universal right of repudiation clause for all beneficiaries

import { WillArticle, WillSection, PlateNode } from '../types';
import { BaseGenerator } from './base-generator';
import { formatRightOfRepudiationClause } from '../legal-templates/south-african';

/**
 * Right of Repudiation Generator
 * Generates universal clause allowing all beneficiaries to repudiate
 * (reject) all or part of their inheritance without affecting remaining rights
 *
 * This is a standard clause that applies to ALL beneficiaries automatically,
 * protecting their legal right to selective acceptance of bequests
 */
export class RightOfRepudiationGenerator extends BaseGenerator {
  /**
   * Check if generator should run
   * Always returns true - this clause is mandatory in every will
   */
  shouldGenerate(): boolean {
    // This is a universal clause that should always be included
    // No data dependencies - applies to all beneficiaries automatically
    return true;
  }

  /**
   * Generate Right of Repudiation section
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
    return 'RIGHT_OF_REPUDIATION';
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
   * Generate content nodes for right of repudiation section
   */
  private generateContent(): PlateNode[] {
    const content: PlateNode[] = [];

    // Section heading
    content.push(this.createEmptyParagraph());
    content.push(this.createHeading(2, 'ARTICLE X - RIGHT OF REPUDIATION'));
    content.push(this.createEmptyParagraph());

    // Universal repudiation clause (applies to all beneficiaries)
    const clauseText = formatRightOfRepudiationClause();
    content.push(this.createParagraph(clauseText));

    return content;
  }
}
