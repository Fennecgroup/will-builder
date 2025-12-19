// ============================================
// TEMPORARY DEVELOPMENT FEATURE
// This sample selection feature is for development/testing only.
// See removal instructions in plan file.
// ============================================

import type { WillContent } from '@/lib/types/will';
import { simpleSingleContent } from './01-simple-single';
import { standardFamilyContent } from './02-standard-family';
import { complexBlendedContent } from './03-complex-blended';
import { widowedWithTrustContent } from './04-widowed-with-trust';
import { youngProfessionalContent } from './05-young-professional';

export interface SampleWillOption {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  complexity: 'minimal' | 'standard' | 'complex';
  content: WillContent;
  highlights: string[];
  testingFocus: string;
}

export const sampleWillOptions: SampleWillOption[] = [
  {
    id: 'simple-single',
    title: 'Lindiwe Dube',
    subtitle: 'Simple Single Person',
    description: 'Single person with minimal assets and straightforward beneficiary structure',
    complexity: 'minimal',
    content: simpleSingleContent,
    highlights: [
      'Single, never married, no children',
      'Minimal assets: R1.5M (apartment, savings, retirement)',
      'Single beneficiary (sister)',
      'Simple executor setup',
    ],
    testingFocus: 'Tests minimal data scenario and missing family structures',
  },
  {
    id: 'standard-family',
    title: 'Thabo Molefe',
    subtitle: 'Standard Married with Children',
    description: 'Married with children, typical middle-class asset distribution',
    complexity: 'standard',
    content: standardFamilyContent,
    highlights: [
      'Married in community of property',
      'Two children (one adult, one minor)',
      'Diverse assets: R22M (properties, vehicles, investments, business)',
      'Spouse and brother as co-executors',
    ],
    testingFocus: 'Tests standard family scenario with typical asset complexity',
  },
  {
    id: 'complex-blended',
    title: 'Johan Van Wyk',
    subtitle: 'Complex Blended Family',
    description: 'Divorced and remarried with children from multiple marriages and business interests',
    complexity: 'complex',
    content: complexBlendedContent,
    highlights: [
      'Second marriage (OCOP with Accrual), 4 children from 2 marriages',
      'High-value estate: R120M+ (properties, farm, business, international)',
      'Complex beneficiary allocation with different percentages',
      'Professional attorney as co-executor',
    ],
    testingFocus: 'Tests multiple marriages, business interests, international assets, professional executors',
  },
  {
    id: 'widowed-trust',
    title: 'Nomvula Khumalo',
    subtitle: 'Widowed with Special Needs Trust',
    description: 'Widowed with adult children including special needs provisions and charitable giving',
    complexity: 'complex',
    content: widowedWithTrustContent,
    highlights: [
      'Widowed, 3 adult children (one with special needs)',
      'High-value estate: R115M+ (properties, business, art collection)',
      'Testamentary trust for special needs son',
      'Charitable bequests (10% to education and disability rights)',
    ],
    testingFocus: 'Tests testamentary trusts, special needs provisions, charitable giving, high-value estate',
  },
  {
    id: 'young-professional',
    title: 'Sipho Ndlovu',
    subtitle: 'Young Professional with Digital Assets',
    description: 'Single young professional with heavy digital asset focus and modern estate considerations',
    complexity: 'minimal',
    content: youngProfessionalContent,
    highlights: [
      'Single (engaged), no children, no real estate',
      'Digital-heavy assets: R800K (crypto, NFTs, domains, social media)',
      'Beneficiary is fiancée (non-married partner)',
      'Organ donation wishes and international currency considerations',
    ],
    testingFocus: 'Tests digital assets, cryptocurrency, non-married partners, organ donation, minimal physical assets',
  },
];
