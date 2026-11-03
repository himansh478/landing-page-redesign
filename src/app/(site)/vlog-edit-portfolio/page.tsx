'use client';

import { Em, ShowcasePage } from '@/components/editorial/Showcase';

const youtubeVideos = [
  {
    id: 1,
    title: 'Neural Journey Alpha',
    videoUrl: 'https://www.youtube.com/embed/ycx5GzNAzRk',
    thumbnail: 'https://img.youtube.com/vi/ycx5GzNAzRk/maxresdefault.jpg',
    type: 'youtube'
  },
  {
    id: 2,
    title: 'Cinematic Expansion Beta',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    type: 'youtube'
  },
  {
    id: 3,
    title: 'Visual Synthesis Gamma',
    videoUrl: 'https://www.youtube.com/embed/ulTmnr_u_Ew?si=AS3-4qqjMV9A0qLr',
    thumbnail: 'https://img.youtube.com/vi/ulTmnr_u_Ew/maxresdefault.jpg',
    type: 'youtube'
  }
];

const reelVideos = [
  {
    id: 4,
    title: 'Synaptic Reel Delta',
    videoUrl: 'https://www.youtube.com/embed/IQogBDh_jX0',
    thumbnail: 'https://img.youtube.com/vi/IQogBDh_jX0/maxresdefault.jpg',
    type: 'reel'
  },
  {
    id: 5,
    title: 'Viral Protocol Epsilon',
    videoUrl: 'https://youtube.com/embed/rpdcZPsCZHk?si=WsbtCBjsY6wkXOZt',
    thumbnail: 'https://img.youtube.com/vi/rpdcZPsCZHk/maxresdefault.jpg',
    type: 'reel'
  }
];

export default function VlogEditPortfolioPage() {
  return (
    <ShowcasePage
      back={{ href: '/', label: 'Back to Home' }}
      kicker="Dynamic Narrative Processing"
      title={['Vlog', 'Portfolio.']}
      lede={
        <>
          Deploying <Em>high-velocity edits</Em> for modern storytellers through advanced transition protocols and rhythmic engineering.
        </>
      }
      sections={[
        { title: 'Long Form Protocols', clips: youtubeVideos, format: 'wide', player: 'wide' },
        { title: 'Vertical Protocols', clips: reelVideos, format: 'vertical', player: 'vertical' },
      ]}
      cta={{
        label: 'Production Ready',
        title: ['Initiate Your', 'Vlog Edit.'],
        body: "Ready to deploy high-authority editing protocols for your vlogs? Let's initiate the session.",
      }}
      service="Vlog Edit"
    />
  );
}
