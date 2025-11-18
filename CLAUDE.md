# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Fennec Will Builder" - An AI-driven SaaS application built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4. The project uses shadcn/ui component library for building the UI.

## Development Commands

### Run development server
```bash
npm run dev
```
Server runs on http://localhost:3000 with hot-reload enabled.

### Build for production
```bash
npm build
```

### Start production server
```bash
npm start
```

### Linting
```bash
npm run lint
```

## Project Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **React**: Version 19.2.0
- **TypeScript**: Strict mode enabled
- **Styling**: Tailwind CSS v4 with CSS variables
- **UI Components**: shadcn/ui (New York style)
- **Icons**: Lucide React
- **Fonts**: Geist Sans and Geist Mono (Google Fonts via next/font)

### Directory Structure

- `app/` - Next.js App Router directory
  - `layout.tsx` - Root layout with font configuration
  - `page.tsx` - Home page component
  - `globals.css` - Global styles and Tailwind configuration

- `lib/` - Shared utilities
  - `utils.ts` - Contains `cn()` helper for merging Tailwind classes using clsx and tailwind-merge

- `components/` - React components (to be created)
  - `ui/` - shadcn/ui components will be installed here

- `prompts/` - Design specifications and requirements
  - Contains markdown files with product/design specifications

- `public/` - Static assets

### Path Aliases

TypeScript path aliases are configured in `tsconfig.json`:
- `@/*` maps to the root directory
- shadcn/ui uses these aliases:
  - `@/components` - UI components
  - `@/lib/utils` - Utility functions
  - `@/components/ui` - shadcn/ui components
  - `@/lib` - Library code
  - `@/hooks` - React hooks

### shadcn/ui Configuration

The project uses shadcn/ui with the following settings (`components.json`):
- Style: "new-york"
- RSC: enabled (React Server Components)
- Base color: "neutral"
- CSS variables: enabled
- Icon library: Lucide React
- Tailwind CSS file: `app/globals.css`

Install new components using:
```bash
npx shadcn@latest add <component-name>
```

### Styling Approach

- Uses Tailwind CSS v4 with PostCSS
- CSS variables for theming (defined in `app/globals.css`)
- Dark mode support via class-based strategy
- Uses `cn()` utility from `lib/utils.ts` for conditional class merging

### TypeScript Configuration

- Target: ES2017
- Strict mode enabled
- JSX: react-jsx
- Module resolution: bundler
- Incremental compilation enabled

## Design Requirements

Refer to `prompts/1Landing.md` for landing page specifications including:
- Navbar with logo, navigation links, and CTA buttons
- Hero section spanning 100vh with headline and interactive background
- Fully fluid/responsive design
