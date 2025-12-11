// Questionnaire Orchestrator
// Manages question flow, dependencies, and answer collection

import { WillContent, Guardian, Trustee, Executor } from '@/lib/types/will';
import {
  QuestionnaireQuestion,
  QuestionnaireAnswer,
  GuardianAnswer,
  TrusteeAnswer,
  SamePersonAnswer,
  ExecutorAnswer,
} from '@/lib/types/questionnaire';

/**
 * QuestionnaireOrchestrator
 * Manages question flow, dependencies, and answer collection
 */
export class QuestionnaireOrchestrator {
  private questions: QuestionnaireQuestion[];
  private answers: Map<string, QuestionnaireAnswer>;
  public currentQuestionIndex: number;

  constructor(questions: QuestionnaireQuestion[]) {
    this.questions = questions.sort((a, b) => a.priority - b.priority);
    this.answers = new Map();
    this.currentQuestionIndex = 0;
  }

  /**
   * Get current question
   */
  getCurrentQuestion(): QuestionnaireQuestion | null {
    if (this.currentQuestionIndex >= this.questions.length) {
      return null; // All questions answered
    }

    const question = this.questions[this.currentQuestionIndex];

    // Check if dependencies are satisfied
    if (question.dependsOn && question.dependsOn.length > 0) {
      const allDependenciesMet = question.dependsOn.every((depId) =>
        this.answers.has(depId)
      );

      if (!allDependenciesMet) {
        // Skip this question for now, move to next
        this.currentQuestionIndex++;
        return this.getCurrentQuestion();
      }
    }

    return question;
  }

  /**
   * Answer current question and move to next
   */
  answerQuestion(questionId: string, data: any): void {
    const question = this.questions.find((q) => q.id === questionId);
    if (!question) {
      throw new Error(`Question ${questionId} not found`);
    }

    const answer: QuestionnaireAnswer = {
      questionId,
      questionType: question.type,
      timestamp: new Date(),
      data,
    };

    this.answers.set(questionId, answer);
    this.currentQuestionIndex++;
  }

  /**
   * Skip optional question
   */
  skipQuestion(): void {
    const question = this.getCurrentQuestion();
    if (question && !question.required) {
      this.currentQuestionIndex++;
    }
  }

  /**
   * Go back to previous question
   */
  previousQuestion(): boolean {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      return true;
    }
    return false;
  }

  /**
   * Check if questionnaire is complete
   */
  isComplete(): boolean {
    // All required questions must be answered
    const requiredQuestions = this.questions.filter((q) => q.required);
    return requiredQuestions.every((q) => this.answers.has(q.id));
  }

  /**
   * Get progress percentage
   */
  getProgress(): number {
    return Math.round((this.currentQuestionIndex / this.questions.length) * 100);
  }

  /**
   * Get all answers
   */
  getAnswers(): QuestionnaireAnswer[] {
    return Array.from(this.answers.values());
  }

  /**
   * Transform answers into WillContent updates
   */
  toWillContentUpdates(currentWillContent: WillContent): Partial<WillContent> {
    const updates: Partial<WillContent> = {};

    for (const answer of this.answers.values()) {
      switch (answer.questionType) {
        case 'guardian-appointment':
          const guardianAnswer = answer.data as GuardianAnswer;
          const newGuardians: Guardian[] = [
            {
              ...guardianAnswer.guardian,
              id: this.generateId(),
            } as Guardian,
          ];

          if (guardianAnswer.alternateGuardian) {
            newGuardians.push({
              ...guardianAnswer.alternateGuardian,
              id: this.generateId(),
              isAlternate: true,
            } as Guardian);
          }

          updates.guardians = newGuardians;
          break;

        case 'trustee-appointment':
          const trusteeAnswer = answer.data as TrusteeAnswer;
          const newTrustees: Trustee[] = [
            {
              ...trusteeAnswer.trustee,
              id: this.generateId(),
            } as Trustee,
          ];

          if (trusteeAnswer.alternateTrustee) {
            newTrustees.push({
              ...trusteeAnswer.alternateTrustee,
              id: this.generateId(),
              isAlternate: true,
            } as Trustee);
          }

          updates.trustees = newTrustees;
          break;

        case 'same-person-guardian-trustee':
          const samePersonAnswer = answer.data as SamePersonAnswer;
          if (
            samePersonAnswer.useSamePersonForTrustee &&
            samePersonAnswer.guardianId
          ) {
            // Find guardian and create trustee from guardian data
            const guardian = currentWillContent.guardians?.find(
              (g) => g.id === samePersonAnswer.guardianId
            );

            if (guardian) {
              const guardianAsTrustee: Trustee = {
                id: this.generateId(),
                fullName: guardian.fullName,
                idNumber: guardian.idNumber,
                relationship: guardian.relationship,
                address: guardian.address,
                phone: guardian.phone,
                email: guardian.email,
                forBeneficiaries:
                  currentWillContent.children
                    ?.filter((c) => c.isMinor)
                    .map((c) => c.id) || [],
                isGuardian: true,
                guardianId: guardian.id,
              };

              updates.trustees = [guardianAsTrustee];
            }
          }
          break;

        case 'executor-appointment':
          const executorAnswer = answer.data as ExecutorAnswer;
          const newExecutors: Executor[] = [
            {
              ...executorAnswer.executor,
              id: this.generateId(),
            } as Executor,
          ];

          if (executorAnswer.alternateExecutor) {
            newExecutors.push({
              ...executorAnswer.alternateExecutor,
              id: this.generateId(),
              isAlternate: true,
            } as Executor);
          }

          updates.executors = newExecutors;
          break;
      }
    }

    return updates;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
