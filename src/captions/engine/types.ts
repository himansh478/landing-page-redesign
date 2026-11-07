// Core caption data. Times are seconds from the start of the video.

/** One word's own look, on top of the template. */
export type WordStyle = {
  /** Used for the word both before and while it is spoken */
  color?: string;
  fontFamily?: string;
  fontWeight?: FontWeightName;
  /** Size relative to the rest of the caption, 1 = same */
  scale?: number;
};

export type Word = {
  text: string;
  start: number;
  end: number;
  tokenId?: string;
  style?: WordStyle;
};

export type SoundKind = 'pop' | 'click' | 'tick' | 'bubble' | 'whoosh' | 'blip';

/** A short sound as captions change, mixed into the export. */
export type SoundSettings = {
  kind: SoundKind | 'none';
  /** 0 to 1 */
  volume: number;
  every: 'caption' | 'word';
  /** Seconds the sound comes before (negative) or after its caption */
  offset: number;
};

/** One caption's own look and tools, on top of the video's. Unset fields follow the video. */
export type CaptionLook = {
  templateId?: string;
  overrides?: Partial<Style>;
  avoidFaces?: boolean;
  followFace?: boolean;
  behindPerson?: boolean;
  sound?: SoundKind | 'none';
  /** Seconds this caption's sounds move, on top of the video's timing */
  soundOffset?: number;
};

export type Caption = {
  /** First token's id, stable while the caption exists */
  id: string;
  words: Word[];
  look?: CaptionLook;
};

export type FontWeightName = 'Normal' | 'SemiBold' | 'Bold' | 'ExtraBold' | 'Black';

/** Blur and offset are shares of the font size, so a shadow holds at any size. */
export type TextShadow = { color: string; blur: number; y: number };

/** One row of a template built from rows of different looks. */
export type RowStyle = {
  /** Size against the template's font size */
  size: number;
  align: 'left' | 'center' | 'right';
  fontFamily?: string;
  fontWeight?: FontWeightName;
  /** Takes the template's second colour instead of its text colour */
  accent?: boolean;
  textCase?: 'upper' | 'lower' | 'title';
  /** Share of the font size */
  letterSpacing?: number;
  stroke?: { color: string; width: number };
  shadows?: TextShadow[];
  gradient?: [string, string];
  /** Makes the letters taller, 1 = natural */
  stretch?: number;
  /** Moves the row right, in font sizes */
  shift?: number;
  /** Pulls the row up into the one above, in font sizes */
  pull?: number;
};

export type Rows = {
  /**
   * How the words share out. first: one word on top. lastTwo: two words below. half:
   * evenly. longest: the longest word alone, with the words before and after it either
   * side. each: a row per word.
   */
  split: 'first' | 'lastTwo' | 'half' | 'longest' | 'each';
  rows: RowStyle[];
  /** Changes to the rows that vary from caption to caption */
  variants?: Partial<RowStyle>[][];
  /** Share of the font size between words */
  wordGap?: number;
  /** Shorter rows grow towards the width of the widest */
  evenWidths?: boolean;
  /** The longest word glows in one of these, chosen caption by caption */
  glowColors?: string[];
};

/** A template is plain data, so new trending styles ship without code changes. */
export type Style = {
  id: string;
  name: string;
  /** Font family name exactly as registered in fonts.ts */
  fontFamily: string;
  fontWeight: FontWeightName;
  /** Pixels on a 1080-wide frame; scales with the output size */
  fontSize: number;
  uppercase: boolean;
  letterSpacing: number;
  color: string;
  activeColor: string;
  stroke: { color: string; width: number } | null;
  shadow: { color: string; blur: number; offsetY: number } | null;
  glow: { color: string; blur: number } | null;
  /** How the spoken word stands out */
  highlight: 'text' | 'pill' | 'karaoke' | 'underline' | 'none';
  pillColor: string;
  /** Which words are on screen */
  reveal: 'all' | 'word' | 'single' | 'wipe';
  /** How a caption arrives */
  entrance: 'none' | 'fade' | 'rise' | 'pop';
  /** How each word arrives as it is spoken */
  wordEntrance?: { kind: 'fade' | 'blur' | 'slide'; seconds: number };
  /** line: wraps normally. stack: one word per line. */
  arrangement: 'line' | 'stack';
  /** Rows of different looks, in place of the arrangement */
  rows?: Rows;
  /** Words per caption this template is designed around */
  maxWords?: number;
  /** Words on its gallery card */
  preview?: string[];
  textCase?: RowStyle['textCase'];
  shadows?: TextShadow[];
  /** Line spacing as a multiple of the font size */
  lineHeight: number;
  /** Top and bottom fill colours; replaces the text colour */
  gradient: [string, string] | null;
  /** Gives the longest word its own look, for script-accent styles */
  accent: { fontFamily: string; fontWeight: FontWeightName; scale: number; color: string } | null;
  /** A band of light sweeps across the text */
  shine: boolean;
  /** How the text mixes with the video underneath */
  blend: 'normal' | 'overlay' | 'screen' | 'soft-light';
  /** Scale the spoken word pops to, then settles back from (1 = no pop) */
  activeScale: number;
  /** Seconds the pop takes */
  popDuration: number;
  /** Centre of the caption block, 0 = left or top, 1 = right or bottom */
  anchorX: number;
  anchorY: number;
};

export const captionStart = (c: Caption) => c.words[0].start;
export const captionEnd = (c: Caption) => c.words[c.words.length - 1].end;
