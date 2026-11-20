import React from 'react';

export const SkeletonBlock: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div aria-hidden="true" className={`skeleton-shimmer ${className}`} />
);

export const AppBootSkeleton: React.FC = () => (
  <div
    aria-busy="true"
    aria-label="Loading Police Out"
    className="min-h-[100dvh] w-full bg-[#0e131b] text-slate-100 flex flex-col relative overflow-x-hidden"
  >
    <div className="w-full max-w-xl mx-auto px-4 sm:px-6 pt-[max(env(safe-area-inset-top),0.85rem)] pb-[max(env(safe-area-inset-bottom),1rem)] sm:py-6 flex-1 flex flex-col justify-between gap-4">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <SkeletonBlock className="w-11 h-11 rounded-2xl shrink-0" />
          <div className="space-y-1.5">
            <SkeletonBlock className="w-24 h-4 rounded-md" />
            <SkeletonBlock className="w-36 h-3 rounded-md" />
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <SkeletonBlock className="w-9 h-9 rounded-xl" />
          <SkeletonBlock className="w-9 h-9 rounded-xl" />
          <SkeletonBlock className="w-12 h-9 rounded-xl" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex flex-col justify-center gap-3.5">
        <div className="grid grid-cols-2 gap-2.5">
          <SkeletonBlock className="h-12 rounded-2xl" />
          <SkeletonBlock className="h-12 rounded-2xl" />
        </div>

        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 space-y-4">
          <div className="space-y-2">
            <SkeletonBlock className="w-24 h-3 rounded-md" />
            <SkeletonBlock className="w-40 h-7 rounded-lg" />
          </div>
          <SkeletonBlock className="h-11 rounded-xl" />
          <div className="grid grid-cols-2 gap-2">
            <SkeletonBlock className="h-16 rounded-2xl" />
            <SkeletonBlock className="h-16 rounded-2xl" />
            <SkeletonBlock className="h-16 rounded-2xl" />
            <SkeletonBlock className="h-16 rounded-2xl" />
          </div>
          <SkeletonBlock className="h-14 rounded-2xl" />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <SkeletonBlock className="h-[72px] rounded-2xl" />
          <SkeletonBlock className="h-[72px] rounded-2xl" />
          <SkeletonBlock className="h-[72px] rounded-2xl" />
          <SkeletonBlock className="h-[72px] rounded-2xl" />
        </div>
      </div>
    </div>
  </div>
);

export const LeaderboardListSkeleton: React.FC<{ rows?: number }> = ({ rows = 6 }) => (
  <div aria-busy="true" className="space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-slate-950/65 border border-slate-800/80"
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <SkeletonBlock className="w-6 h-4 rounded-md shrink-0" />
          <SkeletonBlock className="w-9 h-9 rounded-xl shrink-0" />
          <div className="space-y-1.5 flex-1 max-w-[180px]">
            <SkeletonBlock className="h-3.5 w-3/4 rounded-md" />
            <SkeletonBlock className="h-2.5 w-1/2 rounded-md" />
          </div>
        </div>
        <SkeletonBlock className="w-14 h-5 rounded-lg shrink-0" />
      </div>
    ))}
  </div>
);
