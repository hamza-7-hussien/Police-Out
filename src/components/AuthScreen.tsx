import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { SocialLogin } from '@capgo/capacitor-social-login';
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  fetchSignInMethodsForEmail,
  GoogleAuthProvider,
  linkWithCredential,
  linkWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth';
import {
  AlertCircle,
  CheckCircle2,
  Cloud,
  CloudOff,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Link2,
  Lock,
  LogOut,
  Mail,
  RefreshCw,
  Shield,
  Star,
  Trophy,
  User as UserIcon,
  X,
} from 'lucide-react';
import firebaseConfig from '../../firebase-applet-config.json';
import gameLogo from '../assets/images/police_parking_logo_1794671133147.jpg';
import { auth, googleProvider } from '../firebase';
import { Language } from '../game/types';

type AuthTab = 'signin' | 'signup' | 'reset';

interface AuthScreenProps {
  language: Language;
  onToggleLanguage: () => void;
  user: User | null;
  isModal?: boolean;
  isSyncing?: boolean;
  solvedCount: number;
  totalStars: number;
  onContinueGuest?: () => void;
  onCloseModal?: () => void;
  onVerifiedRefresh?: (user: User) => Promise<void> | void;
  onAccountUpdated?: (user: User) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AUTH_COPY = {
  ar: {
    brandTitle: 'Police Out',
    brandSub: 'حسابك السحابي يحفظ مراحلك ونجومك تلقائياً',
    signinTab: 'تسجيل الدخول',
    signupTab: 'حساب جديد',
    resetTab: 'نسيت أو تعيين كلمة مرور؟',
    backToSignin: 'العودة لتسجيل الدخول',
    googleBtn: 'المتابعة بحساب Google',
    orDivider: 'أو بالبريد الإلكتروني',
    nameLabel: 'الاسم',
    namePlaceholder: 'مثال: أحمد محمد',
    emailLabel: 'البريد الإلكتروني',
    emailPlaceholder: 'name@example.com',
    passwordLabel: 'كلمة المرور',
    passwordPlaceholder: '6 أحرف على الأقل',
    confirmPasswordLabel: 'تأكيد كلمة المرور',
    confirmPasswordPlaceholder: 'أعد كتابة كلمة المرور',
    signinBtn: 'دخول',
    signupBtn: 'إنشاء الحساب',
    resetBtn: 'إرسال رابط تعيين / استعادة كلمة المرور',
    resetHint:
      'إذا كنت مسجلاً بحساب Google وتريد الدخول بنفس البريد وكلمة مرور، أدخل بريدك هنا لتعيين كلمة مرور مرتبطة بحسابك.',
    guestBtn: 'اللعب كضيف (بدون حساب)',
    closeBtn: 'إغلاق',
    resetSuccess: 'تم إرسال رابط تعيين/إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.',
    verifyTitle: 'فعّل بريدك الإلكتروني للمزامنة',
    verifyBody:
      'أرسلنا رابط التفعيل إلى بريدك. افتح الرسالة واضغط على الرابط، ثم اضغط تحديث لتفعيل الحفظ السحابي.',
    verifyRefreshBtn: 'تم التفعيل — تحديث الآن',
    verifyResendBtn: 'إعادة إرسال الرابط',
    verifyWaitBtn: 'إعادة الإرسال بعد',
    verifyNotYet: 'لم يتم تأكيد البريد بعد. تحقق من البريد الوارد أو الرسائل غير المرغوب فيها.',
    verifyResentOk: 'تم إرسال رابط التفعيل مرة أخرى إلى بريدك.',
    profileTitle: 'حساب الضابط',
    cloudSynced: 'المزامنة السحابية مفعّلة',
    syncingNow: 'جارٍ مزامنة التقدم...',
    solvedStat: 'المراحل المنجزة',
    starsStat: 'مجموع النجوم',
    linkedMethodsTitle: 'طرق تسجيل الدخول المرتبطة',
    googleProviderLabel: 'حساب Google',
    emailProviderLabel: 'البريد وكلمة المرور',
    linkedBadge: 'مرتبط',
    notLinkedBadge: 'غير مرتبط',
    linkGoogleBtn: 'ربط Google',
    setPassBtn: 'تعيين كلمة مرور',
    resetPassBtn: 'تغيير',
    savePassBtn: 'حفظ وربط كلمة المرور',
    cancelBtn: 'إلغاء',
    passLinkedOk: 'تم ربط كلمة المرور بحسابك بنجاح! يمكنك الآن الدخول بالبريد أو بـ Google.',
    googleLinkedOk: 'تم ربط حساب Google بحسابك بنجاح!',
    passResetSentFromProfile: 'تم إرسال رابط تغيير كلمة المرور إلى بريدك الإلكتروني.',
    continueLocalBtn: 'متابعة اللعب محلياً الآن',
    signOutBtn: 'تسجيل الخروج',
    errNameRequired: 'اكتب اسمك (حرفان على الأقل).',
    errEmailInvalid: 'أدخل بريداً إلكترونياً صحيحاً.',
    errPasswordWeak: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.',
    errPasswordMismatch: 'كلمة المرور وتأكيدها غير متطابقتين.',
    errInvalidCred:
      'البريد الإلكتروني أو كلمة المرور غير صحيحة. إذا لم تنشئ حساباً بعد اضغط «حساب جديد»، وإذا كان حسابك مربوطاً بـ Google يمكنك الدخول به أو تعيين كلمة مرور من «نسيت أو تعيين كلمة مرور؟».',
    errGoogleOnlyAccount:
      'هذا البريد مسجل عبر Google ولم يتم تعيين كلمة مرور له بعد. اضغط «المتابعة بحساب Google» أو استخدم «نسيت أو تعيين كلمة مرور؟» لتعيين كلمة مرور للدخول العادي.',
    errEmailInUse: 'هذا البريد مسجل بالفعل. انتقل إلى «تسجيل الدخول» أو «المتابعة بحساب Google».',
    errAccountConflict:
      'هذا البريد مرتبط بطريقة دخول أخرى. سجّل الدخول أولاً بالطريقة الأصلية ثم اربط الحسابين من داخل ملفك الشخصي.',
    errCredAlreadyInUse: 'حساب Google هذا مرتبط بالفعل بحساب آخر.',
    errRequiresRecentLogin:
      'لتأكيد هويتك، اضغط «تغيير» لإرسال رابط تعيين كلمة المرور لبريدك أو أعد تسجيل الدخول.',
    errOperationNotAllowed:
      'تسجيل الدخول بالبريد غير مفعّل في إعدادات Firebase بعد. فعّل Email/Password من Firebase Console أو ادخل بحساب Google.',
    errPopupClosed: 'تم إغلاق نافذة Google قبل إتمام الدخول.',
    errPopupBlocked: 'المتصفح منع نافذة Google. اسمح بالنوافذ المنبثقة ثم حاول مجدداً.',
    errTooMany: 'محاولات كثيرة متتالية. انتظر قليلاً ثم أعد المحاولة.',
    errNetwork: 'تعذر الاتصال بالشبكة. تأكد من الإنترنت.',
    errWebViewGoogle:
      'تعذر إتمام دخول Google على هذا الجهاز. تأكد من وجود حساب Google مضاف بالهاتف ومن ربط بصمة SHA-1 للتطبيق في Firebase، أو استخدم البريد الإلكتروني أعلاه.',
    errGoogleShaMismatch:
      'يلزم تسجيل بصمة SHA-1 لتطبيق Police Out في إعدادات Firebase لتفعيل دخول Google على أندرويد. يمكنك حالياً الدخول بالبريد الإلكتروني أو كضيف.',
    errGoogleNoAccount:
      'لا يوجد حساب Google مسجل على الهاتف أو تم إلغاء الاختيار.',
    errGeneric: 'حدث خطأ غير متوقع. حاول مرة أخرى.',
  },
  en: {
    brandTitle: 'Police Out',
    brandSub: 'Sync your stages and stars seamlessly across devices',
    signinTab: 'Sign In',
    signupTab: 'Create Account',
    resetTab: 'Forgot / Set password?',
    backToSignin: 'Back to Sign In',
    googleBtn: 'Continue with Google',
    orDivider: 'or with email',
    nameLabel: 'Display Name',
    namePlaceholder: 'e.g. Alex Mercer',
    emailLabel: 'Email Address',
    emailPlaceholder: 'name@example.com',
    passwordLabel: 'Password',
    passwordPlaceholder: 'At least 6 characters',
    confirmPasswordLabel: 'Confirm Password',
    confirmPasswordPlaceholder: 'Re-enter your password',
    signinBtn: 'Sign In',
    signupBtn: 'Create Account',
    resetBtn: 'Send Password Setup / Reset Link',
    resetHint:
      'Signed in with Google before and want to sign in with Email & Password too? Enter your Google email to set a password for the same account.',
    guestBtn: 'Play as Guest (Offline)',
    closeBtn: 'Close',
    resetSuccess: 'Password setup/reset link sent! Check your inbox.',
    verifyTitle: 'Verify Your Email to Sync',
    verifyBody:
      'We sent a verification link to your email. Open it, confirm your address, then tap Refresh to enable cloud sync.',
    verifyRefreshBtn: 'I Verified — Refresh',
    verifyResendBtn: 'Resend Verification Email',
    verifyWaitBtn: 'Resend in',
    verifyNotYet: 'Email is not verified yet. Check your inbox or spam folder.',
    verifyResentOk: 'Verification link sent again to your email.',
    continueLocalBtn: 'Continue Playing Locally',
    profileTitle: 'Player Profile',
    cloudSynced: 'Cloud Sync Active',
    syncingNow: 'Syncing progress...',
    solvedStat: 'Solved Stages',
    starsStat: 'Total Stars',
    linkedMethodsTitle: 'Connected Sign-In Methods',
    googleProviderLabel: 'Google Account',
    emailProviderLabel: 'Email & Password',
    linkedBadge: 'Linked',
    notLinkedBadge: 'Not Linked',
    linkGoogleBtn: 'Link Google',
    setPassBtn: 'Set Password',
    resetPassBtn: 'Change',
    savePassBtn: 'Save & Link Password',
    cancelBtn: 'Cancel',
    passLinkedOk: 'Password linked! You can now sign in with Email & Password or Google.',
    googleLinkedOk: 'Google account linked to your profile!',
    passResetSentFromProfile: 'Password reset link sent to your email address.',
    signOutBtn: 'Sign Out',
    errNameRequired: 'Please enter a name (at least 2 characters).',
    errEmailInvalid: 'Please enter a valid email address.',
    errPasswordWeak: 'Password must be at least 6 characters.',
    errPasswordMismatch: 'Passwords do not match.',
    errInvalidCred:
      'Incorrect email or password. If you have not created an account yet, use Create Account first — or if you signed up with Google, use Google Sign-In or "Forgot / Set password?" to set a password.',
    errGoogleOnlyAccount:
      'This email uses Google Sign-In and does not have an app password yet. Sign in with Google below or use "Forgot / Set password?" to set one.',
    errEmailInUse: 'This email is already registered. Try Sign In or Continue with Google.',
    errAccountConflict:
      'This email is registered with another sign-in method. Sign in with your original method first, then link accounts inside your profile.',
    errCredAlreadyInUse: 'This Google account is already linked to another account.',
    errRequiresRecentLogin:
      'For security, please click Change to send a reset email or sign in again first.',
    errOperationNotAllowed:
      'Email/Password sign-in is not enabled in Firebase Console yet. Enable it under Authentication or use Google Sign-In.',
    errPopupClosed: 'Google sign-in popup was closed before completing.',
    errPopupBlocked: 'Popup was blocked by the browser. Allow popups and try again.',
    errTooMany: 'Too many attempts. Please wait a moment and try again.',
    errNetwork: 'Network error. Please check your connection.',
    errWebViewGoogle:
      'Google Sign-In could not complete on this device. Make sure a Google account is signed in and the APK SHA-1 fingerprint is registered in Firebase, or sign in with Email above.',
    errGoogleShaMismatch:
      'Android Google Sign-In requires this APK signing SHA-1 fingerprint to be registered in Firebase Console. Meanwhile, you can use Email & Password or Guest mode.',
    errGoogleNoAccount:
      'No Google account found on device or sign-in was cancelled.',
    errGeneric: 'Something went wrong. Please try again.',
  },
};

function mapFirebaseError(err: unknown, t: (typeof AUTH_COPY)['en']): string {
  const code =
    typeof err === 'object' && err !== null && 'code' in err
      ? String((err as { code?: unknown }).code)
      : '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return t.errInvalidCred;
    case 'auth/email-already-in-use':
      return t.errEmailInUse;
    case 'auth/account-exists-with-different-credential':
      return t.errAccountConflict;
    case 'auth/credential-already-in-use':
      return t.errCredAlreadyInUse;
    case 'auth/requires-recent-login':
      return t.errRequiresRecentLogin;
    case 'auth/invalid-email':
      return t.errEmailInvalid;
    case 'auth/weak-password':
      return t.errPasswordWeak;
    case 'auth/operation-not-allowed':
      return t.errOperationNotAllowed;
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return t.errPopupClosed;
    case 'auth/popup-blocked':
      return t.errPopupBlocked;
    case 'auth/too-many-requests':
      return t.errTooMany;
    case 'auth/network-request-failed':
      return t.errNetwork;
    case 'auth/operation-not-supported-in-this-environment':
      return t.errWebViewGoogle;
    default:
      return t.errGeneric;
  }
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  language,
  onToggleLanguage,
  user,
  isModal = false,
  isSyncing = false,
  solvedCount,
  totalStars,
  onContinueGuest,
  onCloseModal,
  onVerifiedRefresh,
  onAccountUpdated,
}) => {
  const t = AUTH_COPY[language];
  const [tab, setTab] = useState<AuthTab>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [showLinkPasswordForm, setShowLinkPasswordForm] = useState(false);
  const [linkPass, setLinkPass] = useState('');
  const [linkPassConfirm, setLinkPassConfirm] = useState('');
  const [, setProviderTick] = useState(0);

  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const clearFeedback = () => {
    setErrorMsg(null);
    setInfoMsg(null);
  };

  const getNativeGoogleCredential = async () => {
    await SocialLogin.initialize({
      google: {
        webClientId: firebaseConfig.oAuthClientId,
        mode: 'online',
        skipAuthOnlyAuthorizationAfterSignIn: true,
      },
    });
    const res = await SocialLogin.login({
      provider: 'google',
      options: {},
    });
    if (res.result.responseType !== 'online' || !res.result.idToken) {
      throw new Error('MISSING_ID_TOKEN');
    }
    return GoogleAuthProvider.credential(res.result.idToken);
  };

  const handleGoogleError = (err: unknown) => {
    const rawMsg =
      err instanceof Error
        ? err.message
        : typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message?: unknown }).message)
          : String(err);
    const code =
      typeof err === 'object' && err !== null && 'code' in err
        ? String((err as { code?: unknown }).code)
        : '';
    if (code) {
      setErrorMsg(mapFirebaseError(err, t));
      return;
    }
    if (Capacitor.isNativePlatform()) {
      if (
        rawMsg.includes('28444') ||
        rawMsg.toLowerCase().includes('developer console') ||
        rawMsg.includes('10:')
      ) {
        setErrorMsg(t.errGoogleShaMismatch);
      } else if (
        rawMsg.includes('USER_CANCELLED') ||
        rawMsg.toLowerCase().includes('cancel') ||
        rawMsg.toLowerCase().includes('no credential')
      ) {
        setErrorMsg(t.errGoogleNoAccount);
      } else if (rawMsg.toLowerCase().includes('network')) {
        setErrorMsg(t.errNetwork);
      } else {
        setErrorMsg(t.errWebViewGoogle);
      }
    } else {
      setErrorMsg(mapFirebaseError(err, t));
    }
  };

  const handleGoogleSignIn = async () => {
    clearFeedback();
    setBusy(true);
    try {
      if (Capacitor.isNativePlatform()) {
        const credential = await getNativeGoogleCredential();
        await signInWithCredential(auth, credential);
      } else {
        await signInWithPopup(auth, googleProvider);
      }
    } catch (err) {
      handleGoogleError(err);
    } finally {
      setBusy(false);
    }
  };

  const handleLinkGoogle = async () => {
    if (!user) return;
    clearFeedback();
    setBusy(true);
    try {
      if (Capacitor.isNativePlatform()) {
        const credential = await getNativeGoogleCredential();
        await linkWithCredential(user, credential);
      } else {
        await linkWithPopup(user, googleProvider);
      }
      await user.reload();
      if (auth.currentUser) {
        onAccountUpdated?.(auth.currentUser);
      }
      setProviderTick((v) => v + 1);
      setInfoMsg(t.googleLinkedOk);
    } catch (err) {
      handleGoogleError(err);
    } finally {
      setBusy(false);
    }
  };

  const handleLinkPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;
    clearFeedback();

    if (linkPass.length < 6) {
      setErrorMsg(t.errPasswordWeak);
      return;
    }
    if (linkPass !== linkPassConfirm) {
      setErrorMsg(t.errPasswordMismatch);
      return;
    }

    setBusy(true);
    try {
      const cred = EmailAuthProvider.credential(user.email, linkPass);
      await linkWithCredential(user, cred);
      await user.reload();
      if (auth.currentUser) {
        onAccountUpdated?.(auth.currentUser);
      }
      setProviderTick((v) => v + 1);
      setShowLinkPasswordForm(false);
      setLinkPass('');
      setLinkPassConfirm('');
      setInfoMsg(t.passLinkedOk);
    } catch (err) {
      setErrorMsg(mapFirebaseError(err, t));
    } finally {
      setBusy(false);
    }
  };

  const handleSendProfilePasswordReset = async () => {
    if (!user?.email) return;
    clearFeedback();
    setBusy(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      setInfoMsg(t.passResetSentFromProfile);
    } catch (err) {
      setErrorMsg(mapFirebaseError(err, t));
    } finally {
      setBusy(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      setErrorMsg(t.errEmailInvalid);
      return;
    }

    if (tab === 'reset') {
      setBusy(true);
      try {
        await sendPasswordResetEmail(auth, trimmedEmail);
        setInfoMsg(t.resetSuccess);
      } catch (err) {
        setErrorMsg(mapFirebaseError(err, t));
      } finally {
        setBusy(false);
      }
      return;
    }

    if (tab === 'signup' && name.trim().length < 2) {
      setErrorMsg(t.errNameRequired);
      return;
    }

    if (password.length < 6) {
      setErrorMsg(t.errPasswordWeak);
      return;
    }

    if (tab === 'signup' && password !== confirmPassword) {
      setErrorMsg(t.errPasswordMismatch);
      return;
    }

    setBusy(true);
    try {
      if (tab === 'signin') {
        await signInWithEmailAndPassword(auth, trimmedEmail, password);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
        await updateProfile(cred.user, {
          displayName: name.trim().slice(0, 80),
        });
        await sendEmailVerification(cred.user);
        setResendCooldown(60);
      }
    } catch (err) {
      const code =
        typeof err === 'object' && err !== null && 'code' in err
          ? String((err as { code?: unknown }).code)
          : '';
      if (
        tab === 'signin' &&
        (code === 'auth/invalid-credential' ||
          code === 'auth/user-not-found' ||
          code === 'auth/wrong-password')
      ) {
        try {
          const methods = await fetchSignInMethodsForEmail(auth, trimmedEmail);
          if (methods.includes('google.com') && !methods.includes('password')) {
            setErrorMsg(t.errGoogleOnlyAccount);
            setBusy(false);
            return;
          }
        } catch {
          // Enumeration protection may return empty; fall through to standard clear guidance
        }
      }
      setErrorMsg(mapFirebaseError(err, t));
    } finally {
      setBusy(false);
    }
  };

  const handleRefreshVerification = async () => {
    if (!user) return;
    clearFeedback();
    setBusy(true);
    try {
      await user.reload();
      await user.getIdToken(true);
      const refreshed = auth.currentUser;
      if (refreshed?.emailVerified) {
        await onVerifiedRefresh?.(refreshed);
      } else {
        setErrorMsg(t.verifyNotYet);
      }
    } catch (err) {
      setErrorMsg(mapFirebaseError(err, t));
    } finally {
      setBusy(false);
    }
  };

  const handleResendVerification = async () => {
    if (!user || resendCooldown > 0) return;
    clearFeedback();
    setBusy(true);
    try {
      await sendEmailVerification(user);
      setInfoMsg(t.verifyResentOk);
      setResendCooldown(60);
    } catch (err) {
      setErrorMsg(mapFirebaseError(err, t));
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    clearFeedback();
    setBusy(true);
    try {
      if (Capacitor.isNativePlatform()) {
        await SocialLogin.logout({ provider: 'google' }).catch(() => undefined);
      }
      await signOut(auth);
      onCloseModal?.();
    } catch (err) {
      setErrorMsg(mapFirebaseError(err, t));
    } finally {
      setBusy(false);
    }
  };

  const renderCardBody = () => {
    // Case 1: Signed-in & Verified Profile View
    if (user && user.emailVerified) {
      const displayName =
        user.displayName?.trim() || user.email?.split('@')[0] || 'Player';
      const initials = displayName.slice(0, 2).toUpperCase();
      const hasGoogle = user.providerData.some((p) => p.providerId === 'google.com');
      const hasPassword = user.providerData.some((p) => p.providerId === 'password');

      return (
        <div className="p-6 max-h-[85dvh] overflow-y-auto">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-extrabold text-white">{t.profileTitle}</h2>
            {isModal && onCloseModal && (
              <button
                type="button"
                onClick={onCloseModal}
                aria-label={t.closeBtn}
                className="min-w-[40px] min-h-[40px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 mb-4">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={displayName}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-2xl object-cover border border-slate-700 shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-sky-500/20 border border-sky-400/40 text-sky-300 font-extrabold text-lg flex items-center justify-center shrink-0">
                {initials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-base font-extrabold text-white truncate">
                {displayName}
              </div>
              <div className="text-xs text-slate-400 truncate font-num" dir="ltr">
                {user.email}
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <Cloud className={`w-3.5 h-3.5 ${isSyncing ? 'animate-pulse' : ''}`} />
                <span>{isSyncing ? t.syncingNow : t.cloudSynced}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/70">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.solvedStat}</span>
              </div>
              <div className="text-2xl font-extrabold text-white font-num">
                {solvedCount}
                <span className="text-xs text-slate-400 font-normal"> / 360</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/70">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>{t.starsStat}</span>
              </div>
              <div className="text-2xl font-extrabold text-amber-300 font-num">
                {totalStars}
                <span className="text-xs text-slate-400 font-normal"> / 1080</span>
              </div>
            </div>
          </div>

          {/* Connected Sign-In Methods (Instagram/Enterprise Style Account Linking) */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 mb-4 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-300">
              <Link2 className="w-3.5 h-3.5 text-sky-400" />
              <span>{t.linkedMethodsTitle}</span>
            </div>

            {/* Google Provider Status */}
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z" />
                    <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z" />
                  </svg>
                </span>
                <span className="text-xs font-bold text-slate-200 truncate">
                  {t.googleProviderLabel}
                </span>
              </div>
              {hasGoogle ? (
                <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/35 px-2 py-1 rounded-lg shrink-0">
                  {t.linkedBadge}
                </span>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleLinkGoogle}
                  className="text-[11px] font-extrabold text-slate-950 bg-amber-400 hover:bg-amber-300 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {t.linkGoogleBtn}
                </button>
              )}
            </div>

            {/* Email/Password Provider Status */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-300 flex items-center justify-center shrink-0">
                    <KeyRound className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs font-bold text-slate-200 truncate">
                    {t.emailProviderLabel}
                  </span>
                </div>
                {hasPassword ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/35 px-2 py-1 rounded-lg">
                      {t.linkedBadge}
                    </span>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={handleSendProfilePasswordReset}
                      className="text-[11px] font-bold text-sky-300 hover:text-sky-200 bg-slate-800 px-2 py-1 rounded-lg cursor-pointer"
                    >
                      {t.resetPassBtn}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      clearFeedback();
                      setShowLinkPasswordForm((v) => !v);
                    }}
                    className="text-[11px] font-extrabold text-slate-950 bg-amber-400 hover:bg-amber-300 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {t.setPassBtn}
                  </button>
                )}
              </div>

              {!hasPassword && showLinkPasswordForm && (
                <form onSubmit={handleLinkPasswordSubmit} className="space-y-2 pt-2 border-t border-slate-800">
                  <input
                    type="password"
                    dir="ltr"
                    value={linkPass}
                    onChange={(e) => setLinkPass(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    className="w-full min-h-[38px] px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-num"
                  />
                  <input
                    type="password"
                    dir="ltr"
                    value={linkPassConfirm}
                    onChange={(e) => setLinkPassConfirm(e.target.value)}
                    placeholder={t.confirmPasswordPlaceholder}
                    className="w-full min-h-[38px] px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-num"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowLinkPasswordForm(false);
                        setLinkPass('');
                        setLinkPassConfirm('');
                      }}
                      className="flex-1 min-h-[36px] rounded-lg bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
                    >
                      {t.cancelBtn}
                    </button>
                    <button
                      type="submit"
                      disabled={busy}
                      className="flex-1 min-h-[36px] rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold cursor-pointer disabled:opacity-50"
                    >
                      {t.savePassBtn}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {errorMsg && (
            <div className="mb-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2 leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="mb-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-200 flex items-start gap-2 leading-relaxed">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{infoMsg}</span>
            </div>
          )}

          <div className="flex gap-2.5">
            <button
              type="button"
              disabled={busy}
              onClick={handleSignOut}
              className="flex-1 min-h-[46px] rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-200 font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.signOutBtn}</span>
            </button>
            {isModal && onCloseModal && (
              <button
                type="button"
                onClick={onCloseModal}
                className="flex-1 min-h-[46px] rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-colors cursor-pointer"
              >
                {t.closeBtn}
              </button>
            )}
          </div>
        </div>
      );
    }

    // Case 2: Signed-in with Email/Password but Email NOT Verified yet
    if (user && !user.emailVerified) {
      return (
        <div className="p-6">
          <div className="flex items-start justify-between gap-2 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            {isModal && onCloseModal && (
              <button
                type="button"
                onClick={onCloseModal}
                aria-label={t.closeBtn}
                className="min-w-[40px] min-h-[40px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <h2 className="text-lg font-extrabold text-white mb-1.5">{t.verifyTitle}</h2>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">{t.verifyBody}</p>
          <div
            dir="ltr"
            className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-sky-300 font-num truncate mb-4 text-center"
          >
            {user.email}
          </div>

          {errorMsg && (
            <div className="mb-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="mb-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{infoMsg}</span>
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              disabled={busy}
              onClick={handleRefreshVerification}
              className="w-full min-h-[46px] rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${busy ? 'animate-spin' : ''}`} />
              <span>{t.verifyRefreshBtn}</span>
            </button>

            <button
              type="button"
              disabled={busy || resendCooldown > 0}
              onClick={handleResendVerification}
              className="w-full min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>
                {resendCooldown > 0
                  ? `${t.verifyWaitBtn} ${resendCooldown}s`
                  : t.verifyResendBtn}
              </span>
            </button>

            {(onContinueGuest || onCloseModal) && (
              <button
                type="button"
                onClick={isModal ? onCloseModal : onContinueGuest}
                className="w-full min-h-[44px] rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                {t.continueLocalBtn}
              </button>
            )}

            <button
              type="button"
              disabled={busy}
              onClick={handleSignOut}
              className="w-full min-h-[40px] rounded-xl text-rose-300 hover:bg-rose-500/10 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t.signOutBtn}</span>
            </button>
          </div>
        </div>
      );
    }

    // Case 3: Sign In / Sign Up / Password Reset
    return (
      <div className="p-5 sm:p-6">
        {/* Top Row: Brand Badge + Close / Language */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-700/80 flex items-center justify-center text-amber-400 shadow-lg shrink-0 relative overflow-hidden">
              {!logoError ? (
                <img
                  src={gameLogo}
                  alt={t.brandTitle}
                  referrerPolicy="no-referrer"
                  onError={() => setLogoError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Shield className="w-5 h-5 relative z-10" />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-extrabold text-white leading-tight truncate">
                {t.brandTitle}
              </h1>
              <p className="text-xs text-slate-400 leading-snug">{t.brandSub}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onToggleLanguage}
              aria-label="Toggle language"
              className="min-w-[40px] min-h-[40px] px-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer font-num"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'EN' : 'AR'}</span>
            </button>
            {isModal && onCloseModal && (
              <button
                type="button"
                onClick={onCloseModal}
                aria-label={t.closeBtn}
                className="min-w-[40px] min-h-[40px] rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Mode Tabs */}
        {tab !== 'reset' ? (
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 mb-4">
            <button
              type="button"
              onClick={() => {
                setTab('signin');
                clearFeedback();
              }}
              className={`min-h-[40px] rounded-lg text-xs font-extrabold transition-colors cursor-pointer ${
                tab === 'signin'
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.signinTab}
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('signup');
                clearFeedback();
              }}
              className={`min-h-[40px] rounded-lg text-xs font-extrabold transition-colors cursor-pointer ${
                tab === 'signup'
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.signupTab}
            </button>
          </div>
        ) : (
          <div className="mb-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" />
                {t.resetTab}
              </span>
              <button
                type="button"
                onClick={() => {
                  setTab('signin');
                  clearFeedback();
                }}
                className="text-xs font-bold text-sky-400 hover:text-sky-300 cursor-pointer"
              >
                {t.backToSignin}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">{t.resetHint}</p>
          </div>
        )}

        {/* Email / Password Form */}
        <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
          {tab === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {t.nameLabel}
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 start-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.namePlaceholder}
                  autoComplete="name"
                  className="w-full min-h-[46px] ps-10 pe-3.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 focus:outline-none text-sm text-white placeholder:text-slate-600"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              {t.emailLabel}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 start-3.5 pointer-events-none" />
              <input
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                autoComplete="email"
                className="w-full min-h-[46px] ps-10 pe-3.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 focus:outline-none text-sm text-white placeholder:text-slate-600 text-start font-num"
              />
            </div>
          </div>

          {tab !== 'reset' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-300">
                  {t.passwordLabel}
                </label>
                {tab === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setTab('reset');
                      clearFeedback();
                    }}
                    className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 cursor-pointer"
                  >
                    {t.resetTab}
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 start-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  dir={language === 'ar' && !password ? 'rtl' : 'ltr'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
                  className="w-full min-h-[46px] ps-10 pe-11 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 focus:outline-none text-sm text-white placeholder:text-slate-600 text-start font-num"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="w-10 h-10 absolute top-1/2 -translate-y-1/2 end-1 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {tab === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {t.confirmPasswordLabel}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 start-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  dir={language === 'ar' && !confirmPassword ? 'rtl' : 'ltr'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.confirmPasswordPlaceholder}
                  autoComplete="new-password"
                  className="w-full min-h-[46px] ps-10 pe-3.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 focus:outline-none text-sm text-white placeholder:text-slate-600 text-start font-num"
                />
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2 leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-200 flex items-start gap-2 leading-relaxed">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{infoMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full min-h-[48px] mt-1 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-slate-950 font-extrabold text-sm transition-all cursor-pointer disabled:opacity-60 shadow-lg"
          >
            {busy
              ? '...'
              : tab === 'signin'
              ? t.signinBtn
              : tab === 'signup'
              ? t.signupBtn
              : t.resetBtn}
          </button>
        </form>

        {/* Continue as Guest / Close */}
        {(onContinueGuest || (isModal && onCloseModal)) && (
          <button
            type="button"
            disabled={busy}
            onClick={isModal ? onCloseModal : onContinueGuest}
            className="w-full min-h-[46px] mt-3 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <CloudOff className="w-4 h-4 text-slate-400" />
            <span>{isModal ? t.closeBtn : t.guestBtn}</span>
          </button>
        )}

        {/* Google Sign-In Placed Below Guest Button */}
        <div className="my-3.5 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-800" />
          <span className="text-[11px] font-semibold text-slate-400">
            {language === 'ar' ? 'أو' : 'or'}
          </span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={handleGoogleSignIn}
          className="w-full min-h-[48px] rounded-xl bg-white hover:bg-slate-100 active:scale-[0.99] text-slate-900 font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer disabled:opacity-60"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
            />
          </svg>
          <span>{t.googleBtn}</span>
        </button>
      </div>
    );
  };

  const card = (
    <div
      className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Tactical Police Red/Blue Top Lightbar Accent */}
      <div className="h-1.5 w-full flex">
        <div className="flex-1 bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.75)]" />
        <div className="w-6 bg-slate-200" />
        <div className="flex-1 bg-sky-500 shadow-[0_0_12px_rgba(14,165,233,0.75)]" />
      </div>
      {renderCardBody()}
    </div>
  );

  if (isModal) {
    return (
      <div
        className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        onClick={onCloseModal}
      >
        {card}
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full bg-[#0e131b] text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-x-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.12),transparent_55%)]"
      />
      <div className="relative z-10 w-full flex justify-center">{card}</div>
    </div>
  );
};
