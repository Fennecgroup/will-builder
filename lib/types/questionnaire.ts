// Questionnaire Module - Type Definitions
// Defines types for detecting missing information and collecting user answers

import { Address } from './will';
import { Child, Beneficiary, Executor, Guardian } from './will';

/**
 * Types of questions that can be asked
 * Extensible for future question types
 */
export type QuestionType =
  | 'guardian-appointment'
  | 'trustee-appointment'
  | 'same-person-guardian-trustee'
  | 'executor-appointment'
  | 'witness-appointment'
  | 'beneficiary-details';

/**
 * Individual question in the questionnaire
 */
export interface QuestionnaireQuestion {
  id: string;
  type: QuestionType;
  priority: number; // Lower = higher priority (1 = highest)
  title: string;
  description: string;
  required: boolean;
  dependsOn?: string[]; // Question IDs that must be answered first
  // Contextual data for the question
  context: {
    minorChildren?: Child[];
    minorBeneficiaries?: Beneficiary[];
    guardianId?: string; // For trustee question if guardian exists
    guardianName?: string; // For display purposes
  };
}

/**
 * User's answer to a question
 */
export interface QuestionnaireAnswer {
  questionId: string;
  questionType: QuestionType;
  timestamp: Date;
  data: GuardianAnswer | TrusteeAnswer | SamePersonAnswer | ExecutorAnswer;
}

/**
 * Answer for guardian appointment question
 */
export interface GuardianAnswer {
  guardian: Omit<Guardian, 'id'>; // Will generate ID on save
  alternateGuardian?: Omit<Guardian, 'id'>;
}

/**
 * Trustee interface (similar to Guardian but for financial management)
 */
export interface Trustee {
  id: string;
  fullName: string;
  idNumber: string; // Required for SA
  relationship: string;
  address: Address;
  phone: string;
  email?: string;
  forBeneficiaries: string[]; // IDs of minor beneficiaries
  isAlternate?: boolean;
  // Special flag for when trustee is same as guardian
  isGuardian?: boolean;
  guardianId?: string; // If trustee is guardian, reference guardian ID
}

/**
 * Answer for trustee appointment question
 */
export interface TrusteeAnswer {
  trustee: Omit<Trustee, 'id'>;
  alternateTrustee?: Omit<Trustee, 'id'>;
}

/**
 * Answer for same-person (guardian as trustee) question
 */
export interface SamePersonAnswer {
  useSamePersonForTrustee: boolean;
  guardianId?: string; // If yes, which guardian to use
}

/**
 * Answer for executor appointment question
 */
export interface ExecutorAnswer {
  executor: Omit<Executor, 'id'>;
  alternateExecutor?: Omit<Executor, 'id'>;
}

/**
 * Context returned from missing info detection
 */
export interface MissingInfoContext {
  gaps: MissingInfoGap[];
  questions: QuestionnaireQuestion[];
  priority: 'critical' | 'important' | 'recommended';
}

/**
 * Identified gap in will data
 */
export interface MissingInfoGap {
  type: 'guardian' | 'trustee' | 'executor' | 'witness' | 'beneficiary-details';
  severity: 'critical' | 'important' | 'optional';
  reason: string;
  affectedItems: string[]; // IDs of children/beneficiaries affected
}
