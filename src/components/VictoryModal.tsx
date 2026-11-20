import React from 'react';
import { ArrowRight, Eye, RotateCcw, Star, Trophy, X } from 'lucide-react';
import { Language } from '../game/types';

interface VictoryModalProps {
  language: Language;
  levelId: number;
  moves: number;
  optimalMoves: number;
  stars: 0 | 1 | 2 | 3;
  hasNext: boolean;
  onReplay: () => void;
  onNext: () => void;
  onViewOptimal: () => void;
  onClose: () => void;
}

const COPY = {
  ar: {
    title: 'تم فتح البوابة!',
    subtitle: 'انطلقت سيارة الشرطة بنجاح',
    zeroStarNote: 'تم احتساب 0 نجوم في هذه المحاولة — أعد المرحلة بنفسك لكسب النجوم',
    movesLabel: 'حركاتك',
    optimalLabel: 'الأفضل',
    optimalBtn: 'عرض الحل المثالي',
    movesUnit: 'حركة',
    replay: 'إعادة المرحلة',
    next: 'المرحلة التالية',
    doneAll: 'أنهيت جميع المراحل!',
    close: 'رجوع للعبة',
  },
  en: {
    title: 'Gate Cleared!',
    subtitle: 'Police car escaped successfully',
    zeroStarNote: '0 stars earned this attempt — replay cleanly to earn stars',
    movesLabel: 'Your Moves',
    optimalLabel: 'Optimal',
    optimalBtn: 'Watch Optimal Solution',
    movesUnit: 'moves',
    replay: 'Replay',
    next: 'Next Stage',
    doneAll: 'All 360 Stages Cleared!',
    close: 'Back to Game',
  },
};

export const VictoryModal: React.FC<VictoryModalProps> = ({
  language,
  levelId,
  moves,
  optimalMoves,
  stars,
  hasNext,
  onReplay,
  onNext,
  onViewOptimal,
  onClose,
}) => {
  const t = COPY[language];

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-amber-400/40 p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t.close}
          title={t.close}
          className="absolute top-3.5 end-3.5 min-w-[38px] min-h-[38px] rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-300">
          <Trophy className="w-7 h-7" />
        </div>

        <p className="text-xs font-bold text-amber-300 font-num mb-1">
          #{levelId}
        </p>
        <h2 className="text-2xl font-extrabold text-white mb-1">{t.title}</h2>
        <p className="text-sm text-slate-300 mb-4">{t.subtitle}</p>

        {/* Stars */}
        <div className="flex items-center justify-center gap-2 mb-3">
          {[1, 2, 3].map((s) => (
            <Star
              key={s}
              className={`w-9 h-9 transition-transform ${
                s <= stars
                  ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.5)] scale-105'
                  : 'text-slate-700'
              }`}
            />
          ))}
        </div>

        {stars === 0 && (
          <p className="text-[11px] text-amber-300/90 mb-4 leading-relaxed">
            {t.zeroStarNote}
          </p>
        )}

        {/* Clean Stats Row */}
        <div className="grid grid-cols-2 gap-3 mb-4 bg-slate-950/70 rounded-2xl p-3 border border-slate-800">
          <div>
            <div className="text-xs text-slate-400">{t.movesLabel}</div>
            <div className="text-xl font-bold text-white font-num">{moves}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">{t.optimalLabel}</div>
            <div className="text-xl font-bold text-emerald-400 font-num">{optimalMoves}</div>
          </div>
        </div>

        {/* Unlocked Optimal Solution Viewer Button */}
        <button
          type="button"
          onClick={onViewOptimal}
          className="w-full min-h-[42px] mb-3 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/40 text-sky-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Eye className="w-4 h-4" />
          <span>
            {t.optimalBtn} (<span className="font-num">{optimalMoves}</span> {t.movesUnit})
          </span>
        </button>

        {/* Actions */}
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onReplay}
            className="flex-1 min-h-[46px] rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.replay}</span>
          </button>

          {hasNext ? (
            <button
              type="button"
              onClick={onNext}
              className="flex-1 min-h-[46px] rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg"
            >
              <span>{t.next}</span>
              <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
            </button>
          ) : (
            <div className="flex-1 min-h-[46px] rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs flex items-center justify-center px-2">
              {t.doneAll}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
