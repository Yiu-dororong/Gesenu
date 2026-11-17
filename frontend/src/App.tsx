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
  INITIAL_CARD_DECK_MAPPING,
  DEMO_PARSE_MAP,
  getSentenceId,
  interleaveCardsBySentence,
} from './constants/decks';

import { DemoAPI } from './services/api/DemoAPI';
import { LiveAPI } from './services/api/LiveAPI';
import type { GesenuAPI, ReviewFeedback } from './services/api/types';

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

import { useAuth } from './context/authContext';

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

  // Demo / Live API Client State
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const apiClientRef = useRef<GesenuAPI | null>(null);

  // ---------------------------------------------------------------------------
  // Auth — derived from Supabase session via AuthContext
  // ---------------------------------------------------------------------------
  const { session, user, signOut, getAccessToken, loading: authLoading } = useAuth();

  // Wire LiveAPI whenever a real Supabase session is established
  useEffect(() => {
    if (session) {
      apiClientRef.current = new LiveAPI(getAccessToken);
    } else if (!isDemoMode) {
      apiClientRef.current = null;
    }
  }, [session, isDemoMode, getAccessToken]);

  // userMode: 'standard' when a real session exists, 'guest' for demo, 'logged_out' otherwise
  const userMode: UserMode = session ? 'standard' : isDemoMode ? 'guest' : 'logged_out';
  const userEmail: string = user?.email ?? (isDemoMode ? 'demo@gesenu.browser' : '');

  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Routing State
  const [currentPage, setCurrentPage] = useState<NavigationPage>('landing');

  // Decks & Cards Collection State
  const [decks, setDecks] = useState<DeckItem[]>(DEFAULT_DECKS);
  const [words, setWords] = useState<WordCard[]>(SEEDED_DEMO_CARDS);
  const [cardDeckMapping, setCardDeckMapping] = useState<Record<string, string>>(
    INITIAL_CARD_DECK_MAPPING
  );

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
  const notify = useCallback((msg: string, duration = 3000) => {
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }
    setNotification(msg);
    notificationTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setNotification(null);
      }
    }, duration);
  }, []);

  // Fetch Words & Decks from Backend API (/api/words & /api/decks)
  const fetchTestWords = async () => {
    if (isDemoMode || apiClientRef.current?.isDemoMode) return;
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_BASE}/api/words`, {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      if (!isMountedRef.current) return;
      if (Array.isArray(data.words)) {
        setWords(data.words);

        // Assign card deck mappings directly from persisted deck_id
        const updated: Record<string, string> = {};
        data.words.forEach((w: WordCard) => {
          updated[w.lemma] = w.deck_id || 'unclassified';
        });
        setCardDeckMapping(updated);
      }

      // Sync decks from backend if available
      if (apiClientRef.current) {
        apiClientRef.current.getDecks().then((liveDecks) => {
          if (liveDecks && liveDecks.length > 0 && isMountedRef.current) {
            setDecks(liveDecks);
          }
        }).catch(() => {});
      }
    } catch {
      // Graceful fallback to seeded local demo cards
    }
  };

  // ---------------------------------------------------------------------------
  // Auth handlers
  // ---------------------------------------------------------------------------

  const handleStartDemoSession = async () => {
    const demo = new DemoAPI();
    apiClientRef.current = demo;
    setIsDemoMode(true);

    const demoDecks = await demo.getDecks();
    const demoWords = await demo.getWords();
    setDecks(demoDecks);
    setWords(demoWords);
    setCardDeckMapping(demo.getInitialCardDeckMapping());

    setCurrentPage('overview');
    notify('Browser Demo Mode (In-Memory)');
  };

  useEffect(() => {
    // Wait until AuthContext has finished restoring the session from storage.
    // This ensures getAccessToken() returns the real token (not null) when we fetch.
    if (authLoading) return;

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('demo') === 'true' || urlParams.get('demo') === '1') {
      void handleStartDemoSession();
      return;
    }

    // Post-OAuth redirect: Supabase sets the session before this effect runs.
    // If we have a real session and we're still on the landing page, go to overview.
    if (session && currentPage === 'landing') {
      setCurrentPage('overview');
      void fetchTestWords();
      return;
    }

    // No session — just try to load words (will gracefully fail with 401 and use fallback).
    if (!session) return;

    void fetchTestWords();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, session]);

  // Auth Handlers
  const handleLoginGuest = () => {
    setShowAuthModal(false);
    handleStartDemoSession();
  };

  // handleLoginStandard removed — real auth is handled by Supabase OAuth redirect
  // (signInWithX / signInWithDiscord in AuthModal via AuthContext).
  // After the OAuth redirect completes, onAuthStateChange in AuthContext fires
  // automatically and updates the session, which flows into userMode above.

  const handleLogout = async () => {
    if (isDemoMode) {
      setIsDemoMode(false);
      apiClientRef.current = null;
    } else {
      await signOut();
    }
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

      // 3. Delegate to client-side cached API client lookup
      if (apiClientRef.current?.lookupDictionary) {
        try {
          const cachedData = await apiClientRef.current.lookupDictionary(token.lemma);
          if (cachedData && cachedData.found && isMountedRef.current) {
            setDictInfo(cachedData);
            return;
          }
        } catch {
          // Client lookup failed, continue to fallback below
        }
      }

      // 4. Network Lookup (ONLY in Live mode, NOT in Demo mode)
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

      // 5. Clean fallback for unmapped words in offline mode
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

  const handleSaveCard = (appendContext: boolean = true) => {
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

    const targetLemma = dictInfo?.lemma || selectedToken.lemma;
    const existingCard = words.find((w) => w.lemma === targetLemma);

    const contextSent = parseResult?.sentence || sentenceInput;
    let finalSentence = contextSent;
    let finalStatus = 'New';
    let finalDeckId = targetDeckId;

    if (existingCard) {
      if (
        appendContext &&
        existingCard.context_sentence &&
        !existingCard.context_sentence.includes(contextSent)
      ) {
        finalSentence = `${existingCard.context_sentence}\n${contextSent}`;
      }
      finalStatus = existingCard.status || 'New';
      if (targetDeckId === 'unclassified' && existingCard.deck_id) {
        finalDeckId = existingCard.deck_id;
      }
    }

    const newCard: WordCard = {
      ...(existingCard || {}),
      lemma: targetLemma,
      surface_form: selectedToken.surface || targetLemma,
      span_start: selectedToken.span_start,
      span_end: selectedToken.span_end,
      sentence_id: existingCard?.sentence_id || getSentenceId(finalSentence),
      reading: dictInfo?.reading || selectedToken.reading || existingCard?.reading || '',
      meaning: dictInfo?.meaning || existingCard?.meaning || 'Saved vocabulary card',
      jlpt_level: dictInfo?.jlpt_level || existingCard?.jlpt_level || 'N3',
      context_sentence: finalSentence,
      status: finalStatus,
      deck_id: finalDeckId,
    };

    setWords((prev) => [newCard, ...prev.filter((w) => w.lemma !== newCard.lemma)]);
    setCardDeckMapping((prev) => ({ ...prev, [newCard.lemma]: finalDeckId }));

    // Invalidate decks cache in LiveAPI so deck counts refresh
    if (apiClientRef.current?.invalidateDecksCache) {
      apiClientRef.current.invalidateDecksCache();
    }

    // Sync to in-memory DemoAPI if in demo mode
    if (apiClientRef.current && 'addCard' in apiClientRef.current) {
      (apiClientRef.current as { addCard: (c: WordCard, d: string) => void }).addCard(newCard, finalDeckId);
    }

    // Persist to backend /api/words API only when not in demo mode
    if (!isDemoMode && !apiClientRef.current?.isDemoMode) {
      const token = getAccessToken();
      fetch(`${API_BASE}/api/words`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(newCard),
      })
        .then(async (res) => {
          if (res.status === 403) {
            const data = await res.json().catch(() => ({}));
            notify(`⚠️ Quota limit: ${data.detail || 'Maximum of 1,000 words reached on trial tier'}`);
            // Rollback optimistic save
            setWords((prev) => prev.filter((w) => w.lemma !== newCard.lemma));
            setCardDeckMapping((prev) => {
              const updated = { ...prev };
              delete updated[newCard.lemma];
              return updated;
            });
            return;
          }
          if (!res.ok) {
            console.warn(`[SaveCard] Backend returned status ${res.status}`);
          }
        })
        .catch((err) => {
          console.warn('[SaveCard] Failed to persist card to backend:', err);
        });
    }

    const targetDeckName =
      finalDeckId === 'unclassified'
        ? 'Unclassified'
        : decks.find((d) => d.id === finalDeckId)?.jp || finalDeckId;

    if (existingCard) {
      notify(`Updated context for "${newCard.lemma}" in [${targetDeckName}] deck!`);
    } else {
      notify(`Saved "${newCard.lemma}" to [${targetDeckName}] deck!`);
    }

    if (words.length >= 900 && words.length < 1000) {
      notify(`ℹ️ Quota Notice: ${words.length + 1} / 1,000 words used on trial tier.`);
    }
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
    notify(`Created new deck: ${newDeck.jp} (${newDeck.en})`);
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
        notify(`⚠️ Rollback [${lemma}]: ${errorMsg}`, 5000);
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

      // Randomly pick 1 card/question per sentence
      const strictPool: WordCard[] = [];
      sentenceGroups.forEach((cardsInSentence) => {
        const randomIndex = Math.floor(Math.random() * cardsInSentence.length);
        strictPool.push(cardsInSentence[randomIndex]);
      });

      pool = strictPool;
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

    // Note: toLowerCase() is a no-op on Kanji/Kana, but safely handles mixed Latin loanwords/acronyms (e.g. IT, AI, SNS)
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
      notify(`Test finished! Final Score: ${testScore} / ${testQueue.length}`);
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
        onLoginGuest={handleLoginGuest}
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
          words={words}
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
