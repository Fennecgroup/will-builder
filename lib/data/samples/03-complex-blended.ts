// ============================================
// TEMPORARY DEVELOPMENT FEATURE
// This sample is for development/testing only.
// See removal instructions in plan file.
// ============================================

import type { WillContent } from '@/lib/types/will';

// Sample 3: Complex Blended Family - Multiple Marriages
// Tests: Multiple marriages, children from different marriages, business interests, international assets, professional executors
export const complexBlendedContent: WillContent = {
  testator: {
    id: 'testator-complex-001',
    fullName: 'Johannes Petrus Van Wyk',
    dateOfBirth: '1969-09-10',
    idNumber: '6909105123084', // SA ID format: YYMMDD SSSS C A Z
    address: {
      street: '156 Constantia Main Road',
      city: 'Cape Town',
      state: 'Western Cape',
      postalCode: '7806',
      country: 'South Africa',
    },
    phone: '+27 82 567 8901',
    email: 'johan.vanwyk@vwconstruction.co.za',
    occupation: 'Construction Company Director',
  },

  maritalStatus: 'married',

  marriage: {
    status: 'married',
    spouses: [
      {
        id: 'spouse-complex-001',
        fullName: 'Marina Isabel Da Silva',
        idNumber: '7511155234089',
        dateOfBirth: '1975-11-15',
        dateOfMarriage: '2018-06-20',
        maritalRegime: 'OCOP-A', // Out of Community of Property with Accrual
      },
    ],
  },

  children: [
    // Children from first marriage
    {
      id: 'child-complex-001',
      fullName: 'Pieter Johannes Van Wyk',
      idNumber: '9701105456082',
      dateOfBirth: '1997-01-10',
      isMinor: false,
      relationshipToTestator: 'biological',
    },
    {
      id: 'child-complex-002',
      fullName: 'Anna Magdalena Van Wyk',
      idNumber: '0005125678089',
      dateOfBirth: '2000-05-12',
      isMinor: false,
      relationshipToTestator: 'biological',
    },
    // Child from second marriage
    {
      id: 'child-complex-003',
      fullName: 'Emma Sofia Van Wyk',
      dateOfBirth: '2015-08-20',
      isMinor: true,
      parentSpouseId: 'spouse-complex-001',
      relationshipToTestator: 'biological',
    },
    // Stepchild from current spouse's previous marriage
    {
      id: 'child-complex-004',
      fullName: 'Liam Daniel Da Silva',
      dateOfBirth: '2011-03-15',
      isMinor: true,
      parentSpouseId: 'spouse-complex-001',
      relationshipToTestator: 'stepchild',
    },
  ],

  assets: [
    // Real Estate
    {
      id: 'asset-complex-001',
      type: 'real-estate',
      description: 'Primary Residence - Luxury home with vineyard',
      location: '156 Constantia Main Road, Cape Town, Western Cape',
      estimatedValue: 12500000,
      currency: 'ZAR',
      notes: 'Title Deed No. T56789/2018, includes 2 hectare vineyard',
    },
    {
      id: 'asset-complex-002',
      type: 'real-estate',
      description: 'Commercial Property - Office Building',
      location: '45 Loop Street, Cape Town CBD, Western Cape',
      estimatedValue: 8900000,
      currency: 'ZAR',
      notes: 'Rental income R95,000 per month',
    },
    {
      id: 'asset-complex-003',
      type: 'real-estate',
      description: 'Farm - Working Citrus Farm',
      location: 'Citrusdal, Western Cape',
      estimatedValue: 18500000,
      currency: 'ZAR',
      notes: 'Farm Portion 123, 150 hectares, registered farming entity',
    },
    {
      id: 'asset-complex-004',
      type: 'real-estate',
      description: 'International Property - Portugal Villa',
      location: 'Algarve, Portugal',
      estimatedValue: 15000000,
      currency: 'ZAR',
      notes: 'Oceanfront villa, equivalent to €750k EUR',
    },
    // Business Interests
    {
      id: 'asset-complex-005',
      type: 'business',
      description: '60% shareholding in VW Construction (Pty) Ltd',
      estimatedValue: 28000000,
      currency: 'ZAR',
      notes: 'Registration No. 2005/234567/07, established business with 50+ employees',
    },
    {
      id: 'asset-complex-006',
      type: 'business',
      description: '35% shareholding in Cape Property Development (Pty) Ltd',
      estimatedValue: 12000000,
      currency: 'ZAR',
      notes: 'Registration No. 2012/345678/07, commercial property development',
    },
    // Vehicles
    {
      id: 'asset-complex-007',
      type: 'vehicle',
      description: '2023 Mercedes-Benz GLE 400d',
      estimatedValue: 1450000,
      currency: 'ZAR',
      notes: 'Registration: VWC001WC',
    },
    {
      id: 'asset-complex-008',
      type: 'vehicle',
      description: '2021 Range Rover Sport',
      estimatedValue: 1200000,
      currency: 'ZAR',
      notes: 'Registration: VWC002WC',
    },
    // Financial Assets
    {
      id: 'asset-complex-009',
      type: 'bank-account',
      description: 'Business Current Account',
      accountNumber: '****6789',
      estimatedValue: 850000,
      currency: 'ZAR',
      notes: 'Nedbank - Cape Town',
    },
    {
      id: 'asset-complex-010',
      type: 'bank-account',
      description: 'Personal Savings Account',
      accountNumber: '****3456',
      estimatedValue: 2500000,
      currency: 'ZAR',
      notes: 'Standard Bank Private Banking',
    },
    {
      id: 'asset-complex-011',
      type: 'investment',
      description: 'Share Portfolio - JSE Listed Shares',
      accountNumber: '****7890',
      estimatedValue: 8500000,
      currency: 'ZAR',
      notes: 'Investec Wealth Management',
    },
    {
      id: 'asset-complex-012',
      type: 'investment',
      description: 'Retirement Annuity',
      accountNumber: '****2345',
      estimatedValue: 6500000,
      currency: 'ZAR',
      notes: 'Allan Gray Retirement Annuity',
    },
    {
      id: 'asset-complex-013',
      type: 'insurance',
      description: 'Life Insurance Policy',
      accountNumber: 'POL-WC-456789',
      estimatedValue: 15000000,
      currency: 'ZAR',
      notes: 'Sanlam - Whole Life Cover',
    },
  ],

  beneficiaries: [
    {
      id: 'ben-complex-001',
      fullName: 'Marina Isabel Da Silva',
      idNumber: '7511155234089',
      relationship: 'Spouse',
      dateOfBirth: '1975-11-15',
      allocationPercentage: 40,
      isMinor: false,
    },
    {
      id: 'ben-complex-002',
      fullName: 'Pieter Johannes Van Wyk',
      idNumber: '9701105456082',
      relationship: 'Son (First Marriage)',
      dateOfBirth: '1997-01-10',
      allocationPercentage: 15,
      isMinor: false,
    },
    {
      id: 'ben-complex-003',
      fullName: 'Anna Magdalena Van Wyk',
      idNumber: '0005125678089',
      relationship: 'Daughter (First Marriage)',
      dateOfBirth: '2000-05-12',
      allocationPercentage: 15,
      isMinor: false,
    },
    {
      id: 'ben-complex-004',
      fullName: 'Emma Sofia Van Wyk',
      relationship: 'Daughter (Second Marriage)',
      dateOfBirth: '2015-08-20',
      allocationPercentage: 20,
      isMinor: true,
      guardianId: 'guard-complex-001',
    },
    {
      id: 'ben-complex-005',
      fullName: 'Liam Daniel Da Silva',
      relationship: 'Stepson',
      dateOfBirth: '2011-03-15',
      allocationPercentage: 10,
      isMinor: true,
      guardianId: 'guard-complex-001',
    },
  ],

  executors: [
    {
      id: 'exec-complex-001',
      fullName: 'Marina Isabel Da Silva',
      idNumber: '7511155234089',
      relationship: 'Spouse',
      address: {
        street: '156 Constantia Main Road',
        city: 'Cape Town',
        state: 'Western Cape',
        postalCode: '7806',
        country: 'South Africa',
      },
      phone: '+27 83 678 9012',
      email: 'marina.vanwyk@email.co.za',
      isAlternate: false,
    },
    {
      id: 'exec-complex-002',
      fullName: 'Hendrik Willem Botha',
      idNumber: '6805105234087',
      relationship: 'Attorney',
      address: {
        street: '88 St Georges Mall',
        city: 'Cape Town',
        state: 'Western Cape',
        postalCode: '8001',
        country: 'South Africa',
      },
      phone: '+27 21 456 7890',
      email: 'hbotha@botha-attorneys.co.za',
      isAlternate: false,
    },
  ],

  witnesses: [
    {
      id: 'wit-complex-001',
      fullName: 'Susan Margaret Thompson',
      idNumber: '7207125678093',
      address: {
        street: '23 Kildare Road',
        city: 'Newlands',
        state: 'Western Cape',
        postalCode: '7700',
        country: 'South Africa',
      },
      phone: '+27 82 789 0123',
      occupation: 'Chartered Accountant',
      dateWitnessed: '2025-01-15',
    },
    {
      id: 'wit-complex-002',
      fullName: 'Michael John Roberts',
      idNumber: '7109145789082',
      address: {
        street: '67 Main Road',
        city: 'Claremont',
        state: 'Western Cape',
        postalCode: '7708',
        country: 'South Africa',
      },
      phone: '+27 83 890 1234',
      occupation: 'Attorney',
      dateWitnessed: '2025-01-15',
    },
  ],

  guardians: [
    {
      id: 'guard-complex-001',
      fullName: 'Marina Isabel Da Silva',
      idNumber: '7511155234089',
      relationship: 'Mother (Spouse)',
      address: {
        street: '156 Constantia Main Road',
        city: 'Cape Town',
        state: 'Western Cape',
        postalCode: '7806',
        country: 'South Africa',
      },
      phone: '+27 83 678 9012',
      email: 'marina.vanwyk@email.co.za',
      forChildren: ['Emma Sofia Van Wyk', 'Liam Daniel Da Silva'],
      isAlternate: false,
    },
    {
      id: 'guard-complex-002',
      fullName: 'Pieter Johannes Van Wyk',
      idNumber: '9701105456082',
      relationship: 'Brother (Half-brother to minors)',
      address: {
        street: '45 Camps Bay Drive',
        city: 'Cape Town',
        state: 'Western Cape',
        postalCode: '8005',
        country: 'South Africa',
      },
      phone: '+27 84 901 2345',
      email: 'pieter.vanwyk@email.co.za',
      forChildren: ['Emma Sofia Van Wyk', 'Liam Daniel Da Silva'],
      isAlternate: true,
    },
  ],

  liabilities: [
    {
      id: 'liab-complex-001',
      type: 'mortgage',
      creditor: 'Nedbank Private Wealth',
      amount: 4500000,
      currency: 'ZAR',
      accountNumber: '****4567',
      notes: 'Bond on primary residence',
    },
    {
      id: 'liab-complex-002',
      type: 'mortgage',
      creditor: 'Standard Bank',
      amount: 2800000,
      currency: 'ZAR',
      accountNumber: '****8901',
      notes: 'Bond on commercial property',
    },
    {
      id: 'liab-complex-003',
      type: 'loan',
      creditor: 'Mercedes-Benz Financial Services',
      amount: 650000,
      currency: 'ZAR',
      accountNumber: '****2345',
      notes: 'Vehicle finance',
    },
  ],

  funeralWishes: {
    preference: 'burial',
    location: 'Stellenbosch Cemetery, Western Cape',
    specificInstructions:
      'Private family ceremony followed by memorial service at the farm. Traditional Afrikaans hymns to be sung.',
    prePaid: false,
    religiousPreferences: 'Reformed Church ceremony in Afrikaans',
  },

  digitalAssets: [
    {
      id: 'digital-complex-001',
      type: 'email',
      platform: 'Gmail',
      username: 'johan.vanwyk@vwconstruction.co.za',
      instructions:
        'Business email to be managed by business partner. Personal emails to be archived.',
      beneficiaryId: 'ben-complex-001',
    },
    {
      id: 'digital-complex-002',
      type: 'cloud-storage',
      platform: 'Dropbox Business',
      username: 'johan.vanwyk@vwconstruction.co.za',
      instructions:
        'Contains business documents. Transfer to business partner or close after archiving.',
      beneficiaryId: 'ben-complex-001',
    },
    {
      id: 'digital-complex-003',
      type: 'cryptocurrency',
      platform: 'Binance',
      instructions:
        'Small cryptocurrency portfolio (Bitcoin, Ethereum). Recovery keys in safe deposit box at Standard Bank.',
      beneficiaryId: 'ben-complex-001',
    },
  ],

  specialInstructions: `
    1. All debts, funeral expenses, and estate duty should be paid from my estate before distribution to beneficiaries.
    2. My business interests in VW Construction (Pty) Ltd and Cape Property Development (Pty) Ltd should first be offered to my existing business partners at fair market value as determined by an independent valuator. If they decline, shares may be sold or transferred to beneficiaries as determined by executors.
    3. The farm at Citrusdal should be offered to my son Pieter first at fair market value. If he declines, it should be sold and proceeds distributed according to allocation percentages.
    4. The Portugal villa should be sold within 24 months of my death unless my spouse wishes to retain it, in which case it shall form part of her share.
    5. For my minor daughter Emma, her inheritance shall be paid into the Guardian's Fund and shall be payable to her at age 25 (twenty-five) years.
    6. For my stepson Liam, his inheritance shall be paid into a testamentary trust managed by my spouse Marina and attorney Hendrik Botha, payable to him at age 25 (twenty-five) years.
    7. I acknowledge that I have provided financial support to my adult children from my first marriage during my lifetime. The allocation percentages reflect this consideration.
    8. My spouse Marina shall have the right to reside in the primary residence for as long as she wishes, with maintenance costs paid from the estate.
    9. If any beneficiary contests this Will, that beneficiary shall forfeit their inheritance which shall then be distributed equally among the remaining beneficiaries.
  `,

  revocationClause:
    'I hereby revoke all previous Wills and testamentary writings made by me at any time whatsoever, including any Will made during my first marriage.',

  residuaryClause:
    'All the rest, residue, and remainder of my estate, both movable and immovable, of whatever kind and wherever situated, which I have not herein otherwise disposed of, I give, devise, and bequeath to my spouse, Marina Isabel Da Silva (ID: 7511155234089), failing whom to my children in the percentages specified in this Will.',

  specificBequests: [],

  minorBeneficiaryProvisions: {
    method: 'testamentary-trust',
    ageOfInheritance: 25,
    instructions:
      "Minor beneficiaries' inheritance shall be held in trust until they reach 25 years of age. Trustees may release funds for education, health, and maintenance needs before then.",
  },

  attestationClause:
    'SIGNED at Cape Town on this 15th day of January 2025, in the presence of the undersigned witnesses, who attest and bear witness to the signing hereof by me and by each other in the presence of me and of each other, all being present together at the same time.',

  dateExecuted: '2025-01-15',
  placeExecuted: 'Cape Town, Western Cape, South Africa',
};
