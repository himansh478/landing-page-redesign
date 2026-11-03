'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PageIntro, PageShell } from './PageIntro';
import { btnArrow, btnGhost } from './styles';

// Placeholder for the prompt libraries until the prompts are added.
export function PromptsComingSoon({
  kind,
  other,
}: {
  kind: 'Photo' | 'Video';
  other: { href: string; label: string };
}) {
  return (
    <PageShell>
      <PageIntro
        back={{ href: '/', label: 'Back to Home' }}
        note={`${kind} prompts`}
        title={[kind, 'Prompts']}
        lede={`Ready-to-use ${kind.toLowerCase()} prompts from the Cwaya studio.`}
      />

      <div className="mt-16 sm:mt-24 border-y border-ink/20 py-16 sm:py-20 text-center">
        <p className="slate text-editorial mb-4 flex items-center justify-center gap-2">
          <span aria-hidden="true" className="rec-dot w-1.5 h-1.5 rounded-full bg-coral" />
          Coming soon
        </p>
        <p className="font-display text-2xl sm:text-3xl font-extrabold text-ink tracking-[-0.03em] max-w-xl mx-auto">
          We&apos;re adding the prompts. Check back soon.
        </p>
        <div className="mt-10 flex justify-center">
          <Link href={other.href} className={btnGhost}>
            {other.label}
            <ArrowRight className={btnArrow} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
