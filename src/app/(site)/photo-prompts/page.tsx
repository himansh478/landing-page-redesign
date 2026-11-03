import type { Metadata } from 'next';
import { PageIntro, PageShell } from '@/components/editorial/PageIntro';
import { PromptGallery } from '@/components/editorial/PromptCard';
import { photoPrompts } from '@/data/photoPrompts';
import { getPublishedPrompts } from '@/app/actions/prompts';

export const metadata: Metadata = {
  title: 'Photo Prompts — Cwaya Creative Studio',
  description: 'Ready-to-use AI photo prompts from the Cwaya studio, with the result each one makes.',
  alternates: {
    canonical: 'https://www.cwaya.me/photo-prompts',
  },
};

// Prompts uploaded from the admin panel change at any time.
export const dynamic = 'force-dynamic';

export default async function PhotoPromptsPage() {
  const uploaded = await getPublishedPrompts('photo');
  const items = [...uploaded, ...photoPrompts];

  return (
    <PageShell>
      <PageIntro
        back={{ href: '/', label: 'Back to Home' }}
        note={<span className="tabular">{String(items.length).padStart(2, '0')} prompts</span>}
        title={['Photo', 'Prompts']}
        lede="Ready-to-use photo prompts from the Cwaya studio. Upload your photo, paste the prompt, and get the same look."
      />

      <div className="mt-12 sm:mt-16">
        <PromptGallery items={items} />
      </div>
    </PageShell>
  );
}
