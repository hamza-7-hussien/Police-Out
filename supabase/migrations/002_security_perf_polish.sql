BEGIN;

-- Covering indexes for all foreign keys (zero Performance Advisor warnings)
CREATE INDEX IF NOT EXISTS idx_daily_scores_level_id ON public.daily_scores (level_id);
CREATE INDEX IF NOT EXISTS idx_daily_scores_user_id ON public.daily_scores (user_id);
CREATE INDEX IF NOT EXISTS idx_stage_progress_level_id ON public.stage_progress (level_id);

-- InitPlan-optimized RLS policies ((SELECT auth.uid()) evaluated once per statement)
DROP POLICY IF EXISTS profiles_owner_read ON public.profiles;
CREATE POLICY profiles_owner_read ON public.profiles FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS stage_progress_owner_read ON public.stage_progress;
CREATE POLICY stage_progress_owner_read ON public.stage_progress FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS leaderboard_auth_read ON public.leaderboard;
CREATE POLICY leaderboard_auth_read ON public.leaderboard FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS daily_scores_auth_read ON public.daily_scores;
CREATE POLICY daily_scores_auth_read ON public.daily_scores FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);

-- Switch read-only paginated leaderboard RPCs to SECURITY INVOKER (pure RLS enforcement)
CREATE OR REPLACE FUNCTION public.get_leaderboard_page(
  p_offset int DEFAULT 0,
  p_limit int DEFAULT 20
)
RETURNS TABLE(
  uid uuid,
  display_name text,
  photo_url text,
  solved_count smallint,
  total_stars smallint,
  achievements_count smallint,
  daily_streak integer
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_limit int := GREATEST(1, LEAST(20, COALESCE(p_limit, 20)));
  v_offset int := GREATEST(0, COALESCE(p_offset, 0));
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED';
  END IF;

  RETURN QUERY
  SELECT l.uid, l.display_name, l.photo_url, l.solved_count, l.total_stars, l.achievements_count, l.daily_streak
  FROM public.leaderboard l
  ORDER BY l.total_stars DESC, l.solved_count DESC, l.updated_at ASC
  LIMIT v_limit + 1
  OFFSET v_offset;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_daily_leaderboard_page(
  p_date_key text,
  p_offset int DEFAULT 0,
  p_limit int DEFAULT 20
)
RETURNS TABLE(
  user_id uuid,
  date_key text,
  level_id smallint,
  display_name text,
  photo_url text,
  moves smallint,
  time_seconds integer,
  stars smallint
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_limit int := GREATEST(1, LEAST(20, COALESCE(p_limit, 20)));
  v_offset int := GREATEST(0, COALESCE(p_offset, 0));
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED';
  END IF;

  IF p_date_key !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN
    RAISE EXCEPTION 'INVALID_DATE_KEY';
  END IF;

  RETURN QUERY
  SELECT d.user_id, d.date_key, d.level_id, d.display_name, d.photo_url, d.moves, d.time_seconds, d.stars
  FROM public.daily_scores d
  WHERE d.date_key = p_date_key
  ORDER BY d.moves ASC, d.time_seconds ASC, d.updated_at ASC
  LIMIT v_limit + 1
  OFFSET v_offset;
END;
$$;

COMMIT;