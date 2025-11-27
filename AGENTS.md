# Repository Guidelines

## Project Structure & Module Organization
- `app/` holds App Router routes; `(auth)` and `(dashboard)` segments cover auth flow and dashboards, `app/page.tsx` is marketing landing, `app/layout.tsx` applies ClerkProvider plus global styles.
- `components/` contains shared UI (shadcn-based under `components/ui/`) and feature widgets like `dashboard-sidebar.tsx`; keep visual-only logic here.
- `lib/` houses server utilities (`prisma.ts`, `utils.ts`) and should encapsulate Prisma access used by route handlers in `app/(dashboard)/...`.
- `prisma/schema.prisma` defines Neon tables; run migrations before shipping schema-dependent work.
- Shared hooks live in `hooks/`, prompt templates in `prompts/`, and static assets in `public/`.

## Build, Test, and Development Commands
- `npm run dev` – launch the Next.js dev server at `http://localhost:3000` with Clerk middleware.
- `npm run build` – compile the production bundle; use this to spot type/regression issues ahead of deploys.
- `npm run start` – run the optimized build locally to mirror Vercel.
- `npm run lint` – execute ESLint (`eslint.config.mjs`); append `-- --fix` for formatting cleanup.
- `npx prisma migrate dev --name <change>` – apply Neon schema updates and regenerate the Prisma client.

## Coding Style & Naming Conventions
- TypeScript + React 19: prefer server components; only mark files `"use client"` when hooks or browser APIs are required.
- Use 2-space indentation, PascalCase for components (`WillEditor`), camelCase for helpers, kebab-case for route folders, and keep Tailwind utility ordering consistent with existing files.
- Keep business logic in `lib/` or route handlers, leaving components focused on rendering.

## Testing Guidelines
- No automated test harness yet; minimum expectation is `npm run lint` plus manual checks of sign-up, dashboard editing, PDF export, and Prisma reads/writes while `npm run dev` runs.
- When adding tests, colocate them near the feature (e.g., `will-editor.test.tsx`) and target will generation helpers, Prisma services, and AI prompt formatting.

## Commit & Pull Request Guidelines
- Follow current history: imperative, descriptive subjects (“Refactor WillEditor to load sample content”) with optional explanatory body text.
- Commit schema files together with `prisma/migrations/` artifacts to keep Prisma in sync.
- Pull requests should explain motivation, list affected routes, and attach screenshots or screen recordings for UI work; link relevant issues or TODO references.

## Environment & Security Tips
- Keep secrets in `.env.local` (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `DATABASE_URL`, `DIRECT_URL`) and restart dev servers after edits.
- Match Clerk redirect paths (`/sign-in`, `/dashboard`) to local routes, and never check in `.env*` files or Prisma connection strings.
