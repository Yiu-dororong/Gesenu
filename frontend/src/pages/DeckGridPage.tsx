import type { DeckItem, WordCard, NavigationPage } from '../types/app';

interface DeckGridPageProps {
  selectedDeckId: string;
  decks: DeckItem[];
  words: WordCard[];
  cardDeckMapping: Record<string, string>;
  deckFilterStatus: string;
  setDeckFilterStatus: (val: string) => void;
  onNavigate: (page: NavigationPage) => void;
  onStartStudySession: (deckId: string) => void;
  onAdvanceFSM: (lemma: string) => void;
}

export function DeckGridPage({
  selectedDeckId,
  decks,
  words,
  cardDeckMapping,
  deckFilterStatus,
  setDeckFilterStatus,
  onNavigate,
  onStartStudySession,
  onAdvanceFSM,
}: DeckGridPageProps) {
  const currentDeck = decks.find((d) => d.id === selectedDeckId) || {
    id: selectedDeckId,
    jp: selectedDeckId === 'unclassified' ? '未分類' : selectedDeckId,
    en: selectedDeckId === 'unclassified' ? 'Unclassified' : selectedDeckId,
    color: 'var(--gold)',
  };

  const filteredWords = words.filter((w) => {
    const dId = cardDeckMapping[w.lemma] || 'matsu';
    const matchesDeck = dId === selectedDeckId || selectedDeckId === 'unclassified';
    const matchesStatus = deckFilterStatus === 'all' || w.status === deckFilterStatus;
    return matchesDeck && matchesStatus;
  });

  return (
    <main className="container">
      <div className="deck-nav-bar">
        <button className="back-btn" onClick={() => onNavigate('study_arc')}>
          ‹ Back to Arc
        </button>

        <div className="deck-title-badge">
          <span className="deck-pill-dot" style={{ background: currentDeck.color }}></span>
          <h2>
            {currentDeck.jp} · {currentDeck.en}
          </h2>
        </div>

        <button className="btn-primary" onClick={() => onStartStudySession(selectedDeckId)}>
          Launch Flashcard Session
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <span style={{ fontSize: '0.85rem', color: 'var(--ivory-dim)' }}>Filter by Status:</span>
        {['all', 'New', 'Learning', 'Known', 'Mastered'].map((st) => (
          <button
            key={st}
            className={`filter-chip ${deckFilterStatus === st ? 'active' : ''}`}
            onClick={() => setDeckFilterStatus(st)}
          >
            {st.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="cards-grid">
        {filteredWords.map((card, idx) => (
          <div key={idx} className="word-card">
            <div className="card-top">
              <div>
                <span className="jp-font" style={{ fontSize: '0.85rem', color: 'var(--gold)' }}>
                  {card.reading}
                </span>
                <h4 className="jp-font" style={{ fontSize: '1.8rem', color: 'var(--ivory)' }}>
                  {card.lemma}
                </h4>
              </div>
              {card.jlpt_level && <span className="jlpt-badge">{card.jlpt_level}</span>}
            </div>

            <p style={{ color: 'var(--ivory-dim)', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
              {card.meaning}
            </p>

            <div className="context-box jp-font" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
              "{card.context_sentence}"
            </div>

            <div className="card-footer">
              <span style={{ fontSize: '0.75rem', color: 'var(--ivory-dim)' }}>FSM Status</span>
              <span
                className={`badge-status status-${card.status}`}
                onClick={() => onAdvanceFSM(card.lemma)}
              >
                {card.status} ➔
              </span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
