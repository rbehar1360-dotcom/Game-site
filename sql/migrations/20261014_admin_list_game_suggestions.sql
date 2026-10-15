-- Allow verified admins to view game suggestions without opening table reads
-- to anon or authenticated users generally.
BEGIN;

CREATE OR REPLACE FUNCTION public.admin_list_game_suggestions()
RETURNS TABLE (
    id bigint,
    game_name text,
    game_url text,
    reason text,
    user_id uuid,
    created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
BEGIN
    IF NOT COALESCE(public.is_admin(), false) THEN
        RAISE EXCEPTION 'Not authorized to view game suggestions'
            USING ERRCODE = '42501';
    END IF;

    RETURN QUERY
    SELECT
        suggestion.id,
        suggestion.game_name,
        suggestion.game_url,
        suggestion.reason,
        suggestion.user_id,
        suggestion.created_at
    FROM public.game_suggestions AS suggestion
    ORDER BY suggestion.created_at DESC, suggestion.id DESC;
END;
$function$;

REVOKE ALL ON FUNCTION public.admin_list_game_suggestions()
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_game_suggestions()
    TO authenticated;

COMMIT;
