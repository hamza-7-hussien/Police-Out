import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import {
  AlertTriangle,
  Award,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cloud,
  Eye,
  Footprints,
  Globe,
  Grid3X3,
  Home,
  Lightbulb,
  LogIn,
  Music,
  RotateCcw,
  Shield,
  Star,
  Undo2,
  UserCheck,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import gameLogo from './assets/images/police_parking_logo.webp';
import { AuthScreen } from './components/AuthScreen';
import { Board } from './components/Board';
import { HomeScreen } from './components/HomeScreen';
import { HubModal, HubTab } from './components/HubModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { OfflineIndicator, PWAInstallButton } from './components/PWAControls';
import { AppBootSkeleton } from './components/Skeleton';
import { SolutionBar } from './components/SolutionBar';
import { TutorialOverlay } from './components/TutorialOverlay';
import { VictoryModal } from './components/VictoryModal';
import {
  pushPreferencesToCloud,
  pushStageProgressToCloud,
  submitDailyScore,
  syncOnSignIn,
} from './game/cloudSync';
import { AppUser, supabase, toAppUser } from './supabase';
import {
  ACHIEVEMENTS,
  computeDailyStreak,
  evaluateNewAchievements,
  getDailyChallengeLevelId,
  getMaxMovesBudget,
  getTimeLimitSeconds,
  getUtcDateKey,
} from './game/features';
import { ALL_LEVELS, getLevelById, TUTORIAL_LEVEL } from './game/levels';
import { sound } from './game/sound';
import { applyMove, isGoalClear, solvePuzzle } from './game/solver';
import { computeStars, loadSavedState, SavedState, saveState } from './game/storage';
import {
  BoardTheme,
  Difficulty,
  EXIT_ROW,
  GameMode,
  Language,
  MoveStep,
  Vehicle,
} from './game/types';

const GUEST_STORAGE_KEY = 'police_parking_guest_v1';
const MUSIC_MUTED_STORAGE_KEY = 'police_out_music_muted_v1';

function formatClock(sec: number): string {
  const safe = Math.max(0, Math.floor(sec));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

interface SolutionState {
  active: boolean;
  mode: 'start' | 'current';
  steps: MoveStep[];
  snapshots: Vehicle[][];
  stepIndex: number;
  isPlaying: boolean;
  speed: 1 | 2;
  isOptimalPostWin: boolean;
}

const EMPTY_SOLUTION: SolutionState = {
  active: false,
  mode: 'current',
  steps: [],
  snapshots: [],
  stepIndex: 0,
  isPlaying: false,
  speed: 1,
  isOptimalPostWin: false,
};

const MAX_HINTS_PER_STAGE = 3;

const COPY = {
  ar: {
    appTitle: 'Police Out',
    appSub: 'لغز تحريك السيارات',
    homeLabel: 'الرئيسية',
    tutorialLabel: 'التعليم',
    stageWord: 'مرحلة',
    movesLabel: 'الحركات',
    bestLabel: 'الأفضل',
    parLabel: 'المثالي',
    undo: 'تراجع',
    reset: 'إعادة',
    hint: 'هينت',
    solution: 'الحل',
    optimalBtn: 'المثالي',
    stages: 'المراحل',
    difficulty: {
      beginner: 'مبتدئ',
      intermediate: 'متوسط',
      advanced: 'متقدم',
    },
    hintNote: 'اتبع الإطار المتوهج لتحريك السيارة المقترحة',
    noHintsLeft: 'استخدمت كل الهينتات المتاحة لهذه المرحلة',
    unsolvableNote: 'تراجع خطوة أو أعد المحاولة لإيجاد طريق الحل',
    solvedCount: 'منجز',
    backToGame: 'رجوع للعبة',
    accountLabel: 'حسابي',
    signInLabel: 'دخول',
    verifyLabel: 'تفعيل',
    hubBtn: 'التحديات والمتصدرون',
    themesBtn: 'الثيمات',
    modes: {
      classic: 'الكلاسيكي',
      timed: 'الوقت',
      limited: 'حركات محدودة',
      daily: 'تحدي اليوم',
    },
    timeLeftLabel: 'الوقت',
    limitLabel: 'الحد الأقصى',
    dailyTimerLabel: 'المؤقت',
    failTimeTitle: 'انتهى الوقت!',
    failTimeBody: 'انتهت مهلة تحدي الوقت قبل إخراج سيارة الشرطة. أعد المحاولة بسرعة أكبر أو عد للوضع الكلاسيكي.',
    failMovesTitle: 'نفدت الحركات المتاحة!',
    failMovesBody: 'استهلكت الحد الأقصى للحركات في هذا التحدي. أعد المحاولة للوصول إلى البوابة بحركات أقل.',
    retryBtn: 'إعادة المحاولة',
    backClassicBtn: 'الوضع الكلاسيكي',
    achievementUnlocked: 'تم فتح شارة جديدة:',
    solWarnTitle: 'تنبيه: ستخسر النجوم التلاتة!',
    solWarnBody:
      'لو شاهدت الحل الآن، ستفقد كل النجوم التلاتة وتُحسب المرحلة بـ 0 نجوم في هذه المحاولة. يمكنك إعادة المرحلة وحلها بنفسك لاحقاً لكسب النجوم.',
    solWarnCancel: 'رجوع للعب',
    solWarnConfirm: 'افتح الحل (0 نجوم)',
  },
  en: {
    appTitle: 'Police Out',
    appSub: 'Sliding Vehicle Puzzle',
    homeLabel: 'Home',
    tutorialLabel: 'Tutorial',
    stageWord: 'Stage',
    movesLabel: 'Moves',
    bestLabel: 'Best',
    parLabel: 'Optimal',
    undo: 'Undo',
    reset: 'Reset',
    hint: 'Hint',
    solution: 'Solution',
    optimalBtn: 'Optimal',
    stages: 'Stages',
    difficulty: {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
    },
    hintNote: 'Follow the highlighted slot for the optimal next move',
    noHintsLeft: 'No hints remaining for this stage',
    unsolvableNote: 'Undo a move or reset the stage to solve',
    solvedCount: 'Solved',
    backToGame: 'Back to Game',
    accountLabel: 'Account',
    signInLabel: 'Sign In',
    verifyLabel: 'Verify',
    hubBtn: 'Challenges & Ranks',
    themesBtn: 'Themes',
    modes: {
      classic: 'Classic',
      timed: 'Timed',
      limited: 'Max Moves',
      daily: 'Daily',
    },
    timeLeftLabel: 'Time Left',
    limitLabel: 'Budget',
    dailyTimerLabel: 'Elapsed',
    failTimeTitle: 'Time’s Up!',
    failTimeBody: 'The countdown hit zero before the police car escaped. Retry faster or switch back to Classic mode.',
    failMovesTitle: 'Out of Moves!',
    failMovesBody: 'You reached the strict move budget for this challenge. Retry to clear the exit within the limit.',
    retryBtn: 'Retry Stage',
    backClassicBtn: 'Classic Mode',
    achievementUnlocked: 'New Badge Unlocked:',
    solWarnTitle: 'Warning: Lose All 3 Stars!',
    solWarnBody:
      'Viewing the solution now will forfeit all 3 stars and score 0 stars for this attempt. You can replay the stage on your own later to earn stars.',
    solWarnCancel: 'Back to Game',
    solWarnConfirm: 'Show Solution (0 Stars)',
  },
};

function cloneVehicles(list: Vehicle[]): Vehicle[] {
  return list.map((v) => ({ ...v }));
}

function difficultyColorClass(d: Difficulty): string {
  if (d === 'beginner') return 'text-emerald-400';
  if (d === 'intermediate') return 'text-amber-400';
  return 'text-rose-400';
}

export default function App() {
  const [saved, setSaved] = useState<SavedState>(() => loadSavedState());
  const savedRef = useRef<SavedState>(saved);
  savedRef.current = saved;

  const [authUser, setAuthUser] = useState<AppUser | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [guestMode, setGuestMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(GUEST_STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [musicMuted, setMusicMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(MUSIC_MUTED_STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [passwordRecovery, setPasswordRecovery] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const hasInteractedBoardRef = useRef<boolean>(false);
  const skipNextPrefSyncRef = useRef<boolean>(false);

  const [tutorialActive, setTutorialActive] = useState<boolean>(() => !loadSavedState().tutorialSeen);
  const [tutorialStepIndex, setTutorialStepIndex] = useState<number>(0);

  const currentLevel = useMemo(
    () => getLevelById(saved.currentLevelId),
    [saved.currentLevelId]
  );

  const optimalMoves = useMemo(
    () => solvePuzzle(currentLevel.vehicles)?.length ?? currentLevel.parMoves,
    [currentLevel]
  );

  const tutorialSolution = useMemo(
    () => solvePuzzle(TUTORIAL_LEVEL.vehicles) ?? [],
    []
  );

  const [vehicles, setVehicles] = useState<Vehicle[]>(() =>
    !loadSavedState().tutorialSeen
      ? cloneVehicles(TUTORIAL_LEVEL.vehicles)
      : cloneVehicles(getLevelById(loadSavedState().currentLevelId).vehicles)
  );
  const [history, setHistory] = useState<Vehicle[][]>([]);
  const [moveCount, setMoveCount] = useState<number>(0);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [solutionViewed, setSolutionViewed] = useState<boolean>(false);
  const [hintStep, setHintStep] = useState<MoveStep | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const hintsRemaining = Math.max(0, MAX_HINTS_PER_STAGE - hintsUsed);
  const availableStars = solutionViewed ? 0 : Math.max(0, 3 - hintsUsed);

  const [screen, setScreen] = useState<'home' | 'play'>('home');
  const [isWon, setIsWon] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isAutoExiting, setIsAutoExiting] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [winStars, setWinStars] = useState<0 | 1 | 2 | 3>(3);
  const [winMoves, setWinMoves] = useState(0);

  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [showSolutionConfirm, setShowSolutionConfirm] = useState(false);
  const [showHubTab, setShowHubTab] = useState<HubTab | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [timedSecondsLeft, setTimedSecondsLeft] = useState<number>(() =>
    getTimeLimitSeconds(
      getLevelById(loadSavedState().currentLevelId).difficulty,
      getLevelById(loadSavedState().currentLevelId).parMoves
    )
  );
  const [dailyElapsed, setDailyElapsed] = useState<number>(0);
  const [modeFailure, setModeFailure] = useState<'time' | 'moves' | null>(null);
  const [unlockedToast, setUnlockedToast] = useState<string | null>(null);
  const [headerLogoError, setHeaderLogoError] = useState(false);
  const [solution, setSolution] = useState<SolutionState>(EMPTY_SOLUTION);
  const preSolutionVehiclesRef = useRef<Vehicle[] | null>(null);
  const wasWonBeforeSolutionRef = useRef<boolean>(false);
  const wasExitingBeforeSolutionRef = useRef<boolean>(false);
  const winTimersRef = useRef<number[]>([]);
  const toastTimerRef = useRef<number | null>(null);

  const timeLimitTotal = useMemo(
    () => getTimeLimitSeconds(currentLevel.difficulty, optimalMoves),
    [currentLevel.difficulty, optimalMoves]
  );
  const maxMovesBudget = useMemo(
    () => getMaxMovesBudget(currentLevel.difficulty, optimalMoves),
    [currentLevel.difficulty, optimalMoves]
  );

  const lang: Language = saved.language;
  const t = COPY[lang];

  const clearWinTimers = useCallback(() => {
    winTimersRef.current.forEach((id) => window.clearTimeout(id));
    winTimersRef.current = [];
  }, []);

  const performCloudSync = useCallback(async (user: AppUser) => {
    if (!user.emailVerified) return;
    setIsSyncing(true);
    try {
      const merged = await syncOnSignIn(user, savedRef.current);
      skipNextPrefSyncRef.current = true;
      setSaved(merged);
      saveState(merged);

      if (!hasInteractedBoardRef.current) {
        const syncedLevel = getLevelById(merged.currentLevelId);
        if (merged.tutorialSeen) {
          setTutorialActive(false);
          setVehicles(cloneVehicles(syncedLevel.vehicles));
          setHistory([]);
          setMoveCount(0);
          setHintsUsed(0);
          setSolutionViewed(false);
          setHintStep(null);
        }
      }
    } catch (err) {
      console.error('Cloud sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return;
    }

    let mounted = true;
    let lastSyncedUid: string | null = null;

    let recovering = false;

    const handleSessionUser = (user: AppUser | null) => {
      if (!mounted) return;
      setAuthUser(user);
      setAuthReady(true);
      if (user?.emailVerified) {
        try {
          localStorage.removeItem(GUEST_STORAGE_KEY);
        } catch {
          // ignore
        }
        setGuestMode(false);
        if (!recovering) {
          setShowAuthModal(false);
        }
        if (lastSyncedUid !== user.uid) {
          lastSyncedUid = user.uid;
          void performCloudSync(user);
        }
      } else {
        lastSyncedUid = null;
      }
    };

    const isOAuthPopup =
      typeof window !== 'undefined' &&
      !Capacitor.isNativePlatform() &&
      (Boolean(window.opener) || window.name === 'policeout_google_oauth') &&
      (window.location.search.includes('code=') ||
        window.location.hash.includes('access_token=') ||
        window.location.search.includes('error='));

    void supabase.auth.getSession().then(({ data }) => {
      if (isOAuthPopup && data.session) {
        try {
          const ch = new BroadcastChannel('policeout-auth');
          ch.postMessage({ type: 'SIGNED_IN' });
          ch.close();
        } catch {
          // ignore
        }
        window.close();
        return;
      }
      handleSessionUser(toAppUser(data.session?.user));
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (isOAuthPopup && session) {
        try {
          const ch = new BroadcastChannel('policeout-auth');
          ch.postMessage({ type: 'SIGNED_IN' });
          ch.close();
        } catch {
          // ignore
        }
        window.close();
        return;
      }
      if (event === 'PASSWORD_RECOVERY') {
        recovering = true;
        setPasswordRecovery(true);
        setShowAuthModal(true);
      }
      handleSessionUser(toAppUser(session?.user));
    });

    let authChannel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined' && !Capacitor.isNativePlatform()) {
      authChannel = new BroadcastChannel('policeout-auth');
      authChannel.onmessage = () => {
        void supabase?.auth.getSession().then(({ data }) => {
          handleSessionUser(toAppUser(data.session?.user));
        });
      };
    }

    const appUrlHandle = Capacitor.isNativePlatform()
      ? CapApp.addListener('appUrlOpen', async ({ url }) => {
          if (!supabase || !url || !url.startsWith('com.policeout.game://')) return;
          try {
            const parsed = new URL(url);
            const code = parsed.searchParams.get('code');
            if (code) {
              await supabase.auth.exchangeCodeForSession(code);
              return;
            }
            const hashParams = new URLSearchParams(parsed.hash.replace(/^#/, ''));
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');
            if (accessToken && refreshToken) {
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              if (hashParams.get('type') === 'recovery') {
                recovering = true;
                setPasswordRecovery(true);
                setShowAuthModal(true);
              }
            }
          } catch (err) {
            console.error('Deep link auth callback failed:', err);
          }
        })
      : null;

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
      authChannel?.close();
      if (appUrlHandle) {
        void appUrlHandle.then((h) => h.remove());
      }
    };
  }, [performCloudSync]);

  useEffect(() => {
    saveState(saved);
    sound.setMuted(saved.muted);
    document.documentElement.dir = saved.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = saved.language;
  }, [saved]);

  useEffect(() => {
    sound.setMusicMuted(musicMuted);
    try {
      localStorage.setItem(MUSIC_MUTED_STORAGE_KEY, musicMuted ? '1' : '0');
    } catch {
      // ignore
    }
  }, [musicMuted]);

  useEffect(() => {
    const unlock = () => {
      sound.unlockAndStartMusic();
    };
    window.addEventListener('pointerdown', unlock, { passive: true, once: true });
    window.addEventListener('keydown', unlock, { once: true });

    const handleVisibility = () => {
      sound.setBackgroundPaused(document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const appStateListener = Capacitor.isNativePlatform()
      ? CapApp.addListener('appStateChange', ({ isActive }) => {
          sound.setBackgroundPaused(!isActive);
        })
      : null;

    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (appStateListener) {
        void appStateListener.then((h) => h.remove());
      }
    };
  }, []);

  // Debounced cloud sync for user preferences & active stage number
  useEffect(() => {
    if (!authUser?.emailVerified || isSyncing) return;
    if (skipNextPrefSyncRef.current) {
      skipNextPrefSyncRef.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      void pushPreferencesToCloud(authUser, savedRef.current).catch((err) =>
        console.error('Preference sync error:', err)
      );
    }, 700);
    return () => window.clearTimeout(timer);
  }, [
    authUser,
    isSyncing,
    saved.currentLevelId,
    saved.tutorialSeen,
    saved.muted,
    saved.language,
    saved.selectedTheme,
  ]);

  useEffect(() => {
    const isEditable = (target: EventTarget | null) =>
      target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;

    const handleContextMenu = (e: MouseEvent) => {
      if (!isEditable(e.target)) {
        e.preventDefault();
      }
    };

    const handleSelectStart = (e: Event) => {
      if (!isEditable(e.target)) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
      clearWinTimers();
    };
  }, [clearWinTimers]);

  useEffect(() => {
    if (
      screen !== 'play' ||
      tutorialActive ||
      isWon ||
      isAutoExiting ||
      solution.active ||
      modeFailure ||
      showHubTab ||
      showLevelSelect ||
      showAuthModal ||
      showSolutionConfirm
    ) {
      return;
    }

    if (gameMode === 'timed') {
      const id = window.setInterval(() => {
        setTimedSecondsLeft((prev) => {
          if (prev <= 1) {
            sound.playBump();
            setModeFailure('time');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => window.clearInterval(id);
    }

    if (gameMode === 'daily') {
      const id = window.setInterval(() => {
        setDailyElapsed((prev) => prev + 1);
      }, 1000);
      return () => window.clearInterval(id);
    }
  }, [
    gameMode,
    isAutoExiting,
    isWon,
    modeFailure,
    screen,
    showAuthModal,
    showHubTab,
    showLevelSelect,
    showSolutionConfirm,
    solution.active,
    tutorialActive,
  ]);

  const { solvedTotal, totalStars } = useMemo(() => {
    let solved = 0;
    let stars = 0;
    for (const p of Object.values(saved.progress)) {
      if (p.solved) {
        solved++;
        stars += p.stars ?? 0;
      }
    }
    return { solvedTotal: solved, totalStars: stars };
  }, [saved.progress]);

  const loadStage = useCallback(
    (levelId: number, exitTutorial = true, nextMode?: GameMode, enterPlay = true) => {
      clearWinTimers();
      hasInteractedBoardRef.current = true;
      const target = getLevelById(levelId);
      const targetOptimal = solvePuzzle(target.vehicles)?.length ?? target.parMoves;
      if (nextMode) {
        setGameMode(nextMode);
      }
      if (enterPlay) {
        setScreen('play');
      }
      setSaved((prev) => ({
        ...prev,
        currentLevelId: target.id,
        tutorialSeen: exitTutorial ? true : prev.tutorialSeen,
      }));
      if (exitTutorial) {
        setTutorialActive(false);
      }
      setVehicles(cloneVehicles(target.vehicles));
      setHistory([]);
      setMoveCount(0);
      setHintsUsed(0);
      setSolutionViewed(false);
      setHintStep(null);
      setStatusMessage(null);
      setModeFailure(null);
      setTimedSecondsLeft(getTimeLimitSeconds(target.difficulty, targetOptimal));
      setDailyElapsed(0);
      setSolution(EMPTY_SOLUTION);
      preSolutionVehiclesRef.current = null;
      wasWonBeforeSolutionRef.current = false;
      wasExitingBeforeSolutionRef.current = false;
      setIsWon(false);
      setIsExiting(false);
      setIsAutoExiting(false);
      setShowVictoryModal(false);
      setShowSolutionConfirm(false);
    },
    [clearWinTimers]
  );

  const handleSwitchGameMode = useCallback(
    (mode: GameMode, overrideLevelId?: number) => {
      if (mode === 'daily') {
        const todayKey = getUtcDateKey();
        const dailyId = getDailyChallengeLevelId(todayKey);
        loadStage(dailyId, true, 'daily', true);
        return;
      }
      loadStage(overrideLevelId ?? currentLevel.id, true, mode, true);
    },
    [currentLevel.id, loadStage]
  );

  const startTutorial = useCallback(() => {
    clearWinTimers();
    setScreen('play');
    setTutorialActive(true);
    setTutorialStepIndex(0);
    setVehicles(cloneVehicles(TUTORIAL_LEVEL.vehicles));
    setHistory([]);
    setMoveCount(0);
    setHintsUsed(0);
    setSolutionViewed(false);
    setHintStep(null);
    setStatusMessage(null);
    setSolution(EMPTY_SOLUTION);
    preSolutionVehiclesRef.current = null;
    wasWonBeforeSolutionRef.current = false;
    wasExitingBeforeSolutionRef.current = false;
    setIsWon(false);
    setIsExiting(false);
    setIsAutoExiting(false);
    setShowVictoryModal(false);
    setShowSolutionConfirm(false);
  }, [clearWinTimers]);

  const finishOrSkipTutorial = useCallback(() => {
    setSaved((prev) => ({ ...prev, tutorialSeen: true }));
    loadStage(saved.currentLevelId, true, undefined, true);
  }, [loadStage, saved.currentLevelId]);

  const handleReset = useCallback(() => {
    clearWinTimers();
    if (tutorialActive) {
      startTutorial();
      return;
    }
    setVehicles(cloneVehicles(currentLevel.vehicles));
    setHistory([]);
    setMoveCount(0);
    setHintStep(null);
    setStatusMessage(null);
    setModeFailure(null);
    setTimedSecondsLeft(timeLimitTotal);
    setDailyElapsed(0);
    setSolution(EMPTY_SOLUTION);
    setShowSolutionConfirm(false);
    preSolutionVehiclesRef.current = null;
    setIsWon(false);
    setIsExiting(false);
    setIsAutoExiting(false);
    setShowVictoryModal(false);
  }, [clearWinTimers, currentLevel.vehicles, startTutorial, timeLimitTotal, tutorialActive]);

  const handleUndo = useCallback(() => {
    if (history.length === 0 || isWon || isAutoExiting || solution.active || tutorialActive) {
      return;
    }
    const prevBoard = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setVehicles(prevBoard);
    setHintStep(null);
    setStatusMessage(null);
    sound.playTick();
  }, [history, isAutoExiting, isWon, solution.active, tutorialActive]);

  const finalizeVictory = useCallback(
    (finalMoves: number) => {
      const stars = solutionViewed ? 0 : computeStars(finalMoves, optimalMoves, hintsUsed);
      setWinMoves(finalMoves);
      setWinStars(stars);
      setIsWon(true);
      sound.playWin();

      const prevState = savedRef.current;
      const existing = prevState.progress[currentLevel.id];
      const bestMoves = existing ? Math.min(existing.bestMoves, finalMoves) : finalMoves;
      const bestStars = existing
        ? (Math.max(existing.stars, stars) as 0 | 1 | 2 | 3)
        : stars;
      const updatedStageProg = {
        solved: true,
        bestMoves,
        stars: bestStars,
      };
      const nextProgress = {
        ...prevState.progress,
        [currentLevel.id]: updatedStageProg,
      };

      let nextSolved = 0;
      let nextTotalStars = 0;
      for (const p of Object.values(nextProgress)) {
        if (p.solved) {
          nextSolved++;
          nextTotalStars += p.stars ?? 0;
        }
      }

      const nextNoHintCount =
        stars === 3 && hintsUsed === 0 && !solutionViewed
          ? prevState.noHintThreeStarCount + 1
          : prevState.noHintThreeStarCount;
      const nextTimedWins =
        gameMode === 'timed' ? prevState.timedWins + 1 : prevState.timedWins;
      const nextLimitedWins =
        gameMode === 'limited' ? prevState.limitedWins + 1 : prevState.limitedWins;

      const todayKey = getUtcDateKey();
      const nextDailyDates =
        gameMode === 'daily' && !prevState.dailyCompletedDates.includes(todayKey)
          ? [...prevState.dailyCompletedDates, todayKey].slice(-100)
          : prevState.dailyCompletedDates;
      const nextDailyStreak =
        gameMode === 'daily'
          ? Math.max(prevState.dailyStreak, computeDailyStreak(nextDailyDates, todayKey))
          : prevState.dailyStreak;

      const newBadges = evaluateNewAchievements(prevState.unlockedAchievements, {
        solvedCount: nextSolved,
        totalStars: nextTotalStars,
        noHintThreeStarCount: nextNoHintCount,
        timedWins: nextTimedWins,
        limitedWins: nextLimitedWins,
        dailyCount: nextDailyDates.length,
        dailyStreak: nextDailyStreak,
      });

      const nextUnlocked =
        newBadges.length > 0
          ? [...prevState.unlockedAchievements, ...newBadges].slice(0, 30)
          : prevState.unlockedAchievements;

      if (newBadges.length > 0) {
        const firstBadge = ACHIEVEMENTS.find((a) => a.id === newBadges[0]);
        if (firstBadge) {
          setUnlockedToast(firstBadge.title[lang]);
          if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
          toastTimerRef.current = window.setTimeout(() => setUnlockedToast(null), 4200);
        }
      }

      const nextSaved: SavedState = {
        ...prevState,
        noHintThreeStarCount: nextNoHintCount,
        timedWins: nextTimedWins,
        limitedWins: nextLimitedWins,
        dailyCompletedDates: nextDailyDates,
        dailyStreak: nextDailyStreak,
        unlockedAchievements: nextUnlocked,
        progress: nextProgress,
      };
      setSaved(nextSaved);

      if (authUser?.emailVerified) {
        void pushStageProgressToCloud(
          authUser,
          currentLevel.id,
          finalMoves,
          hintsUsed,
          solutionViewed,
          gameMode,
          nextSaved.currentLevelId
        ).catch((err) => console.error('Cloud stage sync error:', err));

        if (gameMode === 'daily') {
          void submitDailyScore(
            authUser,
            todayKey,
            finalMoves,
            Math.max(1, dailyElapsed),
            hintsUsed,
            solutionViewed
          ).catch((err) => console.error('Daily score submit error:', err));
        }
      }
    },
    [
      authUser,
      currentLevel.id,
      dailyElapsed,
      gameMode,
      hintsUsed,
      lang,
      optimalMoves,
      solutionViewed,
    ]
  );

  const handleCommitMove = useCallback(
    (vehicleId: string, toRow: number, toCol: number) => {
      if (isWon || isAutoExiting || solution.active) return;

      const nextVehicles = vehicles.map((v) =>
        v.id === vehicleId ? { ...v, row: toRow, col: toCol } : v
      );

      if (tutorialActive) {
        setVehicles(nextVehicles);
        const expected = tutorialSolution[tutorialStepIndex];
        const moved = nextVehicles.find((v) => v.id === vehicleId);

        if (moved?.kind === 'P' && toRow === EXIT_ROW) {
          setTutorialStepIndex(3);
          setIsWon(true);
          sound.playWin();
          const t1 = window.setTimeout(() => setIsExiting(true), 120);
          winTimersRef.current.push(t1);
          return;
        }

        const tutPolice = nextVehicles.find((v) => v.kind === 'P');
        if (tutPolice && tutPolice.row < EXIT_ROW && isGoalClear(nextVehicles)) {
          setIsAutoExiting(true);
          setTutorialStepIndex(2);
          const t1 = window.setTimeout(() => {
            setVehicles((cur) =>
              cur.map((v) => (v.kind === 'P' ? { ...v, row: EXIT_ROW } : v))
            );
            sound.playSnap(1);
          }, 220);
          const t2 = window.setTimeout(() => {
            setTutorialStepIndex(3);
            setIsWon(true);
            sound.playWin();
            setIsExiting(true);
          }, 680);
          const t3 = window.setTimeout(() => {
            setIsAutoExiting(false);
          }, 1260);
          winTimersRef.current.push(t1, t2, t3);
          return;
        }

        if (expected && toRow === expected.toRow && toCol === expected.toCol) {
          setTutorialStepIndex((idx) => Math.min(3, idx + 1));
        }
        return;
      }

      if (modeFailure) return;
      hasInteractedBoardRef.current = true;
      const newMoves = moveCount + 1;
      setMoveCount(newMoves);
      setHistory((prev) => [...prev, vehicles]);
      setVehicles(nextVehicles);
      setHintStep(null);
      setStatusMessage(null);

      const movedVehicle = nextVehicles.find((v) => v.id === vehicleId);
      const directExited = movedVehicle?.kind === 'P' && toRow === EXIT_ROW;

      if (directExited) {
        if (gameMode === 'limited' && newMoves > maxMovesBudget) {
          sound.playBump();
          setModeFailure('moves');
          return;
        }
        finalizeVictory(newMoves);
        const t1 = window.setTimeout(() => setIsExiting(true), 120);
        const t2 = window.setTimeout(() => setShowVictoryModal(true), 760);
        winTimersRef.current.push(t1, t2);
        return;
      }

      const policeAfterMove = nextVehicles.find((v) => v.kind === 'P');
      const pathClearNow =
        Boolean(policeAfterMove && policeAfterMove.row < EXIT_ROW && isGoalClear(nextVehicles));

      if (pathClearNow) {
        const finalMoves = newMoves + 1; // Auto-driving out through the gate counts as +1 move
        if (gameMode === 'limited' && finalMoves > maxMovesBudget) {
          sound.playBump();
          setModeFailure('moves');
          return;
        }
        setIsAutoExiting(true);
        const t1 = window.setTimeout(() => {
          setVehicles((cur) =>
            cur.map((v) => (v.kind === 'P' ? { ...v, row: EXIT_ROW } : v))
          );
          setMoveCount(finalMoves);
          sound.playSnap(1);
        }, 220);
        const t2 = window.setTimeout(() => {
          finalizeVictory(finalMoves);
          setIsExiting(true);
        }, 680);
        const t3 = window.setTimeout(() => {
          setIsAutoExiting(false);
          setShowVictoryModal(true);
        }, 1260);
        winTimersRef.current.push(t1, t2, t3);
        return;
      }

      if (gameMode === 'limited' && newMoves >= maxMovesBudget) {
        sound.playBump();
        setModeFailure('moves');
      }
    },
    [
      finalizeVictory,
      gameMode,
      isAutoExiting,
      isWon,
      maxMovesBudget,
      modeFailure,
      moveCount,
      solution.active,
      tutorialActive,
      tutorialSolution,
      tutorialStepIndex,
      vehicles,
    ]
  );

  const handleHint = useCallback(() => {
    if (isWon || tutorialActive || solution.active) return;

    if (hintStep) {
      setStatusMessage(t.hintNote);
      sound.playHint();
      return;
    }

    if (hintsRemaining <= 0) {
      setStatusMessage(t.noHintsLeft);
      sound.playBump();
      return;
    }

    const steps = solvePuzzle(vehicles);
    if (steps && steps.length > 0) {
      setHintStep(steps[0]);
      setHintsUsed((prev) => prev + 1);
      setStatusMessage(t.hintNote);
      sound.playHint();
    } else {
      setHintStep(null);
      setStatusMessage(t.unsolvableNote);
      sound.playBump();
    }
  }, [
    hintStep,
    hintsRemaining,
    isWon,
    solution.active,
    t.hintNote,
    t.noHintsLeft,
    t.unsolvableNote,
    tutorialActive,
    vehicles,
  ]);

  const buildSolution = useCallback(
    (
      mode: 'start' | 'current',
      baseBoard: Vehicle[],
      speed: 1 | 2 = 1,
      isOptimalPostWin = false
    ): SolutionState => {
      const steps = solvePuzzle(baseBoard);
      if (!steps) {
        return EMPTY_SOLUTION;
      }
      const snapshots: Vehicle[][] = [cloneVehicles(baseBoard)];
      let cur = cloneVehicles(baseBoard);
      for (const st of steps) {
        cur = applyMove(cur, st);
        snapshots.push(cur);
      }
      return {
        active: true,
        mode,
        steps,
        snapshots,
        stepIndex: 0,
        isPlaying: true,
        speed,
        isOptimalPostWin,
      };
    },
    []
  );

  const openSolution = useCallback(
    (asOptimalPostWin = false) => {
      if (tutorialActive) return;
      const postWin = asOptimalPostWin || isWon;
      const preBoard = cloneVehicles(vehicles);
      preSolutionVehiclesRef.current = preBoard;
      wasWonBeforeSolutionRef.current = isWon;
      wasExitingBeforeSolutionRef.current = isExiting;
      setShowVictoryModal(false);
      setHintStep(null);
      setStatusMessage(null);

      if (postWin) {
        setIsWon(false);
        setIsExiting(false);
        const nextSol = buildSolution('start', cloneVehicles(currentLevel.vehicles), 1, true);
        if (!nextSol.active) return;
        setVehicles(nextSol.snapshots[0]);
        setSolution(nextSol);
        return;
      }

      setSolutionViewed(true);
      const fromCurrent = solvePuzzle(preBoard);
      const mode: 'start' | 'current' =
        history.length > 0 && fromCurrent ? 'current' : 'start';
      const base = mode === 'current' ? preBoard : cloneVehicles(currentLevel.vehicles);

      const nextSol = buildSolution(mode, base, 1, false);
      if (!nextSol.active) {
        setStatusMessage(t.unsolvableNote);
        sound.playBump();
        return;
      }
      setVehicles(nextSol.snapshots[0]);
      setSolution(nextSol);
    },
    [
      buildSolution,
      currentLevel.vehicles,
      history.length,
      isExiting,
      isWon,
      t.unsolvableNote,
      tutorialActive,
      vehicles,
    ]
  );

  const requestOpenSolution = useCallback(() => {
    if (tutorialActive) return;
    if (isWon || solutionViewed) {
      openSolution(isWon);
      return;
    }
    setShowSolutionConfirm(true);
  }, [isWon, openSolution, solutionViewed, tutorialActive]);

  const handleSwitchSolutionMode = useCallback(
    (mode: 'start' | 'current') => {
      const base =
        mode === 'start'
          ? cloneVehicles(currentLevel.vehicles)
          : cloneVehicles(preSolutionVehiclesRef.current ?? vehicles);
      const nextSol = buildSolution(mode, base, solution.speed, solution.isOptimalPostWin);
      if (nextSol.active) {
        setIsWon(false);
        setIsExiting(false);
        setVehicles(nextSol.snapshots[0]);
        setSolution(nextSol);
      }
    },
    [buildSolution, currentLevel.vehicles, solution.isOptimalPostWin, solution.speed, vehicles]
  );

  const closeSolution = useCallback(() => {
    setSolution(EMPTY_SOLUTION);
    setIsWon(wasWonBeforeSolutionRef.current);
    setIsExiting(wasExitingBeforeSolutionRef.current);
    wasWonBeforeSolutionRef.current = false;
    wasExitingBeforeSolutionRef.current = false;
    if (preSolutionVehiclesRef.current) {
      setVehicles(preSolutionVehiclesRef.current);
      preSolutionVehiclesRef.current = null;
    }
  }, []);

  const stepSolutionTo = useCallback((nextIdx: number, pause = false) => {
    setSolution((prev) => {
      if (!prev.active) return prev;
      const clamped = Math.max(0, Math.min(prev.steps.length, nextIdx));
      const boardSnap = prev.snapshots[clamped];
      if (boardSnap) {
        setVehicles(boardSnap);
      }
      const reachedEnd = clamped >= prev.steps.length;
      setIsWon(reachedEnd);
      setIsExiting(false);
      if (clamped !== prev.stepIndex) {
        if (reachedEnd) {
          sound.playWin();
        } else {
          sound.playSnap(1);
        }
      }
      return {
        ...prev,
        stepIndex: clamped,
        isPlaying: reachedEnd ? false : pause ? false : prev.isPlaying,
      };
    });
  }, []);

  // Auto-advance timer when Solution Bar is playing (1x = 1250ms, 2x = 620ms)
  useEffect(() => {
    if (!solution.active || !solution.isPlaying) return;
    if (solution.stepIndex >= solution.steps.length) return;

    const delayMs = solution.speed === 2 ? 620 : 1250;
    const timer = window.setTimeout(() => {
      stepSolutionTo(solution.stepIndex + 1, false);
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [
    solution.active,
    solution.isPlaying,
    solution.speed,
    solution.stepIndex,
    solution.steps.length,
    stepSolutionTo,
  ]);

  // Compute live tutorial highlight step adjusted to the vehicle's current coordinates
  const currentTutorialStep: MoveStep | null = useMemo(() => {
    if (!tutorialActive || tutorialStepIndex >= tutorialSolution.length) return null;
    const raw = tutorialSolution[tutorialStepIndex];
    const v = vehicles.find((item) => item.id === raw.vehicleId);
    if (!v) return raw;
    const delta = v.dir === 'h' ? raw.toCol - v.col : raw.toRow - v.row;
    return {
      ...raw,
      fromRow: v.row,
      fromCol: v.col,
      delta,
    };
  }, [tutorialActive, tutorialSolution, tutorialStepIndex, vehicles]);

  const activeBoardHint: MoveStep | null = useMemo(() => {
    if (solution.active) {
      return solution.steps[solution.stepIndex] ?? null;
    }
    return hintStep;
  }, [hintStep, solution.active, solution.stepIndex, solution.steps]);

  const currentProgress = saved.progress[currentLevel.id];

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const listenerPromise = CapApp.addListener('backButton', () => {
      if (showAuthModal) {
        setShowAuthModal(false);
        return;
      }
      if (showHubTab) {
        setShowHubTab(null);
        return;
      }
      if (showLevelSelect) {
        setShowLevelSelect(false);
        return;
      }
      if (showSolutionConfirm) {
        setShowSolutionConfirm(false);
        return;
      }
      if (showVictoryModal) {
        setShowVictoryModal(false);
        return;
      }
      if (solution.active) {
        closeSolution();
        return;
      }
      if (modeFailure) {
        handleReset();
        return;
      }
      if (screen === 'play') {
        clearWinTimers();
        setIsAutoExiting(false);
        setScreen('home');
        return;
      }
      void CapApp.exitApp();
    });

    return () => {
      void listenerPromise.then((handle) => handle.remove());
    };
  }, [
    clearWinTimers,
    closeSolution,
    handleReset,
    modeFailure,
    screen,
    showAuthModal,
    showHubTab,
    showLevelSelect,
    showSolutionConfirm,
    showVictoryModal,
    solution.active,
  ]);

  const toggleLanguage = () => {
    setSaved((prev) => ({ ...prev, language: prev.language === 'ar' ? 'en' : 'ar' }));
  };

  const toggleMute = () => {
    setSaved((prev) => ({ ...prev, muted: !prev.muted }));
  };

  const toggleMusic = () => {
    sound.unlockAndStartMusic();
    setMusicMuted((prev) => !prev);
  };

  const handleContinueGuest = () => {
    sound.unlockAndStartMusic();
    try {
      localStorage.setItem(GUEST_STORAGE_KEY, '1');
    } catch {
      // ignore
    }
    setGuestMode(true);
  };

  if (!authReady) {
    return <AppBootSkeleton />;
  }

  if (!guestMode && (!authUser || !authUser.emailVerified)) {
    return (
      <AuthScreen
        language={lang}
        onToggleLanguage={toggleLanguage}
        user={authUser}
        isSyncing={isSyncing}
        passwordRecovery={passwordRecovery}
        solvedCount={solvedTotal}
        totalStars={totalStars}
        onContinueGuest={handleContinueGuest}
        onVerifiedRefresh={async (refreshed) => {
          setAuthUser(refreshed);
          await performCloudSync(refreshed);
        }}
        onAccountUpdated={(updated) => {
          setAuthUser(updated);
        }}
        onPasswordRecoveryDone={() => {
          setPasswordRecovery(false);
        }}
      />
    );
  }

  return (
    <>
      {screen === 'home' ? (
        <HomeScreen
          language={lang}
          muted={saved.muted}
          musicMuted={musicMuted}
          user={authUser}
          currentLevel={currentLevel}
          optimalMoves={optimalMoves}
          solvedTotal={solvedTotal}
          totalStars={totalStars}
          selectedMode={gameMode}
          onSelectMode={(m) => setGameMode(m)}
          onStartGame={(mode, levelId) => handleSwitchGameMode(mode, levelId)}
          onOpenLevels={() => setShowLevelSelect(true)}
          onOpenHub={(tab) => setShowHubTab(tab)}
          onStartTutorial={startTutorial}
          onOpenAuth={() => setShowAuthModal(true)}
          onToggleLanguage={toggleLanguage}
          onToggleMute={toggleMute}
          onToggleMusic={toggleMusic}
        />
      ) : (
        <div className="min-h-[100dvh] w-full bg-[#0e131b] text-slate-100 flex flex-col relative overflow-x-hidden">
          {/* Subtle overhead ambient spotlight */}
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.09),transparent_55%)]"
          />

          <div className="relative z-10 w-full max-w-5xl mx-auto px-3.5 sm:px-6 pt-[max(env(safe-area-inset-top),0.75rem)] pb-[max(env(safe-area-inset-bottom),0.75rem)] sm:py-6 flex-1 flex flex-col justify-center">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-center">
              {/* Header + HUD + Controls Column (orders cleanly on mobile and desktop) */}
              <div className="lg:col-span-5 flex flex-col gap-3 order-1 lg:order-2">
                {/* Clean Uncluttered App Bar with Home Button */}
                <header className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      type="button"
                      onClick={() => {
                        clearWinTimers();
                        setIsAutoExiting(false);
                        setScreen('home');
                      }}
                      aria-label={t.homeLabel}
                      title={t.homeLabel}
                      className="min-w-[38px] min-h-[38px] sm:min-w-[40px] sm:min-h-[40px] rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    >
                      <Home className="w-4 h-4" />
                    </button>

                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-amber-400 shadow-md shrink-0 overflow-hidden">
                      {!headerLogoError ? (
                        <img
                          src={gameLogo}
                          alt={t.appTitle}
                          width={36}
                          height={36}
                          decoding="async"
                          referrerPolicy="no-referrer"
                          onError={() => setHeaderLogoError(true)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Shield className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h1 className="text-base sm:text-xl font-extrabold tracking-tight text-white whitespace-nowrap leading-tight">
                        {t.appTitle}
                      </h1>
                      <p className="text-[11px] sm:text-xs text-slate-400 whitespace-nowrap leading-tight">
                        <span className="font-num text-slate-200 font-bold">{solvedTotal}/360</span>{' '}
                        {t.solvedCount}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                    <PWAInstallButton language={lang} />

                <button
                  type="button"
                  onClick={toggleMusic}
                  aria-label={musicMuted ? 'Enable music' : 'Mute music'}
                  title={lang === 'ar' ? 'الموسيقى الهادئة' : 'Background Music'}
                  className={`relative min-w-[34px] min-h-[34px] sm:min-w-[40px] sm:min-h-[40px] rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
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
                  onClick={toggleMute}
                  aria-label={saved.muted ? 'Unmute SFX' : 'Mute SFX'}
                  title={lang === 'ar' ? 'الأصوات' : 'Sound Effects'}
                  className="min-w-[34px] min-h-[34px] sm:min-w-[40px] sm:min-h-[40px] rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                >
                  {saved.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={toggleLanguage}
                  aria-label="Toggle language"
                  className="min-w-[34px] min-h-[34px] sm:min-w-[40px] sm:min-h-[40px] px-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer font-num"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'EN' : 'AR'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAuthModal(true)}
                  aria-label={t.accountLabel}
                  title={t.accountLabel}
                  className={`min-w-[34px] min-h-[34px] sm:min-w-[40px] sm:min-h-[40px] px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    authUser?.emailVerified
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                      : authUser && !authUser.emailVerified
                      ? 'bg-amber-400/15 border-amber-400/40 text-amber-300 hover:bg-amber-400/25'
                      : 'bg-sky-500/15 border-sky-500/40 text-sky-300 hover:bg-sky-500/25'
                  }`}
                >
                  {authUser?.emailVerified ? (
                    authUser.photoURL ? (
                      <img
                        src={authUser.photoURL}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className="w-5 h-5 rounded-md object-cover"
                      />
                    ) : (
                      <UserCheck className="w-4 h-4" />
                    )
                  ) : authUser ? (
                    <Cloud className="w-4 h-4" />
                  ) : (
                    <LogIn className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">
                    {authUser?.emailVerified
                      ? t.accountLabel
                      : authUser
                      ? t.verifyLabel
                      : t.signInLabel}
                  </span>
                </button>
              </div>
            </header>

            {/* Clean Stage, Mode & Score HUD */}
            {!tutorialActive && (
              <div className="flex items-center justify-between gap-2 bg-slate-900/80 border border-slate-800/90 rounded-2xl px-3 sm:px-3.5 py-2.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <button
                    type="button"
                    disabled={currentLevel.id <= 1}
                    onClick={() => loadStage(currentLevel.id - 1)}
                    aria-label="Previous stage"
                    className="min-w-[34px] min-h-[34px] rounded-lg hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronLeft className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                  </button>

                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => setShowLevelSelect(true)}
                      className="text-start hover:opacity-85 transition-opacity cursor-pointer block"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[11px] font-bold ${difficultyColorClass(currentLevel.difficulty)}`}>
                          {t.difficulty[currentLevel.difficulty]}
                        </span>
                        <span className="inline-flex items-center gap-0.5" aria-label={`${availableStars} stars`}>
                          {[1, 2, 3].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 transition-colors ${
                                s <= availableStars
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-700'
                              }`}
                            />
                          ))}
                        </span>
                      </div>
                      <div className="text-base font-extrabold text-white leading-tight whitespace-nowrap">
                        {t.stageWord} <span className="font-num text-amber-300">#{currentLevel.id}</span>
                      </div>
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={currentLevel.id >= ALL_LEVELS.length}
                    onClick={() => loadStage(currentLevel.id + 1)}
                    aria-label="Next stage"
                    className="min-w-[34px] min-h-[34px] rounded-lg hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Numeric telemetry OR quick X Back to Game when viewing solution */}
                {solution.active ? (
                  <button
                    type="button"
                    onClick={closeSolution}
                    className="min-h-[38px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <X className="w-4 h-4 text-rose-400" />
                    <span>{t.backToGame}</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-4 text-end shrink-0">
                    <div>
                      <div className="text-[11px] text-slate-400">{t.movesLabel}</div>
                      <div className="text-lg font-extrabold text-white font-num leading-tight">
                        {gameMode === 'limited'
                          ? `${moveCount}/${maxMovesBudget}`
                          : moveCount}
                      </div>
                    </div>
                    <div className="h-7 w-px bg-slate-800" />
                    <div>
                      <div className="text-[11px] text-slate-400">
                        {gameMode === 'timed'
                          ? t.timeLeftLabel
                          : gameMode === 'daily'
                            ? t.dailyTimerLabel
                            : currentProgress?.solved
                              ? t.bestLabel
                              : t.parLabel}
                      </div>
                      <div
                        className={`text-lg font-extrabold font-num leading-tight ${
                          gameMode === 'timed' && timedSecondsLeft <= 10
                            ? 'text-rose-400 animate-pulse'
                            : 'text-emerald-400'
                        }`}
                      >
                        {gameMode === 'timed'
                          ? formatClock(timedSecondsLeft)
                          : gameMode === 'daily'
                            ? formatClock(dailyElapsed)
                            : currentProgress?.solved
                              ? currentProgress.bestMoves
                              : optimalMoves}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Desktop placement of Tutorial / Solution / Controls */}
            <div className="hidden lg:flex flex-col gap-3">
              {tutorialActive && (
                <TutorialOverlay
                  language={lang}
                  stepIndex={tutorialStepIndex}
                  currentStep={currentTutorialStep}
                  onSkip={finishOrSkipTutorial}
                  onFinish={finishOrSkipTutorial}
                />
              )}

              {solution.active && (
                <SolutionBar
                  language={lang}
                  stepIndex={solution.stepIndex}
                  totalSteps={solution.steps.length}
                  isPlaying={solution.isPlaying}
                  mode={solution.mode}
                  speed={solution.speed}
                  isOptimalPostWin={solution.isOptimalPostWin}
                  onTogglePlay={() =>
                    setSolution((prev) => ({ ...prev, isPlaying: !prev.isPlaying }))
                  }
                  onToggleSpeed={() =>
                    setSolution((prev) => ({
                      ...prev,
                      speed: prev.speed === 1 ? 2 : 1,
                    }))
                  }
                  onPrev={() => stepSolutionTo(solution.stepIndex - 1, true)}
                  onNext={() => stepSolutionTo(solution.stepIndex + 1, true)}
                  onSwitchMode={handleSwitchSolutionMode}
                  onClose={closeSolution}
                />
              )}

              {statusMessage && !tutorialActive && !solution.active && (
                <p className="text-xs text-amber-300/90 px-1">{statusMessage}</p>
              )}

              {!tutorialActive && !solution.active && (
                <div className="grid grid-cols-5 gap-2">
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={history.length === 0 || isWon}
                    className="min-h-[54px] rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-35 disabled:pointer-events-none border border-slate-800 text-slate-200 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Undo2 className="w-4 h-4" />
                    <span className="text-[11px] font-bold">{t.undo}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="min-h-[54px] rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="text-[11px] font-bold">{t.reset}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleHint}
                    disabled={isWon || (hintsRemaining === 0 && !hintStep)}
                    className="min-h-[54px] rounded-2xl bg-amber-400/15 hover:bg-amber-400/25 disabled:opacity-35 disabled:pointer-events-none border border-amber-400/40 text-amber-300 flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer"
                  >
                    <Lightbulb className="w-4 h-4" />
                    <span className="text-[11px] font-bold">
                      {t.hint}{' '}
                      <span className="font-num text-[10px] opacity-90">
                        ({hintsRemaining})
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={requestOpenSolution}
                    className={`min-h-[54px] rounded-2xl border flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                      isWon
                        ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-400/50 text-emerald-300'
                        : 'bg-sky-400/15 hover:bg-sky-400/25 border-sky-400/40 text-sky-300'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    <span className="text-[11px] font-bold">
                      {isWon ? t.optimalBtn : t.solution}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowLevelSelect(true)}
                    className="min-h-[54px] rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Grid3X3 className="w-4 h-4" />
                    <span className="text-[11px] font-bold">{t.stages}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 6x6 Parking Lot Board Column */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <Board
              vehicles={vehicles}
              onCommitMove={handleCommitMove}
              hintStep={activeBoardHint}
              locked={solution.active || Boolean(modeFailure) || isAutoExiting}
              tutorialStep={tutorialActive ? currentTutorialStep : null}
              isWon={isWon}
              isExiting={isExiting}
              autoSlidingPolice={isAutoExiting}
              theme={saved.selectedTheme}
            />
          </div>

          {/* Mobile placement of Tutorial / Solution / Bottom Thumb Action Bar */}
          <div className="lg:hidden order-3 flex flex-col gap-2.5 pb-1">
            {tutorialActive && (
              <TutorialOverlay
                language={lang}
                stepIndex={tutorialStepIndex}
                currentStep={currentTutorialStep}
                onSkip={finishOrSkipTutorial}
                onFinish={finishOrSkipTutorial}
              />
            )}

            {solution.active && (
              <SolutionBar
                language={lang}
                stepIndex={solution.stepIndex}
                totalSteps={solution.steps.length}
                isPlaying={solution.isPlaying}
                mode={solution.mode}
                speed={solution.speed}
                isOptimalPostWin={solution.isOptimalPostWin}
                onTogglePlay={() =>
                  setSolution((prev) => ({ ...prev, isPlaying: !prev.isPlaying }))
                }
                onToggleSpeed={() =>
                  setSolution((prev) => ({
                    ...prev,
                    speed: prev.speed === 1 ? 2 : 1,
                  }))
                }
                onPrev={() => stepSolutionTo(solution.stepIndex - 1, true)}
                onNext={() => stepSolutionTo(solution.stepIndex + 1, true)}
                onSwitchMode={handleSwitchSolutionMode}
                onClose={closeSolution}
              />
            )}

            {statusMessage && !tutorialActive && !solution.active && (
              <p className="text-xs text-center text-amber-300/90">{statusMessage}</p>
            )}

            {!tutorialActive && !solution.active && (
              <div className="grid grid-cols-5 gap-1.5">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={history.length === 0 || isWon}
                  className="min-h-[54px] rounded-2xl bg-slate-900 active:scale-95 disabled:opacity-35 disabled:pointer-events-none border border-slate-800 text-slate-200 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <Undo2 className="w-4 h-4" />
                  <span className="text-[11px] font-bold">{t.undo}</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="min-h-[54px] rounded-2xl bg-slate-900 active:scale-95 border border-slate-800 text-slate-200 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="text-[11px] font-bold">{t.reset}</span>
                </button>

                <button
                  type="button"
                  onClick={handleHint}
                  disabled={isWon || (hintsRemaining === 0 && !hintStep)}
                  className="min-h-[54px] rounded-2xl bg-amber-400/15 active:scale-95 disabled:opacity-35 disabled:pointer-events-none border border-amber-400/40 text-amber-300 flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span className="text-[11px] font-bold">
                    {t.hint}{' '}
                    <span className="font-num text-[10px] opacity-90">
                      ({hintsRemaining})
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={requestOpenSolution}
                  className={`min-h-[54px] rounded-2xl active:scale-95 border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    isWon
                      ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                      : 'bg-sky-400/15 border-sky-400/40 text-sky-300'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-[11px] font-bold">
                    {isWon ? t.optimalBtn : t.solution}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowLevelSelect(true)}
                  className="min-h-[54px] rounded-2xl bg-slate-900 active:scale-95 border border-slate-800 text-slate-200 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <Grid3X3 className="w-4 h-4" />
                  <span className="text-[11px] font-bold">{t.stages}</span>
                </button>
              </div>
            )}
            </div>
          </div>
        </div>
        </div>
      )}

      {/* All 360 Stages Modal */}
      {showLevelSelect && (
        <LevelSelectModal
          language={lang}
          currentLevelId={currentLevel.id}
          progress={saved.progress}
          onSelectLevel={(id) =>
            loadStage(id, true, gameMode === 'daily' ? 'classic' : undefined, true)
          }
          onClose={() => setShowLevelSelect(false)}
        />
      )}

      {/* Solution Warning Confirmation Modal */}
      {showSolutionConfirm && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowSolutionConfirm(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-amber-400/40 p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-13 h-13 mx-auto mb-3 rounded-2xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="flex items-center justify-center gap-1.5 mb-3">
              {[1, 2, 3].map((s) => (
                <Star key={s} className="w-6 h-6 text-slate-600" />
              ))}
            </div>

            <h2 className="text-lg font-extrabold text-white mb-2">
              {t.solWarnTitle}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-5">
              {t.solWarnBody}
            </p>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowSolutionConfirm(false)}
                className="flex-1 min-h-[46px] rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-colors cursor-pointer"
              >
                {t.solWarnCancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSolutionConfirm(false);
                  openSolution(false);
                }}
                className="flex-1 min-h-[46px] rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm transition-colors cursor-pointer shadow-lg"
              >
                {t.solWarnConfirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stage Victory Modal */}
      {showVictoryModal && !tutorialActive && !solution.active && (
        <VictoryModal
          language={lang}
          levelId={currentLevel.id}
          moves={winMoves}
          optimalMoves={optimalMoves}
          stars={winStars}
          hasNext={currentLevel.id < ALL_LEVELS.length}
          onReplay={() => loadStage(currentLevel.id, true)}
          onNext={() => loadStage(currentLevel.id + 1, true)}
          onViewOptimal={() => openSolution(true)}
          onClose={() => setShowVictoryModal(false)}
        />
      )}

      {/* Account / Auth Modal */}
      {showAuthModal && (
        <AuthScreen
          language={lang}
          onToggleLanguage={toggleLanguage}
          user={authUser}
          isModal
          isSyncing={isSyncing}
          passwordRecovery={passwordRecovery}
          solvedCount={solvedTotal}
          totalStars={totalStars}
          onCloseModal={() => {
            setPasswordRecovery(false);
            setShowAuthModal(false);
          }}
          onVerifiedRefresh={async (refreshed) => {
            setAuthUser(refreshed);
            await performCloudSync(refreshed);
            setShowAuthModal(false);
          }}
          onAccountUpdated={(updated) => {
            setAuthUser(updated);
          }}
          onPasswordRecoveryDone={() => {
            setPasswordRecovery(false);
            setShowAuthModal(false);
          }}
        />
      )}

      {/* Hub Modal: Modes, Daily Challenge, Global Leaderboard, Achievements, Themes */}
      {showHubTab && (
        <HubModal
          language={lang}
          initialTab={showHubTab}
          gameMode={gameMode}
          user={authUser}
          totalStars={totalStars}
          solvedCount={solvedTotal}
          selectedTheme={saved.selectedTheme}
          unlockedAchievements={saved.unlockedAchievements}
          achievementStats={{
            solvedCount: solvedTotal,
            totalStars,
            noHintThreeStarCount: saved.noHintThreeStarCount,
            timedWins: saved.timedWins,
            limitedWins: saved.limitedWins,
            dailyCount: saved.dailyCompletedDates.length,
            dailyStreak: saved.dailyStreak,
          }}
          dailyCompletedDates={saved.dailyCompletedDates}
          dailyStreak={saved.dailyStreak}
          onSwitchMode={(mode) => handleSwitchGameMode(mode)}
          onStartTutorial={startTutorial}
          onSelectTheme={(theme: BoardTheme) => {
            setSaved((prev) => ({ ...prev, selectedTheme: theme }));
          }}
          onStartDaily={(levelId) => {
            loadStage(levelId, true, 'daily');
          }}
          onOpenAuth={() => setShowAuthModal(true)}
          onClose={() => setShowHubTab(null)}
        />
      )}

      {/* Time Attack / Strict Moves Failure Modal */}
      {modeFailure && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => handleReset()}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-slate-900 border border-rose-500/40 p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-13 h-13 mx-auto mb-3 rounded-2xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-400">
              {modeFailure === 'time' ? (
                <Clock className="w-7 h-7" />
              ) : (
                <Footprints className="w-7 h-7" />
              )}
            </div>
            <h2 className="text-lg font-extrabold text-white mb-2">
              {modeFailure === 'time' ? t.failTimeTitle : t.failMovesTitle}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-5">
              {modeFailure === 'time' ? t.failTimeBody : t.failMovesBody}
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => handleSwitchGameMode('classic')}
                className="flex-1 min-h-[46px] rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm cursor-pointer"
              >
                {t.backClassicBtn}
              </button>
              <button
                type="button"
                onClick={() => handleReset()}
                className="flex-1 min-h-[46px] rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm cursor-pointer shadow-lg"
              >
                {t.retryBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Newly Unlocked Achievement Toast */}
      {unlockedToast && (
        <div className="fixed top-4 inset-x-4 sm:inset-x-auto sm:end-4 sm:max-w-sm z-50 rounded-2xl bg-slate-900 border border-amber-400/60 px-4 py-3 shadow-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-amber-300">
              {t.achievementUnlocked}
            </div>
            <div className="text-sm font-extrabold text-white truncate">
              {unlockedToast}
            </div>
          </div>
        </div>
      )}

      {/* Offline PWA Indicator */}
      <OfflineIndicator language={lang} />
    </>
  );
}
