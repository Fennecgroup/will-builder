// Preamble Generator
// Generates the will preamble with testator details and marital information

import { WillArticle, WillSection, PlateNode } from '../types';
import { BaseGenerator } from './base-generator';

/**
 * Preamble Generator
 * Generates the opening preamble with testator identification and marital status
 * This appears before all articles
 */
export class PreambleGenerator extends BaseGenerator {
  /**
   * Check if generator should run
   * Requires testator name at minimum
   */
  shouldGenerate(): boolean {
    const testator = this.context.willContent.testator;

    if (!testator || !testator.fullName) {
      this.warn('Missing testator name for preamble');
      return false;
    }

    return true;
  }

  /**
   * Generate Preamble
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
    return 'PREAMBLE';
  }

  /**
   * Get source data IDs
   */
  protected getSourceDataIds(): string[] {
    const ids: string[] = [];
    const testator = this.context.willContent.testator;
    const marriage = this.context.willContent.marriage;

    if (testator?.id) {
      ids.push(testator.id);
    }

    if (marriage?.spouses) {
      ids.push(...marriage.spouses.map((s) => s.id));
    }

    return ids;
  }

  /**
   * Generate content nodes for preamble
   */
  private generateContent() {
    const content: PlateNode[] = [];
    const testator = this.context.willContent.testator;
    const maritalStatus = this.context.willContent.maritalStatus;
    const marriage = this.context.willContent.marriage;

    if (!testator) {
      return content;
    }

    // Main heading
    content.push(this.createHeading(1, 'LAST WILL AND TESTAMENT'));
    content.push(this.createEmptyParagraph());

    // Testator identification section
    content.push(this.createHeading(3, 'TESTATOR'));
    content.push(this.createEmptyParagraph());

    // Build testator details
    const testatorDetails: string[] = [];

    // Full name (required)
    testatorDetails.push(`Full Name: ${testator.fullName}`);

    // ID Number
    if (testator.idNumber) {
      testatorDetails.push(`ID Number: ${testator.idNumber}`);
    }

    // Date of Birth
    if (testator.dateOfBirth) {
      testatorDetails.push(`Date of Birth: ${testator.dateOfBirth}`);
    }

    // Address
    // if (testator.address) {
    //   const addressParts: string[] = [];
    //   if (testator.address.street) addressParts.push(testator.address.street);
    //   if (testator.address.city) addressParts.push(testator.address.city);
    //   if (testator.address.state) addressParts.push(testator.address.state);
    //   if (testator.address.postalCode) addressParts.push(testator.address.postalCode);
    //   if (testator.address.country) addressParts.push(testator.address.country);

    //   if (addressParts.length > 0) {
    //     testatorDetails.push(`Address: ${addressParts.join(', ')}`);
    //   }
    // }

    // Contact information
    // if (testator.phone) {
    //   testatorDetails.push(`Phone: ${testator.phone}`);
    // }

    // if (testator.email) {
    //   testatorDetails.push(`Email: ${testator.email}`);
    // }

    // if (testator.occupation) {
    //   testatorDetails.push(`Occupation: ${testator.occupation}`);
    // }

    // Add testator details as bulleted list
    content.push(this.createBulletedList(testatorDetails));
    content.push(this.createEmptyParagraph());

    // Marital status section
    if (maritalStatus) {
      content.push(this.createHeading(3, 'MARITAL STATUS'));
      content.push(this.createEmptyParagraph());

      const maritalInfo = this.formatMaritalInformation(maritalStatus, marriage);
      content.push(this.createParagraph(maritalInfo));
      content.push(this.createEmptyParagraph());
    }

    return content;
  }

  /**
   * Format marital information
   */
  private formatMaritalInformation(
    maritalStatus: string,
    marriage?: {
      spouses?: Array<{
        fullName: string;
        idNumber?: string;
        dateOfMarriage?: string;
        maritalRegime?: string;
      }>;
    }
  ): string {
    if (maritalStatus === 'married' && marriage?.spouses && marriage.spouses.length > 0) {
      const spouseDetails = marriage.spouses.map((spouse) => {
        const parts = [spouse.fullName];

        if (spouse.idNumber) {
          parts.push(`(ID: ${spouse.idNumber})`);
        }

        if (spouse.dateOfMarriage) {
          parts.push(`married on ${spouse.dateOfMarriage}`);
        }

        if (spouse.maritalRegime) {
          const regimeText =
            spouse.maritalRegime === 'ICOP'
              ? 'in community of property'
              : spouse.maritalRegime === 'ANC'
              ? 'out of community of property with accrual'
              : 'out of community of property without accrual';
          parts.push(regimeText);
        }

        return parts.join(', ');
      });

      if (marriage.spouses.length === 1) {
        return `I am married to ${spouseDetails[0]}.`;
      } else {
        return `I am married to ${spouseDetails.join(' and ')}.`;
      }
    } else if (maritalStatus === 'divorced') {
      return 'I am divorced.';
    } else if (maritalStatus === 'widowed') {
      return 'I am widowed.';
    } else {
      return 'I am single/unmarried.';
    }
  }
}
