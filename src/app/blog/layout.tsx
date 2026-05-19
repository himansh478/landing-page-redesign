import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog & Insights — Cwaya Creative Studio',
  description:
    'Expert articles on video editing, professional photography, social media strategy, and AI in creative production. Stay ahead with Cwaya Studio insights.',
  keywords: [
    'video editing tips',
    'professional photography',
    'social media strategy',
    'AI video production',
    'content creation India',
    'Cwaya blog',
    'creative studio insights',
  ],
  openGraph: {
    title: 'The Cwaya Journal — Creative Industry Insights',
    description:
      'Deep-dive articles on video editing, photography, social media, and technology from the Cwaya Creative Studio team.',
    type: 'website',
    url: 'https://www.cwaya.me/blog',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&q=80&w=1200',
        width: 1200,
        height: 630,
        alt: 'Cwaya Blog — Creative Studio Insights',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cwaya Blog — Creative Insights',
    description: 'Expert perspectives on cinema, photography, and digital storytelling.',
  },
  alternates: {
    canonical: 'https://www.cwaya.me/blog',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
