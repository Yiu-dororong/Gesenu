/**
 * LiveAPI.ts — Real Production API Client for Gesenu
 *
 * Implements the GesenuAPI contract against the persistent FastAPI backend.
 * Provides authenticated session headers, review synchronization with Leitner SRS,
 * and throws on network/server errors to drive optimistic UI rollback.
 */

import type { GesenuAPI, ReviewFeedback, ReviewResult } from './types';
import type { DeckItem, WordCard, DictLookupResponse } from '../../types/app';
import { API_BASE, DEFAULT_DECKS } from '../../constants/decks';

export class LiveAPI implements GesenuAPI {
  public readonly isDemoMode = false;
  private getAccessToken: () => string | null;

  // Client-side caches for latency reduction & offline resilience
  private dictCache = new Map<string, DictLookupResponse>();
  private readonly MAX_DICT_CACHE_ENTRIES = 500; // LRU bounded cap (prevents memory leak)
  private decksCache: { data: DeckItem[]; timestamp: number } | null = null;
  private readonly DECKS_CACHE_TTL_MS = 60_000; // 1 minute TTL

  private setCachedDict(key: string, val: DictLookupResponse): void {
    if (this.dictCache.size >= this.MAX_DICT_CACHE_ENTRIES) {
      const oldestKey = this.dictCache.keys().next().value;
      if (oldestKey) this.dictCache.delete(oldestKey);
    }
    this.dictCache.set(key, val);
  }

  constructor(getAccessToken: () => string | null) {
    this.getAccessToken = getAccessToken;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = this.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  invalidateDecksCache(): void {
    this.decksCache = null;
  }

  async getDecks(): Promise<DeckItem[]> {
    const now = Date.now();
    if (this.decksCache && now - this.decksCache.timestamp < this.DECKS_CACHE_TTL_MS) {
      return this.decksCache.data;
    }

    try {
      const res = await fetch(`${API_BASE}/api/decks`, {
        credentials: 'include',
        headers: this.getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.decks && data.decks.length > 0) {
        const mappedDecks = data.decks.map(
          (d: { id: string; name: string; jp_label?: string; color_slug?: string }) => {
            const matchDefault = DEFAULT_DECKS.find(
              (def) => def.id === d.name || def.id === d.id
            );
            return {
              id: d.name || d.id,
              jp: d.jp_label || matchDefault?.jp || d.name,
              en: d.name.charAt(0).toUpperCase() + d.name.slice(1),
              color: d.color_slug || matchDefault?.color || 'var(--wave)',
              motifSvg: matchDefault?.motifSvg,
            };
          }
        );
        this.decksCache = { data: mappedDecks, timestamp: now };
        return mappedDecks;
      }
    } catch {
      // Fallback to default decks
    }
    return DEFAULT_DECKS;
  }

  async lookupDictionary(keyword: string): Promise<DictLookupResponse> {
    const clean = keyword.trim();
    if (!clean) {
      return { lemma: '', reading: '', meaning: '', jlpt_level: null, found: false };
    }

    // Check client-side in-memory cache first
    const cached = this.dictCache.get(clean);
    if (cached) {
      return cached;
    }

    // Attempt backend endpoint with Sudachi / Jisho service
    try {
      const res = await fetch(`${API_BASE}/api/dict/lookup?keyword=${encodeURIComponent(clean)}`);
      if (res.ok) {
        const data: DictLookupResponse = await res.json();
        if (data && data.found) {
          this.setCachedDict(clean, data);
          return data;
        }
      }
    } catch {
      // Backend lookup failed, fall through to direct Jisho API
    }

    // Fallback: direct public Jisho API
    try {
      const jishoRes = await fetch(
        `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(clean)}`
      );
      if (jishoRes.ok) {
        const jishoData = await jishoRes.json();
        if (jishoData.data && jishoData.data.length > 0) {
          const item = jishoData.data[0];
          const primaryReading = item.japanese?.[0]?.reading || '';
          const defs = item.senses
            ?.slice(0, 3)
            .map((s: { english_definitions?: string[] }) => s.english_definitions?.join('; '))
            .filter(Boolean)
            .join(' | ');
          const jlptTag = item.jlpt?.[0]?.toUpperCase().replace('JLPT-', '') || null;
          const result: DictLookupResponse = {
            lemma: item.japanese?.[0]?.word || clean,
            reading: primaryReading,
            meaning: defs || `Vocabulary entry for ${clean}`,
            jlpt_level: jlptTag,
            found: true,
          };
          this.setCachedDict(clean, result);
          return result;
        }
      }
    } catch {
      // Jisho API unreachable
    }

    const fallback: DictLookupResponse = {
      lemma: clean,
      reading: '',
      meaning: `Japanese vocabulary item`,
      jlpt_level: null,
      found: false,
    };
    this.dictCache.set(clean, fallback);
    return fallback;
  }

  async getWords(deckId?: string): Promise<WordCard[]> {
    const url =
      deckId && deckId !== 'all'
        ? `${API_BASE}/api/words?deck_id=${encodeURIComponent(deckId)}`
        : `${API_BASE}/api/words`;

    const res = await fetch(url, {
      credentials: 'include',
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to fetch words: HTTP ${res.status}`);
    const data = await res.json();
    return data.words || [];
  }

  async submitReview(wordId: string, feedback: ReviewFeedback): Promise<ReviewResult> {
    const res = await fetch(`${API_BASE}/api/words/${encodeURIComponent(wordId)}/review`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ feedback }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.detail || `Review sync failed (HTTP ${res.status})`);
    }

    const data = await res.json();
    return {
      success: Boolean(data.success),
      wordId: data.wordId || wordId,
      previousStatus: data.previousStatus,
      newStatus: data.newStatus,
    };
  }

  async getDueCards(deckId?: string): Promise<WordCard[]> {
    const url =
      deckId && deckId !== 'all'
        ? `${API_BASE}/api/study/session?deck_id=${encodeURIComponent(deckId)}`
        : `${API_BASE}/api/study/session`;

    const res = await fetch(url, {
      credentials: 'include',
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to fetch due cards: HTTP ${res.status}`);
    const data = await res.json();
    return data.words || [];
  }
}
