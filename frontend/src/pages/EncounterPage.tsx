import { useState } from 'react';
import type { DeckItem, ParseSentenceResponse, TokenItem, DictLookupResponse, NavigationPage } from '../types/app';
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
  isDemoMode?: boolean;
  onNavigate: (page: NavigationPage) => void;
  onParseSentence: (textToParse?: string) => void;
  onSelectToken: (token: TokenItem) => void;
  onSaveCard: () => void;
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
  isDemoMode,
  onNavigate,
  onParseSentence,
  onSelectToken,
  onSaveCard,
}: EncounterPageProps) {
  const [showOnlySelectable, setShowOnlySelectable] = useState<boolean>(false);
  const [showPOS, setShowPOS] = useState<boolean>(false);

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
            <button className="open-btn" onClick={() => onParseSentence()} disabled={parsing}>
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
              {displayedTokens.map((token, idx) => (
                <div
                  key={`${token.lemma}_${token.surface}_${idx}`}
                  className={`token-tag ${token.is_selectable ? 'selectable' : 'non-selectable'} ${
                    selectedToken?.lemma === token.lemma ? 'active' : ''
                  }`}
                  onClick={() => onSelectToken(token)}
                >
                  <span className="token-surface jp-font">{token.surface}</span>
                  {showPOS && <span className="token-pos">{token.pos}</span>}
                </div>
              ))}
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
              <button className="btn-primary" onClick={onSaveCard} disabled={enriching}>
                Confirm & Save to Deck
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
