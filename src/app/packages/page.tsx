'use client';

import { motion } from 'motion/react';
import { Phone, Video, Camera, CalendarDays, Sparkles, Instagram, ArrowRight } from 'lucide-react';
import { PageIntro, PageShell } from '@/components/editorial/PageIntro';
import { CtaBand } from '@/components/editorial/CtaBand';
import { RevealLines } from '@/components/motion/RevealLines';
import { btnArrow, btnCoralOnInk, btnPrimary } from '@/components/editorial/styles';

const WHATSAPP_LINK = `https://wa.me/+918120317074`;

const pricingPlans = [
  {
    title: 'Elite Single',
    price: '₹2,500',
    subtitle: 'Per Unit Production',
    features: [
      'Shoot by iPhone 17 pro',
      '1 Reel edit by me',
      'Unlimited reel By telegram',
      '10 photo',
    ],
    icon: Video,
  },
  {
    title: 'Pro Cinema',
    price: '₹3,500',
    subtitle: 'Per Unit Production',
    features: [
      'Shoot by iPhone 17 pro 16,15',
      '2 Reel edit by me',
      'premium SFX',
      'advance camera angles',
      'unique transition',
      'bulk discount 10%',
      'your Shoot Raw Clips',
      '1 Video Collaboration',
      'Unlimited reel on telegram',
      '5 photos',
    ],
    icon: Camera,
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
    icon: CalendarDays,
  },
  {
    title: 'Wedding & Function',
    price: '₹24,999',
    subtitle: 'Complete Event Production',
    features: [
      'Full Event Coverage (iPhone 17 Pro + DJI Gimbal)',
      'If Camera + Gimbal required: add ₹10,000 extra',
      'Ultra HD 4K Video Quality',
      '15+ Professionally Edited Reels',
      'Same Day Reel & Instant Photo Delivery',
      'Trend-Based Reel Concepts & Guidance',
      'Creative Angles, Transitions & Viral Styles',
      'Ready-to-Post Social Media Content & Fast Turnaround',
      'Perfect for: Weddings, Haldi, Mehendi, Functions & Parties',
      'Note: Travel, Stay & Food arrangement extra',
    ],
    icon: Sparkles,
  },
  {
    title: 'Social Media Management',
    price: '₹16,999',
    subtitle: 'Monthly Retainer',
    features: [
      'Professional Video Shoot for Instagram Reels',
      '15 Reels Per Month with Professional Caption & Hooks',
      'Complete Account Handling, Uploading & Scheduling',
      'SEO-Friendly Captions & Optimized Hashtags',
      'Audience Targeting & Organic Growth Strategy',
      'Consistent Brand Identity & Engagement Monitoring',
      'Deliverables: 15 Reels + Full Management /Month',
    ],
    icon: Instagram,
  },
];

const faqs = [
  { 
    q: 'What is the standard turnaround time?', 
    a: 'We pride ourselves on industry-leading speed. Depending on your package, you can receive your final masters in as little as 3-4 hours post-production.' 
  },
  { 
    q: 'Do you operate globally?', 
    a: 'Absolutely. We offer Pan-India travel and can deploy teams globally for high-tier enterprise projects.' 
  },
  { 
    q: 'Are custom neural solutions available?', 
    a: 'Yes. Beyond standard video, we build custom AI automation and technical workflows tailored to your brand identity.' 
  },
];

export default function PackagesPage() {
  return (
    <PageShell>
      <PageIntro
        back={{ href: '/', label: 'Back to Studio' }}
        note={
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="rec-dot w-1.5 h-1.5 rounded-full bg-coral" />
            Pan-India Travel Active
          </span>
        }
        title={['Investment', 'Architectures.']}
        lede="Transparent, performance-driven pricing for brands that refuse to compromise on visual excellence."
      />

      {/* Pricing Grid — a rate card */}
      <ul className="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {pricingPlans.map((plan, idx) => (
          <motion.li
            key={plan.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.8, delay: (idx % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className={`relative flex flex-col rounded-[4px] border p-7 sm:p-8 ${
              plan.featured
                ? 'on-ink bg-ink border-ink shadow-[0_40px_80px_-40px_rgb(var(--ink-rgb)/0.6)]'
                : 'bg-paper border-ink/15'
            }`}
          >
            <div className="flex items-center justify-between gap-4 mb-8">
              <span className={`slate tabular ${plan.featured ? 'text-ivory/50' : 'text-ink/45'}`}>
                {String(idx + 1).padStart(2, '0')}
              </span>
              {plan.featured ? (
                <span className="slate !text-[10px] bg-coral text-ink px-2 py-1 rounded-[3px]">Most Strategic</span>
              ) : (
                <span
                  aria-hidden="true"
                  className="w-10 h-10 rounded-full border border-ink/20 text-ink flex items-center justify-center"
                >
                  <plan.icon className="w-4 h-4" />
                </span>
              )}
            </div>

            <h3 className={`font-display text-2xl font-extrabold tracking-[-0.03em] ${plan.featured ? 'text-ivory' : 'text-ink'}`}>{plan.title}</h3>
            <p className={`font-display font-black tracking-[-0.05em] leading-none text-5xl tabular mt-4 ${plan.featured ? 'text-coral' : 'text-ink'}`}>
              {plan.price}
            </p>
            <p className={`slate mt-3 mb-8 ${plan.featured ? 'text-ivory/55' : 'text-ink/55'}`}>{plan.subtitle}</p>

            <ul className={`flex-grow mb-8 border-t ${plan.featured ? 'border-ivory/15' : 'border-ink/15'}`}>
              {plan.features.map((feature, i) => (
                <li
                  key={i}
                  className={`flex items-start gap-3 py-2.5 border-b text-sm leading-snug ${
                    plan.featured ? 'border-ivory/10 text-ivory/80' : 'border-ink/10 text-ink/75'
                  }`}
                >
                  <span aria-hidden="true" className="w-1.5 h-1.5 mt-[0.45em] bg-coral rotate-45 flex-shrink-0" />
                  {feature}
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
              <ArrowRight className={btnArrow} aria-hidden="true" />
            </a>
          </motion.li>
        ))}
      </ul>

      {/* Action Banner */}
      <CtaBand
        title={['Custom', 'Neural Flows.']}
        body="Need an enterprise-scale solution? We design custom technical architectures and production workflows for large organizations."
        className="mt-24 sm:mt-32"
      >
        <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className={`${btnCoralOnInk} w-full sm:w-auto`}>
          <Phone className="w-5 h-5" aria-hidden="true" />
          Discovery Call
        </a>
      </CtaBand>

      {/* FAQ */}
      <section className="mt-24 sm:mt-32 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4">
          <RevealLines as="h2" className="display-md font-display text-ink" lines={['Common', 'Inquiries']} />
          <p className="text-lg text-ink/70 leading-relaxed mt-6 max-w-sm">Everything you need to know about our production lifecycle.</p>
        </div>
        <div className="lg:col-span-7 lg:col-start-6 border-t border-ink/20">
          {faqs.map((faq, idx) => (
            <details key={faq.q} name="packages-faq" className="faq-item group border-b border-ink/20">
              <summary className="faq-summary flex items-start gap-5 sm:gap-8 py-6 sm:py-7 cursor-pointer select-none">
                <span className="slate text-ink/45 pt-2 w-10 flex-shrink-0">Q.{String(idx + 1).padStart(2, '0')}</span>
                <h3 className="flex-1 font-display text-lg sm:text-xl font-semibold text-ink tracking-[-0.01em] transition-colors duration-300 group-hover:text-editorial">
                  {faq.q}
                </h3>
                <span aria-hidden="true" className="relative w-6 h-6 mt-1 flex-shrink-0">
                  <span className="absolute left-0 right-0 top-1/2 h-[2px] -mt-px bg-ink" />
                  <span className="faq-plus-v absolute top-0 bottom-0 left-1/2 w-[2px] -ml-px bg-ink transition-transform duration-500 ease-reveal" />
                </span>
              </summary>
              <div className="faq-answer pb-7 pl-[3.75rem] sm:pl-[4.5rem] pr-10">
                <p className="text-ink/75 leading-relaxed">{faq.a}</p>
              </div>
            </details>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
