import { Header } from '../components/Header';
import { HeroSection } from '../components/HeroSection';
import { AiToolsSection } from '../components/AiToolsSection';
import { ServiceHub } from '../components/ServiceHub';
import { ClientWall } from '../components/ClientWall';
import { Footer } from '../components/Footer';

export function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        {/* <AiToolsSection /> */}
        <ServiceHub />
        <ClientWall />
      </main>
      <Footer />
    </>
  );
}
