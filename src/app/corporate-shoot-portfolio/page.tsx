'use client';

import { Em, ShowcasePage } from '@/components/editorial/Showcase';

const corporateReels = [
  {
    id: 1,
    title: 'Executive Summary Alpha',
    thumbnail: 'https://api.microlink.io/?url=https://www.instagram.com/reel/DMCdspZSACx/&screenshot=true&meta=false&embed=screenshot.url',
    videoUrl: 'https://www.instagram.com/reel/DMCdspZSACx/embed',
    category: 'Corporate',
    type: 'reel'
  },
  {
    id: 2,
    title: 'Brand Vision Beta',
    thumbnail: 'https://img.youtube.com/vi/hdtGKrTJnrE/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/hdtGKrTJnrE',
    category: 'Corporate',
    type: 'reel'
  },
  {
    id: 3,
    title: 'Product Logic Gamma',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'Corporate',
    type: 'reel'
  },
  {
    id: 4,
    title: 'Strategy Session Delta',
    thumbnail: 'https://img.youtube.com/vi/I2R467vzWRo/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/I2R467vzWRo',
    category: 'Corporate',
    type: 'reel'
  }
];

export default function CorporateShootPortfolioPage() {
  return (
    <ShowcasePage
      back={{ href: '/', label: 'Back to Home' }}
      kicker="Enterprise Solutions"
      title={['Corporate', 'Professionalism.']}
      lede={
        <>
          Architecting <Em>brand authority</Em> through precision cinematography and sophisticated corporate visual strategies.
        </>
      }
      sections={[
        { clips: corporateReels, format: 'vertical', player: 'vertical' },
      ]}
      cta={{
        label: 'Enterprise Protocols',
        title: ['Elevate Your', 'Business.'],
        body: "Ready to deploy professional cinematography for your corporate narrative? Let's initiate the session.",
      }}
      service="Corporate Event Shoot"
    />
  );
}
