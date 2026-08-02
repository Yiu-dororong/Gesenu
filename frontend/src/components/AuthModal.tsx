import type { FormEvent } from 'react';

interface AuthModalProps {
  show: boolean;
  authEmailInput: string;
  setAuthEmailInput: (val: string) => void;
  onLoginGuest: () => void;
  onLoginStandard: (e: FormEvent) => void;
  onClose: () => void;
}

export function AuthModal({
  show,
  authEmailInput,
  setAuthEmailInput,
  onLoginGuest,
  onLoginStandard,
  onClose,
}: AuthModalProps) {
  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2 className="jp-font">Sign In to Gesenu</h2>
        <p className="sub">Experience contract-first Japanese learning with FSM SRS.</p>

        <button className="btn-social-oauth" onClick={onLoginGuest}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Continue as Guest (Instant Access)
        </button>

        <div className="divider">or standard login</div>

        <form onSubmit={onLoginStandard} className="auth-form">
          <input
            type="email"
            placeholder="Enter your email address..."
            value={authEmailInput}
            onChange={(e) => setAuthEmailInput(e.target.value)}
            required
            className="input-field"
          />
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            Enter Hub
          </button>
        </form>

        <button className="btn-secondary-link" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
