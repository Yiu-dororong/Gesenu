/**
 * AuthModal.tsx — Sign-in modal with real Supabase OAuth
 *
 * Providers: X (formerly Twitter), Discord (configured in Supabase dashboard).
 * Guest option launches in-memory demo mode (no account needed).
 *
 * Props:
 *   show         — controls visibility
 *   onClose      — dismiss without signing in
 *   onLoginGuest — start in-memory demo session (no Supabase call)
 */

import { useAuth } from '../context/authContext';

interface AuthModalProps {
  show: boolean;
  onClose: () => void;
  onLoginGuest: () => void;
}

export function AuthModal({ show, onClose, onLoginGuest }: AuthModalProps) {
  const { signInWithX, signInWithDiscord } = useAuth();

  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2 className="jp-font">Sign In to Gesenu</h2>
        <p className="sub">Experience contract-first Japanese learning.</p>

        {/* X (formerly Twitter) OAuth */}
        <button
          className="btn-social-oauth"
          onClick={signInWithX}
          id="auth-x-btn"
        >
        <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/x.svg" alt="X Logo" width="20" height="20" />
          Continue with X
        </button>

        {/* Discord OAuth */}
        <button
          className="btn-social-oauth"
          onClick={signInWithDiscord}
          id="auth-discord-btn"
        >
        <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/x.svg" alt="X Logo" width="20" height="20" />
          Continue with Discord
        </button>

        <div className="divider">or</div>

        {/* Guest / Demo mode — no account required */}
        <button
          className="btn-social-oauth"
          onClick={onLoginGuest}
          id="auth-guest-btn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Continue as Guest (In-Memory Demo)
        </button>

        <button className="btn-secondary-link" onClick={onClose} id="auth-cancel-btn">
          Cancel
        </button>
      </div>
    </div>
  );
}
