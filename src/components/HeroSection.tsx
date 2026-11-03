'use client';

import { motion, useAnimationFrame, useReducedMotion } from 'motion/react';
import { ArrowRight, ArrowUpRight, Camera, Clapperboard } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';
import { RevealLines } from './motion/RevealLines';
import { Magnetic } from './motion/Magnetic';
import { useMediaQuery } from './motion/useMediaQuery';
import { InkShader } from './hero/InkShader';
import { socialLinks } from './brand/socials';
import { SHOW_WORK_LINKS } from '@/lib/features';
import { toTimecode } from '@/lib/timecode';

const EASE = [0.16, 1, 0.3, 1] as const;

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: EASE },
});

// The editor's grease pencil: a coral stroke cuts "mediocrity" like a
// rejected take, and the word drops back.
function CutWord({ children }: { children: string }) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      <motion.span
        className="relative"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0.55 }}
        transition={{ delay: 1.75, duration: 0.6 }}
      >
        {children}
      </motion.span>
      <motion.span
        aria-hidden="true"
        className="absolute left-[-3%] right-[-2%] top-[50%] h-[0.09em] rounded-full bg-coral origin-left"
        style={{ rotate: -2.5 }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 1.25, duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
      />
      <motion.span
        aria-hidden="true"
        className="hidden sm:inline-block align-top slate !text-[0.7rem] text-coral ml-3 mt-[0.4em]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.4 }}
      >
        Cut
      </motion.span>
    </span>
  );
}

// Static stand-in for the shader on phones and when WebGL isn't used.
function StaticInk() {
  return (
    <div
      className="grain absolute inset-0"
      style={{
        background:
          'radial-gradient(55% 70% at 72% 35%, rgb(var(--editorial-rgb) / 0.9), transparent 62%), radial-gradient(38% 48% at 28% 72%, rgb(var(--coral-rgb) / 0.75), transparent 60%), radial-gradient(30% 40% at 88% 82%, rgb(var(--ink-rgb) / 0.85), transparent 62%), var(--paper)',
      }}
    />
  );
}

function CropMarks() {
  const corner = 'absolute w-5 h-5 border-ink/60';
  return (
    <div aria-hidden="true" className="absolute inset-3 pointer-events-none">
      <span className={`${corner} left-0 top-0 border-l-2 border-t-2`} />
      <span className={`${corner} right-0 top-0 border-r-2 border-t-2`} />
      <span className={`${corner} left-0 bottom-0 border-l-2 border-b-2`} />
      <span className={`${corner} right-0 bottom-0 border-r-2 border-b-2`} />
    </div>
  );
}

function Monitor() {
  const desktop = useMediaQuery('(min-width: 768px)');
  const reduce = useReducedMotion();
  const tc = useRef<HTMLSpanElement>(null);
  const last = useRef('');

  useAnimationFrame((t) => {
    if (reduce || !tc.current) return;
    const next = toTimecode(t / 1000);
    if (next !== last.current) {
      last.current = next;
      tc.current.textContent = next;
    }
  });

  const chip = 'inline-flex items-center gap-1.5 bg-ink/80 text-ivory slate !text-[10px] !tracking-[0.14em] px-2 py-1 rounded-[3px] backdrop-blur-sm';

  return (
    <figure className="w-full">
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[4px] bg-paper ring-1 ring-ink/15 shadow-[0_40px_80px_-40px_rgb(var(--ink-rgb)/0.55)]">
        <StaticInk />
        {desktop && <InkShader className="absolute inset-0 w-full h-full" />}
        <CropMarks />
        <div aria-hidden="true" className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-between pointer-events-none">
          <div className="flex justify-between">
            <span className={chip}>
              <span className="rec-dot w-1.5 h-1.5 rounded-full bg-coral" />
              Rec <span ref={tc} className="tabular">00:00:00:00</span>
            </span>
            <span className={chip}>4K · 25p</span>
          </div>
          <div className="flex justify-between">
            <span className={chip}>A001 · C014</span>
            <span className={chip}>Sc.01 · Tk.02</span>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 flex justify-between gap-4 slate text-ink/50">
        <span>Fig. 01 — The monitor</span>
        <span className="hidden md:inline">Move your cursor across it</span>
      </figcaption>
    </figure>
  );
}

const valueProps = ['Viral edits', 'Cinematic logic', 'Agency quality'];

function HeroSection() {
  return (
    <section className="grain relative bg-ivory overflow-hidden pt-28 sm:pt-32 pb-16 sm:pb-20">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Strip just under the header: social profiles, then the studio's tagline */}
        <motion.div
          {...fadeUp(0.05)}
          className="flex flex-wrap justify-between items-center gap-x-6 gap-y-3 pb-5 mb-8 sm:mb-10 border-b border-ink/15"
        >
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <ul className="flex items-center gap-1.5" aria-label="Cwaya on social media">
              {socialLinks.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    title={social.label}
                    className="w-11 h-11 sm:w-9 sm:h-9 rounded-md border border-ink/15 bg-paper/70 flex items-center justify-center text-ink/70 transition-colors duration-300 hover:bg-coral hover:border-coral hover:text-ink"
                  >
                    {social.icon}
                  </a>
                </li>
              ))}
            </ul>
            <p className="slate slate-mark text-editorial">The new standard in creative tech</p>
          </div>
          <p className="slate text-ink/50 hidden sm:block">Sehore, MP · Pan-India</p>
        </motion.div>

        <RevealLines
          as="h1"
          onScroll={false}
          delay={0.15}
          className="font-display font-extrabold text-ink tracking-[-0.045em] !leading-[0.95] [font-size:clamp(2.5rem,0.4rem+8.4vw,8.75rem)]"
          lines={['Stop overpaying', <span key="l2">for <CutWord>mediocrity.</CutWord></span>]}
        />

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-10 mt-12 sm:mt-16 items-start">
          <div className="lg:col-span-5 lg:pr-4">
            <motion.p {...fadeUp(0.55)} className="text-xl sm:text-2xl text-ink/80 leading-snug max-w-md">
              Everything your brand needs, under one{' '}
              {/* Coral highlighter behind ink text (coral text on ivory would fail contrast) */}
              <span className="text-ink font-semibold px-1 -mx-1 [box-decoration-break:clone] bg-[linear-gradient(transparent_55%,rgb(var(--coral-rgb)/0.55)_55%)]">
                creative roof.
              </span>
            </motion.p>

            <motion.div {...fadeUp(0.6)} className="flex flex-col sm:flex-row gap-3 mt-8">
              <Magnetic className="w-full sm:w-auto">
                <Link
                  href="/photo-prompts"
                  className="group inline-flex w-full sm:w-auto items-center justify-center gap-3 bg-editorial text-ivory h-14 pl-6 pr-2.5 rounded-md font-semibold transition-colors duration-300 hover:bg-ink"
                >
                  Photos prompt
                  <span className="w-9 h-9 rounded-[5px] bg-coral text-ink flex items-center justify-center">
                    <Camera className="w-4 h-4" aria-hidden="true" />
                  </span>
                </Link>
              </Magnetic>
              <Magnetic className="w-full sm:w-auto">
                <Link
                  href="/video-prompts"
                  className="group inline-flex w-full sm:w-auto items-center justify-center gap-3 h-14 pl-6 pr-2.5 rounded-md border border-ink/25 text-ink font-semibold transition-colors duration-300 hover:border-coral hover:bg-coral"
                >
                  Videos prompt
                  <span className="w-9 h-9 rounded-[5px] border border-ink/20 flex items-center justify-center transition-colors duration-300 group-hover:border-ink/40">
                    <Clapperboard className="w-4 h-4" aria-hidden="true" />
                  </span>
                </Link>
              </Magnetic>
            </motion.div>

            <motion.ul {...fadeUp(0.65)} className="flex flex-wrap gap-x-6 gap-y-2 mt-8" aria-label="What we deliver">
              {valueProps.map((v) => (
                <li key={v} className="slate text-ink/70 flex items-center gap-2">
                  <span aria-hidden="true" className="w-1.5 h-1.5 bg-coral rotate-45" />
                  {v}
                </li>
              ))}
            </motion.ul>

            {SHOW_WORK_LINKS && (
            <motion.div {...fadeUp(0.75)} className="flex flex-col sm:flex-row gap-3 mt-10">
              <Magnetic>
                <Link
                  href="/find-to-fill"
                  className="group inline-flex w-full sm:w-auto items-center justify-center gap-3 bg-editorial text-ivory h-14 pl-7 pr-2.5 rounded-md font-semibold transition-colors duration-300 hover:bg-ink"
                >
                  I have work
                  <span className="w-9 h-9 rounded-[5px] bg-coral text-ink flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 transition-transform duration-500 ease-reveal group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </Link>
              </Magnetic>
              <Magnetic>
                <Link
                  href="/find-clients"
                  className="inline-flex w-full sm:w-auto items-center justify-center h-14 px-7 rounded-md border border-ink/25 text-ink font-semibold transition-colors duration-300 hover:border-coral hover:bg-coral"
                >
                  Find work
                </Link>
              </Magnetic>
            </motion.div>
            )}
          </div>

          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
              animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
              transition={{ duration: 1.2, delay: 0.45, ease: EASE }}
            >
              <Monitor />
            </motion.div>

            {/* Sits under the monitor's "Fig. 01" caption */}
            <motion.div {...fadeUp(1.1)} className="mt-6">
              <Link
                href="/raw-clips"
                className="group flex items-center gap-3 py-3.5 border-y border-ink/15 text-ink transition-colors hover:bg-sand/40"
              >
                <span aria-hidden="true" className="rec-dot w-2 h-2 rounded-full bg-coral flex-shrink-0 ml-1" />
                <span className="font-semibold text-sm">Get 4K RAW clips for practice</span>
                <span className="text-sm text-ink/55 hidden sm:inline">Free &amp; paid downloads</span>
                <ArrowUpRight
                  className="w-4 h-4 ml-auto mr-1 text-ink/60 transition-transform duration-500 ease-reveal group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink"
                  aria-hidden="true"
                />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export { HeroSection };
