// Will Builder - TypeScript Type Definitions

export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed' | 'separated';

export type AssetType =
  | 'real-estate'
  | 'vehicle'
  | 'bank-account'
  | 'investment'
  | 'insurance'
  | 'business'
  | 'personal-property'
  | 'digital-asset'
  | 'other';

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface TestatorInfo {
  id: string;
  fullName: string;
  dateOfBirth: string;
  idNumber: string; // National ID, SSN, etc.
  address: Address;
  phone: string;
  email: string;
  occupation?: string;
}

export interface SpouseInfo {
  fullName: string;
  dateOfBirth?: string;
  dateOfMarriage?: string;
}

export interface MarriageInfo {
  status: MaritalStatus;
  spouse?: SpouseInfo;
  hasChildren: boolean;
  numberOfChildren?: number;
}

export interface Asset {
  id: string;
  type: AssetType;
  description: string;
  location?: string;
  estimatedValue?: number;
  currency?: string;
  accountNumber?: string; // For bank accounts, investments
  notes?: string;
}

export interface Beneficiary {
  id: string;
  fullName: string;
  relationship: string;
  dateOfBirth?: string;
  address?: Address;
  phone?: string;
  email?: string;
  allocationPercentage?: number;
  specificBequests?: string[]; // Specific items bequeathed to this person
  isMinor?: boolean;
  guardianId?: string; // Reference to guardian if minor
}

export interface Executor {
  id: string;
  fullName: string;
  relationship: string;
  address: Address;
  phone: string;
  email?: string;
  isAlternate?: boolean; // Primary or alternate executor
}

export interface Witness {
  id: string;
  fullName: string;
  address: Address;
  phone?: string;
  occupation?: string;
}

export interface Guardian {
  id: string;
  fullName: string;
  relationship: string;
  address: Address;
  phone: string;
  email?: string;
  forChildren: string[]; // Names or IDs of children
  isAlternate?: boolean;
}

export interface Liability {
  id: string;
  type: 'mortgage' | 'loan' | 'credit-card' | 'tax' | 'other';
  creditor: string;
  amount: number;
  currency: string;
  accountNumber?: string;
  notes?: string;
}

export interface FuneralWishes {
  preference: 'burial' | 'cremation' | 'donation' | 'other';
  location?: string;
  specificInstructions?: string;
  prePaid?: boolean;
  funeralHome?: string;
  religiousPreferences?: string;
}

export interface DigitalAsset {
  id: string;
  type: 'social-media' | 'email' | 'cloud-storage' | 'cryptocurrency' | 'domain' | 'other';
  platform: string;
  username?: string;
  instructions: string; // What to do with this account
  beneficiaryId?: string;
}

export interface WillContent {
  testator: TestatorInfo;
  marriage: MarriageInfo;
  assets: Asset[];
  beneficiaries: Beneficiary[];
  executors: Executor[];
  witnesses: Witness[];
  guardians: Guardian[];
  liabilities: Liability[];
  funeralWishes?: FuneralWishes;
  digitalAssets: DigitalAsset[];
  specialInstructions?: string;
  revocationClause?: string;
  residuaryClause?: string; // What happens to unspecified assets
}

export interface WillDocument {
  id: string;
  userId: string;
  title: string;
  content: WillContent;
  editorContent?: unknown; // Plate.js document content
  status: 'draft' | 'review' | 'completed' | 'finalized';
  createdAt: Date;
  updatedAt: Date;
  version: number;
}
