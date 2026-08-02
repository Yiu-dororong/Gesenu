import type { DeckItem, WordCard } from '../types/app';

export const API_BASE = import.meta.env.VITE_API_BASE || '';

export const NEXT_STATUS: Record<string, string> = {
  New: 'Learning',
  Learning: 'Known',
  Known: 'Mastered',
  Mastered: 'New',
};

export const SAMPLE_SENTENCES = [
  '複雑な文法構造を分解すれば、どんな難文でも解せるようになる。',
  'なぜ彼が急に辞職したのか、理由がどうしても解せぬ。',
  '単語を単体で覚えるのではなく、文脈の中で記憶することが大切だ。',
];

export const DEFAULT_DECKS: DeckItem[] = [
  {
    id: 'matsu',
    jp: '松',
    en: 'Everyday Basics',
    color: 'var(--pine)',
    stubCount: 14,
    stubDue: 4,
    motifSvg: (
      <svg className="motif" viewBox="0 0 40 40" fill="none">
        <path d="M20 4 L24 16 L34 14 L26 22 L32 30 L22 26 L20 36 L18 26 L8 30 L14 22 L6 14 L16 16 Z" fill="#F2E9DA" opacity="0.85" />
      </svg>
    ),
  },
  {
    id: 'sakura',
    jp: '桜',
    en: 'First Encounters',
    color: 'var(--sakura)',
    stubCount: 8,
    stubDue: 3,
    motifSvg: (
      <svg className="motif" viewBox="0 0 40 40" fill="none">
        <g fill="#F2E9DA" opacity="0.9">
          <circle cx="20" cy="10" r="6" />
          <circle cx="30" cy="17" r="6" />
          <circle cx="26" cy="29" r="6" />
          <circle cx="14" cy="29" r="6" />
          <circle cx="10" cy="17" r="6" />
        </g>
        <circle cx="20" cy="20" r="4" fill="var(--sakura)" />
      </svg>
    ),
  },
  {
    id: 'tsuki',
    jp: '月',
    en: 'Night Reading',
    color: 'var(--moon)',
    stubCount: 12,
    stubDue: 0,
    motifSvg: (
      <svg className="motif" viewBox="0 0 40 40" fill="none">
        <path d="M24 6 A15 15 0 1 0 24 34 A11.5 11.5 0 0 1 24 6 Z" fill="#F2E9DA" opacity="0.9" />
      </svg>
    ),
  },
  {
    id: 'kaede',
    jp: '楓',
    en: 'JLPT Core',
    color: 'var(--maple)',
    stubCount: 19,
    stubDue: 7,
    motifSvg: (
      <svg className="motif" viewBox="0 0 40 40" fill="none">
        <path d="M20 2 L23 14 L33 6 L27 17 L38 19 L27 22 L33 33 L23 26 L20 38 L17 26 L7 33 L13 22 L2 19 L13 17 L7 6 L17 14 Z" fill="#F2E9DA" opacity="0.85" />
      </svg>
    ),
  },
  {
    id: 'kiku',
    jp: '菊',
    en: 'Demo & Test Data',
    color: 'var(--plum)',
    stubCount: 5,
    stubDue: 3,
    motifSvg: (
      <svg className="motif" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="12" stroke="#F2E9DA" strokeWidth="2" opacity="0.85" />
        <circle cx="20" cy="20" r="5" fill="#F2E9DA" opacity="0.9" />
      </svg>
    ),
  },
];

export const SEEDED_DEMO_CARDS: WordCard[] = [
  {
    lemma: '解せる',
    reading: 'ほぐせる / かいせる',
    meaning: 'to understand; to comprehend; to be clear',
    jlpt_level: 'N2',
    context_sentence: '複雑な文法構造を分解すれば、どんな難文でも解せるようになる。',
    status: 'Learning',
  },
  {
    lemma: '解せぬ',
    reading: 'げせぬ',
    meaning: "incomprehensible; cannot understand; doesn't make sense",
    jlpt_level: 'N1',
    context_sentence: 'なぜ彼が急に辞職したのか、理由がどうしても解せぬ。',
    status: 'New',
  },
  {
    lemma: '分解',
    reading: 'ぶんかい',
    meaning: 'disassembly; parsing; resolution',
    jlpt_level: 'N3',
    context_sentence: '複雑な文法構造を分解すれば、どんな難文でも解せるようになる。',
    status: 'New',
  },
  {
    lemma: '記憶',
    reading: 'きおく',
    meaning: 'memory; recollection; retention',
    jlpt_level: 'N3',
    context_sentence: '単語を単体で覚えるのではなく、文脈の中で記憶することが大切だ。',
    status: 'Known',
  },
  {
    lemma: '構造',
    reading: 'こうぞう',
    meaning: 'structure; construction; organization',
    jlpt_level: 'N2',
    context_sentence: '複雑な文法構造を分解すれば、どんな難文でも解せるようになる。',
    status: 'Learning',
  },
  {
    lemma: '難文',
    reading: 'なんぶん',
    meaning: 'difficult sentence; obscure text',
    jlpt_level: 'N1',
    context_sentence: '複雑な文法構造を分解すれば、どんな難文でも解せるようになる。',
    status: 'New',
  },
  {
    lemma: '辞職',
    reading: 'じしょく',
    meaning: 'resignation',
    jlpt_level: 'N2',
    context_sentence: 'なぜ彼が急に辞職したのか、理由がどうしても解せぬ。',
    status: 'New',
  },
  {
    lemma: '文脈',
    reading: 'ぶんみゃく',
    meaning: 'context (of a sentence or statement)',
    jlpt_level: 'N2',
    context_sentence: '単語を単体で覚えるのではなく、文脈の中で記憶することが大切だ。',
    status: 'Learning',
  },
];
