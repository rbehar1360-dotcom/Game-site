BEGIN;

CREATE TABLE IF NOT EXISTS public.game_issue_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    game_name text NOT NULL CHECK (char_length(btrim(game_name)) BETWEEN 1 AND 120),
    game_url text NOT NULL CHECK (char_length(game_url) BETWEEN 1 AND 2048),
    report_text text NOT NULL CHECK (char_length(btrim(report_text)) BETWEEN 10 AND 1500),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    status text NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'forwarded')),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS game_issue_reports_status_created_at_idx
    ON public.game_issue_reports (status, created_at DESC);

ALTER TABLE public.game_issue_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS game_issue_reports_submit
    ON public.game_issue_reports;

CREATE POLICY game_issue_reports_submit
    ON public.game_issue_reports
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        status = 'pending'
        AND (
            (auth.uid() IS NULL AND user_id IS NULL)
            OR user_id = auth.uid()
        )
    );

CREATE OR REPLACE FUNCTION public.moderator_list_game_issue_reports()
RETURNS SETOF jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
    IF NOT COALESCE(public.can_review_game_suggestions(), false) THEN
        RAISE EXCEPTION 'Moderator access required'
            USING ERRCODE = '42501';
    END IF;

    RETURN QUERY
    SELECT jsonb_set(
        to_jsonb(report),
        '{username}',
        to_jsonb(COALESCE(
            NULLIF(btrim(player.raw_user_meta_data->>'username'), ''),
            NULLIF(btrim(player.raw_user_meta_data->>'display_name'), ''),
            CASE
                WHEN report.user_id IS NULL THEN 'Guest'
                ELSE 'Player'
            END
        )),
        true
    )
    FROM public.game_issue_reports AS report
    LEFT JOIN auth.users AS player
        ON player.id = report.user_id
    WHERE report.status = 'pending'
    ORDER BY report.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_forwarded_game_issue_reports()
RETURNS SETOF jsonb
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
    SELECT jsonb_set(
        to_jsonb(report),
        '{username}',
        to_jsonb(COALESCE(
            NULLIF(btrim(player.raw_user_meta_data->>'username'), ''),
            NULLIF(btrim(player.raw_user_meta_data->>'display_name'), ''),
            CASE
                WHEN report.user_id IS NULL THEN 'Guest'
                ELSE 'Player'
            END
        )),
        true
    )
    FROM public.game_issue_reports AS report
    LEFT JOIN auth.users AS player
        ON player.id = report.user_id
    WHERE report.status = 'forwarded'
    ORDER BY report.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.moderator_forward_game_issue_report(
    target_report_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    affected_rows integer;
BEGIN
    IF NOT COALESCE(public.can_review_game_suggestions(), false) THEN
        RAISE EXCEPTION 'Moderator access required'
            USING ERRCODE = '42501';
    END IF;

    IF target_report_id IS NULL THEN
        RAISE EXCEPTION 'A report ID is required'
            USING ERRCODE = '22023';
    END IF;

    UPDATE public.game_issue_reports
    SET status = 'forwarded'
    WHERE id = target_report_id
      AND status = 'pending';

    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    IF affected_rows = 0 THEN
        RAISE EXCEPTION 'Pending game report not found'
            USING ERRCODE = '22023';
    END IF;

    RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.moderator_delete_game_issue_report(
    target_report_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    affected_rows integer;
BEGIN
    IF NOT COALESCE(public.can_review_game_suggestions(), false) THEN
        RAISE EXCEPTION 'Moderator access required'
            USING ERRCODE = '42501';
    END IF;

    IF target_report_id IS NULL THEN
        RAISE EXCEPTION 'A report ID is required'
            USING ERRCODE = '22023';
    END IF;

    DELETE FROM public.game_issue_reports
    WHERE id = target_report_id
      AND status = 'pending';

    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    IF affected_rows = 0 THEN
        RAISE EXCEPTION 'Pending game report not found'
            USING ERRCODE = '22023';
    END IF;

    RETURN true;
END;
$$;

REVOKE ALL ON TABLE public.game_issue_reports FROM PUBLIC, anon, authenticated;
GRANT INSERT (game_name, game_url, report_text, user_id)
    ON TABLE public.game_issue_reports TO anon, authenticated;

REVOKE ALL ON FUNCTION public.moderator_list_game_issue_reports() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_list_forwarded_game_issue_reports() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.moderator_forward_game_issue_report(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.moderator_delete_game_issue_report(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.moderator_list_game_issue_reports() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_forwarded_game_issue_reports() TO authenticated;
GRANT EXECUTE ON FUNCTION public.moderator_forward_game_issue_report(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.moderator_delete_game_issue_report(uuid) TO authenticated;

COMMIT;
