import type { GesenuAPI, ReviewFeedback, ReviewResult } from './types';
import type { DeckItem, WordCard } from '../../types/app';
import { DEFAULT_DECKS, SEEDED_DEMO_CARDS } from '../../constants/decks';

export class DemoAPI implements GesenuAPI {
  public readonly isDemoMode = true;
  private decks: DeckItem[] = [...DEFAULT_DECKS];
  private hasSimulatedFailureFired = false;

  private cards: WordCard[] = [...SEEDED_DEMO_CARDS];

  private cardDeckMap: Record<string, string> = {
    // Theme 1: Work (Sentence 3: 曖昧だったコンセプト...)
    見据える: 'work',
    現象: 'work',
    じわじわ: 'work',
    コンセプト: 'work',
    曖昧: 'work',

    // Theme 2: Life (Sentence 2: 最近ハマっているアイドル...)
    ハマる: 'life',
    かわいい: 'life',
    推し: 'life',
    キラキラ: 'life',
    アイドル: 'life',

    // Theme 3: Leisure (Sentence 1: 天気予報を確認して...)
    天気予報: 'leisure',
    散歩: 'leisure',
    カフェ: 'leisure',
    ぶらぶら: 'leisure',
    良い: 'leisure',
  };

  public getInitialCardDeckMapping(): Record<string, string> {
    return { ...this.cardDeckMap };
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

      // SCRIPTED FAILURE DEMO: Intentionally reject review on "社会現象" for the first attempt
      if ((wordId === '社会現象' || wordId === '分解') && !this.hasSimulatedFailureFired) {
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
