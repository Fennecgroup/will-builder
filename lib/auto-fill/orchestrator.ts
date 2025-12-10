// Auto-Fill Orchestrator - Main coordinator for will section generation

import type { Value } from '@udecode/plate';
import { WillContent } from '@/lib/types/will';
import {
  WillArticle,
  WillSection,
  AutoFillSuggestion,
  GeneratorContext,
  PlateNode,
} from './types';
import { BaseGenerator } from './generators/base-generator';
import { SpecificBequestsGenerator } from './generators/specific-bequests-generator';
import { ResiduaryEstateGenerator } from './generators/residuary-estate-generator';
import {
  detectSections,
  getSection,
  findInsertionPoint,
} from './section-detector';
import { generateDiff } from './diff-engine';

/**
 * Auto-Fill Orchestrator
 * Coordinates generators, section detection, and diff comparison
 */
export class AutoFillOrchestrator {
  private willContent: WillContent;
  private editorValue: Value;
  private generators: BaseGenerator[];
  private context: GeneratorContext;

  constructor(willContent: WillContent, editorValue: Value) {
    this.willContent = willContent;
    this.editorValue = editorValue;

    // Set up generator context
    this.context = {
      willContent,
      currency: 'ZAR', // Default to South African Rand
      jurisdiction: 'ZA', // Default to South Africa
    };

    // Initialize generators
    this.generators = [
      new SpecificBequestsGenerator(this.context),
      new ResiduaryEstateGenerator(this.context),
    ];
  }

  /**
   * Get all auto-fill suggestions
   * @returns Array of suggestions for sections that can be generated
   */
  getSuggestions(): AutoFillSuggestion[] {
    const suggestions: AutoFillSuggestion[] = [];

    for (const generator of this.generators) {
      // Check if generator should run
      if (!generator.shouldGenerate()) {
        continue;
      }

      // Generate the section
      const section = generator.generate();
      if (!section) {
        continue;
      }

      // Check if section already exists in editor
      const article = generator.getArticle();
      const existingSection = getSection(this.editorValue, article);

      // Create suggestion
      const suggestion: AutoFillSuggestion = {
        section,
        existingContent: existingSection?.content || null,
        generatedContent: section.content,
        diff: existingSection
          ? generateDiff(existingSection.content, section.content)
          : null,
        canAutoApply: !existingSection || !existingSection.hasManualEdits,
      };

      suggestions.push(suggestion);
    }

    return suggestions;
  }

  /**
   * Detect which articles are missing from the editor
   * @returns Array of missing article types
   */
  detectMissingSections(): WillArticle[] {
    const existingSections = detectSections(this.editorValue);
    const existingArticles = existingSections.map((s) => s.article);

    const missing: WillArticle[] = [];

    for (const generator of this.generators) {
      if (generator.shouldGenerate()) {
        const article = generator.getArticle();
        if (!existingArticles.includes(article)) {
          missing.push(article);
        }
      }
    }

    return missing;
  }

  /**
   * Generate a specific section
   * @param article Article type to generate
   * @returns WillSection if successful, null otherwise
   */
  generateSection(article: WillArticle): WillSection | null {
    const generator = this.generators.find(
      (g) => g.getArticle() === article
    );

    if (!generator) {
      console.warn(`No generator found for article: ${article}`);
      return null;
    }

    if (!generator.shouldGenerate()) {
      console.warn(`Generator for ${article} should not generate (insufficient data)`);
      return null;
    }

    return generator.generate();
  }

  /**
   * Apply a generated section to the editor
   * @param article Article type to apply
   * @param mode 'replace' to replace existing, 'merge' to merge (not implemented yet)
   * @returns New editor Value with section applied
   */
  applySection(article: WillArticle, mode: 'replace' | 'merge' = 'replace'): Value {
    // Generate the section
    const section = this.generateSection(article);
    if (!section) {
      console.error(`Failed to generate section for ${article}`);
      return this.editorValue;
    }

    // Get existing section if any
    const existingSection = getSection(this.editorValue, article);

    // Clone editor value
    const nodes = [...(this.editorValue as PlateNode[])];

    if (existingSection) {
      // Replace existing section
      if (mode === 'replace') {
        // Remove existing content
        nodes.splice(
          existingSection.startIndex,
          existingSection.endIndex - existingSection.startIndex + 1
        );

        // Insert new content at same position
        nodes.splice(existingSection.startIndex, 0, ...section.content);
      } else {
        // Merge mode not implemented yet
        console.warn('Merge mode not implemented yet, using replace');
        return this.applySection(article, 'replace');
      }
    } else {
      // Insert new section at appropriate position
      const insertionPoint = findInsertionPoint(this.editorValue, article);

      // Add spacing before section if not at beginning
      if (insertionPoint > 0) {
        nodes.splice(insertionPoint, 0, this.createEmptyParagraph());
      }

      // Insert section content
      nodes.splice(insertionPoint + (insertionPoint > 0 ? 1 : 0), 0, ...section.content);

      // Add spacing after section
      nodes.splice(
        insertionPoint + (insertionPoint > 0 ? 1 : 0) + section.content.length,
        0,
        this.createEmptyParagraph()
      );
    }

    return nodes as Value;
  }

  /**
   * Apply all suggestions
   * @returns New editor Value with all suggestions applied
   */
  applyAllSuggestions(): Value {
    let newValue = this.editorValue;

    const suggestions = this.getSuggestions();

    for (const suggestion of suggestions) {
      // Only auto-apply if safe
      if (suggestion.canAutoApply) {
        // Create new orchestrator with updated value
        const orchestrator = new AutoFillOrchestrator(
          this.willContent,
          newValue
        );
        newValue = orchestrator.applySection(suggestion.section.article);
      }
    }

    return newValue;
  }

  /**
   * Create empty paragraph node
   */
  private createEmptyParagraph(): PlateNode {
    return {
      type: 'p',
      children: [{ text: '' }],
    };
  }

  /**
   * Get generator by article type
   * @param article Article type
   * @returns Generator or undefined
   */
  private getGenerator(article: WillArticle): BaseGenerator | undefined {
    return this.generators.find((g) => g.getArticle() === article);
  }

  /**
   * Check if a specific article can be generated
   * @param article Article type to check
   * @returns true if article can be generated
   */
  canGenerate(article: WillArticle): boolean {
    const generator = this.getGenerator(article);
    return generator ? generator.shouldGenerate() : false;
  }

  /**
   * Get context information
   * @returns Generator context
   */
  getContext(): GeneratorContext {
    return this.context;
  }
}
