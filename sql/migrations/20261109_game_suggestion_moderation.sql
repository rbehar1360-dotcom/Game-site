BEGIN;

ALTER TABLE public.game_suggestions
    ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';

ALTER TABLE public.game_suggestions
    DROP CONSTRAINT IF EXISTS game_suggestions_status_check;

ALTER TABLE public.game_suggestions
    ADD CONSTRAINT game_suggestions_status_check
    CHECK (status IN ('pending', 'approved'));

CREATE OR REPLACE FUNCTION public.can_review_game_suggestions()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
    SELECT auth.uid() IS NOT NULL
       AND (
           COALESCE(public.is_admin(), false)
           OR EXISTS (
               SELECT 1
               FROM public.user_ranks
               WHERE user_id = auth.uid()
                 AND rank = 'MODERATOR'
           )
       );
$$;

CREATE OR REPLACE FUNCTION public.moderator_list_game_suggestions()
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
    SELECT to_jsonb(suggestion)
    FROM public.game_suggestions AS suggestion
    WHERE suggestion.status = 'pending'
    ORDER BY to_jsonb(suggestion)->>'created_at' DESC NULLS LAST;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_approved_game_suggestions()
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
    SELECT to_jsonb(suggestion)
    FROM public.game_suggestions AS suggestion
    WHERE suggestion.status = 'approved'
    ORDER BY to_jsonb(suggestion)->>'created_at' DESC NULLS LAST;
END;
$$;

CREATE OR REPLACE FUNCTION public.moderator_approve_game_suggestion(
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

    UPDATE public.game_suggestions AS suggestion
    SET status = 'approved'
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

CREATE OR REPLACE FUNCTION public.guard_game_suggestion_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        NEW.status := 'pending';
    ELSIF current_user IN ('anon', 'authenticated') THEN
        RAISE EXCEPTION 'Suggestion status can only be changed by moderators'
            USING ERRCODE = '42501';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS game_suggestions_guard_status
    ON public.game_suggestions;

CREATE TRIGGER game_suggestions_guard_status
    BEFORE INSERT OR UPDATE OF status
    ON public.game_suggestions
    FOR EACH ROW
    EXECUTE FUNCTION public.guard_game_suggestion_status();

REVOKE ALL ON FUNCTION public.can_review_game_suggestions() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.moderator_list_game_suggestions() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_list_approved_game_suggestions() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.moderator_approve_game_suggestion(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.moderator_delete_game_suggestion(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.guard_game_suggestion_status() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.can_review_game_suggestions() TO authenticated;
GRANT EXECUTE ON FUNCTION public.moderator_list_game_suggestions() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_approved_game_suggestions() TO authenticated;
GRANT EXECUTE ON FUNCTION public.moderator_approve_game_suggestion(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.moderator_delete_game_suggestion(text) TO authenticated;

COMMIT;
