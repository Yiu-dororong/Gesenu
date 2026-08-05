import type { GesenuAPI, ReviewFeedback, ReviewResult } from './types';
import type { DeckItem, WordCard } from '../../types/app';
import { DEFAULT_DECKS, SEEDED_DEMO_CARDS } from '../../constants/decks';

export class DemoAPI implements GesenuAPI {
  public readonly isDemoMode = true;
  private decks: DeckItem[] = [...DEFAULT_DECKS];
  private hasSimulatedFailureFired = false;

  private cards: WordCard[] = [...SEEDED_DEMO_CARDS];

  private cardDeckMap: Record<string, string> = {
    // Theme 1: Work / Business / Projects
    見据える: 'work',
    社会現象: 'work',
    現象: 'work',
    じわじわ: 'work',
    コンセプト: 'work',
    曖昧: 'work',
    複雑: 'work',
    着々: 'work',
    取り組む: 'work',
    プロジェクト: 'work',
    現場: 'work',
    課題解決: 'work',
    解決: 'work',
    直接: 'work',
    目指す: 'work',

    // Theme 2: Life / Daily Fatigue / Inner Emotion
    草臥れる: 'life',
    買い物: 'life',
    買い物する: 'life',
    うろうろ: 'life',
    コンビニ: 'life',
    面倒臭い: 'life',
    料理: 'life',
    作る: 'life',
    様子: 'life',
    街: 'life',
    後: 'life',
    昔: 'life',
    思い出: 'life',
    振り返る: 'life',
    泣く: 'life',
    切ない: 'life',
    気持ち: 'life',
    反面: 'life',
    心: 'life',
    ドキドキ: 'life',
    感じる: 'life',
    メンタル: 'life',
    保つ: 'life',

    // Theme 3: Leisure / Outings / Pop Culture
    天気予報: 'leisure',
    天気: 'leisure',
    散歩: 'leisure',
    散歩する: 'leisure',
    ぶらぶら: 'leisure',
    カフェ: 'leisure',
    周り: 'leisure',
    歩く: 'leisure',
    過ごす: 'leisure',
    良い: 'leisure',
    最近: 'leisure',
    ハマる: 'leisure',
    仕草: 'leisure',
    かわいい: 'leisure',
    推し: 'leisure',
    キラキラ: 'leisure',
    輝く: 'leisure',
    アイドル: 'leisure',
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

  async submitReview(wordId: string, feedback: ReviewFeedback): Promise<ReviewResult> {
    await this.delay(350);

    const targetIndex = this.cards.findIndex((c) => c.lemma === wordId);
    if (targetIndex === -1) {
      throw new Error(`Word "${wordId}" not found in demo session.`);
    }

    const currentCard = this.cards[targetIndex];
    const prevStatus = currentCard.status;

    // SCRIPTED FAILURE DEMO: Intentionally reject review on "社会現象" for the first attempt
    if ((wordId === '社会現象' || wordId === '分解') && !this.hasSimulatedFailureFired) {
      this.hasSimulatedFailureFired = true;
      return Promise.reject(new Error('Network drop (Demo script: Testing optimistic UI rollback)'));
    }

    const statusMap: Record<ReviewFeedback, string> = {
      forgot: 'New',
      hard: 'Learning',
      good: 'Known',
      easy: 'Mastered',
    };
    const nextStatus = statusMap[feedback];

    // Mutate in-memory card array
    this.cards[targetIndex] = { ...currentCard, status: nextStatus };

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
