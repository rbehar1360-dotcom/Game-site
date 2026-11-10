BEGIN;

CREATE OR REPLACE FUNCTION public.admin_delete_approved_game_suggestion(
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
    IF auth.uid() IS NULL OR NOT COALESCE(public.is_admin(), false) THEN
        RAISE EXCEPTION 'Owner access required'
            USING ERRCODE = '42501';
    END IF;

    IF NULLIF(btrim(target_suggestion_id), '') IS NULL THEN
        RAISE EXCEPTION 'A suggestion ID is required'
            USING ERRCODE = '22023';
    END IF;

    DELETE FROM public.game_suggestions AS suggestion
    WHERE to_jsonb(suggestion)->>'id' = target_suggestion_id
      AND suggestion.status = 'approved';

    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    IF affected_rows = 0 THEN
        RAISE EXCEPTION 'Approved suggestion not found'
            USING ERRCODE = '22023';
    END IF;

    RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_forwarded_game_issue_report(
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
    IF auth.uid() IS NULL OR NOT COALESCE(public.is_admin(), false) THEN
        RAISE EXCEPTION 'Owner access required'
            USING ERRCODE = '42501';
    END IF;

    IF target_report_id IS NULL THEN
        RAISE EXCEPTION 'A report ID is required'
            USING ERRCODE = '22023';
    END IF;

    DELETE FROM public.game_issue_reports
    WHERE id = target_report_id
      AND status = 'forwarded';

    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    IF affected_rows = 0 THEN
        RAISE EXCEPTION 'Forwarded game report not found'
            USING ERRCODE = '22023';
    END IF;

    RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_delete_approved_game_suggestion(text)
    FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_delete_forwarded_game_issue_report(uuid)
    FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.admin_delete_approved_game_suggestion(text)
    TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_forwarded_game_issue_report(uuid)
    TO authenticated;

COMMIT;
