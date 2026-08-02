import React, { useEffect, useState, useCallback } from 'react';
import type { components } from './types/api';

type TokenItem = components['schemas']['TokenItem'];
type ParseSentenceResponse = components['schemas']['ParseSentenceResponse'];
type DictLookupResponse = components['schemas']['DictLookupResponse'];
type WordCard = components['schemas']['WordCard'];
type WordCardResponse = components['schemas']['WordCardResponse'];
type HealthCheckStatus = components['schemas']['HealthCheckStatus'];

const API_BASE = 'http://127.0.0.1:8000';

const NEXT_STATUS: Record<string, string> = {
  New: 'Learning',
  Learning: 'Known',
  Known: 'Mastered',
  Mastered: 'New',
};

const SAMPLE_SENTENCES = [
  '複雑な文法構造を分解すれば、どんな難文でも解せるようになる。',
  'なぜ彼が急に辞職したのか、理由がどうしても解せぬ。',
  '単語を単体で覚えるのではなく、文脈の中で記憶することが大切だ。',
];

interface DeckItem {
  id: string;
  jp: string;
  en: string;
  color: string;
  isStub: boolean;
  stubCount: number;
  stubDue: number;
  motifSvg: React.ReactNode;
}

const DECKS: DeckItem[] = [
  {
    id: 'matsu',
    jp: '松',
    en: 'Everyday Basics',
    color: 'var(--pine)',
    isStub: true,
    stubCount: 84,
    stubDue: 6,
    motifSvg: (
      <svg className="motif" viewBox="0 0 40 40" fill="none">
        <path
          d="M20 4 L24 16 L34 14 L26 22 L32 30 L22 26 L20 36 L18 26 L8 30 L14 22 L6 14 L16 16 Z"
          fill="#F2E9DA"
          opacity="0.85"
        />
      </svg>
    ),
  },
  {
    id: 'sakura',
    jp: '桜',
    en: 'First Encounters',
    color: 'var(--sakura)',
    isStub: true,
    stubCount: 32,
    stubDue: 12,
    motifSvg: (
      <svg className="motif" viewBox="0 0 40 40" fill="none">
        <g fill="#F2E9DA" opacity="0.9">
          <circle cx="20" cy="10" r="6" />
          <circle cx="30" cy="17" r="6" />
          <circle cx="26" cy="29" r="6" />
          <circle cx="14" cy="29" r="6" />
          <circle cx="10" cy="17" r="6" />
        </g>
        <circle cx="20" cy="20" r="4" fill="var(--sakura)" />
      </svg>
    ),
  },
  {
    id: 'tsuki',
    jp: '月',
    en: 'Night Reading',
    color: 'var(--moon)',
    isStub: true,
    stubCount: 51,
    stubDue: 0,
    motifSvg: (
      <svg className="motif" viewBox="0 0 40 40" fill="none">
        <path
          d="M24 6 A15 15 0 1 0 24 34 A11.5 11.5 0 0 1 24 6 Z"
          fill="#F2E9DA"
          opacity="0.9"
        />
      </svg>
    ),
  },
  {
    id: 'kaede',
    jp: '楓',
    en: 'Testing Data',
    color: 'var(--maple)',
    isStub: false,
    stubCount: 0,
    stubDue: 0,
    motifSvg: (
      <svg className="motif" viewBox="0 0 40 40" fill="none">
        <path
          d="M20 2 L23 14 L33 6 L27 17 L38 19 L27 22 L33 33 L23 26 L20 38 L17 26 L7 33 L13 22 L2 19 L13 17 L7 6 L17 14 Z"
          fill="#F2E9DA"
          opacity="0.85"
        />
      </svg>
    ),
  },
  {
    id: 'ume',
    jp: '梅',
    en: 'Kitchen & Home',
    color: 'var(--plum)',
    isStub: true,
    stubCount: 45,
    stubDue: 3,
    motifSvg: (
      <svg className="motif" viewBox="0 0 40 40" fill="none">
        <g fill="#F2E9DA" opacity="0.9">
          <ellipse cx="20" cy="11" rx="6" ry="7" />
          <ellipse cx="30" cy="20" rx="7" ry="6" />
          <ellipse cx="24" cy="30" rx="6" ry="7" />
          <ellipse cx="12" cy="28" rx="6" ry="7" />
          <ellipse cx="8" cy="16" rx="7" ry="6" />
        </g>
        <circle cx="20" cy="20" r="3" fill="var(--plum)" />
      </svg>
    ),
  },
  {
    id: 'nami',
    jp: '波',
    en: 'Slang & Flow',
    color: 'var(--wave)',
    isStub: true,
    stubCount: 27,
    stubDue: 9,
    motifSvg: (
      <svg className="motif" viewBox="0 0 40 40" fill="none">
        <path
          d="M2 16 Q8 10 14 16 T26 16 T38 16"
          stroke="#F2E9DA"
          strokeWidth="3"
          fill="none"
          opacity="0.85"
          strokeLinecap="round"
        />
        <path
          d="M2 26 Q8 20 14 26 T26 26 T38 26"
          stroke="#F2E9DA"
          strokeWidth="3"
          fill="none"
          opacity="0.55"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export const App: React.FC = () => {
  // Navigation & View States
  const [view, setView] = useState<'arc' | 'deck_detail'>('arc');
  const [activeIndex, setActiveIndex] = useState<number>(3); // Default centered on Testing Data deck (楓)
  const [isEntranceDone, setIsEntranceDone] = useState<boolean>(false);
  const [isOpening, setIsOpening] = useState<boolean>(false);
  const [openingIndex, setOpeningIndex] = useState<number | null>(null);

  // Window width state for responsive arc spacing
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fluid card width and arc step calculation matching CSS clamp
  const cardWidth = Math.min(Math.max(126, windowWidth * 0.11 + 40), 230);
  const stepX = cardWidth * 0.58;

  // Main Data States
  const [words, setWords] = useState<WordCard[]>([]);
  const [health, setHealth] = useState<HealthCheckStatus | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Encounter & Sentence Parsing States
  const [sentenceInput, setSentenceInput] = useState<string>(SAMPLE_SENTENCES[0]);
  const [parsing, setParsing] = useState<boolean>(false);
  const [parseResult, setParseResult] = useState<ParseSentenceResponse | null>(null);
  const [selectedToken, setSelectedToken] = useState<TokenItem | null>(null);

  // Jisho Dictionary Enrichment Preview State
  const [enriching, setEnriching] = useState<boolean>(false);
  const [dictInfo, setDictInfo] = useState<DictLookupResponse | null>(null);

  // Developer Test Tool States
  const [showDevTool, setShowDevTool] = useState<boolean>(false);
  const [lemma, setLemma] = useState('');
  const [reading, setReading] = useState('');
  const [meaning, setMeaning] = useState('');
  const [jlpt, setJlpt] = useState('N3');
  const [contextSentence, setContextSentence] = useState('');

  // 1. Initial Load: Check API Health & Fetch Saved Deck
  const fetchHealthAndWords = async () => {
    setLoading(true);
    try {
      const healthRes = await fetch(`${API_BASE}/api/health`);
      if (healthRes.ok) {
        const healthData: HealthCheckStatus = await healthRes.json();
        setHealth(healthData);
      }

      const wordsRes = await fetch(`${API_BASE}/api/test-words`);
      if (wordsRes.ok) {
        const data: WordCardResponse = await wordsRes.json();
        setWords(data.words);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthAndWords();
  }, []);

  // Entrance animation trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsEntranceDone(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard navigation for Arc Carousel
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (view !== 'arc') return;
      if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => Math.min(DECKS.length - 1, prev + 1));
      }
    },
    [view]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // 2. Parse Sentence via SudachiPy Backend Engine
  const handleParseSentence = async (textToParse?: string) => {
    const targetSentence = textToParse || sentenceInput;
    if (!targetSentence || !targetSentence.trim()) {
      return;
    }

    setParsing(true);
    setSelectedToken(null);
    setDictInfo(null);

    try {
      const res = await fetch(`${API_BASE}/api/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentence: targetSentence }),
      });
      if (res.ok) {
        const data: ParseSentenceResponse = await res.json();
        setParseResult(data);
        setNotification(`✓ Parsed "${data.sentence.slice(0, 18)}..." with SudachiPy! Click candidate tags below.`);
      }
    } catch (err) {
      console.error('Sentence parsing failed:', err);
      setNotification('❌ Failed to parse sentence with backend Sudachi engine.');
    } finally {
      setParsing(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // 3. Handle Token Selection -> Query Jisho API Dictionary Lookup
  const handleSelectToken = async (token: TokenItem) => {
    if (!token.is_selectable) return;

    setSelectedToken(token);
    setEnriching(true);
    setDictInfo(null);

    try {
      const keyword = encodeURIComponent(token.lemma);
      const res = await fetch(`${API_BASE}/api/dict/lookup?keyword=${keyword}`);
      if (res.ok) {
        const info: DictLookupResponse = await res.json();
        setDictInfo(info);
      }
    } catch (err) {
      console.error('Jisho lookup failed:', err);
    } finally {
      setEnriching(false);
    }
  };

  // 4. Save Card to PostgreSQL Deck
  const handleSaveEnrichedCard = async () => {
    if (!selectedToken || !parseResult) return;

    const newCard: WordCard = {
      lemma: dictInfo?.lemma || selectedToken.lemma,
      reading: dictInfo?.reading || selectedToken.reading,
      meaning: dictInfo?.meaning || `Contextual word: ${selectedToken.surface}`,
      jlpt_level: dictInfo?.jlpt_level || 'N3',
      context_sentence: parseResult.sentence,
      status: 'New',
    };

    setWords((prev) => [newCard, ...prev]);
    setNotification(`⚡ Saved "${newCard.lemma}" profile to your Testing Data deck!`);

    try {
      const res = await fetch(`${API_BASE}/api/words`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCard),
      });
      if (res.ok) {
        const savedCard: WordCard = await res.json();
        setNotification(`🎉 Successfully saved "${savedCard.lemma}" into PostgreSQL!`);
      }
    } catch (err) {
      console.error('Failed to post word:', err);
    } finally {
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // 5. Advance FSM State Machine
  const advanceStatus = (index: number) => {
    const card = words[index];
    const currentStatus = card.status || 'New';
    const nextStatus = NEXT_STATUS[currentStatus] || 'New';

    const updatedWords = [...words];
    updatedWords[index] = { ...card, status: nextStatus };
    setWords(updatedWords);

    setNotification(`⚡ FSM Transition: "${card.lemma}" [${currentStatus}] ➔ [${nextStatus}]`);
    setTimeout(() => setNotification(null), 3000);
  };

  // 6. Developer Mode Manual Card POST
  const handleDevAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lemma || !meaning || !contextSentence) return;

    const newCard: WordCard = {
      lemma,
      reading: reading || lemma,
      meaning,
      jlpt_level: jlpt,
      context_sentence: contextSentence,
      status: 'New',
    };

    setWords((prev) => [newCard, ...prev]);

    try {
      await fetch(`${API_BASE}/api/words`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCard),
      });
      setNotification(`✓ Manual test card "${lemma}" added.`);
    } catch (err) {
      console.error('Dev POST failed:', err);
    }

    setLemma('');
    setReading('');
    setMeaning('');
    setContextSentence('');
  };

  // Helper for deck card counts & due items
  const getDeckStats = (deck: DeckItem) => {
    if (!deck.isStub) {
      const count = words.length;
      const due = words.filter((w) => w.status === 'New' || w.status === 'Learning').length;
      return { count, due };
    }
    return { count: deck.stubCount, due: deck.stubDue };
  };

  const activeDeck = DECKS[activeIndex];
  const activeStats = getDeckStats(activeDeck);

  const handleOpenDeck = (index?: number) => {
    if (isOpening) return;
    const targetIdx = index !== undefined ? index : activeIndex;
    setActiveIndex(targetIdx);
    setIsOpening(true);
    setOpeningIndex(targetIdx);

    setTimeout(() => {
      setView('deck_detail');
      setIsOpening(false);
      setOpeningIndex(null);
    }, 820);
  };

  return (
    <div className={`stage ${isOpening ? 'is-opening' : ''}`}>
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            background: 'rgba(21, 18, 27, 0.95)',
            border: '1px solid var(--gold)',
            color: 'var(--ivory)',
            padding: '10px 22px',
            borderRadius: '999px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6), 0 0 16px var(--gold-soft)',
            fontWeight: 600,
            fontSize: '0.875rem',
            animation: 'fadeIn 0.25s ease',
          }}
        >
          {notification}
        </div>
      )}

      {/* VIEW 1: DECK ARC CAROUSEL (HOME DECK BROWSER) */}
      {view === 'arc' && (
        <>
          <header className="deck-header">
            <p className="eyebrow">解せぬを、解せるへ。</p>
            <h1>Your Decks</h1>
            <p className="sub">Tap a card to bring it forward</p>
          </header>

          <div className="arc-wrap">
            <button
              className="nav-btn prev"
              aria-label="Previous deck"
              onClick={() => setActiveIndex((prev) => Math.max(0, prev - 1))}
            >
              ‹
            </button>

            <div className={`arc ${isOpening ? 'is-opening' : ''}`}>
              {DECKS.map((deck, i) => {
                const offset = i - activeIndex;
                const abs = Math.abs(offset);
                const angle = offset * 11;
                const tx = offset * stepX;
                const ty = abs * abs * 5;
                const scale = Math.max(1 - abs * 0.09, 0.6);
                const z = 100 - abs;
                const visible = abs <= 3;
                const stats = getDeckStats(deck);
                const isThisOpening = isOpening && openingIndex === i;

                const finalTransform = `translateX(${tx}px) translateY(${ty}px) rotate(${angle}deg) scale(${scale})`;
                const initialTransform = `translateX(0px) translateY(120px) rotate(0deg) scale(0.4)`;

                return (
                  <div
                    key={deck.id}
                    className={`deck-card ${i === activeIndex ? 'active' : ''} ${isThisOpening ? 'opening' : ''}`}
                    tabIndex={0}
                    role="button"
                    aria-label={`${deck.en} deck, ${stats.count} cards, ${stats.due} due`}
                    style={{
                      zIndex: isThisOpening ? 999 : z,
                      opacity: visible ? 1 - abs * 0.16 : 0,
                      pointerEvents: visible ? 'auto' : 'none',
                      transform: isThisOpening ? undefined : isEntranceDone ? finalTransform : initialTransform,
                      transitionDelay: isEntranceDone ? '0ms' : `${i * 55}ms`,
                    }}
                    onClick={() => {
                      if (i === activeIndex) {
                        handleOpenDeck(i);
                      } else {
                        setActiveIndex(i);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (i === activeIndex) {
                          handleOpenDeck(i);
                        } else {
                          setActiveIndex(i);
                        }
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
                        <span className="count">{stats.count} cards</span>
                        <span className={`due ${stats.due === 0 ? 'zero' : ''}`}>
                          {stats.due === 0 ? 'up to date' : `${stats.due} due`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              className="nav-btn next"
              aria-label="Next deck"
              onClick={() => setActiveIndex((prev) => Math.min(DECKS.length - 1, prev + 1))}
            >
              ›
            </button>
          </div>

          <div className="detail">
            <p className="detail-name">
              {activeDeck.jp} · {activeDeck.en}
            </p>
            <p className="detail-meta">
              {activeStats.due === 0
                ? `${activeStats.count} cards · all caught up`
                : `${activeStats.count} cards · ${activeStats.due} due for review`}
            </p>
            <button className="open-btn" onClick={() => handleOpenDeck()} disabled={isOpening}>
              {isOpening ? 'Opening…' : activeDeck.isStub ? 'Open deck (Stub)' : 'Open deck'}
            </button>
          </div>
        </>
      )}

      {/* VIEW 2: INSIDE DECK VIEW (DECK CONTENT, PARSER, CARDS GRID) */}
      {view === 'deck_detail' && (
        <div className="container">
          <div className="deck-nav-bar">
            <button className="back-btn" onClick={() => setView('arc')}>
              ‹ Decks Arc
            </button>

            <div className="deck-title-badge">
              <span
                className="deck-pill-dot"
                style={{ background: activeDeck.color }}
              ></span>
              <h2>
                {activeDeck.jp} · {activeDeck.en}
              </h2>
            </div>

            {health && (
              <div className="status-pill">
                <span className="status-pulse"></span>
                <span>API v{health.version}</span>
                {health.supabase_connected && (
                  <span style={{ marginLeft: '4px' }}>| PostgreSQL</span>
                )}
              </div>
            )}
          </div>

          {/* STUB DECK NOTICE IF APPLICABLE */}
          {activeDeck.isStub && (
            <div
              style={{
                background: 'rgba(199, 154, 68, 0.1)',
                border: '1px dashed var(--gold)',
                borderRadius: '12px',
                padding: '1.25rem',
                marginBottom: '2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <strong style={{ color: 'var(--gold)' }}>
                  「{activeDeck.jp} · {activeDeck.en}」 is a Stub Deck
                </strong>
                <p style={{ fontSize: '0.875rem', color: 'var(--ivory-dim)', marginTop: '4px' }}>
                  This deck is a stub placeholder. Your active testing data and backend sentence parser are in 「楓 · Testing Data」.
                </p>
              </div>
              <button
                className="btn-primary"
                onClick={() => {
                  const kaedeIndex = DECKS.findIndex((d) => d.id === 'kaede');
                  if (kaedeIndex !== -1) setActiveIndex(kaedeIndex);
                }}
              >
                Switch to 楓 · Testing Data
              </button>
            </div>
          )}

          {/* SECTION 1: ENCOUNTER & SENTENCE PARSING */}
          <section className="parse-section">
            <h3 className="section-title">
              <span>🔍 1. Encounter & Sentence Parsing</span>
            </h3>
            <p className="section-desc">
              Paste a Japanese sentence from news, manga, or books. SudachiPy will decompose it into candidate words, and Jisho API will fetch definitions automatically.
            </p>

            <div className="sentence-input-area">
              <textarea
                className="sentence-textarea jp-font"
                placeholder="Type or paste a Japanese sentence (e.g. 複雑な文法構造を分解すれば、どんな難文でも解せるようになる。)..."
                value={sentenceInput}
                onChange={(e) => setSentenceInput(e.target.value)}
              />

              <div className="preset-pills">
                <span style={{ fontSize: '0.8rem', color: 'var(--ivory-dim)' }}>Presets:</span>
                {SAMPLE_SENTENCES.map((preset, idx) => (
                  <button
                    key={idx}
                    className="preset-btn jp-font"
                    onClick={() => {
                      setSentenceInput(preset);
                      handleParseSentence(preset);
                    }}
                  >
                    "{preset.slice(0, 14)}..."
                  </button>
                ))}
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                <button
                  className="btn-primary"
                  onClick={() => handleParseSentence()}
                  disabled={parsing}
                >
                  {parsing ? 'Parsing with SudachiPy...' : '⚡ Parse Sentence with SudachiPy'}
                </button>
              </div>
            </div>

            {/* Sudachi Tokenized Tags Strip */}
            {parseResult && (
              <div>
                <h4 style={{ color: 'var(--ivory)', fontSize: '0.95rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                  Sudachi Tokens ({parseResult.candidate_count} Vocabulary Candidates):
                </h4>
                <div className="token-strip">
                  {parseResult.tokens.map((token, idx) => (
                    <div
                      key={idx}
                      className={`token-tag ${token.is_selectable ? 'selectable' : 'non-selectable'} ${
                        selectedToken?.lemma === token.lemma ? 'active' : ''
                      }`}
                      onClick={() => handleSelectToken(token)}
                      title={token.is_selectable ? `Click to lookup ${token.lemma} on Jisho` : token.pos_detail}
                    >
                      <span className="token-surface jp-font">{token.surface}</span>
                      <span className="token-pos">{token.pos}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Jisho Dictionary Enrichment Card Preview */}
            {selectedToken && (
              <div className="enrichment-card">
                <div className="preview-top">
                  <div>
                    <div className="preview-reading jp-font">
                      {enriching ? 'Searching Jisho API...' : dictInfo?.reading || selectedToken.reading}
                    </div>
                    <div className="preview-lemma jp-font">{dictInfo?.lemma || selectedToken.lemma}</div>
                  </div>
                  {dictInfo?.jlpt_level && <span className="jlpt-badge">{dictInfo.jlpt_level}</span>}
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--ivory-dim)', marginBottom: '0.2rem' }}>
                    Jisho English Definition
                  </div>
                  <p className="preview-meaning">
                    {enriching ? 'Loading definition from Jisho.org...' : dictInfo?.meaning}
                  </p>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--ivory-dim)', marginBottom: '0.3rem' }}>
                    Bound Context Sentence
                  </div>
                  <div className="context-box jp-font">
                    "{parseResult?.sentence}"
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn-primary" onClick={handleSaveEnrichedCard} disabled={enriching}>
                    ➕ Save Word Profile to Study Deck
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* SECTION 2: SAVED STUDY DECK GALLERY */}
          <h3 style={{ marginBottom: '1.25rem', color: 'var(--ivory)', fontWeight: 600 }} className="jp-font">
            📚 Study Deck — Saved Cards ({words.length})
          </h3>

          {loading ? (
            <div style={{ color: 'var(--ivory-dim)', padding: '2rem', textAlign: 'center' }}>
              Loading study deck cards...
            </div>
          ) : words.length === 0 ? (
            <div
              style={{
                background: 'rgba(29, 24, 38, 0.6)',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                padding: '2.5rem',
                textAlign: 'center',
                color: 'var(--ivory-dim)',
                marginBottom: '2.5rem',
              }}
            >
              No saved cards yet. Parse a sentence above and save candidate words!
            </div>
          ) : (
            <div className="cards-grid">
              {words.map((card, idx) => (
                <div key={card.id || idx} className="word-card">
                  <div>
                    <div className="card-top">
                      <div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--gold)' }} className="jp-font">
                          {card.reading}
                        </span>
                        <h4 style={{ fontSize: '1.8rem', color: 'var(--ivory)', marginTop: '2px' }} className="jp-font">
                          {card.lemma}
                        </h4>
                      </div>
                      {card.jlpt_level && <span className="jlpt-badge">{card.jlpt_level}</span>}
                    </div>

                    <p style={{ color: 'var(--ivory-dim)', fontSize: '0.95rem', marginBottom: '1rem', lineHeight: 1.4 }}>
                      {card.meaning}
                    </p>

                    <div className="context-box jp-font" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                      "{card.context_sentence}"
                    </div>
                  </div>

                  <div className="card-footer">
                    <span style={{ fontSize: '0.75rem', color: 'var(--ivory-dim)' }}>FSM Status</span>
                    <span
                      className={`badge-status status-${card.status}`}
                      onClick={() => advanceStatus(idx)}
                      title="Click to advance status transition"
                    >
                      {card.status} ➔
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SECTION 3: COLLAPSIBLE DEVELOPER TEST TOOL */}
          <div className="dev-accordion">
            <div className="dev-header" onClick={() => setShowDevTool(!showDevTool)}>
              <div>
                <strong style={{ color: 'var(--ivory)', fontSize: '0.9rem' }}>
                  🛠️ Developer Testing Tool (Manual Card POST)
                </strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--ivory-dim)', marginLeft: '8px' }}>
                  (Used for manual test mocks)
                </span>
              </div>
              <button
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--gold)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                {showDevTool ? 'Collapse ▲' : 'Expand ▼'}
              </button>
            </div>

            {showDevTool && (
              <form onSubmit={handleDevAddCard} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '0.75rem',
                  }}
                >
                  <input
                    type="text"
                    placeholder="Target Lemma (e.g. 納得)"
                    value={lemma}
                    onChange={(e) => setLemma(e.target.value)}
                    required
                    style={{
                      background: '#0f0d14',
                      border: '1px solid var(--border-color)',
                      color: 'var(--ivory)',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Reading (e.g. なっとく)"
                    value={reading}
                    onChange={(e) => setReading(e.target.value)}
                    style={{
                      background: '#0f0d14',
                      border: '1px solid var(--border-color)',
                      color: 'var(--ivory)',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="English Meaning"
                    value={meaning}
                    onChange={(e) => setMeaning(e.target.value)}
                    required
                    style={{
                      background: '#0f0d14',
                      border: '1px solid var(--border-color)',
                      color: 'var(--ivory)',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                    }}
                  />
                  <select
                    value={jlpt}
                    onChange={(e) => setJlpt(e.target.value)}
                    style={{
                      background: '#0f0d14',
                      border: '1px solid var(--border-color)',
                      color: 'var(--ivory)',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                    }}
                  >
                    <option value="N5">JLPT N5</option>
                    <option value="N4">JLPT N4</option>
                    <option value="N3">JLPT N3</option>
                    <option value="N2">JLPT N2</option>
                    <option value="N1">JLPT N1</option>
                  </select>
                </div>
                <input
                  type="text"
                  placeholder="Context Sentence"
                  value={contextSentence}
                  onChange={(e) => setContextSentence(e.target.value)}
                  required
                  style={{
                    background: '#0f0d14',
                    border: '1px solid var(--border-color)',
                    color: 'var(--ivory)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                  }}
                />
                <button type="submit" className="btn-primary" style={{ justifySelf: 'start' }}>
                  ➕ Submit Test Card
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
