import { useState } from 'react';
import type { DeckItem, ParseSentenceResponse, TokenItem, DictLookupResponse, NavigationPage, WordCard } from '../types/app';
import { SAMPLE_SENTENCES } from '../constants/decks';

interface EncounterPageProps {
  sentenceInput: string;
  setSentenceInput: (val: string) => void;
  parsing: boolean;
  parseResult: ParseSentenceResponse | null;
  selectedToken: TokenItem | null;
  enriching: boolean;
  dictInfo: DictLookupResponse | null;
  saveTargetDeckId: string;
  setSaveTargetDeckId: (id: string) => void;
  decks: DeckItem[];
  words: WordCard[];
  isDemoMode?: boolean;
  onNavigate: (page: NavigationPage) => void;
  onParseSentence: (textToParse?: string) => void;
  onSelectToken: (token: TokenItem) => void;
  onSaveCard: (appendContext?: boolean) => void;
}

function countWords(text: string): number {
  if (!text || !text.trim()) return 0;
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    try {
      const segmenter = new Intl.Segmenter('ja', { granularity: 'word' });
      const segments = Array.from(segmenter.segment(text));
      return segments.filter((s) => s.isWordLike).length;
    } catch {
      // fallback below
    }
  }
  // Fallback: Japanese/CJK tokens + whitespace-separated words
  const cjkTokens = (text.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]+/g) || []).length;
  const nonCjkWords = text.replace(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return cjkTokens + nonCjkWords;
}

export function EncounterPage({
  sentenceInput,
  setSentenceInput,
  parsing,
  parseResult,
  selectedToken,
  enriching,
  dictInfo,
  saveTargetDeckId,
  setSaveTargetDeckId,
  decks,
  words,
  isDemoMode,
  onNavigate,
  onParseSentence,
  onSelectToken,
  onSaveCard,
}: EncounterPageProps) {
  const [showOnlySelectable, setShowOnlySelectable] = useState<boolean>(false);
  const [showPOS, setShowPOS] = useState<boolean>(false);
  const [appendContext, setAppendContext] = useState<boolean>(true);

  const wordCount = countWords(sentenceInput);
  const isOverLimit = wordCount > 200;

  const existingCard = selectedToken
    ? words.find(
        (w) =>
          w.lemma === (dictInfo?.lemma || selectedToken.lemma) ||
          w.surface_form === selectedToken.surface
      )
    : null;

  const displayedTokens = parseResult
    ? showOnlySelectable
      ? parseResult.tokens.filter((t) => t.is_selectable)
      : parseResult.tokens
    : [];

  return (
    <main className="container">
      <div className="deck-nav-bar">
        <button className="back-btn" onClick={() => onNavigate('overview')}>
          ‹ Hub Overview
        </button>
        <h2>Encounter & Morphological Parsing</h2>
      </div>

      <section className="parse-section">
        <p className="section-desc">
          Paste Japanese text. SudachiPy extracts lemmas and Jisho fetches definitions.
        </p>

        <div className="sentence-input-area">
          <textarea
            className={`sentence-textarea jp-font ${isDemoMode ? 'demo-locked' : ''}`}
            placeholder={
              isDemoMode
                ? 'Demo Session: Textarea locked. Select preset sentences below...'
                : 'Type or paste a Japanese sentence...'
            }
            value={sentenceInput}
            readOnly={isDemoMode}
            onChange={(e) => !isDemoMode && setSentenceInput(e.target.value)}
          />

          <div className="input-meta-bar">
            <span
              className={`word-counter ${isOverLimit ? 'limit-exceeded' : ''}`}
              title="Maximum 200 words per sentence"
            >
              {wordCount} / 200 words
            </span>
          </div>

          {isOverLimit && (
            <div className="input-limit-warning">
              ⚠️ Input exceeds the 200-word limit ({wordCount} / 200 words). Please shorten the text to parse.
            </div>
          )}

          {isDemoMode && (
            <div className="demo-locked-notice">
              🔒 <strong>Demo Session:</strong> Custom sentence input is locked. Select preset sentences (<strong>1</strong>, <strong>2</strong>, <strong>3</strong>) below to test parsing.
            </div>
          )}

          <div className="preset-pills">
            <span style={{ fontSize: '0.8rem', color: 'var(--ivory-dim)' }}>Presets:</span>
            {SAMPLE_SENTENCES.map((preset, index) => (
              <button
                key={preset}
                className="preset-btn jp-font"
                onClick={() => {
                  setSentenceInput(preset);
                  onParseSentence(preset);
                }}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            <button
              className="open-btn"
              onClick={() => onParseSentence()}
              disabled={parsing || isOverLimit || !sentenceInput.trim()}
            >
              {parsing ? 'Parsing with SudachiPy...' : 'Parse Sentence'}
            </button>
          </div>
        </div>

        {/* Candidate Tags */}
        {parseResult && (
          <div>
            <div className="parse-results-header">
              <h4 className="parse-results-title">
                Parsed Candidate Tokens ({displayedTokens.length}):
              </h4>

              <div className="parse-toggle-controls">
                <button
                  type="button"
                  className={`toggle-filter-btn ${showOnlySelectable ? 'active' : ''}`}
                  onClick={() => setShowOnlySelectable((prev) => !prev)}
                >
                  {showOnlySelectable ? '✨ Filter: Selectable Only' : '🌐 Filter: All Tokens'}
                </button>

                <button
                  type="button"
                  className={`toggle-filter-btn ${showPOS ? 'active' : ''}`}
                  onClick={() => setShowPOS((prev) => !prev)}
                >
                  {showPOS ? '🏷️ POS: Shown' : '🏷️ POS: Hidden'}
                </button>
              </div>
            </div>

            <div className="token-strip">
              {displayedTokens.map((token, idx) => {
                const isAlreadySaved = words.some(
                  (w) => w.lemma === token.lemma || w.surface_form === token.surface
                );
                return (
                  <div
                    key={`${token.lemma}_${token.surface}_${idx}`}
                    className={`token-tag ${token.is_selectable ? 'selectable' : 'non-selectable'} ${
                      selectedToken?.lemma === token.lemma ? 'active' : ''
                    } ${isAlreadySaved ? 'already-saved' : ''}`}
                    onClick={() => onSelectToken(token)}
                    title={isAlreadySaved ? `Already in your deck: ${token.lemma}` : undefined}
                  >
                    <span className="token-surface jp-font">{token.surface}</span>
                    {showPOS && <span className="token-pos">{token.pos}</span>}
                    {isAlreadySaved && <span className="token-saved-dot" title="Saved card">✓ saved</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Jisho Enrichment & Deck Picker at Save Step */}
        {selectedToken && (
          <div className="enrichment-card">
            <div className="preview-top">
              <div>
                <div className="preview-reading jp-font">
                  {enriching ? 'Loading definition...' : dictInfo?.reading || selectedToken.reading}
                </div>
                <div className="preview-lemma jp-font">{dictInfo?.lemma || selectedToken.lemma}</div>
              </div>
              {dictInfo?.jlpt_level && <span className="jlpt-badge">{dictInfo.jlpt_level}</span>}
            </div>

            <p className="preview-meaning">
              {enriching ? 'Fetching definition...' : dictInfo?.meaning}
            </p>

            <div className="context-box jp-font">
              "{parseResult?.sentence}"
            </div>

            {/* Duplicate Notice & Context Append Banner */}
            {existingCard && (
              <div className="duplicate-alert-banner">
                <div className="duplicate-header-row">
                  <div className="duplicate-headline">
                    <span>⚠️</span>
                    <span>Already in Vocabulary Collection</span>
                  </div>
                  <div className="duplicate-pills">
                    <span className={`badge-status status-${existingCard.status}`}>{existingCard.status}</span>
                    <span className="deck-location-pill">Deck: {existingCard.deck_id || 'unclassified'}</span>
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--ivory-dim)' }}>
                  You previously saved <strong>{existingCard.lemma}</strong>. Saving will update this card without using a new quota slot.
                </div>

                {existingCard.context_sentence && (
                  <div className="existing-context-preview jp-font">
                    <span style={{ color: 'var(--gold)', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
                      Previous Sentence:
                    </span>
                    "{existingCard.context_sentence}"
                  </div>
                )}

                <label className="append-toggle-row">
                  <input
                    type="checkbox"
                    checked={appendContext}
                    onChange={(e) => setAppendContext(e.target.checked)}
                  />
                  <span>Append new sentence to existing context (preserves Leitner SRS progress)</span>
                </label>
              </div>
            )}

            {/* Deck Picker at Save Step */}
            <div className="save-deck-picker-step">
              <label className="picker-label">Target Deck for Save:</label>
              <div className="deck-chips-picker">
                <button
                  type="button"
                  className={`chip-btn ${saveTargetDeckId === 'skip' ? 'selected' : ''}`}
                  onClick={() => setSaveTargetDeckId('skip')}
                >
                  Skip (Unclassified Deck)
                </button>
                {decks.map((d) => (
                  <button
                    type="button"
                    key={d.id}
                    className={`chip-btn ${saveTargetDeckId === d.id ? 'selected' : ''}`}
                    onClick={() => setSaveTargetDeckId(d.id)}
                  >
                    <span className="chip-dot" style={{ background: d.color }}></span>
                    {d.jp} · {d.en}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                className="btn-primary"
                onClick={() => onSaveCard(appendContext)}
                disabled={enriching}
              >
                {existingCard
                  ? appendContext
                    ? 'Update & Append Context Sentence'
                    : 'Update Card Definition'
                  : 'Confirm & Save to Deck'}
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
