// Initial Document Generator
// Service for generating complete initial will documents from testator data

import type { Value } from '@udecode/plate';
import { WillContent } from '@/lib/types/will';
import { AutoFillOrchestrator } from '@/lib/auto-fill';

/**
 * Initial Document Generator
 * Generates a complete will document from testator data
 * Uses the AutoFillOrchestrator to coordinate all generators
 */
export class InitialDocumentGenerator {
  /**
   * Generate a complete will document from testator data
   * @param willContent Testator data and will content
   * @returns Plate.js Value (editor content) with all generated sections
   */
  static generate(willContent: WillContent): Value {
    try {
      // Create orchestrator with empty editor value
      // (we're generating from scratch, not comparing to existing content)
      const orchestrator = new AutoFillOrchestrator(willContent, []);

      // Generate full document
      const document = orchestrator.generateFullDocument();

      return document;
    } catch (error) {
      console.error('Error generating initial document:', error);

      // Return empty document on error
      return [
        {
          type: 'p',
          children: [{ text: '' }],
        },
      ] as Value;
    }
  }

  /**
   * Check if willContent has sufficient data to generate a meaningful document
   * @param willContent Testator data to check
   * @returns true if minimum data requirements are met
   */
  static hasMinimumData(willContent: WillContent): boolean {
    // At minimum, need testator name to generate anything meaningful
    return !!(willContent.testator && willContent.testator.fullName);
  }
}
