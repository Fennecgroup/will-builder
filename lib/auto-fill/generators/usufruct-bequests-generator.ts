// Usufruct Bequests Generator (Article VII)
// Generates usufruct clauses from assets with usufruct configuration

import { Asset, Beneficiary } from '@/lib/types/will';
import { WillArticle, WillSection } from '../types';
import { BaseGenerator } from './base-generator';
import {
  formatUsufructBequest,
  getUsufructBequestsIntro,
  validateUsufruct,
} from '../legal-templates/south-african';

/**
 * Usufruct Bequests Generator
 * Generates Article VII from assets with usufruct configuration
 */
export class UsufructBequestsGenerator extends BaseGenerator {
  private usufructAssets: Asset[] = [];
  private sourceDataIds: string[] = [];

  /**
   * Check if generator should run
   * Returns true if there are assets with valid usufruct configuration
   */
  shouldGenerate(): boolean {
    this.usufructAssets = this.getAssetsWithUsufruct();
    return this.usufructAssets.length > 0;
  }

  /**
   * Generate Article VII - Usufruct Bequests
   */
  generate(): WillSection | null {
    if (!this.shouldGenerate()) {
      this.warn('No assets with usufruct configuration found');
      return null;
    }

    const content = this.generateContent();
    return this.buildSection(content);
  }

  /**
   * Get article type
   */
  getArticle(): WillArticle {
    return 'USUFRUCT_BEQUESTS';
  }

  /**
   * Get source data IDs
   */
  protected getSourceDataIds(): string[] {
    return this.sourceDataIds;
  }

  /**
   * Get assets with valid usufruct configuration
   * @returns Array of assets that have usufruct configuration
   */
  private getAssetsWithUsufruct(): Asset[] {
    const assets = this.context.willContent.assets || [];
    const beneficiaries = this.context.willContent.beneficiaries || [];

    return assets.filter((asset) => {
      // Must have usufruct configuration
      if (!asset.usufruct) {
        return false;
      }

      // Validate usufruct
      const validation = validateUsufruct(asset, beneficiaries);

      // Log errors and warnings
      if (validation.errors.length > 0) {
        this.error(
          `Asset "${asset.description}" has invalid usufruct: ${validation.errors.join(', ')}`
        );
        return false;
      }

      if (validation.warnings.length > 0) {
        this.warn(
          `Asset "${asset.description}": ${validation.warnings.join(', ')}`
        );
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
    content.push(this.createHeading(2, 'ARTICLE VII - USUFRUCT BEQUESTS'));
    content.push(this.createEmptyParagraph());

    // Intro paragraph
    content.push(this.createParagraph(getUsufructBequestsIntro()));
    content.push(this.createEmptyParagraph());

    // Generate usufruct items
    const bequestItems = this.generateBequestItems();
    content.push(this.createBulletedList(bequestItems));

    return content;
  }

  /**
   * Generate bequest item strings
   */
  private generateBequestItems(): string[] {
    const beneficiariesMap = this.createBeneficiariesMap();
    const items: string[] = [];

    for (const asset of this.usufructAssets) {
      if (!asset.usufruct) {
        continue;
      }

      const usufructuary = beneficiariesMap.get(asset.usufruct.usufructuaryId);
      const bareDominiumOwner = beneficiariesMap.get(
        asset.usufruct.bareDominiumOwnerId
      );

      if (!usufructuary || !bareDominiumOwner) {
        this.error(
          `Missing beneficiary for asset "${asset.description}"`
        );
        continue;
      }

      const bequestClause = formatUsufructBequest(
        asset,
        usufructuary,
        bareDominiumOwner
      );

      items.push(bequestClause);

      // Track source data
      if (!this.sourceDataIds.includes(asset.id)) {
        this.sourceDataIds.push(asset.id);
      }
      if (!this.sourceDataIds.includes(asset.usufruct.usufructuaryId)) {
        this.sourceDataIds.push(asset.usufruct.usufructuaryId);
      }
      if (!this.sourceDataIds.includes(asset.usufruct.bareDominiumOwnerId)) {
        this.sourceDataIds.push(asset.usufruct.bareDominiumOwnerId);
      }
    }

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
