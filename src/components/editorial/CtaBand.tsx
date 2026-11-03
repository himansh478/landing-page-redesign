'use client';

import type { ReactNode } from 'react';
import { RevealLines } from '../motion/RevealLines';

// Closing call-to-action as a dark "screening room" panel. The last title
// line is marked in coral (coral passes on ink, never on ivory).
export function CtaBand({
  label,
  title,
  body,
  children,
  className = '',
}: {
  label?: string;
  title: ReactNode[];
  body?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const lines = title.map((line, i) =>
    i === title.length - 1 && title.length > 1 ? (
      <span key={i} className="text-coral">
        {line}
      </span>
    ) : (
      line
    ),
  );

  return (
    <section className={`on-ink relative bg-ink rounded-[4px] overflow-hidden shadow-[0_40px_80px_-40px_rgb(var(--ink-rgb)/0.55)] ${className}`}>
      <div className="relative grid lg:grid-cols-12 gap-10 lg:gap-8 items-end px-6 sm:px-10 lg:px-14 py-12 sm:py-16">
        <div className="lg:col-span-8">
          {label && (
            <p className="slate text-coral mb-5 flex items-center gap-2">
              <span aria-hidden="true" className="rec-dot w-1.5 h-1.5 rounded-full bg-coral" />
              {label}
            </p>
          )}
          <RevealLines as="h2" className="display-md font-display text-ivory" lines={lines} />
          {body && <p className="text-lg text-ivory/70 leading-relaxed mt-6 max-w-xl">{body}</p>}
        </div>
        {children && <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-stretch [&>*]:!h-auto [&>*]:min-h-14 [&>*]:py-3 [&>*]:text-center">{children}</div>}
      </div>
    </section>
  );
}
