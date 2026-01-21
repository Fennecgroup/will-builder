// Attestation Generator
// Generates attestation and signature clause

import { WillArticle, WillSection, PlateNode } from '../types';
import { BaseGenerator } from './base-generator';
import { formatAttestationClause } from '../legal-templates/south-african';

/**
 * Attestation Generator
 * Generates attestation and witness signatures section
 * Optional: witnesses, dateExecuted, placeExecuted
 */
export class AttestationGenerator extends BaseGenerator {
  /**
   * Check if generator should run
   * Returns true - attestation clause can be generated with or without witness details
   */
  shouldGenerate(): boolean {
    // Attestation can always be generated, even without witnesses
    // It provides the basic structure for signing
    return true;
  }

  /**
   * Generate Attestation section
   */
  generate(): WillSection | null {
    const content = this.generateContent();
    return this.buildSection(content);
  }

  /**
   * Get article type
   */
  getArticle(): WillArticle {
    return 'ATTESTATION';
  }

  /**
   * Get source data IDs
   */
  protected getSourceDataIds(): string[] {
    const witnesses = this.context.willContent.witnesses || [];
    return witnesses.map((w) => w.id);
  }

  /**
   * Generate content nodes for attestation section
   */
  private generateContent() {
    const content: PlateNode[] = [];
    const witnesses = this.context.willContent.witnesses;
    const dateExecuted = this.context.willContent.dateExecuted;
    const placeExecuted = this.context.willContent.placeExecuted;

    // Empty paragraph for spacing before attestation
    content.push(this.createEmptyParagraph());
    content.push(this.createEmptyParagraph());

    // Attestation heading
    content.push(this.createHeading(2, 'ATTESTATION AND SIGNATURES'));
    content.push(this.createEmptyParagraph());

    // Convert witnesses to expected format
    const formattedWitnesses = witnesses?.map((w) => ({
      fullName: w.fullName,
      idNumber: w.idNumber,
      address: w.address
        ? [w.address.street, w.address.city, w.address.state, w.address.postalCode, w.address.country]
            .filter(Boolean)
            .join(', ')
        : undefined,
    }));

    // Attestation clause
    const attestationText = formatAttestationClause(
      dateExecuted,
      placeExecuted,
      formattedWitnesses
    );

    content.push(this.createParagraph(attestationText));

    // Add signature lines
    content.push(this.createEmptyParagraph());
    content.push(this.createEmptyParagraph());
    content.push(this.createParagraph('_____________________________'));
    content.push(this.createParagraph('Signature of Testator'));
    content.push(this.createEmptyParagraph());
    content.push(this.createParagraph(`Date: ${dateExecuted || '__________________'}`));

    // Add Commissioner of Oath section if clause is selected
    const commissionerClause = this.context.willContent.optionalClauses?.find(
      (c) => c.clauseType === 'commissioner-of-oath-attestation' && c.isSelected
    );

    if (commissionerClause) {
      content.push(this.createEmptyParagraph());
      content.push(this.createEmptyParagraph());
      content.push(this.createParagraph('COMMISSIONER OF OATHS CERTIFICATION'));
      content.push(this.createEmptyParagraph());
      content.push(this.createParagraph('I, _________________________, Registration Number _________________, a Commissioner of Oaths duly appointed in the Republic of South Africa, do hereby certify that this Last Will and Testament was signed by the testator in my presence and in the presence of the witnesses named above.'));
      content.push(this.createEmptyParagraph());
      content.push(this.createParagraph('I further certify that the testator appeared to be of sound mind and under no undue influence or coercion, and that all signatures were affixed in the presence of all parties.'));
      content.push(this.createEmptyParagraph());
      content.push(this.createEmptyParagraph());
      content.push(this.createParagraph('_____________________________'));
      content.push(this.createParagraph('Commissioner of Oaths Signature'));
      content.push(this.createEmptyParagraph());
      content.push(this.createParagraph('Name: _____________________________'));
      content.push(this.createParagraph('ID Number: _____________________________'));
      content.push(this.createParagraph('Registration Number: _____________________________'));
      content.push(this.createParagraph('Date: _____________________________'));
      content.push(this.createParagraph('Place: _____________________________'));
    }

    return content;
  }
}
