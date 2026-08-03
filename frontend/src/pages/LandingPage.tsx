import { useEffect, useRef } from 'react';

interface LandingPageProps {
  onLoginGuest: () => void;
  onShowAuthModal: () => void;
}

const SUIT_COLORS = ['#2E4A3B', '#C1546F', '#C79A44', '#B0512E', '#2F6B6B'];

const N5_PAIRS = [
  ['走った', '走る'], ['食べます', '食べる'], ['飲んだ', '飲む'], ['見ました', '見る'],
  ['書いて', '書く'], ['話した', '話す'], ['読みます', '読む'], ['買った', '買う'],
  ['行きます', '行く'], ['聞いた', '聞く'], ['待って', '待つ'], ['使います', '使う'],
  ['忙しかった', '忙しい'], ['高くない', '高い'], ['大きくて', '大きい'], ['好きでした', '好き'],
  ['静かな', '静か'], ['難しかった', '難しい'], ['早く', '早い'], ['楽しかった', '楽しい'],
  ['泳いだ', '泳ぐ'], ['死んで', '死ぬ'], ['遊びました', '遊ぶ'], ['作った', '作る'],
  ['教えて', '教える'], ['起きます', '起きる'], ['寝ました', '寝る'], ['分かった', '分かる'],
  ['歩いた', '歩く'], ['洗った', '洗う'], ['開けました', '開ける'], ['閉めた', '閉める'],
  ['入った', '入る'], ['出た', '出る'], ['置いた', '置く'], ['取った', '取る'],
  ['呼んだ', '呼ぶ'], ['送った', '送る'], ['貸した', '貸す'], ['借りた', '借りる'],
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function LandingPage({
  onLoginGuest,
  onShowAuthModal,
}: LandingPageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const scroller = scrollerRef.current;
    if (!canvas || !scroller) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const particleCount = Math.min(N5_PAIRS.length, 40);

    let particles: Array<{
      surface: string;
      lemma: string;
      color: string;
      deckIndex: number;
      cardInSuitIndex: number;
      x: number;
      y: number;
      vx: number;
      vy: number;
      rot: number;
      vrot: number;
      gridX: number;
      gridY: number;
      fanX: number;
      fanY: number;
      fanRot: number;
      morphProgress: number;
      cardProgress: number;
      fanProgress: number;
      baseAlpha: number;
      size: number;
    }> = [];

    const handleResize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);

      const w = window.innerWidth;
      const h = window.innerHeight;
      const cols = 8;
      const rows = 5;

      // Section 4 transformation: cards gather into 5 fanned deck stacks along an arc at bottom of viewport
      const pivotX = w / 2;
      const pivotY = h * 0.83;
      const deckSpacing = Math.min(w * 0.17, 180);

      // Track card index per suit (0..7)
      const suitCount = [0, 0, 0, 0, 0];

      particles = N5_PAIRS.slice(0, particleCount).map((pair, i) => {
        // Assign deckIndex = i % 5 so cards of all 5 colors are interleaved across every grid row
        const deckIdx = i % 5;
        const color = SUIT_COLORS[deckIdx];

        const col = i % cols;
        const row = Math.floor(i / cols);

        const gx = w * 0.08 + (col * (w * 0.84)) / (cols - 1);
        const gy = h * 0.14 + (row * (h * 0.58)) / (rows - 1);

        // Section 4: All cards of suit deckIdx converge from their grid rows to form 1 fanned deck stack at bottom
        const deckOffset = deckIdx - 2; // -2, -1, 0, 1, 2
        const deckCenterX = pivotX + deckOffset * deckSpacing;
        const deckCenterY = pivotY + Math.pow(deckOffset, 2) * 14;
        const deckTilt = deckOffset * 10;

        const cardInSuitIndex = suitCount[deckIdx];
        suitCount[deckIdx]++;

        const cardsPerSuit = 8;
        const stackOffset = cardInSuitIndex - (cardsPerSuit - 1) / 2; // -3.5 to 3.5

        // Each card in the suit is offset horizontally by 10px and rotated 4.5deg to form a fanned stack
        const fanX = deckCenterX + stackOffset * 10;
        const fanY = deckCenterY + Math.abs(stackOffset) * 2;
        const fanRot = deckTilt + stackOffset * 4.5;

        return {
          surface: pair[0],
          lemma: pair[1],
          color: color,
          deckIndex: deckIdx,
          cardInSuitIndex: cardInSuitIndex,
          x: rand(0, w),
          y: rand(0, h),
          vx: rand(-0.4, 0.4),
          vy: rand(-0.4, 0.4),
          rot: rand(-180, 180),
          vrot: rand(-0.8, 0.8),

          gridX: gx,
          gridY: gy,

          fanX: fanX,
          fanY: fanY,
          fanRot: fanRot,

          morphProgress: 0,
          cardProgress: 0,
          fanProgress: 0,

          baseAlpha: rand(0.65, 0.95),
          size: rand(15, 18),
        };
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    let currentSection = 0;
    let targetSection = 0;

    // Smooth continuous scroll section tracking
    const handleScroll = () => {
      const scrollMax = scroller.scrollHeight - scroller.clientHeight;
      if (scrollMax > 0) {
        targetSection = (scroller.scrollTop / scrollMax) * (sections.length - 1);
      }
    };

    const sections = Array.from(scroller.querySelectorAll('section'));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            handleScroll();
          }
        });
      },
      { root: scroller, threshold: 0.2 }
    );

    sections.forEach((sec) => observer.observe(sec));
    scroller.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    let animFrameId: number;
    let isTabVisible = !document.hidden;

    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible) {
        animFrameId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const render = () => {
      if (!isTabVisible) return;

      const currentW = window.innerWidth;
      const currentH = window.innerHeight;
      ctx.clearRect(0, 0, currentW, currentH);

      currentSection = lerp(currentSection, targetSection, 0.08);

      // In Section 4, sort particles by deckIndex & cardInSuitIndex so fanned decks stack cleanly
      const drawOrder = currentSection > 3.2
        ? [...particles].sort((a, b) => {
            if (a.deckIndex !== b.deckIndex) return a.deckIndex - b.deckIndex;
            return a.cardInSuitIndex - b.cardInSuitIndex;
          })
        : particles;

      drawOrder.forEach((p) => {
        let targetX = p.x;
        let targetY = p.y;
        let targetRot = p.rot;
        let targetMorph = 0;
        let targetCard = 0;
        let targetFan = 0;
        let targetAlpha = 0.25;

        if (currentSection < 0.5) {
          // SECTION 0: HERO (Sparse drift)
          const speed = reducedMotion ? 0 : 0.2;
          p.x += p.vx * speed;
          p.y += p.vy * speed;
          p.rot += p.vrot * speed * 0.2;
          targetX = p.x;
          targetY = p.y;
          targetRot = p.rot;
          targetAlpha = lerp(0.2, 0.55, Math.max(0, currentSection / 0.5));
        } else if (currentSection < 1.4) {
          // SECTION 1: PROBLEM (Chaos tumbling)
          const blend = (currentSection - 0.5) / 0.9;
          const chaosSpeed = reducedMotion ? 0 : lerp(0.3, 1.2, blend);
          p.x += p.vx * chaosSpeed;
          p.y += p.vy * chaosSpeed;
          p.rot += p.vrot * chaosSpeed * 2.5;

          if (p.x < -80) p.x = currentW + 80;
          if (p.x > currentW + 80) p.x = -80;
          if (p.y < -80) p.y = currentH + 80;
          if (p.y > currentH + 80) p.y = -80;

          targetX = p.x;
          targetY = p.y;
          targetRot = p.rot;
          targetMorph = 0;
          targetCard = 0;
          targetAlpha = lerp(0.55, 0.7, blend);
        } else if (currentSection < 2.3) {
          // SECTION 2: WHY GESENU (Grid + Morph surface -> lemma)
          const blend = Math.max(0, Math.min(1, (currentSection - 1.4) / 0.9));
          targetX = p.gridX;
          targetY = p.gridY;
          targetRot = 0;
          targetMorph = blend;
          targetCard = 0;
          targetAlpha = lerp(0.7, 0.8, blend);
        } else if (currentSection < 3.1) {
          // SECTION 3: HOW IT WORKS (Grid + Card faces resolve)
          const blend = Math.max(0, Math.min(1, (currentSection - 2.3) / 0.8));
          targetX = p.gridX;
          targetY = p.gridY;
          targetRot = 0;
          targetMorph = 1;
          targetCard = blend;
          targetAlpha = lerp(0.8, 0.88, blend);
        } else {
          // SECTION 4: INVITATION (Cards leave 5 grid rows & sink down to 1 bottom row into 5 color stacks)
          const blend = Math.max(0, Math.min(1, (currentSection - 3.1) / 0.9));
          targetX = lerp(p.gridX, p.fanX, blend);
          targetY = lerp(p.gridY, p.fanY, blend);
          targetRot = lerp(0, p.fanRot, blend);
          targetMorph = 1;
          targetCard = 1;
          targetFan = blend;
          targetAlpha = lerp(0.88, 0.95, blend);
        }

        // Faster lerp in section 4 for crisp convergence
        const lerpSpeed = currentSection > 3.1 ? 0.12 : 0.08;
        p.x = lerp(p.x, targetX, lerpSpeed);
        p.y = lerp(p.y, targetY, lerpSpeed);
        p.rot = lerp(p.rot, targetRot, lerpSpeed);
        p.morphProgress = lerp(p.morphProgress, targetMorph, lerpSpeed);
        p.cardProgress = lerp(p.cardProgress, targetCard, lerpSpeed);
        p.fanProgress = lerp(p.fanProgress, targetFan, lerpSpeed);

        const alpha = targetAlpha * p.baseAlpha;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);

        if (p.cardProgress > 0.01) {
          const cardW = 76;
          const cardH = 106;
          ctx.globalAlpha = alpha * p.cardProgress;

          ctx.fillStyle = '#1A1622';
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 8);
          } else {
            ctx.rect(-cardW / 2, -cardH / 2, cardW, cardH);
          }
          ctx.fill();

          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Hanafuda Suit Top Stripe
          ctx.fillStyle = p.color;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(-cardW / 2, -cardH / 2, cardW, 16, [8, 8, 0, 0]);
          } else {
            ctx.rect(-cardW / 2, -cardH / 2, cardW, 16);
          }
          ctx.fill();
        }

        ctx.font = `${p.size}px 'Noto Serif JP', serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const offsetY = p.cardProgress > 0.01 ? 8 : 0;

        if (p.morphProgress < 0.99) {
          ctx.globalAlpha = alpha * (1 - p.morphProgress);
          ctx.fillStyle = '#F2E9DA';
          ctx.fillText(p.surface, 0, offsetY);
        }

        if (p.morphProgress > 0.01) {
          ctx.globalAlpha = alpha * p.morphProgress;
          ctx.fillStyle = '#C79A44';
          ctx.fillText(p.lemma, 0, offsetY);
        }

        ctx.restore();
      });



      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animFrameId);
      observer.disconnect();
    };
  }, []);

  const scrollToSection = (targetIdx: number) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const sections = scroller.querySelectorAll('section');
    if (sections[targetIdx]) {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      sections[targetIdx].scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    }
  };

  return (
    <div className="landing-wrapper">
      {/* Background persistent particle canvas */}
      <canvas ref={canvasRef} className="landing-bg-canvas" />

      {/* Scrollytelling scroll-snap container */}
      <div ref={scrollerRef} className="landing-scroller">
        {/* SECTION 0: HERO */}
        <section className="landing-snap-section" data-index="0">
          <div className="landing-transparent-content">
            <p className="hero-eyebrow">解せぬを、解せるへ。</p>
            <h1 className="hero-h1 jp-font">Gesenu</h1>
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
          <button
            className="scroll-hint"
            onClick={() => scrollToSection(1)}
            aria-label="Scroll to next section"
          >
            <span>Scroll</span>
            <span className="chevron" />
          </button>
        </section>

        {/* SECTION 1: THE PROBLEM */}
        <section className="landing-snap-section" data-index="1">
          <div className="landing-transparent-content">
            <p className="section-label">The problem</p>
            <h2 className="section-h2 jp-font">Every page is a sea of words<br />you almost recognize.</h2>
            <div className="problem-grid">
              <div className="problem-item">
                <h3>Isolated words don't stay</h3>
                <p>Vocabulary lists build weak memory. Words without a real sentence anchor evaporate quickly.</p>
              </div>
              <div className="problem-item">
                <h3>Conjugation breaks lookup</h3>
                <p>Searching <em>走った</em> yields nothing. The lemma <em>走る</em> is what you need to study.</p>
              </div>
              <div className="problem-item">
                <h3>Review has no clear structure</h3>
                <p>Without defined status states, you over-review known words and neglect struggling cards.</p>
              </div>
            </div>
          </div>
          <button
            className="scroll-hint"
            onClick={() => scrollToSection(2)}
            aria-label="Scroll to next section"
          >
            <span>Scroll</span>
            <span className="chevron" />
          </button>
        </section>

        {/* SECTION 2: WHY GESENU */}
        <section className="landing-snap-section" data-index="2">
          <div className="landing-transparent-content">
            <p className="section-label">Why Gesenu</p>
            <h2 className="section-h2 jp-font">We find the word underneath the word</h2>
            <p className="hero-lead" style={{ marginBottom: '1.2rem' }}>
              <em>走った</em> isn't a new word to memorize — it's <em>走る</em>, conjugated. Gesenu automatically resolves inflected forms to dictionary lemmas.
            </p>
            <div className="why-grid">
              <div className="why-card why-pine">
                <h3>Context-bound cards</h3>
                <p>Every saved word carries the exact sentence you found it in.</p>
              </div>
              <div className="why-card why-sakura">
                <h3>SudachiPy morphology</h3>
                <p>Paste any sentence. SudachiPy normalizes conjugated verbs & adjectives.</p>
              </div>
              <div className="why-card why-maple">
                <h3>Explicit state machine</h3>
                <p>Track progress with defined transitions: New → Learning → Known → Mastered.</p>
              </div>
              <div className="why-card why-wave">
                <h3>Hanafuda deck collection</h3>
                <p>Organise vocabulary into themed decks styled after traditional Japanese flower cards.</p>
              </div>
            </div>
          </div>
          <button
            className="scroll-hint"
            onClick={() => scrollToSection(3)}
            aria-label="Scroll to next section"
          >
            <span>Scroll</span>
            <span className="chevron" />
          </button>
        </section>

        {/* SECTION 3: HOW IT WORKS */}
        <section className="landing-snap-section" data-index="3">
          <div className="landing-transparent-content">
            <p className="section-label">How it works</p>
            <h2 className="section-h2 jp-font">Three steps. One loop.</h2>
            <div className="how-steps-row">
              <div className="how-step">
                <span className="how-num">1</span>
                <h3>Encounter</h3>
                <p>Paste a sentence. SudachiPy parses candidates and Jisho API fetches readings and definitions.</p>
              </div>
              <div className="how-step">
                <span className="how-num">2</span>
                <h3>Study</h3>
                <p>Browse decks in the Hanafuda arc browser. Flip cards and watch status update instantly.</p>
              </div>
              <div className="how-step">
                <span className="how-num">3</span>
                <h3>Test</h3>
                <p>Masked sentence recall test. Fill in blanks from memory in original context.</p>
              </div>
            </div>
          </div>
          <button
            className="scroll-hint"
            onClick={() => scrollToSection(4)}
            aria-label="Scroll to next section"
          >
            <span>Scroll</span>
            <span className="chevron" />
          </button>
        </section>

        {/* SECTION 4: INVITATION TO START */}
        <section className="landing-snap-section" data-index="4">
          <div className="landing-transparent-content landing-cta-final">
            <p className="cta-kana jp-font">解せぬを、解せるへ。</p>
            <h2 className="section-h2 jp-font" style={{ marginBottom: '0.8rem' }}>
              Start with a sentence you actually encountered today.
            </h2>
            <p className="cta-sub">
              Build your custom vocabulary deck collection and turn everyday confusion into structured knowledge.
            </p>
            <div className="hero-cta-group">
              <button className="btn-primary hero-btn" onClick={onLoginGuest}>
                Open with Guest Decks
              </button>
              <button className="btn-outline hero-btn" onClick={onShowAuthModal}>
                Sign In
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
