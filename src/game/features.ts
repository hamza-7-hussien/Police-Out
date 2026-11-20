import { BoardTheme, Difficulty, Language } from './types';

export interface ThemeDef {
  id: BoardTheme;
  starsRequired: number;
  name: Record<Language, string>;
  description: Record<Language, string>;
  previewBg: string;
  accentColor: string;
}

export const BOARD_THEMES: ThemeDef[] = [
  {
    id: 'classic',
    starsRequired: 0,
    name: { ar: 'النهار الحضري', en: 'Classic Parkway' },
    description: {
      ar: 'موقف الشرطة الكلاسيكي المحاط بحديقة خضراء زاهية وأسفلت نقي.',
      en: 'Crisp sunlit precinct lot framed by manicured green parkway.',
    },
    previewBg: 'linear-gradient(135deg, #3f6a20 0%, #1c2430 100%)',
    accentColor: '#34d399',
  },
  {
    id: 'night',
    starsRequired: 0,
    name: { ar: 'المطاردة الليلية', en: 'Night Patrol' },
    description: {
      ar: 'دورية منتصف الليل بأضواء أعمدة الشوارع وكشافات السيارات المضيئة.',
      en: 'Midnight precinct patrol with amber streetlamps and illuminated headlights.',
    },
    previewBg: 'linear-gradient(135deg, #0b132b 0%, #1c2541 60%, #fbbf24 160%)',
    accentColor: '#fbbf24',
  },
  {
    id: 'rain',
    starsRequired: 0,
    name: { ar: 'المطر الهادئ', en: 'Midnight Rain' },
    description: {
      ar: 'أسفلت مبلل بانعكاسات زرقاء ناعمة وزخات مطر سلسة ومريحة للعين.',
      en: 'Glossy wet tarmac with cool blue reflections and silky-smooth light rain.',
    },
    previewBg: 'linear-gradient(135deg, #16293d 0%, #0d1622 65%, #38bdf8 165%)',
    accentColor: '#38bdf8',
  },
  {
    id: 'snow',
    starsRequired: 0,
    name: { ar: 'الدورية الثلجية', en: 'Arctic Patrol' },
    description: {
      ar: 'أجواء شتوية باردة بأشجار الصنوبر المثلجة وتساقط ثلج خفيف وهادئ.',
      en: 'Crisp winter outpost with frosted pines and gently drifting snow.',
    },
    previewBg: 'linear-gradient(135deg, #475569 0%, #1e293b 60%, #bae6fd 150%)',
    accentColor: '#bae6fd',
  },
  {
    id: 'sunset',
    starsRequired: 15,
    name: { ar: 'ساعة الغروب', en: 'Sunset Blvd' },
    description: {
      ar: 'إضاءة غروب دافئة بين الوردي والعنبري على طريق الدوريات.',
      en: 'Golden-hour coral and twilight skyline glowing across the avenue.',
    },
    previewBg: 'linear-gradient(135deg, #9a3412 0%, #4c1d95 58%, #1e1b2e 100%)',
    accentColor: '#fb923c',
  },
  {
    id: 'desert',
    starsRequired: 30,
    name: { ar: 'نقطة الصحراء', en: 'Desert Outpost' },
    description: {
      ar: 'رمال صحراوية دافئة وصخور وأسفلت مشمس بتفاصيل واضحة.',
      en: 'Warm canyon sandstone outpost with sun-baked asphalt contrast.',
    },
    previewBg: 'linear-gradient(135deg, #a16207 0%, #451a03 55%, #241e1a 100%)',
    accentColor: '#facc15',
  },
  {
    id: 'cyber',
    starsRequired: 45,
    name: { ar: 'دورية النيون', en: 'Neon Precinct' },
    description: {
      ar: 'تصميم مستقبلي داكن بإضاءة سيان وماجنتا ساطعة وكشافات ليلية.',
      en: 'Futuristic obsidian grid with electric cyan & magenta rim beacons.',
    },
    previewBg: 'linear-gradient(135deg, #083344 0%, #3b0764 55%, #090d16 100%)',
    accentColor: '#22d3ee',
  },
  {
    id: 'autumn',
    starsRequired: 65,
    name: { ar: 'حديقة الخريف', en: 'Autumn Maple' },
    description: {
      ar: 'أشجار القيقب الخريفية بألوان البرتقالي والقرمزي الدافئة.',
      en: 'Warm copper and crimson maple parkway surrounding clean slate tarmac.',
    },
    previewBg: 'linear-gradient(135deg, #9a3412 0%, #7c2d12 52%, #1c1917 100%)',
    accentColor: '#f97316',
  },
];

export interface AchievementStats {
  solvedCount: number;
  totalStars: number;
  noHintThreeStarCount: number;
  timedWins: number;
  limitedWins: number;
  dailyCount: number;
  dailyStreak: number;
}

export interface AchievementDef {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  target: number;
  getProgress: (stats: AchievementStats) => number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_escape',
    title: { ar: 'أول مهمة ناجحة', en: 'First Breakout' },
    description: { ar: 'أخرج سيارة الشرطة في أول مرحلة.', en: 'Complete your very first stage.' },
    target: 1,
    getProgress: (s) => s.solvedCount,
  },
  {
    id: 'rookie_10',
    title: { ar: 'ضابط مبتدئ', en: 'Rookie Officer' },
    description: { ar: 'أتمم 10 مراحل بنجاح.', en: 'Solve 10 different stages.' },
    target: 10,
    getProgress: (s) => s.solvedCount,
  },
  {
    id: 'sergeant_50',
    title: { ar: 'رقيب مرور', en: 'Traffic Sergeant' },
    description: { ar: 'أتمم 50 مرحلة بنجاح.', en: 'Solve 50 different stages.' },
    target: 50,
    getProgress: (s) => s.solvedCount,
  },
  {
    id: 'captain_150',
    title: { ar: 'قائد الموقف', en: 'Precinct Captain' },
    description: { ar: 'أتمم 150 مرحلة بنجاح.', en: 'Solve 150 different stages.' },
    target: 150,
    getProgress: (s) => s.solvedCount,
  },
  {
    id: 'chief_360',
    title: { ar: 'اللواء المحترف', en: 'Grand Commissioner' },
    description: { ar: 'أتمم جميع المراحل الـ 360 بالكامل.', en: 'Solve all 360 stages.' },
    target: 360,
    getProgress: (s) => s.solvedCount,
  },
  {
    id: 'stars_50',
    title: { ar: 'جامع النجوم', en: 'Star Collector' },
    description: { ar: 'اجمع 50 نجمة عبر المراحل.', en: 'Collect 50 total stars.' },
    target: 50,
    getProgress: (s) => s.totalStars,
  },
  {
    id: 'stars_300',
    title: { ar: 'أسطورة النجوم', en: 'Star Legend' },
    description: { ar: 'اجمع 300 نجمة عبر المراحل.', en: 'Collect 300 total stars.' },
    target: 300,
    getProgress: (s) => s.totalStars,
  },
  {
    id: 'pure_tactician',
    title: { ar: 'تكتيكي بلا تلميحات', en: 'Pure Tactician' },
    description: {
      ar: 'احصل على 3 نجوم في 5 مراحل دون استخدام أي هينت.',
      en: 'Earn 3 stars on 5 stages without using any hints.',
    },
    target: 5,
    getProgress: (s) => s.noHintThreeStarCount,
  },
  {
    id: 'speed_interceptor',
    title: { ar: 'سريع الاستجابة', en: 'Speed Interceptor' },
    description: {
      ar: 'فُز في وضع تحدي الوقت 3 مرات.',
      en: 'Win 3 stages in Time Attack mode.',
    },
    target: 3,
    getProgress: (s) => s.timedWins,
  },
  {
    id: 'strict_commander',
    title: { ar: 'خبير الحركات الدقيقة', en: 'Precision Driver' },
    description: {
      ar: 'فُز في وضع الحركات المحدودة 3 مرات.',
      en: 'Win 3 stages in Strict Moves mode.',
    },
    target: 3,
    getProgress: (s) => s.limitedWins,
  },
  {
    id: 'daily_hero',
    title: { ar: 'بطل اليوم', en: 'Daily Responder' },
    description: {
      ar: 'أكمل تحدي اليوم العالمي بنجاح.',
      en: 'Complete a Global Daily Challenge.',
    },
    target: 1,
    getProgress: (s) => s.dailyCount,
  },
  {
    id: 'streak_3',
    title: { ar: 'انضباط متواصل', en: '3-Day Streak' },
    description: {
      ar: 'حقق سلسلة 3 أيام متتالية في تحدي اليوم.',
      en: 'Reach a 3-day streak in Daily Challenges.',
    },
    target: 3,
    getProgress: (s) => s.dailyStreak,
  },
];

export function getUtcDateKey(date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getDailyChallengeLevelId(dateKey: string): number {
  let hash = 2166136261;
  for (let i = 0; i < dateKey.length; i++) {
    hash ^= dateKey.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const unsigned = hash >>> 0;
  // Pick a compelling intermediate/advanced stage between 45 and 345
  return 45 + (unsigned % 301);
}

function addUtcDays(dateKey: string, deltaDays: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + deltaDays));
  return getUtcDateKey(dt);
}

export function computeDailyStreak(completedDates: string[], todayKey: string): number {
  const set = new Set(completedDates);
  let cursor = set.has(todayKey) ? todayKey : addUtcDays(todayKey, -1);
  if (!set.has(cursor)) return 0;
  let streak = 0;
  while (set.has(cursor)) {
    streak++;
    cursor = addUtcDays(cursor, -1);
  }
  return streak;
}

export function evaluateNewAchievements(
  alreadyUnlocked: string[],
  stats: AchievementStats
): string[] {
  const unlockedSet = new Set(alreadyUnlocked);
  const newlyUnlocked: string[] = [];
  for (const ach of ACHIEVEMENTS) {
    if (!unlockedSet.has(ach.id) && ach.getProgress(stats) >= ach.target) {
      newlyUnlocked.push(ach.id);
    }
  }
  return newlyUnlocked;
}

export function getTimeLimitSeconds(difficulty: Difficulty, optimalMoves: number): number {
  if (difficulty === 'beginner') {
    return Math.max(20, Math.round(12 + optimalMoves * 2.4));
  }
  if (difficulty === 'intermediate') {
    return Math.max(50, Math.round(24 + optimalMoves * 3.4));
  }
  return Math.max(95, Math.round(45 + optimalMoves * 4.5));
}

export function getMaxMovesBudget(difficulty: Difficulty, optimalMoves: number): number {
  if (difficulty === 'beginner') return optimalMoves + 2;
  if (difficulty === 'intermediate') return optimalMoves + 3;
  return optimalMoves + 4;
}
