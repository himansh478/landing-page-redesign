import { useEffect, useState } from 'react';

// Phones open Quick Mode. This remembers a phone that chose the full laptop editor instead.
// The key is older than Quick Mode, so phones that turned on the test switch keep their choice.
const KEY = 'cwaya-phone-test';
const NARROW = '(max-width: 1100px)';

export function fullEditorChosen() {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function chooseFullEditor(on: boolean) {
  try {
    if (on) localStorage.setItem(KEY, '1');
    else localStorage.removeItem(KEY);
  } catch {
    // Nothing to remember it in.
  }
}

/** Whether the screen is too narrow for the full editor. Null until it has been measured. */
export function useNarrow() {
  const [narrow, setNarrow] = useState<boolean | null>(null);
  useEffect(() => {
    const query = matchMedia(NARROW);
    const update = () => setNarrow(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return narrow;
}
