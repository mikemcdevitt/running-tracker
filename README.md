# Running Tracker

A personal Next.js app for logging runs and EV charging sessions, with a dashboard that rolls both up into month/year/all-time stats. Deployed at [running-tracker-mu-navy.vercel.app](https://running-tracker-mu-navy.vercel.app).

## Features

- **Dashboard** — monthly, yearly, and all-time mileage for both running and the EV, plus last-run and last-charge summaries and overall EV efficiency (Wh/mi).
- **Run log** — record date, distance, time, location, zip, shoes, and tags (treadmill, race, ioana, stroller); recent entries list with pace calculated per run.
- **EV log** — record date, miles, kWh, odometer, running total kWh, and time driven; entries are flagged **efficient**/**inefficient** when their Wh/mi is more than one standard deviation from your average, and each entry has a detail page for edits with derived stats (avg speed, kWh/100mi, mi/100Wh).
- **Auth with roles** — every page and API route requires a signed-in, allow-listed Google account (NextAuth). Accounts in `ALLOWED_EMAILS` can read and write; accounts in `READONLY_EMAILS` can view everything but can't create, edit, or delete anything — see [Security](#security) below.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack, React 19)
- [NextAuth.js v4](https://next-auth.js.org) with the Google provider
- [Neon](https://neon.tech) serverless Postgres (`@neondatabase/serverless`)
- [Tailwind CSS v4](https://tailwindcss.com)
- TypeScript

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to Google sign-in — any Google account can authenticate, but see the note in [Security](#security) about restricting who that should be.

### Environment variables

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Neon Postgres connection string. Expects a `tracking` schema with `runs` and `ev` tables (see [Database schema](#database-schema)). |
| `GOOGLE_CLIENT_ID` | OAuth client ID from the [Google Cloud Console](https://console.cloud.google.com/apis/credentials). |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret for the same credential. |
| `NEXTAUTH_SECRET` | Random string NextAuth uses to sign session tokens/cookies. Generate one with `openssl rand -base64 32`. |
| `NEXTAUTH_URL` | The app's base URL (e.g. `http://localhost:3000` locally, your Vercel URL in production). Required by NextAuth v4 outside of local dev. |
| `ALLOWED_EMAILS` | Comma-separated Google accounts with full read/write access (case-insensitive). |
| `READONLY_EMAILS` | Comma-separated Google accounts with read-only access — they can sign in and view everything but can't create, edit, or delete anything. |

See `.env.example` for a ready-to-copy template.

### Database schema

The app expects a `tracking` schema with two tables:

```sql
CREATE SCHEMA IF NOT EXISTS tracking;

CREATE TABLE tracking.runs (
  id        SERIAL PRIMARY KEY,
  date      DATE NOT NULL,
  miles     NUMERIC NOT NULL,
  minutes   NUMERIC NOT NULL,
  location  TEXT,
  zip       TEXT,
  shoes     TEXT NOT NULL,
  treadmill BOOLEAN DEFAULT FALSE,
  race      BOOLEAN DEFAULT FALSE,
  ioana     BOOLEAN DEFAULT FALSE,
  stroller  BOOLEAN DEFAULT FALSE
);

CREATE TABLE tracking.ev (
  id        SERIAL PRIMARY KEY,
  date      DATE NOT NULL,
  miles     NUMERIC NOT NULL,
  kwh       NUMERIC NOT NULL,
  odo       NUMERIC,
  total_kwh NUMERIC,
  minutes   NUMERIC
);
```

## Security

Every page and every route under `app/api/` (runs, ev, ev/[id], ev/latest) checks for a valid NextAuth session server-side and returns a redirect (pages) or `401` (API routes) when there isn't one — see `lib/auth.ts` for the shared auth config.

On top of that, `lib/auth.ts`'s `signIn` callback only allows accounts listed in `ALLOWED_EMAILS` or `READONLY_EMAILS` to sign in at all, and fails closed (denies everyone) if neither variable is set. Signed-in accounts get one of two roles, carried in `session.user.role` via the `jwt`/`session` callbacks:

- **`editor`** (`ALLOWED_EMAILS`) — full read/write access.
- **`viewer`** (`READONLY_EMAILS`) — can view the dashboard, runs, and EV log, but the "+ Log run" / "+ Log charge" actions are hidden, the add/edit pages redirect away or render disabled, and the mutating API routes (`POST /api/runs`, `POST /api/ev`, `PATCH /api/ev/[id]`) return `403` regardless of what the UI shows. The UI hiding is for convenience — the API-level check is what actually enforces it.

## Deployment

The app is deployed on [Vercel](https://vercel.com). Set the environment variables above in the Vercel project settings, and make sure the Google OAuth client's authorized redirect URI includes `<your-domain>/api/auth/callback/google`.
