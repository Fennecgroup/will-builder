// Family Info Generator (Article III)
// Generates family information section

import { WillArticle, WillSection, PlateNode, ARTICLE_TITLES } from '../types';
import { BaseGenerator } from './base-generator';
import { formatFamilyInfoSection } from '../legal-templates/south-african';

/**
 * Family Info Generator
 * Generates Article III - Family Information
 * Requires: maritalStatus, marriage (if married), children (optional)
 */
export class FamilyInfoGenerator extends BaseGenerator {
  /**
   * Check if generator should run
   * Requires marital status information
   */
  shouldGenerate(): boolean {
    const maritalStatus = this.context.willContent.maritalStatus;

    if (!maritalStatus) {
      this.warn('Missing marital status');
      return false;
    }

    // If married, should have spouse information
    if (maritalStatus === 'married') {
      const marriage = this.context.willContent.marriage;
      if (!marriage || !marriage.spouses || marriage.spouses.length === 0) {
        this.warn('Married status but no spouse information provided');
        return false;
      }
    }

    return true;
  }

  /**
   * Generate Article III - Family Information
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
    return 'FAMILY_INFO';
  }

  /**
   * Get source data IDs
   */
  protected getSourceDataIds(): string[] {
    const ids: string[] = [];
    const marriage = this.context.willContent.marriage;
    const children = this.context.willContent.children;

    // Add spouse IDs
    if (marriage?.spouses) {
      ids.push(...marriage.spouses.map((s) => s.id));
    }

    // Add children IDs
    if (children) {
      ids.push(...children.map((c) => c.id));
    }

    return ids;
  }

  /**
   * Generate content nodes for Article III
   */
  private generateContent() {
    const content: PlateNode[] = [];
    const maritalStatus = this.context.willContent.maritalStatus;
    const marriage = this.context.willContent.marriage;
    const children = this.context.willContent.children;

    // Article heading
    content.push(this.createHeading(2, ARTICLE_TITLES[this.getArticle()]));
    content.push(this.createEmptyParagraph());

    // Family info text
    const familyInfoText = formatFamilyInfoSection(
      maritalStatus || 'single',
      marriage,
      children
    );

    content.push(this.createParagraph(familyInfoText));

    return content;
  }
}
