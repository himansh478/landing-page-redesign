import { produce } from 'immer';
import { create } from 'zustand';
import { applyTextEdit } from '@/captions/engine/diff';
import { autoBreak, captionRanges, editEnglish, sentenceRanges } from '@/captions/engine/group';
import { familiesOf, templates } from '@/captions/engine/templates';
import type { CaptionLook, SoundSettings, Style, WordStyle } from '@/captions/engine/types';
import { withTokenText, type Doc, type FaceSample, type Project, type ScriptId, type Token } from '@/captions/lib/project';
import type { Look } from '@/captions/lib/styles';
import { findMatches } from '@/captions/lib/review';

const HISTORY_LIMIT = 200;
/** Slider drags within this window count as one undo step. */
const MERGE_WINDOW = 800;
const MIN_CAPTION = 0.1;

type EditorState = {
  project: Project | null;
  doc: Doc | null;
  past: Doc[];
  future: Doc[];
  lastKey: string | null;
  lastAt: number;
  notice: string | null;
  /** The word being styled. Not part of undo. */
  selectedToken: string | null;
  /** The caption chosen in the list or the timeline, for its own look. Not part of undo. */
  selectedCaption: string | null;
  /** Free-plan mark on the picture. Comes from the account, not the project. */
  watermark: boolean;

  load(project: Project): void;
  undo(): void;
  redo(): void;
  /** A change with no undo step, for results that arrive from the server. */
  patch(recipe: (doc: Doc) => void): void;
  setNotice(notice: string | null): void;
  selectToken(id: string | null): void;
  selectCaption(id: string | null): void;
  setWatermark(on: boolean): void;
  setFaces(faces: FaceSample[]): void;

  setTemplate(id: string): void;
  /** Brings a saved look onto this video. It stays where it was placed. */
  applyLook(look: Look): void;
  /** These words have been looked at, so they stop asking for a check. */
  markChecked(ids: string[]): void;
  setStyle(partial: Partial<Style>, key?: string): void;
  setScript(script: ScriptId): void;
  setMaxWords(maxWords: number): void;
  setOffset(offset: number): void;
  setAvoidFaces(avoid: boolean): void;
  setOption(option: Pick<Doc, 'followFace' | 'behindPerson'>): void;
  setReframe(on: boolean): void;
  /** Replaces a word or phrase everywhere, as one undo step. */
  replaceEverywhere(find: string, replace: string): void;
  replaceWord(id: string, text: string): void;
  /** Takes words out of the captions; the video is not cut. */
  removeWords(ids: string[]): void;
  /** Merges into a word's own look; null clears it. */
  setWordStyle(id: string, style: WordStyle | null, key?: string): void;

  /** Merges into one caption's own tools; a field set to undefined follows the video again. */
  setCaptionLook(captionId: string, look: Partial<CaptionLook>, key?: string): void;
  /** Merges into one caption's own style. */
  setCaptionStyle(captionId: string, style: Partial<Style>, key?: string): void;
  /** Gives one caption its own template, keeping where it was placed. */
  setCaptionTemplate(captionId: string, templateId: string): void;
  /** The caption follows the video again in every way. */
  resetCaption(captionId: string): void;
  /** Merges into the video's caption sound. */
  setSound(sound: Partial<SoundSettings>, key?: string): void;

  editCaption(id: string, text: string): void;
  splitCaption(id: string, wordIndex: number): void;
  mergeWithNext(id: string): void;
  deleteCaption(id: string): void;
  /** Maps a caption's span from..to onto start..end, keeping its words in proportion. */
  retimeCaption(id: string, from: number, to: number, start: number, end: number): void;
};

/** The template with this project's own changes on top. */
export const resolveStyle = (doc: Doc): Style => ({ ...(templates[doc.templateId] ?? templates['pop-viral']), ...doc.overrides });

const placement = ({ anchorX, anchorY }: Partial<Style>) => ({ ...(anchorX === undefined ? {} : { anchorX }), ...(anchorY === undefined ? {} : { anchorY }) });

/**
 * One caption's style: the video's, or the caption's own template placed where the video's
 * captions sit, with the caption's own changes on top.
 */
export function captionStyle(doc: Doc, look: CaptionLook | undefined): Style {
  if (!look?.templateId && !look?.overrides) return resolveStyle(doc);
  const own = look.templateId ? templates[look.templateId] : undefined;
  if (!own) return { ...resolveStyle(doc), ...look.overrides };
  return { ...own, ...(own.rows ? { anchorX: placement(doc.overrides).anchorX ?? own.anchorX } : placement(doc.overrides)), ...look.overrides };
}

/** Every font this project draws with, so all can be loaded before drawing. */
export const neededFamilies = (doc: Doc) => {
  const style = resolveStyle(doc);
  const families = new Set(familiesOf(style));
  for (const token of doc.tokens) {
    if (token.style?.fontFamily) families.add(token.style.fontFamily);
    if (token.look) for (const family of familiesOf(captionStyle(doc, token.look))) families.add(family);
  }
  return [...families];
};

/** A caption's first word, where its own look is kept. English captions share their sentence's. */
const firstToken = (doc: Doc, captionId: string) => doc.tokens.find((t) => t.id === captionId.split('#')[0]);

/** Drops fields set back to "follow the video", so an emptied look leaves nothing behind. */
function tidy(token: Token) {
  const look = token.look;
  if (!look) return;
  for (const key of Object.keys(look) as (keyof CaptionLook)[]) if (look[key] === undefined) delete look[key];
  const overrides = look.overrides as Record<string, unknown> | undefined;
  if (overrides) for (const key of Object.keys(overrides)) if (overrides[key] === undefined) delete overrides[key];
  if (look.overrides && Object.keys(look.overrides).length === 0) delete look.overrides;
  if (Object.keys(look).length === 0) delete token.look;
}

/** The words of this sentence are changing, so its translation no longer matches. */
const dropTranslation = (doc: Doc, index: number) => {
  const sentence = sentenceRanges(doc.tokens as Token[]).find((r) => index >= r.first && index <= r.last);
  if (sentence) delete doc.tokens[sentence.first].english;
};

const rangeOf = (tokens: Token[], id: string) => {
  const first = tokens.findIndex((t) => t.id === id);
  if (first < 0) return null;
  return captionRanges(tokens).find((r) => r.first === first) ?? null;
};

export const useEditor = create<EditorState>((set, get) => {
  const commit = (recipe: (doc: Doc) => void, key?: string) => {
    const { doc, past, lastKey, lastAt } = get();
    if (!doc) return;
    const next = produce(doc, recipe);
    if (next === doc) return;
    const now = Date.now();
    const merge = key !== undefined && key === lastKey && now - lastAt < MERGE_WINDOW;
    set({
      doc: next,
      past: merge ? past : [...past, doc].slice(-HISTORY_LIMIT),
      future: [],
      lastKey: key ?? null,
      lastAt: now,
    });
  };

  return {
    project: null,
    doc: null,
    past: [],
    future: [],
    lastKey: null,
    lastAt: 0,
    notice: null,
    selectedToken: null,
    selectedCaption: null,
    watermark: false,

    load: (project) => set({ project, doc: project.doc, past: [], future: [], lastKey: null, notice: null, selectedToken: null, selectedCaption: null }),

    undo() {
      const { doc, past, future } = get();
      if (!doc || !past.length) return;
      set({ doc: past[past.length - 1], past: past.slice(0, -1), future: [doc, ...future], lastKey: null });
    },

    redo() {
      const { doc, past, future } = get();
      if (!doc || !future.length) return;
      set({ doc: future[0], future: future.slice(1), past: [...past, doc], lastKey: null });
    },

    patch(recipe) {
      const { doc, past, future } = get();
      if (!doc) return;
      const apply = (d: Doc) => produce(d, recipe);
      set({ doc: apply(doc), past: past.map(apply), future: future.map(apply) });
    },

    setNotice: (notice) => set({ notice }),

    selectToken: (selectedToken) => set({ selectedToken }),

    selectCaption: (selectedCaption) => set({ selectedCaption }),

    setWatermark: (watermark) => set({ watermark }),

    setFaces(faces) {
      const { project } = get();
      if (project) set({ project: { ...project, faces } });
    },

    setTemplate: (id) =>
      commit((doc) => {
        doc.templateId = id;
        const { anchorX, anchorY } = doc.overrides;
        doc.overrides = { ...(anchorX === undefined ? {} : { anchorX }), ...(anchorY === undefined ? {} : { anchorY }) };

        // A template built from rows is designed for its own height and caption length.
        const { rows, maxWords } = templates[id];
        if (rows) delete doc.overrides.anchorY;
        if (maxWords) {
          doc.maxWords = maxWords;
          doc.tokens = autoBreak(doc.tokens as Token[], maxWords);
        }
      }),

    applyLook: ({ templateId, overrides, maxWords, sound }) =>
      commit((doc) => {
        const { anchorX, anchorY } = doc.overrides;
        doc.templateId = templateId;
        doc.overrides = { ...overrides, ...(anchorX === undefined ? {} : { anchorX }), ...(anchorY === undefined || templates[templateId]?.rows ? {} : { anchorY }) };
        doc.maxWords = maxWords;
        doc.tokens = autoBreak(doc.tokens as Token[], maxWords);
        // Looks saved before sounds existed carry none, and shouldn't silence this video.
        if (sound) doc.sound = sound;
      }),

    markChecked: (ids) =>
      commit((doc) => {
        for (const token of doc.tokens) if (ids.includes(token.id)) token.unsure = false;
      }),

    setStyle: (partial, key) => commit((doc) => void Object.assign(doc.overrides, partial), key),

    setScript: (script) => commit((doc) => void (doc.script = script)),

    setMaxWords: (maxWords) =>
      commit((doc) => {
        doc.maxWords = maxWords;
        doc.tokens = autoBreak(doc.tokens as Token[], maxWords);
      }, 'max-words'),

    setOffset: (offset) => commit((doc) => void (doc.offset = offset), 'offset'),

    setAvoidFaces: (avoid) => commit((doc) => void (doc.avoidFaces = avoid)),

    setOption: (option) => commit((doc) => void Object.assign(doc, option)),

    setReframe: (on) =>
      commit((doc) => {
        doc.reframe = on;
        // The frame itself follows the speaker, so the caption doesn't need to as well.
        if (on) doc.followFace = false;
        doc.overrides.anchorY = on ? 0.62 : 0.82;
      }),

    replaceEverywhere(find, replace) {
      commit((doc) => {
        const length = find.trim().split(/\s+/).length;
        const matches = findMatches(doc.tokens as Token[], doc.script, find);
        for (const start of [...matches].reverse()) {
          dropTranslation(doc, start);
          const last = doc.tokens[start + length - 1];
          doc.tokens[start] = { ...withTokenText(doc.tokens[start] as Token, doc.script, replace.trim()), end: last.end, stale: true };
          doc.tokens.splice(start + 1, length - 1);
        }
      });
    },

    replaceWord(id, text) {
      commit((doc) => {
        const index = doc.tokens.findIndex((t) => t.id === id);
        if (index < 0) return;
        dropTranslation(doc, index);
        doc.tokens[index] = { ...withTokenText(doc.tokens[index] as Token, doc.script, text), stale: true };
      });
    },

    removeWords(ids) {
      commit((doc) => {
        for (const id of ids) {
          const index = doc.tokens.findIndex((t) => t.id === id);
          if (index < 0) continue;
          dropTranslation(doc, index);
          const next = doc.tokens[index + 1];
          if (doc.tokens[index].breakBefore && next) next.breakBefore = true;
          if (doc.tokens[index].look && next) next.look ??= doc.tokens[index].look;
          doc.tokens.splice(index, 1);
        }
      });
    },

    setWordStyle: (id, style, key) =>
      commit((doc) => {
        const token = doc.tokens.find((t) => t.id === id);
        if (!token) return;
        if (style) token.style = { ...token.style, ...style };
        else delete token.style;
      }, key),

    editCaption(id, text) {
      commit((doc) => {
        if (doc.script === 'translated') {
          const [tokenId, part] = id.split('#');
          const token = doc.tokens.find((t) => t.id === tokenId);
          if (token?.english) token.english = editEnglish(token.english, Number(part), text, doc.maxWords);
          return;
        }
        const range = rangeOf(doc.tokens, id);
        if (!range) return;
        dropTranslation(doc, range.first);
        const tokens = doc.tokens as Token[];
        const current = tokens.slice(range.first, range.last + 1);
        const look = tokens[range.first].look;
        const limits = { after: tokens[range.first - 1]?.end ?? 0, before: tokens[range.last + 1]?.start ?? Infinity };
        doc.tokens.splice(range.first, current.length, ...applyTextEdit(current, text, doc.script, limits));
        // A retyped first word is a new token, and the caption's own look moves onto it.
        if (look && doc.tokens[range.first]) doc.tokens[range.first].look = look;
      });
    },

    splitCaption(id, wordIndex) {
      commit((doc) => {
        const range = rangeOf(doc.tokens, id);
        // English words don't map onto the spoken ones, so there is no word to split at.
        if (!range || doc.script === 'translated') return;
        const at = range.first + wordIndex;
        if (at <= range.first || at > range.last) return;
        doc.tokens[at].breakBefore = true;
        // Both halves keep the look, as a cut clip does in a video editor.
        const look = doc.tokens[range.first].look;
        if (look) doc.tokens[at].look = JSON.parse(JSON.stringify(look));
      });
    },

    mergeWithNext(id) {
      commit((doc) => {
        const range = rangeOf(doc.tokens, id);
        const next = range && doc.tokens[range.last + 1];
        if (!next) return;
        next.breakBefore = false;
        // The joined caption is the first one, so the second's look would only lie in wait.
        delete next.look;
      });
    },

    deleteCaption(id) {
      commit((doc) => {
        const range = rangeOf(doc.tokens, id);
        if (!range) return;
        dropTranslation(doc, range.first);
        doc.tokens.splice(range.first, range.last - range.first + 1);
        if (doc.tokens[range.first]) doc.tokens[range.first].breakBefore = true;
      });
    },

    setCaptionLook: (captionId, look, key) =>
      commit((doc) => {
        const token = firstToken(doc, captionId);
        if (!token) return;
        token.look = { ...token.look, ...look };
        tidy(token);
      }, key),

    setCaptionStyle: (captionId, style, key) =>
      commit((doc) => {
        const token = firstToken(doc, captionId);
        if (!token) return;
        token.look = { ...token.look, overrides: { ...token.look?.overrides, ...style } };
        tidy(token);
      }, key),

    setCaptionTemplate: (captionId, templateId) =>
      commit((doc) => {
        const token = firstToken(doc, captionId);
        if (!token) return;
        // A template built from rows is designed for its own height, so only the side is kept.
        const where = placement(token.look?.overrides ?? {});
        const kept = templates[templateId]?.rows ? placement({ anchorX: where.anchorX }) : where;
        // Picking the video's own template just drops the caption's template.
        token.look = { ...token.look, templateId: templateId === doc.templateId ? undefined : templateId, overrides: kept };
        tidy(token);
      }),

    resetCaption: (captionId) =>
      commit((doc) => {
        const token = firstToken(doc, captionId);
        if (token) delete token.look;
      }),

    setSound: (sound, key) => commit((doc) => void (doc.sound = { kind: 'none', volume: 0.6, every: 'caption', offset: 0, ...doc.sound, ...sound }), key),

    retimeCaption(id, from, to, start, end) {
      commit((doc) => {
        const range = rangeOf(doc.tokens, id);
        if (!range) return;
        const scale = Math.max(end - start, MIN_CAPTION) / Math.max(to - from, 0.001);
        for (let i = range.first; i <= range.last; i++) {
          const token = doc.tokens[i];
          token.start = start + (token.start - from) * scale;
          token.end = start + (token.end - from) * scale;
        }
        doc.tokens[range.last].hold = end;
      });
    },
  };
});
