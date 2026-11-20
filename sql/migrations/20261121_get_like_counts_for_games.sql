CREATE OR REPLACE FUNCTION public.get_like_counts_for_games(
    p_game_ids text[]
)
RETURNS TABLE (
    game_id text,
    like_count bigint
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
    SELECT likes.game_id, COUNT(*)::bigint
    FROM public.likes
    WHERE likes.game_id = ANY (p_game_ids)
    GROUP BY likes.game_id;
$$;

REVOKE ALL ON FUNCTION public.get_like_counts_for_games(text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_like_counts_for_games(text[]) TO anon, authenticated;
