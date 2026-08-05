# Todo - Supabase Vite/SPA Setup (Adapted)

- [x] Analyze project structure & confirm Vite/SPA (not Next.js)
- [x] 1. Install `@supabase/supabase-js` in `apps/web` (already in package.json)
- [x] 2. Create `apps/web/.env` with Supabase URL + publishable key
- [x] 3. Create `apps/web/src/utils/supabase.ts` client helper
- [x] 4. Update `vite-env.d.ts` to declare `VITE_SUPABASE_PUBLISHABLE_KEY`
- [x] 5. Verify typecheck/build (passes cleanly)
