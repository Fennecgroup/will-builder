// Document Context Builder Tests
// Run with: npm test -- document-context-builder.test.ts

import { buildDocumentContext } from '../document-context-builder';
import type { Value } from '@udecode/plate';
import type { PlateNode } from '@/lib/auto-fill/types';

describe('buildDocumentContext', () => {
  // Sample editor value with multiple sections
  const sampleEditorValue: Value = [
    {
      type: 'h1',
      children: [{ text: 'LAST WILL AND TESTAMENT' }],
    },
    {
      type: 'p',
      children: [{ text: 'I, [TESTATOR], declare this to be my last will.' }],
    },
    {
      type: 'h2',
      children: [{ text: 'REVOCATION' }],
    },
    {
      type: 'p',
      children: [{ text: 'I revoke all previous wills and codicils.' }],
    },
    {
      type: 'h2',
      children: [{ text: 'APPOINTMENT OF EXECUTOR' }],
    },
    {
      type: 'p',
      children: [
        { text: 'I appoint [EXECUTOR-1] as the executor of this will.' },
      ],
    },
    {
      type: 'h2',
      children: [{ text: 'RESIDUARY ESTATE' }],
    },
    {
      type: 'p',
      children: [
        { text: 'I give the residue of my estate to my beneficiaries in equal shares.' },
      ],
    },
  ] as PlateNode[];

  describe('Basic Functionality', () => {
    it('should build context successfully', () => {
      const context = buildDocumentContext({
        editorValue: sampleEditorValue,
        userCommand: 'update executor',
        tokenBudget: 1700,
      });

      expect(context).toBeDefined();
      expect(context.formattedContext).toBeTruthy();
      expect(context.estimatedTokens).toBeGreaterThan(0);
      expect(context.estimatedTokens).toBeLessThanOrEqual(1700);
    });

    it('should include document outline', () => {
      const context = buildDocumentContext({
        editorValue: sampleEditorValue,
        userCommand: 'add beneficiary',
        tokenBudget: 1700,
      });

      expect(context.documentOutline).toBeDefined();
      expect(context.documentOutline.length).toBeGreaterThan(0);
      expect(context.formattedContext).toContain('DOCUMENT STRUCTURE');
    });

    it('should stay within token budget', () => {
      const budget = 1000;
      const context = buildDocumentContext({
        editorValue: sampleEditorValue,
        userCommand: 'edit will',
        tokenBudget: budget,
      });

      expect(context.estimatedTokens).toBeLessThanOrEqual(budget * 1.1); // 10% tolerance
    });
  });

  describe('Active Section Detection', () => {
    it('should identify active section when selection index provided', () => {
      // Selection index pointing to EXECUTORS section (around index 4-5)
      const context = buildDocumentContext({
        editorValue: sampleEditorValue,
        userCommand: 'change executor name',
        activeSelectionIndex: 5,
        tokenBudget: 1700,
      });

      expect(context.activeSectionArticle).toBe('EXECUTORS');
      expect(context.activeSectionContent).toBeTruthy();
    });

    it('should handle missing active section gracefully', () => {
      const context = buildDocumentContext({
        editorValue: sampleEditorValue,
        userCommand: 'edit document',
        // No activeSelectionIndex provided
        tokenBudget: 1700,
      });

      // Should still build context, just without specific active section
      expect(context).toBeDefined();
      expect(context.formattedContext).toBeTruthy();
    });
  });

  describe('Relevance Scoring', () => {
    it('should prioritize executor section for executor-related commands', () => {
      const context = buildDocumentContext({
        editorValue: sampleEditorValue,
        userCommand: 'update executor information',
        tokenBudget: 1700,
      });

      // Should include executor section in related sections or as active
      const hasExecutorContext =
        context.activeSectionArticle === 'EXECUTORS' ||
        context.relatedSectionsSummaries.some(s => s.article === 'EXECUTORS');

      expect(hasExecutorContext).toBe(true);
    });

    it('should prioritize residuary section for beneficiary commands', () => {
      const context = buildDocumentContext({
        editorValue: sampleEditorValue,
        userCommand: 'add beneficiary to residuary estate',
        tokenBudget: 1700,
      });

      const hasResiduaryContext =
        context.activeSectionArticle === 'RESIDUARY_ESTATE' ||
        context.relatedSectionsSummaries.some(s => s.article === 'RESIDUARY_ESTATE');

      expect(hasResiduaryContext).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty editor value', () => {
      const emptyValue: Value = [
        {
          type: 'p',
          children: [{ text: '' }],
        },
      ] as PlateNode[];

      const context = buildDocumentContext({
        editorValue: emptyValue,
        userCommand: 'start writing',
        tokenBudget: 1700,
      });

      expect(context).toBeDefined();
      expect(context.estimatedTokens).toBeGreaterThan(0);
    });

    it('should handle very large documents', () => {
      // Create a large document by repeating sections
      const largeDoc: PlateNode[] = [];
      for (let i = 0; i < 20; i++) {
        largeDoc.push(...(sampleEditorValue as PlateNode[]));
      }

      const context = buildDocumentContext({
        editorValue: largeDoc as Value,
        userCommand: 'edit will',
        tokenBudget: 1700,
      });

      expect(context).toBeDefined();
      expect(context.estimatedTokens).toBeLessThanOrEqual(1700 * 1.1);
    });

    it('should handle low token budget', () => {
      const context = buildDocumentContext({
        editorValue: sampleEditorValue,
        userCommand: 'edit',
        tokenBudget: 200, // Very low budget
      });

      expect(context).toBeDefined();
      expect(context.estimatedTokens).toBeLessThanOrEqual(200 * 1.2); // 20% tolerance
    });
  });

  describe('Context Formatting', () => {
    it('should format context as markdown', () => {
      const context = buildDocumentContext({
        editorValue: sampleEditorValue,
        userCommand: 'update will',
        tokenBudget: 1700,
      });

      expect(context.formattedContext).toContain('##'); // Markdown headers
      expect(context.formattedContext).toContain('DOCUMENT STRUCTURE');
    });

    it('should include related sections summaries', () => {
      const context = buildDocumentContext({
        editorValue: sampleEditorValue,
        userCommand: 'update executor and beneficiaries',
        tokenBudget: 1700,
      });

      expect(context.relatedSectionsSummaries.length).toBeGreaterThan(0);

      if (context.relatedSectionsSummaries.length > 0) {
        expect(context.formattedContext).toContain('RELATED SECTIONS');
      }
    });
  });

  describe('Token Estimation', () => {
    it('should provide reasonable token estimates', () => {
      const context = buildDocumentContext({
        editorValue: sampleEditorValue,
        userCommand: 'edit',
        tokenBudget: 1700,
      });

      // Token estimate should be positive and reasonable (not 0 or astronomical)
      expect(context.estimatedTokens).toBeGreaterThan(50);
      expect(context.estimatedTokens).toBeLessThan(5000);
    });

    it('should estimate less tokens for compressed content', () => {
      const fullContext = buildDocumentContext({
        editorValue: sampleEditorValue,
        userCommand: 'complete rewrite',
        tokenBudget: 5000, // High budget
      });

      const compressedContext = buildDocumentContext({
        editorValue: sampleEditorValue,
        userCommand: 'complete rewrite',
        tokenBudget: 500, // Low budget
      });

      expect(compressedContext.estimatedTokens).toBeLessThan(fullContext.estimatedTokens);
    });
  });
});
