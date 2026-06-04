# Turnstile Server Verification Plan

## Goal

Move waitlist and feedback submissions away from direct browser-to-Supabase inserts and into server-side verified submission endpoints.

## Current State

- Turnstile widget is active on WaitlistForm.
- Turnstile widget is active on FeedbackForm.
- Browser checks that a token exists before submit.
- Supabase RLS allows anon insert into waitlist and feedback.

## Limitation

Frontend-only Turnstile can be bypassed by direct API calls to Supabase.

## Target Architecture

1. User completes form.
2. User receives Turnstile token.
3. Frontend sends form data + token to a Vercel API route.
4. API route verifies token with Cloudflare Siteverify.
5. If valid, API route inserts into Supabase using server-side credentials.
6. If invalid, request is rejected.

## Required Environment Variables

Frontend:
- VITE_TURNSTILE_SITE_KEY

Server only:
- TURNSTILE_SECRET_KEY
- SUPABASE_SERVICE_ROLE_KEY

## Important Security Rules

- Never expose TURNSTILE_SECRET_KEY client-side.
- Never expose SUPABASE_SERVICE_ROLE_KEY client-side.
- Remove direct anon insert policies once server routes are active.
- Keep SELECT blocked for public users.
- Validate all payload fields server-side.
- Rate-limit submission endpoints later.

## Target Endpoints

- /api/waitlist
- /api/feedback

## Migration Steps

1. Create API endpoint for waitlist.
2. Verify Turnstile token server-side.
3. Insert waitlist row server-side.
4. Update WaitlistForm to call /api/waitlist.
5. Repeat for feedback.
6. Remove public anon insert policies.
7. Retest:
   - valid submission works
   - invalid token fails
   - duplicate email still handled
   - public SELECT remains blocked
   - direct Supabase insert fails

## Status

Planned.