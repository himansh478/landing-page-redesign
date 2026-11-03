'use client';

import { RevealLines } from './motion/RevealLines';
import { CountUp } from './motion/CountUp';

const brands = [
  'Cinematic Precision',
  'Viral Engineering',
  'Neural Workflows',
  'Elite Production',
  'Creative Dominance',
  'Studio Grade Quality',
  'Punctual Delivery',
  'Unlimited Potential',
];

// The studio's own figures, unchanged. 24/7 isn't a count, so it stays static.
const secondaryStats = [
  { label: 'Assets delivered', node: <CountUp value={2} suffix="k+" duration={1.2} /> },
  { label: 'Retention rate', node: <CountUp value={100} suffix="%" /> },
  { label: 'Support systems', node: <span className="tabular">24/7</span> },
];

function Diamond() {
  return (
    <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 flex-shrink-0" aria-hidden="true">
      <rect x="1.5" y="1.5" width="7" height="7" transform="rotate(45 5 5)" fill="var(--ink)" />
    </svg>
  );
}

export function ClientWall() {
  return (
    <section className="relative bg-ivory pt-24 sm:pt-32 pb-28 sm:pb-36 overflow-hidden border-t border-ink/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8 items-end mb-16 sm:mb-20">
          <div className="lg:col-span-7">
            <p className="slate slate-mark text-editorial mb-5">Sc.04 — Performance report</p>
            <RevealLines as="h2" className="display-lg font-display text-ink" lines={['The studio', 'performance report']} />
          </div>
          <p className="lg:col-span-4 lg:col-start-9 text-lg text-ink/70 leading-relaxed">
            Measurable impact for brands that demand nothing less than perfection. Our track record speaks in results, not just pixels.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-x-8 gap-y-10 border-t border-ink/20 pt-10">
          <dl className="lg:col-span-6">
            <div>
              <dt className="slate text-ink/55 mb-4">Global clients</dt>
              <dd className="font-display font-black text-editorial tracking-[-0.06em] leading-[0.85] [font-size:clamp(5rem,2rem+12vw,13rem)]">
                <CountUp value={500} suffix="+" />
                <span aria-hidden="true" className="mt-6 flex items-center gap-2">
                  <span className="h-2 w-24 sm:w-32 bg-coral rounded-full" />
                  <span className="h-2 w-2 bg-coral rounded-full" />
                  <span className="h-2 w-2 bg-coral/50 rounded-full" />
                </span>
              </dd>
            </div>
          </dl>
          <dl className="lg:col-span-5 lg:col-start-8 flex flex-col">
            {secondaryStats.map((stat) => (
              <div key={stat.label} className="flex items-end justify-between gap-6 py-5 border-b border-ink/15 first:pt-0">
                <dt className="slate text-ink/55 pb-2">{stat.label}</dt>
                <dd className="font-display font-extrabold text-ink tracking-[-0.04em] leading-none [font-size:clamp(2.5rem,1.6rem+2.6vw,4.25rem)]">
                  {stat.node}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Two crossed strips of tape — coral over ink — laid askew across the page */}
      <div className="relative mt-24 sm:mt-28 h-[7.5rem] sm:h-[9rem]">
        <div aria-hidden="true" className="absolute inset-x-0 top-1/2 -mx-8 rotate-[1.5deg] bg-ink h-12 sm:h-14 -translate-y-1/2" />
        <div className="absolute inset-x-0 top-1/2 -mx-8 -rotate-2 bg-coral py-4 sm:py-5 -translate-y-1/2 shadow-[0_20px_40px_-20px_rgb(var(--ink-rgb)/0.55)]">
          <div className="flex whitespace-nowrap animate-marquee w-max" aria-hidden="true">
            {[...brands, ...brands].map((brand, i) => (
              <span key={i} className="inline-flex items-center gap-6 sm:gap-8 px-3 sm:px-4 font-display font-bold uppercase tracking-[-0.01em] text-ink text-xl sm:text-3xl">
                {brand}
                <Diamond />
              </span>
            ))}
          </div>
          <p className="sr-only">{brands.join(', ')}</p>
        </div>
      </div>
    </section>
  );
}
