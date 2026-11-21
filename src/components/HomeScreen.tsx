import React, { useState } from 'react';
import { AppUser } from '../supabase';
import {
  BookOpen,
  Calendar,
  Clock,
  Cloud,
  Footprints,
  Globe,
  Grid3X3,
  Hash,
  LogIn,
  Music,
  Palette,
  Play,
  Shield,
  Star,
  Trophy,
  UserCheck,
  Volume2,
  VolumeX,
} from 'lucide-react';
import gameLogo from '../assets/images/police_parking_logo.webp';
import {
  getDailyChallengeLevelId,
  getMaxMovesBudget,
  getTimeLimitSeconds,
  getUtcDateKey,
} from '../game/features';
import { ALL_LEVELS } from '../game/levels';
import { Difficulty, GameMode, Language, LevelDef } from '../game/types';
import { PWAInstallButton } from './PWAControls';

interface HomeScreenProps {
  language: Language;
  muted: boolean;
  musicMuted: boolean;
  user: AppUser | null;
  currentLevel: LevelDef;
  optimalMoves: number;
  solvedTotal: number;
  totalStars: number;
  selectedMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  onStartGame: (mode: GameMode, levelId?: number) => void;
  onOpenLevels: () => void;
  onOpenHub: (tab: 'daily' | 'leaderboard' | 'achievements' | 'themes') => void;
  onStartTutorial: () => void;
  onOpenAuth: () => void;
  onToggleLanguage: () => void;
  onToggleMute: () => void;
  onToggleMusic: () => void;
}

const COPY = {
  ar: {
    appTitle: 'Police Out',
    appSub: 'لغز تحريك السيارات · 360 مرحلة',
    account: 'حسابي',
    verify: 'تفعيل',
    signIn: 'دخول',
    solved: 'مرحلة منجزة',
    stars: 'نجمة',
    activeMission: 'المهمة المختارة',
    stageWord: 'مرحلة',
    stageCodePlaceholder: 'رقم المرحلة (1-360)',
    goCodeBtn: 'تشغيل',
    chooseModeTitle: 'اختر وضع اللعب',
    startBtn: 'ابدأ اللعب · Start',
    stagesCard: 'كل المراحل',
    stagesSub: '1 - 360 مرحلة',
    hubCard: 'التحديات والمتصدرون',
    hubSub: 'الترتيب والإنجازات',
    themesCard: 'الثيمات والأجواء',
    themesSub: '8 ثيمات وأجواء متنوعة',
    tutorialCard: 'طريقة اللعب',
    tutorialSub: 'شرح تفاعلي سريع',
    difficulty: {
      beginner: 'مبتدئ',
      intermediate: 'متوسط',
      advanced: 'متقدم',
    },
    modes: {
      classic: { label: 'الكلاسيكي', hint: 'بدون مؤقت' },
      timed: { label: 'تحدي الوقت', hint: 'حسب الصعوبة' },
      limited: { label: 'حركات محدودة', hint: 'سقف خطوات' },
      daily: { label: 'تحدي اليوم', hint: 'لغز عالمي' },
    },
  },
  en: {
    appTitle: 'Police Out',
    appSub: 'Sliding Vehicle Puzzle · 360 Stages',
    account: 'Account',
    verify: 'Verify',
    signIn: 'Sign In',
    solved: 'Solved',
    stars: 'Stars',
    activeMission: 'Selected Mission',
    stageWord: 'Stage',
    stageCodePlaceholder: 'Stage # (1-360)',
    goCodeBtn: 'Go',
    chooseModeTitle: 'Select Game Mode',
    startBtn: 'Start Game',
    stagesCard: 'All Stages',
    stagesSub: 'Stages 1 - 360',
    hubCard: 'Challenges & Ranks',
    hubSub: 'Leaderboard & Badges',
    themesCard: 'Board Themes',
    themesSub: '8 distinct environments',
    tutorialCard: 'How to Play',
    tutorialSub: 'Quick interactive guide',
    difficulty: {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
    },
    modes: {
      classic: { label: 'Classic', hint: 'No timer' },
      timed: { label: 'Time Attack', hint: 'Scaled timer' },
      limited: { label: 'Max Moves', hint: 'Move budget' },
      daily: { label: 'Daily', hint: 'Global stage' },
    },
  },
};

function difficultyBadgeClass(d: Difficulty): string {
  if (d === 'beginner') return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35';
  if (d === 'intermediate') return 'bg-amber-400/15 text-amber-300 border-amber-400/35';
  return 'bg-rose-500/15 text-rose-300 border-rose-500/35';
}

function formatSecShort(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  language,
  muted,
  musicMuted,
  user,
  currentLevel,
  optimalMoves,
  solvedTotal,
  totalStars,
  selectedMode,
  onSelectMode,
  onStartGame,
  onOpenLevels,
  onOpenHub,
  onStartTutorial,
  onOpenAuth,
  onToggleLanguage,
  onToggleMute,
  onToggleMusic,
}) => {
  const t = COPY[language];
  const [logoError, setLogoError] = useState(false);
  const [stageJumpInput, setStageJumpInput] = useState('');

  const dailyStageId = getDailyChallengeLevelId(getUtcDateKey());
  const previewTimedStr = formatSecShort(
    getTimeLimitSeconds(currentLevel.difficulty, optimalMoves)
  );
  const previewMoveLimit = getMaxMovesBudget(currentLevel.difficulty, optimalMoves);

  const handleStageJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(stageJumpInput.trim());
    if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= ALL_LEVELS.length) {
      const targetId = Math.floor(parsed);
      const modeToLaunch = selectedMode === 'daily' ? 'classic' : selectedMode;
      onStartGame(modeToLaunch, targetId);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#0e131b] text-slate-100 flex flex-col relative overflow-x-hidden">
      {/* Ambient precinct spotlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.12),transparent_58%),radial-gradient(ellipse_at_bottom,rgba(250,204,21,0.06),transparent_55%)]"
      />

      <div className="relative z-10 w-full max-w-xl mx-auto px-4 sm:px-6 pt-[max(env(safe-area-inset-top),0.85rem)] pb-[max(env(safe-area-inset-bottom),1rem)] sm:py-6 flex-1 flex flex-col justify-between gap-4">
        {/* Clean Uncluttered Top Bar */}
        <header className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-amber-400 shadow-lg shrink-0 overflow-hidden">
              {!logoError ? (
                <img
                  src={gameLogo}
                  alt={t.appTitle}
                  width={44}
                  height={44}
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={() => setLogoError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Shield className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-extrabold tracking-tight text-white whitespace-nowrap leading-tight">
                {t.appTitle}
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate leading-tight">
                {t.appSub}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <PWAInstallButton language={language} />

            <button
              type="button"
              onClick={onToggleMusic}
              aria-label={musicMuted ? 'Enable music' : 'Mute music'}
              title={language === 'ar' ? 'الموسيقى الهادئة' : 'Background Music'}
              className={`relative min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                musicMuted
                  ? 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                  : 'bg-amber-400/15 border-amber-400/35 text-amber-300 hover:bg-amber-400/25'
              }`}
            >
              <Music className="w-4 h-4" />
              {musicMuted && (
                <span className="pointer-events-none absolute w-5 h-[2px] bg-slate-500 rotate-45 rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={onToggleMute}
              aria-label={muted ? 'Unmute SFX' : 'Mute SFX'}
              title={language === 'ar' ? 'الأصوات' : 'Sound Effects'}
              className="min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onToggleLanguage}
              aria-label="Toggle language"
              className="min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] px-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer font-num"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'EN' : 'AR'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenAuth}
              aria-label={t.account}
              className={`min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                user?.emailVerified
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                  : user && !user.emailVerified
                    ? 'bg-amber-400/15 border-amber-400/40 text-amber-300 hover:bg-amber-400/25'
                    : 'bg-sky-500/15 border-sky-500/40 text-sky-300 hover:bg-sky-500/25'
              }`}
            >
              {user?.emailVerified ? (
                user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 rounded-md object-cover"
                  />
                ) : (
                  <UserCheck className="w-4 h-4" />
                )
              ) : user ? (
                <Cloud className="w-4 h-4" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {user?.emailVerified ? t.account : user ? t.verify : t.signIn}
              </span>
            </button>
          </div>
        </header>

        {/* Main Center Stack */}
        <main className="flex-1 flex flex-col justify-center gap-3.5">
          {/* Player Progress Strip */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 px-3.5 py-2.5 flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-400">{t.solved}</span>
              <span className="font-num text-sm sm:text-base font-extrabold text-white">
                {solvedTotal}<span className="text-slate-500 text-xs">/360</span>
              </span>
            </div>
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 px-3.5 py-2.5 flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-400">{t.stars}</span>
              <span className="font-num text-sm sm:text-base font-extrabold text-amber-300 inline-flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                {totalStars}
              </span>
            </div>
          </div>

          {/* Primary Mission & Start Card */}
          <section className="rounded-3xl bg-slate-900/90 border border-slate-700/80 p-4 sm:p-5 shadow-2xl space-y-4">
            {/* Active Stage Display */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="text-[11px] font-bold text-slate-400 mb-1">
                  {t.activeMission}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-extrabold text-white whitespace-nowrap">
                    {t.stageWord}{' '}
                    <span className="font-num text-amber-300">
                      #{selectedMode === 'daily' ? dailyStageId : currentLevel.id}
                    </span>
                  </span>
                  {selectedMode !== 'daily' && (
                    <span
                      className={`text-[11px] font-extrabold px-2 py-0.5 rounded-lg border ${difficultyBadgeClass(
                        currentLevel.difficulty
                      )}`}
                    >
                      {t.difficulty[currentLevel.difficulty]}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stage Number Jump Input */}
            <form onSubmit={handleStageJumpSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Hash className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3 pointer-events-none" />
                <input
                  type="number"
                  min={1}
                  max={360}
                  inputMode="numeric"
                  value={stageJumpInput}
                  onChange={(e) => setStageJumpInput(e.target.value)}
                  placeholder={t.stageCodePlaceholder}
                  className="w-full min-h-[42px] ps-9 pe-3 rounded-xl bg-slate-950/90 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-num"
                />
              </div>
              <button
                type="submit"
                className="min-h-[42px] px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-extrabold text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                {t.goCodeBtn}
              </button>
            </form>

            {/* Game Mode Selector */}
            <div>
              <div className="text-xs font-bold text-slate-400 mb-2">
                {t.chooseModeTitle}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    {
                      id: 'classic' as GameMode,
                      icon: Shield,
                      meta: t.modes.classic.hint,
                    },
                    {
                      id: 'timed' as GameMode,
                      icon: Clock,
                      meta: `${previewTimedStr} · ${t.modes.timed.hint}`,
                    },
                    {
                      id: 'limited' as GameMode,
                      icon: Footprints,
                      meta: `${previewMoveLimit} · ${t.modes.limited.hint}`,
                    },
                    {
                      id: 'daily' as GameMode,
                      icon: Calendar,
                      meta: `#${dailyStageId} · ${t.modes.daily.hint}`,
                    },
                  ] as const
                ).map((item) => {
                  const Icon = item.icon;
                  const active = selectedMode === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectMode(item.id)}
                      className={`p-3 rounded-2xl border text-start transition-all cursor-pointer flex items-center gap-2.5 ${
                        active
                          ? 'bg-amber-400/15 border-amber-400/70 shadow-[0_0_20px_rgba(250,204,21,0.12)]'
                          : 'bg-slate-950/65 hover:bg-slate-800/75 border-slate-800'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          active
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-extrabold text-white leading-tight">
                          {t.modes[item.id].label}
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 leading-tight font-num">
                          {item.meta}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Big Prominent START CTA */}
            <button
              type="button"
              onClick={() =>
                onStartGame(
                  selectedMode,
                  selectedMode === 'daily' ? dailyStageId : currentLevel.id
                )
              }
              className="w-full min-h-[56px] rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:brightness-105 active:scale-[0.99] text-slate-950 font-extrabold text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-[0_12px_30px_rgba(250,204,21,0.28)] transition-all cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{t.startBtn}</span>
            </button>
          </section>

          {/* Clean Secondary Feature Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onOpenLevels}
              className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/85 border border-slate-800 text-start flex items-center gap-3 transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0">
                <Grid3X3 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-extrabold text-white leading-tight">
                  {t.stagesCard}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                  {t.stagesSub}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onOpenHub('leaderboard')}
              className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/85 border border-slate-800 text-start flex items-center gap-3 transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-extrabold text-white leading-tight">
                  {t.hubCard}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                  {t.hubSub}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onOpenHub('themes')}
              className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/85 border border-slate-800 text-start flex items-center gap-3 transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <Palette className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-extrabold text-white leading-tight">
                  {t.themesCard}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                  {t.themesSub}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={onStartTutorial}
              className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/85 border border-slate-800 text-start flex items-center gap-3 transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-extrabold text-white leading-tight">
                  {t.tutorialCard}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                  {t.tutorialSub}
                </div>
              </div>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};
