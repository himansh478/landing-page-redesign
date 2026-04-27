import { Header } from '../components/Header';
import { HeroSection } from '../components/HeroSection';
import { ServiceHub } from '../components/ServiceHub';
import { ClientWall } from '../components/ClientWall';
import { Footer } from '../components/Footer';

export function HomePage() {
  return (
    <>
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
