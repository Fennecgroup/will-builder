import { WillArticle } from '../auto-fill/types';

/**
 * Types of optional clauses that can be added to a will
 */
export type OptionalClauseType =
  | 'living-will'
  | 'pet-care-provision'
  | 'extended-burial-instructions'
  | 'no-contest-clause';
  // Extensible for future clauses

/**
 * Categories for organizing optional clauses
 */
export type OptionalClauseCategory =
  | 'medical'
  | 'assets'
  | 'family'
  | 'legal-protection'
  | 'other';

/**
 * Definition of an optional clause type
 */
export interface OptionalClauseDefinition {
  type: OptionalClauseType;
  title: string;
  description: string;
  legalDescription: string;
  category: OptionalClauseCategory;
  icon: string; // Lucide icon name
  requiresQuestionnaire: boolean;
  jurisdictionSupport: string[];
  article: WillArticle;
  priority: number; // Lower numbers appear first in lists
}

/**
 * A user's selection of an optional clause
 */
export interface OptionalClauseSelection {
  clauseType: OptionalClauseType;
  isSelected: boolean;
  questionnaireCompleted: boolean;
  data?: any;
  addedAt: Date;
}

/**
 * Living Will medical directives data
 */
export interface LivingWillDirectives {
  noLifeSupportIfTerminal: boolean;
  organDonation: boolean;
  painManagement: 'comfort-care' | 'aggressive' | 'minimal';
  resuscitation: boolean;
  artificialNutrition: boolean;
  specificInstructions?: string;
}

/**
 * Pet care provision data (for future implementation)
 */
export interface PetCareProvision {
  hasPets: boolean;
  petDetails?: string;
  caregiverId?: string;
  caregiverName?: string;
  fundingAmount?: number;
  specificInstructions?: string;
}

/**
 * Extended burial instructions data (for future implementation)
 */
export interface ExtendedBurialInstructions {
  ceremonyType?: 'religious' | 'secular' | 'none';
  specificRites?: string;
  locationPreference?: string;
  monumentInstructions?: string;
  musicPreferences?: string;
  additionalWishes?: string;
}

/**
 * No-contest clause data (for future implementation)
 */
export interface NoContestClauseData {
  penaltyType: 'forfeit-all' | 'forfeit-partial' | 'reduce-by-percentage';
  penaltyPercentage?: number;
  exceptions?: string[];
  specificConditions?: string;
}
