// Executors Generator (Article IV)
// Generates executor appointment clause

import { WillArticle, WillSection, PlateNode } from '../types';
import { BaseGenerator } from './base-generator';
import { formatExecutorAppointment } from '../legal-templates/south-african';

/**
 * Executors Generator
 * Generates Article IV - Executor Appointment
 * Requires: executors array with at least one executor
 */
export class ExecutorsGenerator extends BaseGenerator {
  /**
   * Check if generator should run
   * Requires at least one executor
   */
  shouldGenerate(): boolean {
    // Always generate for mutual wills with one spouse
    if (this.isMutualWillWithOneSpouse()) {
      return true;
    }

    // Existing validation for individual wills
    const executors = this.context.willContent.executors;

    if (!executors || executors.length === 0) {
      this.warn('No executors defined');
      return false;
    }

    // Check if at least one executor has a name
    const hasValidExecutor = executors.some((e) => e.fullName);
    if (!hasValidExecutor) {
      this.warn('No executor with valid name found');
      return false;
    }

    return true;
  }

  /**
   * Check if this is a mutual/joint will with exactly one spouse
   */
  private isMutualWillWithOneSpouse(): boolean {
    const willType = this.context.willContent.willType;
    const marriage = this.context.willContent.marriage;

    return !!(
      (willType === 'mutual' || willType === 'joint') &&
      marriage?.status === 'married' &&
      marriage?.spouses &&
      marriage.spouses.length === 1
    );
  }

  /**
   * Generate Article IV - Executors
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
    return 'EXECUTORS';
  }

  /**
   * Get source data IDs
   */
  protected getSourceDataIds(): string[] {
    const executors = this.context.willContent.executors || [];
    return executors.map((e) => e.id);
  }

  /**
   * Generate content nodes for Article IV
   */
  private generateContent() {
    const content: PlateNode[] = [];
    let executors = this.context.willContent.executors || [];

    // Article heading
    content.push(this.createHeading(2, 'ARTICLE IV - APPOINTMENT OF EXECUTOR'));
    content.push(this.createEmptyParagraph());

    // Auto-generate surviving spouse executor for mutual wills
    if (this.isMutualWillWithOneSpouse()) {
      const spouse = this.context.willContent.marriage?.spouses?.[0];

      if (executors.length === 0) {
        // No executors defined - create virtual surviving spouse executor
        executors = [
          {
            id: 'surviving-spouse-executor',
            fullName: spouse?.fullName || 'Surviving Spouse',
            idNumber: spouse?.idNumber || '',
            relationship: 'Spouse',
            address: this.context.willContent.testator.address,
            phone: '',
            email: '',
            isAlternate: false,
            isSurvivingSpouse: true,
          },
        ];
      } else {
        // Mark spouse as surviving spouse if already in executors
        executors = executors.map((exec) => {
          const isSpouse = this.isExecutorTheSpouse(exec);
          return { ...exec, isSurvivingSpouse: isSpouse };
        });
      }
    }

    // Executor appointment text
    const executorText = formatExecutorAppointment(executors);

    if (executorText) {
      content.push(this.createParagraph(executorText));
    }

    return content;
  }

  /**
   * Check if executor is the spouse (matches by name or relationship)
   */
  private isExecutorTheSpouse(executor: any): boolean {
    const spouse = this.context.willContent.marriage?.spouses?.[0];
    if (!spouse) return false;

    // Match by full name
    if (executor.fullName === spouse.fullName) {
      return true;
    }

    // Match by relationship field
    const rel = executor.relationship?.toLowerCase() || '';
    return rel.includes('spouse') || rel.includes('wife') || rel.includes('husband');
  }
}
