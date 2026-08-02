import type { ReactNode } from 'react';
import type { components } from './api';

export type TokenItem = components['schemas']['TokenItem'];
export type ParseSentenceResponse = components['schemas']['ParseSentenceResponse'];
export type DictLookupResponse = components['schemas']['DictLookupResponse'];
export type WordCard = components['schemas']['WordCard'];

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
  isStub?: boolean;
  stubCount?: number;
  stubDue?: number;
  motifSvg?: ReactNode;
}
