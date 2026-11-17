import type { GesenuAPI, ReviewFeedback, ReviewResult } from './types';
import type { DeckItem, WordCard, DictLookupResponse } from '../../types/app';
import { DEFAULT_DECKS, SEEDED_DEMO_CARDS, INITIAL_CARD_DECK_MAPPING } from '../../constants/decks';

export class DemoAPI implements GesenuAPI {
  public readonly isDemoMode = true;
  private decks: DeckItem[] = [...DEFAULT_DECKS];
  private hasSimulatedFailureFired = false;
  private dictCache = new Map<string, DictLookupResponse>();

  private cards: WordCard[] = [...SEEDED_DEMO_CARDS];

  private cardDeckMap: Record<string, string> = { ...INITIAL_CARD_DECK_MAPPING };

  public getInitialCardDeckMapping(): Record<string, string> {
    return { ...this.cardDeckMap };
  }

  async lookupDictionary(keyword: string): Promise<DictLookupResponse> {
    const clean = keyword.trim();
    if (this.dictCache.has(clean)) {
      return this.dictCache.get(clean)!;
    }
    const card = this.cards.find((c) => c.lemma === clean || c.surface_form === clean);
    const result: DictLookupResponse = {
      lemma: card?.lemma || clean,
      reading: card?.reading || '',
      meaning: card?.meaning || `Sample vocabulary definition for ${clean}`,
      jlpt_level: card?.jlpt_level || 'N3',
      found: true,
    };
    this.dictCache.set(clean, result);
    return result;
  }

  async getDecks(): Promise<DeckItem[]> {
    await this.delay(100);
    return [...this.decks];
  }

  async getWords(deckId?: string): Promise<WordCard[]> {
    await this.delay(150);
    if (!deckId || deckId === 'all') return [...this.cards];
    return this.cards.filter((c) => this.cardDeckMap[c.lemma] === deckId);
  }

  public addCard(card: WordCard, deckId: string): void {
    const idx = this.cards.findIndex((c) => c.lemma === card.lemma);
    if (idx !== -1) {
      this.cards[idx] = { ...this.cards[idx], ...card };
    } else {
      this.cards.push(card);
    }
    this.cardDeckMap[card.lemma] = deckId;
  }

  async submitReview(wordId: string, feedback: ReviewFeedback): Promise<ReviewResult> {
    await this.delay(350);

    const statusMap: Record<ReviewFeedback, string> = {
      forgot: 'New',
      hard: 'Learning',
      good: 'Known',
      easy: 'Mastered',
    };
    const nextStatus = statusMap[feedback];

    const targetIndex = this.cards.findIndex((c) => c.lemma === wordId);
    let prevStatus = 'New';

    if (targetIndex !== -1) {
      const currentCard = this.cards[targetIndex];
      prevStatus = currentCard.status;

      // SCRIPTED FAILURE DEMO: Intentionally reject review on the first card on each deck for the first attempt
      if ((wordId === 'カフェ' || wordId === '見据える' || wordId === 'ハマる') && !this.hasSimulatedFailureFired) {
        this.hasSimulatedFailureFired = true;
        return Promise.reject(new Error('Network drop (Demo script: Testing optimistic UI rollback)'));
      }

      // Mutate in-memory card array
      this.cards[targetIndex] = { ...currentCard, status: nextStatus };
    } else {
      // Graceful fallback for dynamic / encounter-saved cards not in seeded set
      this.cards.push({
        lemma: wordId,
        surface_form: wordId,
        reading: wordId,
        meaning: 'User saved vocabulary card',
        context_sentence: '',
        status: nextStatus,
      });
    }

    return {
      success: true,
      wordId,
      previousStatus: prevStatus,
      newStatus: nextStatus,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
