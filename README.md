# MyShopList

A smart shopping list app with live checkout validation.

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS
- **Database**: Supabase (free PostgreSQL)
- **Icons**: Lucide React
- **Deployment**: Vercel

## Features

- Add items with quantity and category
- Check off items while shopping in-store
- Confirm purchases (moves to history)
- Recent purchases history
- Top 20 most bought items (quick-add with one click)
- Real-time sync across devices via Supabase Realtime

## Setup

1. Clone the repo and install dependencies:
```bash
npm install
```

2. Create a project on [supabase.com](https://supabase.com) (free)

3. Run the SQL schema in the Supabase SQL editor:
```sql
-- Copy the contents of supabase-schema.sql
```

4. Copy `.env.local.example` to `.env.local` and fill in the values:
```bash
cp .env.local.example .env.local
```

5. Start the development server:
```bash
npm run dev
```

## Deploy to Vercel

1. Connect the GitHub repo to Vercel
2. Add the Supabase environment variables in Vercel settings
3. Deploy
