// Specific Bequests Generator (Article VII)
// Generates specific bequest clauses from asset allocations

import { Asset, Beneficiary } from '@/lib/types/will';
import { WillArticle, WillSection, BeneficiaryAllocation } from '../types';
import { BaseGenerator } from './base-generator';
import {
  formatSpecificBequest,
  getSpecificBequestsIntro,
  validateAndNormalizeAllocations,
} from '../legal-templates/south-african';

/**
 * Specific Bequests Generator
 * Generates Article VII from asset beneficiary allocations
 */
export class SpecificBequestsGenerator extends BaseGenerator {
  private allocatedAssets: Asset[] = [];
  private sourceDataIds: string[] = [];

  /**
   * Check if generator should run
   * Returns true if there are assets with valid allocations
   */
  shouldGenerate(): boolean {
    this.allocatedAssets = this.getAssetsWithValidAllocations();
    return this.allocatedAssets.length > 0;
  }

  /**
   * Generate Article VII - Specific Bequests
   */
  generate(): WillSection | null {
    if (!this.shouldGenerate()) {
      this.warn('No assets with valid allocations found');
      return null;
    }

    const content = this.generateContent();
    return this.buildSection(content);
  }

  /**
   * Get article type
   */
  getArticle(): WillArticle {
    return 'SPECIFIC_BEQUESTS';
  }

  /**
   * Get source data IDs
   */
  protected getSourceDataIds(): string[] {
    return this.sourceDataIds;
  }

  /**
   * Get assets with valid allocations
   * @returns Array of assets that have beneficiary allocations summing to 100%
   */
  private getAssetsWithValidAllocations(): Asset[] {
    const assets = this.context.willContent.assets || [];
    const beneficiaries = this.context.willContent.beneficiaries || [];

    return assets.filter((asset) => {
      // Skip assets with usufruct (handled by UsufructBequestsGenerator)
      if (asset.usufruct) {
        return false;
      }

      // Must have allocations
      if (!asset.beneficiaryAllocations || asset.beneficiaryAllocations.length === 0) {
        return false;
      }

      // Validate allocations
      const validation = validateAndNormalizeAllocations(
        asset.beneficiaryAllocations,
        beneficiaries
      );

      // Log errors and warnings
      if (validation.errors.length > 0) {
        this.error(
          `Asset "${asset.description}" has invalid allocations: ${validation.errors.join(', ')}`
        );
        return false;
      }

      if (validation.warnings.length > 0) {
        this.warn(
          `Asset "${asset.description}": ${validation.warnings.join(', ')}`
        );
      }

      // Check if percentages sum to 100%
      const totalPercentage = asset.beneficiaryAllocations.reduce(
        (sum, alloc) => sum + alloc.percentage,
        0
      );

      // Allow small floating point errors
      if (Math.abs(totalPercentage - 100) > 0.01) {
        this.warn(
          `Asset "${asset.description}" allocations sum to ${totalPercentage.toFixed(1)}%, not 100%. Remaining will go to residuary estate.`
        );
        return false; // Don't include in specific bequests if not fully allocated
      }

      return true;
    });
  }

  /**
   * Generate content nodes for Article VII
   */
  private generateContent() {
    const content = [];

    // Article heading
    content.push(this.createHeading(2, 'ARTICLE VII - SPECIFIC BEQUESTS'));
    content.push(this.createEmptyParagraph());

    // Intro paragraph
    content.push(this.createParagraph(getSpecificBequestsIntro()));
    content.push(this.createEmptyParagraph());

    // Generate bequest items
    const bequestItems = this.generateBequestItems();
    content.push(this.createBulletedList(bequestItems));

    // Track source data
    this.sourceDataIds = this.allocatedAssets.map((asset) => asset.id);
    this.allocatedAssets.forEach((asset) => {
      asset.beneficiaryAllocations?.forEach((alloc) => {
        if (!this.sourceDataIds.includes(alloc.beneficiaryId)) {
          this.sourceDataIds.push(alloc.beneficiaryId);
        }
      });
    });

    return content;
  }

  /**
   * Generate bequest item strings
   */
  private generateBequestItems(): string[] {
    const beneficiariesMap = this.createBeneficiariesMap();
    const items: string[] = [];

    for (const asset of this.allocatedAssets) {
      if (!asset.beneficiaryAllocations) {
        continue;
      }

      const bequestClause = formatSpecificBequest(
        asset,
        asset.beneficiaryAllocations,
        beneficiariesMap
      );

      items.push(bequestClause);
    }

    // Sort items for consistency (by asset description)
    items.sort((a, b) => {
      // Extract asset description (text after "To [Name]: " or before " - to be divided")
      const getKey = (item: string) => {
        if (item.startsWith('To ')) {
          return item.split(': ')[1] || item;
        }
        return item.split(' - to be divided')[0] || item;
      };

      return getKey(a).localeCompare(getKey(b));
    });

    return items;
  }

  /**
   * Create a map of beneficiary ID to Beneficiary object
   */
  private createBeneficiariesMap(): Map<string, Beneficiary> {
    const map = new Map<string, Beneficiary>();
    const beneficiaries = this.context.willContent.beneficiaries || [];

    for (const beneficiary of beneficiaries) {
      map.set(beneficiary.id, beneficiary);
    }

    return map;
  }
}
