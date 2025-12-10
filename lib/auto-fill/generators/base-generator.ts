// Base Generator - Abstract Class for Will Section Generators

import {
  WillArticle,
  WillSection,
  GeneratorContext,
  PlateNode,
  PlateText,
  ARTICLE_TITLES,
} from '../types';

/**
 * Abstract Base Generator
 * Provides common functionality for all will section generators
 */
export abstract class BaseGenerator {
  protected context: GeneratorContext;

  constructor(context: GeneratorContext) {
    this.context = context;
  }

  /**
   * Check if this generator should run (has enough data to generate)
   * @returns true if the generator can produce content
   */
  abstract shouldGenerate(): boolean;

  /**
   * Generate the will section
   * @returns WillSection if successful, null if cannot generate
   */
  abstract generate(): WillSection | null;

  /**
   * Get the article type this generator produces
   * @returns The WillArticle type
   */
  abstract getArticle(): WillArticle;

  /**
   * Get the IDs of data sources used in generation
   * Used for tracking what data was used to generate the section
   * @returns Array of IDs (e.g., asset IDs, beneficiary IDs)
   */
  protected abstract getSourceDataIds(): string[];

  /**
   * Create a heading node
   * @param level Heading level (1-3)
   * @param text Heading text
   * @returns PlateNode for heading
   */
  protected createHeading(level: 1 | 2 | 3, text: string): PlateNode {
    return {
      type: `h${level}`,
      children: [{ text }],
    };
  }

  /**
   * Create a paragraph node
   * @param text Paragraph text
   * @param marks Optional text formatting (bold, italic, etc.)
   * @returns PlateNode for paragraph
   */
  protected createParagraph(
    text: string,
    marks?: Partial<PlateText>
  ): PlateNode {
    return {
      type: 'p',
      children: [{ text, ...marks }],
    };
  }

  /**
   * Create a list item node
   * @param text List item text
   * @param marks Optional text formatting
   * @returns PlateNode for list item
   */
  protected createListItem(
    text: string,
    marks?: Partial<PlateText>
  ): PlateNode {
    return {
      type: 'li',
      children: [
        {
          type: 'p',
          children: [{ text, ...marks }],
        },
      ],
    };
  }

  /**
   * Create a bulleted list node
   * @param items Array of list item texts
   * @returns PlateNode for bulleted list
   */
  protected createBulletedList(items: string[]): PlateNode {
    return {
      type: 'ul',
      children: items.map((item) => this.createListItem(item)),
    };
  }

  /**
   * Create a numbered list node
   * @param items Array of list item texts
   * @returns PlateNode for numbered list
   */
  protected createNumberedList(items: string[]): PlateNode {
    return {
      type: 'ol',
      children: items.map((item) => this.createListItem(item)),
    };
  }

  /**
   * Create an empty paragraph (for spacing)
   * @returns PlateNode for empty paragraph
   */
  protected createEmptyParagraph(): PlateNode {
    return {
      type: 'p',
      children: [{ text: '' }],
    };
  }

  /**
   * Build a complete WillSection
   * @param content Array of PlateNodes representing the section content
   * @returns Complete WillSection with metadata
   */
  protected buildSection(content: PlateNode[]): WillSection {
    const article = this.getArticle();

    return {
      article,
      title: ARTICLE_TITLES[article],
      content,
      metadata: {
        generatedAt: new Date(),
        sourceData: this.getSourceDataIds(),
        version: 1,
      },
    };
  }

  /**
   * Format currency amount
   * @param amount Numeric amount
   * @param currency Currency code (defaults to context currency)
   * @returns Formatted currency string
   */
  protected formatCurrency(amount: number, currency?: string): string {
    const curr = currency || this.context.currency;

    // Format based on currency
    if (curr === 'ZAR') {
      return `R ${amount.toLocaleString('en-ZA', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }

    // Default formatting
    return `${curr} ${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  /**
   * Validate allocation percentages sum to 100%
   * @param percentages Array of percentage values
   * @returns true if sum equals 100%
   */
  protected validatePercentageSum(percentages: number[]): boolean {
    const sum = percentages.reduce((acc, val) => acc + val, 0);
    // Allow for small floating point errors
    return Math.abs(sum - 100) < 0.01;
  }

  /**
   * Find beneficiary by ID
   * @param beneficiaryId Beneficiary ID to find
   * @returns Beneficiary object or undefined
   */
  protected findBeneficiary(beneficiaryId: string) {
    return this.context.willContent.beneficiaries.find(
      (b) => b.id === beneficiaryId
    );
  }

  /**
   * Get beneficiary name by ID
   * @param beneficiaryId Beneficiary ID
   * @returns Beneficiary name or 'Unknown Beneficiary'
   */
  protected getBeneficiaryName(beneficiaryId: string): string {
    const beneficiary = this.findBeneficiary(beneficiaryId);
    return beneficiary?.fullName || 'Unknown Beneficiary';
  }

  /**
   * Log warning message
   * @param message Warning message
   */
  protected warn(message: string): void {
    console.warn(`[${this.getArticle()}Generator]`, message);
  }

  /**
   * Log error message
   * @param message Error message
   */
  protected error(message: string): void {
    console.error(`[${this.getArticle()}Generator]`, message);
  }
}
