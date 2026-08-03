import { useEffect, useState, useMemo, type FormEvent } from 'react';
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
} from './constants/decks';

import { Toast } from './components/Toast';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { CreateDeckModal } from './components/CreateDeckModal';

import { LandingPage } from './pages/LandingPage';
import { OverviewPage } from './pages/OverviewPage';
import { EncounterPage } from './pages/EncounterPage';
import { StudyArcPage } from './pages/StudyArcPage';
import { DeckGridPage } from './pages/DeckGridPage';
import { StudySessionPage } from './pages/StudySessionPage';
import { TestSetupPage } from './pages/TestSetupPage';
import { TestSessionPage } from './pages/TestSessionPage';

export function App() {
  // Auth State
  const [userMode, setUserMode] = useState<UserMode>('logged_out');
  const [userEmail, setUserEmail] = useState<string>('');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authEmailInput, setAuthEmailInput] = useState<string>('');

  // Routing State
  const [currentPage, setCurrentPage] = useState<NavigationPage>('landing');

  // Decks & Cards Collection State
  const [decks, setDecks] = useState<DeckItem[]>(DEFAULT_DECKS);
  const [words, setWords] = useState<WordCard[]>(SEEDED_DEMO_CARDS);
  const [cardDeckMapping, setCardDeckMapping] = useState<Record<string, string>>({
      解せる: 'matsu',
      解せぬ: 'sakura',
      分解: 'matsu',
      記憶: 'tsuki',
    });

  // Selected Deck View State
  const [selectedDeckId, setSelectedDeckId] = useState<string>('matsu');
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

  // Test Session State
  const [selectedTestDeckIds, setSelectedTestDeckIds] = useState<string[]>([]);
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
  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Fetch Test Words from Backend API (/api/test-words)
  const fetchTestWords = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/test-words`);
      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
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

  useEffect(() => {
    fetchTestWords();
  }, []);

  // Auth Handlers
  const handleLoginGuest = () => {
    setUserMode('guest');
    setUserEmail('guest@gesenu.demo');
    setShowAuthModal(false);
    setCurrentPage('overview');
    fetchTestWords();
    notify('Logged in as Guest user');
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
      const res = await fetch(`${API_BASE}/api/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentence: targetText }),
      });
      if (!res.ok) throw new Error('Parsing service unavailable');
      const data: ParseSentenceResponse = await res.json();
      setParseResult(data);
      notify(`Parsed ${data.candidate_count} candidate tokens with SudachiPy`);
    } catch {
      notify('Backend offline: using fallback client-side tokenizer');
      setParseResult({
        sentence: targetText,
        candidate_count: 3,
        tokens: [
          { surface: '解せる', lemma: '解せる', reading: 'かいせる', pos: 'Verb', pos_detail: '一般', is_selectable: true },
          { surface: '分解', lemma: '分解', reading: 'ぶんかい', pos: 'Noun', pos_detail: 'サ変接続', is_selectable: true },
          { surface: '記憶', lemma: '記憶', reading: 'きおく', pos: 'Noun', pos_detail: 'サ変接続', is_selectable: true },
        ],
      });
    } finally {
      setParsing(false);
    }
  };

  const handleSelectToken = async (token: TokenItem) => {
    setSelectedToken(token);
    setEnriching(true);

    try {
      const res = await fetch(`${API_BASE}/api/dict/lookup?keyword=${encodeURIComponent(token.lemma)}`);
      if (!res.ok) throw new Error('Lookup failed');
      const data: DictLookupResponse = await res.json();
      setDictInfo(data);
    } catch {
      setDictInfo({
        lemma: token.lemma,
        reading: token.reading || 'よみ',
        meaning: 'Contextual Japanese vocabulary entry',
        jlpt_level: 'N2',
        found: true,
      });
    } finally {
      setEnriching(false);
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

    const newCard: WordCard = {
      lemma: dictInfo?.lemma || selectedToken.lemma,
      reading: dictInfo?.reading || selectedToken.reading || '',
      meaning: dictInfo?.meaning || 'Saved vocabulary card',
      jlpt_level: dictInfo?.jlpt_level || 'N3',
      context_sentence: parseResult?.sentence || sentenceInput,
      status: 'New',
    };

    setWords((prev) => [newCard, ...prev.filter((w) => w.lemma !== newCard.lemma)]);
    setCardDeckMapping((prev) => ({ ...prev, [newCard.lemma]: targetDeckId }));

    // Persist to backend /api/test-words API
    fetch(`${API_BASE}/api/test-words`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCard),
    }).catch(() => {
      // Local state fallback already updated
    });

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
      stubCount: 0,
      stubDue: 0,
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

  // Study Session Handler
  const startStudySession = (deckId: string) => {
    const queue = words.filter((w) => {
      const dId = cardDeckMapping[w.lemma] || 'matsu';
      return dId === deckId || deckId === 'unclassified';
    });

    if (queue.length === 0) {
      notify('No cards in this deck yet! Use Encounter to add some.');
      return;
    }

    setStudyQueue(queue);
    setStudyIndex(0);
    setIsFlipped(false);
    setCurrentPage('study_session');
  };

  // FSM State Transition Handler (Optimistic UI)
  const advanceFSM = (lemma: string, targetStatus?: string) => {
    setWords((prev) =>
      prev.map((w) => {
        if (w.lemma === lemma) {
          const next = targetStatus || NEXT_STATUS[w.status] || 'New';
          return { ...w, status: next };
        }
        return w;
      })
    );
  };

  // Test Session Handlers
  const openTestSetup = () => {
    setSelectedTestDeckIds(decks.map((d) => d.id));
    setCurrentPage('test_setup');
  };

  const launchTestSession = () => {
    const pool = words.filter((w) => {
      const dId = cardDeckMapping[w.lemma] || 'matsu';
      return selectedTestDeckIds.includes(dId);
    });

    if (pool.length === 0) {
      notify('No cards available in selected decks for testing.');
      return;
    }

    setTestQueue(pool);
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
    const isCorrect =
      cleanInput === currentCard.lemma.toLowerCase() ||
      cleanInput === currentCard.reading.toLowerCase();

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

      {/* Persistent Header (When logged in) */}
      {userMode !== 'logged_out' && (
        <Header
          userEmail={userEmail}
          currentPage={currentPage}
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
