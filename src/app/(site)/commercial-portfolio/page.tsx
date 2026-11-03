'use client';

import { Em, ShowcasePage } from '@/components/editorial/Showcase';

const commercialHighlights = [
  {
    id: 1,
    title: 'Product Narrative Alpha',
    thumbnail: 'https://api.microlink.io/?url=https://www.instagram.com/reel/DPd-UfYiO1e/&screenshot=true&meta=false&embed=screenshot.url',
    videoUrl: 'https://www.instagram.com/reel/DPd-UfYiO1e/embed',
    category: 'Commercial',
    duration: '0:30',
  },
  {
    id: 2,
    title: 'Brand Essence Beta',
    thumbnail: 'https://api.microlink.io/?url=https://www.instagram.com/reel/DOvjZH2DTJq/&screenshot=true&meta=false&embed=screenshot.url',
    videoUrl: 'https://www.instagram.com/reel/DOvjZH2DTJq/embed',
    category: 'Ad',
    duration: '0:45',
  }
];

export default function CommercialPortfolioPage() {
  return (
    <ShowcasePage
      back={{ href: '/', label: 'Back to Home' }}
      kicker="Conversion Focused Production"
      title={['Commercial', 'Persuasion.']}
      lede={
        <>
          Engineered to <Em>accelerate growth</Em> through high-fidelity product storytelling and strategic visual placement.
        </>
      }
      sections={[
        { clips: commercialHighlights, format: 'feature', player: 'vertical' },
      ]}
      cta={{
        label: 'Growth Engineering',
        title: ['Elevate Your', 'Brand.'],
        body: "Ready to deploy high-conversion commercial protocols for your product? Let's initiate the session.",
      }}
      service="Commercial Shoot"
    />
  );
}
