import { useState, useEffect, useCallback, type Dispatch, type SetStateAction } from 'react';
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
  const [openingDeckId, setOpeningDeckId] = useState<string | null>(null);

  const triggerPopAndFlip = useCallback((deckId: string, action: () => void) => {
    if (openingDeckId) return;
    setOpeningDeckId(deckId);
    setTimeout(() => {
      action();
      setOpeningDeckId(null);
    }, 850);
  }, [openingDeckId]);

  // Keyboard navigation logic: ArrowLeft/Right = prev/next, Space = View Grid, Enter = Start Review
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (openingDeckId) return;

      const activeDeck = decks[activeIndex];

      if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(0, prev - 1));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setActiveIndex((prev) => Math.min(decks.length - 1, prev + 1));
      } else if (e.code === 'Space') {
        e.preventDefault();
        if (activeDeck) {
          triggerPopAndFlip(activeDeck.id, () => {
            setSelectedDeckId(activeDeck.id);
            onNavigate('study_deck');
          });
        }
      } else if (e.code === 'Enter') {
        e.preventDefault();
        if (activeDeck) {
          onStartStudySession(activeDeck.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, decks, openingDeckId, triggerPopAndFlip, setActiveIndex, setSelectedDeckId, onNavigate, onStartStudySession]);

  return (
    <main className="arc-screen">
      <header className="deck-header">
        <p className="eyebrow"></p>
        <h1>Study Decks</h1>
        <p className="sub">
          Use <kbd>←</kbd> <kbd>→</kbd> to select deck • <kbd>Space</kbd> View Grid • <kbd>Enter</kbd> Start Review
        </p>
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
            const isOpening = openingDeckId === deck.id;

            const finalTransform = `translateX(${tx}px) translateY(${ty}px) rotate(${angle}deg) scale(${scale})`;

            return (
              <div
                key={deck.id}
                className={`deck-card ${i === activeIndex ? 'active' : ''} ${isOpening ? 'opening' : ''}`}
                style={{
                  zIndex: isOpening ? 1000 : z,
                  opacity: visible ? 1 - abs * 0.16 : 0,
                  pointerEvents: visible && !openingDeckId ? 'auto' : 'none',
                  transform: isOpening ? undefined : finalTransform,
                }}
                onClick={() => {
                  if (i === activeIndex) {
                    triggerPopAndFlip(deck.id, () => {
                      setSelectedDeckId(deck.id);
                      onNavigate('study_deck');
                    });
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
                  triggerPopAndFlip(decks[activeIndex].id, () => {
                    setSelectedDeckId(decks[activeIndex].id);
                    onNavigate('study_deck');
                  });
                }}
              >
                View Deck Grid
              </button>
              <button
                className="open-btn"
                onClick={() => {
                  onStartStudySession(decks[activeIndex].id);
                }}
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
