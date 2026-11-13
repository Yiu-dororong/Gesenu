import { createContext, useContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuthContextValue {
  /** Current Supabase session — null when logged out. */
  session: Session | null;
  /** Shorthand for session?.user ?? null. */
  user: User | null;
  /** True while the initial session restore is in-flight. */
  loading: boolean;
  /** Redirect to X (formerly Twitter) OAuth2 consent screen. */
  signInWithX: () => Promise<void>;
  /** Redirect to Discord OAuth2 consent screen. */
  signInWithDiscord: () => Promise<void>;
  /** Sign out and clear the local session. */
  signOut: () => Promise<void>;
  /**
   * Returns the current access token for use in API Authorization headers.
   * Returns null if there is no active session.
   */
  getAccessToken: () => string | null;
}

// ---------------------------------------------------------------------------
// Context Definition
// ---------------------------------------------------------------------------

export const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * useAuth() — consume the AuthContext anywhere below <AuthProvider>.
 * Throws if used outside the provider (catches wiring mistakes early).
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth() must be used inside <AuthProvider>. Check main.tsx.');
  }
  return ctx;
}
