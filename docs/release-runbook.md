# Release runbook

This procedure is not a deployment record. No hosted migration or deployment
is established by local checks.

## Prepare the candidate

Review the complete working-tree diff, including new files and the public
waitlist CSV removal. Keep private recovery copies outside distributable paths.
Review earlier Git history and deployed assets for copies; local deletion does
not purge them. Record the reviewed commit and its verification results.

Run `npm ci` and `npm run check:release`, matching CI. This includes lint,
tests, the production build, and `npm audit --omit=dev --audit-level=high`.
The audit requires registry access; an unavailable audit is not a passing audit.

## Configure staging

Use a separate staging database and web/API deployment. Browser and server
settings must target the same Supabase project.

| Variable | Scope | Purpose |
| --- | --- | --- |
| VITE_SUPABASE_URL | Browser | Account data and Auth endpoint |
| VITE_SUPABASE_ANON_KEY | Browser | Public client key, subject to database policies |
| VITE_PUBLIC_SITE_URL | Browser/native | Canonical HTTPS website origin for shared links and browser-based password recovery; required in native packages |
| VITE_API_ORIGIN | Native | HTTPS origin hosting the Vercel API handlers; browser requests stay same-origin |
| API_ALLOWED_ORIGINS | Server only | Exact comma-separated native origins permitted by CORS; no wildcard |
| VITE_TURNSTILE_SITE_KEY | Browser | Public intake challenge |
| SUPABASE_URL | Server only | Server database and Auth access |
| SUPABASE_SERVICE_ROLE_KEY | Server only | Privileged server operations |
| TURNSTILE_SECRET_KEY | Server only | Challenge verification |
| TICKETMASTER_API_KEY | Server only | Event listings |

Treat browser variables as public. Optional provider entries in `.env.example`
do not themselves enable city feeds or an embedded map. Configure the actual
Supabase site URL and permit the exact `/auth/update-password` redirect URL.
Configure Turnstile for the staging hostname. Verify production values separately.

`VITE_PUBLIC_SITE_URL` must be an HTTPS origin without a path, credentials,
query or fragment. Native packages reject a missing origin; browser builds can
use their current origin when it is unset. Use the staging website for staging
packages and the production website for release packages, with matching Supabase
projects. Allow the selected origin's `/auth/update-password` URL in Supabase.
Recovery opens on that website; returning to the native app still needs deep links.

For native API access, set `VITE_API_ORIGIN` to the staging/release API origin and
set `API_ALLOWED_ORIGINS` on that server to the actual origins observed on devices.
The current scaffolds may use `https://localhost` (Android) and
`capacitor://localhost` (iOS); verify them before enabling the allowlist. Test
OPTIONS preflights and actual GET/POST/PATCH requests. CORS does not authenticate
clients: administrator bearer checks and intake validation remain required.
Native intake also requires a working Turnstile challenge on the device origin.

## Review and apply migrations

Back up the target database and compare its schema and grants to these files.
Record previously applied migrations. Do not rerun policy-creation migrations
blindly. Apply unapplied files in this order:

| Order | Migration | Purpose |
| --- | --- | --- |
| 1 | 202609180001_user_foundation.sql | Accounts, saved content, trips, ownership |
| 2 | 202609180002_rewards_notifications.sql | Rewards and notifications |
| 3 | 202609180003_notification_permissions.sql | Restrict notification updates |
| 4 | 202609190001_itinerary_reordering.sql | Atomic stop reordering |
| 5 | 202609190002_account_backfill.sql | Existing accounts and profile permissions |
| 6 | 202609190003_reward_redemption.sql | Transactional redemption |
| 7 | 202609190004_duplicate_itinerary.sql | Owned trip duplication |
| 8 | 202609190005_account_settings.sql | Atomic account settings |
| 9 | 202609200001_history_pagination_indexes.sql | Indexes for account history cursor ordering |
| 10 | 202609200002_itinerary_sharing.sql | Opt-in read-only links and owner-controlled rotation/revocation |
| 11 | 202609210001_intake_foundation.sql | Fresh-install waitlist/feedback schema and server-only access |

These files assume Supabase Auth and the standard service role exist. Migration
11 creates waitlist and feedback tables on a fresh project. It intentionally
refuses to run if either table already exists. For an existing deployment,
review and reconcile the legacy schema, data, constraints, indexes and grants
through a separate reviewed migration before recording an equivalent baseline.
Do not drop existing intake tables or simply mark the migration as applied to
bypass this check. Verify server insertion and client access denial before
enabling intake or exports.

Before enabling the sharing RPC, review existing itineraries marked `is_public`:
the read RPC makes those rows accessible through their existing tokens. Verify
the owners intended to share them. Apply migration 10 before the sharing UI.

Provision administrators through a trusted database/server operator after
verifying the intended Auth user ID. Ordinary users cannot grant themselves roles.

## Verify hosted behavior

Use two test accounts and an anonymous browser, with synthetic data. Record
observed outcomes, not just whether a page renders.

| Flow | Required evidence |
| --- | --- |
| Auth | Signup, verification email, login, logout, recovery email, expired link, new-password login |
| Ownership | Cross-user and anonymous denial; private views reset on account switch |
| Settings | Profile and preferences save together; failed edits remain available |
| Saved content | Save/removal persistence and failed-request recovery |
| Trips | Editing, notes, duplication, ordering; two-browser stale-edit rejection |
| Shared trips | Anonymous link access, excluded private fields, replacement/revocation, stale owner updates, fragment handling in telemetry |
| Rewards | Correct balance, stock and ledger; insufficient funds, sold-out inventory, same-key retry |
| Concurrency | Parallel redemptions cannot overspend; pending local records reconcile with ledger |
| Notifications | Read status works; content/ownership cannot be edited by users |
| Administration | Non-admin denial, role revocation, metrics, exports, status changes |
| Intake | Challenge and validation handling, server failure, form recovery |
| Events | Configured provider responses, search, save errors and retries |

## Verify distribution

Check API routes, direct navigation, mobile layout, keyboard access, and service
worker updates. Test offline behavior: cached assets do not make account data or
live events available offline.

For native apps, configure remote API access and recovery deep links first.
Run `npm run mobile:check` to validate required settings before syncing. It reads
Vite's production-mode environment, including `.env.production.local` and process
overrides, and lists missing/invalid variable names without their values. It
requires remote HTTPS origins for Supabase, the public website and the API, plus
a nonempty public Supabase key. It does not verify key validity or service access.
Run `npm run mobile:sync`, then build with supported platform tooling and verify
authentication, network calls, navigation handoff, icons, permissions, signing,
and installation on devices. iOS needs the appropriate Apple build environment.
Existing native projects are scaffolds, not downloadable release packages.

## Promote and recover

Address the unfinished features and gates in `integration-gates.md` before
claiming release readiness. Promote only the reviewed candidate. Required
migrations must precede clients that call the new RPCs. Configure production
variables explicitly. Missing or invalid browser Supabase settings block app
startup with an unavailable screen; there is no fallback database project.

Record the previous deployment and database backup before promotion. If a client
release fails, restore a known-compatible deployment and verify its database
compatibility. Do not reverse migrations or delete reward ledger records as an
improvised rollback. Database repair needs a reviewed recovery plan preserving
user data and redemption history.
