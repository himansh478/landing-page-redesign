'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { RevealLines } from '../motion/RevealLines';

const EASE = [0.16, 1, 0.3, 1] as const;

// Page opener for inner pages, matching /courses: a slate rule (back link or
// scene label on the left, a note on the right), the title set line by line,
// and a lede beside it. The last title line is inked in editorial blue.
export function PageIntro({
  back,
  label,
  note,
  title,
  lede,
  children,
  align = 'split',
}: {
  back?: { href: string; label: string };
  label?: string;
  note?: ReactNode;
  title: ReactNode[];
  lede?: ReactNode;
  children?: ReactNode;
  /** split: title left, lede right (default). stack: lede under the title. */
  align?: 'split' | 'stack';
}) {
  const lines = title.map((line, i) =>
    i === title.length - 1 && title.length > 1 ? (
      <span key={i} className="text-editorial">
        {line}
      </span>
    ) : (
      line
    ),
  );

  return (
    <header>
      <div className="flex justify-between items-center gap-4 pb-5 mb-10 sm:mb-12 border-b border-ink/15">
        {back ? (
          <Link href={back.href} className="pencil-link slate text-editorial inline-flex items-center gap-2">
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            {back.label}
          </Link>
        ) : (
          <p className="slate text-editorial">{label}</p>
        )}
        {note && <p className="slate text-ink/50 text-right">{note}</p>}
      </div>

      <div className={align === 'split' ? 'grid lg:grid-cols-12 gap-8 lg:gap-10 items-end' : ''}>
        <RevealLines
          as="h1"
          onScroll={false}
          className={`font-display font-extrabold text-ink tracking-[-0.04em] !leading-[0.95] [font-size:clamp(2.6rem,0.9rem+6vw,7rem)] [overflow-wrap:anywhere] ${
            align === 'split' ? 'lg:col-span-8' : 'max-w-5xl'
          }`}
          lines={lines}
        />
        {(lede || children) && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: EASE }}
            className={align === 'split' ? 'lg:col-span-4' : 'mt-8 max-w-2xl'}
          >
            {lede && <p className="text-lg text-ink/70 leading-relaxed">{lede}</p>}
            {children}
          </motion.div>
        )}
      </div>
    </header>
  );
}

// The ivory, grained page shell used under every inner page.
export function PageShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`grain relative bg-ivory min-h-screen pt-28 sm:pt-32 pb-24 overflow-x-clip ${className}`}>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}

// Section heading used inside pages: numbered slate, display title, optional lede.
export function SectionHead({
  label,
  title,
  lede,
  onInk = false,
  className = '',
}: {
  label?: string;
  title: ReactNode[];
  lede?: ReactNode;
  onInk?: boolean;
  className?: string;
}) {
  return (
    <div className={`grid lg:grid-cols-12 gap-6 lg:gap-8 items-end mb-12 sm:mb-14 ${className}`}>
      <div className="lg:col-span-7">
        {label && <p className={`slate mb-5 ${onInk ? 'text-coral' : 'text-editorial'}`}>{label}</p>}
        <RevealLines as="h2" className={`display-md font-display ${onInk ? 'text-ivory' : 'text-ink'}`} lines={title} />
      </div>
      {lede && (
        <p className={`lg:col-span-4 lg:col-start-9 text-lg leading-relaxed ${onInk ? 'text-ivory/70' : 'text-ink/70'}`}>{lede}</p>
      )}
    </div>
  );
}
