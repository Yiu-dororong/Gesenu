import { useState } from 'react';
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

interface DiscoverCategory {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  items: { name: string; url: string; note?: string }[];
}

const DISCOVER_CATEGORIES: DiscoverCategory[] = [
  {
    id: 'novel',
    icon: '📚',
    title: 'Read a novel',
    subtitle: 'Classic literature & web fiction',
    items: [
      { name: '青空文庫', url: 'https://www.aozora.gr.jp/', note: 'Aozora Bunko · Public domain classics' },
      { name: 'カクヨム', url: 'https://kakuyomu.jp/', note: 'Kakuyomu · Modern web novels' },
      { name: '小説家になろう', url: 'https://syosetu.com/', note: 'Shousetsuka ni Narou · Web stories' },
    ],
  },
  {
    id: 'news',
    icon: '📰',
    title: "Read today's news",
    subtitle: 'Furigana & daily current affairs',
    items: [
      { name: 'NHK NEWS WEB EASY', url: 'https://www3.nhk.or.jp/news/easy/', note: 'Easy Japanese with furigana' },
      { name: 'NHK NEWS WEB', url: 'https://www3.nhk.or.jp/news/', note: 'Standard daily Japanese news' },
    ],
  },
  {
    id: 'social',
    icon: '💬',
    title: 'See everyday Japanese',
    subtitle: 'Social media & discussion boards',
    items: [
      { name: 'X', url: 'https://x.com/', note: 'Real-time casual posts & trends' },
      { name: '2ch (5ch)', url: 'https://5ch.net/', note: 'Colloquial forum discussions & slang' },
    ],
  },
  {
    id: 'video',
    icon: '🎥',
    title: 'Watch something',
    subtitle: 'Video communities & streaming',
    items: [
      { name: 'YouTube', url: 'https://www.youtube.com/', note: 'Japanese channels & vlogs' },
      { name: 'ニコニコ動画', url: 'https://www.nicovideo.jp/', note: 'Niconico · Japanese video platform' },
    ],
  },
];

export function OverviewPage({
  userEmail,
  totalCards,
  totalDueCards,
  words,
  decks,
  onNavigate,
  onOpenTestSetup,
}: OverviewPageProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const toggleCategory = (id: string) => {
    setActiveCategory((prev) => (prev === id ? null : id));
  };

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

      {/* Discover Section */}
      <section className="discover-section">
        <div className="discover-header">
          <h3 className="discover-title jp-font">Discover Japanese Media & Content</h3>
          <p className="discover-sub">Explore authentic Japanese sources to encounter real-world vocabulary</p>
        </div>

        <div className="discover-grid">
          {DISCOVER_CATEGORIES.map((cat) => {
            const isOpen = activeCategory === cat.id;
            return (
              <div key={cat.id} className={`discover-card ${isOpen ? 'active' : ''}`}>
                <button
                  className="discover-btn"
                  onClick={() => toggleCategory(cat.id)}
                  aria-expanded={isOpen}
                >
                  <span className="discover-icon">{cat.icon}</span>
                  <div className="discover-text">
                    <span className="discover-btn-title">{cat.title}</span>
                    <span className="discover-btn-sub">{cat.subtitle}</span>
                  </div>
                  <span className="discover-chevron">{isOpen ? '▲' : '▼'}</span>
                </button>

                {isOpen && (
                  <div className="discover-items-list">
                    {cat.items.map((item) => (
                      <a
                        key={item.name}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="discover-item-link"
                      >
                        <span className="item-name jp-font">{item.name}</span>
                        {item.note && <span className="item-note">{item.note}</span>}
                        <span className="external-arrow">↗</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
