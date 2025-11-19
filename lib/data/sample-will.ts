import type { WillContent } from '@/lib/types/will';

export const sampleWillContent: WillContent = {
  testator: {
    id: 'testator-001',
    fullName: 'John Michael Anderson',
    dateOfBirth: '1965-03-15',
    idNumber: '123-45-6789',
    address: {
      street: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'Illinois',
      postalCode: '62701',
      country: 'United States',
    },
    phone: '+1 (555) 123-4567',
    email: 'john.anderson@email.com',
    occupation: 'Software Engineer',
  },

  marriage: {
    status: 'married',
    spouse: {
      fullName: 'Sarah Elizabeth Anderson',
      dateOfBirth: '1968-07-22',
      dateOfMarriage: '1995-06-10',
    },
    hasChildren: true,
    numberOfChildren: 2,
  },

  assets: [
    {
      id: 'asset-001',
      type: 'real-estate',
      description: 'Primary Residence - 4 bedroom house',
      location: '742 Evergreen Terrace, Springfield, IL',
      estimatedValue: 450000,
      currency: 'USD',
    },
    {
      id: 'asset-002',
      type: 'real-estate',
      description: 'Vacation Cabin',
      location: 'Lake Tahoe, CA',
      estimatedValue: 280000,
      currency: 'USD',
    },
    {
      id: 'asset-003',
      type: 'vehicle',
      description: '2022 Tesla Model S',
      estimatedValue: 75000,
      currency: 'USD',
    },
    {
      id: 'asset-004',
      type: 'bank-account',
      description: 'Primary Checking Account',
      accountNumber: '****4567',
      estimatedValue: 45000,
      currency: 'USD',
      notes: 'First National Bank',
    },
    {
      id: 'asset-005',
      type: 'bank-account',
      description: 'Savings Account',
      accountNumber: '****8901',
      estimatedValue: 120000,
      currency: 'USD',
      notes: 'First National Bank',
    },
    {
      id: 'asset-006',
      type: 'investment',
      description: '401(k) Retirement Account',
      accountNumber: '****2345',
      estimatedValue: 850000,
      currency: 'USD',
      notes: 'Fidelity Investments',
    },
    {
      id: 'asset-007',
      type: 'investment',
      description: 'Stock Portfolio',
      accountNumber: '****6789',
      estimatedValue: 200000,
      currency: 'USD',
      notes: 'Charles Schwab',
    },
    {
      id: 'asset-008',
      type: 'insurance',
      description: 'Life Insurance Policy',
      accountNumber: 'POL-123456',
      estimatedValue: 500000,
      currency: 'USD',
      notes: 'MetLife - Term Life',
    },
    {
      id: 'asset-009',
      type: 'personal-property',
      description: 'Antique Watch Collection',
      estimatedValue: 25000,
      currency: 'USD',
    },
    {
      id: 'asset-010',
      type: 'personal-property',
      description: 'Art Collection',
      estimatedValue: 50000,
      currency: 'USD',
      notes: 'Various paintings and sculptures',
    },
  ],

  beneficiaries: [
    {
      id: 'ben-001',
      fullName: 'Sarah Elizabeth Anderson',
      relationship: 'Spouse',
      dateOfBirth: '1968-07-22',
      allocationPercentage: 50,
      specificBequests: ['Primary Residence', 'Vacation Cabin'],
    },
    {
      id: 'ben-002',
      fullName: 'Emily Rose Anderson',
      relationship: 'Daughter',
      dateOfBirth: '1998-04-12',
      allocationPercentage: 25,
      specificBequests: ['Art Collection', 'Antique Watch Collection'],
      isMinor: false,
    },
    {
      id: 'ben-003',
      fullName: 'Michael James Anderson',
      relationship: 'Son',
      dateOfBirth: '2001-09-28',
      allocationPercentage: 25,
      specificBequests: ['2022 Tesla Model S'],
      isMinor: false,
    },
  ],

  executors: [
    {
      id: 'exec-001',
      fullName: 'Sarah Elizabeth Anderson',
      relationship: 'Spouse',
      address: {
        street: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'Illinois',
        postalCode: '62701',
        country: 'United States',
      },
      phone: '+1 (555) 123-4568',
      email: 'sarah.anderson@email.com',
      isAlternate: false,
    },
    {
      id: 'exec-002',
      fullName: 'Robert Anderson',
      relationship: 'Brother',
      address: {
        street: '456 Oak Street',
        city: 'Chicago',
        state: 'Illinois',
        postalCode: '60601',
        country: 'United States',
      },
      phone: '+1 (555) 987-6543',
      email: 'robert.anderson@email.com',
      isAlternate: true,
    },
  ],

  witnesses: [
    {
      id: 'wit-001',
      fullName: 'James Wilson',
      address: {
        street: '123 Main Street',
        city: 'Springfield',
        state: 'Illinois',
        postalCode: '62702',
        country: 'United States',
      },
      phone: '+1 (555) 234-5678',
      occupation: 'Attorney',
    },
    {
      id: 'wit-002',
      fullName: 'Patricia Brown',
      address: {
        street: '789 Elm Avenue',
        city: 'Springfield',
        state: 'Illinois',
        postalCode: '62703',
        country: 'United States',
      },
      phone: '+1 (555) 345-6789',
      occupation: 'Notary Public',
    },
  ],

  guardians: [],

  liabilities: [
    {
      id: 'liab-001',
      type: 'mortgage',
      creditor: 'Wells Fargo',
      amount: 180000,
      currency: 'USD',
      accountNumber: '****3456',
      notes: 'Primary residence mortgage',
    },
    {
      id: 'liab-002',
      type: 'loan',
      creditor: 'Tesla Financing',
      amount: 35000,
      currency: 'USD',
      accountNumber: '****7890',
      notes: 'Vehicle loan',
    },
  ],

  funeralWishes: {
    preference: 'cremation',
    location: 'Springfield Memorial Gardens',
    specificInstructions: 'Scatter ashes at Lake Tahoe near the vacation cabin.',
    prePaid: true,
    funeralHome: 'Springfield Funeral Services',
    religiousPreferences: 'Non-denominational service with family readings',
  },

  digitalAssets: [
    {
      id: 'digital-001',
      type: 'email',
      platform: 'Gmail',
      username: 'john.anderson@gmail.com',
      instructions: 'Download all emails and photos, then close account',
      beneficiaryId: 'ben-001',
    },
    {
      id: 'digital-002',
      type: 'social-media',
      platform: 'Facebook',
      username: 'john.m.anderson',
      instructions: 'Memorialize account',
      beneficiaryId: 'ben-001',
    },
    {
      id: 'digital-003',
      type: 'cloud-storage',
      platform: 'Google Drive',
      username: 'john.anderson@gmail.com',
      instructions: 'Transfer ownership to spouse, download family photos',
      beneficiaryId: 'ben-001',
    },
    {
      id: 'digital-004',
      type: 'cryptocurrency',
      platform: 'Coinbase',
      instructions: 'Transfer all holdings to spouse. Recovery phrase in safe deposit box.',
      beneficiaryId: 'ben-001',
    },
  ],

  specialInstructions: `
    1. All debts and funeral expenses should be paid from my estate before distribution.
    2. My spouse Sarah should have the right to continue living in the primary residence for as long as she wishes.
    3. If any beneficiary predeceases me, their share should be distributed equally among their children.
    4. Personal items not specifically mentioned should be distributed by mutual agreement among my beneficiaries.
  `,

  revocationClause: 'I hereby revoke all previous wills and codicils made by me.',

  residuaryClause: 'All the rest, residue, and remainder of my estate, of whatever kind and wherever situated, I give to my spouse Sarah Elizabeth Anderson.',
};

// Initial editor content for Plate.js
export const initialEditorContent = [
  {
    type: 'h1',
    children: [{ text: 'Last Will and Testament' }],
  },
  {
    type: 'h2',
    children: [{ text: 'of John Michael Anderson' }],
  },
  {
    type: 'p',
    children: [{ text: '' }],
  },
  {
    type: 'h3',
    children: [{ text: 'Article I - Declaration' }],
  },
  {
    type: 'p',
    children: [
      {
        text: 'I, John Michael Anderson, of Springfield, Illinois, being of sound mind and memory, do hereby declare this to be my Last Will and Testament, revoking all previous wills and codicils made by me.',
      },
    ],
  },
  {
    type: 'p',
    children: [{ text: '' }],
  },
  {
    type: 'h3',
    children: [{ text: 'Article II - Family' }],
  },
  {
    type: 'p',
    children: [
      {
        text: 'I am married to Sarah Elizabeth Anderson. We have two children: Emily Rose Anderson and Michael James Anderson.',
      },
    ],
  },
  {
    type: 'p',
    children: [{ text: '' }],
  },
  {
    type: 'h3',
    children: [{ text: 'Article III - Specific Bequests' }],
  },
  {
    type: 'p',
    children: [
      {
        text: 'I give, devise, and bequeath the following specific gifts:',
      },
    ],
  },
  {
    type: 'p',
    children: [{ text: '' }],
  },
  {
    type: 'p',
    children: [
      {
        text: 'To my spouse, Sarah Elizabeth Anderson: My primary residence and vacation cabin.',
      },
    ],
  },
  {
    type: 'p',
    children: [
      {
        text: 'To my daughter, Emily Rose Anderson: My art collection and antique watch collection.',
      },
    ],
  },
  {
    type: 'p',
    children: [
      {
        text: 'To my son, Michael James Anderson: My 2022 Tesla Model S.',
      },
    ],
  },
  {
    type: 'p',
    children: [{ text: '' }],
  },
  {
    type: 'h3',
    children: [{ text: 'Article IV - Residuary Estate' }],
  },
  {
    type: 'p',
    children: [
      {
        text: 'All the rest, residue, and remainder of my estate, of whatever kind and wherever situated, I give to my spouse Sarah Elizabeth Anderson.',
      },
    ],
  },
  {
    type: 'p',
    children: [{ text: '' }],
  },
  {
    type: 'h3',
    children: [{ text: 'Article V - Executor' }],
  },
  {
    type: 'p',
    children: [
      {
        text: 'I appoint my spouse, Sarah Elizabeth Anderson, as Executor of this Will. If she is unable or unwilling to serve, I appoint my brother, Robert Anderson, as alternate Executor.',
      },
    ],
  },
];
