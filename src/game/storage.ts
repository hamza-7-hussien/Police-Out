import { BoardTheme, Language, LevelProgress } from './types';

export interface SavedState {
  currentLevelId: number;
  tutorialSeen: boolean;
  muted: boolean;
  language: Language;
  selectedTheme: BoardTheme;
  unlockedAchievements: string[];
  noHintThreeStarCount: number;
  timedWins: number;
  limitedWins: number;
  dailyCompletedDates: string[];
  dailyStreak: number;
  progress: Record<number, LevelProgress>;
}

const STORAGE_KEY = 'police_parking_puzzle_v1';

const VALID_THEMES: BoardTheme[] = ['classic', 'night', 'rain', 'desert', 'snow', 'sunset', 'cyber', 'autumn'];

export const DEFAULT_STATE: SavedState = {
  currentLevelId: 1,
  tutorialSeen: false,
  muted: false,
  language: 'ar',
  selectedTheme: 'classic',
  unlockedAchievements: [],
  noHintThreeStarCount: 0,
  timedWins: 0,
  limitedWins: 0,
  dailyCompletedDates: [],
  dailyStreak: 0,
  progress: {},
};

export function loadSavedState(): SavedState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<SavedState>;
    const theme = VALID_THEMES.includes(parsed.selectedTheme as BoardTheme)
      ? (parsed.selectedTheme as BoardTheme)
      : 'classic';
    return {
      currentLevelId:
        typeof parsed.currentLevelId === 'number' &&
        parsed.currentLevelId >= 1 &&
        parsed.currentLevelId <= 360
          ? parsed.currentLevelId
          : 1,
      tutorialSeen: Boolean(parsed.tutorialSeen),
      muted: Boolean(parsed.muted),
      language: parsed.language === 'en' ? 'en' : 'ar',
      selectedTheme: theme,
      unlockedAchievements: Array.isArray(parsed.unlockedAchievements)
        ? parsed.unlockedAchievements.filter((x): x is string => typeof x === 'string').slice(0, 30)
        : [],
      noHintThreeStarCount:
        typeof parsed.noHintThreeStarCount === 'number' && parsed.noHintThreeStarCount >= 0
          ? Math.floor(parsed.noHintThreeStarCount)
          : 0,
      timedWins:
        typeof parsed.timedWins === 'number' && parsed.timedWins >= 0
          ? Math.floor(parsed.timedWins)
          : 0,
      limitedWins:
        typeof parsed.limitedWins === 'number' && parsed.limitedWins >= 0
          ? Math.floor(parsed.limitedWins)
          : 0,
      dailyCompletedDates: Array.isArray(parsed.dailyCompletedDates)
        ? parsed.dailyCompletedDates
            .filter((x): x is string => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x))
            .slice(-100)
        : [],
      dailyStreak:
        typeof parsed.dailyStreak === 'number' && parsed.dailyStreak >= 0
          ? Math.floor(parsed.dailyStreak)
          : 0,
      progress: parsed.progress && typeof parsed.progress === 'object' ? parsed.progress : {},
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveState(state: SavedState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota or storage restriction errors
  }
}

export function computeStars(
  moves: number,
  optimalMoves: number,
  hintsUsed = 0
): 0 | 1 | 2 | 3 {
  let base: 1 | 2 | 3 = 1;
  if (moves <= optimalMoves + 1) base = 3;
  else if (moves <= Math.ceil(optimalMoves * 1.45) + 2) base = 2;

  return Math.max(0, base - hintsUsed) as 0 | 1 | 2 | 3;
}
