# ForgePass LA — Step 11 Manual SQL Archive (2026-10-09)

This directory records SQL **already applied manually** to the hosted Supabase project through SQL Editor. It is **not** a Supabase CLI migration directory and is intentionally outside `supabase/migrations/`.

## What was applied

- `20261009_step11_legacy_intake_reconciliation.sql` — original data-preserving legacy intake reconciliation. **Historical record: DO NOT reapply to production.** The script uses unconditional `ADD CONSTRAINT` and `CREATE INDEX` and is not safe to rerun unchanged.
- Additional manual production fix, after testing admin login: `GRANT SELECT ON TABLE public.admin_roles TO service_role;` The equivalent idempotent grant is kept in the regular migrations folder as `202610090001_admin_roles_service_select.sql` for a future managed/migrated installation.
- A single intended ForgePass account was granted `administrator` in `public.admin_roles` manually, after verifying its Auth UID. This is **environment-specific administrator provisioning**, not a schema migration. Do not put any user's UUID or email address in Git.

## Verified hosted outcomes

- Local `pg_restore` completed with exit code 0; restored original 12 waitlist and 5 feedback rows. Private dump stored outside repository.
- Hosted reconciliation retained all 17 pre-existing rows; RLS active, no intake policies, client table permissions denied, service-role CRUD allowed. Indexes, constraints, column defaults verified.
- Public protected APIs accepted new waitlist and feedback submissions, resulting in 13 waitlist and 6 feedback entries at the checkpoint.
- Admin UI authentication was initially 401 because the service role lacked SELECT on `admin_roles`; after the specific grant, admin dashboard, data views, status updates, and CSV exports passed.
- Anonymous and signed-in non-admin access to tested admin routes was denied; no-bearer CSV download attempts were denied.

## Migration history caveat

`SELECT to_regclass('supabase_migrations.schema_migrations')` returned NULL in the SQL Editor on the hosted project as of this checkpoint. Therefore the hosted database's manual SQL state is not confirmed as registered in Supabase CLI migration history. **Do not run `supabase db push` or automatically replay all local migrations on the hosted database until history and actual applied schema have been reconciled.** In particular, `supabase/migrations/202609210001_intake_foundation.sql` intentionally rejects legacy intake tables.

## Pending follow-up

- Reconcile other manually applied hosted migrations with future CLI migration history safely.
- Investigate Cloudflare Turnstile differences between the custom domain (working) and Vercel Preview URL (blocked).
- Finish broader Gate 4 integration and Gate 5 production verification.

No customer names, emails, tokens or passwords should be committed to this repository.
