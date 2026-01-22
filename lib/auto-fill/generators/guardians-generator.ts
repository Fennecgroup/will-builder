// Guardians Generator (Article V)
// Generates guardian appointment clause for minor children

import { WillArticle, WillSection, PlateNode, ARTICLE_TITLES } from '../types';
import { BaseGenerator } from './base-generator';
import { formatGuardianAppointment } from '../legal-templates/south-african';

/**
 * Guardians Generator
 * Generates Article V - Guardian Appointment
 * Requires: guardians array AND minor children
 */
export class GuardiansGenerator extends BaseGenerator {
  /**
   * Check if generator should run
   * Requires guardians AND at least one minor child
   */
  shouldGenerate(): boolean {
    const guardians = this.context.willContent.guardians;
    const children = this.context.willContent.children;

    // Need guardians defined
    if (!guardians || guardians.length === 0) {
      return false; // Don't warn - guardians optional if no minor children
    }

    // Need at least one minor child
    const hasMinorChildren = children && children.some((c) => c.isMinor);
    if (!hasMinorChildren) {
      return false; // Don't warn - guardians not needed without minor children
    }

    // Check if at least one guardian has a name
    const hasValidGuardian = guardians.some((g) => g.fullName);
    if (!hasValidGuardian) {
      this.warn('Guardians defined but no valid guardian name found');
      return false;
    }

    return true;
  }

  /**
   * Generate Article V - Guardians
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
    return 'GUARDIANS';
  }

  /**
   * Get source data IDs
   */
  protected getSourceDataIds(): string[] {
    const ids: string[] = [];
    const guardians = this.context.willContent.guardians || [];
    const children = this.context.willContent.children || [];

    ids.push(...guardians.map((g) => g.id));

    // Add minor children IDs
    const minorChildren = children.filter((c) => c.isMinor);
    ids.push(...minorChildren.map((c) => c.id));

    return ids;
  }

  /**
   * Generate content nodes for Article V
   */
  private generateContent() {
    const content: PlateNode[] = [];
    const guardians = this.context.willContent.guardians || [];
    const children = this.context.willContent.children || [];

    // Article heading
    content.push(this.createHeading(2, ARTICLE_TITLES[this.getArticle()]));
    content.push(this.createEmptyParagraph());

    // Guardian appointment text
    const guardianText = formatGuardianAppointment(guardians, children);

    if (guardianText) {
      content.push(this.createParagraph(guardianText));
    }

    return content;
  }
}
