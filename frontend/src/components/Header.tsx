import type { NavigationPage } from '../types/app';

interface HeaderProps {
  userEmail: string;
  currentPage: NavigationPage;
  isDemoMode?: boolean;
  onNavigate: (page: NavigationPage) => void;
  onOpenTestSetup: () => void;
  onLogout: () => void;
}

export function Header({
  userEmail,
  currentPage,
  isDemoMode,
  onNavigate,
  onOpenTestSetup,
  onLogout,
}: HeaderProps) {
  return (
    <header className="persistent-header">
      <div className="header-brand" onClick={() => onNavigate('overview')}>
        <span className="brand-logo jp-font">解</span>
        <span className="brand-title">Gesenu</span>
        {isDemoMode && (
          <span
            style={{
              fontSize: '0.7rem',
              padding: '0.2rem 0.5rem',
              borderRadius: '999px',
              background: 'var(--plum)',
              color: 'var(--ivory)',
              fontWeight: 600,
              marginLeft: '0.5rem',
              letterSpacing: '0.05em',
            }}
          >
            ⚡ DEMO
          </span>
        )}
      </div>

      <nav className="header-nav">
        <button
          className={`nav-link ${currentPage === 'overview' ? 'active' : ''}`}
          onClick={() => onNavigate('overview')}
        >
          Overview
        </button>
        <button
          className={`nav-link ${currentPage === 'encounter' ? 'active' : ''}`}
          onClick={() => onNavigate('encounter')}
        >
          Encounter
        </button>
        <button
          className={`nav-link ${currentPage.startsWith('study') ? 'active' : ''}`}
          onClick={() => onNavigate('study_arc')}
        >
          Study
        </button>
        <button
          className={`nav-link ${currentPage.startsWith('test') ? 'active' : ''}`}
          onClick={onOpenTestSetup}
        >
          Test
        </button>
      </nav>

      <div className="header-profile">
        <div className="avatar-icon" title={userEmail}>
          {userEmail.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="profile-info">
          <span className="user-email">{userEmail}</span>
          <button className="logout-btn" onClick={onLogout}>
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
