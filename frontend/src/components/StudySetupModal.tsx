import { useState, useMemo } from 'react';
import type { DeckItem, WordCard } from '../types/app';

interface StudySetupModalProps {
  show: boolean;
  initialDeckId: string;
  decks: DeckItem[];
  words: WordCard[];
  cardDeckMapping: Record<string, string>;
  onClose: () => void;
  onLaunchSession: (queue: WordCard[]) => void;
}

export function StudySetupModal({
  show,
  initialDeckId,
  decks,
  words,
  cardDeckMapping,
  onClose,
  onLaunchSession,
}: StudySetupModalProps) {
  const [targetDeckId, setTargetDeckId] = useState<string>(initialDeckId || 'all');
  type StatusPresetMode = 'due' | 'new' | 'learning' | 'all' | 'custom';
  const [statusMode, setStatusMode] = useState<StatusPresetMode>('due');
  const [customStatuses, setCustomStatuses] = useState<string[]>(['New', 'Learning']);

  const ALL_STATUSES = ['New', 'Learning', 'Known', 'Mastered'];

  const activeStatuses = useMemo(() => {
    if (statusMode === 'due') return ['New', 'Learning'];
    if (statusMode === 'all') return ['New', 'Learning', 'Known', 'Mastered'];
    if (statusMode === 'new') return ['New'];
    if (statusMode === 'learning') return ['Learning'];
    return customStatuses;
  }, [statusMode, customStatuses]);

  const toggleCustomStatus = (st: string) => {
    setCustomStatuses((prev) =>
      prev.includes(st) ? prev.filter((s) => s !== st) : [...prev, st]
    );
  };

  const filteredQueue = useMemo(() => {
    return words.filter((w) => {
      const dId = cardDeckMapping[w.lemma] || 'unclassified';
      const matchesDeck = targetDeckId === 'all' || dId === targetDeckId;
      const matchesStatus = activeStatuses.includes(w.status);
      return matchesDeck && matchesStatus;
    });
  }, [words, cardDeckMapping, targetDeckId, activeStatuses]);

  if (!show) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content study-setup-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="jp-font" style={{ color: 'var(--ivory)', marginBottom: '0.3rem' }}>
          Configure Flashcard Session
        </h2>
        <p className="sub" style={{ color: 'var(--ivory-dim)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          Select target deck and card learning statuses to include in your flashcard review.
        </p>

        {/* Deck Picker */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label className="input-label" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--gold)', fontSize: '0.825rem' }}>
            Target Deck:
          </label>
          <div className="deck-chips-picker" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <button
              type="button"
              className={`chip-btn ${targetDeckId === 'all' ? 'selected' : ''}`}
              onClick={() => setTargetDeckId('all')}
            >
              All Decks ({decks.length})
            </button>
            {decks.map((d) => (
              <button
                type="button"
                key={d.id}
                className={`chip-btn ${targetDeckId === d.id ? 'selected' : ''}`}
                onClick={() => setTargetDeckId(d.id)}
              >
                <span className="chip-dot" style={{ background: d.color }}></span>
                {d.jp} · {d.en}
              </button>
            ))}
          </div>
        </div>

        {/* Status Presets & Checkboxes */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="input-label" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--gold)', fontSize: '0.825rem' }}>
            Included Word Statuses:
          </label>

          <div className="preset-pills" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
            <button
              type="button"
              className={`preset-btn ${statusMode === 'due' ? 'selected' : ''}`}
              onClick={() => setStatusMode('due')}
            >
              ⚡ Due Only (New + Learning)
            </button>
            <button
              type="button"
              className={`preset-btn ${statusMode === 'new' ? 'selected' : ''}`}
              onClick={() => setStatusMode('new')}
            >
              🌱 New Only
            </button>
            <button
              type="button"
              className={`preset-btn ${statusMode === 'learning' ? 'selected' : ''}`}
              onClick={() => setStatusMode('learning')}
            >
              🔥 Learning Only
            </button>
            <button
              type="button"
              className={`preset-btn ${statusMode === 'all' ? 'selected' : ''}`}
              onClick={() => setStatusMode('all')}
            >
              🌟 All Statuses
            </button>
            <button
              type="button"
              className={`preset-btn ${statusMode === 'custom' ? 'selected' : ''}`}
              onClick={() => setStatusMode('custom')}
            >
              ⚙️ Custom
            </button>
          </div>

          {statusMode === 'custom' && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--gold)', width: '100%', marginBottom: '0.25rem' }}>
                Select specific statuses to include:
              </span>
              {ALL_STATUSES.map((st) => {
                const checked = customStatuses.includes(st);
                return (
                  <button
                    type="button"
                    key={st}
                    className={`chip-btn ${checked ? 'selected' : ''}`}
                    onClick={() => toggleCustomStatus(st)}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {checked ? '✓ ' : '+ '}{st}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div>
          <button
            type="button"
            className="btn-primary"
            disabled={filteredQueue.length === 0}
            onClick={() => {
              onLaunchSession(filteredQueue);
              onClose();
            }}
            style={{ width: '100%', height: '44px', fontSize: '0.95rem', fontWeight: 600 }}
          >
            {filteredQueue.length > 0
              ? `🚀 Start Flashcard Session (${filteredQueue.length} Cards)`
              : 'No cards match selected filter'}
          </button>
        </div>

        <button type="button" className="btn-secondary-link" onClick={onClose} style={{ marginTop: '0.75rem', width: '100%', textAlign: 'center' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
