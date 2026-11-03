'use client';

import { Menu, X, Share2, Package, ArrowUpRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SearchBar } from './SearchBar';
import { CwayaMark } from './brand/CwayaMark';
import { ScrollTimecode } from './motion/ScrollTimecode';
import { SHOW_WORK_LINKS } from '@/lib/features';

// Blog / About / Contact / Connect live in the footer's navigation block,
// and the social icons sit just under the header on the homepage — so the
// header itself stays a quiet bar: logo, search, AI Caption, Courses, packages, share.

const mobileLinks = [
  { href: '/ai-caption', label: 'AI Caption' },
  { href: '/courses', label: 'Courses' },
  ...(SHOW_WORK_LINKS
    ? [
        { href: '/find-to-fill', label: 'I have work' },
        { href: '/find-clients', label: 'Find work' },
      ]
    : []),
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileMenuOpen]);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.origin : 'https://www.cwaya.me';

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          text: 'Check out Cwaya for premium video editing, photography, and social media management!',
          url,
        });
      } catch {
        // user cancelled
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        alert('Website link copied to clipboard! Share it with your friends.');
      } catch {
        // clipboard not available
      }
    }
  };

  const isCurrent = (href: string) => (pathname === href || pathname?.startsWith(`${href}/`) ? 'page' : undefined);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-ivory/85 backdrop-blur-md border-b border-ink/10">
      <nav aria-label="Main" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0" aria-label="Cwaya — home">
            <CwayaMark className="w-8 h-8 sm:w-9 sm:h-9" />
            <span className="font-display text-ink text-xl sm:text-2xl font-extrabold tracking-[-0.04em]">Cwaya</span>
          </Link>

          <div className="hidden md:flex flex-1 max-w-md">
            <SearchBar />
          </div>

          <div className="hidden md:flex items-center justify-end gap-2 lg:gap-3">
            <Link
              href="/ai-caption"
              className="pencil-link mr-2 py-1 text-[0.8125rem] font-semibold text-ink/80 hover:text-ink transition-colors"
            >
              AI Caption
            </Link>

            <Link
              href="/courses"
              aria-current={isCurrent('/courses')}
              className="pencil-link mr-2 py-1 text-[0.8125rem] font-semibold text-ink/80 hover:text-ink transition-colors"
            >
              Courses
            </Link>

            <Link
              href="/packages"
              className="group inline-flex items-center gap-2 bg-coral text-ink pl-3.5 pr-4 h-10 rounded-md text-[0.8125rem] font-semibold transition-colors duration-300 hover:bg-ink hover:text-ivory"
            >
              <Package className="w-4 h-4 transition-transform duration-500 ease-reveal group-hover:-rotate-12" aria-hidden="true" />
              My Packages
            </Link>

            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-md border border-ink/15 text-ink/70 flex items-center justify-center transition-colors duration-300 hover:border-coral hover:bg-coral hover:text-ink"
              aria-label="Share this website"
              title="Share this website"
            >
              <Share2 className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="md:hidden text-ink w-11 h-11 -mr-2 flex items-center justify-center rounded-md hover:bg-ink/5 transition-colors"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
          </button>
        </div>
      </nav>

      <ScrollTimecode />

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden bg-ivory border-t border-ink/10"
          >
            <div className="px-4 pt-5 pb-8 max-w-md mx-auto">
              <div className="mb-5">
                <SearchBar />
              </div>

              <ul className="border-t border-ink/10">
                {mobileLinks.map((link, i) => (
                  <li key={link.href} className="border-b border-ink/10">
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      aria-current={isCurrent(link.href)}
                      className="group flex items-center justify-between py-4 font-display text-2xl font-bold tracking-tight text-ink"
                    >
                      <span className="flex items-baseline gap-3">
                        <span className="slate text-ink/40">{String(i + 1).padStart(2, '0')}</span>
                        {link.label}
                      </span>
                      <span className="w-9 h-9 rounded-full bg-coral text-ink flex items-center justify-center">
                        <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="grid grid-cols-[1fr_auto] gap-3 mt-6">
                <Link
                  href="/packages"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center justify-center gap-2 bg-coral text-ink h-12 rounded-md font-semibold"
                >
                  <Package className="w-5 h-5" aria-hidden="true" />
                  My Packages
                </Link>
                <button
                  onClick={() => {
                    handleShare();
                    setMobileMenuOpen(false);
                  }}
                  className="w-12 h-12 rounded-md border border-ink/15 text-ink flex items-center justify-center"
                  aria-label="Share this website"
                >
                  <Share2 className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <a
                href="#footer-nav"
                onClick={() => setMobileMenuOpen(false)}
                className="block slate text-ink/55 text-center mt-6 py-3 hover:text-ink"
              >
                Blog · About · Contact · Connect ↓
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
