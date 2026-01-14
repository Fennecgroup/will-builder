// Missing Information Detector
// Analyzes WillContent to identify gaps requiring user input

import { WillContent } from '@/lib/types/will';
import {
  MissingInfoContext,
  MissingInfoGap,
  QuestionnaireQuestion,
} from '@/lib/types/questionnaire';

/**
 * MissingInfoDetector
 * Analyzes WillContent to identify gaps requiring user input
 */
export class MissingInfoDetector {
  private willContent: WillContent;
  private questionIdMap: Map<string, string> = new Map();

  constructor(willContent: WillContent) {
    this.willContent = willContent;
  }

  /**
   * Analyze will content for missing critical information
   * @returns MissingInfoContext with all gaps and suggested questions
   */
  analyze(): MissingInfoContext {
    const gaps: MissingInfoGap[] = [];

    // Check for guardian gap
    const guardianGap = this.detectGuardianGap();
    if (guardianGap) gaps.push(guardianGap);

    // Check for trustee gap
    const trusteeGap = this.detectTrusteeGap();
    if (trusteeGap) gaps.push(trusteeGap);

    // Check for executor gap
    const executorGap = this.detectExecutorGap();
    if (executorGap) gaps.push(executorGap);

    // Generate questions from gaps
    const questions = this.generateQuestionsFromGaps(gaps);

    // Determine priority
    const priority = this.determinePriority(gaps);

    return { gaps, questions, priority };
  }

  /**
   * Detect if guardian is needed but missing
   * Logic: Ask if there are minor children (backup guardian appointment)
   */
  private detectGuardianGap(): MissingInfoGap | null {
    const children = this.willContent.children || [];
    const guardians = this.willContent.guardians || [];

    // Check for minor children
    const minorChildren = children.filter((c) => c.isMinor === true);
    if (minorChildren.length === 0) {
      return null; // No minors, no guardian needed
    }

    // Guardian is a backup appointment regardless of marital status
    // It only takes effect if there's no natural parental guardian

    // Check if guardians are defined
    const hasValidGuardian =
      guardians.length > 0 && guardians.some((g) => g.fullName && g.idNumber);

    if (!hasValidGuardian) {
      return {
        type: 'guardian',
        severity: 'critical',
        reason: `You have ${minorChildren.length} minor child(ren). Please nominate a backup guardian in case no natural parental guardian is available.`,
        affectedItems: minorChildren.map((c) => c.id),
      };
    }

    return null;
  }

  /**
   * Detect if trustee is needed but missing
   * Logic: Needed if minor children exist (regardless of spouse)
   * AND there's no trustee appointed for managing inheritance
   */
  private detectTrusteeGap(): MissingInfoGap | null {
    const children = this.willContent.children || [];
    const beneficiaries = this.willContent.beneficiaries || [];
    const trustees = this.willContent.trustees || [];

    // Check for minors who might inherit
    const minorChildren = children.filter((c) => c.isMinor === true);
    const minorBeneficiaries = beneficiaries.filter((b) => b.isMinor === true);

    const totalMinors = new Set([
      ...minorChildren.map((c) => c.id),
      ...minorBeneficiaries.map((b) => b.id),
    ]).size;

    if (totalMinors === 0) {
      return null; // No minors, no trustee needed
    }

    // Check minor provisions
    const provisions = this.willContent.minorBeneficiaryProvisions;
    const usesTestamentaryTrust = provisions?.method === 'testamentary-trust';

    // If using testamentary trust but no trustee appointed
    if (usesTestamentaryTrust && (!trustees || trustees.length === 0)) {
      return {
        type: 'trustee',
        severity: 'critical',
        reason:
          'You are using a testamentary trust for minor inheritance but no trustee is appointed.',
        affectedItems: [
          ...minorChildren.map((c) => c.id),
          ...minorBeneficiaries.map((b) => b.id),
        ],
      };
    }

    // If minors exist but no provision method specified or no trustees
    if ((!provisions || !provisions.method) && trustees.length === 0) {
      return {
        type: 'trustee',
        severity: 'important',
        reason: `You have ${totalMinors} minor(s) but haven't specified how their inheritance will be managed.`,
        affectedItems: [
          ...minorChildren.map((c) => c.id),
          ...minorBeneficiaries.map((b) => b.id),
        ],
      };
    }

    return null;
  }

  /**
   * Detect if executor is missing
   */
  private detectExecutorGap(): MissingInfoGap | null {
    const executors = this.willContent.executors || [];

    if (
      executors.length === 0 ||
      !executors.some((e) => e.fullName && e.idNumber)
    ) {
      return {
        type: 'executor',
        severity: 'critical',
        reason: 'Every will must have at least one executor appointed.',
        affectedItems: [],
      };
    }

    return null;
  }

  /**
   * Generate questionnaire questions from detected gaps
   */
  private generateQuestionsFromGaps(
    gaps: MissingInfoGap[]
  ): QuestionnaireQuestion[] {
    const questions: QuestionnaireQuestion[] = [];
    let priority = 1;

    // Clear previous IDs
    this.questionIdMap.clear();

    for (const gap of gaps) {
      if (gap.type === 'guardian') {
        const question = this.createGuardianQuestion(gap, priority++);
        this.questionIdMap.set('guardian', question.id);
        questions.push(question);
      } else if (gap.type === 'trustee') {
        // Check if guardian exists - if so, add same-person question first
        const hasGuardian =
          this.willContent.guardians && this.willContent.guardians.length > 0;

        if (hasGuardian) {
          // Ask if trustee should be same as guardian
          const samePersonQuestion = this.createSamePersonQuestion(gap, priority++);
          this.questionIdMap.set('same-person', samePersonQuestion.id);
          questions.push(samePersonQuestion);
        }

        // Add trustee question (will be conditional on same-person answer)
        const trusteeQuestion = this.createTrusteeQuestion(gap, priority++, hasGuardian);
        this.questionIdMap.set('trustee', trusteeQuestion.id);
        questions.push(trusteeQuestion);
      } else if (gap.type === 'executor') {
        const question = this.createExecutorQuestion(gap, priority++);
        this.questionIdMap.set('executor', question.id);
        questions.push(question);
      }
    }

    return questions;
  }

  /**
   * Create guardian question
   */
  private createGuardianQuestion(
    gap: MissingInfoGap,
    priority: number
  ): QuestionnaireQuestion {
    const minorChildren = (this.willContent.children || []).filter(
      (c) => c.isMinor
    );

    return {
      id: `guardian-${Date.now()}`,
      type: 'guardian-appointment',
      priority,
      title: 'Appoint Guardian for Minor Children',
      description: `You have ${minorChildren.length} minor child(ren). Please nominate a backup guardian who will serve only if no natural parental guardian is available.`,
      required: true,
      context: {
        minorChildren,
      },
    };
  }

  /**
   * Create same-person question (guardian as trustee)
   */
  private createSamePersonQuestion(
    gap: MissingInfoGap,
    priority: number
  ): QuestionnaireQuestion {
    const guardian = this.willContent.guardians?.[0];

    return {
      id: `same-person-${Date.now()}`,
      type: 'same-person-guardian-trustee',
      priority,
      title: 'Trustee Appointment',
      description: `Should ${
        guardian?.fullName || 'the guardian'
      } also manage the financial inheritance for the minor children?`,
      required: true,
      context: {
        guardianId: guardian?.id,
        guardianName: guardian?.fullName,
      },
    };
  }

  /**
   * Create trustee question
   */
  private createTrusteeQuestion(
    gap: MissingInfoGap,
    priority: number,
    hasGuardian: boolean
  ): QuestionnaireQuestion {
    const minorBeneficiaries = (this.willContent.beneficiaries || []).filter(
      (b) => b.isMinor
    );

    return {
      id: `trustee-${Date.now()}`,
      type: 'trustee-appointment',
      priority,
      title: 'Appoint Trustee for Financial Management',
      description: hasGuardian
        ? 'If you prefer a different person to manage finances, please specify:'
        : 'Who should manage the inheritance for minor beneficiaries until they reach age 18?',
      required: !hasGuardian, // Required only if no guardian to default to
      dependsOn: hasGuardian ? [this.questionIdMap.get('same-person')!] : undefined,
      context: {
        minorBeneficiaries,
      },
    };
  }

  /**
   * Create executor question
   */
  private createExecutorQuestion(
    gap: MissingInfoGap,
    priority: number
  ): QuestionnaireQuestion {
    return {
      id: `executor-${Date.now()}`,
      type: 'executor-appointment',
      priority,
      title: 'Appoint Executor',
      description: 'Who should execute your will and manage your estate?',
      required: true,
      context: {},
    };
  }

  /**
   * Determine overall priority
   */
  private determinePriority(
    gaps: MissingInfoGap[]
  ): 'critical' | 'important' | 'recommended' {
    const hasCritical = gaps.some((g) => g.severity === 'critical');
    const hasImportant = gaps.some((g) => g.severity === 'important');

    if (hasCritical) return 'critical';
    if (hasImportant) return 'important';
    return 'recommended';
  }
}
