import type { DeckItem, WordCard, TokenItem } from '../types/app';

export const API_BASE = import.meta.env.VITE_API_BASE || '';

export const NEXT_STATUS: Record<string, string> = {
  New: 'Learning',
  Learning: 'Known',
  Known: 'Mastered',
  Mastered: 'New',
};

// 3 Sample sentences for Encounter Mode
export const SAMPLE_SENTENCES = [
  'コンビニで買い物してきた後、くたびれた様子で街をうろうろしているのは、料理を作るのが面倒くさかったからだ。',
  '昔の思い出を振り返って泣きそうになったが、切なかった気持ちの反面、心はドキドキしているのを感じてメンタルを保った。',
  '複雑ではないけれど着々と取り組んでいるこのプロジェクトは、現場の課題解決を直接目指している。',
];

export const DEMO_PARSE_MAP: Record<string, TokenItem[]> = {
  'コンビニで買い物してきた後、くたびれた様子で街をうろうろしているのは、料理を作るのが面倒くさかったからだ。': [
    { surface: 'コンビニ', lemma: 'コンビニ', reading: 'こんびに', pos: '名詞', pos_detail: '名詞-普通名詞', span_start: 0, span_end: 4, is_selectable: true, meaning: 'convenience store', jlpt_level: 'N4' },
    { surface: 'で', lemma: 'で', reading: 'で', pos: '助詞', pos_detail: '助詞-格助詞', span_start: 4, span_end: 5, is_selectable: false },
    { surface: '買い物', lemma: '買い物', reading: 'かいもの', pos: '名詞', pos_detail: '名詞-普通名詞', span_start: 5, span_end: 8, is_selectable: true, meaning: 'shopping; purchased goods', jlpt_level: 'N5' },
    { surface: 'し', lemma: '為る', reading: 'し', pos: '動詞', pos_detail: '動詞-非自立可能', span_start: 8, span_end: 9, is_selectable: false },
    { surface: 'て', lemma: 'て', reading: 'て', pos: '助詞', pos_detail: '助詞-接続助詞', span_start: 9, span_end: 10, is_selectable: false },
    { surface: 'き', lemma: '来る', reading: 'き', pos: '動詞', pos_detail: '動詞-非自立可能', span_start: 10, span_end: 11, is_selectable: false },
    { surface: 'た', lemma: 'た', reading: 'た', pos: '助動詞', pos_detail: '助動詞-*', span_start: 11, span_end: 12, is_selectable: false },
    { surface: '後', lemma: '後', reading: 'あと', pos: '名詞', pos_detail: '名詞-普通名詞', span_start: 12, span_end: 13, is_selectable: true, meaning: 'after; behind; remainder', jlpt_level: 'N5' },
    { surface: '、', lemma: '、', reading: '、', pos: '補助記号', pos_detail: '補助記号-読点', span_start: 13, span_end: 14, is_selectable: false },
    { surface: 'くたびれ', lemma: '草臥れる', reading: 'くたびれ', pos: '動詞', pos_detail: '動詞-一般', span_start: 14, span_end: 18, is_selectable: true, meaning: 'to get tired; to be exhausted; to wear out', jlpt_level: 'N2' },
    { surface: 'た', lemma: 'た', reading: 'た', pos: '助動詞', pos_detail: '助動詞-*', span_start: 18, span_end: 19, is_selectable: false },
    { surface: '様子', lemma: '様子', reading: 'ようす', pos: '名詞', pos_detail: '名詞-普通名詞', span_start: 19, span_end: 21, is_selectable: true, meaning: 'state; appearance; situation; condition', jlpt_level: 'N3' },
    { surface: 'で', lemma: 'で', reading: 'で', pos: '助詞', pos_detail: '助詞-格助詞', span_start: 21, span_end: 22, is_selectable: false },
    { surface: '街', lemma: '街', reading: 'まち', pos: '名詞', pos_detail: '名詞-普通名詞', span_start: 22, span_end: 23, is_selectable: true, meaning: 'town; city; street', jlpt_level: 'N4' },
    { surface: 'を', lemma: 'を', reading: 'を', pos: '助詞', pos_detail: '助詞-格助詞', span_start: 23, span_end: 24, is_selectable: false },
    { surface: 'うろうろ', lemma: 'うろうろ', reading: 'うろうろ', pos: '副詞', pos_detail: '副詞-*', span_start: 24, span_end: 28, is_selectable: true, meaning: 'wandering aimlessly; loitering', jlpt_level: 'N3' },
    { surface: 'し', lemma: '為る', reading: 'し', pos: '動詞', pos_detail: '動詞-非自立可能', span_start: 28, span_end: 29, is_selectable: false },
    { surface: 'て', lemma: 'て', reading: 'て', pos: '助詞', pos_detail: '助詞-接続助詞', span_start: 29, span_end: 30, is_selectable: false },
    { surface: 'いる', lemma: '居る', reading: 'いる', pos: '動詞', pos_detail: '動詞-非自立可能', span_start: 30, span_end: 32, is_selectable: false },
    { surface: 'の', lemma: 'の', reading: 'の', pos: '助詞', pos_detail: '助詞-準体助詞', span_start: 32, span_end: 33, is_selectable: false },
    { surface: 'は', lemma: 'は', reading: 'は', pos: '助詞', pos_detail: '助詞-係助詞', span_start: 33, span_end: 34, is_selectable: false },
    { surface: '、', lemma: '、', reading: '、', pos: '補助記号', pos_detail: '補助記号-読点', span_start: 34, span_end: 35, is_selectable: false },
    { surface: '料理', lemma: '料理', reading: 'りょうり', pos: '名詞', pos_detail: '名詞-普通名詞', span_start: 35, span_end: 37, is_selectable: true, meaning: 'cooking; cuisine; dish', jlpt_level: 'N5' },
    { surface: 'を', lemma: 'を', reading: 'を', pos: '助詞', pos_detail: '助詞-格助詞', span_start: 37, span_end: 38, is_selectable: false },
    { surface: '作る', lemma: '作る', reading: 'つくる', pos: '動詞', pos_detail: '動詞-一般', span_start: 38, span_end: 40, is_selectable: true, meaning: 'to make; to produce; to manufacture', jlpt_level: 'N5' },
    { surface: 'の', lemma: 'の', reading: 'の', pos: '助詞', pos_detail: '助詞-準体助詞', span_start: 40, span_end: 41, is_selectable: false },
    { surface: 'が', lemma: 'が', reading: 'が', pos: '助詞', pos_detail: '助詞-格助詞', span_start: 41, span_end: 42, is_selectable: false },
    { surface: '面倒くさかっ', lemma: '面倒臭い', reading: 'めんどうくさかっ', pos: '形容詞', pos_detail: '形容詞-一般', span_start: 42, span_end: 48, is_selectable: true, meaning: 'bothersome; hassle; tiresome', jlpt_level: 'N3' },
    { surface: 'た', lemma: 'た', reading: 'た', pos: '助動詞', pos_detail: '助動詞-*', span_start: 48, span_end: 49, is_selectable: false },
    { surface: 'から', lemma: 'から', reading: 'から', pos: '助詞', pos_detail: '助詞-接続助詞', span_start: 49, span_end: 51, is_selectable: false },
    { surface: 'だ', lemma: 'だ', reading: 'だ', pos: '助動詞', pos_detail: '助動詞-*', span_start: 51, span_end: 52, is_selectable: false },
    { surface: '。', lemma: '。', reading: '。', pos: '補助記号', pos_detail: '補助記号-句点', span_start: 52, span_end: 53, is_selectable: false },
  ],
  '昔の思い出を振り返って泣きそうになったが、切なかった気持ちの反面、心はドキドキしているのを感じてメンタルを保った。': [
    { surface: '昔', lemma: '昔', reading: 'むかし', pos: '名詞', pos_detail: '名詞-普通名詞', span_start: 0, span_end: 1, is_selectable: true, meaning: 'old times; ancient times; past', jlpt_level: 'N4' },
    { surface: 'の', lemma: 'の', reading: 'の', pos: '助詞', pos_detail: '助詞-格助詞', span_start: 1, span_end: 2, is_selectable: false },
    { surface: '思い出', lemma: '思い出', reading: 'おもいで', pos: '名詞', pos_detail: '名詞-普通名詞', span_start: 2, span_end: 5, is_selectable: true, meaning: 'memories; recollections; reminiscences', jlpt_level: 'N4' },
    { surface: 'を', lemma: 'を', reading: 'を', pos: '助詞', pos_detail: '助詞-格助詞', span_start: 5, span_end: 6, is_selectable: false },
    { surface: '振り返っ', lemma: '振り返る', reading: 'ふりかえっ', pos: '動詞', pos_detail: '動詞-一般', span_start: 6, span_end: 10, is_selectable: true, meaning: 'to turn head; to look back; to reflect on', jlpt_level: 'N2' },
    { surface: 'て', lemma: 'て', reading: 'て', pos: '助詞', pos_detail: '助詞-接続助詞', span_start: 10, span_end: 11, is_selectable: false },
    { surface: '泣き', lemma: '泣く', reading: 'なき', pos: '動詞', pos_detail: '動詞-一般', span_start: 11, span_end: 13, is_selectable: true, meaning: 'to cry; to weep; to sob', jlpt_level: 'N5' },
    { surface: 'そう', lemma: 'そう', reading: 'そう', pos: '形状詞', pos_detail: '形状詞-助動詞語幹', span_start: 13, span_end: 15, is_selectable: true, meaning: 'appearing to be; looking like' },
    { surface: 'に', lemma: 'だ', reading: 'に', pos: '助動詞', pos_detail: '助動詞-*', span_start: 15, span_end: 16, is_selectable: false },
    { surface: 'なっ', lemma: '成る', reading: 'なっ', pos: '動詞', pos_detail: '動詞-非自立可能', span_start: 16, span_end: 18, is_selectable: false },
    { surface: 'た', lemma: 'た', reading: 'た', pos: '助動詞', pos_detail: '助動詞-*', span_start: 18, span_end: 19, is_selectable: false },
    { surface: 'が', lemma: 'が', reading: 'が', pos: '助詞', pos_detail: '助詞-接続助詞', span_start: 19, span_end: 20, is_selectable: false },
    { surface: '、', lemma: '、', reading: '、', pos: '補助記号', pos_detail: '補助記号-読点', span_start: 20, span_end: 21, is_selectable: false },
    { surface: '切なかっ', lemma: '切ない', reading: 'せつなかっ', pos: '形容詞', pos_detail: '形容詞-一般', span_start: 21, span_end: 25, is_selectable: true, meaning: 'painful; bittersweet; heartrending', jlpt_level: 'N3' },
    { surface: 'た', lemma: 'た', reading: 'た', pos: '助動詞', pos_detail: '助動詞-*', span_start: 25, span_end: 26, is_selectable: false },
    { surface: '気持ち', lemma: '気持ち', reading: 'きもち', pos: '名詞', pos_detail: '名詞-普通名詞', span_start: 26, span_end: 29, is_selectable: true, meaning: 'feeling; sensation; mood; attitude', jlpt_level: 'N4' },
    { surface: 'の', lemma: 'の', reading: 'の', pos: '助詞', pos_detail: '助詞-格助詞', span_start: 29, span_end: 30, is_selectable: false },
    { surface: '反面', lemma: '反面', reading: 'はんめん', pos: '名詞', pos_detail: '名詞-普通名詞', span_start: 30, span_end: 32, is_selectable: true, meaning: 'on the other hand; converse; flip side', jlpt_level: 'N2' },
    { surface: '、', lemma: '、', reading: '、', pos: '補助記号', pos_detail: '補助記号-読点', span_start: 32, span_end: 33, is_selectable: false },
    { surface: '心', lemma: '心', reading: 'こころ', pos: '名詞', pos_detail: '名詞-普通名詞', span_start: 33, span_end: 34, is_selectable: true, meaning: 'heart; mind; spirit; core', jlpt_level: 'N4' },
    { surface: 'は', lemma: 'は', reading: 'は', pos: '助詞', pos_detail: '助詞-係助詞', span_start: 34, span_end: 35, is_selectable: false },
    { surface: 'ドキドキ', lemma: 'どきどき', reading: 'どきどき', pos: '副詞', pos_detail: '副詞-*', span_start: 35, span_end: 39, is_selectable: true, meaning: 'thumping; throb; beat fast', jlpt_level: 'N3' },
    { surface: 'し', lemma: '為る', reading: 'し', pos: '動詞', pos_detail: '動詞-非自立可能', span_start: 39, span_end: 40, is_selectable: false },
    { surface: 'て', lemma: 'て', reading: 'て', pos: '助詞', pos_detail: '助詞-接続助詞', span_start: 40, span_end: 41, is_selectable: false },
    { surface: 'いる', lemma: '居る', reading: 'いる', pos: '動詞', pos_detail: '動詞-非自立可能', span_start: 41, span_end: 43, is_selectable: false },
    { surface: 'の', lemma: 'の', reading: 'の', pos: '助詞', pos_detail: '助詞-準体助詞', span_start: 43, span_end: 44, is_selectable: false },
    { surface: 'を', lemma: 'を', reading: 'を', pos: '助詞', pos_detail: '助詞-格助詞', span_start: 44, span_end: 45, is_selectable: false },
    { surface: '感じ', lemma: '感じる', reading: 'かんじ', pos: '動詞', pos_detail: '動詞-一般', span_start: 45, span_end: 47, is_selectable: true, meaning: 'to feel; to sense; to experience', jlpt_level: 'N4' },
    { surface: 'て', lemma: 'て', reading: 'て', pos: '助詞', pos_detail: '助詞-接続助詞', span_start: 47, span_end: 48, is_selectable: false },
    { surface: 'メンタル', lemma: 'メンタル', reading: 'めんたる', pos: '名詞', pos_detail: '名詞-普通名詞', span_start: 48, span_end: 52, is_selectable: true, meaning: 'mental state; mentality', jlpt_level: 'N2' },
    { surface: 'を', lemma: 'を', reading: 'を', pos: '助詞', pos_detail: '助詞-格助詞', span_start: 52, span_end: 53, is_selectable: false },
    { surface: '保っ', lemma: '保つ', reading: 'たもっ', pos: '動詞', pos_detail: '動詞-一般', span_start: 53, span_end: 55, is_selectable: true, meaning: 'to keep; to maintain; to preserve', jlpt_level: 'N2' },
    { surface: 'た', lemma: 'た', reading: 'た', pos: '助動詞', pos_detail: '助動詞-*', span_start: 55, span_end: 56, is_selectable: false },
    { surface: '。', lemma: '。', reading: '。', pos: '補助記号', pos_detail: '補助記号-句点', span_start: 56, span_end: 57, is_selectable: false },
  ],
  '複雑ではないけれど着々と取り組んでいるこのプロジェクトは、現場の課題解決を直接目指している。': [
    { surface: '複雑', lemma: '複雑', reading: 'ふくざつ', pos: '名詞', pos_detail: '名詞-普通名詞', span_start: 0, span_end: 2, is_selectable: true, meaning: 'complex; complicated; intricate', jlpt_level: 'N3' },
    { surface: 'で', lemma: 'だ', reading: 'で', pos: '助動詞', pos_detail: '助動詞-*', span_start: 2, span_end: 3, is_selectable: false },
    { surface: 'は', lemma: 'は', reading: 'は', pos: '助詞', pos_detail: '助詞-係助詞', span_start: 3, span_end: 4, is_selectable: false },
    { surface: 'ない', lemma: '無い', reading: 'ない', pos: '形容詞', pos_detail: '形容詞-非自立可能', span_start: 4, span_end: 6, is_selectable: false },
    { surface: 'けれど', lemma: 'けれど', reading: 'けれど', pos: '助詞', pos_detail: '助詞-接続助詞', span_start: 6, span_end: 9, is_selectable: false },
    { surface: '着々', lemma: '着々', reading: 'ちゃくちゃく', pos: '副詞', pos_detail: '副詞-*', span_start: 9, span_end: 11, is_selectable: true, meaning: 'steadily; step by step', jlpt_level: 'N2' },
    { surface: 'と', lemma: 'と', reading: 'と', pos: '助詞', pos_detail: '助詞-格助詞', span_start: 11, span_end: 12, is_selectable: false },
    { surface: '取り組ん', lemma: '取り組む', reading: 'とりくん', pos: '動詞', pos_detail: '動詞-一般', span_start: 12, span_end: 16, is_selectable: true, meaning: 'to tackle; to work on; to wrestle with', jlpt_level: 'N2' },
    { surface: 'で', lemma: 'で', reading: 'で', pos: '助詞', pos_detail: '助詞-接続助詞', span_start: 16, span_end: 17, is_selectable: false },
    { surface: 'いる', lemma: '居る', reading: 'いる', pos: '動詞', pos_detail: '動詞-非自立可能', span_start: 17, span_end: 19, is_selectable: false },
    { surface: 'この', lemma: '此の', reading: 'この', pos: '連体詞', pos_detail: '連体詞-*', span_start: 19, span_end: 21, is_selectable: true, meaning: 'this' },
    { surface: 'プロジェクト', lemma: 'プロジェクト', reading: 'ぷろじぇくと', pos: '名詞', pos_detail: '名詞-普通名詞', span_start: 21, span_end: 27, is_selectable: true, meaning: 'project', jlpt_level: 'N3' },
    { surface: 'は', lemma: 'は', reading: 'は', pos: '助詞', pos_detail: '助詞-係助詞', span_start: 27, span_end: 28, is_selectable: false },
    { surface: '、', lemma: '、', reading: '、', pos: '補助記号', pos_detail: '補助記号-読点', span_start: 28, span_end: 29, is_selectable: false },
    { surface: '現場', lemma: '現場', reading: 'げんば', pos: '名詞', pos_detail: '名詞-普通名詞', span_start: 29, span_end: 31, is_selectable: true, meaning: 'actual spot; job site; scene; field', jlpt_level: 'N2' },
    { surface: 'の', lemma: 'の', reading: 'の', pos: '助詞', pos_detail: '助詞-格助詞', span_start: 31, span_end: 32, is_selectable: false },
    { surface: '課題解決', lemma: '課題解決', reading: 'かだいかいけつ', pos: '名詞', pos_detail: '名詞-普通名詞', span_start: 32, span_end: 36, is_selectable: true, meaning: 'problem solving; issue resolution', jlpt_level: 'N2' },
    { surface: 'を', lemma: 'を', reading: 'を', pos: '助詞', pos_detail: '助詞-格助詞', span_start: 36, span_end: 37, is_selectable: false },
    { surface: '直接', lemma: '直接', reading: 'ちょくせつ', pos: '副詞', pos_detail: '副詞-*', span_start: 37, span_end: 39, is_selectable: true, meaning: 'direct; immediate; personal', jlpt_level: 'N2' },
    { surface: '目指し', lemma: '目指す', reading: 'めざし', pos: '動詞', pos_detail: '動詞-一般', span_start: 39, span_end: 42, is_selectable: true, meaning: 'to aim for; to head toward', jlpt_level: 'N2' },
    { surface: 'て', lemma: 'て', reading: 'て', pos: '助詞', pos_detail: '助詞-接続助詞', span_start: 42, span_end: 43, is_selectable: false },
    { surface: 'いる', lemma: '居る', reading: 'いる', pos: '動詞', pos_detail: '動詞-非自立可能', span_start: 43, span_end: 45, is_selectable: false },
    { surface: '。', lemma: '。', reading: '。', pos: '補助記号', pos_detail: '補助記号-句点', span_start: 45, span_end: 46, is_selectable: false },
  ],
  '天気予報を確認して「散歩しましょう」と誘い、カフェの周りをぶらぶら歩いて過ごせて本当に良かった。': [
    { surface: '天気予報', lemma: '天気予報', reading: 'てんきよほう', pos: '名詞', pos_detail: '名詞-普通名詞', span_start: 0, span_end: 4, is_selectable: true, meaning: 'weather forecast', jlpt_level: 'N4' },
    { surface: 'を', lemma: 'を', reading: 'を', pos: '助詞', pos_detail: '助詞-格助詞', span_start: 4, span_end: 5, is_selectable: false },
    { surface: '確認', lemma: '確認', reading: 'かくにん', pos: '名詞', pos_detail: '名詞-普通名詞', span_start: 5, span_end: 7, is_selectable: true, meaning: 'confirmation; verification' },
    { surface: 'し', lemma: '為る', reading: 'し', pos: '動詞', pos_detail: '動詞-非自立可能', span_start: 7, span_end: 8, is_selectable: false },
    { surface: 'て', lemma: 'て', reading: 'て', pos: '助詞', pos_detail: '助詞-接続助詞', span_start: 8, span_end: 9, is_selectable: false },
    { surface: '「', lemma: '「', reading: '「', pos: '補助記号', pos_detail: '補助記号-括弧開', span_start: 9, span_end: 10, is_selectable: false },
    { surface: '散歩', lemma: '散歩', reading: 'さんぽ', pos: '名詞', pos_detail: '名詞-普通名詞', span_start: 10, span_end: 12, is_selectable: true, meaning: 'walk; stroll', jlpt_level: 'N5' },
    { surface: 'し', lemma: '為る', reading: 'し', pos: '動詞', pos_detail: '動詞-非自立可能', span_start: 12, span_end: 13, is_selectable: false },
    { surface: 'ましょう', lemma: 'ます', reading: 'ましょう', pos: '助動詞', pos_detail: '助動詞-*', span_start: 13, span_end: 17, is_selectable: false },
    { surface: '」', lemma: '」', reading: '」', pos: '補助記号', pos_detail: '補助記号-括弧閉', span_start: 17, span_end: 18, is_selectable: false },
    { surface: 'と', lemma: 'と', reading: 'と', pos: '助詞', pos_detail: '助詞-格助詞', span_start: 18, span_end: 19, is_selectable: false },
    { surface: '誘い', lemma: '誘う', reading: 'さそい', pos: '動詞', pos_detail: '動詞-一般', span_start: 19, span_end: 21, is_selectable: true, meaning: 'to invite; to ask; to tempt' },
    { surface: '、', lemma: '、', reading: '、', pos: '補助記号', pos_detail: '補助記号-読点', span_start: 21, span_end: 22, is_selectable: false },
    { surface: 'カフェ', lemma: 'カフェ', reading: 'かふぇ', pos: '名詞', pos_detail: '名詞-普通名詞', span_start: 22, span_end: 25, is_selectable: true, meaning: 'cafe; coffee shop', jlpt_level: 'N4' },
    { surface: 'の', lemma: 'の', reading: 'の', pos: '助詞', pos_detail: '助詞-格助詞', span_start: 25, span_end: 26, is_selectable: false },
    { surface: '周り', lemma: '周り', reading: 'まわり', pos: '名詞', pos_detail: '名詞-普通名詞', span_start: 26, span_end: 28, is_selectable: true, meaning: 'surroundings; vicinity; circumference', jlpt_level: 'N4' },
    { surface: 'を', lemma: 'を', reading: 'を', pos: '助詞', pos_detail: '助詞-格助詞', span_start: 28, span_end: 29, is_selectable: false },
    { surface: 'ぶらぶら', lemma: 'ぶらぶら', reading: 'ぶらぶら', pos: '副詞', pos_detail: '副詞-*', span_start: 29, span_end: 33, is_selectable: true, meaning: 'aimlessly; wandering; dangling', jlpt_level: 'N3' },
    { surface: '歩い', lemma: '歩く', reading: 'あるい', pos: '動詞', pos_detail: '動詞-一般', span_start: 33, span_end: 35, is_selectable: true, meaning: 'to walk', jlpt_level: 'N5' },
    { surface: 'て', lemma: 'て', reading: 'て', pos: '助詞', pos_detail: '助詞-接続助詞', span_start: 35, span_end: 36, is_selectable: false },
    { surface: '過ごせ', lemma: '過ごす', reading: 'すごせ', pos: '動詞', pos_detail: '動詞-一般', span_start: 36, span_end: 39, is_selectable: true, meaning: 'to pass time; to spend time', jlpt_level: 'N3' },
    { surface: 'て', lemma: 'て', reading: 'て', pos: '助詞', pos_detail: '助詞-接続助詞', span_start: 39, span_end: 40, is_selectable: false },
    { surface: '本当', lemma: '本当', reading: 'ほんとう', pos: '名詞', pos_detail: '名詞-普通名詞', span_start: 40, span_end: 42, is_selectable: true, meaning: 'truth; reality; genuine' },
    { surface: 'に', lemma: 'に', reading: 'に', pos: '助詞', pos_detail: '助詞-格助詞', span_start: 42, span_end: 43, is_selectable: false },
    { surface: '良かっ', lemma: '良い', reading: 'よかっ', pos: '形容詞', pos_detail: '形容詞-非自立可能', span_start: 43, span_end: 46, is_selectable: true, meaning: 'good; fine; glad', jlpt_level: 'N5' },
    { surface: 'た', lemma: 'た', reading: 'た', pos: '助動詞', pos_detail: '助動詞-*', span_start: 46, span_end: 47, is_selectable: false },
    { surface: '。', lemma: '。', reading: '。', pos: '補助記号', pos_detail: '補助記号-句点', span_start: 47, span_end: 48, is_selectable: false },
  ],
  '最近ハマっているアイドルは、仕草がかわいすぎるうえにキラキラ輝いていて、まさに最高の推しだ。': [
    { surface: '最近', lemma: '最近', reading: 'さいきん', pos: '名詞', pos_detail: '名詞-普通名詞', span_start: 0, span_end: 2, is_selectable: true, meaning: 'recently; lately; these days', jlpt_level: 'N4' },
    { surface: 'ハマっ', lemma: '嵌まる', reading: 'はまっ', pos: '動詞', pos_detail: '動詞-一般', span_start: 2, span_end: 5, is_selectable: true, meaning: 'to be hooked on; to be obsessed with', jlpt_level: 'N2' },
    { surface: 'て', lemma: 'て', reading: 'て', pos: '助詞', pos_detail: '助詞-接続助詞', span_start: 5, span_end: 6, is_selectable: false },
    { surface: 'いる', lemma: '居る', reading: 'いる', pos: '動詞', pos_detail: '動詞-非自立可能', span_start: 6, span_end: 8, is_selectable: false },
    { surface: 'アイドル', lemma: 'アイドル', reading: 'あいどる', pos: '名詞', pos_detail: '名詞-普通名詞', span_start: 8, span_end: 12, is_selectable: true, meaning: 'pop idol', jlpt_level: 'N3' },
    { surface: 'は', lemma: 'は', reading: 'は', pos: '助詞', pos_detail: '助詞-係助詞', span_start: 12, span_end: 13, is_selectable: false },
    { surface: '、', lemma: '、', reading: '、', pos: '補助記号', pos_detail: '補助記号-読点', span_start: 13, span_end: 14, is_selectable: false },
    { surface: '仕草', lemma: '仕草', reading: 'しぐさ', pos: '名詞', pos_detail: '名詞-普通名詞', span_start: 14, span_end: 16, is_selectable: true, meaning: 'action; gesture; behavior; mannerism', jlpt_level: 'N2' },
    { surface: 'が', lemma: 'が', reading: 'が', pos: '助詞', pos_detail: '助詞-格助詞', span_start: 16, span_end: 17, is_selectable: false },
    { surface: 'かわい', lemma: '可愛い', reading: 'かわい', pos: '形容詞', pos_detail: '形容詞-一般', span_start: 17, span_end: 20, is_selectable: true, meaning: 'cute; adorable; sweet', jlpt_level: 'N5' },
    { surface: 'すぎる', lemma: '過ぎる', reading: 'すぎる', pos: '動詞', pos_detail: '動詞-非自立可能', span_start: 20, span_end: 23, is_selectable: false },
    { surface: 'うえ', lemma: '上', reading: 'うえ', pos: '名詞', pos_detail: '名詞-普通名詞', span_start: 23, span_end: 25, is_selectable: true, meaning: 'above; on top of; furthermore' },
    { surface: 'に', lemma: 'に', reading: 'に', pos: '助詞', pos_detail: '助詞-格助詞', span_start: 25, span_end: 26, is_selectable: false },
    { surface: 'キラキラ', lemma: 'きらきら', reading: 'きらきら', pos: '副詞', pos_detail: '副詞-*', span_start: 26, span_end: 30, is_selectable: true, meaning: 'sparkling; glittering; shining', jlpt_level: 'N3' },
    { surface: '輝い', lemma: '輝く', reading: 'かがやい', pos: '動詞', pos_detail: '動詞-一般', span_start: 30, span_end: 32, is_selectable: true, meaning: 'to shine; to sparkle; to glitter', jlpt_level: 'N2' },
    { surface: 'て', lemma: 'て', reading: 'て', pos: '助詞', pos_detail: '助詞-接続助詞', span_start: 32, span_end: 33, is_selectable: false },
    { surface: 'い', lemma: '居る', reading: 'い', pos: '動詞', pos_detail: '動詞-非自立可能', span_start: 33, span_end: 34, is_selectable: false },
    { surface: 'て', lemma: 'て', reading: 'て', pos: '助詞', pos_detail: '助詞-接続助詞', span_start: 34, span_end: 35, is_selectable: false },
    { surface: '、', lemma: '、', reading: '、', pos: '補助記号', pos_detail: '補助記号-読点', span_start: 35, span_end: 36, is_selectable: false },
    { surface: 'まさに', lemma: '正に', reading: 'まさに', pos: '副詞', pos_detail: '副詞-*', span_start: 36, span_end: 39, is_selectable: true, meaning: 'just; exactly; right' },
    { surface: '最高', lemma: '最高', reading: 'さいこう', pos: '名詞', pos_detail: '名詞-普通名詞', span_start: 39, span_end: 41, is_selectable: true, meaning: 'highest; supreme; best' },
    { surface: 'の', lemma: 'の', reading: 'の', pos: '助詞', pos_detail: '助詞-格助詞', span_start: 41, span_end: 42, is_selectable: false },
    { surface: '推し', lemma: '推す', reading: 'おし', pos: '動詞', pos_detail: '動詞-一般', span_start: 42, span_end: 44, is_selectable: true, meaning: "one's favorite (member/character); bias", jlpt_level: 'N1' },
    { surface: 'だ', lemma: 'た', reading: 'だ', pos: '助動詞', pos_detail: '助動詞-*', span_start: 44, span_end: 45, is_selectable: false },
    { surface: '。', lemma: '。', reading: '。', pos: '補助記号', pos_detail: '補助記号-句点', span_start: 45, span_end: 46, is_selectable: false },
  ],
  '曖昧だったコンセプトをしっかり見据えているプロジェクトは、じわじわ広がる社会現象へと発展し始めている。': [
    { surface: '曖昧', lemma: '曖昧', reading: 'あいまい', pos: '形状詞', pos_detail: '形状詞-一般', span_start: 0, span_end: 2, is_selectable: true, meaning: 'vague; ambiguous; unclear; fuzzy', jlpt_level: 'N2' },
    { surface: 'だっ', lemma: 'だ', reading: 'だっ', pos: '助動詞', pos_detail: '助動詞-*', span_start: 2, span_end: 4, is_selectable: false },
    { surface: 'た', lemma: 'た', reading: 'た', pos: '助動詞', pos_detail: '助動詞-*', span_start: 4, span_end: 5, is_selectable: false },
    { surface: 'コンセプト', lemma: 'コンセプト', reading: 'こんせぷと', pos: '名詞', pos_detail: '名詞-普通名詞', span_start: 5, span_end: 10, is_selectable: true, meaning: 'concept; general idea', jlpt_level: 'N3' },
    { surface: 'を', lemma: 'を', reading: 'を', pos: '助詞', pos_detail: '助詞-格助詞', span_start: 10, span_end: 11, is_selectable: false },
    { surface: 'しっかり', lemma: '確り', reading: 'しっかり', pos: '副詞', pos_detail: '副詞-*', span_start: 11, span_end: 15, is_selectable: true, meaning: 'firmly; tightly; properly' },
    { surface: '見据え', lemma: '見据える', reading: 'みすえ', pos: '動詞', pos_detail: '動詞-一般', span_start: 15, span_end: 18, is_selectable: true, meaning: "to focus on; to gaze at; to fix one's eyes on", jlpt_level: 'N1' },
    { surface: 'て', lemma: 'て', reading: 'て', pos: '助詞', pos_detail: '助詞-接続助詞', span_start: 18, span_end: 19, is_selectable: false },
    { surface: 'いる', lemma: '居る', reading: 'いる', pos: '動詞', pos_detail: '動詞-非自立可能', span_start: 19, span_end: 21, is_selectable: false },
    { surface: 'プロジェクト', lemma: 'プロジェクト', reading: 'ぷろじぇくと', pos: '名詞', pos_detail: '名詞-普通名詞', span_start: 21, span_end: 27, is_selectable: true, meaning: 'project', jlpt_level: 'N3' },
    { surface: 'は', lemma: 'は', reading: 'は', pos: '助詞', pos_detail: '助詞-係助詞', span_start: 27, span_end: 28, is_selectable: false },
    { surface: '、', lemma: '、', reading: '、', pos: '補助記号', pos_detail: '補助記号-読点', span_start: 28, span_end: 29, is_selectable: false },
    { surface: 'じわじわ', lemma: 'じわじわ', reading: 'じわじわ', pos: '副詞', pos_detail: '副詞-*', span_start: 29, span_end: 33, is_selectable: true, meaning: 'slowly but surely; gradually', jlpt_level: 'N2' },
    { surface: '広がる', lemma: '広がる', reading: 'ひろがる', pos: '動詞', pos_detail: '動詞-一般', span_start: 33, span_end: 36, is_selectable: true, meaning: 'to spread out; to extend' },
    { surface: '社会', lemma: '社会', reading: 'しゃかい', pos: '名詞', pos_detail: '名詞-普通名詞', span_start: 36, span_end: 38, is_selectable: true, meaning: 'society; public; community', jlpt_level: 'N3' },
    { surface: '現象', lemma: '現象', reading: 'げんしょう', pos: '名詞', pos_detail: '名詞-普通名詞', span_start: 38, span_end: 40, is_selectable: true, meaning: 'phenomenon', jlpt_level: 'N2' },
    { surface: 'へ', lemma: 'へ', reading: 'へ', pos: '助詞', pos_detail: '助詞-格助詞', span_start: 40, span_end: 41, is_selectable: false },
    { surface: 'と', lemma: 'と', reading: 'と', pos: '助詞', pos_detail: '助詞-格助詞', span_start: 41, span_end: 42, is_selectable: false },
    { surface: '発展', lemma: '発展', reading: 'はってん', pos: '名詞', pos_detail: '名詞-普通名詞', span_start: 42, span_end: 44, is_selectable: true, meaning: 'development; expansion; growth' },
    { surface: 'し', lemma: '為る', reading: 'し', pos: '動詞', pos_detail: '動詞-非自立可能', span_start: 44, span_end: 45, is_selectable: false },
    { surface: '始め', lemma: '始める', reading: 'はじめ', pos: '動詞', pos_detail: '動詞-非自立可能', span_start: 45, span_end: 47, is_selectable: false },
    { surface: 'て', lemma: 'て', reading: 'て', pos: '助詞', pos_detail: '助詞-接続助詞', span_start: 47, span_end: 48, is_selectable: false },
    { surface: 'いる', lemma: '居る', reading: 'いる', pos: '動詞', pos_detail: '動詞-非自立可能', span_start: 48, span_end: 50, is_selectable: false },
    { surface: '。', lemma: '。', reading: '。', pos: '補助記号', pos_detail: '補助記号-句点', span_start: 50, span_end: 51, is_selectable: false },
  ],
};

export const DEFAULT_DECKS: DeckItem[] = [
  {
    id: 'work',
    jp: '仕事',
    en: 'Work',
    color: 'var(--pine)',
    motifSvg: (
      <svg className="motif" viewBox="0 0 40 40" fill="none">
        <path d="M20 4 L24 16 L34 14 L26 22 L32 30 L22 26 L20 36 L18 26 L8 30 L14 22 L6 14 L16 16 Z" fill="#F2E9DA" opacity="0.85" />
      </svg>
    ),
  },
  {
    id: 'life',
    jp: '日常',
    en: 'Daily',
    color: 'var(--moon)',
    motifSvg: (
      <svg className="motif" viewBox="0 0 40 40" fill="none">
        <path d="M24 6 A15 15 0 1 0 24 34 A11.5 11.5 0 0 1 24 6 Z" fill="#F2E9DA" opacity="0.9" />
      </svg>
    ),
  },
  {
    id: 'leisure',
    jp: '余暇',
    en: 'Leisure',
    color: 'var(--sakura)',
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
];

export const SEEDED_DEMO_CARDS: WordCard[] = [
  // --- WORK DECK (1 Sentence) ---
  {
    lemma: '見据える',
    surface_form: '見据え',
    span_start: 15,
    span_end: 18,
    sentence_id: 'sent-work-1',
    reading: 'みすえる',
    meaning: "to focus on; to set one's eyes on; to gaze at",
    jlpt_level: 'N1',
    context_sentence: '曖昧だったコンセプトをしっかり見据えているプロジェクトは、じわじわ広がる社会現象へと発展し始めている。',
    status: 'New',
  },
  {
    lemma: '現象',
    surface_form: '現象',
    span_start: 38,
    span_end: 40,
    sentence_id: 'sent-work-1',
    reading: 'げんしょう',
    meaning: 'phenomenon',
    jlpt_level: 'N2',
    context_sentence: '曖昧だったコンセプトをしっかり見据えているプロジェクトは、じわじわ広がる社会現象へと発展し始めている。',
    status: 'Mastered',
  },
  {
    lemma: 'じわじわ',
    surface_form: 'じわじわ',
    span_start: 28,
    span_end: 32,
    sentence_id: 'sent-work-1',
    reading: 'じわじわ',
    meaning: 'gradually; slowly but steadily',
    jlpt_level: 'N1',
    context_sentence: '曖昧だったコンセプトをしっかり見据えているプロジェクトは、じわじわ広がる社会現象へと発展し始めている。',
    status: 'Learning',
  },
  {
    lemma: 'コンセプト',
    surface_form: 'コンセプト',
    span_start: 5,
    span_end: 10,
    sentence_id: 'sent-work-1',
    reading: 'コンセプト',
    meaning: 'concept',
    jlpt_level: 'N3',
    context_sentence: '曖昧だったコンセプトをしっかり見据えているプロジェクトは、じわじわ広がる社会現象へと発展し始めている。',
    status: 'Known',
  },
  {
    lemma: '曖昧',
    surface_form: '曖昧',
    span_start: 0,
    span_end: 2,
    sentence_id: 'sent-work-1',
    reading: 'あいまい',
    meaning: 'vague; ambiguous; unclear',
    jlpt_level: 'N2',
    context_sentence: '曖昧だったコンセプトをしっかり見据えているプロジェクトは、じわじわ広がる社会現象へと発展し始めている。',
    status: 'Learning',
  },

  // --- LIFE / DAILY DECK (1 Sentence) ---
  {
    lemma: 'ハマる',
    surface_form: 'ハマっ',
    span_start: 2,
    span_end: 5,
    sentence_id: 'sent-daily-1',
    reading: 'ハマる',
    meaning: 'to be hooked on; to be obsessed with',
    jlpt_level: 'N2',
    context_sentence: '最近ハマっているアイドルは、仕草がかわいすぎるうえにキラキラ輝いていて、まさに最高の推しだ。',
    status: 'New',
  },
  {
    lemma: 'かわいい',
    surface_form: 'かわい',
    span_start: 17,
    span_end: 20,
    sentence_id: 'sent-daily-1',
    reading: 'かわいい',
    meaning: 'cute; adorable',
    jlpt_level: 'N5',
    context_sentence: '最近ハマっているアイドルは、仕草がかわいすぎるうえにキラキラ輝いていて、まさに最高の推しだ。',
    status: 'Mastered',
  },
  {
    lemma: '推し',
    surface_form: '推し',
    span_start: 42,
    span_end: 44,
    sentence_id: 'sent-daily-1',
    reading: 'おし',
    meaning: "one's favorite (member/character); bias",
    jlpt_level: 'N1',
    context_sentence: '最近ハマっているアイドルは、仕草がかわいすぎるうえにキラキラ輝いていて、まさに最高の推しだ。',
    status: 'Known',
  },
  {
    lemma: 'キラキラ',
    surface_form: 'キラキラ',
    span_start: 26,
    span_end: 30,
    sentence_id: 'sent-daily-1',
    reading: 'キラキラ',
    meaning: 'sparkling; glittering; shining',
    jlpt_level: 'N3',
    context_sentence: '最近ハマっているアイドルは、仕草がかわいすぎるうえにキラキラ輝いていて、まさに最高の推しだ。',
    status: 'Learning',
  },
  {
    lemma: 'アイドル',
    surface_form: 'アイドル',
    span_start: 8,
    span_end: 12,
    sentence_id: 'sent-daily-1',
    reading: 'アイドル',
    meaning: 'pop idol',
    jlpt_level: 'N3',
    context_sentence: '最近ハマっているアイドルは、仕草がかわいすぎるうえにキラキラ輝いていて、まさに最高の推しだ。',
    status: 'Known',
  },

  // --- LEISURE DECK (1 Sentence) ---
  {
    lemma: '天気予報',
    surface_form: '天気予報',
    span_start: 0,
    span_end: 4,
    sentence_id: 'sent-leisure-1',
    reading: 'てんきよほう',
    meaning: 'weather forecast',
    jlpt_level: 'N4',
    context_sentence: '天気予報を確認して「散歩しましょう」と誘い、カフェの周りをぶらぶら歩いて過ごせて本当に良かった。',
    status: 'Mastered',
  },
  {
    lemma: '散歩',
    surface_form: '散歩',
    span_start: 10,
    span_end: 12,
    sentence_id: 'sent-leisure-1',
    reading: 'さんぽ',
    meaning: 'to take a walk; to stroll',
    jlpt_level: 'N5',
    context_sentence: '天気予報を確認して「散歩しましょう」と誘い、カフェの周りをぶらぶら歩いて過ごせて本当に良かった。',
    status: 'Known',
  },
  {
    lemma: 'カフェ',
    surface_form: 'カフェ',
    span_start: 22,
    span_end: 25,
    sentence_id: 'sent-leisure-1',
    reading: 'カフェ',
    meaning: 'cafe; coffee shop',
    jlpt_level: 'N4',
    context_sentence: '天気予報を確認して「散歩しましょう」と誘い、カフェの周りをぶらぶら歩いて過ごせて本当に良かった。',
    status: 'Learning',
  },
  {
    lemma: 'ぶらぶら',
    surface_form: 'ぶらぶら',
    span_start: 29,
    span_end: 33,
    sentence_id: 'sent-leisure-1',
    reading: 'ぶらぶら',
    meaning: 'aimlessly; wandering; strolling',
    jlpt_level: 'N3',
    context_sentence: '天気予報を確認して「散歩しましょう」と誘い、カフェの周りをぶらぶら歩いて過ごせて本当に良かった。',
    status: 'New',
  },
  {
    lemma: '良い',
    surface_form: '良かっ',
    span_start: 43,
    span_end: 46,
    sentence_id: 'sent-leisure-1',
    reading: 'よい',
    meaning: 'good; fine; glad',
    jlpt_level: 'N5',
    context_sentence: '天気予報を確認して「散歩しましょう」と誘い、カフェの周りをぶらぶら歩いて過ごせて本当に良かった。',
    status: 'Known',
  },
];

export function getSentenceId(contextSentence: string): string {
  if (!contextSentence) return 'sent_default';
  let hash = 0;
  for (let i = 0; i < contextSentence.length; i++) {
    hash = (hash << 5) - hash + contextSentence.charCodeAt(i);
    hash |= 0;
  }
  return `sent_${Math.abs(hash)}`;
}

export function maskContextSentence(
  card: WordCard,
  maskSymbol = '【 ＿＿＿ 】'
): { maskedText: string; surface: string } {
  const sentence = card.context_sentence || '';
  if (!sentence) return { maskedText: '', surface: card.lemma };

  if (
    typeof card.span_start === 'number' &&
    typeof card.span_end === 'number' &&
    card.span_start >= 0 &&
    card.span_end <= sentence.length &&
    card.span_start < card.span_end
  ) {
    const surface = card.surface_form || sentence.slice(card.span_start, card.span_end);
    const maskedText = sentence.slice(0, card.span_start) + maskSymbol + sentence.slice(card.span_end);
    return { maskedText, surface };
  }
// Fallback: Try to find the surface form or lemma in the sentence
  if (card.surface_form && sentence.includes(card.surface_form)) {
    const idx = sentence.indexOf(card.surface_form);
    const end = idx + card.surface_form.length;
    const maskedText = sentence.slice(0, idx) + maskSymbol + sentence.slice(end);
    return { maskedText, surface: card.surface_form };
  }

  if (sentence.includes(card.lemma)) {
    const idx = sentence.indexOf(card.lemma);
    const end = idx + card.lemma.length;
    const maskedText = sentence.slice(0, idx) + maskSymbol + sentence.slice(end);
    return { maskedText, surface: card.lemma };
  }

  return { maskedText: sentence + ` (${maskSymbol})`, surface: card.lemma };
}

export function interleaveCardsBySentence(cards: WordCard[]): WordCard[] {
  if (cards.length <= 1) return cards;

  const groups: Record<string, WordCard[]> = {};
  for (const card of cards) {
    const sId = getSentenceId(card.context_sentence || card.sentence_id || '');
    if (!groups[sId]) groups[sId] = [];
    groups[sId].push(card);
  }

  const groupKeys = Object.keys(groups);
  if (groupKeys.length <= 1) return cards;

  const result: WordCard[] = [];
  let lastSentId: string | null = null;

  while (Object.keys(groups).length > 0) {
    const eligibleKeys = Object.keys(groups).filter((k) => k !== lastSentId);
    const pool = eligibleKeys.length > 0 ? eligibleKeys : Object.keys(groups);

    let chosenKey = pool[0];
    let maxCount = groups[chosenKey].length;
    for (const key of pool) {
      if (groups[key].length > maxCount) {
        maxCount = groups[key].length;
        chosenKey = key;
      }
    }

    const card = groups[chosenKey].shift()!;
    result.push(card);
    lastSentId = getSentenceId(card.context_sentence || card.sentence_id || '');

    if (groups[chosenKey].length === 0) {
      delete groups[chosenKey];
    }
  }

  return result;
}
