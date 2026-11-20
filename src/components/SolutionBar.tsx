import React from 'react';
import { Pause, Play, RotateCcw, SkipBack, SkipForward, X } from 'lucide-react';
import { Language } from '../game/types';

interface SolutionBarProps {
  language: Language;
  stepIndex: number;
  totalSteps: number;
  isPlaying: boolean;
  mode: 'start' | 'current';
  speed: 1 | 2;
  isOptimalPostWin?: boolean;
  onTogglePlay: () => void;
  onToggleSpeed: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSwitchMode: (mode: 'start' | 'current') => void;
  onClose: () => void;
}

const COPY = {
  ar: {
    title: 'عارض الحل',
    optimalTitle: 'الحل المثالي (أقل حركات)',
    zeroStarNote: 'تم تصفير نجوم هذه المحاولة بسبب مشاهدة الحل',
    fromStart: 'من البداية',
    fromCurrent: 'من وضعي الحالي',
    resume: 'رجوع للعبة',
    speedLabel: 'السرعة',
  },
  en: {
    title: 'Solution Viewer',
    optimalTitle: 'Optimal Solution (Shortest)',
    zeroStarNote: 'This attempt earns 0 stars because the solution was viewed',
    fromStart: 'From Start',
    fromCurrent: 'From Here',
    resume: 'Back to Game',
    speedLabel: 'Speed',
  },
};

export const SolutionBar: React.FC<SolutionBarProps> = ({
  language,
  stepIndex,
  totalSteps,
  isPlaying,
  mode,
  speed,
  isOptimalPostWin = false,
  onTogglePlay,
  onToggleSpeed,
  onPrev,
  onNext,
  onSwitchMode,
  onClose,
}) => {
  const t = COPY[language];

  return (
    <div className="w-full rounded-2xl bg-slate-900/95 border border-sky-400/40 p-3.5 shadow-xl">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-bold text-sky-300 truncate">
            {isOptimalPostWin ? t.optimalTitle : t.title}
          </span>
          <span className="text-xs text-slate-300 font-num shrink-0">
            {stepIndex} / {totalSteps}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="min-h-[38px] px-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-600/80 text-white flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-sm"
        >
          <X className="w-4 h-4 text-rose-400" />
          <span>{t.resume}</span>
        </button>
      </div>

      {!isOptimalPostWin && (
        <p className="text-[11px] text-amber-300/90 mb-2.5">{t.zeroStarNote}</p>
      )}

      {/* Mode toggle: From Start vs From Current State (hidden when viewing post-win optimal) */}
      {!isOptimalPostWin && (
        <div className="grid grid-cols-2 gap-1.5 mb-2.5 bg-slate-950/75 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => onSwitchMode('start')}
            className={`min-h-[36px] rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'start'
                ? 'bg-sky-500 text-slate-950'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.fromStart}</span>
          </button>
          <button
            type="button"
            onClick={() => onSwitchMode('current')}
            className={`min-h-[36px] rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              mode === 'current'
                ? 'bg-sky-500 text-slate-950'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {t.fromCurrent}
          </button>
        </div>
      )}

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mb-3">
        <div
          className="h-full bg-sky-400 transition-all duration-200"
          style={{ width: `${totalSteps > 0 ? (stepIndex / totalSteps) * 100 : 0}%` }}
        />
      </div>

      {/* Playback controls + 1x/2x speed selector */}
      <div className="flex items-center justify-center gap-2" dir="ltr">
        <button
          type="button"
          onClick={onPrev}
          disabled={stepIndex <= 0}
          aria-label="Previous step"
          className="min-w-[46px] min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-35 disabled:pointer-events-none text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <SkipBack className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={onTogglePlay}
          disabled={stepIndex >= totalSteps && !isPlaying}
          aria-label={isPlaying ? 'Pause solution' : 'Play solution'}
          className="flex-1 max-w-[140px] min-h-[44px] rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={stepIndex >= totalSteps}
          aria-label="Next step"
          className="min-w-[46px] min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-35 disabled:pointer-events-none text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <SkipForward className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={onToggleSpeed}
          aria-label={t.speedLabel}
          className={`min-w-[54px] min-h-[44px] px-2.5 rounded-xl border font-num text-sm font-extrabold flex items-center justify-center transition-colors cursor-pointer ${
            speed === 2
              ? 'bg-amber-400 text-slate-950 border-amber-300'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
          }`}
        >
          {speed}x
        </button>
      </div>
    </div>
  );
};
