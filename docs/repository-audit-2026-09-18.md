# ForgePass LA Repository Audit

Date: 2026-09-18

## Current product state

The repository is an alpha public site with discovery, events, rewards, safety,
status, feedback, waitlist, and internal operations views. It is not yet the
authenticated city application described in the production brief.

## Confirmed working foundation

- React 19 and Vite 8 frontend
- Tailwind CSS 4 styling
- React Router public routes
- Vercel serverless API handlers
- Supabase-backed waitlist and feedback handlers
- Ticketmaster event-provider endpoint
- Vercel Analytics and Speed Insights
- Sentry bootstrap support
- Web manifest and application icons
- Privacy, terms, contact, security, and safety pages

## Baseline gaps

### Product

- No Supabase Auth user lifecycle or protected application shell
- No user profiles, preferences, favorites, saved events, or account deletion
- No persistent itinerary planner
- No operational rewards ledger
- No notification center or push subscription workflow
- No map-provider abstraction
- No normalized product schema or migration directory in the repository
- No role-backed admin authentication
- No service worker or verified offline experience
- No Capacitor projects

### Engineering

- No automated test framework or test scripts
- No explicit type-checking strategy
- No CI workflow
- Placeholder empty files remain throughout the tree
- Package versions use ranges rather than a release policy
- The checked-in README is still the Vite template

### Security

- The original admin access code used a `VITE_` variable and was therefore
  embedded in the browser bundle. The baseline fix moves the expected value to
  server-only `ADMIN_ACCESS_CODE` and verifies user input through the API.
- The current shared admin code is an interim alpha mechanism. Production must
  use Supabase Auth plus an RLS-protected admin-role table.
- Supabase browser configuration is hard-coded and must move to documented
  browser-safe environment variables.
- In-memory serverless rate limiting is instance-local and not sufficient for
  production abuse prevention.

## Delivery sequence

1. Stabilize the existing baseline: lint, build, environment contract, docs.
2. Add tests and CI around existing waitlist, feedback, and route behavior.
3. Add Supabase migrations, Auth, profiles, preferences, and protected routes.
4. Build the application shell and persistent discovery/event saving.
5. Add itinerary, rewards, notifications, and provider abstractions.
6. Replace shared-code admin access with role-backed authenticated access.
7. Complete PWA offline behavior, native packaging, accessibility, performance,
   security, and deployment validation.

## Scope separation

The supplied StarForge Protocol documents concern a separate blockchain and
governance product. They are company context only and are not implementation
requirements for ForgePass LA. ForgePass rewards remain non-cryptocurrency
platform points unless separately approved.
