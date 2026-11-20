# Security Specification — Police Parking Puzzle

## 1. Data Invariants
1. **Strict PII Isolation (Split Collection Strategy)**: `/users/{userId}` contains private account info (`email`, `uid`) and is readable (`get`) and writable (`create`, `update`) strictly by the verified owner (`request.auth.uid == userId && request.auth.token.email_verified == true`). Listing `/users` is forbidden (`allow list: if false`).
2. **Non-PII Public Leaderboard (`/leaderboard/{userId}`)**: Contains zero PII (`displayName`, `photoURL`, `solvedCount`, `totalStars`, `achievementsCount`, `dailyStreak`, `updatedAt`). Verified users may read/list bounded leaderboard queries (`resource.data.totalStars >= 0`); only the verified owner (`request.auth.uid == userId`) can create/update their own entry.
3. **Daily Challenge Scores (`/dailyScores/{scoreId}`)**: Document ID must match `dateKey + '_' + request.auth.uid`. Only verified owners can create/update their own daily score; verified players can list entries filtered by `resource.data.dateKey is string`.
4. **Stage Progress Master Gate**: `/users/{userId}/stages/{stageId}` requires the parent `/users/{userId}` document to exist (`exists(...)`), `stageId` matching `^[1-9][0-9]{0,2}$`, and `levelId` `1..360`.
5. **Bounded Arrays & Server Timestamps**: `unlockedAchievements` (`size() <= 30`) and `dailyCompletedDates` (`size() <= 100`) validate element types and sizes; `createdAt`/`updatedAt` strictly equal `request.time`.

## 2. The "Dirty Dozen" Attack Payloads (All Must Return `PERMISSION_DENIED`)
1. **Unauthenticated Profile/Leaderboard Read**: `get(/leaderboard/userA)` with `auth: null`.
2. **Cross-User PII Read**: `get(/users/userA)` signed in as `userB`.
3. **Unverified Email Write**: `set(/leaderboard/userA, ...)` with `auth.token.email_verified: false`.
4. **User Directory Scraping**: `list(/users)` signed in as any user.
5. **Leaderboard Impersonation**: `set(/leaderboard/userA, ...)` signed in as `userB`.
6. **PII Leak Attempt on Leaderboard**: `set(/leaderboard/userA, { ..., email: "x@y.com" })` (rejected by `hasOnly`).
7. **Daily Score ID Spoofing**: `set(/dailyScores/2026-11-14_userB, { userId: "userA", ... })` signed in as `userA`.
8. **Invalid DateKey Format**: `set(/dailyScores/bad_userA, { dateKey: "bad", ... })` (rejected by regex).
9. **Unbounded Array / Resource Exhaustion**: `update(/users/userA, { unlockedAchievements: ["a", ... 50 items] })`.
10. **Out-of-Range Stars / Moves Poisoning**: `set(/leaderboard/userA, { ..., totalStars: 99999 })`.
11. **Orphaned Stage Progress Write**: `set(/users/userA/stages/1, ...)` when `/users/userA` parent doc does not exist.
12. **Client Timestamp Forgery**: `set(/dailyScores/2026-11-14_userA, { ..., updatedAt: "2020-01-01T00:00:00Z" })`.
