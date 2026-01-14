// South African Legal Language Templates
// Functions for formatting will clauses according to South African legal standards

import { Asset, Beneficiary } from '@/lib/types/will';
import { BeneficiaryAllocation } from '../types';

/**
 * Format asset description based on asset type
 * Includes relevant details like location, registration, account numbers
 * @param asset Asset to format
 * @returns Formatted asset description
 */
export function formatAssetDescription(asset: Asset): string {
  const parts: string[] = [asset.description];

  // Add type-specific details
  switch (asset.type) {
    case 'real-estate':
      if (asset.location) {
        parts.push(`located at ${asset.location}`);
      }
      break;

    case 'vehicle':
      if (asset.accountNumber) {
        // For vehicles, accountNumber can store registration
        parts.push(`Registration ${asset.accountNumber}`);
      }
      break;

    case 'bank-account':
      if (asset.accountNumber) {
        // Mask account number for security (show last 4 digits)
        const masked = asset.accountNumber.replace(/\d(?=\d{4})/g, '*');
        parts.push(`Account ending in ${masked.slice(-4)}`);
      }
      break;

    case 'investment':
      if (asset.accountNumber) {
        parts.push(`Account number ${asset.accountNumber}`);
      }
      break;

    case 'business':
      if (asset.notes) {
        parts.push(asset.notes);
      }
      break;

    case 'insurance':
      if (asset.accountNumber) {
        parts.push(`Policy number ${asset.accountNumber}`);
      }
      break;
  }

  // Add estimated value if provided
  if (asset.estimatedValue && asset.currency) {
    const formattedValue = formatCurrency(asset.estimatedValue, asset.currency);
    parts.push(`(estimated value: ${formattedValue})`);
  }

  return parts.join(', ');
}

/**
 * Format currency amount
 * @param amount Numeric amount
 * @param currency Currency code
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string): string {
  if (currency === 'ZAR') {
    return `R ${amount.toLocaleString('en-ZA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  return `${currency} ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format a beneficiary clause with relationship
 * @param beneficiary Beneficiary object
 * @param percentage Optional percentage (for residuary estate)
 * @returns Formatted beneficiary clause
 */
export function formatBeneficiaryClause(
  beneficiary: Beneficiary,
  percentage?: number
): string {
  const parts: string[] = [];

  // Add percentage if provided
  if (percentage !== undefined) {
    parts.push(`${percentage}%`);
  }

  // Add name and relationship
  parts.push(`to ${beneficiary.fullName}`);

  if (beneficiary.relationship) {
    parts.push(`(${beneficiary.relationship})`);
  }

  return parts.join(' ');
}

/**
 * Format a specific bequest clause
 * Handles both single beneficiary and split allocations
 * @param asset Asset being bequeathed
 * @param allocations Array of beneficiary allocations
 * @param beneficiaries Map of beneficiary ID to Beneficiary object
 * @returns Formatted bequest clause
 */
export function formatSpecificBequest(
  asset: Asset,
  allocations: BeneficiaryAllocation[],
  beneficiaries: Map<string, Beneficiary>
): string {
  const assetDesc = formatAssetDescription(asset);

  // Single beneficiary gets 100%
  if (allocations.length === 1 && allocations[0].percentage === 100) {
    const beneficiary = beneficiaries.get(allocations[0].beneficiaryId);
    if (!beneficiary) {
      return `${assetDesc} - beneficiary not found`;
    }

    return `To ${beneficiary.fullName}: ${assetDesc}`;
  }

  // Multiple beneficiaries - show split
  const allocationParts = allocations
    .map((alloc) => {
      const beneficiary = beneficiaries.get(alloc.beneficiaryId);
      if (!beneficiary) {
        return `${alloc.percentage}% to Unknown Beneficiary`;
      }

      return `${alloc.percentage}% to ${beneficiary.fullName}`;
    })
    .join(', ');

  return `${assetDesc} - to be divided as follows: ${allocationParts}`;
}

/**
 * Format residuary clause
 * Distributes remaining estate among beneficiaries
 * @param beneficiaries Array of beneficiaries with allocation percentages
 * @param hasUnallocatedAssets Whether there are unallocated assets
 * @returns Formatted residuary clause
 */
export function formatResiduaryClause(
  beneficiaries: Beneficiary[],
  hasUnallocatedAssets: boolean
): string {
  const clauses: string[] = [];

  // Opening clause
  clauses.push(
    'I give, devise, and bequeath all the rest, residue, and remainder of my estate (the "Residuary Estate") as follows:'
  );

  if (!hasUnallocatedAssets) {
    clauses.push(
      '\nNote: All assets have been specifically bequeathed. This clause applies to any assets acquired after the execution of this will or not otherwise specifically disposed of.'
    );
  }

  return clauses.join('\n\n');
}

/**
 * Format beneficiary distribution list for residuary estate
 * @param beneficiaries Array of beneficiaries
 * @returns Array of formatted distribution items
 */
export function formatBeneficiaryDistributions(
  beneficiaries: Beneficiary[]
): string[] {
  // Filter beneficiaries with allocation percentages
  const withAllocations = beneficiaries.filter(
    (b) => b.allocationPercentage !== undefined && b.allocationPercentage > 0
  );

  if (withAllocations.length === 0) {
    return [
      'No beneficiary allocations specified. Estate to be distributed according to intestate succession laws.',
    ];
  }

  // Check if percentages sum to 100%
  const totalPercentage = withAllocations.reduce(
    (sum, b) => sum + (b.allocationPercentage || 0),
    0
  );

  const items = withAllocations.map((beneficiary) => {
    const parts: string[] = [];

    parts.push(`${beneficiary.allocationPercentage}%`);
    parts.push(`to ${beneficiary.fullName}`);

    if (beneficiary.relationship) {
      parts.push(`(${beneficiary.relationship})`);
    }

    return parts.join(' ');
  });

  // Add note if percentages don't sum to 100%
  if (Math.abs(totalPercentage - 100) > 0.01) {
    items.push(
      `\nNote: Beneficiary allocations total ${totalPercentage.toFixed(1)}%. Remaining ${(100 - totalPercentage).toFixed(1)}% to be distributed according to intestate succession laws.`
    );
  }

  return items;
}

/**
 * Format substitute beneficiary clause
 * @param beneficiaries Array of beneficiaries
 * @returns Substitute beneficiary clause or null if no substitutes
 */
export function formatSubstituteBeneficiaryClause(
  beneficiaries: Beneficiary[]
): string | null {
  const withSubstitutes = beneficiaries.filter(
    (b) => b.substituteBeneficiaryId
  );

  if (withSubstitutes.length === 0) {
    return 'Should any beneficiary predecease me, their share shall be distributed to the remaining beneficiaries in proportion to their respective shares.';
  }

  // Build substitute clauses
  const clauses = withSubstitutes
    .map((beneficiary) => {
      const substitute = beneficiaries.find(
        (b) => b.id === beneficiary.substituteBeneficiaryId
      );

      if (!substitute) {
        return null;
      }

      return `Should ${beneficiary.fullName} predecease me, their share shall pass to ${substitute.fullName} (${substitute.relationship}).`;
    })
    .filter(Boolean);

  if (clauses.length === 0) {
    return null;
  }

  clauses.push(
    '\nFor any beneficiary without a named substitute who predeceases me, their share shall be distributed to the remaining beneficiaries in proportion to their respective shares.'
  );

  return clauses.join(' ');
}

/**
 * Format minor beneficiary provisions
 * @param beneficiary Minor beneficiary
 * @param guardianName Name of guardian
 * @returns Formatted minor provisions clause
 */
export function formatMinorProvisions(
  beneficiary: Beneficiary,
  guardianName?: string
): string {
  if (!beneficiary.isMinor) {
    return '';
  }

  const clauses: string[] = [];

  clauses.push(
    `${beneficiary.fullName} is a minor beneficiary.`
  );

  if (guardianName) {
    clauses.push(
      `Until ${beneficiary.fullName} reaches the age of majority (18 years), their inheritance shall be held in trust by ${guardianName} for their benefit.`
    );
  } else {
    clauses.push(
      `Until ${beneficiary.fullName} reaches the age of majority (18 years), their inheritance shall be paid into the Guardian's Fund as established under the Guardians Fund Act 1965.`
    );
  }

  return clauses.join(' ');
}

/**
 * Format intro clause for specific bequests
 * @returns Standard intro clause
 */
export function getSpecificBequestsIntro(): string {
  return 'I give, devise, and bequeath the following specific items:';
}

/**
 * Validate and normalize beneficiary allocations
 * Ensures percentages sum to 100% and beneficiaries exist
 * @param allocations Array of allocations
 * @param beneficiaries Array of all beneficiaries
 * @returns Validation result with normalized allocations
 */
export function validateAndNormalizeAllocations(
  allocations: BeneficiaryAllocation[],
  beneficiaries: Beneficiary[]
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  normalized: BeneficiaryAllocation[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const beneficiaryIds = new Set(beneficiaries.map((b) => b.id));

  // Check if all beneficiaries exist
  const validAllocations = allocations.filter((alloc) => {
    if (!beneficiaryIds.has(alloc.beneficiaryId)) {
      errors.push(
        `Beneficiary with ID ${alloc.beneficiaryId} not found`
      );
      return false;
    }
    return true;
  });

  // Calculate total percentage
  const totalPercentage = validAllocations.reduce(
    (sum, alloc) => sum + alloc.percentage,
    0
  );

  // Check if percentages sum to 100%
  if (Math.abs(totalPercentage - 100) > 0.01) {
    warnings.push(
      `Allocations sum to ${totalPercentage.toFixed(1)}%, not 100%`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    normalized: validAllocations,
  };
}

// ========================================
// New Template Functions for Additional Generators
// ========================================

/**
 * Format revocation clause (Article I)
 * Standard clause revoking all previous wills
 * @returns Formatted revocation clause
 */
export function formatRevocationClause(): string {
  return 'I hereby revoke all Wills and Codicils previously made by me insofar as they may deal with my assets situated within the Republic of South Africa and declare this to be my Last Will and Testament in respect of my assets situated in South Africa only. I direct that no Will executed outside the Republic of South Africa shall revoke this Will unless it specifically purports to do so and/or specifically deals with my assets in South Africa.';
}

/**
 * Format declaration clause (Article II)
 * Declaration with testator information
 * @param testator Testator information
 * @returns Formatted declaration clause
 */
export function formatDeclarationClause(testator: {
  fullName: string;
  idNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}): string {
  const parts: string[] = [];

  parts.push(`I, ${testator.fullName}`);

  if (testator.idNumber) {
    parts.push(`ID Number ${testator.idNumber}`);
  }

  if (testator.address) {
    const addressParts: string[] = [];
    if (testator.address.street) addressParts.push(testator.address.street);
    if (testator.address.city) addressParts.push(testator.address.city);
    if (testator.address.state) addressParts.push(testator.address.state);
    if (testator.address.postalCode) addressParts.push(testator.address.postalCode);
    if (testator.address.country) addressParts.push(testator.address.country);

    if (addressParts.length > 0) {
      parts.push(`of ${addressParts.join(', ')}`);
    }
  }

  parts.push('being of sound mind and disposing memory, do hereby make, publish, and declare this to be my last will and testament.');

  return parts.join(', ');
}

/**
 * Format family information section (Article III)
 * Lists marital status, spouse(s), and children
 * @param maritalStatus Marital status
 * @param marriage Marriage information
 * @param children Array of children
 * @returns Formatted family information text
 */
export function formatFamilyInfoSection(
  maritalStatus: string,
  marriage?: {
    spouses?: Array<{
      fullName: string;
      idNumber?: string;
      dateOfMarriage?: string;
      maritalRegime?: string;
    }>;
  },
  children?: Array<{
    fullName: string;
    dateOfBirth?: string;
    isMinor?: boolean;
    relationshipToTestator?: string;
  }>
): string {
  const sections: string[] = [];

  // Marital status section
  if (maritalStatus === 'married' && marriage?.spouses && marriage.spouses.length > 0) {
    const spouseNames = marriage.spouses.map((spouse) => {
      const parts = [spouse.fullName];
      if (spouse.idNumber) {
        parts.push(`ID Number ${spouse.idNumber}`);
      }
      if (spouse.maritalRegime) {
        parts.push(`married ${spouse.maritalRegime === 'ICOP' ? 'in community of property' : spouse.maritalRegime === 'ANC' ? 'out of community of property with accrual' : 'out of community of property without accrual'}`);
      }
      return parts.join(', ');
    }).join(' and ');

    sections.push(`I am married to ${spouseNames}.`);
  } else if (maritalStatus === 'divorced') {
    sections.push('I am divorced.');
  } else if (maritalStatus === 'widowed') {
    sections.push('I am widowed.');
  } else {
    sections.push('I am single.');
  }

  // Children section
  if (children && children.length > 0) {
    const childDescriptions = children.map((child) => {
      const parts = [child.fullName];
      if (child.dateOfBirth) {
        parts.push(`born ${child.dateOfBirth}`);
      }
      if (child.isMinor !== undefined) {
        parts.push(child.isMinor ? 'a minor' : 'an adult');
      }
      return parts.join(', ');
    });

    sections.push(`I have ${children.length} ${children.length === 1 ? 'child' : 'children'}: ${childDescriptions.join('; ')}.`);
  } else {
    sections.push('I have no children.');
  }

  return sections.join(' ');
}

/**
 * Format executor appointment clause (Article IV)
 * Appoints executor(s) with succession order
 * @param executors Array of executors
 * @returns Formatted executor appointment clause
 */
export function formatExecutorAppointment(
  executors: Array<{
    fullName: string;
    idNumber?: string;
    relationship?: string;
    isAlternate?: boolean;
    isSurvivingSpouse?: boolean;
  }>
): string {
  if (executors.length === 0) {
    return '';
  }

  const primary = executors.filter((e) => !e.isAlternate);
  const alternates = executors.filter((e) => e.isAlternate);

  const sections: string[] = [];

  // Primary executor(s)
  if (primary.length > 0) {
    // Check for surviving spouse executor
    // const hasSurvivingSpouse = primary.some((e) => e.isSurvivingSpouse === true);

    // if (hasSurvivingSpouse && primary.length === 1) {
    //   // Special case: Single surviving spouse executor
    //   sections.push('I appoint my surviving spouse as the executor of this my will.');
    // } else 
    {
      // Regular executor appointment with names (existing code)
      const primaryDescriptions = primary
        .filter((e) => !e.isSurvivingSpouse) // Exclude surviving spouse from name list
        .map((exec) => {
          const parts = [exec.fullName];
          if (exec.idNumber) {
            parts.push(`ID Number ${exec.idNumber}`);
          }
          if (exec.relationship) {
            parts.push(`(${exec.relationship})`);
          }
          return parts.join(', ');
        });

      if (primary.length === 1) {
        sections.push(`I appoint ${primaryDescriptions[0]} as the executor of this my will.`);
      } else {
        sections.push(`I appoint ${primaryDescriptions.join(' and ')} as joint executors of this my will.`);
      }
    }
  }

  // Alternate executor(s)
  if (alternates.length > 0) {
    const alternateDescriptions = alternates.map((exec) => {
      const parts = [exec.fullName];
      if (exec.idNumber) {
        parts.push(`ID Number ${exec.idNumber}`);
      }
      if (exec.relationship) {
        parts.push(`(${exec.relationship})`);
      }
      return parts.join(', ');
    });

    sections.push(`Should the above-named executor(s) be unable or unwilling to serve, I appoint ${alternateDescriptions.join(' and ')} as alternate executor(s).`);
  }

  // Powers clause
  sections.push('I grant my executor(s) full power and authority to administer and distribute my estate in accordance with the terms of this will, including the power to sell, transfer, or otherwise dispose of any assets as may be necessary.');

  return sections.join(' ');
}

/**
 * Format guardian appointment clause (Article V)
 * Appoints guardian(s) for minor children
 * @param guardians Array of guardians
 * @param children Array of minor children
 * @returns Formatted guardian appointment clause
 */
export function formatGuardianAppointment(
  guardians: Array<{
    fullName: string;
    idNumber?: string;
    relationship?: string;
    isAlternate?: boolean;
  }>,
  children?: Array<{
    fullName: string;
    isMinor?: boolean;
  }>
): string {
  if (guardians.length === 0) {
    return '';
  }

  const minorChildren = children?.filter((c) => c.isMinor) || [];
  if (minorChildren.length === 0) {
    return '';
  }

  const primary = guardians.filter((g) => !g.isAlternate);
  const alternates = guardians.filter((g) => g.isAlternate);

  const sections: string[] = [];

  // Primary guardian(s)
  if (primary.length > 0) {
    const primaryDescriptions = primary.map((guard) => {
      const parts = [guard.fullName];
      if (guard.idNumber) {
        parts.push(`ID Number ${guard.idNumber}`);
      }
      if (guard.relationship) {
        parts.push(`(${guard.relationship})`);
      }
      return parts.join(', ');
    });

    if (primary.length === 1) {
      sections.push(`Failing a natural, parental guardian, I appoint ${primaryDescriptions[0]} as guardian of my minor ${minorChildren.length === 1 ? 'child' : 'children'}.`);
    } else {
      sections.push(`Failing a natural, parental guardian, I appoint ${primaryDescriptions.join(' and ')} as joint guardians of my minor ${minorChildren.length === 1 ? 'child' : 'children'}.`);
    }
  }

  // Alternate guardian(s)
  if (alternates.length > 0) {
    const alternateDescriptions = alternates.map((guard) => {
      const parts = [guard.fullName];
      if (guard.idNumber) {
        parts.push(`ID Number ${guard.idNumber}`);
      }
      if (guard.relationship) {
        parts.push(`(${guard.relationship})`);
      }
      return parts.join(', ');
    });

    sections.push(`Should the above-named guardian(s) be unable or unwilling to serve, I appoint ${alternateDescriptions.join(' and ')} as alternate guardian(s).`);
  }

  // Powers clause
  sections.push('I grant the appointed guardian(s) full parental responsibilities and rights as provided for in the Children\'s Act 38 of 2005, including the care, maintenance, and education of my minor children.');

  return sections.join(' ');
}

/**
 * Format trustee appointment clause
 * Appoints trustee(s) for managing minor beneficiaries' inheritance
 * @param trustees Array of trustees
 * @param beneficiaries Array of beneficiaries (to identify minors)
 * @returns Formatted trustee appointment clause
 */
export function formatTrusteeAppointment(
  trustees: Array<{
    fullName: string;
    idNumber?: string;
    relationship?: string;
    isAlternate?: boolean;
    isGuardian?: boolean;
    guardianId?: string;
  }>,
  beneficiaries: Array<{
    fullName: string;
    isMinor?: boolean;
  }>
): string {
  if (trustees.length === 0) {
    return '';
  }

  const minorBeneficiaries = beneficiaries.filter((b) => b.isMinor);
  if (minorBeneficiaries.length === 0) {
    return '';
  }

  const primary = trustees.filter((t) => !t.isAlternate);
  const alternates = trustees.filter((t) => t.isAlternate);

  const sections: string[] = [];

  // Primary trustee(s)
  if (primary.length > 0) {
    const primaryDescriptions = primary.map((trustee) => {
      const parts = [trustee.fullName];
      if (trustee.idNumber) {
        parts.push(`ID Number ${trustee.idNumber}`);
      }
      if (trustee.relationship) {
        parts.push(`(${trustee.relationship})`);
      }
      if (trustee.isGuardian) {
        parts.push('also serving as guardian');
      }
      return parts.join(', ');
    });

    if (primary.length === 1) {
      sections.push(`I appoint ${primaryDescriptions[0]} as trustee to manage the inheritance of my minor beneficiaries until they reach the age of majority (18 years).`);
    } else {
      sections.push(`I appoint ${primaryDescriptions.join(' and ')} as joint trustees to manage the inheritance of my minor beneficiaries until they reach the age of majority (18 years).`);
    }
  }

  // Alternate trustee(s)
  if (alternates.length > 0) {
    const alternateDescriptions = alternates.map((trustee) => {
      const parts = [trustee.fullName];
      if (trustee.idNumber) {
        parts.push(`ID Number ${trustee.idNumber}`);
      }
      if (trustee.relationship) {
        parts.push(`(${trustee.relationship})`);
      }
      return parts.join(', ');
    });

    sections.push(`Should the above-named trustee(s) be unable or unwilling to serve, I appoint ${alternateDescriptions.join(' and ')} as alternate trustee(s).`);
  }

  // Powers clause with Trust Property Control Act reference
  sections.push('I grant the appointed trustee(s) full power to invest, manage, and distribute the inheritance for the benefit, maintenance, and education of the minor beneficiaries, in accordance with the Trust Property Control Act 57 of 1988.');

  sections.push();
  return sections.join(' ');
}

/**
 * Format minor provisions clause (Article VI)
 * Provisions for inheritance by minor beneficiaries
 * @param minorBeneficiaries Array of minor beneficiaries
 * @param guardianName Optional guardian name
 * @returns Formatted minor provisions clause
 */
export function formatMinorProvisionsClause(
  minorBeneficiaries: Array<{
    fullName: string;
    isMinor?: boolean;
  }>,
  guardianName?: string
): string {
  const minors = minorBeneficiaries.filter((b) => b.isMinor === true);

  if (minors.length === 0) {
    return '';
  }

  const sections: string[] = [];

  sections.push('With regard to any inheritance by minor beneficiaries:');

  if (guardianName) {
    sections.push(`Until each minor beneficiary reaches the age of majority (18 years), their inheritance shall be held in trust by ${guardianName} for their benefit, maintenance, and education.`);
  } else {
    sections.push('Until each minor beneficiary reaches the age of majority (18 years), their inheritance shall be paid into the Guardian\'s Fund as established under the Guardians\' Fund Act 1965, to be held for their benefit.');
  }

  sections.push('Upon reaching the age of majority, each beneficiary shall receive their full inheritance.');

  // List minor beneficiaries
  if (minors.length > 0) {
    const minorNames = minors.map((m) => m.fullName).join(', ');
    sections.push(`The following beneficiaries are currently minors: ${minorNames}.`);
  }

  return sections.join(' ');
}

/**
 * Format attestation clause
 * Signature and witness section
 * @param dateExecuted Date will was executed
 * @param placeExecuted Place where will was executed
 * @param witnesses Array of witnesses
 * @returns Formatted attestation clause
 */
export function formatAttestationClause(
  dateExecuted?: string,
  placeExecuted?: string,
  witnesses?: Array<{
    fullName: string;
    idNumber?: string;
    address?: string;
  }>
): string {
  const sections: string[] = [];

  sections.push('IN WITNESS WHEREOF, I have hereunto set my hand and seal to this my last will and testament');

  const details: string[] = [];
  if (placeExecuted) {
    details.push(`at ${placeExecuted}`);
  }
  if (dateExecuted) {
    details.push(`on this ${dateExecuted}`);
  }

  if (details.length > 0) {
    sections.push(details.join(' ') + '.');
  } else {
    sections.push('.');
  }

  // Witness section
  if (witnesses && witnesses.length > 0) {
    sections.push('\n\nSIGNED by the testator in our presence and by us in the presence of the testator and of each other:');

    witnesses.forEach((witness, index) => {
      const witnessParts = [`Witness ${index + 1}: ${witness.fullName}`];
      if (witness.idNumber) {
        witnessParts.push(`ID Number: ${witness.idNumber}`);
      }
      if (witness.address) {
        witnessParts.push(`Address: ${witness.address}`);
      }
      sections.push('\n' + witnessParts.join(', '));
    });
  }

  return sections.join(' ');
}

/**
 * Format general inheritance exclusion clause
 * This is a standard South African will clause protecting all inheritances
 * from community of property and accrual systems
 *
 * Applies universally to ALL beneficiaries (no individual tracking needed)
 * Covers current and future marriages, ICOP and accrual regimes
 *
 * @returns Formatted inheritance exclusion clause
 */
export function formatGeneralInheritanceExclusionClause(): string {
  return 'Should any person who benefits from my estate in terms of my Last Will, be married or marry or remarry at any time in the future, in community of property or subject to any law of accrual, then notwithstanding such community of property or accrual, the benefits payable to him/her under my Last Will shall devolve upon and belong to him/her personally and shall be excluded of any such community or accrual and shall be free from any marital power which any spouse might otherwise have or acquire by virtue of such marriage.';
}

/**
 * Format right of repudiation clause
 * This is a standard South African will clause allowing beneficiaries
 * to repudiate (reject) all or part of their inheritance
 *
 * Applies universally to ALL beneficiaries (no individual tracking needed)
 * Protects beneficiary rights to selective acceptance/rejection of bequests
 *
 * @returns Formatted right of repudiation clause
 */
export function formatRightOfRepudiationClause(): string {
  return 'Any beneficiary(ies) under my Last Will shall be entitled to repudiate the whole or only a part of his inheritance or legacy, without affecting his right to the remainder of the inheritance or legacy.';
}

/**
 * Format joint asset clause
 * This is a standard South African will clause allowing beneficiaries
 * to agree amongst themselves on division of jointly bequeathed assets
 *
 * Applies when assets are left to multiple beneficiaries jointly
 * Reduces executor involvement in asset division decisions
 *
 * @returns Formatted joint asset clause
 */
export function formatJointAssetClause(): string {
  return 'I wish my beneficiaries to agree amongst themselves as to the division between them of any assets left to them jointly. My Executor(s) need not be involved in this decision, and a receipt signed by all the beneficiaries will be given to the Executor(s).';
}
