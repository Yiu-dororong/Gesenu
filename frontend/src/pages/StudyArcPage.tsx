import type { Dispatch, SetStateAction } from 'react';
import type { DeckItem, NavigationPage } from '../types/app';

interface StudyArcPageProps {
  decks: DeckItem[];
  activeIndex: number;
  setActiveIndex: Dispatch<SetStateAction<number>>;
  stepX: number;
  deckStats: Record<string, { total: number; due: number }>;
  setSelectedDeckId: (id: string) => void;
  onNavigate: (page: NavigationPage) => void;
  onStartStudySession: (deckId: string) => void;
  onShowNewDeckModal: () => void;
}

export function StudyArcPage({
  decks,
  activeIndex,
  setActiveIndex,
  stepX,
  deckStats,
  setSelectedDeckId,
  onNavigate,
  onStartStudySession,
  onShowNewDeckModal,
}: StudyArcPageProps) {
  return (
    <main className="arc-screen">
      <header className="deck-header">
        <p className="eyebrow">「解せぬ」を、「解せる」へ。</p>
        <h1>Study Decks</h1>
        <p className="sub">Tap a card to bring it forward, or create a new deck</p>
      </header>

      <div className="arc-wrap">
        <button
          className="nav-btn prev"
          onClick={() => setActiveIndex((prev) => Math.max(0, prev - 1))}
        >
          ‹
        </button>

        <div className="arc">
          {decks.map((deck, i) => {
            const offset = i - activeIndex;
            const abs = Math.abs(offset);
            const angle = offset * 11;
            const tx = offset * stepX;
            const ty = abs * abs * 5;
            const scale = Math.max(1 - abs * 0.09, 0.6);
            const z = 100 - abs;
            const visible = abs <= 3;
            const stats = deckStats[deck.id] || { total: 0, due: 0 };

            const finalTransform = `translateX(${tx}px) translateY(${ty}px) rotate(${angle}deg) scale(${scale})`;

            return (
              <div
                key={deck.id}
                className={`deck-card ${i === activeIndex ? 'active' : ''}`}
                style={{
                  zIndex: z,
                  opacity: visible ? 1 - abs * 0.16 : 0,
                  pointerEvents: visible ? 'auto' : 'none',
                  transform: finalTransform,
                }}
                onClick={() => {
                  if (i === activeIndex) {
                    setSelectedDeckId(deck.id);
                    onNavigate('study_deck');
                  } else {
                    setActiveIndex(i);
                  }
                }}
              >
                <div className="deck-face" style={{ background: deck.color }}>
                  {deck.motifSvg}
                  <div className="deck-names">
                    <span className="deck-jp">{deck.jp}</span>
                    <span className="deck-en">{deck.en}</span>
                  </div>
                  <div className="deck-foot">
                    <span className="count">{stats.total} cards</span>
                    <span className={`due ${stats.due === 0 ? 'zero' : ''}`}>
                      {stats.due === 0 ? 'caught up' : `${stats.due} due`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          className="nav-btn next"
          onClick={() => setActiveIndex((prev) => Math.min(decks.length - 1, prev + 1))}
        >
          ›
        </button>
      </div>

      <div className="detail">
        {decks[activeIndex] && (
          <>
            <p className="detail-name">
              {decks[activeIndex].jp} · {decks[activeIndex].en}
            </p>
            <p className="detail-meta">
              {(deckStats[decks[activeIndex].id]?.due || 0) === 0
                ? `${deckStats[decks[activeIndex].id]?.total || 0} cards · up to date`
                : `${deckStats[decks[activeIndex].id]?.total || 0} cards · ${deckStats[decks[activeIndex].id]?.due} due for review`}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                className="open-btn"
                onClick={() => {
                  setSelectedDeckId(decks[activeIndex].id);
                  onNavigate('study_deck');
                }}
              >
                Inspect Deck Grid
              </button>
              <button
                className="btn-primary"
                onClick={() => onStartStudySession(decks[activeIndex].id)}
              >
                Start Review Session
              </button>
            </div>
          </>
        )}

        <div style={{ marginTop: '1.5rem' }}>
          <button className="add-deck-btn" onClick={onShowNewDeckModal}>
            Create New Deck
          </button>
        </div>
      </div>
    </main>
  );
}
