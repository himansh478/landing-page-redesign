const KEY = 'cwaya-vocabulary';

/** Names and brands to spell exactly. Kept in this browser and used on every upload. */
export function readVocabulary(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function saveVocabulary(words: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(words));
  } catch {
    // Without storage the list simply lasts for this page.
  }
}
