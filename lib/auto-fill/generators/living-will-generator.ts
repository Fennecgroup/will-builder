// Living Will Generator (Article XIV)
// Generates Living Will clause with medical directives

import { WillArticle, WillSection, PlateNode } from '../types';
import { BaseGenerator } from './base-generator';
import {
  formatLivingWillDirectives,
  formatOrganDonationClause,
  formatEndOfLifeInstructions,
} from '../legal-templates/south-african';

/**
 * Living Will Generator
 * Generates Article XIV - Living Will
 * Requires: Living Will directives data and clause selection
 */
export class LivingWillGenerator extends BaseGenerator {
  /**
   * Check if generator should run
   * Requires: Living Will clause selected and directives completed
   */
  shouldGenerate(): boolean {
    const willContent = this.context.willContent;

    // Check if Living Will clause is selected
    const livingWillClause = willContent.optionalClauses?.find(
      (c) => c.clauseType === 'living-will'
    );

    if (!livingWillClause || !livingWillClause.isSelected) {
      return false;
    }

    // Check if questionnaire is completed
    if (!livingWillClause.questionnaireCompleted) {
      this.warn('Living Will clause selected but questionnaire not completed');
      return false;
    }

    // Check if directives data exists
    if (!willContent.livingWillDirectives) {
      this.warn('Living Will directives data missing');
      return false;
    }

    return true;
  }

  /**
   * Generate Article XIV - Living Will
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
    return 'LIVING_WILL';
  }

  /**
   * Get source data IDs
   */
  protected getSourceDataIds(): string[] {
    // Living Will doesn't reference specific entities, but we track it was generated
    return ['living-will-directives'];
  }

  /**
   * Generate content nodes for Article XIV
   */
  private generateContent(): PlateNode[] {
    const content: PlateNode[] = [];
    const directives = this.context.willContent.livingWillDirectives;

    if (!directives) {
      return content;
    }

    // Article heading
    content.push(this.createHeading(2, 'ARTICLE XIV - LIVING WILL'));
    content.push(this.createEmptyParagraph());

    // Introduction
    content.push(
      this.createParagraph(
        'In accordance with Section 7 of the National Health Act, 2003 (Act No. 61 of 2003), I hereby make the following advance directives regarding my medical care and treatment:'
      )
    );
    content.push(this.createEmptyParagraph());

    // Section 1: Medical Directives
    content.push(this.createHeading(3, '14.1 Medical Treatment Directives'));
    content.push(this.createEmptyParagraph());

    const directivesText = formatLivingWillDirectives(directives);
    content.push(this.createParagraph(directivesText));
    content.push(this.createEmptyParagraph());

    // Section 2: End of Life Care
    if (directives.noLifeSupportIfTerminal || !directives.resuscitation || !directives.artificialNutrition) {
      content.push(this.createHeading(3, '14.2 End of Life Care Instructions'));
      content.push(this.createEmptyParagraph());

      const endOfLifeText = formatEndOfLifeInstructions(directives);
      content.push(this.createParagraph(endOfLifeText));
      content.push(this.createEmptyParagraph());
    }

    // Section 3: Organ Donation
    if (directives.organDonation) {
      content.push(this.createHeading(3, '14.3 Organ Donation'));
      content.push(this.createEmptyParagraph());

      const organDonationText = formatOrganDonationClause(directives.organDonation);
      content.push(this.createParagraph(organDonationText));
      content.push(this.createEmptyParagraph());
    }

    // Section 4: Specific Instructions (if provided)
    if (directives.specificInstructions && directives.specificInstructions.trim()) {
      content.push(this.createHeading(3, '14.4 Additional Medical Instructions'));
      content.push(this.createEmptyParagraph());

      content.push(this.createParagraph(directives.specificInstructions.trim()));
      content.push(this.createEmptyParagraph());
    }

    // Legal validity clause
    content.push(this.createHeading(3, '14.5 Legal Effect'));
    content.push(this.createEmptyParagraph());

    content.push(
      this.createParagraph(
        'I declare that these directives are made voluntarily, without coercion, while I am of sound mind and fully understand the consequences of these decisions. I direct all healthcare providers and my family to honor these directives to the fullest extent permitted by law.'
      )
    );
    content.push(this.createEmptyParagraph());

    content.push(
      this.createParagraph(
        'I understand that I may revoke or amend these directives at any time by executing a new living will or advance directive.'
      )
    );

    return content;
  }
}
