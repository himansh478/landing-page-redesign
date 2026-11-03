'use client';

import { Em, ShowcasePage } from '@/components/editorial/Showcase';

const socialHighlights = [
  {
    id: 1,
    title: 'Viral Logic Alpha',
    thumbnail: 'https://img.youtube.com/vi/hGIGiF7sc1U/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/hGIGiF7sc1U',
    category: 'Reel',
    duration: '0:15',
  },
  {
    id: 2,
    title: 'Retention Protocol Beta',
    thumbnail: 'https://img.youtube.com/vi/c3SliHVEu0E/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/c3SliHVEu0E',
    category: 'Short',
    duration: '0:30',
  }
];

export default function SocialVideoPortfolioPage() {
  return (
    <ShowcasePage
      back={{ href: '/', label: 'Back to Home' }}
      kicker="Social Retainment Protocols"
      title={['Social', 'Viralism.']}
      lede={
        <>
          Engineering <Em>high-velocity</Em> visual assets optimized for algorithmic dominance and maximum audience retention.
        </>
      }
      sections={[
        { clips: socialHighlights, format: 'vertical', player: 'vertical' },
      ]}
      cta={{
        label: 'Viral Protocols',
        title: ['Go', 'Viral.'],
        body: "Ready to deploy high-velocity social protocols for your content? Let's initiate the session.",
      }}
      service="Insta & YouTube Video Shoot"
    />
  );
}
