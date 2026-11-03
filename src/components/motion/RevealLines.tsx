'use client';

import { motion, useReducedMotion, type Variants } from 'motion/react';
import type { ReactNode } from 'react';

// Masked line-by-line reveal: each line slides up from behind its own
// overflow mask, the way type is "set" onto a page. Text is real text in
// the heading, so it reads normally without JS and to screen readers.

type Tag = 'h1' | 'h2' | 'h3' | 'p';

const container = (delay: number, stagger: number): Variants => ({
  hidden: {},
  visible: { transition: { delayChildren: delay, staggerChildren: stagger } },
});

// 150% (not 100%) because the mask is padded to keep ascenders/descenders of
// tightly-leaded display type from being cropped — the line has to travel
// past that padding to be fully hidden.
const line: Variants = {
  hidden: { y: '150%' },
  visible: { y: '0%', transition: { duration: 0.95, ease: [0.16, 1, 0.3, 1] } },
};

export function RevealLines({
  lines,
  as = 'h2',
  className,
  lineClassName,
  delay = 0,
  stagger = 0.09,
  onScroll = true,
}: {
  lines: ReactNode[];
  as?: Tag;
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  /** true: reveal when scrolled into view. false: reveal on mount (above the fold). */
  onScroll?: boolean;
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as];

  const trigger = reduce
    ? { initial: false as const }
    : onScroll
      ? { initial: 'hidden', whileInView: 'visible', viewport: { once: true, amount: 0.6 } }
      : { initial: 'hidden', animate: 'visible' };

  return (
    <MotionTag className={className} variants={container(delay, stagger)} {...trigger}>
      {lines.map((content, i) => (
        // Clip vertically only: the reveal needs a bottom edge, but clipping
        // horizontally would crop wide words or overhanging glyphs.
        <span key={i} className="block overflow-x-visible overflow-y-clip pt-[0.1em] pb-[0.2em] -mt-[0.1em] -mb-[0.2em]">
          <motion.span className={`block ${lineClassName ?? ''}`} variants={line}>
            {content}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}
