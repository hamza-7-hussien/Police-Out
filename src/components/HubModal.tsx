import React, { useEffect, useState } from 'react';
import { AppUser } from '../supabase';
import {
  Award,
  BookOpen,
  Calendar,
  Check,
  Clock,
  Cloud,
  Flame,
  Footprints,
  Lock,
  Palette,
  Play,
  RefreshCw,
  Shield,
  Star,
  Trophy,
  X,
} from 'lucide-react';
import {
  fetchDailyLeaderboardPage,
  fetchLeaderboardPage,
} from '../game/cloudSync';
import {
  ACHIEVEMENTS,
  AchievementStats,
  BOARD_THEMES,
  getDailyChallengeLevelId,
  getUtcDateKey,
} from '../game/features';
import { getLevelById } from '../game/levels';
import {
  BoardTheme,
  DailyScoreEntry,
  GameMode,
  Language,
  LeaderboardEntry,
} from '../game/types';
import { LeaderboardListSkeleton } from './Skeleton';

export type HubTab = 'modes' | 'daily' | 'leaderboard' | 'achievements' | 'themes';

interface HubModalProps {
  language: Language;
  initialTab?: HubTab;
  gameMode: GameMode;
  user: AppUser | null;
  totalStars: number;
  solvedCount: number;
  selectedTheme: BoardTheme;
  unlockedAchievements: string[];
  achievementStats: AchievementStats;
  dailyCompletedDates: string[];
  dailyStreak: number;
  onSwitchMode: (mode: GameMode) => void;
  onStartTutorial: () => void;
  onSelectTheme: (theme: BoardTheme) => void;
  onStartDaily: (levelId: number, dateKey: string) => void;
  onOpenAuth: () => void;
  onClose: () => void;
}

const HUB_COPY = {
  ar: {
    title: 'قائمة اللعب والتحديات',
    tabs: {
      modes: 'الأوضاع',
      daily: 'تحدي اليوم',
      leaderboard: 'المتصدرون',
      achievements: 'الإنجازات',
      themes: 'الثيمات',
    },
    modesTitle: 'اختر وضع اللعب',
    modesActive: 'مفعّل',
    modesList: [
      {
        id: 'classic' as GameMode,
        title: 'الوضع الكلاسيكي',
        desc: 'العب جميع المراحل الـ 360 بهدوء وبلا مؤقت.',
      },
      {
        id: 'timed' as GameMode,
        title: 'تحدي الوقت',
        desc: 'وقت يتناسب مع مستوى الصعوبة (مبتدئ / متوسط / متقدم).',
      },
      {
        id: 'limited' as GameMode,
        title: 'حركات محدودة',
        desc: 'حد أقصى للحركات متدرج حسب صعوبة المرحلة.',
      },
      {
        id: 'daily' as GameMode,
        title: 'تحدي اليوم العالمي',
        desc: 'مرحلة يومية موحدة لجميع اللاعبين مع لوحة ترتيب.',
      },
    ],
    tutorialBtn: 'إعادة شرح طريقة اللعب (التعليم)',
    dailyDate: 'تاريخ التحدي (UTC)',
    dailyStage: 'المرحلة المختارة',
    dailyStreakLabel: 'سلسلة الأيام',
    dailyDays: 'يوم',
    dailyCompleted: 'تم إنجاز تحدي اليوم!',
    dailyPlayBtn: 'ابدأ تحدي اليوم الآن',
    dailyReplayBtn: 'أعد المحاولة لتحسين رقمك',
    dailyScoresTitle: 'أفضل نتائج اليوم عالمياً',
    dailySignInNote: 'سجّل الدخول بحساب مفعّل لتسجيل رقمك ومشاهدة نتائج اللاعبين اليومية.',
    lbTitle: 'أبطال Police Out عالمياً',
    lbRefresh: 'تحديث',
    lbSignInNote: 'سجّل الدخول بحساب مفعّل لمشاهدة لوحة المتصدرين العالمية ومنافسة اللاعبين.',
    lbEmpty: 'لا توجد نتائج مسجلة بعد — كن أول من يتصدر القائمة!',
    lbStars: 'نجمة',
    lbStages: 'مرحلة',
    achUnlocked: 'مفتوحة',
    themeActive: 'مفعّل حالياً',
    themeSelect: 'تفعيل الثيم',
    themeLocked: 'يُفتح عند',
    themeStarsUnit: 'نجمة',
    movesUnit: 'حركة',
    secUnit: 'ث',
    close: 'إغلاق',
    signInCta: 'تسجيل الدخول الآن',
    loading: 'جارٍ التحميل...',
    loadMore: 'عرض المزيد (20)',
    loadingMore: 'جارٍ تحميل المزيد...',
    difficulty: {
      beginner: 'مبتدئ',
      intermediate: 'متوسط',
      advanced: 'متقدم',
    },
  },
  en: {
    title: 'Modes & Challenges',
    tabs: {
      modes: 'Modes',
      daily: 'Daily',
      leaderboard: 'Rankings',
      achievements: 'Badges',
      themes: 'Themes',
    },
    modesTitle: 'Choose Game Mode',
    modesActive: 'Active',
    modesList: [
      {
        id: 'classic' as GameMode,
        title: 'Classic Mode',
        desc: 'Solve all 360 stages at your own pace with no timer.',
      },
      {
        id: 'timed' as GameMode,
        title: 'Time Attack',
        desc: 'Difficulty-calibrated timer across Beginner, Intermediate & Advanced.',
      },
      {
        id: 'limited' as GameMode,
        title: 'Max Moves',
        desc: 'Difficulty-scaled move budget to escape the precinct.',
      },
      {
        id: 'daily' as GameMode,
        title: 'Daily Challenge',
        desc: 'One global stage per day ranked across all players.',
      },
    ],
    tutorialBtn: 'How to Play (Interactive Tutorial)',
    dailyDate: 'Challenge Date (UTC)',
    dailyStage: 'Featured Stage',
    dailyStreakLabel: 'Current Streak',
    dailyDays: 'days',
    dailyCompleted: 'Today’s Challenge Completed!',
    dailyPlayBtn: 'Play Daily Challenge',
    dailyReplayBtn: 'Replay for a Better Score',
    dailyScoresTitle: 'Today’s Global Top Scores',
    dailySignInNote: 'Sign in with a verified account to submit your score and see today’s rankings.',
    lbTitle: 'Global Top Officers',
    lbRefresh: 'Refresh',
    lbSignInNote: 'Sign in with a verified account to compete on the Global Leaderboard.',
    lbEmpty: 'No entries yet — be the first to claim the #1 spot!',
    lbStars: 'stars',
    lbStages: 'stages',
    achUnlocked: 'unlocked',
    themeActive: 'Active',
    themeSelect: 'Select Theme',
    themeLocked: 'Requires',
    themeStarsUnit: 'stars',
    movesUnit: 'moves',
    secUnit: 's',
    close: 'Close',
    signInCta: 'Sign In Now',
    loading: 'Loading...',
    loadMore: 'Load More (20)',
    loadingMore: 'Loading more...',
    difficulty: {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
    },
  },
};

function modeIcon(mode: GameMode) {
  if (mode === 'timed') return Clock;
  if (mode === 'limited') return Footprints;
  if (mode === 'daily') return Calendar;
  return Shield;
}

export const HubModal: React.FC<HubModalProps> = ({
  language,
  initialTab = 'modes',
  gameMode,
  user,
  totalStars,
  selectedTheme,
  unlockedAchievements,
  achievementStats,
  dailyCompletedDates,
  dailyStreak,
  onSwitchMode,
  onStartTutorial,
  onSelectTheme,
  onStartDaily,
  onOpenAuth,
  onClose,
}) => {
  const t = HUB_COPY[language];
  const [tab, setTab] = useState<HubTab>(initialTab);
  const [lbRows, setLbRows] = useState<LeaderboardEntry[]>([]);
  const [lbCursor, setLbCursor] = useState<number | null>(null);
  const [lbHasMore, setLbHasMore] = useState(false);

  const [dailyRows, setDailyRows] = useState<DailyScoreEntry[]>([]);
  const [dailyCursor, setDailyCursor] = useState<number | null>(null);
  const [dailyHasMore, setDailyHasMore] = useState(false);

  const [loadingCloud, setLoadingCloud] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const todayKey = getUtcDateKey();
  const dailyLevelId = getDailyChallengeLevelId(todayKey);
  const dailyLevel = getLevelById(dailyLevelId);
  const dailyAlreadySolved = dailyCompletedDates.includes(todayKey);

  const loadCloudLists = async (targetTab: HubTab, forceRefresh = false, append = false) => {
    if (!user?.emailVerified) return;
    if (append) {
      setLoadingMore(true);
    } else {
      setLoadingCloud(true);
    }
    try {
      if (targetTab === 'leaderboard') {
        const res = await fetchLeaderboardPage(append ? lbCursor : null, forceRefresh);
        setLbRows((prev) => {
          if (!append) return res.entries;
          const seen = new Set(prev.map((r) => r.uid));
          return [...prev, ...res.entries.filter((r) => !seen.has(r.uid))];
        });
        setLbCursor(res.nextCursor);
        setLbHasMore(res.hasMore);
      } else if (targetTab === 'daily') {
        const res = await fetchDailyLeaderboardPage(
          todayKey,
          append ? dailyCursor : null,
          forceRefresh
        );
        setDailyRows((prev) => {
          if (!append) return res.entries;
          const seen = new Set(prev.map((r) => r.userId));
          return [...prev, ...res.entries.filter((r) => !seen.has(r.userId))];
        });
        setDailyCursor(res.nextCursor);
        setDailyHasMore(res.hasMore);
      }
    } catch (err) {
      console.error('Failed to load cloud leaderboard:', err);
    } finally {
      setLoadingCloud(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (tab === 'leaderboard' || tab === 'daily') {
      void loadCloudLists(tab, false, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, user?.uid, user?.emailVerified]);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl max-h-[88dvh] rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-800 shrink-0">
          <h2 className="text-base sm:text-lg font-extrabold text-white leading-snug">
            {t.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="min-w-[40px] min-h-[40px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wrapping Tab Bar — zero truncation on mobile screens */}
        <div className="px-4 pt-3 shrink-0">
          <div className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
            {(
              [
                { id: 'modes', icon: Shield, label: t.tabs.modes },
                { id: 'daily', icon: Calendar, label: t.tabs.daily },
                { id: 'leaderboard', icon: Trophy, label: t.tabs.leaderboard },
                { id: 'achievements', icon: Award, label: t.tabs.achievements },
                { id: 'themes', icon: Palette, label: t.tabs.themes },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`flex-1 min-w-[96px] min-h-[40px] px-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-amber-400 text-slate-950 shadow'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {tab === 'modes' && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-400">{t.modesTitle}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {t.modesList.map((m) => {
                  const Icon = modeIcon(m.id);
                  const active = gameMode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        onSwitchMode(m.id);
                        onClose();
                      }}
                      className={`text-start p-3.5 rounded-2xl border transition-colors cursor-pointer flex items-start gap-3 ${
                        active
                          ? 'bg-amber-400/15 border-amber-400/60'
                          : 'bg-slate-950/65 hover:bg-slate-800/80 border-slate-800'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          active
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-extrabold text-white">
                            {m.title}
                          </span>
                          {active && (
                            <span className="text-[11px] font-extrabold text-amber-300 shrink-0">
                              {t.modesActive}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {m.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartTutorial();
                }}
                className="w-full min-h-[46px] px-4 rounded-2xl bg-slate-950/75 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-extrabold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{t.tutorialBtn}</span>
              </button>
            </div>
          )}

          {tab === 'daily' && (
            <>
              <div className="p-4 rounded-2xl bg-slate-950/75 border border-slate-800 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="text-xs text-slate-400">
                      {t.dailyDate} · <span className="font-num text-sky-300">{todayKey}</span>
                    </div>
                    <div className="text-lg font-extrabold text-white mt-0.5">
                      {t.dailyStage} <span className="font-num text-amber-300">#{dailyLevelId}</span>
                      <span className="text-xs text-slate-400 font-semibold ms-2">
                        ({t.difficulty[dailyLevel.difficulty]})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-400/10 border border-amber-400/30">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <div className="text-xs">
                      <span className="text-slate-300">{t.dailyStreakLabel}: </span>
                      <span className="font-num font-extrabold text-amber-300">
                        {dailyStreak}
                      </span>{' '}
                      <span className="text-slate-400">{t.dailyDays}</span>
                    </div>
                  </div>
                </div>

                {dailyAlreadySolved && (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <Check className="w-4 h-4" />
                    <span>{t.dailyCompleted}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    onStartDaily(dailyLevelId, todayKey);
                    onClose();
                  }}
                  className="w-full min-h-[48px] rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{dailyAlreadySolved ? t.dailyReplayBtn : t.dailyPlayBtn}</span>
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-sm font-extrabold text-white">{t.dailyScoresTitle}</h3>
                  {user?.emailVerified && (
                    <button
                      type="button"
                      onClick={() => void loadCloudLists('daily', true, false)}
                      className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingCloud ? 'animate-spin' : ''}`} />
                      <span>{t.lbRefresh}</span>
                    </button>
                  )}
                </div>

                {!user?.emailVerified ? (
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-3">
                    <Cloud className="w-6 h-6 text-sky-400 mx-auto" />
                    <p className="text-xs text-slate-300">{t.dailySignInNote}</p>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAuth();
                      }}
                      className="min-h-[40px] px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs cursor-pointer"
                    >
                      {t.signInCta}
                    </button>
                  </div>
                ) : loadingCloud && dailyRows.length === 0 ? (
                  <LeaderboardListSkeleton rows={5} />
                ) : dailyRows.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">{t.lbEmpty}</p>
                ) : (
                  <div className="space-y-2">
                    {dailyRows.map((row, idx) => (
                      <div
                        key={row.userId}
                        className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border ${
                          row.userId === user.uid
                            ? 'bg-sky-500/15 border-sky-400/40'
                            : 'bg-slate-950/60 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-6 text-center font-num text-xs font-extrabold text-amber-300 shrink-0">
                            #{idx + 1}
                          </span>
                          {row.photoURL ? (
                            <img
                              src={row.photoURL}
                              alt=""
                              loading="lazy"
                              decoding="async"
                              referrerPolicy="no-referrer"
                              className="w-8 h-8 rounded-lg object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-200 text-xs font-extrabold flex items-center justify-center shrink-0">
                              {row.displayName.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <span className="text-sm font-bold text-white truncate">
                            {row.displayName}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-num shrink-0">
                          <span className="text-emerald-400 font-bold">
                            {row.moves} {t.movesUnit}
                          </span>
                          <span className="text-slate-400">
                            {row.timeSeconds}{t.secUnit}
                          </span>
                        </div>
                      </div>
                    ))}
                    {dailyHasMore && (
                      <button
                        type="button"
                        disabled={loadingMore}
                        onClick={() => void loadCloudLists('daily', false, true)}
                        className="w-full min-h-[42px] rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-bold text-sky-300 transition-colors cursor-pointer"
                      >
                        {loadingMore ? t.loadingMore : t.loadMore}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {tab === 'leaderboard' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-extrabold text-white">{t.lbTitle}</h3>
                {user?.emailVerified && (
                  <button
                    type="button"
                    onClick={() => void loadCloudLists('leaderboard', true, false)}
                    className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingCloud ? 'animate-spin' : ''}`} />
                    <span>{t.lbRefresh}</span>
                  </button>
                )}
              </div>

              {!user?.emailVerified ? (
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-3">
                  <Trophy className="w-8 h-8 text-amber-400 mx-auto" />
                  <p className="text-xs text-slate-300 leading-relaxed">{t.lbSignInNote}</p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    className="min-h-[42px] px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs cursor-pointer"
                  >
                    {t.signInCta}
                  </button>
                </div>
              ) : loadingCloud && lbRows.length === 0 ? (
                <LeaderboardListSkeleton rows={6} />
              ) : lbRows.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">{t.lbEmpty}</p>
              ) : (
                <div className="space-y-2">
                  {lbRows.map((entry, idx) => (
                    <div
                      key={entry.uid}
                      className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border ${
                        entry.uid === user.uid
                          ? 'bg-emerald-500/15 border-emerald-400/40'
                          : 'bg-slate-950/65 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-7 text-center font-num text-xs font-extrabold shrink-0 ${
                            idx === 0
                              ? 'text-amber-300'
                              : idx === 1
                                ? 'text-slate-200'
                                : idx === 2
                                  ? 'text-amber-600'
                                  : 'text-slate-500'
                          }`}
                        >
                          #{idx + 1}
                        </span>
                        {entry.photoURL ? (
                          <img
                            src={entry.photoURL}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-xl object-cover shrink-0 border border-slate-700"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-200 text-xs font-extrabold flex items-center justify-center shrink-0">
                            {entry.displayName.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-white truncate">
                            {entry.displayName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-num">
                            {entry.solvedCount}/360 {t.lbStages}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 font-num text-sm font-extrabold text-amber-300 shrink-0">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span>{entry.totalStars}</span>
                      </div>
                    </div>
                  ))}
                  {lbHasMore && (
                    <button
                      type="button"
                      disabled={loadingMore}
                      onClick={() => void loadCloudLists('leaderboard', false, true)}
                      className="w-full min-h-[42px] rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-bold text-sky-300 transition-colors cursor-pointer"
                    >
                      {loadingMore ? t.loadingMore : t.loadMore}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {tab === 'achievements' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-300">
                  <span className="font-num text-amber-300">{unlockedAchievements.length}</span> /{' '}
                  <span className="font-num">{ACHIEVEMENTS.length}</span> {t.achUnlocked}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ACHIEVEMENTS.map((ach) => {
                  const unlocked = unlockedAchievements.includes(ach.id);
                  const currentVal = Math.min(ach.target, ach.getProgress(achievementStats));
                  const pct = Math.round((currentVal / ach.target) * 100);
                  return (
                    <div
                      key={ach.id}
                      className={`p-3.5 rounded-2xl border transition-colors ${
                        unlocked
                          ? 'bg-amber-400/10 border-amber-400/40'
                          : 'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              unlocked
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            <Award className="w-4 h-4" />
                          </div>
                          <div className="text-xs font-extrabold text-white leading-snug">
                            {ach.title[language]}
                          </div>
                        </div>
                        <span className="font-num text-[11px] font-bold text-slate-400 shrink-0">
                          {currentVal}/{ach.target}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug mb-2">
                        {ach.description[language]}
                      </p>
                      <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            unlocked ? 'bg-amber-400' : 'bg-sky-500/70'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'themes' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BOARD_THEMES.map((themeItem) => {
                const isUnlocked = totalStars >= themeItem.starsRequired;
                const isSelected = selectedTheme === themeItem.id;
                return (
                  <div
                    key={themeItem.id}
                    className={`rounded-2xl border p-3.5 flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-slate-800/80 border-amber-400/60'
                        : 'bg-slate-950/65 border-slate-800'
                    }`}
                  >
                    <div>
                      <div
                        className="h-20 w-full rounded-xl mb-3 border border-white/10 relative overflow-hidden flex items-end p-2.5"
                        style={{ background: themeItem.previewBg }}
                      >
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: themeItem.accentColor,
                            boxShadow: `0 0 12px ${themeItem.accentColor}`,
                          }}
                        />
                      </div>
                      <h3 className="text-sm font-extrabold text-white">
                        {themeItem.name[language]}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {themeItem.description[language]}
                      </p>
                    </div>

                    {isUnlocked ? (
                      <button
                        type="button"
                        onClick={() => onSelectTheme(themeItem.id)}
                        className={`w-full min-h-[42px] rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300'
                            : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                        }`}
                      >
                        {isSelected && <Check className="w-4 h-4" />}
                        <span>{isSelected ? t.themeActive : t.themeSelect}</span>
                      </button>
                    ) : (
                      <div className="w-full min-h-[42px] rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold flex items-center justify-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        <span>
                          {t.themeLocked}{' '}
                          <span className="font-num text-amber-300">
                            {themeItem.starsRequired}
                          </span>{' '}
                          {t.themeStarsUnit}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
