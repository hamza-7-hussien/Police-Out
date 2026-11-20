import React, { useState } from 'react';
import { Download, Share, Smartphone, WifiOff, X } from 'lucide-react';
import { useOnlineStatus, usePWAInstall } from '../hooks/usePWAInstall';
import { Language } from '../game/types';

const PWA_COPY = {
  ar: {
    installBtn: 'تثبيت',
    installTitle: 'تثبيت اللعبة على جهازك',
    iosBtn: 'تثبيت',
    iosTitle: 'تثبيت على iPhone / iPad',
    iosStep1: '1. اضغط على زر المشاركة (Share) أسفل أو أعلى متصفح Safari.',
    iosStep2: '2. مرر للأسفل واختر «إضافة إلى الشاشة الرئيسية» (Add to Home Screen).',
    iosStep3: '3. اضغط «إضافة» للعب دون إنترنت في أي وقت.',
    close: 'حسناً',
    offlineBanner: 'وضع عدم الاتصال — يمكنك لعب المراحل الـ 360 الآن، وستتم المزامنة عند عودة الإنترنت.',
  },
  en: {
    installBtn: 'Install',
    installTitle: 'Install app on your device',
    iosBtn: 'Install',
    iosTitle: 'Install on iPhone / iPad',
    iosStep1: '1. Tap the Share button in the Safari toolbar.',
    iosStep2: '2. Scroll down and tap "Add to Home Screen".',
    iosStep3: '3. Tap Add to play all 360 stages offline anytime.',
    close: 'Got it',
    offlineBanner: 'Offline Mode — All 360 stages remain playable; cloud sync resumes online.',
  },
};

export const PWAInstallButton: React.FC<{ language: Language }> = ({ language }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const t = PWA_COPY[language];

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        aria-label={t.installTitle}
        title={t.installTitle}
        className="min-w-[40px] min-h-[40px] px-2.5 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline whitespace-nowrap">{t.installBtn}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          aria-label={t.installTitle}
          title={t.installTitle}
          className="min-w-[40px] min-h-[40px] px-2.5 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <Smartphone className="w-4 h-4" />
          <span className="hidden sm:inline whitespace-nowrap">{t.iosBtn}</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 text-amber-300 font-extrabold text-base">
                  <Share className="w-5 h-5" />
                  <h3>{t.iosTitle}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label={t.close}
                  className="min-w-[36px] min-h-[36px] rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 text-xs text-slate-300 leading-relaxed mb-5">
                <p>{t.iosStep1}</p>
                <p>{t.iosStep2}</p>
                <p>{t.iosStep3}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full min-h-[44px] rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm cursor-pointer"
              >
                {t.close}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export const OfflineIndicator: React.FC<{ language: Language }> = ({ language }) => {
  const isOnline = useOnlineStatus();
  const t = PWA_COPY[language];

  if (isOnline) return null;

  return (
    <div className="fixed bottom-3 start-3 end-3 sm:start-auto sm:end-4 sm:max-w-sm z-40 flex items-center gap-2 rounded-xl bg-amber-500 text-slate-950 px-3.5 py-2 text-xs font-bold shadow-lg">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>{t.offlineBanner}</span>
    </div>
  );
};
