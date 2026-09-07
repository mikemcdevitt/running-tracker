@AGENTS.md

# Project: Running Tracker

Personal Next.js app that logs runs and EV charging sessions to Neon Postgres and shows rolled-up stats on a dashboard. Full description, setup, and schema live in `README.md` — read that first for anything beyond quick orientation.

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript
- NextAuth v4, Google provider only, shared config in `lib/auth.ts`
- `@neondatabase/serverless` against a Postgres `tracking` schema (`tracking.runs`, `tracking.ev`)
- Tailwind CSS v4

## Conventions

- **Every API route and every page must check auth.** Route handlers under `app/api/**` call `getServerSession(authOptions)` from `lib/auth.ts` and return `401` when there's no session; pages call `getServerSession()`/`useSession()` and redirect to `/api/auth/signin`. Don't add a new route or page that skips this — see `CHANGELOG.md`'s Unreleased entry for why it matters (these routes had no auth check until 2026-09-07).
- DB queries use `neon`'s tagged-template SQL (parameterized automatically) — keep using the tagged-template form rather than string concatenation.
- No ORM; table shapes are documented in `README.md#database-schema` and only enforced there — if you add a column, update both the SQL in the README and any TypeScript types in the affected route/page.
- Env vars (`DATABASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`) are documented in `.env.example` — add new ones there when you introduce them.

## Keeping docs current

When you change behavior, update the matching doc in the same commit:

- `README.md` — features, env vars, or schema changed
- `CHANGELOG.md` — add an entry (this project doesn't cut versions, so keep dated entries under `[Unreleased]` until the user says otherwise)
- `.env.example` — new/renamed/removed environment variable
