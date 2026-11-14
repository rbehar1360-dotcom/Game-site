BEGIN;

CREATE OR REPLACE FUNCTION public.admin_list_user_details()
RETURNS TABLE (
    user_id uuid,
    created_at timestamptz,
    is_verified boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
    IF auth.uid() IS NULL OR NOT COALESCE(public.is_admin(), false) THEN
        RAISE EXCEPTION 'Owner access required'
            USING ERRCODE = '42501';
    END IF;

    RETURN QUERY
    SELECT
        users.id,
        users.created_at,
        users.email_confirmed_at IS NOT NULL
    FROM auth.users AS users;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_give_coins_to_users(
    target_user_ids uuid[],
    amount integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    affected_users integer;
BEGIN
    IF auth.uid() IS NULL OR NOT COALESCE(public.is_admin(), false) THEN
        RAISE EXCEPTION 'Owner access required'
            USING ERRCODE = '42501';
    END IF;

    IF amount IS NULL OR amount <= 0 THEN
        RAISE EXCEPTION 'Coin amount must be a positive integer'
            USING ERRCODE = '22023';
    END IF;

    INSERT INTO public.user_coins AS balance (user_id, coins)
    SELECT users.id, amount
    FROM auth.users AS users
    WHERE users.id = ANY(COALESCE(target_user_ids, ARRAY[]::uuid[]))
    ON CONFLICT (user_id)
    DO UPDATE
    SET coins = COALESCE(balance.coins, 0) + EXCLUDED.coins;

    GET DIAGNOSTICS affected_users = ROW_COUNT;
    RETURN affected_users;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_user_details() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_give_coins_to_users(uuid[], integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_user_details() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_give_coins_to_users(uuid[], integer) TO authenticated;

COMMIT;
