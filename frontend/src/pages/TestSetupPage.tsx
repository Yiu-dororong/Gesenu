import type { Dispatch, SetStateAction } from 'react';
import type { DeckItem, NavigationPage } from '../types/app';

interface TestSetupPageProps {
  decks: DeckItem[];
  selectedTestDeckIds: string[];
  setSelectedTestDeckIds: Dispatch<SetStateAction<string[]>>;
  deckStats: Record<string, { total: number; due: number }>;
  isStrictTest: boolean;
  setIsStrictTest: (val: boolean) => void;
  onNavigate: (page: NavigationPage) => void;
  onLaunchTestSession: () => void;
}

export function TestSetupPage({
  decks,
  selectedTestDeckIds,
  setSelectedTestDeckIds,
  deckStats,
  isStrictTest,
  setIsStrictTest,
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

        {/* Strict Test Mode Toggle Option */}
        <div
          className="strict-test-toggle-box"
          style={{
            marginTop: '1.5rem',
            padding: '1rem 1.25rem',
            background: 'var(--ink-surface)',
            borderRadius: '12px',
            border: isStrictTest ? '1px solid var(--gold)' : '1px solid rgba(242, 233, 218, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onClick={() => setIsStrictTest(!isStrictTest)}
        >
          <div>
            <div style={{ fontWeight: 600, color: 'var(--ivory)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🔒 Strict Test Mode
              <span
                style={{
                  fontSize: '0.725rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  background: isStrictTest ? 'var(--gold)' : 'rgba(255, 255, 255, 0.1)',
                  color: isStrictTest ? '#000' : 'var(--ivory-dim)',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                }}
              >
                {isStrictTest ? '1 QUESTION / SENTENCE' : 'ALL TARGET WORDS'}
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--ivory-dim)', marginTop: '0.3rem', margin: 0 }}>
              {isStrictTest
                ? 'Strict Mode: Generates at most 1 question per context sentence. Completely eliminates sentence pattern matching.'
                : 'Standard Mode: Tests all target words in selected decks (interleaved to prevent back-to-back duplicate sentences).'}
            </p>
          </div>
          <input
            type="checkbox"
            checked={isStrictTest}
            onChange={(e) => {
              e.stopPropagation();
              setIsStrictTest(e.target.checked);
            }}
            style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--gold)' }}
          />
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn-primary"
            onClick={onLaunchTestSession}
            disabled={selectedTestDeckIds.length === 0}
            style={{ width: '100%', height: '40px', fontSize: '1rem', fontWeight: 600, letterSpacing: '0.5px' }}
          >
            Start Masked Recall Session ({selectedTestDeckIds.length} Decks Selected)
          </button>
        </div>
      </div>
    </main>
  );
}
