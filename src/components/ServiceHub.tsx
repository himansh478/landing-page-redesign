'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { RevealLines } from './motion/RevealLines';

// Services without an href are shown as plain text (their pages were removed).
const services: { title: string; description: string; href?: string; features: string[] }[] = [
  {
    title: 'Shoot and Editing',
    description: 'High-end production and cinematic storytelling with elite color grading, sound design, and ad films.',
    href: '/shoot-and-editing',
    features: ['4K Production', 'Viral Reels', 'Commercials', 'Color Grading'],
  },
  {
    title: 'Digital Authority',
    description: 'Strategic social media management that dominates the algorithm.',
    href: '/social-media-management',
    features: ['Growth Systems', 'Content Strategy', 'Analytics'],
  },
  {
    title: 'Digital Architecture',
    description: 'Advanced web deployment and AI-driven automation systems.',
    href: '/technical-solutions',
    features: ['Next.js Apps', 'AI Automation', 'Enterprise Scale'],
  },
];

// An editorial index instead of a card grid. Hovering (or keyboard-focusing)
// a row sweeps editorial-blue ink across it from the left.
export function ServiceHub() {
  return (
    <section className="relative bg-paper py-24 sm:py-32 border-t border-ink/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8 mb-14 sm:mb-20 items-end">
          <div className="lg:col-span-7">
            <p className="slate slate-mark text-editorial mb-5">Sc.02 — Services</p>
            <RevealLines as="h2" className="display-lg font-display text-ink" lines={['Your complete', 'creative arsenal']} />
          </div>
          <p className="lg:col-span-4 lg:col-start-9 text-lg text-ink/70 leading-relaxed">
            From viral social content to studio-grade production. Select your gateway to digital dominance.
          </p>
        </div>

        <ul className="border-t border-ink/20">
          {services.map((service, i) => {
            const row = (
              <>
                {service.href && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-editorial origin-left scale-x-0 transition-transform duration-700 ease-reveal group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none"
                  />
                )}
                <span className="relative col-span-2 sm:col-span-1 slate text-ink/45 transition-colors duration-500 group-hover:text-coral group-focus-visible:text-coral">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="relative col-span-10 sm:col-span-11 lg:col-span-4 font-display font-extrabold tracking-[-0.03em] text-ink [font-size:clamp(1.6rem,1rem+1.9vw,2.6rem)] leading-[1.05] transition-colors duration-500 group-hover:text-ivory group-focus-visible:text-ivory">
                  {service.title}
                </h3>
                <p className="relative col-span-12 sm:col-start-2 sm:col-span-10 lg:col-start-auto lg:col-span-4 text-ink/70 leading-relaxed transition-colors duration-500 group-hover:text-ivory/85 group-focus-visible:text-ivory/85">
                  {service.description}
                </p>
                <div className="relative col-span-12 sm:col-start-2 sm:col-span-11 lg:col-start-auto lg:col-span-3 flex items-center justify-between gap-4">
                  <ul className="flex flex-wrap gap-1.5" aria-label={`${service.title} includes`}>
                    {service.features.map((f) => (
                      <li
                        key={f}
                        className="slate !text-[10px] !tracking-[0.12em] px-2 py-1 rounded-[3px] border border-ink/20 text-ink/65 transition-colors duration-500 group-hover:border-ivory/30 group-hover:text-ivory/80 group-focus-visible:border-ivory/30 group-focus-visible:text-ivory/80"
                      >
                        {f}
                      </li>
                    ))}
                  </ul>
                  {service.href && (
                    <span
                      aria-hidden="true"
                      className="flex-shrink-0 w-11 h-11 rounded-full bg-coral flex items-center justify-center text-ink transition-transform duration-500 ease-reveal group-hover:-rotate-45 group-hover:scale-110 group-focus-visible:-rotate-45"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </div>
              </>
            );
            const rowClass = 'relative grid grid-cols-12 gap-x-4 gap-y-3 items-center py-7 sm:py-9 px-1 sm:px-5 overflow-hidden';
            return (
              <li key={service.title} className="border-b border-ink/20">
                {service.href ? (
                  <Link href={service.href} className={`group ${rowClass} focus-visible:outline-offset-[-2px]`}>
                    {row}
                  </Link>
                ) : (
                  <div className={rowClass}>{row}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
