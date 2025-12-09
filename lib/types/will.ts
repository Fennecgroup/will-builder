// Will Builder - TypeScript Type Definitions

export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed' | 'separated';
export type MaritalRegime = 'ICOP' | 'OCOP' | 'OCOP-A' | 'OCOP-NA';
// South African Provinces
export type SAProvince =
  | 'Gauteng'
  | 'Western Cape'
  | 'KwaZulu-Natal'
  | 'Eastern Cape'
  | 'Free State'
  | 'Limpopo'
  | 'Mpumalanga'
  | 'Northern Cape'
  | 'North West';

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
  state: string; // For SA: Province (Gauteng, Western Cape, KwaZulu-Natal, etc.)
  postalCode: string; // For SA: 4-digit postal code
  country: string; // Default: "South Africa"
}

export interface TestatorInfo {
  id: string;
  fullName: string;
  dateOfBirth: string;
  idNumber: string; // For SA: 13-digit ID number (YYMMDD SSSS C A Z)
  address: Address;
  phone: string; // For SA: +27 format
  email: string;
  occupation?: string;
}

export interface SpouseInfo {
  fullName: string;
  idNumber?: string; // For SA: 13-digit ID number
  dateOfBirth?: string;
  dateOfMarriage?: string;
  maritalRegime: MaritalRegime;
}

export interface Child {
  id: string;
  fullName: string;
  idNumber?: string; // For SA: 13-digit ID number (if 16+)
  dateOfBirth: string;
  isMinor: boolean; // Under 18 in SA
}

export interface MarriageInfo {
  status: MaritalStatus;
  spouse?: SpouseInfo;
  hasChildren: boolean;
  numberOfChildren?: number;
  children?: Child[]; // SA: Required for guardianship and minor provisions
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
  idNumber?: string; // For SA: 13-digit ID number (required for adults)
  relationship: string;
  dateOfBirth?: string;
  address?: Address;
  phone?: string;
  email?: string;
  allocationPercentage?: number;
  specificBequests?: string[]; // Specific items bequeathed to this person
  isMinor?: boolean;
  guardianId?: string; // Reference to guardian if minor
  substituteBeneficiaryId?: string; // SA: Who inherits if this beneficiary predeceases testator
}

export interface Executor {
  id: string;
  fullName: string;
  idNumber: string; // For SA: 13-digit ID number (required)
  relationship: string;
  address: Address;
  phone: string;
  email?: string;
  isAlternate?: boolean; // Primary or alternate executor
}

export interface Witness {
  id: string;
  fullName: string;
  idNumber?: string; // For SA: 13-digit ID number (recommended)
  address: Address;
  phone?: string;
  occupation?: string;
  dateWitnessed?: string; // SA: Date when will was witnessed
  // CRITICAL: SA law - witness CANNOT be a beneficiary, executor, or guardian (or their spouse)
}

export interface Guardian {
  id: string;
  fullName: string;
  idNumber: string; // For SA: 13-digit ID number (required)
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

export interface SpecificBequest {
  id: string;
  description: string; // e.g., "My 2022 BMW X5, registration ABC123GP"
  beneficiaryId: string; // Who receives this item
  substituteBeneficiaryId?: string; // If primary beneficiary predeceases testator
}

export interface MinorBeneficiaryProvisions {
  method: 'guardian-fund' | 'testamentary-trust' | 'other'; // SA: How to handle minor's inheritance
  ageOfInheritance?: number; // Default 18, can specify higher
  trusteeId?: string; // If using testamentary trust
  instructions?: string; // Additional instructions
}

export interface WillContent {
  testator: TestatorInfo;
  maritalStatus: MaritalStatus;
  marriage: MarriageInfo;
  assets: Asset[];
  beneficiaries: Beneficiary[];
  executors: Executor[];
  witnesses: Witness[]; // SA: Minimum 2 required
  guardians: Guardian[];
  liabilities: Liability[];
  funeralWishes?: FuneralWishes;
  digitalAssets: DigitalAsset[];
  specialInstructions?: string;
  revocationClause: string; // SA: Required - "I hereby revoke all previous Wills..."
  residuaryClause: string; // SA: Required - what happens to remaining assets
  specificBequests?: SpecificBequest[]; // SA: Specific items/legacies
  minorBeneficiaryProvisions?: MinorBeneficiaryProvisions; // SA: Guardian's Fund or Trust for minors
  attestationClause?: string; // SA: Recommended attestation clause
  dateExecuted?: string; // SA: Date will was signed (highly recommended)
  placeExecuted?: string; // SA: City/town where will was signed
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
