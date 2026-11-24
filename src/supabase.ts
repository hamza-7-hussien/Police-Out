import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import supabasePublicConfig from './supabase-config.json';

export const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ||
  supabasePublicConfig.url;
const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ||
  supabasePublicConfig.anonKey;
export const GOOGLE_WEB_CLIENT_ID =
  (import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID as string | undefined)?.trim() ||
  supabasePublicConfig.googleWebClientId;

const AUTH_REQUEST_TIMEOUT_MS = 10_000;

export function isOfflineOrNetworkError(err: unknown): boolean {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return true;
  }
  if (!err) return false;
  const name =
    typeof err === 'object' && 'name' in err ? String((err as { name?: unknown }).name ?? '') : '';
  const msg =
    err instanceof Error
      ? err.message
      : typeof err === 'object' && 'message' in err
        ? String((err as { message?: unknown }).message ?? '')
        : String(err);
  const lower = `${name} ${msg}`.toLowerCase();
  return (
    lower.includes('authretryablefetcherror') ||
    lower.includes('failed to fetch') ||
    lower.includes('network') ||
    lower.includes('offline') ||
    lower.includes('timeout') ||
    lower.includes('aborted') ||
    lower.includes('load failed')
  );
}

function getSupabaseStorageKey(): string | null {
  if (!supabaseUrl) return null;
  try {
    const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
    return projectRef ? `sb-${projectRef}-auth-token` : null;
  } catch {
    return null;
  }
}

export function readCachedAppUser(): AppUser | null {
  if (typeof window === 'undefined') return null;
  const key = getSupabaseStorageKey();
  if (!key) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      user?: User | null;
      currentSession?: { user?: User | null } | null;
      refresh_token?: string;
      access_token?: string;
    } | null;
    if (!parsed || (!parsed.refresh_token && !parsed.access_token)) {
      return null;
    }
    let rawUser = parsed.user ?? parsed.currentSession?.user ?? null;
    if (!rawUser) {
      const splitRaw = window.localStorage.getItem(`${key}-user`);
      if (splitRaw) {
        const splitParsed = JSON.parse(splitRaw) as { user?: User | null } | null;
        rawUser = splitParsed?.user ?? null;
      }
    }
    return toAppUser(rawUser);
  } catch {
    return null;
  }
}

const offlineAwareFetch: typeof fetch = async (input, init) => {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new TypeError('Failed to fetch: device is offline');
  }

  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), AUTH_REQUEST_TIMEOUT_MS);

  const upstreamSignal = init?.signal;
  const onUpstreamAbort = () => controller.abort();
  if (upstreamSignal) {
    if (upstreamSignal.aborted) {
      controller.abort();
    } else {
      upstreamSignal.addEventListener('abort', onUpstreamAbort, { once: true });
    }
  }

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    globalThis.clearTimeout(timeoutId);
    upstreamSignal?.removeEventListener('abort', onUpstreamAbort);
  }
};

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        fetch: offlineAwareFetch,
      },
    })
  : null;

export interface AppUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName: string;
  photoURL: string;
  hasGoogle: boolean;
  hasPassword: boolean;
}

export function sanitizeHttpsUrl(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (!trimmed.startsWith('https://') || trimmed.length > 500) return '';
  return trimmed;
}

export function toAppUser(sbUser: User | null | undefined): AppUser | null {
  if (!sbUser) return null;

  const meta = (sbUser.user_metadata ?? {}) as Record<string, unknown>;
  const appMeta = (sbUser.app_metadata ?? {}) as Record<string, unknown>;
  const identities = Array.isArray(sbUser.identities) ? sbUser.identities : [];
  const providersList = Array.isArray(appMeta.providers)
    ? (appMeta.providers as unknown[]).map((p) => String(p))
    : [];

  const email = typeof sbUser.email === 'string' ? sbUser.email : '';
  const rawName =
    (typeof meta.display_name === 'string' && meta.display_name.trim()) ||
    (typeof meta.full_name === 'string' && meta.full_name.trim()) ||
    (typeof meta.name === 'string' && meta.name.trim()) ||
    (email ? email.split('@')[0].trim() : '') ||
    'Officer';

  const photoURL = sanitizeHttpsUrl(meta.avatar_url ?? meta.picture ?? '');

  const hasGoogle =
    identities.some((id) => id.provider === 'google') ||
    providersList.includes('google') ||
    appMeta.provider === 'google';

  const hasPassword =
    identities.some((id) => id.provider === 'email') ||
    providersList.includes('email') ||
    appMeta.provider === 'email';

  const emailVerified = Boolean(
    sbUser.email_confirmed_at ||
      sbUser.confirmed_at ||
      meta.email_verified === true
  );

  return {
    uid: sbUser.id,
    email,
    emailVerified,
    displayName: rawName.slice(0, 80) || 'Officer',
    photoURL,
    hasGoogle,
    hasPassword,
  };
}
