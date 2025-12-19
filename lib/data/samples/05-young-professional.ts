// ============================================
// TEMPORARY DEVELOPMENT FEATURE
// This sample is for development/testing only.
// See removal instructions in plan file.
// ============================================

import type { WillContent } from '@/lib/types/will';

// Sample 5: Young Professional - Digital Assets and Edge Cases
// Tests: Digital assets, cryptocurrency, non-married partners, organ donation, minimal physical assets, international currency
export const youngProfessionalContent: WillContent = {
  testator: {
    id: 'testator-young-001',
    fullName: 'Sipho David Ndlovu',
    dateOfBirth: '1996-05-10',
    idNumber: '9605105456089', // SA ID format: YYMMDD SSSS C A Z
    address: {
      street: '45 Bree Street, Unit 1204',
      city: 'Cape Town',
      state: 'Western Cape',
      postalCode: '8001',
      country: 'South Africa',
    },
    phone: '+27 82 678 9012',
    email: 'sipho.ndlovu@techstartup.co.za',
    occupation: 'Software Developer (Remote for US Company)',
  },

  maritalStatus: 'single',

  marriage: {
    status: 'single',
  },

  children: [],

  assets: [
    // No real estate - renting
    // Vehicle
    {
      id: 'asset-young-001',
      type: 'vehicle',
      description: '2021 VW Polo 1.0 TSI',
      estimatedValue: 320000,
      currency: 'ZAR',
      notes: 'Registration: SND001WC, under vehicle finance',
    },
    // Digital/Crypto Assets
    {
      id: 'asset-young-002',
      type: 'digital-asset',
      description: 'Cryptocurrency Holdings - Bitcoin',
      estimatedValue: 120000,
      currency: 'ZAR',
      notes: '0.05 BTC on Luno exchange',
    },
    {
      id: 'asset-young-003',
      type: 'digital-asset',
      description: 'Cryptocurrency Holdings - Ethereum',
      estimatedValue: 60000,
      currency: 'ZAR',
      notes: '1.2 ETH on Luno exchange',
    },
    {
      id: 'asset-young-004',
      type: 'digital-asset',
      description: 'NFT Collection',
      estimatedValue: 45000,
      currency: 'ZAR',
      notes: 'Various NFTs on OpenSea, wallet address in digital assets instructions',
    },
    {
      id: 'asset-young-005',
      type: 'digital-asset',
      description: 'Domain Portfolio',
      estimatedValue: 60000,
      currency: 'ZAR',
      notes: '15 premium .co.za domains registered with ZACR',
    },
    // Bank Accounts
    {
      id: 'asset-young-006',
      type: 'bank-account',
      description: 'Current Account (ZAR)',
      accountNumber: '****3456',
      estimatedValue: 45000,
      currency: 'ZAR',
      notes: 'Capitec Bank',
    },
    {
      id: 'asset-young-007',
      type: 'bank-account',
      description: 'USD Account',
      accountNumber: '****7890',
      estimatedValue: 50000,
      currency: 'ZAR',
      notes: 'FNB Global Account, approximately $2,800 USD, receives remote work salary',
    },
    // Investments
    {
      id: 'asset-young-008',
      type: 'investment',
      description: 'Tax-Free Savings Account',
      accountNumber: '****2345',
      estimatedValue: 35000,
      currency: 'ZAR',
      notes: 'Easy Equities TFSA, invested in ETFs',
    },
    {
      id: 'asset-young-009',
      type: 'investment',
      description: 'Retirement Annuity',
      accountNumber: '****6789',
      estimatedValue: 120000,
      currency: 'ZAR',
      notes: '10X Retirement Annuity, recently started',
    },
  ],

  beneficiaries: [
    {
      id: 'ben-young-001',
      fullName: 'Ayanda Precious Mtshali',
      idNumber: '9708155678093',
      relationship: 'Fiancée (Not Yet Married)',
      dateOfBirth: '1997-08-15',
      allocationPercentage: 100,
      isMinor: false,
    },
  ],

  executors: [
    {
      id: 'exec-young-001',
      fullName: 'Thulani David Ndlovu',
      idNumber: '6909105234085',
      relationship: 'Father',
      address: {
        street: '23 Khumalo Street',
        city: 'Soweto',
        state: 'Gauteng',
        postalCode: '1818',
        country: 'South Africa',
      },
      phone: '+27 83 789 0123',
      email: 'thulani.ndlovu@email.co.za',
      isAlternate: false,
    },
  ],

  witnesses: [
    {
      id: 'wit-young-001',
      fullName: 'Mbali Sarah Dlamini',
      idNumber: '9506125678091',
      address: {
        street: '89 Long Street',
        city: 'Cape Town',
        state: 'Western Cape',
        postalCode: '8001',
        country: 'South Africa',
      },
      phone: '+27 82 890 1234',
      occupation: 'Software Engineer',
      dateWitnessed: '2025-01-15',
    },
    {
      id: 'wit-young-002',
      fullName: 'Thabo Peter Mokoena',
      idNumber: '9607145789086',
      address: {
        street: '12 Kloof Street',
        city: 'Cape Town',
        state: 'Western Cape',
        postalCode: '8001',
        country: 'South Africa',
      },
      phone: '+27 83 901 2345',
      occupation: 'Product Designer',
      dateWitnessed: '2025-01-15',
    },
  ],

  guardians: [],

  liabilities: [
    {
      id: 'liab-young-001',
      type: 'loan',
      creditor: 'Wesbank Vehicle Finance',
      amount: 180000,
      currency: 'ZAR',
      accountNumber: '****4567',
      notes: 'VW Polo vehicle finance, 36 months remaining',
    },
  ],

  funeralWishes: {
    preference: 'donation',
    location: 'N/A',
    specificInstructions:
      'I wish to donate my organs for transplantation and medical research. I am a registered organ donor with the Organ Donor Foundation of South Africa (Donor Card No. ODF123456). After organ donation, cremation is preferred. Memorial service to be simple, with donations to organ donation awareness campaigns.',
    prePaid: false,
    religiousPreferences: 'Non-religious memorial service, celebration of life format',
  },

  digitalAssets: [
    {
      id: 'digital-young-001',
      type: 'cryptocurrency',
      platform: 'Luno',
      username: 'sipho.ndlovu@techstartup.co.za',
      instructions:
        'Transfer all Bitcoin (0.05 BTC) and Ethereum (1.2 ETH) holdings to fiancée Ayanda. Recovery phrase stored in password manager (see below). Luno account verification required.',
      beneficiaryId: 'ben-young-001',
    },
    {
      id: 'digital-young-002',
      type: 'cryptocurrency',
      platform: 'MetaMask Wallet',
      instructions:
        'Contains NFT collection and small amount of crypto. Seed phrase stored in password manager. Wallet address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb. Transfer to Ayanda or liquidate via OpenSea.',
      beneficiaryId: 'ben-young-001',
    },
    {
      id: 'digital-young-003',
      type: 'domain',
      platform: 'Domain Portfolio (15 domains)',
      instructions:
        'Premium .co.za domains registered with ZACR. Login details in password manager. Transfer to Ayanda or sell via domain marketplace. Estimated value R60k.',
      beneficiaryId: 'ben-young-001',
    },
    {
      id: 'digital-young-004',
      type: 'email',
      platform: 'Gmail',
      username: 'sipho.ndlovu@gmail.com',
      instructions:
        'Contains important documents, crypto recovery info, and personal correspondence. Download all data via Google Takeout, then close account after 6 months.',
      beneficiaryId: 'ben-young-001',
    },
    {
      id: 'digital-young-005',
      type: 'email',
      platform: 'Work Email',
      username: 'sipho.ndlovu@techstartup.co.za',
      instructions:
        'Notify employer immediately. Contains work projects and intellectual property belonging to employer. Coordinate with HR for account closure.',
      beneficiaryId: 'ben-young-001',
    },
    {
      id: 'digital-young-006',
      type: 'cloud-storage',
      platform: 'Google Drive',
      username: 'sipho.ndlovu@gmail.com',
      instructions:
        'Contains personal photos, documents, and project files. Transfer ownership to Ayanda.',
      beneficiaryId: 'ben-young-001',
    },
    {
      id: 'digital-young-007',
      type: 'cloud-storage',
      platform: 'GitHub',
      username: '@sipho-ndlovu',
      instructions:
        'Personal coding projects and repositories. Some may have commercial value. Transfer account to Ayanda or make repositories public.',
      beneficiaryId: 'ben-young-001',
    },
    {
      id: 'digital-young-008',
      type: 'social-media',
      platform: 'Instagram',
      username: '@sipho.ndlovu',
      instructions: 'Memorialize account or delete as Ayanda prefers',
      beneficiaryId: 'ben-young-001',
    },
    {
      id: 'digital-young-009',
      type: 'social-media',
      platform: 'LinkedIn',
      username: 'sipho-ndlovu',
      instructions: 'Memorialize account',
      beneficiaryId: 'ben-young-001',
    },
    {
      id: 'digital-young-010',
      type: 'social-media',
      platform: 'Twitter/X',
      username: '@sipho_codes',
      instructions: 'Memorialize or delete account, 10k+ followers',
      beneficiaryId: 'ben-young-001',
    },
    {
      id: 'digital-young-011',
      type: 'other',
      platform: '1Password (Password Manager)',
      instructions:
        'CRITICAL: Master password known to my father Thulani. Contains all login credentials, crypto recovery phrases, and important document vault. Emergency kit stored in parents\' home safe.',
      beneficiaryId: 'ben-young-001',
    },
  ],

  specialInstructions: `
    1. ORGAN DONATION: I am a registered organ donor (Organ Donor Foundation Card No. ODF123456). My executor must notify the hospital immediately upon my death to facilitate organ donation. This is my highest priority wish.
    2. All debts and funeral expenses should be paid from my estate before distribution.
    3. CRYPTOCURRENCY AND DIGITAL ASSETS: This is a significant portion of my estate. My father Thulani has access to my 1Password master password (emergency kit in parents' safe). All recovery phrases and wallet information are stored there. Ayanda should work with a cryptocurrency expert to properly transfer assets.
    4. USD SALARY: My employer (RemoteTeam Inc, USA) should be notified immediately. I typically have one month's salary pending (~$5,000 USD). Final payment should go to my estate.
    5. RENTAL DEPOSIT: I have a rental deposit of R15,000 with my landlord. This should be reclaimed by my estate.
    6. NFT COLLECTION: Some NFTs may have appreciated in value. Recommend getting them valued before liquidating.
    7. DOMAIN PORTFOLIO: 15 premium domains may have commercial value. Consider getting professional valuation from a domain broker before selling.
    8. NON-MARRIED PARTNER: Although Ayanda and I are not yet married, she is my life partner and intended spouse. I intentionally leave my entire estate to her.
    9. PARENTS: My parents are financially secure. I have discussed this will with them and they support my decision to leave everything to Ayanda.
    10. DIGITAL NOMAD CONSIDERATIONS: I work remotely and have assets in multiple countries/platforms. Executor should allow reasonable time (3-6 months) to properly handle international and digital asset transfers.
    11. TECH SKILLS REQUIRED: Handling my estate will require some technical knowledge. My father should engage a tech-savvy attorney or consultant familiar with cryptocurrency and digital assets.
  `,

  revocationClause:
    'I hereby revoke all previous Wills and testamentary writings made by me at any time whatsoever.',

  residuaryClause:
    'All the rest, residue, and remainder of my estate, both movable and immovable, of whatever kind and wherever situated, including all digital assets, cryptocurrency, domains, and intellectual property, I give, devise, and bequeath to my fiancée, Ayanda Precious Mtshali (ID: 9708155678093).',

  specificBequests: [],

  attestationClause:
    'SIGNED at Cape Town on this 15th day of January 2025, in the presence of the undersigned witnesses, who attest and bear witness to the signing hereof by me and by each other in the presence of me and of each other, all being present together at the same time.',

  dateExecuted: '2025-01-15',
  placeExecuted: 'Cape Town, Western Cape, South Africa',
};
