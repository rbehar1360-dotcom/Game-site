-- Begin coin-history tracking from the balances that exist when this migration runs.
-- Spending before this point cannot be reconstructed because no coin ledger existed.
BEGIN;

CREATE TABLE IF NOT EXISTS public.owner_coin_balance_events (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id uuid NOT NULL,
    delta bigint NOT NULL,
    event_type text NOT NULL CHECK (event_type IN ('baseline', 'balance_change')),
    recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS owner_coin_balance_events_one_baseline_per_user
    ON public.owner_coin_balance_events (user_id)
    WHERE event_type = 'baseline';

INSERT INTO public.owner_coin_balance_events (user_id, delta, event_type)
SELECT user_id, COALESCE(coins, 0)::bigint, 'baseline'
FROM public.user_coins
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.record_owner_coin_balance_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    event_user_id uuid;
    event_delta bigint;
BEGIN
    IF TG_OP = 'INSERT' THEN
        event_user_id := NEW.user_id;
        event_delta := COALESCE(NEW.coins, 0)::bigint;
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.coins IS NOT DISTINCT FROM OLD.coins THEN
            RETURN NEW;
        END IF;

        event_user_id := NEW.user_id;
        event_delta := COALESCE(NEW.coins, 0)::bigint - COALESCE(OLD.coins, 0)::bigint;
    ELSE
        event_user_id := OLD.user_id;
        event_delta := -COALESCE(OLD.coins, 0)::bigint;
    END IF;

    IF event_delta <> 0 THEN
        INSERT INTO public.owner_coin_balance_events (user_id, delta, event_type)
        VALUES (event_user_id, event_delta, 'balance_change');
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS owner_coin_balance_history_trigger ON public.user_coins;
CREATE TRIGGER owner_coin_balance_history_trigger
AFTER INSERT OR UPDATE OF coins OR DELETE
ON public.user_coins
FOR EACH ROW
EXECUTE FUNCTION public.record_owner_coin_balance_event();

CREATE OR REPLACE FUNCTION public.admin_get_coin_history_stats()
RETURNS TABLE (
    total_current_coins bigint,
    total_coins_ever bigint,
    total_coins_removed bigint,
    tracking_since timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
    IF NOT COALESCE(public.is_admin(), false) THEN
        RAISE EXCEPTION 'Admin access required'
            USING ERRCODE = '42501';
    END IF;

    RETURN QUERY
    SELECT
        COALESCE((
            SELECT SUM(coins)::bigint
            FROM public.user_coins
        ), 0),
        COALESCE((
            SELECT SUM(delta)::bigint
            FROM public.owner_coin_balance_events
            WHERE event_type = 'baseline'
               OR (event_type = 'balance_change' AND delta > 0)
        ), 0),
        COALESCE((
            SELECT SUM(-delta)::bigint
            FROM public.owner_coin_balance_events
            WHERE event_type = 'balance_change' AND delta < 0
        ), 0),
        (
            SELECT MIN(recorded_at)
            FROM public.owner_coin_balance_events
        );
END;
$$;

ALTER TABLE public.owner_coin_balance_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.owner_coin_balance_events FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.record_owner_coin_balance_event() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_get_coin_history_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_get_coin_history_stats() TO authenticated;

COMMIT;
