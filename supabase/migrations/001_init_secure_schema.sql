-- Police Out: Hardened Anti-Cheat PostgreSQL Schema & RPCs
-- Zero direct client table writes | Composite Indexes | Server-Authoritative Validation

BEGIN;

-- 1. Canonical Levels Metadata (Server Source of Truth for Optimal Moves & Anti-Cheat)
CREATE TABLE IF NOT EXISTS public.levels_meta (
  level_id smallint PRIMARY KEY CHECK (level_id BETWEEN 1 AND 360),
  optimal_moves smallint NOT NULL CHECK (optimal_moves >= 1 AND optimal_moves <= 500),
  difficulty text NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced'))
);

INSERT INTO public.levels_meta (level_id, optimal_moves, difficulty)
VALUES
  (1, 3, 'beginner'),
  (2, 3, 'beginner'),
  (3, 3, 'beginner'),
  (4, 4, 'beginner'),
  (5, 4, 'beginner'),
  (6, 4, 'beginner'),
  (7, 5, 'beginner'),
  (8, 5, 'beginner'),
  (9, 4, 'beginner'),
  (10, 6, 'beginner'),
  (11, 5, 'beginner'),
  (12, 7, 'beginner'),
  (13, 7, 'beginner'),
  (14, 9, 'beginner'),
  (15, 7, 'beginner'),
  (16, 7, 'beginner'),
  (17, 7, 'beginner'),
  (18, 4, 'beginner'),
  (19, 8, 'beginner'),
  (20, 9, 'beginner'),
  (21, 8, 'beginner'),
  (22, 2, 'beginner'),
  (23, 4, 'beginner'),
  (24, 10, 'beginner'),
  (25, 10, 'beginner'),
  (26, 11, 'beginner'),
  (27, 11, 'beginner'),
  (28, 11, 'beginner'),
  (29, 11, 'beginner'),
  (30, 10, 'beginner'),
  (31, 11, 'beginner'),
  (32, 12, 'beginner'),
  (33, 12, 'beginner'),
  (34, 14, 'beginner'),
  (35, 14, 'beginner'),
  (36, 6, 'beginner'),
  (37, 14, 'beginner'),
  (38, 13, 'beginner'),
  (39, 13, 'beginner'),
  (40, 8, 'beginner'),
  (41, 17, 'beginner'),
  (42, 16, 'beginner'),
  (43, 19, 'beginner'),
  (44, 17, 'beginner'),
  (45, 15, 'beginner'),
  (46, 17, 'beginner'),
  (47, 17, 'beginner'),
  (48, 15, 'beginner'),
  (49, 15, 'beginner'),
  (50, 16, 'beginner'),
  (51, 15, 'beginner'),
  (52, 20, 'beginner'),
  (53, 16, 'beginner'),
  (54, 16, 'beginner'),
  (55, 15, 'beginner'),
  (56, 12, 'beginner'),
  (57, 16, 'beginner'),
  (58, 4, 'beginner'),
  (59, 14, 'beginner'),
  (60, 6, 'beginner'),
  (61, 15, 'beginner'),
  (62, 16, 'beginner'),
  (63, 12, 'beginner'),
  (64, 12, 'beginner'),
  (65, 16, 'beginner'),
  (66, 14, 'beginner'),
  (67, 16, 'beginner'),
  (68, 15, 'beginner'),
  (69, 15, 'beginner'),
  (70, 16, 'beginner'),
  (71, 17, 'beginner'),
  (72, 3, 'beginner'),
  (73, 20, 'beginner'),
  (74, 17, 'beginner'),
  (75, 18, 'beginner'),
  (76, 19, 'beginner'),
  (77, 16, 'beginner'),
  (78, 15, 'beginner'),
  (79, 18, 'beginner'),
  (80, 16, 'beginner'),
  (81, 8, 'intermediate'),
  (82, 15, 'intermediate'),
  (83, 17, 'intermediate'),
  (84, 16, 'intermediate'),
  (85, 18, 'intermediate'),
  (86, 18, 'intermediate'),
  (87, 18, 'intermediate'),
  (88, 18, 'intermediate'),
  (89, 18, 'intermediate'),
  (90, 20, 'intermediate'),
  (91, 13, 'intermediate'),
  (92, 16, 'intermediate'),
  (93, 15, 'intermediate'),
  (94, 10, 'intermediate'),
  (95, 6, 'intermediate'),
  (96, 17, 'intermediate'),
  (97, 16, 'intermediate'),
  (98, 16, 'intermediate'),
  (99, 17, 'intermediate'),
  (100, 9, 'intermediate'),
  (101, 21, 'intermediate'),
  (102, 23, 'intermediate'),
  (103, 11, 'intermediate'),
  (104, 21, 'intermediate'),
  (105, 21, 'intermediate'),
  (106, 23, 'intermediate'),
  (107, 22, 'intermediate'),
  (108, 21, 'intermediate'),
  (109, 22, 'intermediate'),
  (110, 22, 'intermediate'),
  (111, 21, 'intermediate'),
  (112, 22, 'intermediate'),
  (113, 11, 'intermediate'),
  (114, 22, 'intermediate'),
  (115, 23, 'intermediate'),
  (116, 21, 'intermediate'),
  (117, 23, 'intermediate'),
  (118, 21, 'intermediate'),
  (119, 22, 'intermediate'),
  (120, 2, 'intermediate'),
  (121, 21, 'intermediate'),
  (122, 22, 'intermediate'),
  (123, 22, 'intermediate'),
  (124, 7, 'intermediate'),
  (125, 24, 'intermediate'),
  (126, 15, 'intermediate'),
  (127, 15, 'intermediate'),
  (128, 16, 'intermediate'),
  (129, 19, 'intermediate'),
  (130, 21, 'intermediate'),
  (131, 7, 'intermediate'),
  (132, 20, 'intermediate'),
  (133, 24, 'intermediate'),
  (134, 7, 'intermediate'),
  (135, 21, 'intermediate'),
  (136, 22, 'intermediate'),
  (137, 17, 'intermediate'),
  (138, 21, 'intermediate'),
  (139, 21, 'intermediate'),
  (140, 21, 'intermediate'),
  (141, 22, 'intermediate'),
  (142, 21, 'intermediate'),
  (143, 24, 'intermediate'),
  (144, 19, 'intermediate'),
  (145, 23, 'intermediate'),
  (146, 16, 'intermediate'),
  (147, 21, 'intermediate'),
  (148, 16, 'intermediate'),
  (149, 18, 'intermediate'),
  (150, 25, 'intermediate'),
  (151, 26, 'intermediate'),
  (152, 16, 'intermediate'),
  (153, 11, 'intermediate'),
  (154, 27, 'intermediate'),
  (155, 15, 'intermediate'),
  (156, 9, 'intermediate'),
  (157, 16, 'intermediate'),
  (158, 17, 'intermediate'),
  (159, 23, 'intermediate'),
  (160, 16, 'intermediate'),
  (161, 14, 'intermediate'),
  (162, 17, 'intermediate'),
  (163, 26, 'intermediate'),
  (164, 18, 'intermediate'),
  (165, 2, 'intermediate'),
  (166, 21, 'intermediate'),
  (167, 23, 'intermediate'),
  (168, 23, 'intermediate'),
  (169, 18, 'intermediate'),
  (170, 24, 'intermediate'),
  (171, 20, 'intermediate'),
  (172, 16, 'intermediate'),
  (173, 9, 'intermediate'),
  (174, 25, 'intermediate'),
  (175, 23, 'intermediate'),
  (176, 19, 'intermediate'),
  (177, 26, 'intermediate'),
  (178, 26, 'intermediate'),
  (179, 15, 'intermediate'),
  (180, 15, 'intermediate'),
  (181, 23, 'intermediate'),
  (182, 27, 'intermediate'),
  (183, 18, 'intermediate'),
  (184, 22, 'intermediate'),
  (185, 5, 'intermediate'),
  (186, 26, 'intermediate'),
  (187, 27, 'intermediate'),
  (188, 28, 'intermediate'),
  (189, 22, 'intermediate'),
  (190, 26, 'intermediate'),
  (191, 26, 'intermediate'),
  (192, 29, 'intermediate'),
  (193, 26, 'intermediate'),
  (194, 27, 'intermediate'),
  (195, 4, 'intermediate'),
  (196, 1, 'intermediate'),
  (197, 11, 'intermediate'),
  (198, 26, 'intermediate'),
  (199, 26, 'intermediate'),
  (200, 24, 'intermediate'),
  (201, 15, 'intermediate'),
  (202, 29, 'intermediate'),
  (203, 1, 'intermediate'),
  (204, 26, 'intermediate'),
  (205, 8, 'intermediate'),
  (206, 27, 'intermediate'),
  (207, 29, 'intermediate'),
  (208, 29, 'intermediate'),
  (209, 27, 'advanced'),
  (210, 27, 'advanced'),
  (211, 27, 'advanced'),
  (212, 23, 'advanced'),
  (213, 17, 'advanced'),
  (214, 27, 'advanced'),
  (215, 26, 'advanced'),
  (216, 26, 'advanced'),
  (217, 29, 'advanced'),
  (218, 26, 'advanced'),
  (219, 30, 'advanced'),
  (220, 29, 'advanced'),
  (221, 28, 'advanced'),
  (222, 29, 'advanced'),
  (223, 24, 'advanced'),
  (224, 29, 'advanced'),
  (225, 25, 'advanced'),
  (226, 27, 'advanced'),
  (227, 24, 'advanced'),
  (228, 30, 'advanced'),
  (229, 30, 'advanced'),
  (230, 14, 'advanced'),
  (231, 26, 'advanced'),
  (232, 2, 'advanced'),
  (233, 26, 'advanced'),
  (234, 24, 'advanced'),
  (235, 27, 'advanced'),
  (236, 24, 'advanced'),
  (237, 25, 'advanced'),
  (238, 26, 'advanced'),
  (239, 26, 'advanced'),
  (240, 22, 'advanced'),
  (241, 28, 'advanced'),
  (242, 23, 'advanced'),
  (243, 15, 'advanced'),
  (244, 27, 'advanced'),
  (245, 18, 'advanced'),
  (246, 26, 'advanced'),
  (247, 26, 'advanced'),
  (248, 30, 'advanced'),
  (249, 3, 'advanced'),
  (250, 23, 'advanced'),
  (251, 4, 'advanced'),
  (252, 25, 'advanced'),
  (253, 20, 'advanced'),
  (254, 27, 'advanced'),
  (255, 20, 'advanced'),
  (256, 25, 'advanced'),
  (257, 24, 'advanced'),
  (258, 27, 'advanced'),
  (259, 7, 'advanced'),
  (260, 6, 'advanced'),
  (261, 33, 'advanced'),
  (262, 31, 'advanced'),
  (263, 30, 'advanced'),
  (264, 31, 'advanced'),
  (265, 33, 'advanced'),
  (266, 34, 'advanced'),
  (267, 37, 'advanced'),
  (268, 37, 'advanced'),
  (269, 32, 'advanced'),
  (270, 31, 'advanced'),
  (271, 44, 'advanced'),
  (272, 35, 'advanced'),
  (273, 3, 'advanced'),
  (274, 39, 'advanced'),
  (275, 32, 'advanced'),
  (276, 31, 'advanced'),
  (277, 44, 'advanced'),
  (278, 35, 'advanced'),
  (279, 31, 'advanced'),
  (280, 22, 'advanced'),
  (281, 10, 'advanced'),
  (282, 31, 'advanced'),
  (283, 31, 'advanced'),
  (284, 15, 'advanced'),
  (285, 27, 'advanced'),
  (286, 30, 'advanced'),
  (287, 8, 'advanced'),
  (288, 38, 'advanced'),
  (289, 38, 'advanced'),
  (290, 26, 'advanced'),
  (291, 31, 'advanced'),
  (292, 32, 'advanced'),
  (293, 45, 'advanced'),
  (294, 30, 'advanced'),
  (295, 31, 'advanced'),
  (296, 35, 'advanced'),
  (297, 29, 'advanced'),
  (298, 40, 'advanced'),
  (299, 42, 'advanced'),
  (300, 44, 'advanced'),
  (301, 33, 'advanced'),
  (302, 2, 'advanced'),
  (303, 35, 'advanced'),
  (304, 33, 'advanced'),
  (305, 32, 'advanced'),
  (306, 31, 'advanced'),
  (307, 31, 'advanced'),
  (308, 5, 'advanced'),
  (309, 32, 'advanced'),
  (310, 31, 'advanced'),
  (311, 35, 'advanced'),
  (312, 36, 'advanced'),
  (313, 30, 'advanced'),
  (314, 36, 'advanced'),
  (315, 40, 'advanced'),
  (316, 39, 'advanced'),
  (317, 32, 'advanced'),
  (318, 34, 'advanced'),
  (319, 30, 'advanced'),
  (320, 34, 'advanced'),
  (321, 11, 'advanced'),
  (322, 34, 'advanced'),
  (323, 33, 'advanced'),
  (324, 26, 'advanced'),
  (325, 9, 'advanced'),
  (326, 33, 'advanced'),
  (327, 28, 'advanced'),
  (328, 34, 'advanced'),
  (329, 33, 'advanced'),
  (330, 38, 'advanced'),
  (331, 24, 'advanced'),
  (332, 34, 'advanced'),
  (333, 33, 'advanced'),
  (334, 33, 'advanced'),
  (335, 31, 'advanced'),
  (336, 33, 'advanced'),
  (337, 31, 'advanced'),
  (338, 42, 'advanced'),
  (339, 33, 'advanced'),
  (340, 4, 'advanced'),
  (341, 36, 'advanced'),
  (342, 37, 'advanced'),
  (343, 36, 'advanced'),
  (344, 31, 'advanced'),
  (345, 34, 'advanced'),
  (346, 31, 'advanced'),
  (347, 31, 'advanced'),
  (348, 26, 'advanced'),
  (349, 32, 'advanced'),
  (350, 28, 'advanced'),
  (351, 31, 'advanced'),
  (352, 38, 'advanced'),
  (353, 17, 'advanced'),
  (354, 16, 'advanced'),
  (355, 6, 'advanced'),
  (356, 37, 'advanced'),
  (357, 10, 'advanced'),
  (358, 24, 'advanced'),
  (359, 32, 'advanced'),
  (360, 32, 'advanced')
ON CONFLICT (level_id) DO UPDATE
SET optimal_moves = EXCLUDED.optimal_moves,
    difficulty = EXCLUDED.difficulty;

-- 2. Player Profiles (Strictly Private, Zero Public List)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT 'Officer' CHECK (char_length(display_name) BETWEEN 1 AND 80),
  photo_url text NOT NULL DEFAULT '' CHECK (char_length(photo_url) <= 500 AND (photo_url = '' OR photo_url ~ '^https://')),
  current_level_id smallint NOT NULL DEFAULT 1 CHECK (current_level_id BETWEEN 1 AND 360),
  tutorial_seen boolean NOT NULL DEFAULT false,
  muted boolean NOT NULL DEFAULT false,
  language text NOT NULL DEFAULT 'ar' CHECK (language IN ('ar', 'en')),
  selected_theme text NOT NULL DEFAULT 'classic' CHECK (selected_theme IN ('classic', 'night', 'rain', 'desert', 'snow', 'sunset', 'cyber', 'autumn')),
  solved_count smallint NOT NULL DEFAULT 0 CHECK (solved_count BETWEEN 0 AND 360),
  total_stars smallint NOT NULL DEFAULT 0 CHECK (total_stars BETWEEN 0 AND 1080),
  no_hint_three_star_count smallint NOT NULL DEFAULT 0 CHECK (no_hint_three_star_count BETWEEN 0 AND 360),
  timed_wins integer NOT NULL DEFAULT 0 CHECK (timed_wins BETWEEN 0 AND 100000),
  limited_wins integer NOT NULL DEFAULT 0 CHECK (limited_wins BETWEEN 0 AND 100000),
  unlocked_achievements text[] NOT NULL DEFAULT '{}',
  daily_completed_dates text[] NOT NULL DEFAULT '{}',
  daily_streak integer NOT NULL DEFAULT 0 CHECK (daily_streak BETWEEN 0 AND 10000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Per-Stage Progress (Composite PK = fast O(log N) lookup & batching)
CREATE TABLE IF NOT EXISTS public.stage_progress (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level_id smallint NOT NULL REFERENCES public.levels_meta(level_id),
  solved boolean NOT NULL DEFAULT true CHECK (solved IS TRUE),
  best_moves smallint NOT NULL CHECK (best_moves BETWEEN 1 AND 9999),
  stars smallint NOT NULL CHECK (stars BETWEEN 0 AND 3),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, level_id)
);

-- 4. Public Leaderboard (Zero PII - NO emails ever stored here)
CREATE TABLE IF NOT EXISTS public.leaderboard (
  uid uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 80),
  photo_url text NOT NULL DEFAULT '' CHECK (char_length(photo_url) <= 500 AND (photo_url = '' OR photo_url ~ '^https://')),
  solved_count smallint NOT NULL DEFAULT 0 CHECK (solved_count BETWEEN 0 AND 360),
  total_stars smallint NOT NULL DEFAULT 0 CHECK (total_stars BETWEEN 0 AND 1080),
  achievements_count smallint NOT NULL DEFAULT 0 CHECK (achievements_count BETWEEN 0 AND 30),
  daily_streak integer NOT NULL DEFAULT 0 CHECK (daily_streak BETWEEN 0 AND 10000),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Daily Challenge Global Scores (Zero PII)
CREATE TABLE IF NOT EXISTS public.daily_scores (
  date_key text NOT NULL CHECK (date_key ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level_id smallint NOT NULL REFERENCES public.levels_meta(level_id),
  display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 80),
  photo_url text NOT NULL DEFAULT '' CHECK (char_length(photo_url) <= 500 AND (photo_url = '' OR photo_url ~ '^https://')),
  moves smallint NOT NULL CHECK (moves BETWEEN 1 AND 9999),
  time_seconds integer NOT NULL CHECK (time_seconds BETWEEN 1 AND 86400),
  stars smallint NOT NULL CHECK (stars BETWEEN 0 AND 3),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (date_key, user_id)
);

-- 6. High-Performance Composite Indexes (Speed Video Rule #2)
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank
  ON public.leaderboard (total_stars DESC, solved_count DESC, updated_at ASC);

CREATE INDEX IF NOT EXISTS idx_daily_scores_rank
  ON public.daily_scores (date_key, moves ASC, time_seconds ASC, updated_at ASC);

CREATE INDEX IF NOT EXISTS idx_stage_progress_user
  ON public.stage_progress (user_id, level_id);

-- 7. Absolute Zero-Trust Row Level Security (Lock all direct client writes)
ALTER TABLE public.levels_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels_meta FORCE ROW LEVEL SECURITY;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

ALTER TABLE public.stage_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage_progress FORCE ROW LEVEL SECURITY;

ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard FORCE ROW LEVEL SECURITY;

ALTER TABLE public.daily_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_scores FORCE ROW LEVEL SECURITY;

REVOKE ALL ON public.levels_meta, public.profiles, public.stage_progress, public.leaderboard, public.daily_scores FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.levels_meta TO anon, authenticated;
GRANT SELECT ON public.profiles, public.stage_progress, public.leaderboard, public.daily_scores TO authenticated;

DROP POLICY IF EXISTS levels_meta_read ON public.levels_meta;
CREATE POLICY levels_meta_read ON public.levels_meta FOR SELECT USING (true);

DROP POLICY IF EXISTS profiles_owner_read ON public.profiles;
CREATE POLICY profiles_owner_read ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS stage_progress_owner_read ON public.stage_progress;
CREATE POLICY stage_progress_owner_read ON public.stage_progress FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS leaderboard_auth_read ON public.leaderboard;
CREATE POLICY leaderboard_auth_read ON public.leaderboard FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS daily_scores_auth_read ON public.daily_scores;
CREATE POLICY daily_scores_auth_read ON public.daily_scores FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

-- 8. Server-Side Pure Helpers
CREATE OR REPLACE FUNCTION public.compute_stage_stars(p_moves int, p_optimal int, p_hints int DEFAULT 0)
RETURNS int
LANGUAGE sql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
  SELECT GREATEST(
    0,
    LEAST(
      3,
      (CASE
        WHEN p_moves <= p_optimal + 1 THEN 3
        WHEN p_moves <= ceil(p_optimal * 1.45)::int + 2 THEN 2
        ELSE 1
      END) - GREATEST(0, COALESCE(p_hints, 0))
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.compute_daily_level_id(p_date_key text)
RETURNS int
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
DECLARE
  v_hash bigint := 2166136261;
  v_len int := char_length(p_date_key);
  i int;
BEGIN
  FOR i IN 1..v_len LOOP
    v_hash := ((v_hash # ascii(substr(p_date_key, i, 1))::bigint) * 16777619::bigint) & 4294967295::bigint;
  END LOOP;
  RETURN 45 + (v_hash % 301)::int;
END;
$$;

CREATE OR REPLACE FUNCTION public.compute_daily_streak(p_dates text[], p_today_key text)
RETURNS int
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
DECLARE
  v_cursor date := p_today_key::date;
  v_streak int := 0;
BEGIN
  IF p_dates IS NULL OR array_length(p_dates, 1) IS NULL THEN
    RETURN 0;
  END IF;
  IF NOT (to_char(v_cursor, 'YYYY-MM-DD') = ANY(p_dates)) THEN
    v_cursor := v_cursor - 1;
  END IF;
  WHILE to_char(v_cursor, 'YYYY-MM-DD') = ANY(p_dates) LOOP
    v_streak := v_streak + 1;
    v_cursor := v_cursor - 1;
    EXIT WHEN v_streak >= 10000;
  END LOOP;
  RETURN v_streak;
END;
$$;

CREATE OR REPLACE FUNCTION public.theme_required_stars(p_theme text)
RETURNS int
LANGUAGE sql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
  SELECT CASE p_theme
    WHEN 'sunset' THEN 15
    WHEN 'desert' THEN 30
    WHEN 'cyber' THEN 45
    WHEN 'autumn' THEN 65
    ELSE 0
  END;
$$;

CREATE OR REPLACE FUNCTION public.recompute_achievements(
  p_solved int,
  p_stars int,
  p_no_hint_3star int,
  p_timed_wins int,
  p_limited_wins int,
  p_daily_count int,
  p_daily_streak int
)
RETURNS text[]
LANGUAGE sql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(array_agg(id ORDER BY ord), '{}'::text[])
  FROM (VALUES
    (1,  'first_escape',     p_solved >= 1),
    (2,  'rookie_10',        p_solved >= 10),
    (3,  'sergeant_50',      p_solved >= 50),
    (4,  'captain_150',      p_solved >= 150),
    (5,  'chief_360',        p_solved >= 360),
    (6,  'stars_50',         p_stars >= 50),
    (7,  'stars_300',        p_stars >= 300),
    (8,  'pure_tactician',   p_no_hint_3star >= 5),
    (9,  'speed_interceptor',p_timed_wins >= 3),
    (10, 'strict_commander', p_limited_wins >= 3),
    (11, 'daily_hero',       p_daily_count >= 1),
    (12, 'streak_3',         p_daily_streak >= 3)
  ) AS rules(ord, id, met)
  WHERE met IS TRUE;
$$;

CREATE OR REPLACE FUNCTION public.sanitize_auth_identity(p_uid uuid)
RETURNS TABLE(display_name text, photo_url text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_confirmed timestamptz;
  v_email text;
  v_meta jsonb;
  v_raw_name text;
  v_raw_photo text;
BEGIN
  SELECT email_confirmed_at, email, raw_user_meta_data
  INTO v_confirmed, v_email, v_meta
  FROM auth.users
  WHERE id = p_uid;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'USER_NOT_FOUND';
  END IF;
  IF v_confirmed IS NULL THEN
    RAISE EXCEPTION 'EMAIL_NOT_VERIFIED';
  END IF;

  v_raw_name := COALESCE(
    NULLIF(btrim(v_meta ->> 'display_name'), ''),
    NULLIF(btrim(v_meta ->> 'full_name'), ''),
    NULLIF(btrim(v_meta ->> 'name'), ''),
    NULLIF(btrim(split_part(COALESCE(v_email, ''), '@', 1)), ''),
    'Officer'
  );
  v_raw_name := left(regexp_replace(v_raw_name, '[<>"'']', '', 'g'), 80);
  IF char_length(v_raw_name) < 1 THEN
    v_raw_name := 'Officer';
  END IF;

  v_raw_photo := COALESCE(
    NULLIF(btrim(v_meta ->> 'avatar_url'), ''),
    NULLIF(btrim(v_meta ->> 'picture'), ''),
    ''
  );
  IF v_raw_photo !~ '^https://' OR char_length(v_raw_photo) > 500 THEN
    v_raw_photo := '';
  END IF;

  RETURN QUERY SELECT v_raw_name, v_raw_photo;
END;
$$;

-- 9. Hardened Batched Sync RPC (Zero N+1, Single Transaction, Server-Validated)
CREATE OR REPLACE FUNCTION public.sync_game_state(
  p_stages jsonb DEFAULT '[]'::jsonb,
  p_current_level_id int DEFAULT 1,
  p_tutorial_seen boolean DEFAULT false,
  p_muted boolean DEFAULT false,
  p_language text DEFAULT 'ar',
  p_selected_theme text DEFAULT 'classic',
  p_timed_wins int DEFAULT 0,
  p_limited_wins int DEFAULT 0,
  p_no_hint_3star int DEFAULT 0,
  p_daily_dates text[] DEFAULT '{}'::text[]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_name text;
  v_photo text;
  v_today text := to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD');
  v_existing public.profiles%ROWTYPE;
  v_has_profile boolean := false;
  v_solved_count int := 0;
  v_total_stars int := 0;
  v_merged_level int;
  v_merged_tutorial boolean;
  v_merged_muted boolean;
  v_merged_lang text;
  v_candidate_theme text;
  v_merged_theme text;
  v_merged_timed int;
  v_merged_limited int;
  v_merged_no_hint int;
  v_merged_dates text[];
  v_merged_streak int;
  v_merged_achievements text[];
  v_stages_out jsonb;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED';
  END IF;

  SELECT s.display_name, s.photo_url INTO v_name, v_photo
  FROM public.sanitize_auth_identity(v_uid) s;

  SELECT * INTO v_existing FROM public.profiles WHERE id = v_uid;
  v_has_profile := FOUND;

  -- Batched upsert of valid stage entries checked against canonical levels_meta.optimal_moves
  IF p_stages IS NOT NULL AND jsonb_typeof(p_stages) = 'array' AND jsonb_array_length(p_stages) > 0 THEN
    WITH parsed AS (
      SELECT DISTINCT ON (r.level_id)
        r.level_id::smallint AS level_id,
        GREATEST(1, LEAST(9999, COALESCE(r.moves, 9999)))::int AS moves,
        GREATEST(0, LEAST(3, COALESCE(r.hints_used, 0)))::int AS hints_used,
        COALESCE(r.solution_viewed, false) AS solution_viewed
      FROM jsonb_to_recordset(p_stages) AS r(
        level_id int,
        moves int,
        hints_used int,
        solution_viewed boolean
      )
      WHERE r.level_id BETWEEN 1 AND 360
      LIMIT 360
    ),
    validated AS (
      SELECT
        p.level_id,
        p.moves::smallint AS best_moves,
        CASE
          WHEN p.solution_viewed THEN 0::smallint
          ELSE public.compute_stage_stars(p.moves, m.optimal_moves, p.hints_used)::smallint
        END AS stars
      FROM parsed p
      JOIN public.levels_meta m ON m.level_id = p.level_id
      WHERE p.moves >= m.optimal_moves AND p.moves <= 9999
    )
    INSERT INTO public.stage_progress (user_id, level_id, solved, best_moves, stars, updated_at)
    SELECT v_uid, v.level_id, true, v.best_moves, v.stars, now()
    FROM validated v
    ON CONFLICT (user_id, level_id) DO UPDATE
    SET best_moves = LEAST(public.stage_progress.best_moves, EXCLUDED.best_moves),
        stars = GREATEST(public.stage_progress.stars, EXCLUDED.stars),
        updated_at = now();
  END IF;

  -- Recompute authoritative counts strictly from stage_progress
  SELECT COUNT(*)::int, COALESCE(SUM(stars), 0)::int
  INTO v_solved_count, v_total_stars
  FROM public.stage_progress
  WHERE user_id = v_uid AND solved IS TRUE;

  v_merged_level := GREATEST(1, LEAST(360, GREATEST(COALESCE(v_existing.current_level_id, 1), COALESCE(p_current_level_id, 1))));
  v_merged_tutorial := COALESCE(v_existing.tutorial_seen, false) OR COALESCE(p_tutorial_seen, false);
  v_merged_muted := CASE WHEN v_has_profile THEN v_existing.muted ELSE COALESCE(p_muted, false) END;
  v_merged_lang := CASE
    WHEN v_has_profile AND v_existing.language IN ('ar', 'en') THEN v_existing.language
    WHEN p_language IN ('ar', 'en') THEN p_language
    ELSE 'ar'
  END;

  v_candidate_theme := COALESCE(NULLIF(v_existing.selected_theme, ''), NULLIF(p_selected_theme, ''), 'classic');
  IF v_candidate_theme NOT IN ('classic', 'night', 'rain', 'desert', 'snow', 'sunset', 'cyber', 'autumn') THEN
    v_candidate_theme := 'classic';
  END IF;
  IF v_total_stars >= public.theme_required_stars(v_candidate_theme) THEN
    v_merged_theme := v_candidate_theme;
  ELSE
    v_merged_theme := 'classic';
  END IF;

  -- Server-bounded mode counters (never trust inflated numbers)
  v_merged_timed := GREATEST(COALESCE(v_existing.timed_wins, 0), LEAST(GREATEST(0, COALESCE(p_timed_wins, 0)), v_solved_count + 50));
  v_merged_limited := GREATEST(COALESCE(v_existing.limited_wins, 0), LEAST(GREATEST(0, COALESCE(p_limited_wins, 0)), v_solved_count + 50));
  v_merged_no_hint := LEAST(v_solved_count, GREATEST(COALESCE(v_existing.no_hint_three_star_count, 0), GREATEST(0, COALESCE(p_no_hint_3star, 0))));

  -- Merge valid UTC dates not in the future
  SELECT COALESCE(array_agg(d ORDER BY d), '{}'::text[])
  INTO v_merged_dates
  FROM (
    SELECT DISTINCT d
    FROM unnest(COALESCE(v_existing.daily_completed_dates, '{}'::text[]) || COALESCE(p_daily_dates, '{}'::text[])) AS d
    WHERE d ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' AND d <= v_today
    ORDER BY d DESC
    LIMIT 100
  ) sub;

  v_merged_streak := GREATEST(
    COALESCE(v_existing.daily_streak, 0),
    public.compute_daily_streak(v_merged_dates, v_today)
  );
  v_merged_streak := LEAST(v_merged_streak, GREATEST(array_length(v_merged_dates, 1), 0));

  v_merged_achievements := public.recompute_achievements(
    v_solved_count,
    v_total_stars,
    v_merged_no_hint,
    v_merged_timed,
    v_merged_limited,
    COALESCE(array_length(v_merged_dates, 1), 0),
    v_merged_streak
  );

  INSERT INTO public.profiles (
    id, display_name, photo_url, current_level_id, tutorial_seen, muted, language,
    selected_theme, solved_count, total_stars, no_hint_three_star_count,
    timed_wins, limited_wins, unlocked_achievements, daily_completed_dates, daily_streak,
    created_at, updated_at
  )
  VALUES (
    v_uid, v_name, v_photo, v_merged_level, v_merged_tutorial, v_merged_muted, v_merged_lang,
    v_merged_theme, v_solved_count, v_total_stars, v_merged_no_hint,
    v_merged_timed, v_merged_limited, v_merged_achievements, v_merged_dates, v_merged_streak,
    now(), now()
  )
  ON CONFLICT (id) DO UPDATE
  SET display_name = EXCLUDED.display_name,
      photo_url = EXCLUDED.photo_url,
      current_level_id = EXCLUDED.current_level_id,
      tutorial_seen = EXCLUDED.tutorial_seen,
      muted = EXCLUDED.muted,
      language = EXCLUDED.language,
      selected_theme = EXCLUDED.selected_theme,
      solved_count = EXCLUDED.solved_count,
      total_stars = EXCLUDED.total_stars,
      no_hint_three_star_count = EXCLUDED.no_hint_three_star_count,
      timed_wins = EXCLUDED.timed_wins,
      limited_wins = EXCLUDED.limited_wins,
      unlocked_achievements = EXCLUDED.unlocked_achievements,
      daily_completed_dates = EXCLUDED.daily_completed_dates,
      daily_streak = EXCLUDED.daily_streak,
      updated_at = now();

  INSERT INTO public.leaderboard (
    uid, display_name, photo_url, solved_count, total_stars, achievements_count, daily_streak, updated_at
  )
  VALUES (
    v_uid, v_name, v_photo, v_solved_count, v_total_stars, COALESCE(array_length(v_merged_achievements, 1), 0), v_merged_streak, now()
  )
  ON CONFLICT (uid) DO UPDATE
  SET display_name = EXCLUDED.display_name,
      photo_url = EXCLUDED.photo_url,
      solved_count = EXCLUDED.solved_count,
      total_stars = EXCLUDED.total_stars,
      achievements_count = EXCLUDED.achievements_count,
      daily_streak = EXCLUDED.daily_streak,
      updated_at = now();

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'levelId', sp.level_id,
    'solved', sp.solved,
    'bestMoves', sp.best_moves,
    'stars', sp.stars
  ) ORDER BY sp.level_id), '[]'::jsonb)
  INTO v_stages_out
  FROM public.stage_progress sp
  WHERE sp.user_id = v_uid;

  RETURN jsonb_build_object(
    'profile', jsonb_build_object(
      'currentLevelId', v_merged_level,
      'tutorialSeen', v_merged_tutorial,
      'muted', v_merged_muted,
      'language', v_merged_lang,
      'selectedTheme', v_merged_theme,
      'solvedCount', v_solved_count,
      'totalStars', v_total_stars,
      'noHintThreeStarCount', v_merged_no_hint,
      'timedWins', v_merged_timed,
      'limitedWins', v_merged_limited,
      'unlockedAchievements', v_merged_achievements,
      'dailyCompletedDates', v_merged_dates,
      'dailyStreak', v_merged_streak
    ),
    'stages', v_stages_out
  );
END;
$$;

-- 10. Hardened Single-Stage Win RPC (Server Anti-Cheat Verification)
CREATE OR REPLACE FUNCTION public.submit_stage_progress(
  p_level_id int,
  p_moves int,
  p_hints_used int DEFAULT 0,
  p_solution_viewed boolean DEFAULT false,
  p_game_mode text DEFAULT 'classic',
  p_current_level_id int DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_name text;
  v_photo text;
  v_optimal int;
  v_stars int;
  v_solved_count int;
  v_total_stars int;
  v_existing public.profiles%ROWTYPE;
  v_no_hint int;
  v_timed int;
  v_limited int;
  v_achievements text[];
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED';
  END IF;

  IF p_level_id IS NULL OR p_level_id < 1 OR p_level_id > 360 THEN
    RAISE EXCEPTION 'INVALID_LEVEL_ID';
  END IF;

  SELECT s.display_name, s.photo_url INTO v_name, v_photo
  FROM public.sanitize_auth_identity(v_uid) s;

  SELECT optimal_moves INTO v_optimal FROM public.levels_meta WHERE level_id = p_level_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'LEVEL_NOT_FOUND';
  END IF;

  -- Strict Anti-Cheat: reject physically impossible move counts below BFS optimal
  IF p_moves IS NULL OR p_moves < v_optimal OR p_moves > 9999 THEN
    RAISE EXCEPTION 'INVALID_MOVE_COUNT';
  END IF;

  v_stars := CASE
    WHEN COALESCE(p_solution_viewed, false) THEN 0
    ELSE public.compute_stage_stars(p_moves, v_optimal, COALESCE(p_hints_used, 0))
  END;

  INSERT INTO public.stage_progress (user_id, level_id, solved, best_moves, stars, updated_at)
  VALUES (v_uid, p_level_id::smallint, true, p_moves::smallint, v_stars::smallint, now())
  ON CONFLICT (user_id, level_id) DO UPDATE
  SET best_moves = LEAST(public.stage_progress.best_moves, EXCLUDED.best_moves),
      stars = GREATEST(public.stage_progress.stars, EXCLUDED.stars),
      updated_at = now();

  SELECT COUNT(*)::int, COALESCE(SUM(stars), 0)::int
  INTO v_solved_count, v_total_stars
  FROM public.stage_progress
  WHERE user_id = v_uid AND solved IS TRUE;

  -- Ensure profile row exists
  INSERT INTO public.profiles (id, display_name, photo_url)
  VALUES (v_uid, v_name, v_photo)
  ON CONFLICT (id) DO NOTHING;

  SELECT * INTO v_existing FROM public.profiles WHERE id = v_uid FOR UPDATE;

  v_no_hint := LEAST(
    v_solved_count,
    v_existing.no_hint_three_star_count + (CASE WHEN v_stars = 3 AND COALESCE(p_hints_used, 0) = 0 AND NOT COALESCE(p_solution_viewed, false) THEN 1 ELSE 0 END)
  );
  v_timed := v_existing.timed_wins + (CASE WHEN p_game_mode = 'timed' THEN 1 ELSE 0 END);
  v_limited := v_existing.limited_wins + (CASE WHEN p_game_mode = 'limited' THEN 1 ELSE 0 END);

  v_achievements := public.recompute_achievements(
    v_solved_count,
    v_total_stars,
    v_no_hint,
    v_timed,
    v_limited,
    COALESCE(array_length(v_existing.daily_completed_dates, 1), 0),
    v_existing.daily_streak
  );

  UPDATE public.profiles
  SET display_name = v_name,
      photo_url = v_photo,
      current_level_id = GREATEST(1, LEAST(360, COALESCE(p_current_level_id, current_level_id))),
      solved_count = v_solved_count,
      total_stars = v_total_stars,
      no_hint_three_star_count = v_no_hint,
      timed_wins = v_timed,
      limited_wins = v_limited,
      unlocked_achievements = v_achievements,
      updated_at = now()
  WHERE id = v_uid;

  INSERT INTO public.leaderboard (
    uid, display_name, photo_url, solved_count, total_stars, achievements_count, daily_streak, updated_at
  )
  VALUES (
    v_uid, v_name, v_photo, v_solved_count, v_total_stars, COALESCE(array_length(v_achievements, 1), 0), v_existing.daily_streak, now()
  )
  ON CONFLICT (uid) DO UPDATE
  SET display_name = EXCLUDED.display_name,
      photo_url = EXCLUDED.photo_url,
      solved_count = EXCLUDED.solved_count,
      total_stars = EXCLUDED.total_stars,
      achievements_count = EXCLUDED.achievements_count,
      daily_streak = EXCLUDED.daily_streak,
      updated_at = now();

  RETURN jsonb_build_object(
    'solvedCount', v_solved_count,
    'totalStars', v_total_stars,
    'computedStars', v_stars,
    'unlockedAchievements', v_achievements
  );
END;
$$;

-- 11. Hardened Daily Challenge Score RPC (Server UTC Date + Level + Anti-Cheat)
CREATE OR REPLACE FUNCTION public.submit_daily_score(
  p_moves int,
  p_time_seconds int,
  p_hints_used int DEFAULT 0,
  p_solution_viewed boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_name text;
  v_photo text;
  v_date_key text := to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD');
  v_level_id int := public.compute_daily_level_id(v_date_key);
  v_optimal int;
  v_stars int;
  v_existing public.profiles%ROWTYPE;
  v_dates text[];
  v_streak int;
  v_achievements text[];
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED';
  END IF;

  SELECT s.display_name, s.photo_url INTO v_name, v_photo
  FROM public.sanitize_auth_identity(v_uid) s;

  SELECT optimal_moves INTO v_optimal FROM public.levels_meta WHERE level_id = v_level_id;
  IF p_moves IS NULL OR p_moves < v_optimal OR p_moves > 9999 THEN
    RAISE EXCEPTION 'INVALID_MOVE_COUNT';
  END IF;
  IF p_time_seconds IS NULL OR p_time_seconds < 1 OR p_time_seconds > 86400 THEN
    RAISE EXCEPTION 'INVALID_TIME_SECONDS';
  END IF;

  v_stars := CASE
    WHEN COALESCE(p_solution_viewed, false) THEN 0
    ELSE public.compute_stage_stars(p_moves, v_optimal, COALESCE(p_hints_used, 0))
  END;

  INSERT INTO public.daily_scores (
    date_key, user_id, level_id, display_name, photo_url, moves, time_seconds, stars, updated_at
  )
  VALUES (
    v_date_key, v_uid, v_level_id::smallint, v_name, v_photo, p_moves::smallint, p_time_seconds, v_stars::smallint, now()
  )
  ON CONFLICT (date_key, user_id) DO UPDATE
  SET display_name = EXCLUDED.display_name,
      photo_url = EXCLUDED.photo_url,
      moves = CASE
        WHEN EXCLUDED.moves < public.daily_scores.moves
          OR (EXCLUDED.moves = public.daily_scores.moves AND EXCLUDED.time_seconds < public.daily_scores.time_seconds)
        THEN EXCLUDED.moves
        ELSE public.daily_scores.moves
      END,
      time_seconds = CASE
        WHEN EXCLUDED.moves < public.daily_scores.moves
          OR (EXCLUDED.moves = public.daily_scores.moves AND EXCLUDED.time_seconds < public.daily_scores.time_seconds)
        THEN EXCLUDED.time_seconds
        ELSE public.daily_scores.time_seconds
      END,
      stars = GREATEST(public.daily_scores.stars, EXCLUDED.stars),
      updated_at = now();

  INSERT INTO public.profiles (id, display_name, photo_url)
  VALUES (v_uid, v_name, v_photo)
  ON CONFLICT (id) DO NOTHING;

  SELECT * INTO v_existing FROM public.profiles WHERE id = v_uid FOR UPDATE;

  SELECT COALESCE(array_agg(d ORDER BY d), '{}'::text[])
  INTO v_dates
  FROM (
    SELECT DISTINCT d
    FROM unnest(COALESCE(v_existing.daily_completed_dates, '{}'::text[]) || ARRAY[v_date_key]) AS d
    ORDER BY d DESC
    LIMIT 100
  ) sub;

  v_streak := GREATEST(v_existing.daily_streak, public.compute_daily_streak(v_dates, v_date_key));
  v_achievements := public.recompute_achievements(
    v_existing.solved_count,
    v_existing.total_stars,
    v_existing.no_hint_three_star_count,
    v_existing.timed_wins,
    v_existing.limited_wins,
    COALESCE(array_length(v_dates, 1), 0),
    v_streak
  );

  UPDATE public.profiles
  SET daily_completed_dates = v_dates,
      daily_streak = v_streak,
      unlocked_achievements = v_achievements,
      updated_at = now()
  WHERE id = v_uid;

  UPDATE public.leaderboard
  SET daily_streak = v_streak,
      achievements_count = COALESCE(array_length(v_achievements, 1), 0),
      updated_at = now()
  WHERE uid = v_uid;

  RETURN jsonb_build_object('dateKey', v_date_key, 'dailyStreak', v_streak);
END;
$$;

-- 12. Preferences RPC (Checks Theme Unlock Requirement)
CREATE OR REPLACE FUNCTION public.update_player_preferences(
  p_current_level_id int,
  p_tutorial_seen boolean,
  p_muted boolean,
  p_language text,
  p_selected_theme text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_name text;
  v_photo text;
  v_stars int;
  v_safe_theme text := COALESCE(p_selected_theme, 'classic');
  v_safe_lang text := CASE WHEN p_language = 'en' THEN 'en' ELSE 'ar' END;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED';
  END IF;

  SELECT s.display_name, s.photo_url INTO v_name, v_photo
  FROM public.sanitize_auth_identity(v_uid) s;

  IF v_safe_theme NOT IN ('classic', 'night', 'rain', 'desert', 'snow', 'sunset', 'cyber', 'autumn') THEN
    v_safe_theme := 'classic';
  END IF;

  SELECT total_stars INTO v_stars FROM public.profiles WHERE id = v_uid;
  IF NOT FOUND THEN
    v_stars := 0;
  END IF;

  IF v_stars < public.theme_required_stars(v_safe_theme) THEN
    v_safe_theme := 'classic';
  END IF;

  INSERT INTO public.profiles (
    id, display_name, photo_url, current_level_id, tutorial_seen, muted, language, selected_theme, updated_at
  )
  VALUES (
    v_uid,
    v_name,
    v_photo,
    GREATEST(1, LEAST(360, COALESCE(p_current_level_id, 1))),
    COALESCE(p_tutorial_seen, false),
    COALESCE(p_muted, false),
    v_safe_lang,
    v_safe_theme,
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET current_level_id = EXCLUDED.current_level_id,
      tutorial_seen = EXCLUDED.tutorial_seen,
      muted = EXCLUDED.muted,
      language = EXCLUDED.language,
      selected_theme = EXCLUDED.selected_theme,
      updated_at = now();
END;
$$;

-- 13. Paginated Leaderboard RPCs (Max 20 per page, Composite Index Scanned)
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
SECURITY DEFINER
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
  PERFORM 1 FROM public.sanitize_auth_identity(v_uid);

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
SECURITY DEFINER
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
  PERFORM 1 FROM public.sanitize_auth_identity(v_uid);

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

-- 14. Restrict RPC execution to authenticated players only
REVOKE ALL ON FUNCTION public.compute_stage_stars(int, int, int) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.compute_daily_level_id(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.compute_daily_streak(text[], text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.theme_required_stars(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.recompute_achievements(int, int, int, int, int, int, int) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.sanitize_auth_identity(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_game_state(jsonb, int, boolean, boolean, text, text, int, int, int, text[]) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.submit_stage_progress(int, int, int, boolean, text, int) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.submit_daily_score(int, int, int, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.update_player_preferences(int, boolean, boolean, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_leaderboard_page(int, int) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_daily_leaderboard_page(text, int, int) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.sync_game_state(jsonb, int, boolean, boolean, text, text, int, int, int, text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_stage_progress(int, int, int, boolean, text, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_daily_score(int, int, int, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_player_preferences(int, boolean, boolean, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_leaderboard_page(int, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_daily_leaderboard_page(text, int, int) TO authenticated;

COMMIT;
