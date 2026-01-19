import {
  OptionalClauseDefinition,
  OptionalClauseType,
  OptionalClauseCategory,
} from '@/lib/types/optional-clauses';

/**
 * Registry of all available optional clauses
 * This is the single source of truth for optional clause definitions
 */
export const OPTIONAL_CLAUSES: OptionalClauseDefinition[] = [
  {
    type: 'living-will',
    title: 'Living Will',
    description: 'Specify your end-of-life medical care preferences and directives',
    legalDescription: `A living will (also known as an advance directive) allows you to document your wishes regarding medical treatment in situations where you cannot communicate these wishes yourself. This is legally recognized in South Africa under Section 7 of the National Health Act.

This clause will include:
• Life support preferences if terminally ill
• Organ donation consent
• Pain management preferences
• Resuscitation directives (CPR)
• Artificial nutrition and hydration preferences
• Any specific medical instructions

Your directives will be legally binding and must be honored by medical professionals when you are unable to make decisions.`,
    category: 'medical',
    icon: 'HeartPulse',
    requiresQuestionnaire: true,
    jurisdictionSupport: ['ZA'],
    article: 'LIVING_WILL',
    priority: 1,
  },
  {
    type: 'pet-care-provision',
    title: 'Pet Care Provision',
    description: 'Ensure your pets are cared for after you pass away',
    legalDescription: `Make specific arrangements for the care of your pets after your death. This clause allows you to:

• Designate a caregiver for your pets
• Allocate funds for their ongoing care
• Provide specific care instructions
• Name alternate caregivers if needed

While pets cannot directly inherit under South African law, you can create a legally binding trust or bequest to ensure funds are available for their care.`,
    category: 'family',
    icon: 'Dog',
    requiresQuestionnaire: true,
    jurisdictionSupport: ['ZA'],
    article: 'LIVING_WILL', // Will be changed when pet care generator is created
    priority: 2,
  },
  {
    type: 'extended-burial-instructions',
    title: 'Extended Burial Instructions',
    description: 'Provide detailed funeral and burial preferences beyond basic wishes',
    legalDescription: `Expand on your funeral wishes with specific instructions including:

• Type of ceremony (religious, secular, or none)
• Specific religious rites or customs
• Preferred location for burial/cremation
• Monument or memorial instructions
• Music, readings, or other ceremony details
• Additional personal wishes

These instructions supplement the basic funeral wishes in your will and provide your family with clear guidance during a difficult time.`,
    category: 'other',
    icon: 'Flower2',
    requiresQuestionnaire: true,
    jurisdictionSupport: ['ZA'],
    article: 'LIVING_WILL', // Will be changed when burial instructions generator is created
    priority: 3,
  },
  {
    type: 'no-contest-clause',
    title: 'No-Contest Clause',
    description: 'Discourage beneficiaries from challenging your will',
    legalDescription: `A no-contest clause (in terrorem clause) imposes penalties on beneficiaries who unsuccessfully challenge the validity of your will. This clause:

• Discourages frivolous legal challenges
• Specifies penalties for unsuccessful contests
• Can forfeit inheritance entirely or reduce it
• May include specific exceptions

Note: South African courts will still review challenges based on mental capacity, undue influence, or fraud, regardless of this clause. The clause primarily addresses challenges based on dissatisfaction with distributions.`,
    category: 'legal-protection',
    icon: 'ShieldAlert',
    requiresQuestionnaire: true,
    jurisdictionSupport: ['ZA'],
    article: 'LIVING_WILL', // Will be changed when no-contest generator is created
    priority: 4,
  },
];

/**
 * Get a specific clause definition by type
 */
export function getClauseDefinition(
  type: OptionalClauseType
): OptionalClauseDefinition | undefined {
  return OPTIONAL_CLAUSES.find((clause) => clause.type === type);
}

/**
 * Get all clauses in a specific category
 */
export function getClausesByCategory(
  category: OptionalClauseCategory
): OptionalClauseDefinition[] {
  return OPTIONAL_CLAUSES.filter((clause) => clause.category === category).sort(
    (a, b) => a.priority - b.priority
  );
}

/**
 * Get all clause categories with counts
 */
export function getCategories(): Array<{
  category: OptionalClauseCategory;
  label: string;
  count: number;
}> {
  const categories: OptionalClauseCategory[] = [
    'medical',
    'family',
    'assets',
    'legal-protection',
    'other',
  ];

  return categories.map((category) => ({
    category,
    label: getCategoryLabel(category),
    count: getClausesByCategory(category).length,
  }));
}

/**
 * Get human-readable label for a category
 */
export function getCategoryLabel(category: OptionalClauseCategory): string {
  const labels: Record<OptionalClauseCategory, string> = {
    medical: 'Medical Directives',
    family: 'Family & Pets',
    assets: 'Assets & Property',
    'legal-protection': 'Legal Protection',
    other: 'Other Provisions',
  };
  return labels[category];
}

/**
 * Check if a clause requires a questionnaire
 */
export function requiresQuestionnaire(type: OptionalClauseType): boolean {
  const clause = getClauseDefinition(type);
  return clause?.requiresQuestionnaire ?? false;
}

/**
 * Check if a clause is supported in the current jurisdiction
 */
export function isSupportedInJurisdiction(
  type: OptionalClauseType,
  jurisdiction: string
): boolean {
  const clause = getClauseDefinition(type);
  return clause?.jurisdictionSupport.includes(jurisdiction) ?? false;
}
