import type { DeckItem, WordCard } from '../../types/app';

export type ReviewFeedback = 'forgot' | 'hard' | 'good' | 'easy';

export interface ReviewResult {
  success: boolean;
  wordId: string;
  previousStatus: string;
  newStatus: string;
  error?: string;
}

export interface GesenuAPI {
  isDemoMode: boolean;
  getDecks(): Promise<DeckItem[]>;
  getWords(deckId?: string): Promise<WordCard[]>;
  submitReview(wordId: string, feedback: ReviewFeedback): Promise<ReviewResult>;
}
