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
