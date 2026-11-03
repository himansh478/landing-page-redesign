import type { Metadata } from 'next';
import { PageIntro, PageShell } from '@/components/editorial/PageIntro';
import { PromptGallery } from '@/components/editorial/PromptCard';
import { PromptsComingSoon } from '@/components/editorial/PromptsComingSoon';
import { getPublishedPrompts } from '@/app/actions/prompts';

export const metadata: Metadata = {
  title: 'Video Prompts — Cwaya Creative Studio',
  description: 'Ready-to-use AI video prompts from the Cwaya studio, with the result each one makes.',
  alternates: {
    canonical: 'https://www.cwaya.me/video-prompts',
  },
};

// Prompts uploaded from the admin panel change at any time.
export const dynamic = 'force-dynamic';

export default async function VideoPromptsPage() {
  const items = await getPublishedPrompts('video');

  if (items.length === 0) {
    return <PromptsComingSoon kind="Video" other={{ href: '/photo-prompts', label: 'Photos prompt' }} />;
  }

  return (
    <PageShell>
      <PageIntro
        back={{ href: '/', label: 'Back to Home' }}
        note={<span className="tabular">{String(items.length).padStart(2, '0')} prompts</span>}
        title={['Video', 'Prompts']}
        lede="Ready-to-use video prompts from the Cwaya studio. Upload your clip or photo, paste the prompt, and get the same look."
      />

      <div className="mt-12 sm:mt-16">
        <PromptGallery items={items} />
      </div>
    </PageShell>
  );
}
