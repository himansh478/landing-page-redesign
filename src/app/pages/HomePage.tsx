import { Helmet } from 'react-helmet-async';
import { Header } from '../components/Header';
import { HeroSection } from '../components/HeroSection';
import { ServiceHub } from '../components/ServiceHub';
import { ClientWall } from '../components/ClientWall';
import { Footer } from '../components/Footer';

export function HomePage() {
  return (
    <>
      <Helmet>
        <title>Cwaya — Premium Video Editing & Creative Agency in India</title>
        <meta name="description" content="Cwaya is a premium creative agency offering high-end video editing, wedding photography, and AI-powered automation solutions. Based in Sehore, India." />
        <link rel="canonical" href="https://www.cwaya.me/" />
      </Helmet>
      <Header />
      <main>
        <HeroSection />
        <ServiceHub />
        <ClientWall />
      </main>
      <Footer />
    </>
  );
}
