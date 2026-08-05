import type { WordCard, NavigationPage } from '../types/app';
import { maskContextSentence } from '../constants/decks';

interface TestSessionPageProps {
  testQueue: WordCard[];
  testIndex: number;
  testScore: number;
  userAnswer: string;
  setUserAnswer: (val: string) => void;
  testFeedback: 'idle' | 'correct' | 'incorrect';
  onNavigate: (page: NavigationPage) => void;
  onSubmitAnswer: () => void;
  onNextQuestion: () => void;
}

export function TestSessionPage({
  testQueue,
  testIndex,
  testScore,
  userAnswer,
  setUserAnswer,
  testFeedback,
  onNavigate,
  onSubmitAnswer,
  onNextQuestion,
}: TestSessionPageProps) {
  const currentCard = testQueue[testIndex];
  const { maskedText, surface } = currentCard
    ? maskContextSentence(currentCard)
    : { maskedText: '', surface: '' };

  return (
    <main className="session-container">
      <div className="session-header">
        <button className="back-btn" onClick={() => onNavigate('overview')}>
          Cancel Test
        </button>
        <div className="session-progress">
          Question {testIndex + 1} of {testQueue.length} (Score: {testScore})
        </div>
      </div>

      {currentCard ? (
        <div className="test-card">
          <span className="test-hint-badge">Masked Context Sentence</span>

          <div className="masked-sentence jp-font">
            "{maskedText}"
          </div>

          <div className="test-definition-box">
            Meaning hint: {currentCard.meaning}
          </div>

          {testFeedback === 'idle' ? (
            <div className="test-input-group">
              <input
                type="text"
                className="sentence-textarea jp-font"
                style={{ minHeight: '54px' }}
                placeholder="Type missing word (Surface form or Lemma)..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSubmitAnswer();
                }}
              />
              <button className="btn-primary" onClick={onSubmitAnswer}>
                Submit Answer
              </button>
            </div>
          ) : (
            <div className={`feedback-box ${testFeedback}`}>
              {testFeedback === 'correct' ? (
                <div>
                  <h4>Correct! Excellent Recall.</h4>
                  <p>
                    Surface form in sentence: <strong>{surface}</strong>
                  </p>
                  <p style={{ fontSize: '0.88rem', opacity: 0.85, marginTop: '0.2rem' }}>
                    Dictionary Lemma: <strong>{currentCard.lemma}</strong> ({currentCard.reading})
                  </p>
                </div>
              ) : (
                <div>
                  <h4>Not quite.</h4>
                  <p>
                    Surface form in sentence: <strong>{surface}</strong>
                  </p>
                  <p style={{ fontSize: '0.88rem', opacity: 0.85, marginTop: '0.2rem' }}>
                    Dictionary Lemma: <strong>{currentCard.lemma}</strong> ({currentCard.reading})
                  </p>
                </div>
              )}

              <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={onNextQuestion}>
                Next Question →
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>Test Session Finished</h2>
          <button className="btn-primary" onClick={() => onNavigate('overview')}>
            Return to Hub
          </button>
        </div>
      )}
    </main>
  );
}
