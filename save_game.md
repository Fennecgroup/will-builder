# Fennec Will Builder - Save Game (December 19, 2025)

## Manual TODO
Go through the generated samples and see what does not click, especially the assets part.
remove the gauradians and see the results
test the trustees

## Project Overview

**Fennec Will Builder** is an AI-driven SaaS application for creating South African wills. Built with Next.js 16, React 19, and TypeScript, it uses Plate.js as a rich text editor and features an intelligent auto-fill system that generates legal will sections from user data.

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **React**: 19.2.0
- **TypeScript**: Strict mode
- **Editor**: Plate.js (v48.x) - Rich text editor for legal documents
- **Database**: Prisma ORM (PostgreSQL assumed)
- **Auth**: Clerk
- **Styling**: Tailwind CSS v4 + shadcn/ui (New York style)
- **AI**: OpenAI integration via Vercel AI SDK

## Current State

### Active Branch
- `main` (default branch for PRs)

### Modified Files (Uncommitted)
1. **app/(dashboard)/dashboard/wills/new/page.tsx** - Temporary sample will selector dialog
2. **lib/actions/wills.ts** - Will CRUD operations
3. **lib/auto-fill/types.ts** - Auto-fill system type definitions

### New Untracked Files
1. **components/wills/sample-will-selector.tsx** - TEMPORARY: Dialog for selecting sample will templates
2. **lib/data/samples/** - Sample will data for testing (5 scenarios)

## Recent Work (Last 5 Commits)

### 1. Enhanced WillEditor and DashboardSidebar (ecd3ddc)
- Fixed mount state management
- Resolved hydration mismatches
- Improved client-side rendering stability

### 2. SA ID Number Validation (c1100ab)
- Implemented South African ID validation function
- Extracts gender, date of birth, and citizenship from ID numbers
- Returns default values for validation

### 3. Package Updates & Auto-Fill Enhancements (5ebe4e1)
- Updated dependencies
- Enhanced WillEditor functionality
- Improved auto-fill capabilities

### 4. Executor Appointment Logic Refactor (a2e08cf)
- Refactored executor appointment logic
- Updated sample will content structure

### 5. VSCode Debug & Executor Handling (02a781f)
- Enhanced debugging capabilities
- Improved executor handling in wills

## Key Features Completed

### Auto-Fill System (lib/auto-fill/)
A sophisticated system for generating legal will sections from structured data:

**Core Components:**
- **WillArticle Types**: 10 standard South African will sections
  - PREAMBLE, REVOCATION, DECLARATION, FAMILY_INFO
  - EXECUTORS, GUARDIANS, MINOR_PROVISIONS
  - SPECIFIC_BEQUESTS, RESIDUARY_ESTATE, ATTESTATION

- **AutoFillOrchestrator**: Coordinates all generators
  - Detects existing sections in editor
  - Generates new content
  - Compares and diffs changes
  - Manages section insertion/replacement

- **Generators** (lib/auto-fill/generators/):
  - Article generators for each will section
  - Plate.js node generation
  - Legal text formatting

### Sample Will System (TEMPORARY DEV FEATURE)
**Purpose**: Testing and development of auto-fill system

**5 Sample Scenarios:**
1. **Lindiwe Dube** - Simple Single Person
   - Minimal assets (R1.5M)
   - Single beneficiary
   - Tests minimal data scenarios

2. **Thabo Molefe** - Standard Married with Children
   - R22M estate
   - Mixed assets (properties, vehicles, business)
   - Spouse + children beneficiaries

3. **Johan Van Wyk** - Complex Blended Family
   - R120M+ estate
   - 4 children from 2 marriages
   - Business interests + international assets
   - Professional attorney as co-executor

4. **Nomvula Khumalo** - Widowed with Special Needs Trust
   - R115M+ estate
   - Testamentary trust for special needs son
   - Charitable bequests (10%)

5. **Sipho Ndlovu** - Young Professional with Digital Assets
   - R800K estate
   - Heavy digital focus (crypto, NFTs, domains)
   - Non-married partner as beneficiary
   - Organ donation wishes

**Files to Remove When Done Testing:**
- `components/wills/sample-will-selector.tsx`
- `lib/data/samples/` directory
- Revert `app/(dashboard)/dashboard/wills/new/page.tsx` to original implementation

### Initial Document Generator (lib/will/initial-document-generator.ts)
- Generates complete will documents from WillContent data
- Uses AutoFillOrchestrator to coordinate all sections
- Returns Plate.js Value (editor content)
- Validates minimum data requirements (testator name)

### Database Schema (Prisma)
**User Model:**
- Clerk authentication integration
- One-to-many relationship with wills

**Will Model:**
- title: string
- content: WillContent (JSON - structured data)
- editorContent: Plate.js Value (JSON - rich text editor state)
- status: 'draft' | 'completed' | 'finalized'
- userId: foreign key to User

## Work In Progress

### Temporary Development Features
The current `/dashboard/wills/new` page shows a sample selector dialog instead of creating a blank will. This is TEMPORARY for testing the auto-fill system.

**Original Implementation (commented out):**
```typescript
export default async function NewWillPage() {
  const will = await createWill('Untitled Will', sampleWillContent)
  redirect(`/dashboard/wills/${will.id}`)
}
```

**Current Implementation:**
- Client component with dialog
- Allows selection of 5 sample scenarios
- Creates will with pre-filled data for testing

### Known Issues

1. **lib/actions/wills.ts:93-95** - Debug code present:
```typescript
export async function benzona() {
  debugger;
  return await Promise.resolve("sharmuta")
}
```
⚠️ Remove before production

2. **app/(dashboard)/dashboard/wills/new/page.tsx:43** - Missing error handling:
```typescript
// TODO: Show error toast to user
```

## Next Steps & TODOs

### Immediate
1. **Remove sample selector system** when auto-fill testing is complete
   - Delete sample-will-selector.tsx
   - Delete lib/data/samples/ directory
   - Restore original /dashboard/wills/new page

2. **Clean up debug code** in lib/actions/wills.ts (benzona function)

3. **Implement error toast** for will creation failures

### Auto-Fill System
- [x] Core type definitions (lib/auto-fill/types.ts)
- [x] Article generators for all 10 sections
- [x] AutoFillOrchestrator
- [x] InitialDocumentGenerator
- [ ] Section comparison and diff UI
- [ ] User review/approval flow for auto-generated content
- [ ] Merge strategies (append, replace, skip-if-exists)
- [ ] Manual edit detection heuristics

### Features to Build
1. **Will Editor Enhancements**
   - AI-powered suggestions using OpenAI
   - Slash commands for quick insertions
   - Legal validation warnings

2. **Export Functionality**
   - PDF generation (@react-pdf/renderer already installed)
   - Print-ready formatting
   - Legal compliance checks

3. **Collaboration Features**
   - Share with lawyers/advisors
   - Comments and feedback system
   - Version history

4. **Payment Integration**
   - Subscription tiers
   - Export restrictions for free tier

## Technical Architecture

### Directory Structure
```
app/
  (dashboard)/dashboard/
    wills/
      new/page.tsx         - Will creation (currently showing sample selector)
      [id]/page.tsx        - Will editor page
  layout.tsx               - Root layout
  globals.css              - Tailwind + theme

lib/
  actions/
    wills.ts               - Server actions for will CRUD
  auto-fill/
    types.ts               - Type definitions
    generators/            - Article generators
    index.ts               - AutoFillOrchestrator
  data/
    samples/               - TEMPORARY: Sample will data
  types/
    will.ts                - WillContent and related types
    questionnaire.ts       - User input types
  will/
    initial-document-generator.ts - Full document generation
  prisma.ts                - Prisma client singleton
  utils.ts                 - cn() helper

components/
  wills/
    sample-will-selector.tsx - TEMPORARY: Sample selection dialog
  ui/                        - shadcn/ui components

prisma/
  schema.prisma            - Database schema
```

### Path Aliases
- `@/*` → Root directory
- `@/components` → components/
- `@/lib` → lib/
- `@/hooks` → hooks/

### Environment Variables Required
- Clerk authentication keys
- Database connection string
- OpenAI API key (for AI features)

## Development Commands

```bash
# Development server (with Turbopack)
npm run dev

# Development server (legacy)
npm run dev:legacy

# Debug mode (with inspector)
npm run dev:debug

# Build for production
npm run build

# Start production server
npm start

# Linting
npm run lint
```

Server runs on http://localhost:3000

## Important Notes

### South African Context
- All monetary values in ZAR (Rands)
- Marital regimes: COP (Community of Property), OCOP (Out of Community), Accrual
- SA ID number validation and parsing
- Legal language follows South African will conventions

### Auto-Fill System Philosophy
1. **Generate from structured data**: WillContent (testator, beneficiaries, assets, etc.)
2. **Convert to legal prose**: Generators create Plate.js nodes (rich text)
3. **Detect existing content**: Find sections already in editor
4. **Compare and suggest**: Show diffs, let user approve changes
5. **Preserve manual edits**: Don't overwrite user customizations

### Data Flow
```
User Input → WillContent (structured) → AutoFillOrchestrator →
Article Generators → Plate.js Nodes → Editor Value →
Save to DB (editorContent) → PDF Export
```

### Plate.js Editor
- Rich text editor optimized for long-form legal documents
- Plugin architecture for extensibility
- AI plugin for OpenAI integration
- Slash commands for quick actions
- Markdown support

## Code Quality Notes

### Current Issues
- Debug code in wills.ts (benzona function)
- Missing error handling in will creation flow
- Temporary sample selector code marked for removal

### Best Practices Being Followed
- TypeScript strict mode
- Server components by default
- Client components marked with 'use client'
- Proper Prisma transaction handling
- Type-safe server actions
- Path aliases for clean imports

## Testing Strategy

Currently using 5 realistic sample scenarios to test:
1. **Edge cases**: Minimal data, single beneficiary
2. **Standard cases**: Typical family structures
3. **Complex cases**: Blended families, trusts, high-value estates
4. **Modern considerations**: Digital assets, non-married partners
5. **Special provisions**: Special needs trusts, charitable giving

## When You Return

### Quick Start
1. Pull latest changes: `git pull origin main`
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
4. Check database migrations: `npx prisma migrate status`

### First Tasks
1. Review and test the sample will selector with all 5 scenarios
2. Verify auto-fill generation works correctly for each complexity level
3. Consider whether to keep sample selector as admin/dev feature or remove entirely
4. Implement the error toast for will creation failures
5. Clean up debug code in wills.ts

### Questions to Answer
1. Should sample templates be available to end users or just for development?
2. What's the user flow for auto-fill suggestions? (Modal? Sidebar? Inline?)
3. How should we handle conflicts between manual edits and auto-generated content?
4. When should InitialDocumentGenerator run? (Only on creation? On data changes?)

## Resources

- [Next.js 16 Docs](https://nextjs.org/docs)
- [Plate.js Docs](https://platejs.org)
- [Clerk Auth Docs](https://clerk.com/docs)
- [Prisma Docs](https://prisma.io/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

---

**Last Updated**: December 19, 2025
**Developer**: Returning after 3-week break
**Status**: Active development, auto-fill system testing phase
