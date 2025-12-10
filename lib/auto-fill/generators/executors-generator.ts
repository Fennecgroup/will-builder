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
    const executors = this.context.willContent.executors || [];

    // Article heading
    content.push(this.createHeading(2, 'ARTICLE IV - APPOINTMENT OF EXECUTOR'));
    content.push(this.createEmptyParagraph());

    // Executor appointment text
    const executorText = formatExecutorAppointment(executors);

    if (executorText) {
      content.push(this.createParagraph(executorText));
    }

    return content;
  }
}
