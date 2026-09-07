<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Running Tracker — agent notes

- Every route under `app/api/**` and every page must require a signed-in session (`getServerSession(authOptions)` from `lib/auth.ts` in routes; redirect-to-signin in pages). See `CLAUDE.md` for the full convention and why it's non-negotiable here.
- Data lives in Neon Postgres under a `tracking` schema (`tracking.runs`, `tracking.ev`); schema and required env vars are documented in `README.md` and `.env.example`.
- When behavior changes, update `README.md` / `CHANGELOG.md` / `.env.example` alongside the code — see `CLAUDE.md#keeping-docs-current`.
