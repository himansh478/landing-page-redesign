import type { Doc } from './project';

// Favourites and saved looks belong to this browser, so they work without an account.
const FAVOURITES = 'cwaya-favourite-templates';
const SAVED = 'cwaya-saved-styles';
const LAST = 'cwaya-last-look';

/** Everything a look carries from one video to the next. Position stays with the video. */
export type Look = Pick<Doc, 'templateId' | 'overrides' | 'maxWords'>;
export type SavedStyle = Look & { id: string; name: string };

function read<T>(key: string, fallback: T): T {
  try {
    const text = localStorage.getItem(key);
    return text ? (JSON.parse(text) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // A full or blocked store only loses a convenience.
  }
}

export function lookOf({ templateId, overrides, maxWords }: Doc): Look {
  const rest = { ...overrides };
  delete rest.anchorX;
  delete rest.anchorY;
  return { templateId, overrides: rest, maxWords };
}

export const readFavourites = () => read<string[]>(FAVOURITES, []);
export const writeFavourites = (ids: string[]) => write(FAVOURITES, ids);

export const readSavedStyles = () => read<SavedStyle[]>(SAVED, []);
export const writeSavedStyles = (styles: SavedStyle[]) => write(SAVED, styles);

/** The look of the last video, which the next new video starts from. */
export const lastLook = () => read<Look | null>(LAST, null);
export const rememberLook = (doc: Doc) => write(LAST, lookOf(doc));
