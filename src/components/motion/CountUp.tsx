'use client';

import { animate, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';

// Renders the final value on the server (no-JS and SEO see the real number),
// resets to 0 once mounted below the fold, then counts up when scrolled in.
export function CountUp({
  value,
  suffix = '',
  duration = 1.8,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce || inView) return;
    el.textContent = `0${suffix}`;
  }, [reduce, inView, suffix]);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce || !inView) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = `${Math.round(v)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, reduce, value, suffix, duration]);

  return (
    <span ref={ref} className="tabular">
      {`${value}${suffix}`}
    </span>
  );
}
