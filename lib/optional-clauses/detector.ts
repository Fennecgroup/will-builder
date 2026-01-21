import {
  OptionalClauseType,
  OptionalClauseSelection,
} from '@/lib/types/optional-clauses';
import {
  QuestionnaireQuestion,
  MissingInfoContext,
  MissingInfoGap,
} from '@/lib/types/questionnaire';
import { getClauseDefinition } from './clause-definitions';

/**
 * OptionalClausesDetector
 * Generates questions for selected optional clauses and detects incomplete clauses
 */
export class OptionalClausesDetector {
  /**
   * Generate a question for a specific clause type
   */
  generateQuestionForClause(
    clauseType: OptionalClauseType
  ): QuestionnaireQuestion | null {
    const clauseDefinition = getClauseDefinition(clauseType);
    if (!clauseDefinition || !clauseDefinition.requiresQuestionnaire) {
      return null;
    }

    switch (clauseType) {
      case 'living-will':
        return {
          id: `optional-clause-${clauseType}`,
          type: 'living-will-directives',
          priority: 10, // Lower priority than critical missing info
          title: 'Living Will Directives',
          description:
            'Specify your end-of-life medical care preferences and directives',
          required: true, // Required once clause is selected
          context: {},
        };

      case 'pet-care-provision':
        // TODO: Implement when pet care questionnaire is ready
        return null;

      case 'extended-burial-instructions':
        // TODO: Implement when burial instructions questionnaire is ready
        return null;

      case 'no-contest-clause':
        // TODO: Implement when no-contest questionnaire is ready
        return null;

      default:
        return null;
    }
  }

  /**
   * Analyze selected optional clauses and return missing info context
   * for clauses that are selected but not yet completed
   */
  analyze(
    selectedClauses: OptionalClauseSelection[] = []
  ): MissingInfoContext | null {
    // Filter for selected but incomplete clauses that REQUIRE questionnaires
    const incompleteClauses = selectedClauses.filter((clause) => {
      if (!clause.isSelected || clause.questionnaireCompleted) {
        return false;
      }
      const clauseDefinition = getClauseDefinition(clause.clauseType);
      // Only include clauses that require questionnaires
      return clauseDefinition?.requiresQuestionnaire ?? false;
    });

    if (incompleteClauses.length === 0) {
      return null;
    }

    const gaps: MissingInfoGap[] = [];
    const questions: QuestionnaireQuestion[] = [];

    for (const clause of incompleteClauses) {
      const clauseDefinition = getClauseDefinition(clause.clauseType);
      if (!clauseDefinition) continue;

      // Add a gap for this incomplete clause
      gaps.push({
        type: 'beneficiary-details', // Generic type, could be more specific
        severity: 'optional', // Optional clauses are not critical
        reason: `${clauseDefinition.title} requires additional information`,
        affectedItems: [clause.clauseType],
      });

      // Generate the question for this clause
      const question = this.generateQuestionForClause(clause.clauseType);
      if (question) {
        questions.push(question);
      }
    }

    if (gaps.length === 0 && questions.length === 0) {
      return null;
    }

    return {
      gaps,
      questions,
      priority: 'recommended', // Optional clauses are recommended, not critical
    };
  }

  /**
   * Check if a specific clause is complete
   */
  isClauseComplete(
    clauseType: OptionalClauseType,
    selectedClauses: OptionalClauseSelection[] = []
  ): boolean {
    const clause = selectedClauses.find((c) => c.clauseType === clauseType);
    return clause?.questionnaireCompleted ?? false;
  }

  /**
   * Get all selected clauses
   */
  getSelectedClauses(
    selectedClauses: OptionalClauseSelection[] = []
  ): OptionalClauseSelection[] {
    return selectedClauses.filter((clause) => clause.isSelected);
  }

  /**
   * Get all completed clauses
   */
  getCompletedClauses(
    selectedClauses: OptionalClauseSelection[] = []
  ): OptionalClauseSelection[] {
    return selectedClauses.filter(
      (clause) => clause.isSelected && clause.questionnaireCompleted
    );
  }

  /**
   * Get all incomplete clauses (selected but not completed, and require questionnaires)
   */
  getIncompleteClauses(
    selectedClauses: OptionalClauseSelection[] = []
  ): OptionalClauseSelection[] {
    return selectedClauses.filter((clause) => {
      if (!clause.isSelected || clause.questionnaireCompleted) {
        return false;
      }
      const clauseDefinition = getClauseDefinition(clause.clauseType);
      // Only include clauses that require questionnaires
      return clauseDefinition?.requiresQuestionnaire ?? false;
    });
  }
}
