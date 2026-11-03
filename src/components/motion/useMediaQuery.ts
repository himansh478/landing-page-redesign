'use client';

import { useCallback, useSyncExternalStore } from 'react';

// Server render (and the first hydration pass) always sees `false`, so
// anything gated on this renders its lightweight fallback first.
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query]
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
}
