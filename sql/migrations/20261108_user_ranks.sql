BEGIN;

CREATE TABLE IF NOT EXISTS public.user_ranks (
    user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    rank text NOT NULL CHECK (rank IN ('OWNER', 'MODERATOR')),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_ranks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_ranks_public_read ON public.user_ranks;
CREATE POLICY user_ranks_public_read
    ON public.user_ranks
    FOR SELECT
    TO anon, authenticated
    USING (true);

REVOKE ALL ON TABLE public.user_ranks FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.user_ranks TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_sync_owner_rank()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    current_user_id uuid := auth.uid();
BEGIN
    IF current_user_id IS NULL OR NOT COALESCE(public.is_admin(), false) THEN
        RAISE EXCEPTION 'Owner access required'
            USING ERRCODE = '42501';
    END IF;

    INSERT INTO public.user_ranks (user_id, rank, updated_at)
    VALUES (current_user_id, 'OWNER', now())
    ON CONFLICT (user_id)
    DO UPDATE SET rank = 'OWNER', updated_at = now();

    RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_user_rank(
    target_user_id uuid,
    new_rank text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    normalized_rank text := upper(btrim(COALESCE(new_rank, '')));
BEGIN
    IF auth.uid() IS NULL OR NOT COALESCE(public.is_admin(), false) THEN
        RAISE EXCEPTION 'Owner access required'
            USING ERRCODE = '42501';
    END IF;

    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'A target user is required'
            USING ERRCODE = '22023';
    END IF;

    IF normalized_rank NOT IN ('', 'NONE', 'MODERATOR') THEN
        RAISE EXCEPTION 'Only the MODERATOR rank can be assigned manually'
            USING ERRCODE = '22023';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.user_ranks
        WHERE user_id = target_user_id
          AND rank = 'OWNER'
    ) THEN
        RAISE EXCEPTION 'The OWNER rank is assigned automatically'
            USING ERRCODE = '42501';
    END IF;

    IF normalized_rank = 'MODERATOR' THEN
        INSERT INTO public.user_ranks (user_id, rank, updated_at)
        VALUES (target_user_id, 'MODERATOR', now())
        ON CONFLICT (user_id)
        DO UPDATE SET rank = 'MODERATOR', updated_at = now();
    ELSE
        DELETE FROM public.user_ranks
        WHERE user_id = target_user_id
          AND rank = 'MODERATOR';
    END IF;

    RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_sync_owner_rank() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_set_user_rank(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_sync_owner_rank() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_user_rank(uuid, text) TO authenticated;

COMMIT;
