'use client';

import { Em, ShowcasePage } from '@/components/editorial/Showcase';

const cinematicHighlights = [
  {
    id: 1,
    title: 'Cinematic Protocol Alpha',
    thumbnail: 'https://api.microlink.io/?url=https://www.instagram.com/reel/DM1i55cyoue/&screenshot=true&meta=false&embed=screenshot.url',
    videoUrl: 'https://www.instagram.com/reel/DM1i55cyoue/embed',
    category: 'Film',
    duration: '3:00',
  },
  {
    id: 2,
    title: 'Visual Synthesis Beta',
    thumbnail: 'https://api.microlink.io/?url=https://www.instagram.com/reel/DMMhCJLymoi/&screenshot=true&meta=false&embed=screenshot.url',
    videoUrl: 'https://www.instagram.com/reel/DMMhCJLymoi/embed',
    category: 'Art',
    duration: '2:30',
  }
];

export default function CinematicPortfolioPage() {
  return (
    <ShowcasePage
      back={{ href: '/', label: 'Back to Home' }}
      kicker="High-End Visual Production"
      title={['Cinematic', 'Portfolio.']}
      lede={
        <>
          Architecting <Em>breathtaking visuals</Em> through Hollywood-grade equipment and immersive storytelling.
        </>
      }
      sections={[
        { clips: cinematicHighlights, format: 'feature', player: 'vertical' },
      ]}
      cta={{
        label: 'Premium Production',
        title: ['Capture The', 'Epic.'],
        body: "Ready to deploy high-authority cinematic protocols for your vision? Let's initiate the session.",
      }}
      service="Cinematic Shoot"
    />
  );
}
