// AI Context Anonymization Engine
// Protects PII by replacing sensitive data with tokens

import type { WillContent, Asset, Beneficiary, Executor, Witness, Guardian, Liability, DigitalAsset } from '@/lib/types/will';
import type { TestatorContext } from './types';

/**
 * Anonymizer class handles PII protection by replacing sensitive information
 * with tokens that can later be reversed (de-anonymized)
 */
export class Anonymizer {
  private tokenMap = new Map<string, string>();
  private tokenCounter = {
    id: 0,
    address: 0,
    phone: 0,
    email: 0,
    account: 0,
  };

  /**
   * Anonymize will content for selected sections
   */
  anonymize(willContent: WillContent, sections: (keyof WillContent)[]): TestatorContext {
    let anonymizedData = '';

    // Always include testator basics (anonymized)
    anonymizedData += this.anonymizeTestatorInfo(willContent);

    // Process each selected section
    if (sections.includes('marriage') && willContent.marriage) {
      anonymizedData += this.anonymizeMarriage(willContent);
    }

    if (sections.includes('children') && willContent.children && willContent.children.length > 0) {
      anonymizedData += this.anonymizeChildren(willContent.children);
    }

    if (sections.includes('assets') && willContent.assets?.length > 0) {
      anonymizedData += this.anonymizeAssets(willContent.assets);
    }

    if (sections.includes('beneficiaries') && willContent.beneficiaries?.length > 0) {
      anonymizedData += this.anonymizeBeneficiaries(willContent.beneficiaries);
    }

    if (sections.includes('executors') && willContent.executors?.length > 0) {
      anonymizedData += this.anonymizeExecutors(willContent.executors);
    }

    if (sections.includes('witnesses') && willContent.witnesses?.length > 0) {
      anonymizedData += this.anonymizeWitnesses(willContent.witnesses);
    }

    if (sections.includes('guardians') && willContent.guardians?.length > 0) {
      anonymizedData += this.anonymizeGuardians(willContent.guardians);
    }

    if (sections.includes('liabilities') && willContent.liabilities?.length > 0) {
      anonymizedData += this.anonymizeLiabilities(willContent.liabilities);
    }

    if (sections.includes('funeralWishes') && willContent.funeralWishes) {
      anonymizedData += this.anonymizeFuneralWishes(willContent);
    }

    if (sections.includes('digitalAssets') && willContent.digitalAssets?.length > 0) {
      anonymizedData += this.anonymizeDigitalAssets(willContent.digitalAssets);
    }

    if (sections.includes('specificBequests') && willContent.specificBequests && willContent.specificBequests.length > 0) {
      anonymizedData += this.anonymizeSpecificBequests(willContent);
    }

    if (sections.includes('minorBeneficiaryProvisions') && willContent.minorBeneficiaryProvisions) {
      anonymizedData += this.anonymizeMinorProvisions(willContent);
    }

    if (sections.includes('residuaryClause') && willContent.residuaryClause) {
      anonymizedData += `\n## Residuary Clause\n${willContent.residuaryClause}\n`;
    }

    return {
      contextData: anonymizedData,
      tokenMap: this.tokenMap,
      includedSections: sections,
      estimatedTokens: this.estimateTokens(anonymizedData),
    };
  }

  /**
   * De-anonymize text by replacing tokens with actual values
   */
  deAnonymize(text: string, tokenMap: Map<string, string>): string {
    // Safety check: ensure text is actually a string
    if (typeof text !== 'string') {
      console.error('[Anonymizer] deAnonymize called with non-string:', typeof text, text);
      return String(text || '');
    }

    let result = text;

    // Sort tokens by length (longest first) to avoid partial replacements
    const sortedTokens = Array.from(tokenMap.entries())
      .sort((a, b) => b[0].length - a[0].length);

    sortedTokens.forEach(([token, value]) => {
      const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedToken, 'g');
      result = result.replace(regex, value);
    });

    return result;
  }

  /**
   * Anonymize testator basic information
   */
  private anonymizeTestatorInfo(willContent: WillContent): string {
    const testator = willContent.testator;
    let data = `## Testator Information\n`;

    const testatorToken = '[TESTATOR]';
    this.tokenMap.set(testatorToken, testator.fullName);
    data += `Name: ${testatorToken}\n`;
    data += `Date of Birth: ${testator.dateOfBirth}\n`;

    if (testator.idNumber) {
      const idToken = this.createToken('id');
      this.tokenMap.set(idToken, testator.idNumber);
      data += `ID Number: ${idToken}\n`;
    }

    // Keep city/province for context, anonymize street
    if (testator.address) {
      data += `Location: ${testator.address.city}, ${testator.address.state}\n`;
      if (testator.address.country) {
        data += `Country: ${testator.address.country}\n`;
      }
    }

    if (testator.occupation) {
      data += `Occupation: ${testator.occupation}\n`;
    }

    data += `\n`;
    return data;
  }

  /**
   * Anonymize marriage information
   */
  private anonymizeMarriage(willContent: WillContent): string {
    const marriage = willContent.marriage;
    let data = `## Marriage Information\n`;
    data += `Status: ${marriage.status}\n`;

    if (marriage.spouses && marriage.spouses.length > 0) {
      marriage.spouses.forEach((spouse, spouseIndex) => {
        const spouseToken = `[SPOUSE-${spouseIndex + 1}]`;
        this.tokenMap.set(spouseToken, spouse.fullName);
        data += `Spouse ${spouseIndex + 1}: ${spouseToken}\n`;

        if (spouse.dateOfMarriage) {
          data += `Date of Marriage: ${spouse.dateOfMarriage}\n`;
        }

        if (spouse.idNumber) {
          const idToken = this.createToken('id');
          this.tokenMap.set(idToken, spouse.idNumber);
          data += `Spouse ID: ${idToken}\n`;
        }
        data += `\n`;
      });
    }

    data += `\n`;
    return data;
  }

  /**
   * Anonymize children information
   */
  private anonymizeChildren(children: any[]): string {
    let data = `## Children\n`;
    data += `Total Children: ${children.length}\n\n`;

    children.forEach((child, index) => {
      const childToken = `[CHILD-${index + 1}]`;
      this.tokenMap.set(childToken, child.fullName);

      data += `${index + 1}. ${childToken}\n`;
      data += `   Born: ${child.dateOfBirth}\n`;
      data += `   Status: ${child.isMinor ? 'Minor' : 'Adult'}\n`;
      data += `   Relationship: ${child.relationshipToTestator}\n`;

      if (child.idNumber) {
        const childIdToken = this.createToken('id');
        this.tokenMap.set(childIdToken, child.idNumber);
        data += `   ID: ${childIdToken}\n`;
      }
      data += `\n`;
    });

    data += `\n`;
    return data;
  }

  /**
   * Anonymize assets
   */
  private anonymizeAssets(assets: Asset[]): string {
    let data = `## Assets\n`;
    data += `Total Assets: ${assets.length}\n`;

    const totalValue = assets.reduce((sum, a) => sum + (a.estimatedValue || 0), 0);
    if (totalValue > 0) {
      data += `Total Estimated Value: R${totalValue.toLocaleString()}\n`;
    }
    data += `\n`;

    assets.forEach((asset, index) => {
      data += `### Asset ${index + 1}: ${asset.type}\n`;
      data += `Description: ${asset.description}\n`;

      if (asset.location) {
        // Keep general location (city) but anonymize street addresses
        const parts = asset.location.split(',').map(p => p.trim());
        if (parts.length > 1) {
          // Show last 2 parts (usually city, province/country)
          const safeLocation = parts.slice(-2).join(', ');
          data += `Location: ${safeLocation}\n`;
        } else {
          data += `Location: ${asset.location}\n`;
        }
      }

      if (asset.estimatedValue) {
        data += `Value: R${asset.estimatedValue.toLocaleString()} ${asset.currency || 'ZAR'}\n`;
      }

      if (asset.accountNumber) {
        const accountToken = this.createToken('account');
        this.tokenMap.set(accountToken, asset.accountNumber);
        data += `Account: ${accountToken}\n`;
      }

      if (asset.notes) {
        data += `Notes: ${asset.notes}\n`;
      }

      data += `\n`;
    });

    return data;
  }

  /**
   * Anonymize beneficiaries
   */
  private anonymizeBeneficiaries(beneficiaries: Beneficiary[]): string {
    let data = `## Beneficiaries\n`;
    data += `Total Beneficiaries: ${beneficiaries.length}\n\n`;

    beneficiaries.forEach((beneficiary, index) => {
      const beneficiaryToken = `[BENEFICIARY-${index + 1}]`;
      this.tokenMap.set(beneficiaryToken, beneficiary.fullName);

      data += `### ${index + 1}. ${beneficiaryToken}\n`;
      data += `Relationship: ${beneficiary.relationship}\n`;

      if (beneficiary.allocationPercentage) {
        data += `Allocation: ${beneficiary.allocationPercentage}%\n`;
      }

      if (beneficiary.isMinor) {
        data += `Status: Minor\n`;
      }

      if (beneficiary.specificBequests && beneficiary.specificBequests.length > 0) {
        data += `Specific Bequests:\n`;
        beneficiary.specificBequests.forEach(bequest => {
          data += `  - ${bequest}\n`;
        });
      }

      data += `\n`;
    });

    return data;
  }

  /**
   * Anonymize executors
   */
  private anonymizeExecutors(executors: Executor[]): string {
    let data = `## Executors\n`;

    executors.forEach((executor, index) => {
      const executorToken = `[EXECUTOR-${index + 1}]`;
      this.tokenMap.set(executorToken, executor.fullName);

      data += `### ${executor.isAlternate ? 'Alternate' : 'Primary'} Executor ${index + 1}\n`;
      data += `Name: ${executorToken}\n`;
      data += `Relationship: ${executor.relationship}\n`;

      if (executor.address) {
        data += `Location: ${executor.address.city}, ${executor.address.state}\n`;
      }

      data += `\n`;
    });

    return data;
  }

  /**
   * Anonymize witnesses
   */
  private anonymizeWitnesses(witnesses: Witness[]): string {
    let data = `## Witnesses\n`;

    witnesses.forEach((witness, index) => {
      const witnessToken = `[WITNESS-${index + 1}]`;
      this.tokenMap.set(witnessToken, witness.fullName);

      data += `### Witness ${index + 1}\n`;
      data += `Name: ${witnessToken}\n`;

      if (witness.occupation) {
        data += `Occupation: ${witness.occupation}\n`;
      }

      if (witness.address) {
        data += `Location: ${witness.address.city}, ${witness.address.state}\n`;
      }

      data += `\n`;
    });

    return data;
  }

  /**
   * Anonymize guardians
   */
  private anonymizeGuardians(guardians: Guardian[]): string {
    let data = `## Guardians for Minor Children\n`;

    guardians.forEach((guardian, index) => {
      const guardianToken = `[GUARDIAN-${index + 1}]`;
      this.tokenMap.set(guardianToken, guardian.fullName);

      data += `### ${guardian.isAlternate ? 'Alternate' : 'Primary'} Guardian ${index + 1}\n`;
      data += `Name: ${guardianToken}\n`;
      data += `Relationship: ${guardian.relationship}\n`;

      if (guardian.forChildren && guardian.forChildren.length > 0) {
        data += `Guardian for: ${guardian.forChildren.join(', ')}\n`;
      }

      if (guardian.address) {
        data += `Location: ${guardian.address.city}, ${guardian.address.state}\n`;
      }

      data += `\n`;
    });

    return data;
  }

  /**
   * Anonymize liabilities
   */
  private anonymizeLiabilities(liabilities: Liability[]): string {
    let data = `## Liabilities\n`;
    data += `Total Liabilities: ${liabilities.length}\n`;

    const totalDebt = liabilities.reduce((sum, l) => sum + l.amount, 0);
    if (totalDebt > 0) {
      data += `Total Debt: R${totalDebt.toLocaleString()}\n`;
    }
    data += `\n`;

    liabilities.forEach((liability, index) => {
      data += `### ${index + 1}. ${liability.type}\n`;
      data += `Creditor: ${liability.creditor}\n`;
      data += `Amount: R${liability.amount.toLocaleString()} ${liability.currency}\n`;

      if (liability.accountNumber) {
        const accountToken = this.createToken('account');
        this.tokenMap.set(accountToken, liability.accountNumber);
        data += `Account: ${accountToken}\n`;
      }

      data += `\n`;
    });

    return data;
  }

  /**
   * Anonymize funeral wishes
   */
  private anonymizeFuneralWishes(willContent: WillContent): string {
    const wishes = willContent.funeralWishes;
    if (!wishes) return '';

    let data = `## Funeral Wishes\n`;
    data += `Preference: ${wishes.preference}\n`;

    if (wishes.location) {
      // Keep general location
      data += `Location: ${wishes.location}\n`;
    }

    if (wishes.specificInstructions) {
      data += `Instructions: ${wishes.specificInstructions}\n`;
    }

    if (wishes.religiousPreferences) {
      data += `Religious Preferences: ${wishes.religiousPreferences}\n`;
    }

    data += `\n`;
    return data;
  }

  /**
   * Anonymize digital assets
   */
  private anonymizeDigitalAssets(digitalAssets: DigitalAsset[]): string {
    let data = `## Digital Assets\n`;

    digitalAssets.forEach((asset, index) => {
      data += `### ${index + 1}. ${asset.platform}\n`;
      data += `Type: ${asset.type}\n`;

      if (asset.username) {
        const usernameToken = this.createToken('account');
        this.tokenMap.set(usernameToken, asset.username);
        data += `Username: ${usernameToken}\n`;
      }

      data += `Instructions: ${asset.instructions}\n`;
      data += `\n`;
    });

    return data;
  }

  /**
   * Anonymize specific bequests
   */
  private anonymizeSpecificBequests(willContent: WillContent): string {
    const bequests = willContent.specificBequests;
    if (!bequests || bequests.length === 0) return '';

    let data = `## Specific Bequests\n`;

    bequests.forEach((bequest, index) => {
      data += `### Bequest ${index + 1}\n`;
      data += `Item: ${bequest.description}\n`;

      // Find beneficiary name
      const beneficiary = willContent.beneficiaries.find(b => b.id === bequest.beneficiaryId);
      if (beneficiary) {
        // Check if we already have a token for this beneficiary
        let beneficiaryToken = '';
        for (const [token, value] of this.tokenMap.entries()) {
          if (value === beneficiary.fullName) {
            beneficiaryToken = token;
            break;
          }
        }

        if (!beneficiaryToken) {
          beneficiaryToken = `[BENEFICIARY-${index + 1}]`;
          this.tokenMap.set(beneficiaryToken, beneficiary.fullName);
        }

        data += `Beneficiary: ${beneficiaryToken}\n`;
      }

      data += `\n`;
    });

    return data;
  }

  /**
   * Anonymize minor beneficiary provisions
   */
  private anonymizeMinorProvisions(willContent: WillContent): string {
    const provisions = willContent.minorBeneficiaryProvisions;
    if (!provisions) return '';

    let data = `## Minor Beneficiary Provisions\n`;
    data += `Method: ${provisions.method}\n`;

    if (provisions.ageOfInheritance) {
      data += `Age of Inheritance: ${provisions.ageOfInheritance}\n`;
    }

    if (provisions.instructions) {
      data += `Instructions: ${provisions.instructions}\n`;
    }

    data += `\n`;
    return data;
  }

  /**
   * Create a unique token for a given type
   */
  private createToken(type: 'id' | 'address' | 'phone' | 'email' | 'account'): string {
    this.tokenCounter[type]++;
    const typeUpper = type.toUpperCase().replace('-', '_');
    return `[${typeUpper}-${this.tokenCounter[type]}]`;
  }

  /**
   * Estimate token count (rough approximation: 1 token ≈ 4 characters)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
