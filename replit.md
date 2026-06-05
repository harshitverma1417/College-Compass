# CollegeCompass

A full-stack college discovery platform for Indian students — browse 53+ colleges, compare institutions, predict admissions, and save favorites.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/college-compass run dev` — run the frontend (port auto-assigned)
- `pnpm run typecheck` — full typecheck across all packages (run `typecheck:libs` first after DB schema changes)
- `pnpm run typecheck:libs` — rebuild lib declarations (MUST run before `typecheck` after any DB schema change)
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Wouter routing, TanStack Query, shadcn/ui, Tailwind CSS
- API: Express 5, Orval-generated hooks from OpenAPI spec
- DB: PostgreSQL + Drizzle ORM, bcryptjs + JWT auth
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/db/src/schema/` — source-of-truth DB schema (colleges, courses, reviews, users, saved_colleges, saved_comparisons)
- `lib/api-spec/openapi.yaml` — source-of-truth API contract (Orval reads this)
- `lib/api-client-react/src/generated/` — generated React Query hooks + Zod schemas (do not edit)
- `artifacts/api-server/src/routes/` — Express route handlers (auth, colleges, courses, reviews, comparisons, predictor, saved, stats)
- `artifacts/college-compass/src/pages/` — React pages (Home, Colleges, CollegeDetail, Compare, Predictor, Login, Signup)
- `artifacts/college-compass/src/lib/auth.tsx` — client-side JWT auth context

## Architecture decisions

- **Contract-first API**: OpenAPI spec → Orval codegen → typed React Query hooks. Never write fetch calls by hand in the frontend.
- **JWT in localStorage**: Token stored as `cc_token`, injected into every API call via `setAuthTokenGetter` from `@workspace/api-client-react`.
- **Lib rebuilds**: After any change to `lib/db` schema, run `pnpm run typecheck:libs` before leaf-package typechecks or the server will report missing exports.
- **Shared proxy routing**: All traffic goes through localhost:80; API is at `/api`, frontend at `/`. Never call service ports directly in curl or app code.
- **Seeded data**: 53 colleges, 318 courses, 271 reviews pre-seeded in dev DB.

## Product

- **College discovery**: Browse 53 Indian institutions (IITs, NITs, IIITs, private, government) with ratings, fees, packages, location filters, and search
- **College detail**: Full profile with about section, key stats (rating, avg/highest package), courses offered, and student reviews
- **College comparison**: Side-by-side comparison of up to 3 colleges across key metrics
- **Admission predictor**: Enter JEE/GATE rank to see likely admission chances at matching colleges
- **Auth**: JWT-based signup/login; save favorite colleges and comparisons to your account
- **Stats dashboard**: Platform-wide stats (total colleges, courses, reviews)

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After any `lib/db` schema change: run `pnpm run typecheck:libs` THEN `pnpm run typecheck` — skipping the first step gives false "missing export" errors in the API server.
- `@workspace/api-client-react/custom-fetch` is NOT a valid import path from consuming packages — import `setAuthTokenGetter` from `@workspace/api-client-react` (the barrel export).
- The `courses` table `duration` column is TEXT (e.g. "4 Years"), not an integer.
- `College` type from codegen does NOT include `avgPackage` — that lives only on `CollegeDetail`. Use `(college as any).avgPackage` or cast at the point of use in list views.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
