
# CAT-ALYSIM Monorepo

Web (Next.js) + Mobile (Expo) + Supabase Edge Function + Shared packages.

## Dev

```bash
pnpm install
pnpm dev            # run web + mobile
# or
pnpm --filter web dev
pnpm --filter mobile dev
```

## Env

- apps/web/.env.local
- apps/mobile/.env

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_VERIFY_ENDPOINT=https://<project-ref>.functions.supabase.co/verify-paid
```

## Deploy function
```
supabase link --project-ref <REF>
supabase secrets set SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=...
supabase functions deploy verify-paid
```
