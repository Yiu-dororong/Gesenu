import type { Dispatch, SetStateAction } from 'react';
import type { DeckItem, NavigationPage } from '../types/app';

interface TestSetupPageProps {
  decks: DeckItem[];
  selectedTestDeckIds: string[];
  setSelectedTestDeckIds: Dispatch<SetStateAction<string[]>>;
  deckStats: Record<string, { total: number; due: number }>;
  onNavigate: (page: NavigationPage) => void;
  onLaunchTestSession: () => void;
}

export function TestSetupPage({
  decks,
  selectedTestDeckIds,
  setSelectedTestDeckIds,
  deckStats,
  onNavigate,
  onLaunchTestSession,
}: TestSetupPageProps) {
  return (
    <main className="container">
      <div className="deck-nav-bar">
        <button className="back-btn" onClick={() => onNavigate('overview')}>
          ‹ Overview
        </button>
        <h2>Configure Masked Recall Test</h2>
      </div>

      <div className="setup-card">
        <h3>Select Decks to Include in Session</h3>
        <p className="sub">Defaults to all decks due today. Narrow down your focus if desired.</p>

        <div className="deck-checkbox-list">
          {decks.map((d) => {
            const checked = selectedTestDeckIds.includes(d.id);
            const stats = deckStats[d.id] || { due: 0 };
            return (
              <label key={d.id} className={`deck-checkbox-item ${checked ? 'checked' : ''}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTestDeckIds((prev) => [...prev, d.id]);
                    } else {
                      setSelectedTestDeckIds((prev) => prev.filter((id) => id !== d.id));
                    }
                  }}
                />
                <span className="checkbox-swatch" style={{ background: d.color }}></span>
                <span className="checkbox-title jp-font">
                  {d.jp} · {d.en}
                </span>
                <span className="checkbox-meta">{stats.due} due</span>
              </label>
            );
          })}
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn-primary"
            onClick={onLaunchTestSession}
            disabled={selectedTestDeckIds.length === 0}
            style={{ width: '100%' , height: '40px', fontSize: '1rem', fontWeight: 600, letterSpacing: '0.5px' }}
          >
            Start Masked Recall Session ({selectedTestDeckIds.length} Decks Selected)
          </button>
        </div>
      </div>
    </main>
  );
}
