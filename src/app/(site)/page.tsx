import { HeroSection } from '@/components/HeroSection';
import { ServiceHub } from '@/components/ServiceHub';
import { ClientWall } from '@/components/ClientWall';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cwaya — Premium Creative Studio & Production',
  description: 'Cwaya is an elite creative agency offering high-end video editing and cinematic production.',
  openGraph: {
    title: 'Cwaya — Premium Creative Studio',
    description: 'Stop overpaying for mediocrity. Elite video editing and production solutions.',
    url: 'https://www.cwaya.me',
    siteName: 'Cwaya',
    locale: 'en_US',
    type: 'website',
  },
};

import { FAQSection } from '@/components/FAQSection';
import { ProcessSection } from '@/components/ProcessSection';

export default function Home() {
  return (
    <>
      <HeroSection />
      <ServiceHub />
      <ProcessSection />
      <ClientWall />
      <FAQSection />
    </>
  );
}
