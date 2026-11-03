// The current time changes every frame, so it lives outside the editor store and
// React: the few places that show it subscribe directly.
type Listener = (time: number) => void;

const listeners = new Set<Listener>();
let time = 0;

export const playhead = {
  get: () => time,
  set(next: number) {
    time = next;
    listeners.forEach((listener) => listener(next));
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
