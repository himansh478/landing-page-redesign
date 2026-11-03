'use client';

import { Em, ShowcasePage } from '@/components/editorial/Showcase';

const marketingHighlights = [
  {
    id: 1,
    title: 'Engagement Engine Alpha',
    thumbnail: 'https://api.microlink.io/?url=https://www.instagram.com/reel/DWBqP0MDQlj/&screenshot=true&meta=false&embed=screenshot.url',
    videoUrl: 'https://www.instagram.com/reel/DWBqP0MDQlj/embed',
    category: 'Marketing',
    duration: '1:00',
  },
  {
    id: 2,
    title: 'Promotional Pulse Beta',
    thumbnail: 'https://api.microlink.io/?url=https://www.instagram.com/reel/DP0Z2bjEjGg/&screenshot=true&meta=false&embed=screenshot.url',
    videoUrl: 'https://www.instagram.com/reel/DP0Z2bjEjGg/embed',
    category: 'Promotion',
    duration: '0:30',
  }
];

export default function MarketingPortfolioPage() {
  return (
    <ShowcasePage
      back={{ href: '/', label: 'Back to Home' }}
      kicker="Strategic Growth Production"
      title={['Marketing', 'Momentum.']}
      lede={
        <>
          Deploying <Em>attention-hacking</Em> visual strategies designed to convert viewers into brand advocates.
        </>
      }
      sections={[
        { clips: marketingHighlights, format: 'feature', player: 'vertical' },
      ]}
      cta={{
        label: 'Growth Protocols',
        title: ['Boost Your', 'Growth.'],
        body: "Ready to deploy high-impact marketing protocols for your brand? Let's initiate the session.",
      }}
      service="Marketing Shoot"
    />
  );
}
