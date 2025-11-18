# Setup Instructions for Fennec Will Builder

This guide will help you configure authentication and database for the application.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Clerk account (free tier available)
- A NeonDB account (free tier available)

## Step 1: Install Dependencies

Dependencies are already installed. If needed, run:

```bash
npm install
```

## Step 2: Configure Clerk Authentication

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application (or use an existing one)
3. Navigate to **API Keys** in the sidebar
4. Copy your **Publishable Key** and **Secret Key**
5. Update `.env.local` file:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
CLERK_SECRET_KEY=sk_test_your_actual_secret_here
```

### Configure Clerk Application Settings

In your Clerk dashboard:

1. Go to **Paths** settings
2. Set the following paths:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/dashboard`
   - After sign-up URL: `/dashboard`

## Step 3: Configure NeonDB Database

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project (or use existing)
3. Copy your connection string from the dashboard
4. You'll need TWO connection strings:
   - **Pooled connection** (for regular queries) → `DATABASE_URL`
   - **Direct connection** (for Prisma migrations) → `DIRECT_URL`

5. Update `.env.local`:

```env
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"
```

**Note**: The direct URL is the same as the pooled URL but may have different parameters. Check NeonDB docs for details.

## Step 4: Initialize the Database

Run Prisma migrations to create the database schema:

```bash
npx prisma migrate dev --name init
```

This will:
- Create the database tables (User, Will)
- Generate the Prisma Client

## Step 5: Run the Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## Step 6: Test the Authentication Flow

1. Visit `http://localhost:3000`
2. Click "Sign Up" in the navbar
3. Create an account (Clerk will handle email verification)
4. You should be redirected to `/dashboard` after signup
5. Test logout and login functionality

## Troubleshooting

### Build Errors

If you see Clerk key errors during build:
- Make sure your `.env.local` file has valid Clerk keys
- Restart the dev server after updating environment variables

### Database Connection Issues

- Verify your NeonDB connection strings are correct
- Check that your IP is whitelisted in NeonDB (if applicable)
- Ensure SSL mode is set correctly

### Middleware Deprecation Warning

The warning about middleware → proxy is expected in Next.js 16. Clerk will update their SDK to support the new convention. For now, the middleware works correctly.

## Project Structure

```
app/
├── (auth)/                 # Authentication pages (sign-in, sign-up)
├── (dashboard)/            # Protected dashboard pages
│   └── dashboard/
│       ├── page.tsx       # Dashboard home
│       ├── wills/         # Wills management
│       └── settings/      # User settings
├── layout.tsx             # Root layout with ClerkProvider
├── page.tsx               # Landing page
└── globals.css            # Global styles

components/
├── dashboard-sidebar.tsx   # Dashboard navigation
├── navbar.tsx             # Landing page navbar
├── hero.tsx               # Hero section
└── ui/                    # shadcn/ui components

lib/
├── prisma.ts              # Prisma client singleton
└── utils.ts               # Utility functions

prisma/
└── schema.prisma          # Database schema

middleware.ts              # Clerk authentication middleware
```

## Next Steps

1. Set up Clerk and NeonDB accounts
2. Configure environment variables in `.env.local`
3. Run Prisma migrations
4. Start the development server
5. Test the authentication flow

For more help:
- [Clerk Documentation](https://clerk.com/docs)
- [NeonDB Documentation](https://neon.tech/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js 16 Documentation](https://nextjs.org/docs)
