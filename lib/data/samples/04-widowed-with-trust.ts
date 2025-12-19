// ============================================
// TEMPORARY DEVELOPMENT FEATURE
// This sample is for development/testing only.
// See removal instructions in plan file.
// ============================================

import type { WillContent } from '@/lib/types/will';

// Sample 4: Widowed with Trust - Special Needs and Charitable Giving
// Tests: Testamentary trusts, special needs provisions, charitable giving, professional executors, high-value estate
export const widowedWithTrustContent: WillContent = {
  testator: {
    id: 'testator-widowed-001',
    fullName: 'Nomvula Grace Khumalo',
    dateOfBirth: '1965-12-10',
    idNumber: '6512105234087', // SA ID format: YYMMDD SSSS C A Z
    address: {
      street: '234 Jan Smuts Avenue',
      city: 'Johannesburg',
      state: 'Gauteng',
      postalCode: '2196',
      country: 'South Africa',
    },
    phone: '+27 82 901 2345',
    email: 'nomvula.khumalo@email.co.za',
    occupation: 'Author and Business Owner',
  },

  maritalStatus: 'widowed',

  marriage: {
    status: 'widowed',
  },

  children: [
    {
      id: 'child-widowed-001',
      fullName: 'Thando Michael Khumalo',
      idNumber: '9304105456089',
      dateOfBirth: '1993-04-10',
      isMinor: false,
      relationshipToTestator: 'biological',
    },
    {
      id: 'child-widowed-002',
      fullName: 'Bongani Joseph Khumalo',
      idNumber: '9607125678084',
      dateOfBirth: '1996-07-12',
      isMinor: false,
      relationshipToTestator: 'biological',
    },
    {
      id: 'child-widowed-003',
      fullName: 'Zinhle Patricia Khumalo',
      idNumber: '9909155789092',
      dateOfBirth: '1999-09-15',
      isMinor: false,
      relationshipToTestator: 'biological',
    },
  ],

  assets: [
    // Real Estate
    {
      id: 'asset-widowed-001',
      type: 'real-estate',
      description: 'Primary Residence - Luxury Estate',
      location: '234 Jan Smuts Avenue, Johannesburg, Gauteng',
      estimatedValue: 8500000,
      currency: 'ZAR',
      notes: 'Title Deed No. T78901/2005, 2,000 sqm stand',
    },
    {
      id: 'asset-widowed-002',
      type: 'real-estate',
      description: 'Vacation Home - Plettenberg Bay',
      location: 'Plettenberg Bay, Western Cape',
      estimatedValue: 6500000,
      currency: 'ZAR',
      notes: 'Beachfront property, Title Deed No. T23456/2010',
    },
    {
      id: 'asset-widowed-003',
      type: 'real-estate',
      description: 'Investment Property - Apartment Building',
      location: 'Rosebank, Johannesburg, Gauteng',
      estimatedValue: 12000000,
      currency: 'ZAR',
      notes: '12 unit apartment building, rental income R180,000 per month',
    },
    // Business
    {
      id: 'asset-widowed-004',
      type: 'business',
      description: '45% shareholding in Khumalo Logistics (Pty) Ltd',
      estimatedValue: 25000000,
      currency: 'ZAR',
      notes: 'Registration No. 1998/567890/07, freight and logistics company',
    },
    // Investments
    {
      id: 'asset-widowed-005',
      type: 'investment',
      description: 'Share Portfolio - Diversified',
      accountNumber: '****5678',
      estimatedValue: 18000000,
      currency: 'ZAR',
      notes: 'PSG Wealth Management - Blue Chip JSE Shares',
    },
    {
      id: 'asset-widowed-006',
      type: 'investment',
      description: 'Unit Trust Portfolio',
      accountNumber: '****9012',
      estimatedValue: 8500000,
      currency: 'ZAR',
      notes: 'Allan Gray Balanced Fund and Equity Fund',
    },
    {
      id: 'asset-widowed-007',
      type: 'investment',
      description: 'Retirement Annuity',
      accountNumber: '****3456',
      estimatedValue: 12000000,
      currency: 'ZAR',
      notes: 'Sanlam Glacier Retirement Annuity',
    },
    {
      id: 'asset-widowed-008',
      type: 'investment',
      description: 'Fixed Deposit Accounts',
      accountNumber: '****7890',
      estimatedValue: 5000000,
      currency: 'ZAR',
      notes: 'Various banks, high interest fixed deposits',
    },
    // Bank Accounts
    {
      id: 'asset-widowed-009',
      type: 'bank-account',
      description: 'Current Account',
      accountNumber: '****2345',
      estimatedValue: 850000,
      currency: 'ZAR',
      notes: 'Standard Bank Private Banking',
    },
    {
      id: 'asset-widowed-010',
      type: 'bank-account',
      description: 'Savings Account',
      accountNumber: '****6789',
      estimatedValue: 1200000,
      currency: 'ZAR',
      notes: 'Nedbank Private Wealth',
    },
    // Insurance
    {
      id: 'asset-widowed-011',
      type: 'insurance',
      description: 'Life Insurance Policy',
      accountNumber: 'POL-GP-789012',
      estimatedValue: 10000000,
      currency: 'ZAR',
      notes: 'Liberty Life - Whole Life Cover',
    },
    // Personal Property
    {
      id: 'asset-widowed-012',
      type: 'personal-property',
      description: 'Art Collection - South African Masters',
      estimatedValue: 5000000,
      currency: 'ZAR',
      notes: 'Works by Irma Stern, Gerard Sekoto, and Maggie Laubser. Professionally valued and insured.',
    },
    {
      id: 'asset-widowed-013',
      type: 'personal-property',
      description: 'Jewelry Collection',
      estimatedValue: 1500000,
      currency: 'ZAR',
      notes: 'Diamond jewelry and family heirlooms, stored in bank vault',
    },
    // Vehicle
    {
      id: 'asset-widowed-014',
      type: 'vehicle',
      description: '2023 Mercedes-Benz S-Class S500',
      estimatedValue: 2200000,
      currency: 'ZAR',
      notes: 'Registration: NGK001GP',
    },
  ],

  beneficiaries: [
    {
      id: 'ben-widowed-001',
      fullName: 'Thando Michael Khumalo',
      idNumber: '9304105456089',
      relationship: 'Son',
      dateOfBirth: '1993-04-10',
      allocationPercentage: 30,
      isMinor: false,
    },
    {
      id: 'ben-widowed-002',
      fullName: 'Bongani Joseph Khumalo',
      idNumber: '9607125678084',
      relationship: 'Son (Special Needs)',
      dateOfBirth: '1996-07-12',
      allocationPercentage: 30,
      isMinor: false,
    },
    {
      id: 'ben-widowed-003',
      fullName: 'Zinhle Patricia Khumalo',
      idNumber: '9909155789092',
      relationship: 'Daughter',
      dateOfBirth: '1999-09-15',
      allocationPercentage: 30,
      isMinor: false,
    },
    {
      id: 'ben-widowed-004',
      fullName: 'Future Leaders Education Fund',
      relationship: 'Charity',
      allocationPercentage: 5,
      isMinor: false,
    },
    {
      id: 'ben-widowed-005',
      fullName: 'Disability Rights South Africa',
      relationship: 'Charity',
      allocationPercentage: 5,
      isMinor: false,
    },
  ],

  executors: [
    {
      id: 'exec-widowed-001',
      fullName: 'David John Mphahlele',
      idNumber: '6908105234082',
      relationship: 'Attorney',
      address: {
        street: '123 Sandton Drive',
        city: 'Sandton',
        state: 'Gauteng',
        postalCode: '2196',
        country: 'South Africa',
      },
      phone: '+27 11 234 5678',
      email: 'dmphahlele@mphahlele-attorneys.co.za',
      isAlternate: false,
    },
    {
      id: 'exec-widowed-002',
      fullName: 'Sarah Elizabeth Naidoo',
      idNumber: '7105125678091',
      relationship: 'Chartered Accountant',
      address: {
        street: '45 West Street',
        city: 'Sandton',
        state: 'Gauteng',
        postalCode: '2196',
        country: 'South Africa',
      },
      phone: '+27 11 345 6789',
      email: 'snaidoo@naidoo-ca.co.za',
      isAlternate: false,
    },
  ],

  witnesses: [
    {
      id: 'wit-widowed-001',
      fullName: 'Patricia Anne Wilson',
      idNumber: '7308125678095',
      address: {
        street: '89 Oxford Road',
        city: 'Parktown',
        state: 'Gauteng',
        postalCode: '2193',
        country: 'South Africa',
      },
      phone: '+27 82 456 7890',
      occupation: 'Doctor',
      dateWitnessed: '2025-01-15',
    },
    {
      id: 'wit-widowed-002',
      fullName: 'Robert James Anderson',
      idNumber: '7006145789083',
      address: {
        street: '234 Jan Smuts Avenue',
        city: 'Johannesburg',
        state: 'Gauteng',
        postalCode: '2196',
        country: 'South Africa',
      },
      phone: '+27 83 567 8901',
      occupation: 'Financial Advisor',
      dateWitnessed: '2025-01-15',
    },
  ],

  guardians: [],

  trustees: [
    {
      id: 'trustee-widowed-001',
      fullName: 'Thando Michael Khumalo',
      idNumber: '9304105456089',
      relationship: 'Son (Brother of beneficiary)',
      address: {
        street: '67 Coronation Road',
        city: 'Parktown',
        state: 'Gauteng',
        postalCode: '2193',
        country: 'South Africa',
      },
      phone: '+27 84 678 9012',
      email: 'thando.khumalo@email.co.za',
      forBeneficiaries: ['ben-widowed-002'],
      isAlternate: false,
    },
    {
      id: 'trustee-widowed-002',
      fullName: 'FirstRand Trust Services (Pty) Ltd',
      idNumber: '1995/012345/07',
      relationship: 'Professional Trustee',
      address: {
        street: 'FirstRand Bank Building, 1 Merchant Place',
        city: 'Sandton',
        state: 'Gauteng',
        postalCode: '2196',
        country: 'South Africa',
      },
      phone: '+27 11 371 2000',
      email: 'trustservices@firstrand.co.za',
      forBeneficiaries: ['ben-widowed-002'],
      isAlternate: false,
    },
  ],

  liabilities: [
    {
      id: 'liab-widowed-001',
      type: 'mortgage',
      creditor: 'Nedbank Private Wealth',
      amount: 2500000,
      currency: 'ZAR',
      accountNumber: '****4567',
      notes: 'Bond on investment property',
    },
    {
      id: 'liab-widowed-002',
      type: 'credit-card',
      creditor: 'American Express Platinum',
      amount: 45000,
      currency: 'ZAR',
      accountNumber: '****8901',
    },
  ],

  funeralWishes: {
    preference: 'burial',
    location: 'Westpark Cemetery, Johannesburg',
    specificInstructions:
      'Traditional Zulu ceremony with Christian service. Large memorial service to accommodate community and business associates. Donations in lieu of flowers to Disability Rights South Africa.',
    prePaid: true,
    funeralHome: 'Doves Funeral Services',
    religiousPreferences: 'Methodist Church ceremony in English and Zulu',
  },

  digitalAssets: [
    {
      id: 'digital-widowed-001',
      type: 'email',
      platform: 'Gmail',
      username: 'nomvula.khumalo@email.co.za',
      instructions:
        'Archive all personal and business correspondence. Contains manuscript drafts and publishing correspondence.',
      beneficiaryId: 'ben-widowed-003',
    },
    {
      id: 'digital-widowed-002',
      type: 'social-media',
      platform: 'Twitter',
      username: '@nomvulakhumalo',
      instructions: 'Memorialize account. Public figure account with 50k+ followers.',
      beneficiaryId: 'ben-widowed-003',
    },
    {
      id: 'digital-widowed-003',
      type: 'cloud-storage',
      platform: 'Dropbox',
      username: 'nomvula.khumalo@email.co.za',
      instructions:
        'Contains unpublished manuscripts, family photos, and business documents. Transfer ownership to daughter Zinhle.',
      beneficiaryId: 'ben-widowed-003',
    },
    {
      id: 'digital-widowed-004',
      type: 'social-media',
      platform: 'LinkedIn',
      username: 'nomvula-khumalo',
      instructions: 'Memorialize account',
      beneficiaryId: 'ben-widowed-001',
    },
    {
      id: 'digital-widowed-005',
      type: 'other',
      platform: 'Author Website',
      username: 'www.nomvulakhumalo.co.za',
      instructions:
        'Maintain website for 5 years with archive of published works. Hosting and domain renewal funds to be paid from estate.',
      beneficiaryId: 'ben-widowed-003',
    },
  ],

  specialInstructions: `
    1. All debts, funeral expenses, and estate duty should be paid from my estate before distribution to beneficiaries.
    2. My art collection should be professionally valued by Strauss & Co Auctioneers. The collection may be divided among my three children as they agree, or sold and proceeds distributed.
    3. My jewelry collection is to be divided equally between my daughter Zinhle and my daughters-in-law.
    4. For my son Bongani who has special needs (autism spectrum disorder), his inheritance MUST be placed in a testamentary trust managed by his brother Thando and FirstRand Trust Services. The trust should provide for:
       - His ongoing care, accommodation, therapy, and medical needs
       - A monthly allowance for living expenses
       - Funds for recreational activities and quality of life enhancements
       - Professional management to ensure his financial security for life
    5. My business shareholding in Khumalo Logistics (Pty) Ltd should be offered to my existing business partners at fair market value. If they decline, my children may decide whether to retain or sell the shares.
    6. Charitable bequests:
       - 5% of my estate to Future Leaders Education Fund (NPO 123-456) to fund scholarships for disadvantaged youth
       - 5% of my estate to Disability Rights South Africa (NPO 789-012) to support advocacy and support services
    7. My unpublished manuscripts and literary works are bequeathed to my daughter Zinhle, who has authority to publish, edit, or archive as she deems appropriate.
    8. I request that my children work together harmoniously in managing the trust for Bongani's benefit, always prioritizing his wellbeing and dignity.
    9. If the charitable organizations named no longer exist, the executors should distribute those funds to similar registered NPOs with compatible missions.
  `,

  revocationClause:
    'I hereby revoke all previous Wills and testamentary writings made by me at any time whatsoever.',

  residuaryClause:
    'All the rest, residue, and remainder of my estate, both movable and immovable, of whatever kind and wherever situated, which I have not herein otherwise disposed of, I give, devise, and bequeath to my three children, Thando Michael Khumalo, Bongani Joseph Khumalo, and Zinhle Patricia Khumalo, in equal shares, provided that Bongani\'s share shall be held in the testamentary trust established for his benefit.',

  specificBequests: [],

  minorBeneficiaryProvisions: {
    method: 'testamentary-trust',
    ageOfInheritance: 18,
    instructions:
      'A testamentary trust shall be established for my son Bongani Joseph Khumalo to provide for his lifelong care and financial security due to his special needs. The trust shall be managed by his brother Thando and FirstRand Trust Services as co-trustees.',
  },

  attestationClause:
    'SIGNED at Johannesburg on this 15th day of January 2025, in the presence of the undersigned witnesses, who attest and bear witness to the signing hereof by me and by each other in the presence of me and of each other, all being present together at the same time.',

  dateExecuted: '2025-01-15',
  placeExecuted: 'Johannesburg, Gauteng, South Africa',
};
