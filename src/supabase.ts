import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import supabasePublicConfig from './supabase-config.json';

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ||
  supabasePublicConfig.url;
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ||
  supabasePublicConfig.anonKey;
export const GOOGLE_WEB_CLIENT_ID =
  (import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID as string | undefined)?.trim() ||
  supabasePublicConfig.googleWebClientId;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
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
