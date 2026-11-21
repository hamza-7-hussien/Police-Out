import { AppUser, sanitizeHttpsUrl, supabase } from '../supabase';
import { computeDailyStreak, getUtcDateKey } from './features';
import { ALL_LEVELS } from './levels';
import { solvePuzzle } from './solver';
import { SavedState } from './storage';
import {
  BoardTheme,
  DailyScoreEntry,
  Language,
  LeaderboardEntry,
  LevelProgress,
} from './types';

export const LEADERBOARD_PAGE_SIZE = 20;
const CACHE_TTL_MS = 60_000;

export interface PaginatedResult<T> {
  entries: T[];
  nextCursor: number | null;
  hasMore: boolean;
}

interface CacheEntry<T> {
  data: PaginatedResult<T>;
  expiresAt: number;
}

let leaderboardFirstPageCache: CacheEntry<LeaderboardEntry> | null = null;
const dailyFirstPageCache = new Map<string, CacheEntry<DailyScoreEntry>>();

export function invalidateLeaderboardCache(): void {
  leaderboardFirstPageCache = null;
}

export function invalidateDailyCache(dateKey?: string): void {
  if (dateKey) {
    dailyFirstPageCache.delete(dateKey);
  } else {
    dailyFirstPageCache.clear();
  }
}

const VALID_THEMES: BoardTheme[] = [
  'classic',
  'night',
  'rain',
  'desert',
  'snow',
  'sunset',
  'cyber',
  'autumn',
];

function clampInt(val: number, min: number, max: number): number {
  const n = Math.floor(Number.isFinite(val) ? val : min);
  return Math.max(min, Math.min(max, n));
}

function safeTheme(val: unknown, fallback: BoardTheme): BoardTheme {
  return VALID_THEMES.includes(val as BoardTheme) ? (val as BoardTheme) : fallback;
}

// Lookup optimal moves from solved level cache to estimate hintsUsed on legacy guest-to-cloud migration
const OPTIMAL_BY_LEVEL = new Map<number, number>();
function getOptimalForLevel(levelId: number): number {
  const cached = OPTIMAL_BY_LEVEL.get(levelId);
  if (cached !== undefined) return cached;
  const def = ALL_LEVELS.find((l) => l.id === levelId);
  const opt = def ? (solvePuzzle(def.vehicles)?.length ?? def.parMoves) : 1;
  OPTIMAL_BY_LEVEL.set(levelId, opt);
  return opt;
}

function estimateHintsUsed(optimal: number, moves: number, stars: number): number {
  let base = 1;
  if (moves <= optimal + 1) base = 3;
  else if (moves <= Math.ceil(optimal * 1.45) + 2) base = 2;
  return clampInt(Math.max(0, base - stars), 0, 3);
}

interface SyncRpcProfile {
  currentLevelId: number;
  tutorialSeen: boolean;
  muted: boolean;
  language: Language;
  selectedTheme: BoardTheme;
  noHintThreeStarCount: number;
  timedWins: number;
  limitedWins: number;
  unlockedAchievements: string[];
  dailyCompletedDates: string[];
  dailyStreak: number;
}

interface SyncRpcStage {
  levelId: number;
  solved: boolean;
  bestMoves: number;
  stars: number;
}

interface SyncRpcResponse {
  profile: SyncRpcProfile;
  stages: SyncRpcStage[];
}

export async function syncOnSignIn(
  user: AppUser,
  localState: SavedState
): Promise<SavedState> {
  if (!supabase || !user.emailVerified) {
    return localState;
  }

  // Pack local solved stages for single-round-trip batched PostgreSQL sync RPC
  const localStagesPayload: Array<{
    level_id: number;
    moves: number;
    hints_used: number;
    solution_viewed: boolean;
  }> = [];

  for (const [idStr, prog] of Object.entries(localState.progress)) {
    const levelId = Number(idStr);
    if (!Number.isInteger(levelId) || levelId < 1 || levelId > 360 || !prog?.solved) {
      continue;
    }
    const safeMoves = clampInt(prog.bestMoves, 1, 9999);
    const safeStars = clampInt(prog.stars ?? 0, 0, 3);
    const optimal = getOptimalForLevel(levelId);
    if (safeMoves < optimal) continue;

    localStagesPayload.push({
      level_id: levelId,
      moves: safeMoves,
      hints_used: safeStars === 0 ? 3 : estimateHintsUsed(optimal, safeMoves, safeStars),
      solution_viewed: safeStars === 0,
    });
  }

  const { data, error } = await supabase.rpc('sync_game_state', {
    p_stages: localStagesPayload,
    p_current_level_id: clampInt(localState.currentLevelId, 1, 360),
    p_tutorial_seen: Boolean(localState.tutorialSeen),
    p_muted: Boolean(localState.muted),
    p_language: localState.language === 'en' ? 'en' : 'ar',
    p_selected_theme: safeTheme(localState.selectedTheme, 'classic'),
    p_timed_wins: clampInt(localState.timedWins, 0, 100000),
    p_limited_wins: clampInt(localState.limitedWins, 0, 100000),
    p_no_hint_3star: clampInt(localState.noHintThreeStarCount, 0, 360),
    p_daily_dates: localState.dailyCompletedDates
      .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
      .slice(-100),
  });

  if (error) {
    throw error;
  }

  const res = data as SyncRpcResponse;
  const mergedProgress: Record<number, LevelProgress> = {};
  if (Array.isArray(res?.stages)) {
    for (const s of res.stages) {
      const lvl = clampInt(Number(s.levelId), 1, 360);
      mergedProgress[lvl] = {
        solved: Boolean(s.solved),
        bestMoves: clampInt(Number(s.bestMoves), 1, 9999),
        stars: clampInt(Number(s.stars), 0, 3) as 0 | 1 | 2 | 3,
      };
    }
  }

  const prof = res?.profile;
  const dailyDates = Array.isArray(prof?.dailyCompletedDates)
    ? prof.dailyCompletedDates.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort()
    : localState.dailyCompletedDates;

  invalidateLeaderboardCache();

  return {
    currentLevelId: clampInt(Number(prof?.currentLevelId ?? localState.currentLevelId), 1, 360),
    tutorialSeen: Boolean(prof?.tutorialSeen ?? localState.tutorialSeen),
    muted: typeof prof?.muted === 'boolean' ? prof.muted : localState.muted,
    language: prof?.language === 'en' || prof?.language === 'ar' ? prof.language : localState.language,
    selectedTheme: safeTheme(prof?.selectedTheme, localState.selectedTheme),
    unlockedAchievements: Array.isArray(prof?.unlockedAchievements)
      ? prof.unlockedAchievements.slice(0, 30)
      : localState.unlockedAchievements,
    noHintThreeStarCount: clampInt(
      Number(prof?.noHintThreeStarCount ?? localState.noHintThreeStarCount),
      0,
      360
    ),
    timedWins: clampInt(Number(prof?.timedWins ?? localState.timedWins), 0, 100000),
    limitedWins: clampInt(Number(prof?.limitedWins ?? localState.limitedWins), 0, 100000),
    dailyCompletedDates: dailyDates,
    dailyStreak: Math.max(
      clampInt(Number(prof?.dailyStreak ?? 0), 0, 10000),
      computeDailyStreak(dailyDates, getUtcDateKey())
    ),
    progress: mergedProgress,
  };
}

export async function pushStageProgressToCloud(
  user: AppUser | null,
  levelId: number,
  moves: number,
  hintsUsed: number,
  solutionViewed: boolean,
  gameMode: 'classic' | 'timed' | 'limited' | 'daily',
  currentLevelId: number
): Promise<void> {
  if (!supabase || !user?.emailVerified) return;

  const { error } = await supabase.rpc('submit_stage_progress', {
    p_level_id: clampInt(levelId, 1, 360),
    p_moves: clampInt(moves, 1, 9999),
    p_hints_used: clampInt(hintsUsed, 0, 3),
    p_solution_viewed: Boolean(solutionViewed),
    p_game_mode: gameMode,
    p_current_level_id: clampInt(currentLevelId, 1, 360),
  });

  if (error) {
    throw error;
  }
  invalidateLeaderboardCache();
}

export async function pushPreferencesToCloud(
  user: AppUser | null,
  state: SavedState
): Promise<void> {
  if (!supabase || !user?.emailVerified) return;

  const { error } = await supabase.rpc('update_player_preferences', {
    p_current_level_id: clampInt(state.currentLevelId, 1, 360),
    p_tutorial_seen: Boolean(state.tutorialSeen),
    p_muted: Boolean(state.muted),
    p_language: state.language === 'en' ? 'en' : 'ar',
    p_selected_theme: safeTheme(state.selectedTheme, 'classic'),
  });

  if (error) {
    throw error;
  }
}

export async function fetchLeaderboardPage(
  cursor: number | null = null,
  forceRefresh = false,
  pageSize = LEADERBOARD_PAGE_SIZE
): Promise<PaginatedResult<LeaderboardEntry>> {
  const offset = cursor ?? 0;
  if (offset === 0 && !forceRefresh && leaderboardFirstPageCache) {
    if (Date.now() < leaderboardFirstPageCache.expiresAt) {
      return leaderboardFirstPageCache.data;
    }
  }

  if (!supabase) {
    return { entries: [], nextCursor: null, hasMore: false };
  }

  const safeLimit = clampInt(pageSize, 1, LEADERBOARD_PAGE_SIZE);
  const { data, error } = await supabase.rpc('get_leaderboard_page', {
    p_offset: offset,
    p_limit: safeLimit,
  });

  if (error) {
    throw error;
  }

  const rows = Array.isArray(data) ? (data as Record<string, unknown>[]) : [];
  const hasMore = rows.length > safeLimit;
  const pageRows = hasMore ? rows.slice(0, safeLimit) : rows;

  const result: PaginatedResult<LeaderboardEntry> = {
    entries: pageRows.map((d) => ({
      uid: String(d.uid ?? ''),
      displayName: String(d.display_name ?? 'Officer'),
      photoURL: sanitizeHttpsUrl(d.photo_url),
      solvedCount: Number(d.solved_count ?? 0),
      totalStars: Number(d.total_stars ?? 0),
      achievementsCount: Number(d.achievements_count ?? 0),
      dailyStreak: Number(d.daily_streak ?? 0),
    })),
    nextCursor: hasMore ? offset + pageRows.length : null,
    hasMore,
  };

  if (offset === 0) {
    leaderboardFirstPageCache = {
      data: result,
      expiresAt: Date.now() + CACHE_TTL_MS,
    };
  }
  return result;
}

export async function submitDailyScore(
  user: AppUser | null,
  dateKey: string,
  moves: number,
  timeSeconds: number,
  hintsUsed: number,
  solutionViewed: boolean
): Promise<void> {
  if (!supabase || !user?.emailVerified) return;

  const { error } = await supabase.rpc('submit_daily_score', {
    p_moves: clampInt(moves, 1, 9999),
    p_time_seconds: clampInt(timeSeconds, 1, 86400),
    p_hints_used: clampInt(hintsUsed, 0, 3),
    p_solution_viewed: Boolean(solutionViewed),
  });

  if (error) {
    throw error;
  }
  invalidateDailyCache(dateKey);
  invalidateLeaderboardCache();
}

export async function fetchDailyLeaderboardPage(
  dateKey: string,
  cursor: number | null = null,
  forceRefresh = false,
  pageSize = LEADERBOARD_PAGE_SIZE
): Promise<PaginatedResult<DailyScoreEntry>> {
  const offset = cursor ?? 0;
  if (offset === 0 && !forceRefresh) {
    const cached = dailyFirstPageCache.get(dateKey);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }
  }

  if (!supabase || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return { entries: [], nextCursor: null, hasMore: false };
  }

  const safeLimit = clampInt(pageSize, 1, LEADERBOARD_PAGE_SIZE);
  const { data, error } = await supabase.rpc('get_daily_leaderboard_page', {
    p_date_key: dateKey,
    p_offset: offset,
    p_limit: safeLimit,
  });

  if (error) {
    throw error;
  }

  const rows = Array.isArray(data) ? (data as Record<string, unknown>[]) : [];
  const hasMore = rows.length > safeLimit;
  const pageRows = hasMore ? rows.slice(0, safeLimit) : rows;

  const result: PaginatedResult<DailyScoreEntry> = {
    entries: pageRows.map((d) => ({
      userId: String(d.user_id ?? ''),
      dateKey: String(d.date_key ?? dateKey),
      levelId: Number(d.level_id ?? 1),
      displayName: String(d.display_name ?? 'Officer'),
      photoURL: sanitizeHttpsUrl(d.photo_url),
      moves: Number(d.moves ?? 9999),
      timeSeconds: Number(d.time_seconds ?? 86400),
      stars: Number(d.stars ?? 0),
    })),
    nextCursor: hasMore ? offset + pageRows.length : null,
    hasMore,
  };

  if (offset === 0) {
    dailyFirstPageCache.set(dateKey, {
      data: result,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
  }
  return result;
}
