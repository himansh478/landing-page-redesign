'use client';

import { motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react';
import { useRef, useState } from 'react';
import { RevealLines } from './motion/RevealLines';
import { toTimecode } from '@/lib/timecode';

// The four steps laid out as clips on an editing timeline. Clip lengths are
// deliberately unequal — production is the long one — and a scroll-scrubbed
// playhead runs across them while the section is pinned.

const TIMELINE_SECONDS = 60;

const steps = [
  { title: 'Discovery', desc: 'Connect via WhatsApp or Search to define your vision and goals.', weight: 18 },
  { title: 'Production', desc: 'Our elite team captures or edits your content with surgical precision.', weight: 34 },
  { title: 'Refinement', desc: 'Rapid iterations and neural grading to ensure absolute perfection.', weight: 26 },
  { title: 'Deployment', desc: 'Receive your studio-grade masters and dominate your niche.', weight: 22 },
];

const starts = steps.map((_, i) => steps.slice(0, i).reduce((sum, s) => sum + s.weight, 0));

// Decorative audio track. Deterministic and rounded so server and client markup match.
const WAVE = Array.from({ length: 96 }, (_, i) => Math.round((0.22 + Math.abs(Math.sin(i * 0.61) * Math.cos(i * 0.17)) * 0.78) * 100));

const RULER_MARKS = [0, 10, 20, 30, 40, 50, 60];

export function ProcessSection() {
  const ref = useRef<HTMLElement>(null);
  const tc = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const left = useTransform(scrollYProgress, (v) => `${v * 100}%`);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const pct = v * 100;
    let idx = 0;
    starts.forEach((start, i) => {
      if (pct >= start) idx = i;
    });
    setActive(idx);
    if (tc.current) tc.current.textContent = toTimecode(v * TIMELINE_SECONDS);
  });

  return (
    <section ref={ref} className="on-ink relative bg-ink md:h-[260vh] motion-reduce:md:h-auto">
      <div className="md:sticky md:top-0 md:min-h-screen md:flex md:flex-col md:justify-center py-24 sm:py-28 motion-reduce:md:static">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-12 gap-8 items-end mb-12 sm:mb-14">
            <div className="lg:col-span-7">
              <p className="slate slate-mark text-coral mb-5">Sc.03 — Process</p>
              <RevealLines
                as="h2"
                className="display-lg font-display text-ivory"
                lines={['The execution', <span key="cycle" className="text-coral">cycle</span>]}
              />
            </div>
            <p className="lg:col-span-4 lg:col-start-9 text-lg text-ivory/70 leading-relaxed">
              A streamlined architecture for transforming concepts into high-impact digital assets.
            </p>
          </div>

          {/* The timeline is a visual layer over the step list below, so it's hidden from assistive tech. */}
          <div aria-hidden="true" className="rounded-[4px] border border-ivory/10 bg-[#0E1923] p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3 gap-4">
              <span className="slate text-ivory/40 truncate">Seq · Cwaya_Execution_Cycle</span>
              <span className="slate text-coral flex-shrink-0">
                TC <span ref={tc} className="tabular">00:00:00:00</span>
              </span>
            </div>

            {/* Every cell is placed explicitly: the playhead overlay shares column 2 with the tracks. */}
            <div className="grid grid-cols-[2rem_1fr] sm:grid-cols-[2.5rem_1fr] gap-x-2 gap-y-1.5">
              {/* Ruler */}
              <div
                className="col-start-2 row-start-1 relative h-6 border-b border-ivory/10"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(to right, rgb(var(--ivory-rgb) / 0.25) 0 1px, transparent 1px calc(100% / 60))',
                  backgroundSize: '100% 6px',
                  backgroundPosition: 'bottom',
                  backgroundRepeat: 'no-repeat',
                }}
              >
                {RULER_MARKS.map((s) => (
                  <span
                    key={s}
                    className="absolute top-0 slate !text-[9px] !tracking-[0.08em] text-ivory/40 hidden sm:block"
                    style={{
                      left: `${(s / TIMELINE_SECONDS) * 100}%`,
                      transform: s === 0 ? 'none' : s === TIMELINE_SECONDS ? 'translateX(-100%)' : 'translateX(-50%)',
                    }}
                  >
                    {toTimecode(s).slice(3, 8)}
                  </span>
                ))}
              </div>

              {/* Video track */}
              <span className="col-start-1 row-start-2 slate text-ivory/40 self-center">V1</span>
              <div className="col-start-2 row-start-2 flex gap-[3px] h-16 sm:h-20">
                {steps.map((step, i) => (
                  <div
                    key={step.title}
                    style={{ flex: `${step.weight} 1 0%` }}
                    className={`relative min-w-0 rounded-[3px] border overflow-hidden px-2 sm:px-3 py-2 flex flex-col justify-between transition-colors duration-500 ${
                      active === i ? 'border-coral bg-coral/20 text-ivory' : 'border-ivory/15 bg-ivory/5 text-ivory/60'
                    }`}
                  >
                    <span className="slate !text-[10px] !tracking-[0.1em] truncate">
                      {String(i + 1).padStart(2, '0')}
                      <span className="hidden md:inline"> · {step.title}</span>
                    </span>
                    <span
                      className="h-2.5 opacity-40"
                      style={{ backgroundImage: 'repeating-linear-gradient(to right, currentColor 0 7px, transparent 7px 10px)' }}
                    />
                  </div>
                ))}
              </div>

              {/* Audio track */}
              <span className="col-start-1 row-start-3 slate text-ivory/40 self-center">A1</span>
              <div className="col-start-2 row-start-3 h-10 sm:h-12 rounded-[3px] bg-editorial/20 border border-editorial/40 flex items-center gap-[2px] px-1 overflow-hidden">
                {WAVE.map((h, i) => (
                  <span key={i} className="flex-1 min-w-px bg-editorial rounded-full" style={{ height: `${h}%` }} />
                ))}
              </div>

              {/* Playhead spanning ruler + tracks */}
              <div className="col-start-2 row-start-1 row-span-3 relative pointer-events-none">
                <motion.div className="absolute top-0 bottom-0 w-[2px] -ml-px bg-coral" style={{ left }}>
                  <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-coral [clip-path:polygon(0_0,100%_0,50%_100%)]" />
                </motion.div>
              </div>
            </div>
          </div>

          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8 mt-12">
            {steps.map((step, i) => (
              <li
                key={step.title}
                aria-current={active === i ? 'step' : undefined}
                className={`border-t-2 pt-5 transition-[opacity,border-color] duration-500 ${
                  active === i ? 'border-coral opacity-100' : 'border-ivory/15 opacity-70'
                }`}
              >
                <div className="flex items-baseline justify-between mb-3">
                  <span className="slate text-coral">{String(i + 1).padStart(2, '0')}</span>
                  <span className="slate text-ivory/50 tabular">{toTimecode((starts[i] / 100) * TIMELINE_SECONDS)}</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-ivory mb-2">{step.title}</h3>
                <p className="text-ivory/80 text-sm leading-relaxed">{step.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
