import type { WordCard, DeckItem, NavigationPage } from '../types/app';

interface OverviewPageProps {
  userEmail: string;
  totalCards: number;
  totalDueCards: number;
  words: WordCard[];
  decks: DeckItem[];
  onNavigate: (page: NavigationPage) => void;
  onOpenTestSetup: () => void;
}

export function OverviewPage({
  userEmail,
  totalCards,
  totalDueCards,
  words,
  decks,
  onNavigate,
  onOpenTestSetup,
}: OverviewPageProps) {
  return (
    <main className="hub-container">
      <div className="hub-welcome">
        <h2>
          Welcome back, <span className="highlight">{userEmail.split('@')[0]}</span>
        </h2>
      </div>

      {/* 3 Function Tiles */}
      <section className="tiles-grid">
        {/* Tile 1: Encounter */}
        <div className="function-tile tile-encounter" onClick={() => onNavigate('encounter')}>
          <div className="tile-badge encounter-badge">🗻</div>
          <h3 className="jp-font">Encounter</h3>
          <p className="tile-desc">Parse Japanese sentences & save vocabulary to target decks.</p>
          <div className="tile-action">Parse New Sentence →</div>
        </div>

        {/* Tile 2: Study */}
        <div className="function-tile tile-study" onClick={() => onNavigate('study_arc')}>
          <div className="tile-badge study-badge">🦅</div>
          <h3 className="jp-font">Study</h3>
          <p className="tile-desc">Browse deck arc & review flashcards with optimistic status pills.</p>

          <div className="tile-status-live">
            {totalCards === 0 ? (
              <span className="empty-state-notice">Nothing yet → start with Encounter</span>
            ) : (
              <span className="live-due-count">
                <strong>{totalDueCards}</strong> due for review
              </span>
            )}
          </div>
          <div className="tile-action">Open Arc Browser →</div>
        </div>

        {/* Tile 3: Test */}
        <div className="function-tile tile-test" onClick={onOpenTestSetup}>
          <div className="tile-badge test-badge">🍆</div>
          <h3 className="jp-font">Test</h3>
          <p className="tile-desc">Masked sentence recall sessions over selected decks.</p>

          <div className="tile-status-live">
            {totalCards === 0 ? (
              <span className="empty-state-notice">Nothing yet → start with Encounter</span>
            ) : (
              <span className="live-due-count">
                <strong>{totalDueCards}</strong> ready for test
              </span>
            )}
          </div>
          <div className="tile-action">Configure Session →</div>
        </div>
      </section>

      {/* Analytics Row */}
      <section className="analytics-row">
        <h3 className="analytics-title jp-font">Learning Analytics Overview</h3>
        <div className="analytics-cards">
          <div className="stat-card">
            <span className="stat-value">{totalCards}</span>
            <span className="stat-label">Total Vocabulary Cards</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{words.filter((w) => w.status === 'Mastered').length}</span>
            <span className="stat-label">Mastered Lemmas</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{words.filter((w) => w.status === 'Known').length}</span>
            <span className="stat-label">Known Words</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{decks.length}</span>
            <span className="stat-label">Active Decks</span>
          </div>
        </div>
      </section>
    </main>
  );
}
