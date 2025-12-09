import type { WillContent } from '@/lib/types/will';

export const sampleWillContent: WillContent = {
  
  testator: {
    id: 'testator-001',
    fullName: 'Thabo Johannes Molefe',
    dateOfBirth: '1975-05-12',
    idNumber: '7505125123089', // SA ID format: YYMMDD SSSS C A Z
    address: {
      street: '45 Nelson Mandela Boulevard',
      city: 'Sandton',
      state: 'Gauteng', // SA Province
      postalCode: '2196',
      country: 'South Africa',
    },
    phone: '+27 82 456 7890',
    email: 'thabo.molefe@email.co.za',
    occupation: 'Software Engineer',
  },

  maritalStatus: 'married',

  marriage: {
    status: 'married',
    spouse: {
      fullName: 'Naledi Grace Molefe',
      idNumber: '7808155234092', // SA ID format
      dateOfBirth: '1978-08-15',
      dateOfMarriage: '2005-12-10',
      maritalRegime: 'ICOP',
    },
    hasChildren: true,
    numberOfChildren: 2,
    children: [
      {
        id: 'child-001',
        fullName: 'Lerato Molefe',
        idNumber: '0603145345087', // SA ID - over 16
        dateOfBirth: '2006-03-14',
        isMinor: false, // 18+ in 2025
      },
      {
        id: 'child-002',
        fullName: 'Kgosi Molefe',
        dateOfBirth: '2012-11-22',
        isMinor: true, // Under 18
      },
    ],
  },

  assets: [
    {
      id: 'asset-001',
      type: 'real-estate',
      description: 'Primary Residence - 4 bedroom house with swimming pool',
      location: '45 Nelson Mandela Boulevard, Sandton, Gauteng',
      estimatedValue: 4500000,
      currency: 'ZAR',
      notes: 'Title Deed No. T12345/2010',
    },
    {
      id: 'asset-002',
      type: 'real-estate',
      description: 'Vacation Property - Coastal Apartment',
      location: 'Umhlanga Rocks, KwaZulu-Natal',
      estimatedValue: 2800000,
      currency: 'ZAR',
      notes: 'Sectional Title Unit 405',
    },
    {
      id: 'asset-003',
      type: 'vehicle',
      description: '2022 BMW X5 xDrive30d',
      estimatedValue: 1200000,
      currency: 'ZAR',
      notes: 'Registration: ABC123GP',
    },
    {
      id: 'asset-004',
      type: 'vehicle',
      description: '2020 Toyota Fortuner 2.8GD-6',
      estimatedValue: 650000,
      currency: 'ZAR',
      notes: 'Registration: DEF456GP',
    },
    {
      id: 'asset-005',
      type: 'bank-account',
      description: 'Current Account',
      accountNumber: '****4567',
      estimatedValue: 85000,
      currency: 'ZAR',
      notes: 'Standard Bank - Sandton Branch',
    },
    {
      id: 'asset-006',
      type: 'bank-account',
      description: 'Savings Account',
      accountNumber: '****8901',
      estimatedValue: 450000,
      currency: 'ZAR',
      notes: 'FNB - Gold Account',
    },
    {
      id: 'asset-007',
      type: 'investment',
      description: 'Retirement Annuity',
      accountNumber: '****2345',
      estimatedValue: 3200000,
      currency: 'ZAR',
      notes: 'Allan Gray Retirement Annuity',
    },
    {
      id: 'asset-008',
      type: 'investment',
      description: 'Unit Trusts',
      accountNumber: '****6789',
      estimatedValue: 850000,
      currency: 'ZAR',
      notes: 'Coronation Balanced Plus Fund',
    },
    {
      id: 'asset-009',
      type: 'investment',
      description: 'JSE Share Portfolio',
      accountNumber: '****3456',
      estimatedValue: 1500000,
      currency: 'ZAR',
      notes: 'Easy Equities Trading Account',
    },
    {
      id: 'asset-010',
      type: 'insurance',
      description: 'Life Insurance Policy',
      accountNumber: 'POL-SA-789456',
      estimatedValue: 5000000,
      currency: 'ZAR',
      notes: 'Old Mutual - Whole Life Cover',
    },
    {
      id: 'asset-011',
      type: 'business',
      description: '40% shareholding in Tech Solutions (Pty) Ltd',
      estimatedValue: 2000000,
      currency: 'ZAR',
      notes: 'Registration No. 2015/123456/07',
    },
    {
      id: 'asset-012',
      type: 'personal-property',
      description: 'Art Collection - Contemporary South African Art',
      estimatedValue: 180000,
      currency: 'ZAR',
      notes: 'Includes works by William Kentridge and Esther Mahlangu',
    },
  ],

  beneficiaries: [
    {
      id: 'ben-001',
      fullName: 'Naledi Grace Molefe',
      idNumber: '7808155234092',
      relationship: 'Spouse',
      dateOfBirth: '1978-08-15',
      allocationPercentage: 50,
      isMinor: false,
    },
    {
      id: 'ben-002',
      fullName: 'Lerato Molefe',
      idNumber: '0603145345087',
      relationship: 'Daughter',
      dateOfBirth: '2006-03-14',
      allocationPercentage: 25,
      isMinor: false,
    },
    {
      id: 'ben-003',
      fullName: 'Kgosi Molefe',
      relationship: 'Son',
      dateOfBirth: '2012-11-22',
      allocationPercentage: 25,
      isMinor: true,
      guardianId: 'guard-001',
    },
  ],

  executors: [
    {
      id: 'exec-001',
      fullName: 'Naledi Grace Molefe',
      idNumber: '7808155234092',
      relationship: 'Spouse',
      address: {
        street: '45 Nelson Mandela Boulevard',
        city: 'Sandton',
        state: 'Gauteng',
        postalCode: '2196',
        country: 'South Africa',
      },
      phone: '+27 83 567 8901',
      email: 'naledi.molefe@email.co.za',
      isAlternate: false,
    },
    {
      id: 'exec-002',
      fullName: 'Sipho David Molefe',
      idNumber: '7201105187083',
      relationship: 'Brother',
      address: {
        street: '78 Jan Smuts Avenue',
        city: 'Rosebank',
        state: 'Gauteng',
        postalCode: '2196',
        country: 'South Africa',
      },
      phone: '+27 84 678 9012',
      email: 'sipho.molefe@email.co.za',
      isAlternate: true,
    },
  ],

  witnesses: [
    {
      id: 'wit-001',
      fullName: 'Zanele Patricia Dlamini',
      idNumber: '8506125678094',
      address: {
        street: '123 Rivonia Road',
        city: 'Sandton',
        state: 'Gauteng',
        postalCode: '2196',
        country: 'South Africa',
      },
      phone: '+27 82 234 5678',
      occupation: 'Attorney',
      dateWitnessed: '2025-01-15',
    },
    {
      id: 'wit-002',
      fullName: 'Johannes Petrus Van Der Merwe',
      idNumber: '7909145789081',
      address: {
        street: '456 William Nicol Drive',
        city: 'Bryanston',
        state: 'Gauteng',
        postalCode: '2021',
        country: 'South Africa',
      },
      phone: '+27 83 345 6789',
      occupation: 'Chartered Accountant',
      dateWitnessed: '2025-01-15',
    },
  ],

  guardians: [
    {
      id: 'guard-001',
      fullName: 'Sipho David Molefe',
      idNumber: '7201105187083',
      relationship: 'Brother (Uncle)',
      address: {
        street: '78 Jan Smuts Avenue',
        city: 'Rosebank',
        state: 'Gauteng',
        postalCode: '2196',
        country: 'South Africa',
      },
      phone: '+27 84 678 9012',
      email: 'sipho.molefe@email.co.za',
      forChildren: ['Kgosi Molefe'],
      isAlternate: false,
    },
    {
      id: 'guard-002',
      fullName: 'Nomsa Rebecca Khumalo',
      idNumber: '7703105289087',
      relationship: 'Sister (Aunt)',
      address: {
        street: '22 Oxford Road',
        city: 'Parktown',
        state: 'Gauteng',
        postalCode: '2193',
        country: 'South Africa',
      },
      phone: '+27 82 789 0123',
      email: 'nomsa.khumalo@email.co.za',
      forChildren: ['Kgosi Molefe'],
      isAlternate: true,
    },
  ],

  liabilities: [
    {
      id: 'liab-001',
      type: 'mortgage',
      creditor: 'Standard Bank of South Africa',
      amount: 1800000,
      currency: 'ZAR',
      accountNumber: '****3456',
      notes: 'Home Loan - Primary residence bond',
    },
    {
      id: 'liab-002',
      type: 'loan',
      creditor: 'BMW Financial Services SA',
      amount: 450000,
      currency: 'ZAR',
      accountNumber: '****7890',
      notes: 'Vehicle finance agreement',
    },
    {
      id: 'liab-003',
      type: 'credit-card',
      creditor: 'Nedbank - Gold Credit Card',
      amount: 35000,
      currency: 'ZAR',
      accountNumber: '****1234',
    },
  ],

  funeralWishes: {
    preference: 'burial',
    location: 'Braamfontein Cemetery, Johannesburg',
    specificInstructions:
      'Traditional ceremony with Christian service. Family to organize memorial service at home village in Limpopo.',
    prePaid: false,
    religiousPreferences:
      'Christian ceremony conducted in Setswana and English. Traditional mourning customs to be observed.',
  },

  digitalAssets: [
    {
      id: 'digital-001',
      type: 'email',
      platform: 'Gmail',
      username: 'thabo.molefe@gmail.com',
      instructions:
        'Download all important emails and documents, then close account after 6 months',
      beneficiaryId: 'ben-001',
    },
    {
      id: 'digital-002',
      type: 'social-media',
      platform: 'Facebook',
      username: 'thabo.j.molefe',
      instructions: 'Memorialize account',
      beneficiaryId: 'ben-001',
    },
    {
      id: 'digital-003',
      type: 'cloud-storage',
      platform: 'Google Drive',
      username: 'thabo.molefe@gmail.com',
      instructions:
        'Transfer ownership to spouse. Contains family photos and important documents.',
      beneficiaryId: 'ben-001',
    },
    {
      id: 'digital-004',
      type: 'cryptocurrency',
      platform: 'Luno',
      instructions:
        'Transfer all Bitcoin and Ethereum holdings to spouse. Recovery keys stored in safe at Standard Bank.',
      beneficiaryId: 'ben-001',
    },
  ],

  specialInstructions: `
    1. All debts, funeral expenses, and estate duty should be paid from my estate before distribution to beneficiaries.
    2. My spouse Naledi shall have the right to continue residing in the primary residence for as long as she wishes, with all costs of maintenance paid from the estate.
    3. For my minor son Kgosi, his inheritance shall be paid into the Guardian's Fund and shall be payable to him at age 21 (twenty-one) years.
    4. My business shares in Tech Solutions (Pty) Ltd should be offered first to my existing business partners at fair market value as determined by an independent valuator.
    5. If any beneficiary predeceases me, their share shall devolve upon their lawful descendants, failing which it shall accrue to the residue of my estate.
    6. Personal items and household effects not specifically bequeathed shall be distributed by agreement among my spouse and children.
  `,

  revocationClause:
    'I hereby revoke all previous Wills and testamentary writings made by me at any time whatsoever.',

  residuaryClause:
    'All the rest, residue, and remainder of my estate, both movable and immovable, of whatever kind and wherever situated, which I have not herein otherwise disposed of, I give, devise, and bequeath to my spouse, Naledi Grace Molefe (ID: 7808155234092), failing whom to my children in equal shares.',

  specificBequests: [
    {
      id: 'bequest-001',
      description: 'My 2022 BMW X5 xDrive30d, Registration ABC123GP',
      beneficiaryId: 'ben-002', // Daughter Lerato
      substituteBeneficiaryId: 'ben-003',
    },
    {
      id: 'bequest-002',
      description: 'My Art Collection - Contemporary South African Art',
      beneficiaryId: 'ben-001', // Spouse Naledi
      substituteBeneficiaryId: 'ben-002',
    },
    {
      id: 'bequest-003',
      description: 'Vacation Property - Umhlanga Rocks Apartment',
      beneficiaryId: 'ben-001', // Spouse Naledi
      substituteBeneficiaryId: 'ben-002',
    },
  ],

  minorBeneficiaryProvisions: {
    method: 'guardian-fund',
    ageOfInheritance: 21, // Can specify higher than 18
    instructions:
      "My minor son Kgosi's inheritance shall be paid into the Guardian's Fund administered by the Master of the High Court. The Guardian's Fund shall pay the inheritance to him when he attains the age of 21 years, or earlier with the approval of the Master if required for his education or maintenance.",
  },

  attestationClause:
    'SIGNED at Sandton on this 15th day of January 2025, in the presence of the undersigned witnesses, who attest and bear witness to the signing hereof by me and by each other in the presence of me and of each other, all being present together at the same time.',

  dateExecuted: '2025-01-15',
  placeExecuted: 'Sandton, Gauteng, South Africa',
};

// Initial editor content for Plate.js - South African Will Format
export const initialEditorContent = [
  {
    type: 'h1',
    children: [{ text: 'LAST WILL AND TESTAMENT' }],
  },
  {
    type: 'h2',
    children: [{ text: 'of Thabo Johannes Molefe' }],
  },
  {
    type: 'p',
    children: [{ text: 'ID Number: 7505125123089' }],
  },
  {
    type: 'p',
    children: [{ text: '' }],
  },
  {
    type: 'p',
    children: [
      { text: 'In terms of the ', bold: false },
      { text: 'Wills Act 7 of 1953', bold: true },
    ],
  },
  {
    type: 'p',
    children: [{ text: '' }],
  },
  {
    type: 'h3',
    children: [{ text: 'ARTICLE I - REVOCATION' }],
  },
  {
    type: 'p',
    children: [
      {
        text: 'I hereby revoke all previous Wills and testamentary writings made by me at any time whatsoever.',
      },
    ],
  },
  {
    type: 'p',
    children: [{ text: '' }],
  },
  {
    type: 'h3',
    children: [{ text: 'ARTICLE II - DECLARATION' }],
  },
  {
    type: 'p',
    children: [
      {
        text: 'I, Thabo Johannes Molefe, Identity Number 7505125123089, of 45 Nelson Mandela Boulevard, Sandton, Gauteng, being of sound mind and memory, do hereby declare this to be my Last Will and Testament.',
      },
    ],
  },
  {
    type: 'p',
    children: [{ text: '' }],
  },
  {
    type: 'h3',
    children: [{ text: 'ARTICLE III - FAMILY INFORMATION' }],
  },
  {
    type: 'p',
    children: [
      {
        text: 'I am married to Naledi Grace Molefe (ID: 7808155234092). We were married on 10 December 2005. We have two children:',
      },
    ],
  },
  {
    type: 'ul',
    children: [
      {
        type: 'li',
        children: [
          {
            text: 'Lerato Molefe (ID: 0603145345087), born 14 March 2006',
          },
        ],
      },
      {
        type: 'li',
        children: [
          {
            text: 'Kgosi Molefe, born 22 November 2012 (minor)',
          },
        ],
      },
    ],
  },
  {
    type: 'p',
    children: [{ text: '' }],
  },
  {
    type: 'h3',
    children: [{ text: 'ARTICLE IV - APPOINTMENT OF EXECUTOR' }],
  },
  {
    type: 'p',
    children: [
      {
        text: 'I nominate and appoint my spouse, Naledi Grace Molefe (ID: 7808155234092), as the Executor of my estate. Failing her, I nominate my brother, Sipho David Molefe (ID: 7201105187083), as alternate Executor.',
      },
    ],
  },
  {
    type: 'p',
    children: [{ text: '' }],
  },
  {
    type: 'h3',
    children: [{ text: 'ARTICLE V - GUARDIANSHIP OF MINOR CHILDREN' }],
  },
  {
    type: 'p',
    children: [
      {
        text: 'I appoint my brother, Sipho David Molefe (ID: 7201105187083), as guardian of my minor son Kgosi Molefe. Failing him, I appoint my sister, Nomsa Rebecca Khumalo (ID: 7703105289087), as alternate guardian.',
      },
    ],
  },
  {
    type: 'p',
    children: [{ text: '' }],
  },
  {
    type: 'h3',
    children: [{ text: 'ARTICLE VI - MINOR BENEFICIARY PROVISIONS' }],
  },
  {
    type: 'p',
    children: [
      {
        text: "My minor son Kgosi's inheritance shall be paid into the Guardian's Fund administered by the Master of the High Court. The inheritance shall be payable to him when he attains the age of 21 years.",
      },
    ],
  },
  {
    type: 'p',
    children: [{ text: '' }],
  },
  {
    type: 'h3',
    children: [{ text: 'ARTICLE VII - SPECIFIC BEQUESTS' }],
  },
  {
    type: 'p',
    children: [
      {
        text: 'I give, devise, and bequeath the following specific items:',
      },
    ],
  },
  {
    type: 'ul',
    children: [
      {
        type: 'li',
        children: [
          {
            text: 'To my daughter Lerato: My 2022 BMW X5, Registration ABC123GP',
          },
        ],
      },
      {
        type: 'li',
        children: [
          {
            text: 'To my spouse Naledi: My Contemporary South African Art Collection',
          },
        ],
      },
      {
        type: 'li',
        children: [
          {
            text: 'To my spouse Naledi: My vacation property in Umhlanga Rocks',
          },
        ],
      },
    ],
  },
  {
    type: 'p',
    children: [{ text: '' }],
  },
  {
    type: 'h3',
    children: [{ text: 'ARTICLE VIII - RESIDUARY ESTATE' }],
  },
  {
    type: 'p',
    children: [
      {
        text: 'All the rest, residue, and remainder of my estate, both movable and immovable, of whatever kind and wherever situated, I give to my spouse Naledi Grace Molefe, failing whom to my children in equal shares.',
      },
    ],
  },
  {
    type: 'p',
    children: [{ text: '' }],
  },
  {
    type: 'p',
    children: [{ text: '' }],
  },
  {
    type: 'h3',
    children: [{ text: 'ATTESTATION' }],
  },
  {
    type: 'p',
    children: [
      {
        text: 'SIGNED at Sandton on this 15th day of January 2025, in the presence of the undersigned witnesses, who attest and bear witness to the signing hereof by me and by each other in the presence of me and of each other, all being present together at the same time.',
      },
    ],
  },
  {
    type: 'p',
    children: [{ text: '' }],
  },
  {
    type: 'p',
    children: [{ text: '________________________' }],
  },
  {
    type: 'p',
    children: [{ text: 'TESTATOR SIGNATURE' }],
  },
  {
    type: 'p',
    children: [{ text: 'Thabo Johannes Molefe' }],
  },
  {
    type: 'p',
    children: [{ text: '' }],
  },
  {
    type: 'p',
    children: [{ text: 'AS WITNESSES:' }],
  },
  {
    type: 'p',
    children: [{ text: '' }],
  },
  {
    type: 'p',
    children: [{ text: '1. ________________________' }],
  },
  {
    type: 'p',
    children: [{ text: '   Witness Name: Zanele Patricia Dlamini' }],
  },
  {
    type: 'p',
    children: [{ text: '   ID Number: 8506125678094' }],
  },
  {
    type: 'p',
    children: [{ text: '   Address: 123 Rivonia Road, Sandton, Gauteng' }],
  },
  {
    type: 'p',
    children: [{ text: '' }],
  },
  {
    type: 'p',
    children: [{ text: '2. ________________________' }],
  },
  {
    type: 'p',
    children: [{ text: '   Witness Name: Johannes Petrus Van Der Merwe' }],
  },
  {
    type: 'p',
    children: [{ text: '   ID Number: 7909145789081' }],
  },
  {
    type: 'p',
    children: [{ text: '   Address: 456 William Nicol Drive, Bryanston, Gauteng' }],
  },
];
