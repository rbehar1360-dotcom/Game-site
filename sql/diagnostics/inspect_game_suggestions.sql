-- Read-only diagnostics for the Owner Panel game suggestions query.
-- Run each query in the Supabase SQL Editor. These queries do not return
-- suggestion text, user IDs, credentials, or other user record contents.

-- 1. Confirm the table exists and inspect its column names and data types.
SELECT
    table_schema,
    table_name,
    ordinal_position,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'game_suggestions'
ORDER BY ordinal_position;

-- 2. Count stored suggestions. The SQL Editor may bypass RLS; compare this
-- count with what the Owner Panel shows while signed in as the owner.
SELECT COUNT(*) AS total_suggestions
FROM public.game_suggestions;

-- 3. Inspect row-level security status and policies for this table.
SELECT
    c.relname AS table_name,
    c.relrowsecurity AS rls_enabled,
    c.relforcerowsecurity AS rls_forced
FROM pg_class AS c
JOIN pg_namespace AS n
    ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname = 'game_suggestions';

SELECT
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'game_suggestions'
ORDER BY policyname;

-- 4. Inspect the existing admin RPC signatures without exposing user data.
SELECT
    p.proname AS function_name,
    pg_get_function_identity_arguments(p.oid) AS arguments,
    pg_get_function_result(p.oid) AS result_type,
    p.prosecdef AS security_definer
FROM pg_proc AS p
JOIN pg_namespace AS n
    ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('is_admin', 'admin_list_users')
ORDER BY p.proname;
