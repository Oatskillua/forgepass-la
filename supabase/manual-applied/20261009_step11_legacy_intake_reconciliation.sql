-- ForgePass LA - Step 11 / legacy intake reconciliation
-- Derived from hosted inspection (2026-10-09) and recovery-branch fresh-install schema.
-- Execute ONCE in the intended Supabase project AFTER a verified backup.
-- Do NOT execute 202609210001_intake_foundation.sql against existing tables.
-- Store this as a new reviewed, versioned migration in the recovery branch.

BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';

-- Lock during preflight and DDL to avoid newly inserted incompatible rows.
-- On this small database, the lock should be brief; a busy database may hit lock_timeout.
LOCK TABLE public.waitlist, public.feedback IN ACCESS EXCLUSIVE MODE;

-- Abort atomically if the hosted data is no longer compatible.
DO $preflight$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.waitlist
    WHERE name IS NULL OR city IS NULL OR interest IS NULL OR created_at IS NULL
       OR email IS NULL
       OR char_length(name) > 100
       OR char_length(city) > 100
       OR char_length(interest) > 50
       OR char_length(email) > 255
       OR email !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
  ) THEN
    RAISE EXCEPTION 'Waitlist data fails reconciliation preflight. No changes committed.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.waitlist
    GROUP BY lower(email)
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'Case-insensitive duplicate waitlist emails found. No changes committed.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.feedback
    WHERE name IS NULL OR email IS NULL OR category IS NULL
       OR message IS NULL OR status IS NULL OR created_at IS NULL
       OR char_length(btrim(name)) NOT BETWEEN 1 AND 100
       OR char_length(email) > 255
       OR email !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
       OR char_length(category) > 50
       OR char_length(btrim(message)) NOT BETWEEN 1 AND 5000
       OR status NOT IN ('new','reviewed','planned','completed','dismissed')
  ) THEN
    RAISE EXCEPTION 'Feedback data fails reconciliation preflight. No changes committed.';
  END IF;
END;
$preflight$;

-- Preserve all rows and IDs. Align nullable legacy fields and defaults.
ALTER TABLE public.waitlist
  ALTER COLUMN name SET DEFAULT '',
  ALTER COLUMN name SET NOT NULL,
  ALTER COLUMN city SET DEFAULT '',
  ALTER COLUMN city SET NOT NULL,
  ALTER COLUMN interest SET DEFAULT '',
  ALTER COLUMN interest SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE public.feedback
  ALTER COLUMN category SET DEFAULT '',
  ALTER COLUMN status SET DEFAULT 'new';

-- Align database-side validation with the fresh-install schema.
ALTER TABLE public.waitlist
  ADD CONSTRAINT waitlist_name_length_chk CHECK (char_length(name) <= 100),
  ADD CONSTRAINT waitlist_email_valid_chk CHECK (
    char_length(email) <= 255
    AND email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
  ),
  ADD CONSTRAINT waitlist_city_length_chk CHECK (char_length(city) <= 100),
  ADD CONSTRAINT waitlist_interest_length_chk CHECK (char_length(interest) <= 50);

ALTER TABLE public.feedback
  ADD CONSTRAINT feedback_name_valid_chk CHECK (char_length(btrim(name)) BETWEEN 1 AND 100),
  ADD CONSTRAINT feedback_email_valid_chk CHECK (
    char_length(email) <= 255
    AND email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
  ),
  ADD CONSTRAINT feedback_category_length_chk CHECK (char_length(category) <= 50),
  ADD CONSTRAINT feedback_message_valid_chk CHECK (char_length(btrim(message)) BETWEEN 1 AND 5000),
  ADD CONSTRAINT feedback_status_valid_chk CHECK (
    status IN ('new','reviewed','planned','completed','dismissed')
  );

-- Keep the existing UNIQUE(email) constraint for continuity;
-- add the stronger case-insensitive uniqueness rule separately.
CREATE UNIQUE INDEX waitlist_email_unique_idx ON public.waitlist (lower(email));
CREATE INDEX waitlist_created_idx ON public.waitlist (created_at DESC, id DESC);
CREATE INDEX feedback_created_idx ON public.feedback (created_at DESC, id DESC);

-- Server-only intake: remove legacy anonymous policies and excessive grants.
DROP POLICY IF EXISTS "Public can insert waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Public can insert feedback" ON public.feedback;

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE public.waitlist, public.feedback
  FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.waitlist, public.feedback
  TO service_role;

-- Fail closed if unexpected access policies remain, or client privileges survived.
DO $verify_security$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename IN ('waitlist', 'feedback')
  ) THEN
    RAISE EXCEPTION 'Unexpected intake RLS policies remain. No changes committed.';
  END IF;
  IF has_table_privilege('anon', 'public.waitlist', 'SELECT')
     OR has_table_privilege('anon', 'public.waitlist', 'INSERT')
     OR has_table_privilege('anon', 'public.waitlist', 'TRUNCATE')
     OR has_table_privilege('anon', 'public.feedback', 'SELECT')
     OR has_table_privilege('anon', 'public.feedback', 'INSERT')
     OR has_table_privilege('anon', 'public.feedback', 'TRUNCATE')
     OR has_table_privilege('authenticated', 'public.waitlist', 'SELECT')
     OR has_table_privilege('authenticated', 'public.waitlist', 'INSERT')
     OR has_table_privilege('authenticated', 'public.waitlist', 'TRUNCATE')
     OR has_table_privilege('authenticated', 'public.feedback', 'SELECT')
     OR has_table_privilege('authenticated', 'public.feedback', 'INSERT')
     OR has_table_privilege('authenticated', 'public.feedback', 'TRUNCATE')
  THEN
    RAISE EXCEPTION 'Intake client privileges remain after REVOKE. No changes committed.';
  END IF;
END;
$verify_security$;

COMMIT;
