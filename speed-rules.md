# Speed & Performance Engineering Rules (`speed-rules.md`)

Always follow these 5 production performance rules whenever building or modifying features in **Police Out**:

1. **Database Indexing & Zero N+1 Queries**
   - Declare Firestore composite indexes in `firestore.indexes.json` for every filtered/ordered query (`leaderboard`, `dailyScores`, `users/{uid}/stages`).
   - Run independent reads (`getDoc` + `getDocs`) in parallel via `Promise.all`, and combine dependent multi-document writes into atomic `writeBatch` commits instead of sequential awaits inside loops.

2. **Pagination (`LIMIT 20` / Chunked Rendering)**
   - Never pull unbounded collections or render hundreds of heavy list items at once.
   - Cloud leaderboards (`fetchLeaderboardTop`, `fetchDailyLeaderboard`) must fetch `20` items per page using cursor pagination (`limit(20)` + `startAfter(cursor)`).
   - Stage selectors (`LevelSelectModal`) must paginate cleanly (`24` stages per page) with direct jump support.

3. **Image Optimization (WebP + Sizing + Lazy Loading)**
   - Resize and compress UI raster assets to lightweight `.webp` sized to their display dimensions (never ship raw multi-hundred KB / MB assets in UI slots).
   - Always include `loading="lazy"` and `decoding="async"` on off-screen / modal / avatar `<img>` tags (`HubModal`, `AuthScreen`, etc.).

4. **Caching Layer (Persistent DB Cache + TTL Memory Cache + Solver Memoization)**
   - Enable Firestore `persistentLocalCache` (IndexedDB multi-tab persistence) in `src/firebase.ts`.
   - Cache leaderboard and daily challenge query results in memory with a TTL (60s) and invalidate on manual refresh or score submission so switching tabs does not trigger duplicate Firestore reads.
   - Memoize `solvePuzzle` results in `src/game/solver.ts` for repeated board lookups.

5. **Skeleton Loading (Zero Blank Screens / Plain Text Loaders)**
   - Never leave blank screens, raw spinner placeholders, or plain `"Loading..."` text during async hydration.
   - Render layout-matched Skeleton UI (`AppBootSkeleton` on startup, `LeaderboardListSkeleton` in `HubModal`) until real data arrives.
