# Alpha Smoke Test Checklist

## Purpose

Use this checklist after every production deployment before inviting or notifying testers.

## Homepage

- [ ] Homepage loads
- [ ] Navigation works
- [ ] Footer links work
- [ ] No console errors

## Waitlist

- [ ] Turnstile loads
- [ ] Valid waitlist submission succeeds
- [ ] Row appears in Supabase
- [ ] Duplicate email returns duplicate message
- [ ] Network uses `/api/waitlist`
- [ ] No direct `/rest/v1/waitlist` request appears

## Feedback

- [ ] Turnstile loads
- [ ] Valid feedback submission succeeds
- [ ] Row appears in Supabase
- [ ] Network uses `/api/feedback`
- [ ] No direct `/rest/v1/feedback` request appears

## Admin

- [ ] `/admin` loads locked
- [ ] Wrong code fails
- [ ] Correct code unlocks
- [ ] Metrics load
- [ ] Direct `/api/admin-metrics` without header returns `401`

## Monitoring

- [ ] Better Stack shows homepage up
- [ ] Better Stack shows status page up
- [ ] Better Stack shows health route up
- [ ] Sentry receives manual test if needed
- [ ] Vercel deployment is production and latest commit

## Supabase

- [ ] Waitlist row count increased after test
- [ ] Feedback row count increased after test
- [ ] Anonymous insert remains revoked
- [ ] Public select remains blocked

## Deployment Result

- [ ] PASS
- [ ] FAIL

## Notes

Record any issue, failed route, failed form, console error, or monitoring alert.