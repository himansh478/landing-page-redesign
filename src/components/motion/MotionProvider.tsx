'use client';

import { MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';

// Site-wide: every `motion` component (new and pre-existing) drops transform
// animations and keeps opacity fades when the visitor prefers reduced motion.
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
