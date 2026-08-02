import type { FormEvent } from 'react';

interface CreateDeckModalProps {
  show: boolean;
  newDeckJp: string;
  setNewDeckJp: (val: string) => void;
  newDeckEn: string;
  setNewDeckEn: (val: string) => void;
  newDeckColor: string;
  setNewDeckColor: (val: string) => void;
  onCreateDeck: (e: FormEvent) => void;
  onClose: () => void;
}

export function CreateDeckModal({
  show,
  newDeckJp,
  setNewDeckJp,
  newDeckEn,
  setNewDeckEn,
  newDeckColor,
  setNewDeckColor,
  onCreateDeck,
  onClose,
}: CreateDeckModalProps) {
  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2 className="jp-font">Create New Deck</h2>
        <p className="sub">Organize your customized vocabulary collections</p>

        <form onSubmit={onCreateDeck} className="auth-form">
          <div>
            <label className="input-label">Japanese Kanji / Title</label>
            <input
              type="text"
              placeholder="e.g. 旅, 読書, 科学"
              value={newDeckJp}
              onChange={(e) => setNewDeckJp(e.target.value)}
              required
              className="input-field jp-font"
            />
          </div>

          <div>
            <label className="input-label">English Theme / Subtitle</label>
            <input
              type="text"
              placeholder="e.g. Travel & Adventure"
              value={newDeckEn}
              onChange={(e) => setNewDeckEn(e.target.value)}
              required
              className="input-field"
            />
          </div>

          <div>
            <label className="input-label">Hanafuda Theme Color</label>
            <div className="color-picker-row">
              {[
                { name: 'Pine', val: 'var(--pine)' },
                { name: 'Sakura', val: 'var(--sakura)' },
                { name: 'Moon', val: 'var(--moon)' },
                { name: 'Maple', val: 'var(--maple)' },
                { name: 'Plum', val: 'var(--plum)' },
                { name: 'Wave', val: 'var(--wave)' },
              ].map((c) => (
                <div
                  key={c.name}
                  className={`color-swatch ${newDeckColor === c.val ? 'selected' : ''}`}
                  style={{ background: c.val }}
                  onClick={() => setNewDeckColor(c.val)}
                />
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Confirm Deck Creation
          </button>
        </form>

        <button className="btn-secondary-link" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
