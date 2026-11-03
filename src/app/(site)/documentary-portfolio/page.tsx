'use client';

import { Em, ShowcasePage } from '@/components/editorial/Showcase';

const documentaryVideos = [
  {
    id: 1,
    title: 'Neural Reality Alpha',
    thumbnail: 'https://img.youtube.com/vi/OtP2gr4hZGQ/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/OtP2gr4hZGQ?si=YBidET9TA93RUbzS',
    category: 'Lifestyle',
    duration: '18:45',
    type: 'documentary'
  },
  {
    id: 2,
    title: 'Ecological Protocol Beta',
    thumbnail: 'https://img.youtube.com/vi/aUOf2anD2n8/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/aUOf2anD2n8?si=QvY1pvoo5XgVd1vt',
    category: 'Environment',
    duration: '22:30',
    type: 'documentary'
  },
  {
    id: 3,
    title: 'Cultural Synthesis Gamma',
    thumbnail: 'https://img.youtube.com/vi/vh9rBp_4eHU/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/vh9rBp_4eHU?si=pMQ0Cbwyt4tKUVdY',
    category: 'Culture',
    duration: '25:15',
    type: 'documentary'
  }
];

const documentaryShorts = [
  {
    id: 4,
    title: 'Social Impact Delta',
    thumbnail: 'https://img.youtube.com/vi/lcUJ8kQ7vfs/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/lcUJ8kQ7vfs',
    type: 'short'
  },
  {
    id: 5,
    title: 'Natural Logic Epsilon',
    thumbnail: 'https://img.youtube.com/vi/C54oK8D9cDg/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/C54oK8D9cDg',
    type: 'short'
  }
];

export default function DocumentaryPortfolioPage() {
  return (
    <ShowcasePage
      back={{ href: '/', label: 'Back to Home' }}
      kicker="Documentary Narrative Core"
      title={['Documentary', 'Portfolio.']}
      lede={
        <>
          Engineering <Em>high-authority narratives</Em> through immersive pacing protocols and cinematic storytelling architecture.
        </>
      }
      sections={[
        { title: 'Cinematic Films', clips: documentaryVideos, format: 'wide', player: 'wide' },
        { title: 'Vertical Insights', clips: documentaryShorts, format: 'vertical', player: 'vertical' },
      ]}
      cta={{
        label: 'Archive Node',
        title: ['Tell Your', 'Truth.'],
        body: "Ready to deploy high-authority documentary protocols for your vision? Let's initiate the session.",
      }}
      service="Documentary Edit"
    />
  );
}
