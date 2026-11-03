import type { Metadata } from 'next';
import BlogPageClient from './BlogPageClient';

export const metadata: Metadata = {
  title: 'The Journal — Creative Insights & Industry Tips | Cwaya Blog',
  description: 'Expert insights on video editing, wedding photography, reels, social media strategy, and AI-powered production from the Cwaya Creative Studio team.',
  alternates: {
    canonical: 'https://www.cwaya.me/blog',
  },
};

export default function BlogPage() {
  return <BlogPageClient />;
}
