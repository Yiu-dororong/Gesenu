import { useEffect, useState, useMemo, useCallback, useRef, type FormEvent } from 'react';
import type {
  TokenItem,
  ParseSentenceResponse,
  DictLookupResponse,
  WordCard,
  UserMode,
  NavigationPage,
  DeckItem,
} from './types/app';
import {
  API_BASE,
  NEXT_STATUS,
  SAMPLE_SENTENCES,
  DEFAULT_DECKS,
  SEEDED_DEMO_CARDS,
  DEMO_PARSE_MAP,
  getSentenceId,
  interleaveCardsBySentence,
} from './constants/decks';

import { DemoAPI } from './services/api/DemoAPI';
import type { ReviewFeedback } from './services/api/types';

import { Toast } from './components/Toast';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { CreateDeckModal } from './components/CreateDeckModal';
import { StudySetupModal } from './components/StudySetupModal';

import { LandingPage } from './pages/LandingPage';
import { OverviewPage } from './pages/OverviewPage';
import { EncounterPage } from './pages/EncounterPage';
import { StudyArcPage } from './pages/StudyArcPage';
import { DeckGridPage } from './pages/DeckGridPage';
import { StudySessionPage } from './pages/StudySessionPage';
import { TestSetupPage } from './pages/TestSetupPage';
import { TestSessionPage } from './pages/TestSessionPage';

export function App() {
  const notificationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
    };
  }, []);

  // Auth State
  const [userMode, setUserMode] = useState<UserMode>('logged_out');
  const [userEmail, setUserEmail] = useState<string>('');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authEmailInput, setAuthEmailInput] = useState<string>('');

  // Demo Mode State & API Client
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const apiClientRef = useRef<DemoAPI | null>(null);

  // Routing State
  const [currentPage, setCurrentPage] = useState<NavigationPage>('landing');

  // Decks & Cards Collection State
  const [decks, setDecks] = useState<DeckItem[]>(DEFAULT_DECKS);
  const [words, setWords] = useState<WordCard[]>(SEEDED_DEMO_CARDS);
  const [cardDeckMapping, setCardDeckMapping] = useState<Record<string, string>>({});

  // Selected Deck View State
  const [selectedDeckId, setSelectedDeckId] = useState<string>('work');
  const [deckFilterStatus, setDeckFilterStatus] = useState<string>('all');

  // New Deck Creation State
  const [showNewDeckModal, setShowNewDeckModal] = useState<boolean>(false);
  const [newDeckJp, setNewDeckJp] = useState('');
  const [newDeckEn, setNewDeckEn] = useState('');
  const [newDeckColor, setNewDeckColor] = useState('var(--wave)');

  // Toast Notifications
  const [notification, setNotification] = useState<string | null>(null);

  // Encounter Parse & Enrichment State
  const [sentenceInput, setSentenceInput] = useState<string>(SAMPLE_SENTENCES[0]);
  const [parsing, setParsing] = useState<boolean>(false);
  const [parseResult, setParseResult] = useState<ParseSentenceResponse | null>(null);
  const [selectedToken, setSelectedToken] = useState<TokenItem | null>(null);
  const [enriching, setEnriching] = useState<boolean>(false);
  const [dictInfo, setDictInfo] = useState<DictLookupResponse | null>(null);
  const [saveTargetDeckId, setSaveTargetDeckId] = useState<string>('skip');

  // Study Session State
  const [studyQueue, setStudyQueue] = useState<WordCard[]>([]);
  const [studyIndex, setStudyIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showStudySetupModal, setShowStudySetupModal] = useState<boolean>(false);
  const [studySetupDeckId, setStudySetupDeckId] = useState<string>('all');

  // Test Session State
  const [selectedTestDeckIds, setSelectedTestDeckIds] = useState<string[]>([]);
  const [isStrictTest, setIsStrictTest] = useState<boolean>(false);
  const [testQueue, setTestQueue] = useState<WordCard[]>([]);
  const [testIndex, setTestIndex] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [testFeedback, setTestFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [testScore, setTestScore] = useState<number>(0);

  // Responsive Layout State
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const stepX = useMemo(() => {
    if (windowWidth < 480) return 90;
    if (windowWidth < 768) return 130;
    return 180;
  }, [windowWidth]);

  // Live Statistics Calculation
  const totalCards = words.length;

  const totalDueCards = useMemo(() => {
    return words.filter((w) => w.status === 'New' || w.status === 'Learning').length;
  }, [words]);

  const deckStats = useMemo(() => {
    const stats: Record<string, { total: number; due: number }> = {};
    decks.forEach((d) => {
      stats[d.id] = { total: 0, due: 0 };
    });
    stats['unclassified'] = { total: 0, due: 0 };

    words.forEach((w) => {
      const deckId = cardDeckMapping[w.lemma] || 'unclassified';
      if (!stats[deckId]) {
        stats[deckId] = { total: 0, due: 0 };
      }
      stats[deckId].total += 1;
      if (w.status === 'New' || w.status === 'Learning') {
        stats[deckId].due += 1;
      }
    });

    return stats;
  }, [words, decks, cardDeckMapping]);

  // Notifications
  const notify = useCallback((msg: string) => {
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }
    setNotification(msg);
    notificationTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setNotification(null);
      }
    }, 3000);
  }, []);

  // Fetch Test Words from Backend API (/api/test-words)
  const fetchTestWords = async () => {
    if (isDemoMode || apiClientRef.current?.isDemoMode) return;
    try {
      const res = await fetch(`${API_BASE}/api/test-words`);
      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      if (!isMountedRef.current) return;
      if (data.words && data.words.length > 0) {
        setWords((prev) => {
          const fetchedLemmas = new Set(data.words.map((w: WordCard) => w.lemma));
          const customOrRemaining = prev.filter((w) => !fetchedLemmas.has(w.lemma));
          return [...data.words, ...customOrRemaining];
        });

        // Automatically assign all fetched /api/test-words to the 'kiku' (Demo & Test Data) deck
        setCardDeckMapping((prev) => {
          const updated = { ...prev };
          data.words.forEach((w: WordCard) => {
            updated[w.lemma] = 'kiku';
          });
          return updated;
        });
      }
    } catch {
      // Graceful fallback to seeded local demo cards
    }
  };

  const handleStartDemoSession = async () => {
    const demo = new DemoAPI();
    apiClientRef.current = demo;
    setIsDemoMode(true);
    setUserMode('guest');
    setUserEmail('demo@gesenu.browser');

    const demoDecks = await demo.getDecks();
    const demoWords = await demo.getWords();
    setDecks(demoDecks);
    setWords(demoWords);
    setCardDeckMapping(demo.getInitialCardDeckMapping());

    setCurrentPage('overview');
    notify('Browser Demo Mode (In-Memory)');
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('demo') === 'true' || urlParams.get('demo') === '1') {
      void handleStartDemoSession();
    } else {
      void fetchTestWords();
    }
  }, []);

  // Auth Handlers
  const handleLoginGuest = () => {
    setShowAuthModal(false);
    handleStartDemoSession();
  };

  const handleLoginStandard = (e: FormEvent) => {
    e.preventDefault();
    if (!authEmailInput) return;
    setUserMode('standard');
    setUserEmail(authEmailInput);
    setShowAuthModal(false);
    setCurrentPage('overview');
    fetchTestWords();
    notify(`Welcome back, ${authEmailInput}!`);
  };

  const handleLogout = () => {
    setUserMode('logged_out');
    setUserEmail('');
    setIsDemoMode(false);
    apiClientRef.current = null;
    setCurrentPage('landing');
    notify('Logged out successfully');
  };

  // Encounter & Parsing Handlers
  const handleParseSentence = async (textToParse?: string) => {
    const targetText = textToParse || sentenceInput;
    if (!targetText.trim()) return;

    setParsing(true);
    setSelectedToken(null);
    setDictInfo(null);

    try {
      if (isDemoMode || apiClientRef.current?.isDemoMode) {
        throw new Error('Demo mode client parser');
      }
      const res = await fetch(`${API_BASE}/api/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentence: targetText }),
      });
      if (!res.ok) throw new Error('Parsing service unavailable');
      const data: ParseSentenceResponse = await res.json();
      if (!isMountedRef.current) return;
      setParseResult(data);
      notify(`Parsed ${data.candidate_count} candidate tokens with SudachiPy`);
    } catch {
      if (!isMountedRef.current) return;
      notify(
        isDemoMode
          ? 'Demo Mode: Using pre-split result'
          : 'Backend offline: using fallback client-side tokenizer'
      );
      const fallbackTokens =
        DEMO_PARSE_MAP[targetText] ||
        DEMO_PARSE_MAP[SAMPLE_SENTENCES[0]] ||
        DEMO_PARSE_MAP[Object.keys(DEMO_PARSE_MAP)[0]];

      setParseResult({
        sentence: targetText,
        candidate_count: fallbackTokens.filter((t) => t.is_selectable).length,
        tokens: fallbackTokens,
      });
    } finally {
      if (isMountedRef.current) {
        setParsing(false);
      }
    }
  };

  const handleSelectToken = async (token: TokenItem) => {
    setSelectedToken(token);
    setEnriching(true);

    try {
      // 1. Direct meaning on token (pre-parsed DEMO_PARSE_MAP tokens)
      if (token.meaning) {
        if (isMountedRef.current) {
          setDictInfo({
            lemma: token.lemma,
            reading: token.reading || token.surface,
            meaning: token.meaning,
            jlpt_level: token.jlpt_level || null,
            found: true,
          });
        }
        return;
      }

      // 2. Check existing cards / SEEDED_DEMO_CARDS
      const existingCard =
        words.find((w) => w.lemma === token.lemma || w.surface_form === token.surface) ||
        SEEDED_DEMO_CARDS.find((c) => c.lemma === token.lemma || c.surface_form === token.surface);

      if (existingCard) {
        if (isMountedRef.current) {
          setDictInfo({
            lemma: existingCard.lemma,
            reading: existingCard.reading || token.reading || '',
            meaning: existingCard.meaning,
            jlpt_level: existingCard.jlpt_level || null,
            found: true,
          });
        }
        return;
      }

      // 3. Network Lookup (ONLY in Live mode, NOT in Demo mode)
      if (!isDemoMode && !apiClientRef.current?.isDemoMode) {
        try {
          const res = await fetch(`${API_BASE}/api/dict/lookup?keyword=${encodeURIComponent(token.lemma)}`);
          if (res.ok) {
            const data: DictLookupResponse = await res.json();
            if (data.found && data.meaning) {
              if (isMountedRef.current) setDictInfo(data);
              return;
            }
          }
        } catch {
          // Backend service offline
        }

        try {
          const jishoRes = await fetch(`https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(token.lemma)}`);
          if (jishoRes.ok) {
            const jishoData = await jishoRes.json();
            if (jishoData.data && jishoData.data.length > 0) {
              const item = jishoData.data[0];
              const primaryReading = item.japanese?.[0]?.reading || token.reading || '';
              const defs = item.senses
                ?.slice(0, 3)
                .map((s: { english_definitions?: string[] }) => s.english_definitions?.join('; '))
                .filter(Boolean)
                .join(' | ');
              const jlptTag = item.jlpt?.[0]?.toUpperCase().replace('JLPT-', '') || null;
              if (isMountedRef.current) {
                setDictInfo({
                  lemma: item.japanese?.[0]?.word || token.lemma,
                  reading: primaryReading,
                  meaning: defs || `Vocabulary entry for ${token.lemma}`,
                  jlpt_level: jlptTag,
                  found: true,
                });
              }
              return;
            }
          }
        } catch {
          // Jisho API unreachable
        }
      }

      // 4. Clean fallback for unmapped words in offline mode
      if (isMountedRef.current) {
        setDictInfo({
          lemma: token.lemma,
          reading: token.reading || token.surface,
          meaning: `Japanese vocabulary item (${token.pos || 'Word'})`,
          jlpt_level: null,
          found: true,
        });
      }
    } finally {
      if (isMountedRef.current) {
        setEnriching(false);
      }
    }
  };

  const handleSaveCard = () => {
    if (!selectedToken) return;

    let targetDeckId = saveTargetDeckId;

    if (targetDeckId === 'skip') {
      targetDeckId = 'unclassified';
      const exists = decks.some((d) => d.id === 'unclassified');
      if (!exists) {
        const unclassifiedDeck: DeckItem = {
          id: 'unclassified',
          jp: '未分類',
          en: 'Unclassified',
          color: 'var(--ink-surface)',
          motifSvg: (
            <svg className="motif" viewBox="0 0 40 40" fill="none">
              <rect x="10" y="10" width="20" height="20" rx="4" fill="#F2E9DA" opacity="0.5" />
            </svg>
          ),
        };
        setDecks((prev) => [...prev, unclassifiedDeck]);
      }
    }

    const contextSent = parseResult?.sentence || sentenceInput;
    const newCard: WordCard = {
      lemma: dictInfo?.lemma || selectedToken.lemma,
      surface_form: selectedToken.surface || dictInfo?.lemma || selectedToken.lemma,
      span_start: selectedToken.span_start,
      span_end: selectedToken.span_end,
      sentence_id: getSentenceId(contextSent),
      reading: dictInfo?.reading || selectedToken.reading || '',
      meaning: dictInfo?.meaning || 'Saved vocabulary card',
      jlpt_level: dictInfo?.jlpt_level || 'N3',
      context_sentence: contextSent,
      status: 'New',
    };

    setWords((prev) => [newCard, ...prev.filter((w) => w.lemma !== newCard.lemma)]);
    setCardDeckMapping((prev) => ({ ...prev, [newCard.lemma]: targetDeckId }));

    // Sync to in-memory DemoAPI if in demo mode
    if (apiClientRef.current && 'addCard' in apiClientRef.current) {
      (apiClientRef.current as { addCard: (c: WordCard, d: string) => void }).addCard(newCard, targetDeckId);
    }

    // Persist to backend /api/test-words API only when not in demo mode
    if (!isDemoMode && !apiClientRef.current?.isDemoMode) {
      fetch(`${API_BASE}/api/test-words`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCard),
      }).catch(() => {
        // Local state fallback already updated
      });
    }

    const targetDeckName =
      targetDeckId === 'unclassified'
        ? 'Unclassified'
        : decks.find((d) => d.id === targetDeckId)?.jp || targetDeckId;

    notify(`Saved "${newCard.lemma}" to [${targetDeckName}] deck!`);
    setSelectedToken(null);
    setDictInfo(null);
  };

  // Deck Creation Handler
  const handleCreateNewDeck = (e: FormEvent) => {
    e.preventDefault();
    if (!newDeckJp || !newDeckEn) return;

    const newDeck: DeckItem = {
      id: `custom_${Date.now()}`,
      jp: newDeckJp,
      en: newDeckEn,
      color: newDeckColor,
      motifSvg: (
        <svg className="motif" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="14" fill="#F2E9DA" opacity="0.8" />
        </svg>
      ),
    };

    setDecks((prev) => [...prev, newDeck]);
    setShowNewDeckModal(false);
    setNewDeckJp('');
    setNewDeckEn('');
    notify(`Created new Hanafuda deck: ${newDeck.jp} (${newDeck.en})`);
  };

  // Study Session Handlers (Modal Trigger & Queue Launcher)
  const startStudySession = (deckId?: string) => {
    setStudySetupDeckId(deckId || 'all');
    setShowStudySetupModal(true);
  };

  const handleLaunchStudySession = (queue: WordCard[]) => {
    if (queue.length === 0) {
      notify('No cards match the selected filter.');
      return;
    }
    setStudyQueue(queue);
    setStudyIndex(0);
    setIsFlipped(false);
    setCurrentPage('study_session');
  };

  // FSM State Transition Handler (Optimistic UI & Rollback)
  const advanceFSM = async (lemma: string, targetStatus?: string, feedback?: ReviewFeedback) => {
    // Capture oldStatus inside the functional updater to avoid stale closure
    let capturedOldStatus = '';
    let capturedNextStatus = '';

    setWords((prev) => {
      const word = prev.find((w) => w.lemma === lemma);
      if (!word) return prev;
      capturedOldStatus = word.status;
      capturedNextStatus = targetStatus || NEXT_STATUS[capturedOldStatus] || 'New';
      // 1. Optimistic UI update immediately
      return prev.map((w) => (w.lemma === lemma ? { ...w, status: capturedNextStatus } : w));
    });

    // 2. Submit review if API client is attached (Demo or backend)
    if (apiClientRef.current) {
      try {
        const fb: ReviewFeedback =
          feedback ||
          (capturedNextStatus === 'New'
            ? 'forgot'
            : capturedNextStatus === 'Learning'
            ? 'hard'
            : capturedNextStatus === 'Known'
            ? 'good'
            : 'easy');

        await apiClientRef.current.submitReview(lemma, fb);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Review sync failed';
        // 3. Rollback optimistic update on failure using captured pre-update status
        setWords((prev) =>
          prev.map((w) => (w.lemma === lemma ? { ...w, status: capturedOldStatus } : w))
        );
        notify(`⚠️ Rollback [${lemma}]: ${errorMsg}`);
      }
    }
  };

  // Test Session Handlers
  const openTestSetup = () => {
    setSelectedTestDeckIds(decks.map((d) => d.id));
    setCurrentPage('test_setup');
  };

  const launchTestSession = () => {
    let pool = words.filter((w) => {
      const dId = cardDeckMapping[w.lemma] || 'unclassified';
      return selectedTestDeckIds.includes(dId);
    });

    console.log('[Test] Selected deck IDs:', selectedTestDeckIds);
    console.log('[Test] cardDeckMapping:', cardDeckMapping);
    console.log('[Test] Deck-filtered pool:', pool.map(c => ({ lemma: c.lemma, deck: cardDeckMapping[c.lemma], context_sentence: c.context_sentence?.slice(0, 20) })));

    if (pool.length === 0) {
      notify('No cards available in selected decks for testing.');
      return;
    }

    if (isStrictTest) {
      // Group cards in selected decks by their sentence
      const sentenceGroups = new Map<string, WordCard[]>();
      for (const card of pool) {
        const sId = getSentenceId(card.context_sentence || card.sentence_id || '');
        if (!sentenceGroups.has(sId)) {
          sentenceGroups.set(sId, []);
        }
        sentenceGroups.get(sId)!.push(card);
      }

      console.log('[Test] Sentence groups:', [...sentenceGroups.entries()].map(([k, v]) => ({ sId: k, cards: v.map(c => c.lemma), sentence: v[0]?.context_sentence?.slice(0, 30) })));

      // Randomly pick 1 card/question per sentence
      const strictPool: WordCard[] = [];
      sentenceGroups.forEach((cardsInSentence) => {
        const randomIndex = Math.floor(Math.random() * cardsInSentence.length);
        strictPool.push(cardsInSentence[randomIndex]);
      });

      pool = strictPool;
      console.log('[Test] Strict pool (1 per sentence):', pool.map(c => ({ lemma: c.lemma, sentence: c.context_sentence?.slice(0, 30) })));
    }

    const interleavedPool = interleaveCardsBySentence(pool);

    setTestQueue(interleavedPool);
    setTestIndex(0);
    setUserAnswer('');
    setTestFeedback('idle');
    setTestScore(0);
    setCurrentPage('test_session');
  };

  const submitTestAnswer = () => {
    const currentCard = testQueue[testIndex];
    if (!currentCard) return;

    const cleanInput = userAnswer.trim().toLowerCase();
    const isExactSurfaceMatch =
      Boolean(currentCard.surface_form) &&
      cleanInput === currentCard.surface_form!.toLowerCase();

    const isLemmaMatch =
      cleanInput === currentCard.lemma.toLowerCase() ||
      cleanInput === currentCard.reading.toLowerCase();

    const isCorrect = isExactSurfaceMatch || isLemmaMatch;

    if (isCorrect) {
      setTestFeedback('correct');
      setTestScore((s) => s + 1);
      advanceFSM(currentCard.lemma, 'Known');
    } else {
      setTestFeedback('incorrect');
      advanceFSM(currentCard.lemma, 'Learning');
    }
  };

  const nextTestQuestion = () => {
    setUserAnswer('');
    setTestFeedback('idle');
    if (testIndex + 1 < testQueue.length) {
      setTestIndex((i) => i + 1);
    } else {
      notify(`Test finished! Final Score: ${testScore + (testFeedback === 'correct' ? 1 : 0)} / ${testQueue.length}`);
      setCurrentPage('overview');
    }
  };

  return (
    <div className="stage">
      {/* Toast Notifications */}
      <Toast message={notification} />

      {/* Auth Modal */}
      <AuthModal
        show={showAuthModal}
        authEmailInput={authEmailInput}
        setAuthEmailInput={setAuthEmailInput}
        onLoginGuest={handleLoginGuest}
        onLoginStandard={handleLoginStandard}
        onClose={() => setShowAuthModal(false)}
      />

      {/* New Deck Creation Modal */}
      <CreateDeckModal
        show={showNewDeckModal}
        newDeckJp={newDeckJp}
        setNewDeckJp={setNewDeckJp}
        newDeckEn={newDeckEn}
        setNewDeckEn={setNewDeckEn}
        newDeckColor={newDeckColor}
        setNewDeckColor={setNewDeckColor}
        onCreateDeck={handleCreateNewDeck}
        onClose={() => setShowNewDeckModal(false)}
      />

      {/* Configure Flashcard Session Modal */}
      <StudySetupModal
        show={showStudySetupModal}
        initialDeckId={studySetupDeckId}
        decks={decks}
        words={words}
        cardDeckMapping={cardDeckMapping}
        onClose={() => setShowStudySetupModal(false)}
        onLaunchSession={handleLaunchStudySession}
      />

      {/* Persistent Header (When logged in) */}
      {userMode !== 'logged_out' && (
        <Header
          userEmail={userEmail}
          currentPage={currentPage}
          isDemoMode={isDemoMode}
          onNavigate={setCurrentPage}
          onOpenTestSetup={openTestSetup}
          onLogout={handleLogout}
        />
      )}

      {/* SCREEN 1: LANDING PAGE */}
      {currentPage === 'landing' && userMode === 'logged_out' && (
        <LandingPage
          onLoginGuest={handleLoginGuest}
          onShowAuthModal={() => setShowAuthModal(true)}
        />
      )}

      {/* SCREEN 2: OVERVIEW */}
      {currentPage === 'overview' && userMode !== 'logged_out' && (
        <OverviewPage
          userEmail={userEmail}
          totalCards={totalCards}
          totalDueCards={totalDueCards}
          words={words}
          decks={decks}
          onNavigate={setCurrentPage}
          onOpenTestSetup={openTestSetup}
        />
      )}

      {/* SCREEN 2.1: ENCOUNTER */}
      {currentPage === 'encounter' && userMode !== 'logged_out' && (
        <EncounterPage
          sentenceInput={sentenceInput}
          setSentenceInput={setSentenceInput}
          parsing={parsing}
          parseResult={parseResult}
          selectedToken={selectedToken}
          enriching={enriching}
          dictInfo={dictInfo}
          saveTargetDeckId={saveTargetDeckId}
          setSaveTargetDeckId={setSaveTargetDeckId}
          decks={decks}
          isDemoMode={isDemoMode}
          onNavigate={setCurrentPage}
          onParseSentence={handleParseSentence}
          onSelectToken={handleSelectToken}
          onSaveCard={handleSaveCard}
        />
      )}

      {/* SCREEN 2.2: STUDY — ARC BROWSER */}
      {currentPage === 'study_arc' && userMode !== 'logged_out' && (
        <StudyArcPage
          decks={decks}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          stepX={stepX}
          deckStats={deckStats}
          setSelectedDeckId={setSelectedDeckId}
          onNavigate={setCurrentPage}
          onStartStudySession={startStudySession}
          onShowNewDeckModal={() => setShowNewDeckModal(true)}
        />
      )}

      {/* SCREEN 2.2.2: INSIDE DECK (CARD GRID & FILTER) */}
      {currentPage === 'study_deck' && userMode !== 'logged_out' && (
        <DeckGridPage
          selectedDeckId={selectedDeckId}
          onSelectDeck={setSelectedDeckId}
          decks={decks}
          words={words}
          cardDeckMapping={cardDeckMapping}
          deckFilterStatus={deckFilterStatus}
          setDeckFilterStatus={setDeckFilterStatus}
          onNavigate={setCurrentPage}
          onStartStudySession={startStudySession}
          onAdvanceFSM={advanceFSM}
        />
      )}

      {/* SCREEN 2.2.3: FLASHCARD SESSION */}
      {currentPage === 'study_session' && userMode !== 'logged_out' && (
        <StudySessionPage
          studyQueue={studyQueue}
          studyIndex={studyIndex}
          setStudyIndex={setStudyIndex}
          isFlipped={isFlipped}
          setIsFlipped={setIsFlipped}
          onNavigate={setCurrentPage}
          onAdvanceFSM={advanceFSM}
          onNotify={notify}
        />
      )}

      {/* SCREEN 2.3.1: TEST SETUP */}
      {currentPage === 'test_setup' && userMode !== 'logged_out' && (
        <TestSetupPage
          decks={decks}
          selectedTestDeckIds={selectedTestDeckIds}
          setSelectedTestDeckIds={setSelectedTestDeckIds}
          deckStats={deckStats}
          isStrictTest={isStrictTest}
          setIsStrictTest={setIsStrictTest}
          onNavigate={setCurrentPage}
          onLaunchTestSession={launchTestSession}
        />
      )}

      {/* SCREEN 2.3.2: TEST SESSION */}
      {currentPage === 'test_session' && userMode !== 'logged_out' && (
        <TestSessionPage
          testQueue={testQueue}
          testIndex={testIndex}
          testScore={testScore}
          userAnswer={userAnswer}
          setUserAnswer={setUserAnswer}
          testFeedback={testFeedback}
          onNavigate={setCurrentPage}
          onSubmitAnswer={submitTestAnswer}
          onNextQuestion={nextTestQuestion}
        />
      )}
    </div>
  );
};

export default App;
