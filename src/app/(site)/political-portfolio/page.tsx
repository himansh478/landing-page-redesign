'use client';

import { Em, ShowcasePage } from '@/components/editorial/Showcase';

const politicalHighlights = [
  {
    id: 1,
    title: 'Campaign Vision Alpha',
    thumbnail: 'https://api.microlink.io/?url=https://www.instagram.com/reel/DRMgtkXjQs6/&screenshot=true&meta=false&embed=screenshot.url',
    videoUrl: 'https://www.instagram.com/reel/DRMgtkXjQs6/embed',
    category: 'Campaign',
    duration: '1:00',
  },
  {
    id: 2,
    title: 'Rally Momentum Beta',
    thumbnail: 'https://api.microlink.io/?url=https://www.instagram.com/reel/DPK5HOHkhh1/&screenshot=true&meta=false&embed=screenshot.url',
    videoUrl: 'https://www.instagram.com/reel/DPK5HOHkhh1/embed',
    category: 'Interview',
    duration: '2:00',
  }
];

export default function PoliticalPortfolioPage() {
  return (
    <ShowcasePage
      back={{ href: '/', label: 'Back to Home' }}
      kicker="Strategic Public Messaging"
      title={['Political', 'Authority.']}
      lede={
        <>
          Architecting <Em>ideological resonance</Em> through powerful campaign cinematography and authoritative event coverage.
        </>
      }
      sections={[
        { clips: politicalHighlights, format: 'feature', player: 'vertical' },
      ]}
      cta={{
        label: 'Influence Engineering',
        title: ['Make An', 'Impact.'],
        body: "Ready to deploy high-authority political protocols for your campaign? Let's initiate the session.",
      }}
      service="Political Shoot"
    />
  );
}
