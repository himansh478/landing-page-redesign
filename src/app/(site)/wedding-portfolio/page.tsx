'use client';

import { Em, ShowcasePage } from '@/components/editorial/Showcase';

const weddingHighlights = [
  {
    id: 1,
    title: 'Eternal Resonance Alpha',
    thumbnail: 'https://api.microlink.io/?url=https://www.instagram.com/reel/DZhPdlYINK6/&screenshot=true&meta=false&embed=screenshot.url',
    videoUrl: 'https://www.instagram.com/reel/DZhPdlYINK6/embed',
    category: 'Highlights',
    duration: '0:45',
  },
  {
    id: 2,
    title: 'Divine Union Beta',
    thumbnail: 'https://api.microlink.io/?url=https://www.instagram.com/reel/DZmBvfiovBg/&screenshot=true&meta=false&embed=screenshot.url',
    videoUrl: 'https://www.instagram.com/reel/DZmBvfiovBg/embed',
    category: 'Emotions',
    duration: '1:20',
  },
  {
    id: 3,
    title: 'Sacred Details Gamma',
    thumbnail: 'https://img.youtube.com/vi/mDTOyJBvJs8/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/mDTOyJBvJs8',
    category: 'Details',
    duration: '0:30',
  },
  {
    id: 4,
    title: 'Ceremonial Celebration Delta',
    thumbnail: 'https://api.microlink.io/?url=https://www.instagram.com/reel/DX_Ly0dKEtP/&screenshot=true&meta=false&embed=screenshot.url',
    videoUrl: 'https://www.instagram.com/reel/DX_Ly0dKEtP/embed',
    category: 'Celebration',
    duration: '1:00',
  }
];

export default function WeddingPortfolioPage() {
  return (
    <ShowcasePage
      back={{ href: '/', label: 'Back to Home' }}
      kicker="Eternal Narrative Documentation"
      title={['Wedding', 'Portfolio.']}
      lede={
        <>
          Preserving <Em>timeless love stories</Em> through advanced cinematic protocols and emotional narrative engineering.
        </>
      }
      sections={[
        { clips: weddingHighlights, format: 'vertical', player: 'vertical' },
      ]}
      cta={{
        label: 'Preservation Protocols',
        title: ['Protect The', 'Legacy.'],
        body: "Ready to deploy high-authority cinematic protocols for your union? Let's initiate the session.",
      }}
      service="Wedding Shoot"
    />
  );
}
