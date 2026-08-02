import type { Dispatch, SetStateAction } from 'react';
import type { WordCard, NavigationPage } from '../types/app';

interface StudySessionPageProps {
  studyQueue: WordCard[];
  studyIndex: number;
  setStudyIndex: Dispatch<SetStateAction<number>>;
  isFlipped: boolean;
  setIsFlipped: (val: boolean) => void;
  onNavigate: (page: NavigationPage) => void;
  onAdvanceFSM: (lemma: string, targetStatus?: string) => void;
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
            <div className="card-face front">
              <span className="card-jlpt-tag">{currentCard.jlpt_level}</span>
              <div className="card-main-lemma jp-font">{currentCard.lemma}</div>
              <div className="card-reading jp-font">{currentCard.reading}</div>

              <div className="context-quote jp-font">
                "{currentCard.context_sentence}"
              </div>

              <p className="flip-hint">Click card to reveal meaning</p>
            </div>

            <div className="card-face back">
              <div className="card-meaning-title">English Definition</div>
              <p className="card-meaning-text">{currentCard.meaning}</p>

              <div className="context-quote jp-font">
                "{currentCard.context_sentence}"
              </div>
            </div>
          </div>

          {/* Feedback Actions (Optimistic UI FSM) */}
          <div className="fsm-action-buttons">
            <button
              className="fsm-btn forgot"
              onClick={() => {
                onAdvanceFSM(currentCard.lemma, 'New');
                onNotify('FSM: Reset to [New]');
                if (studyIndex + 1 < studyQueue.length) setStudyIndex((i) => i + 1);
                else onNavigate('overview');
                setIsFlipped(false);
              }}
            >
              Forgot It (Reset)
            </button>

            <button
              className="fsm-btn hard"
              onClick={() => {
                onAdvanceFSM(currentCard.lemma, 'Learning');
                onNotify('FSM: Set to [Learning]');
                if (studyIndex + 1 < studyQueue.length) setStudyIndex((i) => i + 1);
                else onNavigate('overview');
                setIsFlipped(false);
              }}
            >
              Hard (Learning)
            </button>

            <button
              className="fsm-btn good"
              onClick={() => {
                onAdvanceFSM(currentCard.lemma, 'Known');
                onNotify('FSM: Advanced to [Known]');
                if (studyIndex + 1 < studyQueue.length) setStudyIndex((i) => i + 1);
                else onNavigate('overview');
                setIsFlipped(false);
              }}
            >
              Good (Known)
            </button>

            <button
              className="fsm-btn easy"
              onClick={() => {
                onAdvanceFSM(currentCard.lemma, 'Mastered');
                onNotify('FSM: Advanced to [Mastered]');
                if (studyIndex + 1 < studyQueue.length) setStudyIndex((i) => i + 1);
                else onNavigate('overview');
                setIsFlipped(false);
              }}
            >
              Easy (Mastered)
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
