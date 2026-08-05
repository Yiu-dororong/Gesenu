import { useEffect, useRef, useState } from 'react';

interface LandingPageProps {
  onLoginGuest: () => void;
  onShowAuthModal: () => void;
}

const SUIT_COLORS = ['#2E4A3B', '#C1546F', '#C79A44', '#B0512E', '#2F6B6B'];

const N5_PAIRS = [
  // 動詞(I/II/III/複合)　名詞　擬声語・擬態語　カタカナ　形容詞・形容動詞
  ['見据えている', '見据える'],  ['社会現象', '現象'],  ['じわじわ広がる', 'じわじわ'],  ['コンセプト', 'コンセプト'],  ['曖昧だった', '曖昧'],
  ['くたびれた', '草臥れる'],  ['買い物してきた', '買い物する'],  ['うろうろしている', 'うろうろ'],  ['コンビニ', 'コンビニ'],  ['面倒くさかった', '面倒臭い'],
  ['泣きそうになった', '泣く'],  ['昔の思い出', '思い出'],  ['ドキドキしている', 'ドキドキ'],  ['メンタル', 'メンタル'],  ['切なかった', '切ない'],
  ['取り組んでいる', '取り組む'],  ['課題解決', '解決'],  ['着々と', '着々'],  ['プロジェクト', 'プロジェクト'],  ['複雑ではない', '複雑'],
  ['炎上した', '炎上する'],  ['SNS上で投稿', '投稿'],  ['めちゃくちゃ', 'めちゃくちゃ'],  ['コメント', 'コメント'],  ['やばくない', 'やばい'],
  ['散歩しましょう', '散歩する'], ['天気予報', '天気'],  ['ぶらぶら', 'ぶらぶら'],  ['カフェ', 'カフェ'], ['良かった', '良い'], 
  ['ハマっている', 'ハマる'],  ['かわいすぎる', 'かわいい'],  ['推し', '推し'],  ['キラキラ', 'キラキラ'],  ['アイドル', 'アイドル'],
  ['身につけた', '身につける'],  ['言の葉の庭', '言の葉'],  ['じっくり', 'じっくり'],  ['アプリ', 'アプリ'],  ['便利じゃない', '便利'],
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
  const demoTimer1Ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  const demoTimer2Ref = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearDemoTimers = () => {
    if (demoTimer1Ref.current) clearTimeout(demoTimer1Ref.current);
    if (demoTimer2Ref.current) clearTimeout(demoTimer2Ref.current);
  };

  const [demoStage, setDemoStage] = useState<0 | 1 | 2>(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [deckPositions, setDeckPositions] = useState<{ x: number; y: number }[]>([]);

  const TEST_OPTIONS = [
    { surface: '身につけた', lemma: '身につける' },
    { surface: '言の葉の庭', lemma: '言の葉' },
    { surface: 'じっくり', lemma: 'じっくり' },
    { surface: 'アプリ', lemma: 'アプリ' },
    { surface: '便利じゃない', lemma: '便利' },
  ];

  // Keep deck positions in sync with the canvas layout so hit areas overlay exactly
  const computeDeckPositions = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const pivotX = w / 2;
    const pivotY = h * 0.83;
    const deckSpacing = Math.min(w * 0.17, 180);
    return [0, 1, 2, 3, 4].map((deckIdx) => {
      const deckOffset = deckIdx - 2;
      return {
        x: pivotX + deckOffset * deckSpacing,
        y: pivotY + Math.pow(deckOffset, 2) * 14,
      };
    });
  };

  useEffect(() => {
    const update = () => setDeckPositions(computeDeckPositions());
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

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

          baseAlpha: rand(0.85, 1.0),
          size: rand(16, 19),
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
      const drawOrder = currentSection > 3.1
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
        let targetAlpha = 0.4;

        if (currentSection < 0.5) {
          // SECTION 0: HERO (Sparse drift)
          const speed = reducedMotion ? 0 : 0.2;
          p.x += p.vx * speed;
          p.y += p.vy * speed;
          p.rot += p.vrot * speed * 0.2;
          targetX = p.x;
          targetY = p.y;
          targetRot = p.rot;
          targetAlpha = lerp(0.4, 0.75, Math.max(0, currentSection / 0.5));
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
          targetAlpha = lerp(0.75, 0.88, blend);
        } else if (currentSection < 2.3) {
          // SECTION 2: WHY GESENU (Grid + Morph surface -> lemma)
          const blend = Math.max(0, Math.min(1, (currentSection - 1.4) / 0.9));
          targetX = p.gridX;
          targetY = p.gridY;
          targetRot = 0;
          targetMorph = blend;
          targetCard = 0;
          targetAlpha = lerp(0.88, 0.96, blend);
        } else if (currentSection < 3.1) {
          // SECTION 3: HOW IT WORKS (Grid + Card faces resolve)
          const blend = Math.max(0, Math.min(1, (currentSection - 2.3) / 0.8));
          targetX = p.gridX;
          targetY = p.gridY;
          targetRot = 0;
          targetMorph = 1;
          targetCard = blend;
          targetAlpha = lerp(0.96, 1.0, blend);
        } else {
          // SECTION 4: INVITATION (Cards leave 5 grid rows & sink down to 1 bottom row into 5 color stacks)
          const blend = Math.max(0, Math.min(1, (currentSection - 3.1) / 0.9));
          targetX = lerp(p.gridX, p.fanX, blend);
          targetY = lerp(p.gridY, p.fanY, blend);
          targetRot = lerp(0, p.fanRot, blend);
          targetMorph = 1;
          targetCard = 1;
          targetFan = blend;
          targetAlpha = 1.0;
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

        // Surface fades out over morphProgress 0 → 0.45
        if (p.morphProgress < 0.45) {
          const surfFade = Math.max(0, 1 - p.morphProgress / 0.45);
          const surfY = offsetY - p.morphProgress * 10;
          ctx.globalAlpha = alpha * surfFade;
          ctx.fillStyle = '#F2E9DA';
          ctx.fillText(p.surface, 0, surfY);
        }

        // Lemma fades in quickly over 0.55 → 0.75, then stays at full alpha
        if (p.morphProgress > 0.55) {
          const lemFade = Math.min(1, (p.morphProgress - 0.55) / 0.2);
          const lemY = offsetY + Math.max(0, (1 - p.morphProgress)) * 10;
          ctx.globalAlpha = alpha * lemFade;
          ctx.fillStyle = '#C79A44';
          ctx.fillText(p.lemma, 0, lemY);
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
      clearDemoTimers();
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
            <h2 className="section-h2 jp-font">Japanese learning often leaves you<br />with scattered knowledge.</h2>
            <div className="problem-grid">
              <div className="problem-item">
                <h3>Vocabulary is fragmented</h3>
                <p>Managing new words from books, anime, news, and social media without losing context is difficult.</p>
              </div>
              <div className="problem-item">
                <h3>Generic lists waste effort</h3>
                <p>Progress feels unfocused when pre-made vocabulary lists include some words you already know.</p>
              </div>
              <div className="problem-item">
                <h3>Meaning alone is not enough</h3>
                <p>Without the original context and usage patterns, words remain fragile and hard to apply.</p>
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
            <h2 className="section-h2 jp-font">Every word belongs to its story.</h2>
            <p className="hero-lead" style={{ marginBottom: '1.2rem' }}>
              Instead of isolated vocabulary, Gesenu stores each discovery together with its original sentence.
            </p>
            <div className="why-grid">
              <div className="why-card why-sakura">
                <h3>Capture with context</h3>
                <p>Paste any sentence. Sudachi extracts the words and keeps them bound to the original sentence.</p>
              </div>
              <div className="why-card why-maple">
                <h3>Focus on what you don’t know</h3>
                <p>Build your own decks instead of studying generic lists that mix known and unknown words.</p>
              </div>
              <div className="why-card why-wave">
                <h3>Test in real context</h3>
                <p>Generate tests that hide the target word in its original sentence, reinforcing both meaning and usage.</p>
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
                <p>Paste a sentence. Sudachi parses candidates and Jisho API fetches readings and definitions.</p>
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

            {/* Micro 3-Stage Pipeline Demo Preview */}
            <div
              className={`cta-demo-strip stage-${demoStage} ${
                isCorrect === true ? 'is-correct' : isCorrect === false ? 'is-wrong' : ''
              }`}
              onClick={() => {
                if (demoStage === 2 && isCorrect) {
                  setDemoStage(0);
                  setIsCorrect(null);
                } else if (demoStage < 2) {
                  setDemoStage((prev) => (prev + 1) as 1 | 2);
                }
              }}
              title="Click to toggle pipeline stages"
            >
              <div className="cta-demo-hint">
                {demoStage === 0 && '🖱️ Step 1: Click to parse sentence'}
                {demoStage === 1 && '⚡ Step 2: Parsed! Hover keywords for meanings (Click again for Recall Test)'}
                {demoStage === 2 && isCorrect && '🎉 Step 3: 解せる！ (Correct! Click to reset)'}
                {demoStage === 2 && !isCorrect && '🎯 Step 3: Select the matching word from the 5 background decks below!'}
              </div>

              {/* STAGE 0: Whole Sentence */}
              {demoStage === 0 && (
                <div className="cta-sentence-whole jp-font">
                  「このアプリで言葉をじっくり勉強しています。」
                </div>
              )}

              {/* STAGE 1 & 2: Token Chips */}
              {demoStage !== 0 && (
                <div className="cta-demo-tokens">
                  <div className="cta-token-card grammar">
                    <span className="token-jp jp-font">この</span>
                  </div>
                  <div className="cta-token-card keyword">
                    <span className="token-jp jp-font">アプリ</span>
                    {demoStage === 1 && <span className="token-en">app</span>}
                  </div>
                  <div className="cta-token-card grammar">
                    <span className="token-jp jp-font">で</span>
                  </div>
                  <div className="cta-token-card keyword">
                    <span className="token-jp jp-font">言葉</span>
                    {demoStage === 1 && <span className="token-en">words</span>}
                  </div>
                  <div className="cta-token-card grammar">
                    <span className="token-jp jp-font">を</span>
                  </div>

                  {/* Target Token: じっくり (Blank in Stage 2 until solved) */}
                  <div
                    className={`cta-token-card keyword target-blank ${
                      demoStage === 2 ? 'is-masked' : ''
                    } ${isCorrect ? 'is-filled' : ''}`}
                  >
                    <span className="token-jp jp-font">
                      {demoStage === 2 ? (isCorrect ? 'じっくり' : '＿＿＿') : 'じっくり'}
                    </span>
                    {demoStage === 1 && <span className="token-en">thoroughly</span>}
                    {demoStage === 2 && isCorrect && (
                      <span className="token-en">thoroughly ✓</span>
                    )}
                  </div>

                  <div className="cta-token-card keyword">
                    <span className="token-jp jp-font">勉強</span>
                    {demoStage === 1 && <span className="token-en">study</span>}
                  </div>
                  <div className="cta-token-card grammar">
                    <span className="token-jp jp-font">し</span>
                  </div>
                  <div className="cta-token-card grammar">
                    <span className="token-jp jp-font">て</span>
                  </div>
                  <div className="cta-token-card grammar">
                    <span className="token-jp jp-font">い</span>
                  </div>
                  <div className="cta-token-card grammar">
                    <span className="token-jp jp-font">ます</span>
                  </div>
                  <div className="cta-token-card punctuation">
                    <span className="token-jp jp-font">。</span>
                  </div>
                </div>
              )}
            </div>

            <div className="hero-cta-group">
              <button
                className="btn-primary hero-btn"
                onClick={onLoginGuest}
              >
                Open with Guest Decks
              </button>
              <button
                className="btn-outline hero-btn"
                onClick={onShowAuthModal}
              >
                Sign In
              </button>
            </div>

          </div>
        </section>

        {/* STAGE 2: Invisible hit areas at exact canvas deck positions */}
        {demoStage === 2 && deckPositions.length === 5 && (
          <div className="deck-hit-layer">
            {TEST_OPTIONS.map((opt, idx) => {
              const pos = deckPositions[idx];
              const isTarget = opt.lemma === 'じっくり';

              return (
                <button
                  key={opt.lemma}
                  className="deck-hit-area"
                  style={{
                    left: pos.x,
                    top: pos.y,
                  }}
                  onClick={() => {
                    clearDemoTimers();
                    if (isTarget) {
                      setIsCorrect(true);
                    } else {
                      setIsCorrect(null);
                      demoTimer1Ref.current = setTimeout(() => {
                        setIsCorrect(false);
                        demoTimer2Ref.current = setTimeout(() => {
                          setIsCorrect(null);
                        }, 500);
                      }, 10);
                    }
                  }}
                  aria-label={opt.surface}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
