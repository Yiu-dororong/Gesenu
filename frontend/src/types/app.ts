import type { ReactNode } from 'react';
import type { components } from './api';

export type TokenItem = components['schemas']['TokenItem'] & {
  span_start?: number | null;
  span_end?: number | null;
  meaning?: string;
  jlpt_level?: string | null;
};
export type ParseSentenceResponse = components['schemas']['ParseSentenceResponse'];
export type DictLookupResponse = components['schemas']['DictLookupResponse'];
export type WordCard = components['schemas']['WordCard'] & {
  surface_form?: string | null;
  span_start?: number | null;
  span_end?: number | null;
  sentence_id?: string | null;
};

export type UserMode = 'logged_out' | 'guest' | 'standard';

export type NavigationPage =
  | 'landing'
  | 'overview'
  | 'encounter'
  | 'study_arc'
  | 'study_deck'
  | 'study_session'
  | 'test_setup'
  | 'test_session';

export interface DeckItem {
  id: string;
  jp: string;
  en: string;
  color: string;
  motifSvg?: ReactNode;
}
