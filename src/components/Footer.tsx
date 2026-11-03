'use client';

import { Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { CwayaMark } from './brand/CwayaMark';
import { socialLinks, openAuthGate } from './brand/socials';
import { RevealLines } from './motion/RevealLines';
import { REEL_SECONDS, toTimecode } from '@/lib/timecode';

// The site's main navigation lives here (the header stays minimal).
const siteNav = [
  { href: '/blog', label: 'Blog', note: 'Notes from the edit bay' },
  { href: '/about-us', label: 'About', note: 'The studio' },
  { href: '/contact-us', label: 'Contact', note: 'Start a conversation' },
  { action: openAuthGate, label: 'Connect', note: 'Customers & collaborators' },
] as const;

const serviceLinks = [
  { href: '/social-media-management', label: 'Social Media Management' },
  { href: '/technical-solutions', label: 'Web Development' },
  { href: '/theme-based', label: 'Theme Based Shoots' },
  { href: '/courses', label: 'Courses' },
];

const companyLinks = [
  { href: '/wedding-portfolio', label: 'Portfolio' },
  { href: '/packages', label: 'Pricing & Packages' },
  { href: '/packages', label: 'Membership' },
  { href: '/join-as-partner', label: 'Join as Partner' },
];

const linkClass = 'text-ivory/65 hover:text-coral transition-colors text-sm';

const navCellClass =
  'group relative bg-ink flex flex-col gap-2 min-h-[10rem] sm:min-h-[11.5rem] p-5 sm:p-7 text-left transition-colors duration-500 hover:bg-[#182A3A]';

// Note sits under the number and the title is pinned to the bottom edge, so
// titles line up across tiles even when a note wraps to two lines.
function NavCellBody({ index, label, note }: { index: number; label: string; note: string }) {
  return (
    <>
      <span className="flex items-start justify-between gap-3">
        <span className="slate text-coral pt-1">{String(index + 1).padStart(2, '0')}</span>
        <span
          aria-hidden="true"
          className="w-9 h-9 flex-shrink-0 rounded-full border border-ivory/20 flex items-center justify-center text-ivory/70 transition-all duration-500 ease-reveal group-hover:bg-coral group-hover:border-coral group-hover:text-ink group-hover:-rotate-45"
        >
          <ArrowUpRight className="w-4 h-4 rotate-45" />
        </span>
      </span>
      <span className="block text-ivory/55 !text-xs sm:!text-sm font-normal leading-snug pr-10">{note}</span>
      <span className="block mt-auto pt-6 font-display font-extrabold tracking-[-0.03em] text-ivory leading-none [font-size:clamp(1.75rem,1.1rem+1.8vw,2.75rem)] transition-colors duration-300 group-hover:text-coral">
        {label}
      </span>
      {/* Coral pencil line drawn along the bottom on hover */}
      <span
        aria-hidden="true"
        className="absolute left-0 right-0 bottom-0 h-[3px] bg-coral origin-left scale-x-0 transition-transform duration-700 ease-reveal group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none"
      />
    </>
  );
}

export function Footer() {
  return (
    <footer className="on-ink relative overflow-hidden bg-ink text-ivory">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Closing statement — reuses the studio's own line */}
        <div className="pt-20 sm:pt-28 pb-14 sm:pb-20 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8">
            <p className="slate slate-mark text-coral mb-6">End of reel</p>
            <RevealLines
              as="h2"
              className="display-lg font-display text-ivory"
              lines={['Everything your brand needs,', <span key="roof" className="text-coral">under one creative roof.</span>]}
            />
          </div>
          <div className="lg:col-span-4 lg:justify-self-end">
            <Link
              href="/contact-us"
              className="group inline-flex items-center gap-3 bg-coral text-ink h-14 pl-6 pr-5 rounded-md font-semibold transition-colors duration-300 hover:bg-ivory"
            >
              Start a project
              <ArrowUpRight className="w-5 h-5 transition-transform duration-500 ease-reveal group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Main site navigation */}
        <nav id="footer-nav" aria-label="Site" className="scroll-mt-24">
          <p className="slate text-ivory/45 mb-4">Navigate</p>
          <ul className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-ivory/10 border border-ivory/10 rounded-[4px] overflow-hidden">
            {siteNav.map((item, i) => (
              <li key={item.label} className="flex">
                {'href' in item ? (
                  <Link href={item.href} className={`${navCellClass} w-full`}>
                    <NavCellBody index={i} label={item.label} note={item.note} />
                  </Link>
                ) : (
                  <button type="button" onClick={item.action} className={`${navCellClass} w-full !font-sans`}>
                    <NavCellBody index={i} label={item.label} note={item.note} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 sm:gap-12 py-14 sm:py-16">
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5" aria-label="Cwaya — home">
              <CwayaMark className="w-9 h-9" />
              <span className="font-display text-2xl font-extrabold tracking-[-0.04em]">Cwaya</span>
            </Link>
            <p className="text-ivory/65 mb-6 text-sm leading-relaxed max-w-xs">
              Your complete creative and tech powerhouse. Premium results, unbeatable prices.
            </p>
            <ul className="flex gap-1.5" aria-label="Social">
              {socialLinks.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-11 h-11 rounded-md border border-ivory/15 flex items-center justify-center text-ivory/70 transition-colors duration-300 hover:bg-coral hover:border-coral hover:text-ink"
                  >
                    {s.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="slate text-ivory/45 mb-5 !font-sans">Services</h3>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="slate text-ivory/45 mb-5 !font-sans">Company</h3>
            <ul className="space-y-3">
              {companyLinks.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h3 className="slate text-ivory/45 mb-5 !font-sans">Get in touch</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 text-coral" aria-hidden="true" />
                <a href="mailto:Sudhanshugour89@gmail.com" className={`${linkClass} break-all`}>
                  Sudhanshugour89@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-ivory/65">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-coral" aria-hidden="true" />
                <a href="tel:+918120317074" className={linkClass}>
                  +91 81203 17074
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-ivory/65">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-coral" aria-hidden="true" />
                <span>Indore–Bhopal Road, Near Bus Stand Sehore – 466001, MP, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Oversized wordmark. A faint solid fill rather than text-stroke —
            the variable font's overlapping contours show through a stroke. */}
        <p
          aria-hidden="true"
          className="font-display font-black leading-[0.8] tracking-[-0.06em] text-ivory/[0.06] select-none -mb-[0.12em] text-center"
          style={{ fontSize: 'clamp(4.5rem, 2rem + 19vw, 19rem)' }}
        >
          CWAYA
        </p>

        <div className="relative pt-6 pb-8 border-t border-coral/40 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <p className="text-ivory/45 text-xs">© {new Date().getFullYear()} Cwaya Creative Studio. All rights reserved.</p>
          <p className="slate text-coral/80 tabular hidden md:block" aria-hidden="true">
            TC {toTimecode(REEL_SECONDS)}
          </p>
          <div className="flex gap-5 text-xs flex-wrap justify-center">
            <Link href="/privacy-policy" className="text-ivory/45 hover:text-coral transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-conditions" className="text-ivory/45 hover:text-coral transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/privacy-policy#cookies" className="text-ivory/45 hover:text-coral transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
