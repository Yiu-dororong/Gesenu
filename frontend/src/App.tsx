import { useEffect, useState } from 'react';
import type { components } from './types/api';

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

export const App: React.FC = () => {
  const [words, setWords] = useState<WordCard[]>([]);
  const [health, setHealth] = useState<HealthCheckStatus | null>(null);
  const [sourceMessage, setSourceMessage] = useState<string>('Initializing...');
  const [loading, setLoading] = useState<boolean>(true);
  const [showSql, setShowSql] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form state for adding test card
  const [lemma, setLemma] = useState('');
  const [reading, setReading] = useState('');
  const [meaning, setMeaning] = useState('');
  const [jlpt, setJlpt] = useState('N3');
  const [contextSentence, setContextSentence] = useState('');

  // 1. Fetch Health and Test Words from FastAPI backend
  const fetchData = async () => {
    setLoading(true);
    try {
      // Check API Health
      const healthRes = await fetch(`${API_BASE}/api/health`);
      if (healthRes.ok) {
        const healthData: HealthCheckStatus = await healthRes.json();
        setHealth(healthData);
      }

      // Fetch Test Words
      const wordsRes = await fetch(`${API_BASE}/api/test-words`);
      if (wordsRes.ok) {
        const data: WordCardResponse = await wordsRes.json();
        setWords(data.words);
        setSourceMessage(data.message);
      }
    } catch (err) {
      console.error('Failed to connect to Gesenu API:', err);
      setSourceMessage('❌ Unable to reach backend API at localhost:8000');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Optimistic UI transition for card status (Core Target Decision #2 & #3)
  const advanceStatus = (index: number) => {
    const card = words[index];
    const currentStatus = card.status || 'New';
    const nextStatus = NEXT_STATUS[currentStatus] || 'New';

    // Optimistically update local state immediately
    const updatedWords = [...words];
    updatedWords[index] = { ...card, status: nextStatus };
    setWords(updatedWords);

    setNotification(`⚡ Optimistic UI: Moved "${card.lemma}" from [${currentStatus}] → [${nextStatus}]`);
    setTimeout(() => setNotification(null), 3000);
  };

  // 3. Submit a new card (Test POST endpoint)
  const handleAddCard = async (e: React.FormEvent) => {
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

    // Optimistic append
    setWords((prev) => [newCard, ...prev]);

    try {
      const res = await fetch(`${API_BASE}/api/test-words`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCard),
      });
      if (res.ok) {
        setNotification(`✓ Successfully added "${lemma}" to test database!`);
      }
    } catch (err) {
      console.error('POST failed:', err);
    }

    // Reset form
    setLemma('');
    setReading('');
    setMeaning('');
    setContextSentence('');
  };

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <div className="logo-area">
          <div className="logo-icon brand-font">解</div>
          <div className="logo-text">
            <h1 className="brand-font">Gesenu 解せぬ</h1>
            <p>From "I don't get it" to "I get it" — Context-First Japanese Learning</p>
          </div>
        </div>

        {health && (
          <div className="status-pill">
            <span className="status-pulse"></span>
            <span>API Online v{health.version}</span>
            {health.supabase_connected && <span style={{ marginLeft: '4px' }}>| Supabase Ready</span>}
          </div>
        )}
      </header>

      {/* Banner */}
      <div className="banner">
        <div className="banner-info">
          <h2>Backend & Supabase Delivery Test</h2>
          <p>{sourceMessage}</p>
        </div>
        <button className="btn" onClick={fetchData}>
          🔄 Refresh Test Data
        </button>
      </div>

      {notification && (
        <div
          style={{
            background: 'rgba(99, 102, 241, 0.2)',
            border: '1px solid var(--accent-primary)',
            color: '#c7d2fe',
            padding: '0.85rem 1.25rem',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            fontWeight: 500,
            fontSize: '0.9rem',
          }}
        >
          {notification}
        </div>
      )}

      {/* Vocabulary Cards Grid */}
      <h3 style={{ marginBottom: '1rem', color: '#cbd5e1', fontWeight: 600 }}>
        Saved Context Cards ({words.length})
      </h3>

      {loading ? (
        <div style={{ color: 'var(--text-muted)', padding: '2rem' }}>Loading test vocabulary cards...</div>
      ) : (
        <div className="cards-grid">
          {words.map((card, idx) => (
            <div key={card.id || idx} className="word-card">
              <div>
                <div className="card-top">
                  <div className="word-header">
                    <span className="word-reading jp-font">{card.reading}</span>
                    <span className="word-lemma jp-font">{card.lemma}</span>
                  </div>
                  {card.jlpt_level && <span className="jlpt-badge">{card.jlpt_level}</span>}
                </div>

                <p className="word-meaning">{card.meaning}</p>

                <div className="context-box jp-font">
                  "{card.context_sentence}"
                </div>
              </div>

              <div className="card-footer">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status FSM</span>
                <span
                  className={`badge-status status-${card.status}`}
                  onClick={() => advanceStatus(idx)}
                  title="Click to trigger FSM state transition"
                >
                  {card.status} ➔
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Word Card Form */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <h4 style={{ marginBottom: '1rem', color: '#fff' }}>Add New Test Card (POST to Backend / Supabase)</h4>
        <form
          onSubmit={handleAddCard}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}
        >
          <input
            type="text"
            placeholder="Target Word (e.g. 納得)"
            value={lemma}
            onChange={(e) => setLemma(e.target.value)}
            required
            style={{
              background: '#05070a',
              border: '1px solid var(--border-color)',
              color: '#fff',
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
              background: '#05070a',
              border: '1px solid var(--border-color)',
              color: '#fff',
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
              background: '#05070a',
              border: '1px solid var(--border-color)',
              color: '#fff',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
            }}
          />
          <select
            value={jlpt}
            onChange={(e) => setJlpt(e.target.value)}
            style={{
              background: '#05070a',
              border: '1px solid var(--border-color)',
              color: '#fff',
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
          <input
            type="text"
            placeholder="Context Sentence"
            value={contextSentence}
            onChange={(e) => setContextSentence(e.target.value)}
            required
            style={{
              background: '#05070a',
              border: '1px solid var(--border-color)',
              color: '#fff',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              gridColumn: '1 / -1',
            }}
          />
          <button type="submit" className="btn" style={{ gridColumn: '1 / -1', justifyContent: 'center' }}>
            ➕ Deliver Card to API
          </button>
        </form>
      </div>

      {/* SQL Migration Helper Notice */}
      <div className="sql-notice">
        <div className="sql-header" onClick={() => setShowSql(!showSql)}>
          <div>
            <strong style={{ color: '#fff' }}>🛠️ Supabase Database Migration Helper</strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Click to view SQL DDL script to run in Supabase SQL Editor if you'd like persistent table storage.
            </p>
          </div>
          <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
            {showSql ? 'Hide SQL' : 'Show SQL'}
          </button>
        </div>

        {showSql && (
          <pre className="sql-code">
{`CREATE TABLE IF NOT EXISTS public.test_words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lemma TEXT NOT NULL,
    reading TEXT NOT NULL,
    meaning TEXT NOT NULL,
    jlpt_level TEXT,
    context_sentence TEXT NOT NULL,
    status TEXT DEFAULT 'New',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS and public read/write access for test phase
ALTER TABLE public.test_words ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.test_words FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.test_words FOR INSERT WITH CHECK (true);`}
          </pre>
        )}
      </div>
    </div>
  );
};

export default App;
