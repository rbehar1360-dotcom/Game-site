-- Apply after 20261119_moderator_self_review_and_delete_audit.sql.
BEGIN;

CREATE OR REPLACE FUNCTION public.moderator_delete_game_suggestion(
    target_suggestion_id text
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

    IF NULLIF(btrim(target_suggestion_id), '') IS NULL THEN
        RAISE EXCEPTION 'A suggestion ID is required'
            USING ERRCODE = '22023';
    END IF;

    IF NOT COALESCE(public.is_admin(), false) AND EXISTS (
        SELECT 1
        FROM public.game_suggestions AS suggestion
        WHERE to_jsonb(suggestion)->>'id' = target_suggestion_id
          AND suggestion.status = 'pending'
          AND suggestion.user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Moderators cannot delete their own suggestions'
            USING ERRCODE = '42501';
    END IF;

    DELETE FROM public.game_suggestions AS suggestion
    WHERE to_jsonb(suggestion)->>'id' = target_suggestion_id
      AND suggestion.status = 'pending';

    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    IF affected_rows = 0 THEN
        RAISE EXCEPTION 'Pending suggestion not found'
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

    IF NOT COALESCE(public.is_admin(), false) AND EXISTS (
        SELECT 1
        FROM public.game_issue_reports AS report
        WHERE report.id = target_report_id
          AND report.status = 'pending'
          AND report.user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Moderators cannot delete their own reports'
            USING ERRCODE = '42501';
    END IF;

    DELETE FROM public.game_issue_reports AS report
    WHERE report.id = target_report_id
      AND report.status = 'pending';

    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    IF affected_rows = 0 THEN
        RAISE EXCEPTION 'Pending game report not found'
            USING ERRCODE = '22023';
    END IF;

    RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.moderator_delete_game_suggestion(text)
    FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.moderator_delete_game_issue_report(uuid)
    FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.moderator_delete_game_suggestion(text)
    TO authenticated;
GRANT EXECUTE ON FUNCTION public.moderator_delete_game_issue_report(uuid)
    TO authenticated;

COMMIT;
