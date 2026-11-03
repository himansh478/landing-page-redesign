import type { Metadata } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import './(site)/globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MotionProvider } from '@/components/motion/MotionProvider';
import NotFound from './(site)/not-found';

// The website and AI Captions each have their own root layout, so an address that
// matches neither gets this page, dressed like the website.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat', display: 'swap' });

export const metadata: Metadata = {
  title: 'Page not found | Cwaya',
  robots: 'noindex',
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable}`}>
      <body className="antialiased">
        <MotionProvider>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-grow">
                <NotFound />
              </main>
              <Footer />
            </div>
          </AuthProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
