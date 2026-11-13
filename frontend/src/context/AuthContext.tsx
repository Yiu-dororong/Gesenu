/**
 * context/AuthContext.tsx — Supabase Auth Provider Component
 *
 * Provides session lifecycle, automatic HttpOnly cookie synchronization,
 * and OAuth2 login/logout bindings via React Context.
 */

import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { API_BASE } from '../constants/decks';
import { AuthContext } from './authContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const syncSessionCookie = useCallback(async (currentSession: Session | null) => {
    if (currentSession?.access_token) {
      try {
        await fetch(`${API_BASE}/api/auth/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            access_token: currentSession.access_token,
            refresh_token: currentSession.refresh_token ?? null,
          }),
        });
      } catch (err) {
        console.warn('Failed to sync session cookie to backend:', err);
      }
    }
  }, []);

  const clearSessionCookie = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.warn('Failed to clear session cookies:', err);
    }
  }, []);

  useEffect(() => {
    // Restore existing session from storage on first mount
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) {
        void syncSessionCookie(data.session);
      }
      setLoading(false);
    });

    // Subscribe to auth state changes: SIGNED_IN (includes X/Discord OAuth redirect),
    // SIGNED_OUT, TOKEN_REFRESHED, etc.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (newSession) {
        void syncSessionCookie(newSession);
        // Clean up OAuth tokens / PKCE code from URL for a clean address bar
        if (window.location.hash.includes('access_token=') || window.location.search.includes('code=')) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      } else if (event === 'SIGNED_OUT') {
        void clearSessionCookie();
      }
    });

    return () => subscription.unsubscribe();
  }, [syncSessionCookie, clearSessionCookie]);

  const signInWithX = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'x',
      options: {
        redirectTo: window.location.origin,
      },
    });
  }, []);

  const signInWithDiscord = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: window.location.origin,
      },
    });
  }, []);

  const signOut = useCallback(async () => {
    await clearSessionCookie();
    await supabase.auth.signOut();
  }, [clearSessionCookie]);

  const getAccessToken = useCallback((): string | null => {
    return session?.access_token ?? null;
  }, [session]);

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        signInWithX,
        signInWithDiscord,
        signOut,
        getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
