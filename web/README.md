This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Supabase (hosted)

```bash
npx supabase login
npx supabase link --project-ref <ref>          # asks for the DB password (or set SUPABASE_DB_PASSWORD)
npx supabase db push                            # applies supabase/migrations
npx supabase functions deploy paymob-webhook --no-verify-jwt
npx supabase functions deploy mock-payment
npx supabase secrets set --env-file <file with PAYMOB_HMAC_SECRET=...>
```

Copy `.env.example` to `.env.local` and fill it in. With `ENABLE_MOCK_PAYMENT=true` the mock payment
flow is at `/mock-payment` (404 otherwise).

## Deploy on Cloudflare Workers

Uses [OpenNext for Cloudflare](https://opennext.js.org/cloudflare) (`@opennextjs/cloudflare` + `wrangler`).

```bash
npx wrangler login
npx wrangler secret put SUPABASE_SECRET_KEY   # repeat for each secret listed in wrangler.jsonc
npm run preview   # build and run in the Workers runtime locally
npm run deploy    # build and deploy to your Cloudflare account
```

Edge Functions deploy to Supabase separately: `npx supabase functions deploy` and `npx supabase secrets set PAYMOB_HMAC_SECRET=...`.
