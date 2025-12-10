// Residuary Estate Generator (Article VIII)
// Generates residuary estate clause from beneficiary allocation percentages

import { Asset, Beneficiary } from '@/lib/types/will';
import { WillArticle, WillSection } from '../types';
import { BaseGenerator } from './base-generator';
import {
  formatResiduaryClause,
  formatBeneficiaryDistributions,
  formatSubstituteBeneficiaryClause,
} from '../legal-templates/south-african';

/**
 * Residuary Estate Generator
 * Generates Article VIII from beneficiary allocation percentages and unallocated assets
 */
export class ResiduaryEstateGenerator extends BaseGenerator {
  private unallocatedAssets: Asset[] = [];
  private beneficiariesWithAllocations: Beneficiary[] = [];
  private sourceDataIds: string[] = [];

  /**
   * Check if generator should run
   * Returns true if there are beneficiaries with allocation percentages
   */
  shouldGenerate(): boolean {
    this.unallocatedAssets = this.getUnallocatedAssets();
    this.beneficiariesWithAllocations = this.getBeneficiariesWithAllocations();

    // Generate if there are beneficiaries with allocations
    return this.beneficiariesWithAllocations.length > 0;
  }

  /**
   * Generate Article VIII - Residuary Estate
   */
  generate(): WillSection | null {
    if (!this.shouldGenerate()) {
      this.warn('No beneficiaries with allocation percentages found');
      return null;
    }

    const content = this.generateContent();
    return this.buildSection(content);
  }

  /**
   * Get article type
   */
  getArticle(): WillArticle {
    return 'RESIDUARY_ESTATE';
  }

  /**
   * Get source data IDs
   */
  protected getSourceDataIds(): string[] {
    return this.sourceDataIds;
  }

  /**
   * Get unallocated assets
   * Assets without allocations or with allocations not summing to 100%
   */
  private getUnallocatedAssets(): Asset[] {
    const assets = this.context.willContent.assets || [];

    return assets.filter((asset) => {
      // No allocations - goes to residuary
      if (!asset.beneficiaryAllocations || asset.beneficiaryAllocations.length === 0) {
        return true;
      }

      // Calculate total allocation
      const totalPercentage = asset.beneficiaryAllocations.reduce(
        (sum, alloc) => sum + alloc.percentage,
        0
      );

      // If not fully allocated, remaining goes to residuary
      return Math.abs(totalPercentage - 100) > 0.01;
    });
  }

  /**
   * Get beneficiaries with allocation percentages
   */
  private getBeneficiariesWithAllocations(): Beneficiary[] {
    const beneficiaries = this.context.willContent.beneficiaries || [];

    return beneficiaries.filter((b) => {
      return b.allocationPercentage !== undefined && b.allocationPercentage > 0;
    });
  }

  /**
   * Generate content nodes for Article VIII
   */
  private generateContent() {
    const content = [];

    // Article heading
    content.push(this.createHeading(2, 'ARTICLE VIII - RESIDUARY ESTATE'));
    content.push(this.createEmptyParagraph());

    // Residuary clause
    const hasUnallocatedAssets = this.unallocatedAssets.length > 0;
    const residuaryClause = formatResiduaryClause(
      this.beneficiariesWithAllocations,
      hasUnallocatedAssets
    );

    // Split clause into paragraphs
    const clauseParagraphs = residuaryClause.split('\n\n');
    clauseParagraphs.forEach((para) => {
      if (para.trim()) {
        content.push(this.createParagraph(para.trim()));
        content.push(this.createEmptyParagraph());
      }
    });

    // Beneficiary distribution list
    const distributionItems = formatBeneficiaryDistributions(
      this.beneficiariesWithAllocations
    );

    content.push(this.createBulletedList(distributionItems));
    content.push(this.createEmptyParagraph());

    // Substitute beneficiary clause
    const substituteClause = formatSubstituteBeneficiaryClause(
      this.beneficiariesWithAllocations
    );

    if (substituteClause) {
      content.push(this.createParagraph(substituteClause));
      content.push(this.createEmptyParagraph());
    }

    // Add information about unallocated assets if any
    if (hasUnallocatedAssets && this.unallocatedAssets.length > 0) {
      content.push(
        this.createParagraph(
          `The Residuary Estate includes ${this.unallocatedAssets.length} unallocated asset(s) not specifically bequeathed above.`,
          { italic: true }
        )
      );
    }

    // Track source data
    this.sourceDataIds = this.beneficiariesWithAllocations.map((b) => b.id);
    this.unallocatedAssets.forEach((asset) => {
      if (!this.sourceDataIds.includes(asset.id)) {
        this.sourceDataIds.push(asset.id);
      }
    });

    return content;
  }

  /**
   * Validate beneficiary allocations
   * Check if percentages sum to 100%
   */
  private validateAllocations(): {
    isValid: boolean;
    totalPercentage: number;
    warnings: string[];
  } {
    const warnings: string[] = [];

    const totalPercentage = this.beneficiariesWithAllocations.reduce(
      (sum, b) => sum + (b.allocationPercentage || 0),
      0
    );

    if (Math.abs(totalPercentage - 100) > 0.01) {
      warnings.push(
        `Beneficiary allocations total ${totalPercentage.toFixed(1)}%, not 100%`
      );

      if (totalPercentage < 100) {
        const remaining = 100 - totalPercentage;
        warnings.push(
          `Remaining ${remaining.toFixed(1)}% will be distributed according to intestate succession laws`
        );
      } else if (totalPercentage > 100) {
        warnings.push(
          `Total exceeds 100% - allocations will be normalized proportionally`
        );
      }
    }

    return {
      isValid: warnings.length === 0,
      totalPercentage,
      warnings,
    };
  }
}
