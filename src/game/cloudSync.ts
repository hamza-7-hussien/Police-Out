import { User } from 'firebase/auth';
import {
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  QueryDocumentSnapshot,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { computeDailyStreak, getUtcDateKey } from './features';
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
  nextCursor: QueryDocumentSnapshot<DocumentData> | null;
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

const VALID_THEMES: BoardTheme[] = ['classic', 'night', 'rain', 'desert', 'snow', 'sunset', 'cyber', 'autumn'];

function clampInt(val: number, min: number, max: number): number {
  const n = Math.floor(Number.isFinite(val) ? val : min);
  return Math.max(min, Math.min(max, n));
}

function getSafeDisplayName(user: User): string {
  const raw =
    user.displayName?.trim() ||
    user.email?.split('@')[0]?.trim() ||
    'Player';
  return raw.slice(0, 80) || 'Player';
}

function summarizeProgress(progress: Record<number, LevelProgress>) {
  let solvedCount = 0;
  let totalStars = 0;
  for (const entry of Object.values(progress)) {
    if (entry?.solved) {
      solvedCount++;
      totalStars += clampInt(entry.stars ?? 0, 0, 3);
    }
  }
  return {
    solvedCount: clampInt(solvedCount, 0, 360),
    totalStars: clampInt(totalStars, 0, 1080),
  };
}

function safeTheme(val: unknown, fallback: BoardTheme): BoardTheme {
  return VALID_THEMES.includes(val as BoardTheme) ? (val as BoardTheme) : fallback;
}

function mergeStringArrays(a: string[], b: unknown, maxLen: number): string[] {
  const set = new Set<string>(a.filter((x) => typeof x === 'string' && x.length > 0));
  if (Array.isArray(b)) {
    for (const item of b) {
      if (typeof item === 'string' && item.length > 0) {
        set.add(item);
      }
    }
  }
  return Array.from(set).slice(-maxLen);
}

export async function pushLeaderboardEntry(
  user: User | null,
  state: SavedState
): Promise<void> {
  if (!user || !user.emailVerified) return;

  const path = `leaderboard/${user.uid}`;
  const ref = doc(db, 'leaderboard', user.uid);
  const { solvedCount, totalStars } = summarizeProgress(state.progress);

  const payload = {
    uid: user.uid,
    displayName: getSafeDisplayName(user),
    photoURL: (user.photoURL ?? '').slice(0, 500),
    solvedCount,
    totalStars,
    achievementsCount: clampInt(state.unlockedAchievements.length, 0, 30),
    dailyStreak: clampInt(state.dailyStreak, 0, 10000),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(ref, payload);
    invalidateLeaderboardCache();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncOnSignIn(
  user: User,
  localState: SavedState
): Promise<SavedState> {
  if (!user.emailVerified) {
    return localState;
  }

  const userPath = `users/${user.uid}`;
  const stagesPath = `users/${user.uid}/stages`;
  const userRef = doc(db, 'users', user.uid);
  const stagesQuery = query(
    collection(db, 'users', user.uid, 'stages'),
    where('userId', '==', user.uid),
    limit(360)
  );

  // Run profile fetch & stage collection fetch in parallel (eliminates sequential latency)
  const [userResult, stagesResult] = await Promise.allSettled([
    getDoc(userRef),
    getDocs(stagesQuery),
  ]);

  if (userResult.status === 'rejected') {
    handleFirestoreError(userResult.reason, OperationType.GET, userPath);
  }
  if (stagesResult.status === 'rejected') {
    handleFirestoreError(stagesResult.reason, OperationType.LIST, stagesPath);
  }

  const snap = userResult.value;
  const cloudProfile: Record<string, unknown> | null = snap.exists() ? snap.data() : null;

  const cloudProgress: Record<number, LevelProgress> = {};
  stagesResult.value.forEach((docSnap) => {
    const d = docSnap.data();
    const lvl = clampInt(Number(d.levelId), 1, 360);
    cloudProgress[lvl] = {
      solved: Boolean(d.solved),
      bestMoves: clampInt(Number(d.bestMoves), 1, 9999),
      stars: clampInt(Number(d.stars), 0, 3) as 0 | 1 | 2 | 3,
    };
  });

  const mergedProgress: Record<number, LevelProgress> = { ...cloudProgress };
  const stagesToPush: { levelId: number; prog: LevelProgress }[] = [];

  for (const [idStr, localProg] of Object.entries(localState.progress)) {
    const levelId = Number(idStr);
    if (!Number.isInteger(levelId) || levelId < 1 || levelId > 360 || !localProg?.solved) {
      continue;
    }
    const existing = mergedProgress[levelId];
    const bestMoves = existing
      ? Math.min(existing.bestMoves, clampInt(localProg.bestMoves, 1, 9999))
      : clampInt(localProg.bestMoves, 1, 9999);
    const bestStars = (existing
      ? Math.max(existing.stars, clampInt(localProg.stars, 0, 3))
      : clampInt(localProg.stars, 0, 3)) as 0 | 1 | 2 | 3;

    const merged: LevelProgress = { solved: true, bestMoves, stars: bestStars };
    mergedProgress[levelId] = merged;

    if (
      !existing ||
      merged.bestMoves < existing.bestMoves ||
      merged.stars > existing.stars
    ) {
      stagesToPush.push({ levelId, prog: merged });
    }
  }

  const cloudLevelId = cloudProfile
    ? clampInt(Number(cloudProfile.currentLevelId ?? 1), 1, 360)
    : 1;
  const mergedLevelId = Math.max(localState.currentLevelId, cloudLevelId);
  const mergedTutorialSeen =
    localState.tutorialSeen || Boolean(cloudProfile?.tutorialSeen);
  const mergedLanguage: Language =
    cloudProfile?.language === 'en' || cloudProfile?.language === 'ar'
      ? (cloudProfile.language as Language)
      : localState.language;
  const mergedMuted =
    typeof cloudProfile?.muted === 'boolean' ? cloudProfile.muted : localState.muted;
  const mergedTheme = safeTheme(cloudProfile?.selectedTheme, localState.selectedTheme);
  const mergedAchievements = mergeStringArrays(
    localState.unlockedAchievements,
    cloudProfile?.unlockedAchievements,
    30
  ).map((s) => s.slice(0, 40));
  const mergedDailyDates = mergeStringArrays(
    localState.dailyCompletedDates,
    cloudProfile?.dailyCompletedDates,
    100
  )
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
    .sort();
  const mergedStreak = Math.max(
    localState.dailyStreak,
    clampInt(Number(cloudProfile?.dailyStreak ?? 0), 0, 10000),
    computeDailyStreak(mergedDailyDates, getUtcDateKey())
  );

  const { solvedCount, totalStars } = summarizeProgress(mergedProgress);

  const profilePayload = {
    uid: user.uid,
    displayName: getSafeDisplayName(user),
    email: (user.email ?? '').slice(0, 160),
    photoURL: (user.photoURL ?? '').slice(0, 500),
    currentLevelId: clampInt(mergedLevelId, 1, 360),
    tutorialSeen: mergedTutorialSeen,
    muted: mergedMuted,
    language: mergedLanguage,
    solvedCount,
    totalStars,
    selectedTheme: mergedTheme,
    unlockedAchievements: mergedAchievements,
    dailyCompletedDates: mergedDailyDates,
    dailyStreak: clampInt(mergedStreak, 0, 10000),
    updatedAt: serverTimestamp(),
  };

  try {
    if (!cloudProfile) {
      await setDoc(userRef, {
        ...profilePayload,
        createdAt: serverTimestamp(),
      });
    } else {
      await updateDoc(userRef, {
        displayName: profilePayload.displayName,
        email: profilePayload.email,
        photoURL: profilePayload.photoURL,
        currentLevelId: profilePayload.currentLevelId,
        tutorialSeen: profilePayload.tutorialSeen,
        muted: profilePayload.muted,
        language: profilePayload.language,
        solvedCount: profilePayload.solvedCount,
        totalStars: profilePayload.totalStars,
        selectedTheme: profilePayload.selectedTheme,
        unlockedAchievements: profilePayload.unlockedAchievements,
        dailyCompletedDates: profilePayload.dailyCompletedDates,
        dailyStreak: profilePayload.dailyStreak,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(
      err,
      cloudProfile ? OperationType.UPDATE : OperationType.CREATE,
      userPath
    );
  }

  const nextSavedState: SavedState = {
    ...localState,
    currentLevelId: profilePayload.currentLevelId,
    tutorialSeen: profilePayload.tutorialSeen,
    muted: profilePayload.muted,
    language: mergedLanguage,
    selectedTheme: mergedTheme,
    unlockedAchievements: mergedAchievements,
    dailyCompletedDates: mergedDailyDates,
    dailyStreak: profilePayload.dailyStreak,
    progress: mergedProgress,
  };

  // Commit batched stage updates and leaderboard update concurrently
  const stageBatchPromises: Promise<void>[] = [];
  for (let i = 0; i < stagesToPush.length; i += 400) {
    const chunk = stagesToPush.slice(i, i + 400);
    const batch = writeBatch(db);
    for (const item of chunk) {
      const stageRef = doc(db, 'users', user.uid, 'stages', String(item.levelId));
      batch.set(stageRef, {
        userId: user.uid,
        levelId: item.levelId,
        solved: true,
        bestMoves: clampInt(item.prog.bestMoves, 1, 9999),
        stars: clampInt(item.prog.stars, 0, 3),
        updatedAt: serverTimestamp(),
      });
    }
    stageBatchPromises.push(
      batch.commit().catch((err) => handleFirestoreError(err, OperationType.WRITE, stagesPath))
    );
  }

  await Promise.all([
    ...stageBatchPromises,
    pushLeaderboardEntry(user, nextSavedState),
  ]);

  return nextSavedState;
}

export async function pushStageProgressToCloud(
  user: User | null,
  levelId: number,
  stageProg: LevelProgress,
  state: SavedState
): Promise<void> {
  if (!user || !user.emailVerified) return;

  const safeLevelId = clampInt(levelId, 1, 360);
  const stageRef = doc(db, 'users', user.uid, 'stages', String(safeLevelId));
  const userRef = doc(db, 'users', user.uid);
  const leaderboardRef = doc(db, 'leaderboard', user.uid);
  const { solvedCount, totalStars } = summarizeProgress(state.progress);

  const batch = writeBatch(db);
  batch.set(stageRef, {
    userId: user.uid,
    levelId: safeLevelId,
    solved: true,
    bestMoves: clampInt(stageProg.bestMoves, 1, 9999),
    stars: clampInt(stageProg.stars, 0, 3),
    updatedAt: serverTimestamp(),
  });
  batch.update(userRef, {
    currentLevelId: clampInt(state.currentLevelId, 1, 360),
    solvedCount,
    totalStars,
    unlockedAchievements: state.unlockedAchievements.slice(0, 30),
    dailyCompletedDates: state.dailyCompletedDates.slice(-100),
    dailyStreak: clampInt(state.dailyStreak, 0, 10000),
    updatedAt: serverTimestamp(),
  });
  batch.set(leaderboardRef, {
    uid: user.uid,
    displayName: getSafeDisplayName(user),
    photoURL: (user.photoURL ?? '').slice(0, 500),
    solvedCount,
    totalStars,
    achievementsCount: clampInt(state.unlockedAchievements.length, 0, 30),
    dailyStreak: clampInt(state.dailyStreak, 0, 10000),
    updatedAt: serverTimestamp(),
  });

  try {
    await batch.commit();
    invalidateLeaderboardCache();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/stages/${safeLevelId}`);
  }
}

export async function pushPreferencesToCloud(
  user: User | null,
  state: SavedState
): Promise<void> {
  if (!user || !user.emailVerified) return;

  const userPath = `users/${user.uid}`;
  const userRef = doc(db, 'users', user.uid);

  try {
    await updateDoc(userRef, {
      currentLevelId: clampInt(state.currentLevelId, 1, 360),
      tutorialSeen: Boolean(state.tutorialSeen),
      muted: Boolean(state.muted),
      language: state.language === 'en' ? 'en' : 'ar',
      selectedTheme: safeTheme(state.selectedTheme, 'classic'),
      unlockedAchievements: state.unlockedAchievements.slice(0, 30),
      dailyCompletedDates: state.dailyCompletedDates.slice(-100),
      dailyStreak: clampInt(state.dailyStreak, 0, 10000),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, userPath);
  }
}

function mapLeaderboardDoc(docSnap: QueryDocumentSnapshot<DocumentData>): LeaderboardEntry {
  const d = docSnap.data();
  return {
    uid: String(d.uid ?? docSnap.id),
    displayName: String(d.displayName ?? 'Player'),
    photoURL: String(d.photoURL ?? ''),
    solvedCount: Number(d.solvedCount ?? 0),
    totalStars: Number(d.totalStars ?? 0),
    achievementsCount: Number(d.achievementsCount ?? 0),
    dailyStreak: Number(d.dailyStreak ?? 0),
  };
}

export async function fetchLeaderboardPage(
  cursor: QueryDocumentSnapshot<DocumentData> | null = null,
  forceRefresh = false,
  pageSize = LEADERBOARD_PAGE_SIZE
): Promise<PaginatedResult<LeaderboardEntry>> {
  if (!cursor && !forceRefresh && leaderboardFirstPageCache) {
    if (Date.now() < leaderboardFirstPageCache.expiresAt) {
      return leaderboardFirstPageCache.data;
    }
  }

  const path = 'leaderboard';
  try {
    const q = cursor
      ? query(
          collection(db, path),
          where('totalStars', '>=', 0),
          orderBy('totalStars', 'desc'),
          startAfter(cursor),
          limit(pageSize + 1)
        )
      : query(
          collection(db, path),
          where('totalStars', '>=', 0),
          orderBy('totalStars', 'desc'),
          limit(pageSize + 1)
        );
    const snap = await getDocs(q);
    const hasMore = snap.docs.length > pageSize;
    const pageDocs = hasMore ? snap.docs.slice(0, pageSize) : snap.docs;
    const result: PaginatedResult<LeaderboardEntry> = {
      entries: pageDocs.map(mapLeaderboardDoc),
      nextCursor: hasMore ? pageDocs[pageDocs.length - 1] : null,
      hasMore,
    };

    if (!cursor) {
      leaderboardFirstPageCache = {
        data: result,
        expiresAt: Date.now() + CACHE_TTL_MS,
      };
    }
    return result;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function fetchLeaderboardTop(): Promise<LeaderboardEntry[]> {
  const res = await fetchLeaderboardPage(null, false, LEADERBOARD_PAGE_SIZE);
  return res.entries;
}

export async function submitDailyScore(
  user: User | null,
  dateKey: string,
  levelId: number,
  moves: number,
  timeSeconds: number,
  stars: number
): Promise<void> {
  if (!user || !user.emailVerified) return;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return;

  const scoreId = `${dateKey}_${user.uid}`;
  const path = `dailyScores/${scoreId}`;
  const ref = doc(db, 'dailyScores', scoreId);

  const safeMoves = clampInt(moves, 1, 9999);
  const safeTime = clampInt(timeSeconds, 1, 86400);
  const safeStars = clampInt(stars, 0, 3);

  try {
    const existingSnap = await getDoc(ref);
    if (existingSnap.exists()) {
      const prev = existingSnap.data();
      const prevMoves = Number(prev.moves ?? 9999);
      const prevTime = Number(prev.timeSeconds ?? 86400);
      const isBetter =
        safeMoves < prevMoves || (safeMoves === prevMoves && safeTime < prevTime);
      if (!isBetter) return;

      await updateDoc(ref, {
        displayName: getSafeDisplayName(user),
        photoURL: (user.photoURL ?? '').slice(0, 500),
        moves: safeMoves,
        timeSeconds: safeTime,
        stars: Math.max(safeStars, clampInt(Number(prev.stars ?? 0), 0, 3)),
        updatedAt: serverTimestamp(),
      });
      invalidateDailyCache(dateKey);
      return;
    }

    await setDoc(ref, {
      userId: user.uid,
      dateKey,
      levelId: clampInt(levelId, 1, 360),
      displayName: getSafeDisplayName(user),
      photoURL: (user.photoURL ?? '').slice(0, 500),
      moves: safeMoves,
      timeSeconds: safeTime,
      stars: safeStars,
      updatedAt: serverTimestamp(),
    });
    invalidateDailyCache(dateKey);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

function mapDailyScoreDoc(
  docSnap: QueryDocumentSnapshot<DocumentData>,
  fallbackDateKey: string
): DailyScoreEntry {
  const d = docSnap.data();
  return {
    userId: String(d.userId ?? ''),
    dateKey: String(d.dateKey ?? fallbackDateKey),
    levelId: Number(d.levelId ?? 1),
    displayName: String(d.displayName ?? 'Player'),
    photoURL: String(d.photoURL ?? ''),
    moves: Number(d.moves ?? 9999),
    timeSeconds: Number(d.timeSeconds ?? 86400),
    stars: Number(d.stars ?? 0),
  };
}

export async function fetchDailyLeaderboardPage(
  dateKey: string,
  cursor: QueryDocumentSnapshot<DocumentData> | null = null,
  forceRefresh = false,
  pageSize = LEADERBOARD_PAGE_SIZE
): Promise<PaginatedResult<DailyScoreEntry>> {
  if (!cursor && !forceRefresh) {
    const cached = dailyFirstPageCache.get(dateKey);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }
  }

  const path = 'dailyScores';
  try {
    // Use indexed composite query (dateKey ASC, moves ASC, timeSeconds ASC) for true top-N pagination
    const q = cursor
      ? query(
          collection(db, path),
          where('dateKey', '==', dateKey),
          orderBy('moves', 'asc'),
          orderBy('timeSeconds', 'asc'),
          startAfter(cursor),
          limit(pageSize + 1)
        )
      : query(
          collection(db, path),
          where('dateKey', '==', dateKey),
          orderBy('moves', 'asc'),
          orderBy('timeSeconds', 'asc'),
          limit(pageSize + 1)
        );
    const snap = await getDocs(q);
    const hasMore = snap.docs.length > pageSize;
    const pageDocs = hasMore ? snap.docs.slice(0, pageSize) : snap.docs;
    const result: PaginatedResult<DailyScoreEntry> = {
      entries: pageDocs.map((docSnap) => mapDailyScoreDoc(docSnap, dateKey)),
      nextCursor: hasMore ? pageDocs[pageDocs.length - 1] : null,
      hasMore,
    };

    if (!cursor) {
      dailyFirstPageCache.set(dateKey, {
        data: result,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });
    }
    return result;
  } catch (err) {
    // Graceful fallback if composite index is still building in Firebase Console
    const code =
      typeof err === 'object' && err !== null && 'code' in err
        ? String((err as { code?: unknown }).code)
        : '';
    if (code === 'failed-precondition') {
      try {
        const fallbackQ = query(
          collection(db, path),
          where('dateKey', '==', dateKey),
          limit(pageSize)
        );
        const snap = await getDocs(fallbackQ);
        const rows = snap.docs
          .map((docSnap) => mapDailyScoreDoc(docSnap, dateKey))
          .sort((a, b) => a.moves - b.moves || a.timeSeconds - b.timeSeconds);
        const result: PaginatedResult<DailyScoreEntry> = {
          entries: rows,
          nextCursor: null,
          hasMore: false,
        };
        if (!cursor) {
          dailyFirstPageCache.set(dateKey, {
            data: result,
            expiresAt: Date.now() + CACHE_TTL_MS,
          });
        }
        return result;
      } catch (fallbackErr) {
        handleFirestoreError(fallbackErr, OperationType.LIST, path);
      }
    }
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function fetchDailyLeaderboard(
  dateKey: string
): Promise<DailyScoreEntry[]> {
  const res = await fetchDailyLeaderboardPage(dateKey, null, false, LEADERBOARD_PAGE_SIZE);
  return res.entries;
}
