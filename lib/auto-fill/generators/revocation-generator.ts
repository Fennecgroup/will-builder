// Revocation Generator (Article I)
// Generates standard revocation clause

import { WillArticle, WillSection, PlateNode } from '../types';
import { BaseGenerator } from './base-generator';
import { formatRevocationClause } from '../legal-templates/south-african';

/**
 * Revocation Generator
 * Generates Article I - standard revocation clause
 * Always generates (no data dependencies)
 */
export class RevocationGenerator extends BaseGenerator {
  /**
   * Check if generator should run
   * Always returns true - revocation clause has no data dependencies
   */
  shouldGenerate(): boolean {
    return true;
  }

  /**
   * Generate Article I - Revocation
   */
  generate(): WillSection | null {
    const content = this.generateContent();
    return this.buildSection(content);
  }

  /**
   * Get article type
   */
  getArticle(): WillArticle {
    return 'REVOCATION';
  }

  /**
   * Get source data IDs
   * Revocation has no source data
   */
  protected getSourceDataIds(): string[] {
    return [];
  }

  /**
   * Generate content nodes for Article I
   */
  private generateContent() {
    const content: PlateNode[] = [];

    // Article heading
    content.push(this.createHeading(2, 'ARTICLE I - REVOCATION'));
    content.push(this.createEmptyParagraph());

    // Revocation clause
    const revocationText = formatRevocationClause();
    content.push(this.createParagraph(revocationText));

    return content;
  }
}
