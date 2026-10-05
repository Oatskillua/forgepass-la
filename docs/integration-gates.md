# Integration gates

Local build success is not evidence of production readiness.

## Dependency verification

The in-process rate limiter caps counters at 10,000, periodically removes expired
entries during requests, and rejects new keys at capacity without evicting active
quotas. Event searches permit 30 requests per minute per derived client address;
waitlist and feedback retain five each. Rejections include Retry-After. Tests
cover quota boundaries, cleanup, capacity, malformed header handling and endpoint
denial before further provider access. These counters are local to one process,
reset on restart and do not coordinate across serverless instances. Forwarded
addresses must come from trusted hosting infrastructure. Distributed/edge limits
and deployment-specific proxy validation remain release requirements.

The local production dependency audit reported zero vulnerabilities during this
implementation session. This covers the current lockfile and registry advisory
response, not development dependencies or undisclosed vulnerabilities.
`npm run check:release` combines the usual checks with this audit and is also the
CI entry point. Rerun it for the actual release candidate; audit results can change.

## Project configuration

Browser Supabase configuration has no hardcoded fallback. Missing settings,
invalid URL syntax, or client initialization failure display an unavailable
screen before Auth mounts. Development shows setup guidance; production does
not expose configuration details. Tests verify missing/invalid settings and
the startup guard. A passing build with no settings still generates this screen;
deployment must supply the intended project's values at build time. These checks
do not verify key validity or connectivity to the configured hosted project.

## Public intake export finding

Waitlist and feedback handlers now use one ten-second abort deadline for challenge
verification and database insertion, reject redirects, and return no-store
responses. Turnstile requires a boolean success value and a successful HTTP
response. Raw database error bodies and exception messages are not logged or
returned to visitors; insertion logs contain only HTTP status. Endpoint tests
exercise the real verification helper with mocked outbound requests, including
malformed verification, duplicate waitlist entries, timeouts at both stages and
absence of automatic retries. A timeout during insertion leaves the outcome
unknown. Feedback request idempotency, distributed rate limiting and actual
hosted challenge/database behavior remain outstanding.

The original repository tracked `public/forgepass-waitlist.csv`. Vite copied it
into dist and both native asset bundles. All four local copies were removed from
distributable directories, with recovery copies kept outside the repository.
A regression test rejects CSV/TSV and database dump files in public assets.
This does not remove the file from earlier Git commits, deployed sites, cached
responses, or previously distributed apps. Before deployment, review that history
and any live copies. No remote remediation or production exposure verification
has occurred here. No data contents are reproduced in this report.

Admin CSV exports neutralize formula-like cells and are GET-only. They paginate
with exact count checks, deterministic ID ordering and a fixed created-at cutoff.
Failures, duplicate IDs, changing counts, or oversized downloads produce errors,
not partial CSVs. Download limits are 10,000 records and 3.5 MB of CSV. These are
not database snapshots: edits or same-count insert/delete activity during an
export still require a managed snapshot export for strict consistency. Metrics
use HEAD requests with exact counts rather than counting a truncated response.

Administrator feedback status updates require an explicit successful API response.
Failures retain the current displayed status and expose refresh; concurrent status
submissions in the view are blocked. A 401/403 update response clears entries.
Component tests cover unconfirmed responses, access denial, retries, and locking.

Feedback PATCH requests now require the original displayed status. The database
update filters by both ID and original status, including legacy null values.
No matching row returns 409, and mismatched confirmations fail. This prevents
silent overwrite of a different current status; staging still needs two-browser
verification. Deploy the updated UI and API together; older clients that omit
the original status are rejected rather than performing unconditional updates.

Administrator waitlist loading supports refresh, rejects malformed list payloads,
and clears displayed entries before rechecking access. Requests bypass browser
cache and abort on cleanup. The view remounts on access-token changes, preventing
late responses from an earlier session from repopulating the table. Tests cover
malformed responses, denied refresh, and late old-session responses.

Admin metrics reject invalid counts and support refresh. CSV download controls
catch network/body failures, require a CSV content type, block overlapping
downloads, and cancel pending downloads on view cleanup. Tests verify malformed
metrics, non-CSV response rejection, successful download cleanup, and cancellation.
Browser download initiation is not proof that a user saved a file to disk.

## Account recovery

Allow the deployed `/auth/update-password` URL in Supabase Auth redirect settings.
Test a real recovery email, expired link, password update, and subsequent login
on a staging project before deploying. Unit tests mock Supabase; they do not
exercise delivery or hosted Auth settings.

## Database

Migration `202609210001_intake_foundation.sql` supplies fresh-install waitlist
and feedback tables, UUID identifiers, creation timestamps, field constraints,
case-insensitive waitlist email uniqueness and the feedback status default/list.
RLS is enabled with no client policies; public, anonymous and authenticated
table grants are revoked. Only the server service role receives CRUD grants.
Actual SQL tests cover server inserts, duplicate email rejection, feedback
constraints, client read/write denial and refusal to overwrite existing tables.
Existing hosted intake tables require a separate reviewed reconciliation; this
migration raises an error before changing them. No hosted schema was inspected
or migrated. Admin role checks and Turnstile remain API responsibilities.

Migration `202609200001_history_pagination_indexes.sql` adds account/timestamp/ID
indexes for notification and reward-history pagination. Embedded SQL tests cover
timestamp ties, new rows inserted between pages, and cross-account denial for
both histories. These are sequential database tests, not concurrent-connection
load tests. Index creation is transactional; review table sizes and plan an
appropriate migration window on an existing hosted database. Hosted query plans
and latency have not been measured.

Review migrations against the actual existing schema before applying them.
The third migration restricts notification updates to `read_at`; RLS alone only
restricts the rows that may be changed. Test as two distinct authenticated users
and an anonymous user. A user must not edit notification body, title or owner,
write reward balances, or read another user's private records.

Migrations execute in an embedded PostgreSQL (PGlite) test database with a minimal
Auth schema and Supabase-style grants. Tests cover RLS, notification column
permissions, administrator escalation denial, account backfill, profile deletion
denial, and itinerary reordering. This does not verify the hosted project's
existing schema, Auth service, PostgREST, or concurrent database connections.
The account backfill migration preserves existing profile and preference values.

The itinerary reordering migration adds a SECURITY INVOKER RPC. It locks the
owned trip and its stops, rejects a stale expected order, validates a complete
permutation, and updates positions in one transaction. The client changes display
order only after success. Staging tests must cover cross-user calls, anonymous
calls, duplicate/foreign/missing IDs, stale order, and concurrent edits. Component
tests mock this RPC; the separate database suite exercises actual SQL behavior.

Itinerary names and dates can be edited; dates can also be cleared. Updates compare the original
name and dates in the PATCH filter and require a returned row; stale or inaccessible
rows show an error while preserving the draft. Component tests cover saving,
canceling, validation, and failures. Client tests exercise the Supabase request
serialization, including nullable date filters. Verify two-browser edits against
hosted PostgREST before release; local checks are not hosted verification.

Stop notes support multiline editing, clearing, and canceling, with a 2,000-character
limit. Conditional updates compare the original notes and preserve failed drafts.
Local SQL tests verify ownership and the database length constraint. No additional
migration is needed for notes; hosted verification is still required.

Itineraries and saved content load independently, with separate retry controls.
A saved-content failure does not hide trips or reset editor drafts. Failed trip
loads are not displayed as empty accounts. Component tests cover repeated failure,
recovery, and preservation of drafts during retries.

Trip deletion requires a returned row before removing the trip from view.
Explicit refresh reconciles uncertain deletion outcomes without repeating the
delete request. Refresh preserves the displayed trips on failure and is disabled
while a trip or note editor is open, avoiding accidental loss of those edits.

## Saved content recovery

The events endpoint accepts GET only, validates scalar city/search/size inputs
(120/200 characters and 1–50 results), and applies an eight-second provider
timeout. It checks listing structure and HTTP(S) links, normalizes optional display
fields, and returns generic provider errors without echoing exception details.
Confirmed zero-result responses are distinguished from malformed data. The
mapping follows the [Ticketmaster Discovery API](https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/).
Tests cover invalid input, encoding, malformed/empty responses, URL safety,
credential-safe errors and abort handling. This does not establish hosted provider
availability or enforce distributed quota limits; deployment still needs provider
quota monitoring and abuse controls.

Event search supports numbered pages with previous/next controls. The endpoint
validates page inputs and requires `page * size < 1000`, following Ticketmaster's
documented deep-paging limit. Provider page metadata determines next-page access;
missing metadata does not imply another page exists. The UI resets pagination on
search changes, disables navigation while loading, retries failed pages and
prompts for a narrower search at the provider limit. Tests cover page forwarding,
limits, mismatched metadata, search resets and page-failure recovery. Provider
results can change between requests; pagination is not a snapshot of listings.

Discover place cards show persistent save confirmation, block repeat pending
submissions, and keep errors on the affected card. Card state resets when account
identity changes; anonymous visitors get a sign-in link. Tests cover save retry,
sign-out, and account switching during a pending save. These indicators reflect
confirmed saves in the current mounted view, not a lookup of all saved places.

Live event save errors stay on their cards without hiding search results. Pending
saves block duplicate submissions; saved indicators reset on account changes.
Event requests abort when searches are superseded and expose a retry control on
failure. Tests cover save retries, account isolation, anonymous sign-in links,
and malformed listing responses. Saved indicators reflect this view's confirmed
saves, not a complete lookup of previously saved events.

The Saved page supports loading retries and explicit refresh after an uncertain
deletion result. Removal requires a returned row, retains the item on failure,
and blocks duplicate submissions. The deletion helper accepts only favorites and
saved events. Component and client request tests cover these recovery paths.

## Alert read status

Alerts now expose loading, retry, and refresh states. Read actions apply only
returned database rows; the bulk action is explicitly limited to displayed
unread alerts (up to 100 per page), so unseen alerts are not marked read. Local
component/request tests cover partial results, failed updates, and retries.

Older alerts are reachable through timestamp-and-ID cursor pagination. New
arrivals do not shift the older-page boundary. Page failures preserve the current
list; Show latest alerts resets to the newest page. Tests verify cursor encoding,
stable ordering, retries, and page-scoped read actions. Hosted query performance
and concurrent insert/delete behavior still need staging verification.

## Account settings

Profile settings now save through `save_account_settings` in migration
`202609190005_account_settings.sql`. This invoker function uses the authenticated
user ID and atomically updates profile and notification preferences, rejecting
missing rows. Local SQL checks prove rollback when preferences are missing and
anonymous denial. Component tests cover loading failures, locked pending saves,
draft retention, and retries. Apply the migration before deploying this UI;
notification preferences do not by themselves enable a delivery pipeline.

## Account switching

Administrator access verification supports retry and rejects malformed metrics
responses. Verification state remounts on session-token changes; an earlier
session's response cannot authorize the new view. Administrator sign-in links
return to `/admin`, where access is checked again. Server authorization remains
mandatory on every administrator endpoint.

The authentication form locks fields and mode changes while a request is pending,
clears passwords when changing modes, and waits for initial session resolution.
Return destinations are restricted to known account pages. Component tests cover
reset request deduplication, signup validation, failed sign-in retry, and redirects.
These mocked flows do not verify hosted email delivery or Auth configuration.

Password updates lock inputs during submission and retain entries on failure.
The recovery form remounts on account identity changes, clearing password drafts
and ignoring prior-account UI completions. Expired-session recovery links open
the reset-request form directly. Tests cover retry and an account switch during
a pending update; already-sent requests are not canceled by this UI isolation.

The account dashboard provides count loading and retry states. Missing count
headers are errors, not zero totals. Sign-out handles returned and thrown errors
and blocks repeated requests while pending. Local tests cover these paths;
hosted Auth session termination still requires staging verification.

Protected account routes remount their contents when the authenticated user ID
changes, clearing component data and drafts. Token refresh for the same user ID
preserves drafts. Component tests cover itinerary account switching during a
pending save, sign-out, and same-account refresh. Verify actual cross-tab Auth
events in staging; this UI isolation does not replace database ownership policies
or cancel requests already sent by the previous session.

## Offline and native

`mobile:sync` now runs `mobile:check` before building or copying assets. The
preflight loads Vite production-mode settings and validates required remote HTTPS
origins and a nonempty public Supabase client key. It reports names and reasons,
not configuration values. Local execution correctly rejected this workspace's
four missing required settings. Syntax tests use synthetic values; no hosted
credentials or connectivity have been validated. This gate does not inspect
previously synced bundles or establish signed-build readiness.

The PWA update prompt applies updates only after an explicit reload action,
locks repeat requests, and shows a retryable error if applying the update fails.
Component tests cover this UI; a real waiting service worker, activation, and
browser reload still require browser verification across two deployed versions.

Route handoff caps optional stops at three for mobile-browser compatibility,
rejects encoded Google Maps URLs longer than 2,048 characters, and rejects pipe
characters inside stop names. These limits follow the
[Google Maps URL guide](https://developers.google.com/maps/documentation/urls/get-started).
The UI explains that rideshare handoff sends only the final destination from the
current location. Local tests cover stop limits, ordering, and oversized URL
recovery; actual route interpretation still requires provider/device testing.

The PWA caches application assets, not live event responses or account data.
API navigation is excluded from the SPA offline fallback. Verify in a browser
with network disabled; native wrappers are not proof of native functionality.
Native event, intake and administrator calls now use `VITE_API_ORIGIN` through
`apiFetch`; browser calls remain relative to the website. Native calls require
an HTTPS origin, omit cookies, reject redirects and preserve request cancellation
and explicit bearer headers. Server handlers support exact-origin CORS configured
through `API_ALLOWED_ORIGINS`, with method/header-checked preflights before auth.
Actual requests still run the existing authorization and validation checks.
Tests cover routing, missing settings, endpoint validation, preflight denial and
administrator denial after a permitted preflight. Actual device origins, hosted
preflights, Turnstile and native downloads remain unverified.
Native recovery links, signing, icons, and platform builds still need validation.

## Remaining implementation

Read-only itinerary sharing uses migration `202609200002_itinerary_sharing.sql`.
The owner explicitly enables sharing; enabling, replacing or disabling rotates
the token and rejects a stale expected token. The public RPC exposes only trip
name/dates and ordered stop titles/times. It excludes notes, owner IDs, snapshots
and other account data; underlying table ownership policies stay in place.
SQL tests cover anonymous reads, private/revoked links, rotation, stale updates,
cross-user mutation denial and the exact output fields. UI tests cover failed
updates, confirmed links, read retries and late responses after navigation.

Links use `/shared-trip#token`. The configured Vercel analytics URL and Sentry
request/breadcrumb URL hooks strip fragments; staging must inspect actual outbound
telemetry and host behavior. Revocation applies to subsequent reads and cannot
erase viewed or saved copies. Readers explicitly refresh to check for changes.
No email, message or invitation is sent by enabling a link. Links use
`VITE_PUBLIC_SITE_URL` when configured, otherwise the current browser origin.
Native packages require the configured HTTPS origin. Invalid or missing native
configuration prevents enabling/replacing links but does not block revocation.
Review pre-existing `is_public` rows before deploying the new read RPC.

Password-reset requests use the same website origin. Configuration failures stop
the request before sending email and preserve the address draft. Tests cover
canonical origins, native missing settings, malformed origins, recovery requests
and sharing revocation despite invalid configuration. This is browser-based
recovery, not native deep-link completion; verify real emails and device behavior.

Scheduled stops can be exported as a browser-generated `.ics` file with titles,
trip name, notes, and saved event venues. Unscheduled stops are explicitly omitted;
open editors block export. The format follows
[RFC 5545](https://www.rfc-editor.org/rfc/rfc5545), using UTC instants, stable stop
UIDs, escaped text, CRLF endings and UTF-8 byte-aware line folding. No duration,
attendee, invitation or reminder is created. Tests cover text injection, Unicode,
time conversion, failure recovery and download resource cleanup. Browser download
initiation is not proof of a saved file or successful import. Calendar-app imports
and native download behavior remain unverified. Reimport behavior varies by
calendar app; this is a snapshot export, not synchronization or public trip sharing.

Itinerary stops support setting, editing and clearing visit times using the
existing `starts_at` timestamp column. Inputs use the device time zone and save
an absolute instant; displays include the local zone. Invalid dates and skipped
daylight-saving times are rejected, while repeated hours use the earlier instant.
Conditional updates reject stale schedules and preserve failed drafts. Open
schedule editors block refresh and deletion of their trip/stop. These times do
not enforce trip date bounds, reorder stops, reserve admission or send reminders.
Hosted two-browser updates and device time-zone behavior still need verification.

Reward history supports older and latest pages of 50 transactions, ordered by
timestamp and ID. History reads share the wallet request lock and do not alter
balances, submit redemptions, or clear pending requests. Failed history reads
retain the current page. Tests cover cursor construction and browsing/retry;
hosted pagination and concurrent ledger inserts still need staging verification.

Rewards support explicit retry after initial wallet loading fails. Balance
refresh and redemption share a request lock; pending redemptions wait until the
initial read completes, preventing a late initial result from replacing a newer
balance. Tests cover failed initial loads and refresh with a persisted pending
request. Retrying a read never submits a redemption.

Rewards support transactional point redemption with an authenticated RPC,
inventory checks, price confirmation, and per-user request-key deduplication.
Embedded SQL tests cover retry behavior, insufficient balance, sold-out inventory,
price changes, anonymous access, and zero-point redemption. Pending request keys
are persisted per user in browser storage before submission and recovered after
reload. Storage failure blocks submission; an ambiguous response retains the key.
A confirmed receipt survives balance-refresh failure in the current view, and
new spending is disabled until the balance refreshes. Component tests cover these
paths. Clearing browser storage, simultaneous tabs, and multiple devices still
require reconciliation and staging verification; localStorage is not an atomic
cross-tab lock. Earning rules, catalog administration, and
partner fulfillment remain unfinished. A ledger receipt is not a fulfilled perk.
City Intelligence shows unavailable provider states, not
live feeds. Navigation hands off to external providers; no embedded map exists.
Itineraries now offer an editable directions preview using saved event venues
when available and stop titles otherwise. Numbered Google Maps routes preserve
the displayed stop order, with at most four destinations each and the previous
route's final stop as the next origin. Destination corrections are temporary;
changing the saved stop order resets the preview. Component tests cover venue
selection, corrections, route continuity, and invalid destination recovery.
Provider geocoding, mode support, and actual mobile handoff remain unverified;
travelers must confirm destinations and routes in Google Maps.
Admin endpoints now validate bearer sessions and require a database administrator
role. Provision roles only through a trusted server or database operator; users
cannot grant themselves a role. Validate denial and revocation in staging before
release. Existing shared access codes are no longer accepted.
The current tests do not cover all database or application flows.
