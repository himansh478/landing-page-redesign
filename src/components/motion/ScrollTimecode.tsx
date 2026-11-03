'use client';

import { motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { REEL_SECONDS, toTimecode } from '@/lib/timecode';

// Signature effect: the header's bottom edge is an editing-timeline ruler.
// A coral playhead tracks scroll position and its tag reads the current
// timecode, treating the page as one reel. Scroll-linked, never autonomous.
export function ScrollTimecode() {
  const { scrollYProgress } = useScroll();
  const left = useTransform(scrollYProgress, (v) => `${v * 100}%`);
  // Keep the hanging tag inside the viewport at both ends.
  const tagShift = useTransform(scrollYProgress, [0, 1], ['0%', '-100%']);
  const readout = useRef<HTMLSpanElement>(null);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (readout.current) readout.current.textContent = toTimecode(v * REEL_SECONDS);
  });

  return (
    <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[5px] pointer-events-none">
      {/* Ruler ticks: a long tick every 120px, short ticks every 24px */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to right, rgb(var(--ink-rgb) / 0.35) 0 1px, transparent 1px 120px), repeating-linear-gradient(to right, rgb(var(--ink-rgb) / 0.18) 0 1px, transparent 1px 24px)',
          backgroundSize: '100% 5px, 100% 3px',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'bottom, bottom',
        }}
      />
      {/* Played portion */}
      <motion.div
        className="absolute left-0 bottom-0 h-[2px] bg-coral origin-left"
        style={{ scaleX: scrollYProgress, width: '100%' }}
      />
      {/* Playhead + hanging timecode tag */}
      <motion.div className="absolute bottom-0 h-[11px] -mb-[6px]" style={{ left }}>
        <div className="w-[2px] h-full bg-coral -translate-x-1/2" />
        <motion.span
          ref={readout}
          style={{ x: tagShift }}
          className="hidden md:block absolute top-full mt-0.5 left-0 slate !text-[10px] !tracking-[0.12em] bg-coral text-ink px-1.5 py-0.5 rounded-b-sm whitespace-nowrap"
        >
          00:00:00:00
        </motion.span>
      </motion.div>
    </div>
  );
}
