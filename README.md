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
- Real-time sync across devices via Supabase Realtime

## Automatic categories

Typing a known product selects its category automatically. The shared dictionary in
`src/lib/products.ts` recognizes English/French names, known spelling variants,
quantity wrappers and selected food emojis. Household aliases include Buck buck
(Starbucks Cappuccino), Breakfast (DooWap), Snack (Nature Valley bars), the softener
aliases, Cleaning machine (laundry detergent), Scrub (exfoliating cream), Cream
(moisturizer), Prune (prunes) and Sweet chili (bell pepper).

The original name and quantity are preserved. A manual category selection takes
precedence for that addition. Editing the name returns the form to automatic
detection; failed submissions keep the draft and selected category. Unknown names
can be added under `To classify`.

The list, recent purchases and weekly statistics also classify legacy `Other`
entries when displaying them. Existing assigned categories remain unchanged.
Weekly product counts combine recognized aliases, and autocomplete can find a
historical nickname by its actual product name. Selecting a historical suggestion
reuses its category. New additions store the selected category in Supabase; no
schema migration or AI service is required. Historical database rows are not
rewritten, so raw exports and the existing `get_top_items` SQL RPC retain their
original names/categories. Only the app's weekly statistics combine aliases.

To extend recognition, add explicit aliases to the dictionary. The app does not
learn new aliases or globally remember category corrections automatically.

Run `npm test` with Node.js 22.18+ for classification regression tests, and
`npm run lint` plus `npx tsc --noEmit` for application checks.

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
