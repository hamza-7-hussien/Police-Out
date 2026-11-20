import React, { useMemo, useState } from 'react';
import { Check, Search, Star, X } from 'lucide-react';
import { ALL_LEVELS, DIFFICULTY_RANGES } from '../game/levels';
import { Difficulty, Language, LevelProgress } from '../game/types';

interface LevelSelectModalProps {
  language: Language;
  currentLevelId: number;
  progress: Record<number, LevelProgress>;
  onSelectLevel: (levelId: number) => void;
  onClose: () => void;
}

const COPY = {
  ar: {
    title: 'كل المراحل',
    solvedLabel: 'مرحلة مكتملة',
    jumpPlaceholder: 'انتقل لمرحلة (1 - 360)',
    go: 'اذهب',
    tabs: {
      beginner: 'مبتدئ · 1-80',
      intermediate: 'متوسط · 81-208',
      advanced: 'متقدم · 209-360',
    },
  },
  en: {
    title: 'All Stages',
    solvedLabel: 'Solved',
    jumpPlaceholder: 'Jump to stage (1 - 360)',
    go: 'Go',
    tabs: {
      beginner: 'Beginner · 1-80',
      intermediate: 'Intermediate · 81-208',
      advanced: 'Advanced · 209-360',
    },
  },
};

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  language,
  currentLevelId,
  progress,
  onSelectLevel,
  onClose,
}) => {
  const initialTab: Difficulty =
    currentLevelId <= 80 ? 'beginner' : currentLevelId <= 208 ? 'intermediate' : 'advanced';
  const [tab, setTab] = useState<Difficulty>(initialTab);
  const [jumpInput, setJumpInput] = useState('');

  const t = COPY[language];

  const solvedCount = useMemo(
    () => Object.values(progress).filter((p) => p.solved).length,
    [progress]
  );

  const visibleLevels = useMemo(() => {
    const range = DIFFICULTY_RANGES[tab];
    return ALL_LEVELS.filter((l) => l.id >= range.start && l.id <= range.end);
  }, [tab]);

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(jumpInput.trim());
    if (!Number.isNaN(num) && num >= 1 && num <= 360) {
      onSelectLevel(Math.floor(num));
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl h-[88dvh] sm:h-[80dvh] rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-slate-700/80 flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white">{t.title}</h2>
            <p className="text-xs text-slate-400 font-num">
              {solvedCount} / 360 · {t.solvedLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="min-w-[44px] min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Difficulty Tabs + Quick Jump */}
        <div className="px-4 pt-3 pb-2 space-y-2.5 border-b border-slate-800/70">
          <div className="grid grid-cols-3 gap-1.5 bg-slate-950/80 p-1 rounded-xl">
            {(['beginner', 'intermediate', 'advanced'] as Difficulty[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setTab(d)}
                className={`min-h-[40px] px-1.5 rounded-lg text-[11px] sm:text-xs font-bold leading-tight transition-colors cursor-pointer ${
                  tab === d
                    ? d === 'beginner'
                      ? 'bg-emerald-500 text-slate-950'
                      : d === 'intermediate'
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-rose-500 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {t.tabs[d]}
              </button>
            ))}
          </div>

          <form onSubmit={handleJump} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3 pointer-events-none" />
              <input
                type="number"
                min={1}
                max={360}
                inputMode="numeric"
                value={jumpInput}
                onChange={(e) => setJumpInput(e.target.value)}
                placeholder={t.jumpPlaceholder}
                className="w-full min-h-[42px] ps-9 pe-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-num"
              />
            </div>
            <button
              type="submit"
              className="min-h-[42px] px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-bold text-white transition-colors cursor-pointer"
            >
              {t.go}
            </button>
          </form>
        </div>

        {/* Grid of Levels */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-4 sm:grid-cols-6 gap-2.5 content-start">
          {visibleLevels.map((lvl) => {
            const p = progress[lvl.id];
            const isCurrent = lvl.id === currentLevelId;
            return (
              <button
                key={lvl.id}
                type="button"
                onClick={() => {
                  onSelectLevel(lvl.id);
                  onClose();
                }}
                className={`min-h-[60px] rounded-xl p-2 flex flex-col items-center justify-center gap-1 border transition-transform active:scale-95 cursor-pointer ${
                  isCurrent
                    ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                    : p?.solved
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/25'
                      : 'bg-slate-800/75 border-slate-700/80 text-slate-200 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold font-num">{lvl.id}</span>
                  {p?.solved && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="flex items-center gap-0.5 h-3">
                  {p?.solved ? (
                    [1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-2.5 h-2.5 ${
                          s <= p.stars
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-600'
                        }`}
                      />
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-500 font-num">
                      {lvl.parMoves}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
