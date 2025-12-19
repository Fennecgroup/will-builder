// ============================================
// TEMPORARY DEVELOPMENT FEATURE
// This sample is for development/testing only.
// See removal instructions in plan file.
// ============================================

import type { WillContent } from '@/lib/types/will';

// Sample 1: Simple Single Person - Minimal Assets
// Tests: Minimal will scenario, missing family structures, simple beneficiary setup
export const simpleSingleContent: WillContent = {
  testator: {
    id: 'testator-simple-001',
    fullName: 'Lindiwe Nomusa Dube',
    dateOfBirth: '1988-07-15',
    idNumber: '8807155678091', // SA ID format: YYMMDD SSSS C A Z
    address: {
      street: '12 Jan Smuts Avenue',
      city: 'Johannesburg',
      state: 'Gauteng',
      postalCode: '2001',
      country: 'South Africa',
    },
    phone: '+27 81 234 5678',
    email: 'lindiwe.dube@email.co.za',
    occupation: 'Marketing Manager',
  },

  maritalStatus: 'single',

  marriage: {
    status: 'single',
  },

  children: [],

  assets: [
    {
      id: 'asset-simple-001',
      type: 'real-estate',
      description: 'Two bedroom apartment with parking bay',
      location: 'Unit 305, The Columns, 12 Jan Smuts Avenue, Johannesburg, Gauteng',
      estimatedValue: 950000,
      currency: 'ZAR',
      notes: 'Sectional Title Unit 305, Body Corporate levies R1,850 per month',
    },
    {
      id: 'asset-simple-002',
      type: 'bank-account',
      description: 'Savings Account',
      accountNumber: '****3456',
      estimatedValue: 85000,
      currency: 'ZAR',
      notes: 'Capitec Bank - Johannesburg Branch',
    },
    {
      id: 'asset-simple-003',
      type: 'investment',
      description: 'Retirement Annuity',
      accountNumber: '****7890',
      estimatedValue: 450000,
      currency: 'ZAR',
      notes: 'Old Mutual Retirement Annuity Fund',
    },
  ],

  beneficiaries: [
    {
      id: 'ben-simple-001',
      fullName: 'Zanele Nomusa Dube',
      idNumber: '8505125789084',
      relationship: 'Sister',
      dateOfBirth: '1985-05-12',
      allocationPercentage: 100,
      isMinor: false,
    },
  ],

  executors: [
    {
      id: 'exec-simple-001',
      fullName: 'Thandi Patricia Ndlovu',
      idNumber: '8803155234089',
      relationship: 'Best Friend',
      address: {
        street: '89 Grayston Drive',
        city: 'Sandton',
        state: 'Gauteng',
        postalCode: '2196',
        country: 'South Africa',
      },
      phone: '+27 82 345 6789',
      email: 'thandi.ndlovu@email.co.za',
      isAlternate: false,
    },
  ],

  witnesses: [
    {
      id: 'wit-simple-001',
      fullName: 'Sipho John Mthembu',
      idNumber: '7906125678092',
      address: {
        street: '45 Rivonia Road',
        city: 'Johannesburg',
        state: 'Gauteng',
        postalCode: '2001',
        country: 'South Africa',
      },
      phone: '+27 83 456 7890',
      occupation: 'Attorney',
      dateWitnessed: '2025-01-15',
    },
    {
      id: 'wit-simple-002',
      fullName: 'Nomvula Grace Khumalo',
      idNumber: '8107155789087',
      address: {
        street: '123 Oxford Road',
        city: 'Parktown',
        state: 'Gauteng',
        postalCode: '2193',
        country: 'South Africa',
      },
      phone: '+27 84 567 8901',
      occupation: 'Paralegal',
      dateWitnessed: '2025-01-15',
    },
  ],

  guardians: [],

  liabilities: [
    {
      id: 'liab-simple-001',
      type: 'credit-card',
      creditor: 'FNB Gold Credit Card',
      amount: 12000,
      currency: 'ZAR',
      accountNumber: '****5678',
    },
  ],

  funeralWishes: {
    preference: 'burial',
    location: 'Roodepoort Cemetery, Johannesburg',
    specificInstructions:
      'Simple ceremony with family and close friends. No elaborate arrangements necessary.',
    prePaid: false,
    religiousPreferences: 'Christian service in English and Zulu',
  },

  digitalAssets: [
    {
      id: 'digital-simple-001',
      type: 'email',
      platform: 'Gmail',
      username: 'lindiwe.dube@gmail.com',
      instructions: 'Close account after downloading important documents',
      beneficiaryId: 'ben-simple-001',
    },
    {
      id: 'digital-simple-002',
      type: 'social-media',
      platform: 'Instagram',
      username: '@lindiwedube',
      instructions: 'Memorialize account',
      beneficiaryId: 'ben-simple-001',
    },
  ],

  specialInstructions: `
    1. All debts and funeral expenses should be paid from my estate before distribution.
    2. My personal belongings and household effects shall be distributed to my sister Zanele.
    3. If my sister predeceases me, my estate shall devolve upon her lawful descendants.
  `,

  revocationClause:
    'I hereby revoke all previous Wills and testamentary writings made by me at any time whatsoever.',

  residuaryClause:
    'All the rest, residue, and remainder of my estate, both movable and immovable, of whatever kind and wherever situated, I give, devise, and bequeath to my sister, Zanele Nomusa Dube (ID: 8505125789084).',

  specificBequests: [],

  attestationClause:
    'SIGNED at Johannesburg on this 15th day of January 2025, in the presence of the undersigned witnesses, who attest and bear witness to the signing hereof by me and by each other in the presence of me and of each other, all being present together at the same time.',

  dateExecuted: '2025-01-15',
  placeExecuted: 'Johannesburg, Gauteng, South Africa',
};
