# Alpha Security Status

## Status

ForgePass LA alpha submission infrastructure is secured for controlled tester intake.

## Public Forms

### Waitlist

- Client-side Turnstile enabled
- Server-side Turnstile verification enabled
- Submissions routed through `/api/waitlist`
- Browser-to-Supabase direct insert removed
- Anonymous Supabase insert revoked
- Service-role backend insert enabled
- API rate limiting enabled
- Input validation centralized

### Feedback

- Client-side Turnstile enabled
- Server-side Turnstile verification enabled
- Submissions routed through `/api/feedback`
- Browser-to-Supabase direct insert removed
- Anonymous Supabase insert revoked
- Service-role backend insert enabled
- API rate limiting enabled
- Input validation centralized

## Admin Dashboard

- `/admin` gated by access code
- `/api/admin-metrics` requires `x-admin-access-code`
- Direct unauthenticated access returns `401`
- Metrics read through server-side service role
- Public SELECT remains blocked

## Monitoring

- Better Stack uptime checks enabled
- Sentry error monitoring verified
- Vercel Analytics enabled
- Vercel Speed Insights enabled
- Health and status routes active

## Supabase Security

- RLS enabled
- Public SELECT blocked
- Public INSERT revoked
- Server-side service role granted required INSERT/SELECT privileges
- Forms verified after anonymous permission removal

## Verified Production Results

- Waitlist production submit: PASS
- Feedback production submit: PASS
- Supabase rows inserted: PASS
- `/api/admin-metrics` unauthenticated request: 401 PASS
- Admin dashboard correct code unlock: PASS
- Wrong admin code remains locked: PASS

## Remaining Future Hardening

- Replace access-code admin gate with real authentication
- Add persistent distributed rate limiting
- Add audit log for admin metrics access
- Add automated smoke tests
- Add export/download tools for waitlist and feedback data