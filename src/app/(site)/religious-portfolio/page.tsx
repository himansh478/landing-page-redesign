'use client';

import { Em, ShowcasePage } from '@/components/editorial/Showcase';

const religiousHighlights = [
  {
    id: 1,
    title: 'Divine Ritual Alpha',
    thumbnail: 'https://api.microlink.io/?url=https://www.instagram.com/reel/DLg49v_tcQk/&screenshot=true&meta=false&embed=screenshot.url',
    videoUrl: 'https://www.instagram.com/reel/DLg49v_tcQk/embed',
    category: 'Ceremony',
    duration: '2:00',
  },
  {
    id: 2,
    title: 'Sacred Atmosphere Beta',
    thumbnail: 'https://api.microlink.io/?url=https://www.instagram.com/reel/DLeN8NsIvlB/&screenshot=true&meta=false&embed=screenshot.url',
    videoUrl: 'https://www.instagram.com/reel/DLeN8NsIvlB/embed',
    category: 'Devotional',
    duration: '1:30',
  }
];

export default function ReligiousPortfolioPage() {
  return (
    <ShowcasePage
      back={{ href: '/', label: 'Back to Home' }}
      kicker="Sacred Event Documentation"
      title={['Religious', 'Spirituality.']}
      lede={
        <>
          Capturing the <Em>spiritual essence</Em> and profound emotional atmosphere of holy gatherings through respectful and artistic cinematography.
        </>
      }
      sections={[
        { clips: religiousHighlights, format: 'feature', player: 'vertical' },
      ]}
      cta={{
        label: 'Devotional Protocols',
        title: ['Sacred', 'Memories.'],
        body: "Ready to deploy high-reverence production protocols for your sacred event? Let's initiate the session.",
      }}
      service="Religious Shoot"
    />
  );
}
