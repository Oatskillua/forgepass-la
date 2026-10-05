# ForgePass LA

Los Angeles discovery and trip planning built with React, Vite, Supabase,
Vercel API handlers, a PWA service worker, and Capacitor Android/iOS projects.

This implementation is under development. Local checks pass; hosted integration,
native builds, and release verification remain outstanding. Read the
[completion status](docs/completion-status.md),
[release runbook](docs/release-runbook.md) and
[integration gates](docs/integration-gates.md) before deployment.

## Local setup

Use Node.js 22, matching CI.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Set the browser Supabase URL and public anonymous key to your development
project. Never put a service-role key in a `VITE_` variable. Missing or invalid
configuration displays an unavailable screen before authentication starts.
There is no fallback database project. Rebuild after changing these settings.

Set `VITE_PUBLIC_SITE_URL` to the canonical HTTPS website origin for native
packages. Sharing and password-recovery links use this origin; ordinary browser
builds use their current origin if it is unset. Do not include a URL path. This
setting does not configure native API calls or recovery deep links.

Native API calls separately require `VITE_API_ORIGIN` and matching server
`API_ALLOWED_ORIGINS`. See the release runbook for device verification; these
settings do not by themselves establish a working native build.

Vite serves the frontend, not the Vercel handlers in `api/`. Events, intake,
and administration need an environment serving those handlers at `/api/*`.
Production routing is configured in `vercel.json`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Frontend development server |
| `npm run check` | ESLint, tests, and production/PWA build |
| `npm run audit:production` | Audit production dependencies; fail on high or critical findings |
| `npm run check:release` | Run all local checks plus the production dependency audit, matching CI |
| `npm run test:watch` | Watch tests |
| `npm run build` | Generate web assets in dist |
| `npm run preview` | Preview built frontend; does not serve API handlers |
| `npm run mobile:check` | Validate required production-mode native service configuration without printing values |
| `npm run mobile:sync` | Check configuration, build and copy web assets into native projects |
| `npm run mobile:android` | Sync and open Android project |
| `npm run mobile:ios` | Sync and open iOS project |

Native sync is not a signed build or proof of functional native API requests.

## Current implementation

| Area | Implemented | Remaining |
| --- | --- | --- |
| Accounts | Auth/recovery UI, profiles, notification preferences | Hosted email/Auth tests and complete account lifecycle |
| Discovery | Indexed places, event search, saved content | Broader content/provider integration |
| Trips | Create, edit, visit times, calendar export, read-only sharing, reorder, notes, duplicate, delete, directions preview | Hosted sharing/concurrency, calendar imports and device validation |
| Rewards | Wallet, history, transactional redemption and retry keys | Earning, catalog administration, fulfillment |
| Alerts | Read status, refresh, and older-page navigation | Delivery pipeline and hosted pagination verification |
| Navigation | External Maps and rideshare handoff | Embedded map and device testing |
| Administration | Intake lists, metrics, status updates, bounded exports | Broader administration and staging verification |
| Distribution | PWA and native scaffolding | Browser/offline QA, signed builds, store release |

## Project layout and verification

- `src/`: frontend, authentication, and client data helpers.
- `api/`: Vercel handlers and server-only helpers.
- `supabase/migrations/`: ordered database changes.
- `api/database.test.js`: executes migrations in embedded PostgreSQL.
- `android/`, `ios/`: Capacitor projects.
- `docs/`: audit notes, integration gaps, and release procedures.

Tests combine mocked UI/API behavior with real SQL in PGlite using a minimal
Auth schema. They do not verify the hosted database, email delivery, concurrent
database connections, or app-store readiness. CI uses `check:release`, which
includes the production dependency audit; local `check` alone does not.

Never put intake exports in `public/`. A previously tracked waitlist CSV was
removed from local distributable directories; earlier Git and deployed copies
still require review as described in the integration gates.
