BEGIN;

CREATE INDEX IF NOT EXISTS game_suggestions_user_id_idx
    ON public.game_suggestions (user_id)
    WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS game_issue_reports_user_id_idx
    ON public.game_issue_reports (user_id)
    WHERE user_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.admin_list_ranked_user_contributions()
RETURNS TABLE (
    user_id uuid,
    username text,
    rank text,
    suggestions_submitted bigint,
    issues_reported bigint
)
LANGUAGE plpgsql
STABLE
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
        ranked_user.user_id,
        COALESCE(
            NULLIF(btrim(account.raw_user_meta_data->>'username'), ''),
            NULLIF(btrim(account.raw_user_meta_data->>'display_name'), ''),
            'Player'
        )::text,
        ranked_user.rank,
        (
            SELECT count(*)
            FROM public.game_suggestions AS suggestion
            WHERE suggestion.user_id = ranked_user.user_id
        ),
        (
            SELECT count(*)
            FROM public.game_issue_reports AS report
            WHERE report.user_id = ranked_user.user_id
        )
    FROM public.user_ranks AS ranked_user
    JOIN auth.users AS account
        ON account.id = ranked_user.user_id
    ORDER BY
        ranked_user.rank,
        lower(COALESCE(
            NULLIF(btrim(account.raw_user_meta_data->>'username'), ''),
            NULLIF(btrim(account.raw_user_meta_data->>'display_name'), ''),
            'Player'
        )),
        ranked_user.user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_ranked_user_contributions()
    FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_ranked_user_contributions()
    TO authenticated;

COMMIT;
