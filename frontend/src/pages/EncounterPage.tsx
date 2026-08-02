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
  onNavigate,
  onParseSentence,
  onSelectToken,
  onSaveCard,
}: EncounterPageProps) {
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
            className="sentence-textarea jp-font"
            placeholder="Type or paste a Japanese sentence..."
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
                  onParseSentence(preset);
                }}
              >
                "{preset.slice(0, 14)}..."
              </button>
            ))}
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            <button className="btn-primary" onClick={() => onParseSentence()} disabled={parsing}>
              {parsing ? 'Parsing with SudachiPy...' : 'Parse Sentence'}
            </button>
          </div>
        </div>

        {/* Candidate Tags */}
        {parseResult && (
          <div>
            <h4 style={{ color: 'var(--ivory)', fontSize: '0.95rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
              Parsed Candidate Tokens:
            </h4>
            <div className="token-strip">
              {parseResult.tokens.map((token, idx) => (
                <div
                  key={idx}
                  className={`token-tag ${token.is_selectable ? 'selectable' : 'non-selectable'} ${
                    selectedToken?.lemma === token.lemma ? 'active' : ''
                  }`}
                  onClick={() => onSelectToken(token)}
                >
                  <span className="token-surface jp-font">{token.surface}</span>
                  <span className="token-pos">{token.pos}</span>
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
