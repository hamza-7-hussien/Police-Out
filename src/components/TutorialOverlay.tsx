import React from 'react';
import { BookOpen, CheckCircle2, ArrowRight, X } from 'lucide-react';
import { Language, MoveStep } from '../game/types';

interface TutorialOverlayProps {
  language: Language;
  stepIndex: number; // 0, 1, 2, or 3 (completed)
  currentStep: MoveStep | null;
  onSkip: () => void;
  onFinish: () => void;
}

const TUTORIAL_COPY = {
  ar: {
    badge: 'التعليم التفاعلي · 3 خطوات',
    skip: 'تخطي التعليم',
    startPlaying: 'ابدأ المرحلة الأولى',
    steps: [
      {
        title: 'الخطوة 1: افتح الطريق',
        desc: 'اسحب العربية الحمراء لفوق (صف 0) عشان تفسح مكان للتاكسي الأصفر.',
      },
      {
        title: 'الخطوة 2: وسّع ممر الشرطة',
        desc: 'ممتاز! دلوقتي اسحب التاكسي الأصفر لليسار (عمود 0) عشان تفتح ممر الخروج.',
      },
      {
        title: 'الخطوة 3: انطلق لبوابة الخروج!',
        desc: 'أول ما الطريق يفضى قدام عربية الشرطة، الممر كله بينور أخضر وعربية الشرطة بتطلع أوتوماتيكياً!',
      },
      {
        title: 'عاش! جاهز للتحدي',
        desc: 'فهمت الفكرة! كل العربيات بتتحرك في اتجاهها بس (طول أو عرض). قدامك 360 مرحلة.',
      },
    ],
  },
  en: {
    badge: 'Interactive Tutorial · 3 Steps',
    skip: 'Skip Tutorial',
    startPlaying: 'Start Stage 1',
    steps: [
      {
        title: 'Step 1: Clear the lane',
        desc: 'Drag the Red car UP to the top row to unblock the Yellow taxi.',
      },
      {
        title: 'Step 2: Open the exit path',
        desc: 'Great! Now slide the Yellow taxi LEFT to clear the Police lane.',
      },
      {
        title: 'Step 3: Auto-Escape!',
        desc: 'Once the full lane turns green, the Police car drives through the gate automatically!',
      },
      {
        title: 'Awesome! Ready to Play',
        desc: 'You got it! Vehicles slide strictly along their axis. 360 stages await.',
      },
    ],
  },
};

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  language,
  stepIndex,
  onSkip,
  onFinish,
}) => {
  const copy = TUTORIAL_COPY[language];
  const clampedIdx = Math.min(stepIndex, 3);
  const stepInfo = copy.steps[clampedIdx];
  const isComplete = stepIndex >= 3;

  return (
    <div className="w-full rounded-2xl bg-slate-900/90 border border-amber-400/40 p-4 shadow-xl">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold tracking-wide">
          <BookOpen className="w-4 h-4 shrink-0" />
          <span>{copy.badge}</span>
        </div>

        <button
          type="button"
          onClick={onSkip}
          className="min-h-[38px] px-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-600/80 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4 text-rose-400" />
          <span>{copy.skip}</span>
        </button>
      </div>

      {/* Step progress bars */}
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        {[0, 1, 2].map((idx) => (
          <div
            key={idx}
            className={`h-1.5 rounded-full transition-colors ${
              idx < stepIndex
                ? 'bg-emerald-400'
                : idx === stepIndex
                  ? 'bg-amber-400'
                  : 'bg-slate-700'
            }`}
          />
        ))}
      </div>

      <h3 className="text-base font-bold text-white mb-1">{stepInfo.title}</h3>
      <p className="text-sm text-slate-300 leading-relaxed">{stepInfo.desc}</p>

      {isComplete && (
        <button
          type="button"
          onClick={onFinish}
          className="mt-3 w-full min-h-[44px] rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{copy.startPlaying}</span>
          <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
        </button>
      )}
    </div>
  );
};
