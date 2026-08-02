interface LandingPageProps {
  onLoginGuest: () => void;
  onShowAuthModal: () => void;
}

export function LandingPage({
  onLoginGuest,
  onShowAuthModal,
}: LandingPageProps) {
  return (
    <main className="landing-screen">
      {/* ── HERO ── */}
      <section className="landing-hero">
        <div className="hero-inner">
          <p className="hero-eyebrow">解せぬ → 解せる</p>
          <h1 className="hero-h1 jp-font">
            You read it.<br />You don't know it.<br />You forget the lookup.
          </h1>
          <p className="hero-lead">
            Japanese vocabulary looked up in isolation evaporates within days.
            Gesenu captures the <em>sentence you actually encountered</em> — and turns that
            moment of confusion into a card you'll remember.
          </p>
          <div className="hero-cta-group">
            <button className="btn-primary hero-btn" onClick={onLoginGuest}>
              Try with Seeded Decks
            </button>
            <button className="btn-outline hero-btn" onClick={onShowAuthModal}>
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section className="landing-section">
        <div className="section-rule" />
        <p className="section-label">The problem</p>
        <h2 className="section-h2 jp-font">The gap most learners fall into</h2>
        <div className="problem-grid">
          <div className="problem-item">
            <h3>Isolated words don't stay</h3>
            <p>Vocabulary lists and random flashcard apps build weak memory. Words without a real sentence to anchor them evaporate in days.</p>
          </div>
          <div className="problem-item">
            <h3>Conjugation breaks dictionary lookup</h3>
            <p>You search <em>走った</em> and find nothing. The lemma <em>走る</em> is what you need — but getting there takes extra steps that break reading flow.</p>
          </div>
          <div className="problem-item">
            <h3>Review has no clear structure</h3>
            <p>Without explicit state tracking you over-review words you already know and neglect the ones you're still struggling with.</p>
          </div>
        </div>
      </section>

      {/* ── WHY ── */}
      <section className="landing-section landing-why">
        <div className="section-rule" />
        <p className="section-label">Why Gesenu</p>
        <h2 className="section-h2 jp-font">Built around the sentence you actually encountered</h2>
        <div className="why-grid">
          <div className="why-card why-pine">
            <h3>Context-bound cards</h3>
            <p>Every saved word carries the exact sentence you found it in. Meaning is grounded in real usage, not dictionary abstraction.</p>
          </div>
          <div className="why-card why-sakura">
            <h3>SudachiPy morphology</h3>
            <p>Paste any inflected form. SudachiPy resolves conjugated verbs and inflected adjectives to their dictionary lemma automatically.</p>
          </div>
          <div className="why-card why-maple">
            <h3>Explicit state machine</h3>
            <p>Card status follows defined transitions only: New → Learning → Known → Mastered. You always know where a word stands and what it needs to advance.</p>
          </div>
          <div className="why-card why-wave">
            <h3>Hanafuda deck collection</h3>
            <p>Organise vocabulary into themed decks styled after traditional Japanese flower cards — by season, topic, or JLPT level.</p>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="landing-section">
        <div className="section-rule" />
        <p className="section-label">How it works</p>
        <h2 className="section-h2 jp-font">Three steps. One loop.</h2>
        <div className="how-steps">
          <div className="how-step">
            <h3>Encounter</h3>
            <p>Paste a sentence. SudachiPy tokenises it into candidate lemmas. Tap a word — Jisho API fetches meaning, reading, and JLPT level. Save to a deck in one tap.</p>
          </div>
          <div className="how-arrow" aria-hidden="true">→</div>
          <div className="how-step">
            <h3>Study</h3>
            <p>Browse decks in the Hanafuda arc browser. Launch a flashcard session — flip to reveal the meaning, rate your recall. Status updates instantly, no round-trip wait.</p>
          </div>
          <div className="how-arrow" aria-hidden="true">→</div>
          <div className="how-step">
            <h3>Test</h3>
            <p>Select which decks to draw from. The original sentence appears with the target word masked. Type it from memory — active recall in the exact context you first met it.</p>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="landing-cta-final">
        <p className="cta-kana jp-font">解せぬを、解せるへ。</p>
        <p className="cta-sub">Start with a sentence you actually encountered today.</p>
        <div className="hero-cta-group">
          <button className="btn-primary hero-btn" onClick={onLoginGuest}>
            Open with Guest Decks
          </button>
          <button className="btn-outline hero-btn" onClick={onShowAuthModal}>
            Sign In
          </button>
        </div>
      </section>
    </main>
  );
}
