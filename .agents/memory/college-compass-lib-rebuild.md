---
name: CollegeCompass lib rebuild rule
description: After any change to lib/db schema, typecheck:libs must run before leaf package typechecks
---

**Rule:** Any change to `lib/db/src/schema/` requires running `pnpm run typecheck:libs` before running `pnpm --filter @workspace/api-server run typecheck`. Skipping this causes spurious "Module has no exported member" errors for every table export.

**Why:** The API server imports table symbols from `@workspace/db`. When the DB lib source changes but declarations haven't been rebuilt, tsc sees the old `.d.ts` files and reports every new export as missing — even though the code is correct.

**How to apply:** Whenever a DB migration or schema file edit is made (add table, add column, rename), the sequence is:
1. `pnpm --filter @workspace/db run push` — push to DB
2. `pnpm run typecheck:libs` — rebuild declarations
3. `pnpm run typecheck` — full check
