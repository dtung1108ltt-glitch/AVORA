import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: {
          getItem: (key) => {
            try {
              return localStorage.getItem(key);
            } catch {
              return null;
            }
          },
          setItem: (key, value) => {
            try {
              localStorage.setItem(key, value);
            } catch {
              // Storage full or blocked
            }
          },
          removeItem: (key) => {
            try {
              localStorage.removeItem(key);
            } catch {
              // Ignore
            }
          },
        },
      },
    })
  : null;

if (!supabase) {
  console.warn('Supabase credentials not configured. OAuth login will not work.');
  console.warn('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
}

export type AuthProvider = 'google' | 'microsoft' | 'github' | 'linkedin';

export const getOAuthRedirectUrl = (provider: AuthProvider) => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  return `${apiUrl}/api/auth/${provider}`;
};

export async function signInWithOAuth(provider: string) {
  if (!supabase) throw new Error('Supabase not configured');
  // Supabase's own provider identifiers differ from our UI-facing provider names.
  const providerMap: Record<string, string> = { microsoft: 'azure', linkedin: 'linkedin_oidc' };
  const supabaseProvider = providerMap[provider] || provider;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: supabaseProvider as any,
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
  if (error) throw error;
}

export const signOut = async () => {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  if (!supabase) return null;
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const onAuthStateChange = (callback: (user: unknown) => void) => {
  if (!supabase) {
    return { data: { unsubscribe: () => {} } };
  }
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
};