import type { Metadata } from 'next';
import AboutUsClient from './AboutUsClient';

export const metadata: Metadata = {
  title: 'About Us — The Story of Cwaya Creative Studio | Sehore MP',
  description: 'Meet the Cwaya team — a creative powerhouse from Sehore, MP, offering video editing, photography, social media management, and web development across India.',
  alternates: {
    canonical: 'https://www.cwaya.me/about-us',
  },
};

export default function AboutUsPage() {
  return <AboutUsClient />;
}
