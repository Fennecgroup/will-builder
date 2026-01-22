// Declaration Generator (Article II)
// Generates declaration clause with testator information

import { WillArticle, WillSection, PlateNode, ARTICLE_TITLES } from '../types';
import { BaseGenerator } from './base-generator';
import { formatDeclarationClause } from '../legal-templates/south-african';

/**
 * Declaration Generator
 * Generates Article II - Declaration
 * Requires: testator information (name, ID, address)
 */
export class DeclarationGenerator extends BaseGenerator {
  /**
   * Check if generator should run
   * Requires testator name at minimum
   */
  shouldGenerate(): boolean {
    const testator = this.context.willContent.testator;

    if (!testator || !testator.fullName) {
      this.warn('Missing testator information - name required');
      return false;
    }

    return true;
  }

  /**
   * Generate Article II - Declaration
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
    return 'DECLARATION';
  }

  /**
   * Get source data IDs
   */
  protected getSourceDataIds(): string[] {
    const testator = this.context.willContent.testator;
    return testator?.id ? [testator.id] : [];
  }

  /**
   * Generate content nodes for Article II
   */
  private generateContent() {
    const content: PlateNode[] = [];
    const testator = this.context.willContent.testator;

    if (!testator) {
      return content;
    }

    // Article heading
    content.push(this.createHeading(2, ARTICLE_TITLES[this.getArticle()]));
    content.push(this.createEmptyParagraph());

    // Declaration clause with testator info
    const declarationText = formatDeclarationClause({
      fullName: testator.fullName,
      idNumber: testator.idNumber,
      address: testator.address,
    });

    content.push(this.createParagraph(declarationText));

    return content;
  }
}
