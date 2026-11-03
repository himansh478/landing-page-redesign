import { useSyncExternalStore } from 'react';

const noop = () => () => {};

// true after hydration; lets overlays portal to <body> without a mismatch.
export function useIsClient() {
  return useSyncExternalStore(noop, () => true, () => false);
}
