-- ForgePass LA: allow server-side administrator role verification.
-- Safe/idempotent on fresh installs; already applied manually to hosted Supabase
-- on 2026-10-09. Does NOT create or assign any administrator users.
BEGIN;
GRANT SELECT ON TABLE public.admin_roles TO service_role;
COMMIT;
