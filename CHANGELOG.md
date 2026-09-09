# Changelog

All notable changes to this project are documented here. Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased] — 2026-09-09

### Added

- Run detail page (`/runs/[id]`) for reviewing and editing a single run, with pace shown as a derived stat — brings runs to parity with the existing EV detail page. Backed by a new `GET`/`PATCH /api/runs/[id]` route.

### Changed

- Reorganized routes so running lives under `/runs/` at the same level as `/ev/`: the add-run form moved from `/add` to `/runs/add`, and the runs list now links each entry to its detail page (matching `/ev` → `/ev/[id]`).
- Extracted the markup and logic shared by the runs and EV features — page header/nav, entry and stat cards, form fields, date formatting, and the client-side auth-guard checks — into `components/` (`layout.tsx`, `cards.tsx`, `form.tsx`) and `lib/` (`ui.ts`, `format.ts`, `hooks.ts`), so both features build on the same primitives instead of duplicating them. See `README.md#project-structure`.
- Removed a dead `getEntries` helper and leftover debug `console.log` calls from `app/ev/page.tsx` while touching that file.

### Security

- Require an authenticated session on every `/api` route (`runs`, `ev`, `ev/[id]`, `ev/latest`). Previously these endpoints had no session check, so anyone who found the URL could read or write rows regardless of login state. Shared NextAuth config extracted into `lib/auth.ts` so route handlers and the sign-in route use the same `authOptions`.
- Restrict sign-in to allow-listed Google accounts via a `signIn` callback. Being logged into Google is no longer enough on its own, and sign-in fails closed (denies everyone) if no allow-list is configured.
- Add a `viewer` role: accounts in the new `READONLY_EMAILS` env var (comma-separated, alongside `ALLOWED_EMAILS` for full-access `editor` accounts) can sign in and view everything, but the mutating API routes (`POST /api/runs`, `POST /api/ev`, `PATCH /api/ev/[id]`) return `403` for them regardless of the UI, and the add/edit UI is hidden or disabled accordingly. `ALLOWED_EMAIL` (singular) is replaced by `ALLOWED_EMAILS` (comma-separated).

## 2026-06-29

### Added

- EV charge detail page (`/ev/[id]`) for reviewing and editing a single entry, with derived stats (avg speed, kWh/100mi, mi/100Wh).
- Time-driven fields (hours/minutes) on EV entries.
- Efficient/inefficient highlighting on the EV log: entries more than one standard deviation from the average Wh/mi are flagged.
- Mobile layout improvements across the add/edit forms.

## 2026-06-26

### Added

- EV charge tracking: log form, list view, and running totals (odometer, total kWh).
- Dashboard summary page with rolled-up stats.
- Google OAuth sign-in via NextAuth.

## 2026-06-25

### Added

- Initial running tracker: log a run (date, miles, minutes, location, zip, shoes, tags) and view a dynamic list of recent runs, backed by Neon Postgres.
