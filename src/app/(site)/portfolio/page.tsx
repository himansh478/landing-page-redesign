'use client';

import { motion } from 'motion/react';
import {
  Instagram,
  Youtube,
  Send,
  Phone,
  ArrowRight,
  Camera,
  Film,
  Sparkles,
  Star,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';
import { PageShell } from '@/components/editorial/PageIntro';
import { btnCoralOnInk, btnPrimary, btnArrow } from '@/components/editorial/styles';
import { RevealLines } from '@/components/motion/RevealLines';

const WHATSAPP_LINK = 'https://wa.me/+918120317074';

const socials = [
  {
    label: 'Instagram',
    handle: '@creative_shiva_01',
    href: 'https://www.instagram.com/creative_shiva_01',
    icon: Instagram,
    color: 'from-pink-500 to-orange-400',
  },
  {
    label: 'YouTube – Editing',
    handle: '@creativeshivaguide001',
    href: 'https://youtube.com/@creativeshivaguide001',
    icon: Youtube,
    color: 'from-red-600 to-red-400',
  },
  {
    label: 'YouTube – Vlogs',
    handle: '@creativeshivavloges01',
    href: 'https://youtube.com/@creativeshivavloges01',
    icon: Youtube,
    color: 'from-red-700 to-pink-500',
  },
  {
    label: 'Telegram',
    handle: 't.me/creativeshiva01',
    href: 'https://t.me/creativeshiva01',
    icon: Send,
    color: 'from-sky-500 to-blue-400',
  },
];

const skills = [
  { icon: Camera, label: 'iPhone 17 Pro Shoot' },
  { icon: Film, label: 'Cinematic Editing' },
  { icon: Sparkles, label: 'VFX & Color Grading' },
  { icon: Star, label: 'Viral Reel Strategy' },
  { icon: Instagram, label: 'Social Media Growth' },
  { icon: Youtube, label: 'YouTube Content' },
];

const categories = [
  { emoji: '🏪', title: 'Shop Inauguration', count: '2 reels' },
  { emoji: '🎂', title: 'Birthday & Baby Welcome', count: '4 reels' },
  { emoji: '🚗', title: 'Car Delivery', count: '4 reels' },
  { emoji: '🏍️', title: 'Bike Delivery', count: '3 reels' },
  { emoji: '💍', title: 'Wedding Shoot', count: '4 reels' },
];

const pricingPlans = [
  {
    title: 'Elite Single',
    price: '₹12,500',
    subtitle: 'Per Unit Production',
    features: [
      'Shoot by iPhone 17 Pro',
      '1 Reel edit by me',
      'Unlimited reel on Telegram',
      '10 Photos',
    ],
    featured: false,
  },
  {
    title: 'Pro Cinema',
    price: '₹13,500',
    subtitle: 'Per Unit Production',
    features: [
      'Shoot by iPhone 17 Pro 16, 15',
      '2 Reel edit by me',
      'Premium SFX',
      'Advance camera angles',
      'Unique transitions',
      'Bulk discount 10%',
      'Your shoot raw clips',
      '1 Video collaboration',
      'Unlimited reel on Telegram',
      '5 Photos',
    ],
    featured: true,
  },
  {
    title: 'Grand Portfolio',
    price: '₹12,999',
    subtitle: 'Production Package',
    features: [
      '10 High-Impact Reels/Month',
      '1 Free Cinematic Masterpiece',
      'Complimentary Event Banner',
      'Multi-Location Coverage',
      'Priority Turnaround (24h)',
    ],
    featured: false,
  },
  {
    title: 'Wedding & Function',
    price: '₹24,999',
    subtitle: 'Complete Event Production',
    features: [
      'Full Event Coverage (iPhone 17 Pro + DJI Gimbal)',
      'Ultra HD 4K Video Quality',
      '15+ Professionally Edited Reels',
      'Same Day Reel & Instant Photo Delivery',
      'Trend-Based Reel Concepts & Guidance',
      'Creative Angles, Transitions & Viral Styles',
      'Ready-to-Post Social Media Content',
    ],
    featured: false,
  },
];

const reelCodes = [
  'DfPmKkRuJgx',
  'DeefGRWtaGB',
  'Ddx4-I6Sq6n',
  'DZhPdlYINK6',
  'DeqiYoztyHD',
  'DX8j6iRKwLZ',
];

export default function PortfolioPage() {
  return (
    <PageShell>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative pt-10 pb-24 sm:pb-32 overflow-hidden">
        {/* Background glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
        >
          <div className="w-[600px] h-[600px] rounded-full bg-coral/10 blur-[120px]" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Text */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-ink/15 bg-paper"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-coral animate-pulse" />
              <span className="slate text-ink/60 text-xs">Available for Projects</span>
            </motion.div>

            <RevealLines
              as="h1"
              className="display-lg font-display text-ink"
              lines={['Creative', 'Shiva.']}
            />

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-6 text-lg text-ink/70 leading-relaxed max-w-md"
            >
              Filmmaker · Editor · Content Creator. Crafting cinematic stories for brands,
              weddings, and social media — with <strong className="text-ink">iPhone 17 Pro</strong>{' '}
              precision and viral-first storytelling.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="mt-4 flex items-center gap-2 text-sm text-ink/50"
            >
              <MapPin className="w-4 h-4 text-coral" />
              <span>Pan-India Travel Active</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className={`${btnCoralOnInk}`}>
                <Phone className="w-4 h-4" />
                Book a Shoot
              </a>
              <Link href="/shoot-and-editing" className={`${btnPrimary}`}>
                View Work
                <ArrowRight className={btnArrow} />
              </Link>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              {socials.map((s) => (
                <a
                  key={s.handle}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-[4px] border border-ink/15 bg-paper hover:border-ink/40 transition-colors text-sm text-ink/70 hover:text-ink"
                >
                  <s.icon className="w-4 h-4 text-coral flex-shrink-0" />
                  <span className="hidden sm:inline">{s.handle}</span>
                  <span className="sm:hidden">{s.label}</span>
                </a>
              ))}
            </motion.div>
          </div>

          {/* Right: Avatar / Photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative w-72 h-80 sm:w-80 sm:h-96">
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-coral/30 to-transparent blur-2xl" />
              {/* Photo or fallback avatar */}
              <div className="relative w-full h-full rounded-[20px] border border-ink/15 bg-gradient-to-br from-ink/5 to-ink/15 overflow-hidden flex items-center justify-center">
                {/* Try the photo if it's been placed in /public/images/ */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/creative-shiva.jpg"
                  alt="Creative Shiva"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback: show initials if image not found
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent) {
                      parent.innerHTML = `<div class="flex flex-col items-center justify-center w-full h-full gap-4">
                        <div class="w-24 h-24 rounded-full bg-coral/20 border-2 border-coral/40 flex items-center justify-center">
                          <span class="font-display text-4xl font-black text-coral">CS</span>
                        </div>
                        <span class="font-display text-xl font-bold text-ink">Creative Shiva</span>
                        <span class="text-sm text-ink/50">Filmmaker · Editor</span>
                      </div>`;
                    }
                  }}
                />
              </div>
              {/* Badge */}
              <div className="absolute -bottom-4 -right-4 bg-coral text-ink rounded-[8px] px-4 py-2 shadow-lg">
                <p className="font-display font-black text-sm">17+ Projects</p>
                <p className="text-xs opacity-70">Delivered</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SKILLS ───────────────────────────────────────── */}
      <section className="py-16 border-t border-ink/10">
        <p className="slate text-ink/40 mb-8 text-xs uppercase tracking-widest">What I Do</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {skills.map((skill, i) => (
            <motion.div
              key={skill.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="flex flex-col items-center gap-3 p-4 rounded-[4px] border border-ink/10 hover:border-ink/25 transition-colors bg-paper/50"
            >
              <skill.icon className="w-5 h-5 text-coral" />
              <span className="text-xs text-ink/70 text-center leading-snug">{skill.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────── */}
      <section className="py-16 border-t border-ink/10">
        <RevealLines
          as="h2"
          className="display-sm font-display text-ink mb-10"
          lines={['Portfolio', 'Categories.']}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
            >
              <Link
                href="/shoot-and-editing"
                className="group flex items-center gap-4 p-5 rounded-[4px] border border-ink/15 hover:border-coral/40 hover:bg-coral/5 transition-all"
              >
                <span className="text-3xl">{cat.emoji}</span>
                <div>
                  <p className="font-display font-semibold text-ink group-hover:text-coral transition-colors">
                    {cat.title}
                  </p>
                  <p className="text-xs text-ink/50 mt-0.5">{cat.count}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-ink/30 group-hover:text-coral ml-auto transition-colors" />
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href="/shoot-and-editing" className={`${btnPrimary} inline-flex`}>
            View All Work
            <ArrowRight className={btnArrow} />
          </Link>
        </div>
      </section>

      {/* ── FEATURED REELS ───────────────────────────────── */}
      <section className="py-16 border-t border-ink/10">
        <RevealLines
          as="h2"
          className="display-sm font-display text-ink mb-10"
          lines={['Featured', 'Reels.']}
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {reelCodes.map((code, i) => (
            <motion.a
              key={code}
              href={`https://www.instagram.com/reel/${code}/`}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative aspect-[9/16] rounded-[8px] overflow-hidden border border-ink/10 hover:border-coral/40 transition-all"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.microlink.io/?url=https://www.instagram.com/reel/${code}/&screenshot=true&meta=false&embed=screenshot.url`}
                alt={`Reel ${i + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <span className="text-ivory text-xs font-medium flex items-center gap-1">
                  <Instagram className="w-3 h-3" /> View Reel
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* ── PACKAGES ─────────────────────────────────────── */}
      <section className="py-16 border-t border-ink/10">
        <RevealLines
          as="h2"
          className="display-sm font-display text-ink mb-3"
          lines={['Packages &', 'Pricing.']}
        />
        <p className="text-ink/60 mb-10 max-w-lg">
          Transparent, performance-driven pricing for brands that refuse to compromise.
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pricingPlans.map((plan, idx) => (
            <motion.li
              key={plan.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.7, delay: (idx % 2) * 0.1 }}
              className={`relative flex flex-col rounded-[4px] border p-7 ${
                plan.featured
                  ? 'on-ink bg-ink border-ink shadow-[0_40px_80px_-40px_rgb(var(--ink-rgb)/0.5)]'
                  : 'bg-paper border-ink/15'
              }`}
            >
              {plan.featured && (
                <span className="absolute top-4 right-4 slate !text-[10px] bg-coral text-ink px-2 py-1 rounded-[3px]">
                  Most Popular
                </span>
              )}
              <h3 className={`font-display text-2xl font-extrabold tracking-tight ${plan.featured ? 'text-ivory' : 'text-ink'}`}>
                {plan.title}
              </h3>
              <p className={`font-display font-black text-5xl tabular mt-4 leading-none ${plan.featured ? 'text-coral' : 'text-ink'}`}>
                {plan.price}
              </p>
              <p className={`slate mt-2 mb-6 ${plan.featured ? 'text-ivory/55' : 'text-ink/55'}`}>
                {plan.subtitle}
              </p>
              <ul className={`flex-grow mb-6 border-t ${plan.featured ? 'border-ivory/15' : 'border-ink/15'}`}>
                {plan.features.map((f, fi) => (
                  <li
                    key={fi}
                    className={`flex items-start gap-3 py-2.5 border-b text-sm leading-snug ${
                      plan.featured ? 'border-ivory/10 text-ivory/80' : 'border-ink/10 text-ink/75'
                    }`}
                  >
                    <span aria-hidden="true" className="w-1.5 h-1.5 mt-[0.45em] bg-coral rotate-45 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={`https://wa.me/918120317074?text=${encodeURIComponent(
                  `Hello! I want to book the *${plan.title}* package (${plan.price}). Please share more details.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${plan.featured ? btnCoralOnInk : btnPrimary} w-full`}
              >
                Book Now
                <ArrowRight className={btnArrow} />
              </a>
            </motion.li>
          ))}
        </ul>
        <div className="mt-8 text-center">
          <Link href="/packages" className="text-sm text-ink/50 hover:text-coral transition-colors underline underline-offset-4">
            View all packages including Wedding & Social Media Management →
          </Link>
        </div>
      </section>

      {/* ── YOUTUBE CHANNELS ─────────────────────────────── */}
      <section className="py-16 border-t border-ink/10">
        <RevealLines
          as="h2"
          className="display-sm font-display text-ink mb-10"
          lines={['YouTube', 'Channels.']}
        />
        <div className="grid sm:grid-cols-2 gap-6">
          <motion.a
            href="https://youtube.com/@creativeshivaguide001"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group flex items-start gap-5 p-6 rounded-[4px] border border-ink/15 hover:border-red-500/40 hover:bg-red-500/5 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0 group-hover:bg-red-500/25 transition-colors">
              <Youtube className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="font-display font-bold text-ink group-hover:text-red-500 transition-colors">
                Editing & Teaching
              </p>
              <p className="text-xs text-ink/50 mt-1">@creativeshivaguide001</p>
              <p className="text-sm text-ink/65 mt-3 leading-relaxed">
                Learn cinematic editing, color grading, and pro-level video production techniques.
              </p>
            </div>
          </motion.a>

          <motion.a
            href="https://youtube.com/@creativeshivavloges01"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="group flex items-start gap-5 p-6 rounded-[4px] border border-ink/15 hover:border-red-500/40 hover:bg-red-500/5 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0 group-hover:bg-red-500/25 transition-colors">
              <Youtube className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="font-display font-bold text-ink group-hover:text-red-500 transition-colors">
                Vlogs & Shoot BTS
              </p>
              <p className="text-xs text-ink/50 mt-1">@creativeshivavloges01</p>
              <p className="text-sm text-ink/65 mt-3 leading-relaxed">
                Behind-the-scenes vlogs, shoot diaries, and real-world filmmaking adventures.
              </p>
            </div>
          </motion.a>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-20 border-t border-ink/10">
        <div className="text-center max-w-xl mx-auto">
          <RevealLines
            as="h2"
            className="display-sm font-display text-ink"
            lines={["Let's Create", 'Something Epic.']}
          />
          <p className="text-ink/60 mt-5 leading-relaxed">
            Ready to shoot? Book a session, ask a question, or just say hi on WhatsApp.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className={`${btnCoralOnInk}`}
            >
              <Phone className="w-4 h-4" />
              WhatsApp Me
            </a>
            <a
              href="https://www.instagram.com/creative_shiva_01"
              target="_blank"
              rel="noopener noreferrer"
              className={`${btnPrimary}`}
            >
              <Instagram className="w-4 h-4" />
              Follow on Instagram
            </a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
