'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';

// A numbered clause in a document page (privacy, terms): icon in the margin,
// heading and body in the measure, a rule between clauses.
export function DocSection({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="group grid md:grid-cols-[5rem_1fr] gap-x-6 gap-y-5 py-10 sm:py-12 border-t border-ink/20"
    >
      <span
        aria-hidden="true"
        className="w-11 h-11 rounded-full border border-ink/20 text-ink flex items-center justify-center transition-colors duration-500 group-hover:bg-coral group-hover:border-coral [&_svg]:w-4 [&_svg]:h-4"
      >
        {icon}
      </span>
      <div className="min-w-0">
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-ink tracking-[-0.03em] leading-tight mb-5">{title}</h2>
        {children}
      </div>
    </motion.section>
  );
}

export const docBodyClass = 'text-lg text-ink/75 leading-relaxed';
