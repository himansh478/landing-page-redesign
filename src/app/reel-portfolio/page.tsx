'use client';

import { Em, ShowcasePage } from '@/components/editorial/Showcase';

const carDeliveryReels = [
  { id: 1, title: 'Supercar Unveiling Alpha', videoUrl: 'https://www.instagram.com/reel/DQWlhp6Dd0h/embed', thumbnail: 'https://api.microlink.io/?url=https://www.instagram.com/reel/DQWlhp6Dd0h/&screenshot=true&meta=false&embed=screenshot.url' },
  { id: 2, title: 'Luxury Logistics Beta', videoUrl: 'https://www.instagram.com/reel/DS_xSB-CBFQ/embed', thumbnail: 'https://api.microlink.io/?url=https://www.instagram.com/reel/DS_xSB-CBFQ/&screenshot=true&meta=false&embed=screenshot.url' },
  { id: 3, title: 'Exotic Feature Gamma', videoUrl: 'https://www.instagram.com/reel/DT1vBJbiJp7/embed', thumbnail: 'https://api.microlink.io/?url=https://www.instagram.com/reel/DT1vBJbiJp7/&screenshot=true&meta=false&embed=screenshot.url' },
  { id: 4, title: 'Delivery Experience Delta', videoUrl: 'https://www.instagram.com/reel/DUptpldEl1m/embed', thumbnail: 'https://api.microlink.io/?url=https://www.instagram.com/reel/DUptpldEl1m/&screenshot=true&meta=false&embed=screenshot.url' }
];

const bikeDeliveryReels = [
  { id: 5, title: 'Two-Wheel Torque Alpha', videoUrl: 'https://www.instagram.com/reel/DP2mnFAElO9/embed', thumbnail: 'https://api.microlink.io/?url=https://www.instagram.com/reel/DP2mnFAElO9/&screenshot=true&meta=false&embed=screenshot.url' },
  { id: 6, title: 'Urban Velocity Beta', videoUrl: 'https://www.instagram.com/reel/DPDKkzIktoU/embed', thumbnail: 'https://api.microlink.io/?url=https://www.instagram.com/reel/DPDKkzIktoU/&screenshot=true&meta=false&embed=screenshot.url' },
  { id: 7, title: 'Street Legend Gamma', videoUrl: 'https://www.instagram.com/reel/DNzZxUo5DoX/embed', thumbnail: 'https://api.microlink.io/?url=https://www.instagram.com/reel/DNzZxUo5DoX/&screenshot=true&meta=false&embed=screenshot.url' },
  { id: 8, title: 'Precision Shift Delta', videoUrl: 'https://www.instagram.com/reel/DM4eI0Ey8ft/embed', thumbnail: 'https://api.microlink.io/?url=https://www.instagram.com/reel/DM4eI0Ey8ft/&screenshot=true&meta=false&embed=screenshot.url' }
];

export default function ReelPortfolioPage() {
  return (
    <ShowcasePage
      back={{ href: '/', label: 'Back to Home' }}
      kicker="Vertical Synaptic Processing"
      title={['Reel', 'Portfolio.']}
      lede={
        <>
          Architecting <Em>viral resonance</Em> through advanced vertical protocols and synaptic visual transitions.
        </>
      }
      sections={[
        { title: 'Car and Bike Delivery Videos', clips: carDeliveryReels, format: 'vertical', player: 'vertical' },
        { title: 'Bike Highlights', clips: bikeDeliveryReels, format: 'vertical', player: 'vertical' },
      ]}
      cta={{
        label: 'Growth Protocols',
        title: ['Ready To', 'Go Viral?'],
        body: "Ready to deploy high-authority vertical protocols for your brand? Let's initiate the session.",
      }}
      service="Reel Edit"
    />
  );
}
