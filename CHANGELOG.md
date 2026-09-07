# Changelog

All notable changes to this project are documented here. Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased] — 2026-09-07

### Security

- Require an authenticated session on every `/api` route (`runs`, `ev`, `ev/[id]`, `ev/latest`). Previously these endpoints had no session check, so anyone who found the URL could read or write rows regardless of login state. Shared NextAuth config extracted into `lib/auth.ts` so route handlers and the sign-in route use the same `authOptions`.

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
