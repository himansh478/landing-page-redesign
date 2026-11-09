import type { CaptionLook, SoundSettings, Style, WordStyle } from '@/captions/engine/types';

/** Face positions at one moment, as shares of the frame. */
export type FaceSample = { time: number; boxes: { x: number; y: number; width: number; height: number }[] };

export type ScriptId = 'hinglish' | 'hindi' | 'english' | 'translated';

/** One spoken word. Tokens are the single source of truth; captions are derived from them. */
export type Token = {
  id: string;
  /** Original words: English text, or Hindi as heard */
  source: string;
  /** Pure Devanagari, also what alignment reads */
  spoken: string;
  hinglish: string;
  start: number;
  end: number;
  /** Alignment confidence from 0 to 1. Low means worth checking. */
  score: number;
  /** The other readings of this moment heard something else. Unset on older projects. */
  unsure?: boolean;
  /** A new caption starts at this word */
  breakBefore: boolean;
  /** Timing is a guess until re-alignment finishes */
  pending?: boolean;
  /** The sentence or clause ends here, so a new caption should start after it */
  endsPhrase?: boolean;
  /** Exact caption end, set when someone drags it on the timeline */
  hold?: number;
  /** This word's own look */
  style?: WordStyle;
  /** On a caption's first word: that caption's own look and tools */
  look?: CaptionLook;
  /** On a caption's first word: that caption in English, for Hindi videos */
  english?: string;
  /** Edited in one script; the others still need respelling */
  stale?: boolean;
};

/** Everything undo can reach. */
export type Doc = {
  tokens: Token[];
  script: ScriptId;
  templateId: string;
  overrides: Partial<Style>;
  maxWords: number;
  /** Seconds added to all captions */
  offset: number;
  /** Move captions off faces, using the project's face scan */
  avoidFaces?: boolean;
  /** Captions move with the main face */
  followFace?: boolean;
  /** Captions pass behind the person */
  behindPerson?: boolean;
  /** A landscape video is cropped to 9:16, with the frame following the speaker */
  reframe?: boolean;
  /** A sound as captions change. Unset means none */
  sound?: SoundSettings;
};

export type Project = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  media: { fileName: string; width: number; height: number; duration: number };
  language: 'hi' | 'en';
  doc: Doc;
  /** Loudness in dB every 10 ms */
  envelope: number[];
  /** Loud stretches with no words: possibly lost speech */
  speechGaps: { start: number; end: number }[];
  /** Where faces are over time, once the video has been scanned */
  faces?: FaceSample[];
  /** Word times are Whisper's, because the timing worker couldn't be reached */
  roughTiming?: boolean;
};

export const SCRIPTS: Record<'hi' | 'en', { id: ScriptId; label: string }[]> = {
  hi: [
    { id: 'hinglish', label: 'Hinglish' },
    { id: 'hindi', label: 'हिन्दी' },
    { id: 'translated', label: 'English' },
  ],
  en: [{ id: 'english', label: 'English' }],
};

const FIELD = { hinglish: 'hinglish', hindi: 'spoken', english: 'source', translated: 'source' } as const;

export const tokenText = (token: Token, script: ScriptId) => token[FIELD[script]];

/** Captions show a number as digits, though the timing model needs it spelt out. */
export const captionText = ({ fixed, spoken, hinglish }: { fixed: string; spoken: string; hinglish: string }) =>
  /\d/.test(fixed) ? { spoken: fixed, hinglish: fixed } : { spoken, hinglish };

export const withTokenText = (token: Token, script: ScriptId, text: string): Token => ({ ...token, [FIELD[script]]: text });

let counter = 0;
export const newId = () => `${Date.now().toString(36)}${(counter++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;
