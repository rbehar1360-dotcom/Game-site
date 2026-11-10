BEGIN;

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
    SELECT jsonb_set(
        to_jsonb(suggestion),
        '{username}',
        to_jsonb(COALESCE(
            NULLIF(btrim(player.raw_user_meta_data->>'username'), ''),
            NULLIF(btrim(player.raw_user_meta_data->>'display_name'), ''),
            CASE
                WHEN suggestion.user_id IS NULL THEN 'Guest'
                ELSE 'Player'
            END
        )),
        true
    )
    FROM public.game_suggestions AS suggestion
    LEFT JOIN auth.users AS player
        ON player.id = suggestion.user_id
    WHERE suggestion.status = 'pending'
    ORDER BY to_jsonb(suggestion)->>'created_at' DESC NULLS LAST;
END;
$$;

COMMIT;
