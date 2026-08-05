import { useEffect, useCallback, type Dispatch, type SetStateAction } from 'react';
import type { WordCard, NavigationPage } from '../types/app';
import type { ReviewFeedback } from '../services/api/types';

interface StudySessionPageProps {
  studyQueue: WordCard[];
  studyIndex: number;
  setStudyIndex: Dispatch<SetStateAction<number>>;
  isFlipped: boolean;
  setIsFlipped: (val: boolean) => void;
  onNavigate: (page: NavigationPage) => void;
  onAdvanceFSM: (lemma: string, targetStatus?: string, feedback?: ReviewFeedback) => void;
  onNotify: (msg: string) => void;
}

export function StudySessionPage({
  studyQueue,
  studyIndex,
  setStudyIndex,
  isFlipped,
  setIsFlipped,
  onNavigate,
  onAdvanceFSM,
  onNotify,
}: StudySessionPageProps) {
  const currentCard = studyQueue[studyIndex];

  const handleFSMReview = useCallback(
    (targetStatus: string, feedback: ReviewFeedback, msg: string) => {
      if (!currentCard) return;
      onAdvanceFSM(currentCard.lemma, targetStatus, feedback);
      onNotify(msg);
      if (studyIndex + 1 < studyQueue.length) {
        setStudyIndex((i) => i + 1);
      } else {
        onNavigate('overview');
      }
      setIsFlipped(false);
    },
    [currentCard, studyIndex, studyQueue.length, onAdvanceFSM, onNotify, setStudyIndex, onNavigate, setIsFlipped]
  );

  // Keyboard navigation shortcuts: Space = flip, ArrowLeft = prev, ArrowRight = next, 1..4 = FSM review
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(!isFlipped);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (studyIndex > 0) {
          setStudyIndex((i) => i - 1);
          setIsFlipped(false);
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (studyIndex < studyQueue.length - 1) {
          setStudyIndex((i) => i + 1);
          setIsFlipped(false);
        }
      } else if (e.key === '1' || e.code === 'Digit1' || e.code === 'Numpad1') {
        e.preventDefault();
        handleFSMReview('New', 'forgot', 'FSM: Reset to [New]');
      } else if (e.key === '2' || e.code === 'Digit2' || e.code === 'Numpad2') {
        e.preventDefault();
        handleFSMReview('Learning', 'hard', 'FSM: Set to [Learning]');
      } else if (e.key === '3' || e.code === 'Digit3' || e.code === 'Numpad3') {
        e.preventDefault();
        handleFSMReview('Known', 'good', 'FSM: Advanced to [Known]');
      } else if (e.key === '4' || e.code === 'Digit4' || e.code === 'Numpad4') {
        e.preventDefault();
        handleFSMReview('Mastered', 'easy', 'FSM: Advanced to [Mastered]');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [studyIndex, studyQueue.length, isFlipped, currentCard, handleFSMReview, setStudyIndex, setIsFlipped]);

  return (
    <main className="session-container">
      <div className="session-header">
        <button className="back-btn" onClick={() => onNavigate('study_arc')}>
          Exit Session
        </button>

        <div className="session-progress">
          Card {studyIndex + 1} of {studyQueue.length}
        </div>
      </div>

      {currentCard ? (
        <div className="flashcard-wrapper">
          <div
            className={`flashcard-glass ${isFlipped ? 'flipped' : ''}`}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            {/* Front Side: Japanese Lemma, Reading, and Context Sentence */}
            <div className="card-face front">
              <span className="card-jlpt-tag">{currentCard.jlpt_level}</span>
              <div className="card-main-lemma jp-font">{currentCard.lemma}</div>
              <div className="card-reading jp-font">{currentCard.reading}</div>

              <div className="context-quote jp-font">
                "{currentCard.context_sentence}"
              </div>

              <p className="flip-hint">Click card or press Space to reveal meaning</p>
            </div>

            {/* Back Side: English Definition Only */}
            <div className="card-face back">
              <div className="card-meaning-title">English Definition</div>
              <p className="card-meaning-text">{currentCard.meaning}</p>
              <p className="flip-hint">Click card or press Space to flip back</p>
            </div>
          </div>

          {/* Prev / Next Card Navigation Buttons */}
          <div className="card-nav-bar">
            <button
              className="card-nav-btn"
              disabled={studyIndex === 0}
              onClick={() => {
                if (studyIndex > 0) {
                  setStudyIndex((i) => i - 1);
                  setIsFlipped(false);
                }
              }}
            >
              ‹ Prev Card
            </button>

            <div className="kbd-shortcuts-hint">
              <span><kbd>←</kbd> / <kbd>→</kbd> Prev/Next</span>
              <span><kbd>Space</kbd> Flip</span>
              <span><kbd>1</kbd>–<kbd>4</kbd> Review</span>
            </div>

            <button
              className="card-nav-btn"
              disabled={studyIndex >= studyQueue.length - 1}
              onClick={() => {
                if (studyIndex < studyQueue.length - 1) {
                  setStudyIndex((i) => i + 1);
                  setIsFlipped(false);
                }
              }}
            >
              Next Card ›
            </button>
          </div>

          {/* Feedback Actions (Optimistic UI FSM) with Hotkeys 1-4 */}
          <div className="fsm-action-buttons">
            <button
              className="fsm-btn forgot"
              onClick={() => handleFSMReview('New', 'forgot', 'FSM: Reset to [New]')}
            >
              <kbd style={{ marginRight: '0.35rem', fontSize: '0.7rem' }}>1</kbd> Forgot (Reset)
            </button>

            <button
              className="fsm-btn hard"
              onClick={() => handleFSMReview('Learning', 'hard', 'FSM: Set to [Learning]')}
            >
              <kbd style={{ marginRight: '0.35rem', fontSize: '0.7rem' }}>2</kbd> Hard (Learning)
            </button>

            <button
              className="fsm-btn good"
              onClick={() => handleFSMReview('Known', 'good', 'FSM: Advanced to [Known]')}
            >
              <kbd style={{ marginRight: '0.35rem', fontSize: '0.7rem' }}>3</kbd> Good (Known)
            </button>

            <button
              className="fsm-btn easy"
              onClick={() => handleFSMReview('Mastered', 'easy', 'FSM: Advanced to [Mastered]')}
            >
              <kbd style={{ marginRight: '0.35rem', fontSize: '0.7rem' }}>4</kbd> Easy (Mastered)
            </button>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>Session Complete</h2>
          <button className="btn-primary" onClick={() => onNavigate('overview')}>
            Return to Overview
          </button>
        </div>
      )}
    </main>
  );
}
