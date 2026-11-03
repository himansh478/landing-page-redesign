'use client';

import { motion } from 'motion/react';
import { Film, Clapperboard, Crown, Mountain, Music, Camera, ArrowRight } from 'lucide-react';
import { PageIntro, PageShell } from '@/components/editorial/PageIntro';
import { CtaBand } from '@/components/editorial/CtaBand';
import { Em } from '@/components/editorial/Showcase';
import { btnArrow, btnCoralOnInk, tagClass } from '@/components/editorial/styles';

const themes = [
  {
    id: 1, title: 'KGF Cinematic', icon: <Crown className="w-5 h-5" />,
    description: 'Dark, gritty, and powerful cinematography inspired by KGF aesthetics',
    features: ['Intense Color Grading', 'Dramatic Lighting', 'Epic Transitions', 'Powerful Music'],
    price: '₹25,000+',
  },
  {
    id: 2, title: 'Pushparaj Folk', icon: <Film className="w-5 h-5" />,
    description: 'Bold and rustic style with mass appeal elements and earthy tones',
    features: ['Rustic Aesthetics', 'Mass Scenes', 'Bold Edits', 'Dynamic BGM'],
    price: '₹25,000+',
  },
  {
    id: 3, title: 'Trader Professional', icon: <Clapperboard className="w-5 h-5" />,
    description: 'Professional and sleek corporate/business style for the modern era',
    features: ['Corporate Look', 'Professional Edits', 'Clean Transitions', 'Business Tone'],
    price: '₹20,000+',
  },
  {
    id: 4, title: 'South Heritage', icon: <Music className="w-5 h-5" />,
    description: 'Vibrant colors and traditional South Indian cultural aesthetics',
    features: ['Vibrant Colors', 'Traditional Elements', 'Cultural Touch', 'Folk Music'],
    price: '₹22,000+',
  },
  {
    id: 5, title: 'Rajasthan Royal', icon: <Mountain className="w-5 h-5" />,
    description: 'Royal heritage with rich cultural elements and desert warmth',
    features: ['Royal Aesthetics', 'Heritage Look', 'Warm Tones', 'Traditional Music'],
    price: '₹22,000+',
  },
  {
    id: 6, title: 'Western Modern', icon: <Camera className="w-5 h-5" />,
    description: 'Hollywood-style modern cinematography with global appeal',
    features: ['Cinematic Look', 'Modern Edits', 'Western Music', 'High Production'],
    price: '₹30,000+',
  },
];

export default function ThemeBasedPage() {
  return (
    <PageShell>
      <PageIntro
        back={{ href: '/', label: 'Back to Home' }}
        note="Aesthetic Engineering"
        title={['Theme Based', 'Edit & Shoot.']}
        lede={
          <>
            Deploying <Em>cinematic blueprints</Em> tailored to your narrative&apos;s specific frequency and cultural resonance.
          </>
        }
      />

      {/* Themes as a look-book index */}
      <ul className="mt-16 sm:mt-24 border-t border-ink/20">
        {themes.map((theme, idx) => (
          <motion.li
            key={theme.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="group grid grid-cols-12 gap-x-4 gap-y-4 items-center py-8 sm:py-10 border-b border-ink/20"
          >
            <span className="col-span-2 sm:col-span-1 slate text-ink/45 tabular transition-colors duration-500 group-hover:text-editorial">
              {String(idx + 1).padStart(2, '0')}
            </span>
            <div className="col-span-10 sm:col-span-11 lg:col-span-4 flex items-center gap-4">
              <span
                aria-hidden="true"
                className="w-11 h-11 flex-shrink-0 rounded-full border border-ink/20 text-ink flex items-center justify-center transition-colors duration-500 group-hover:bg-coral group-hover:border-coral"
              >
                {theme.icon}
              </span>
              <h3 className="font-display font-extrabold text-ink tracking-[-0.03em] leading-[1.05] [font-size:clamp(1.5rem,1rem+1.6vw,2.4rem)]">
                {theme.title}
              </h3>
            </div>
            <div className="col-span-12 sm:col-start-2 sm:col-span-11 lg:col-start-auto lg:col-span-4">
              <p className="text-ink/70 leading-relaxed">{theme.description}</p>
              <ul className="flex flex-wrap gap-1.5 mt-4" aria-label={`${theme.title} includes`}>
                {theme.features.map((feature) => (
                  <li key={feature} className={tagClass}>{feature}</li>
                ))}
              </ul>
            </div>
            <div className="col-span-12 sm:col-start-2 sm:col-span-11 lg:col-start-auto lg:col-span-3 flex items-center justify-between lg:justify-end gap-6">
              <div className="lg:text-right">
                <div className="slate text-ink/50 mb-1">Estimation</div>
                <div className="font-display text-2xl font-extrabold text-ink tracking-[-0.03em] tabular">{theme.price}</div>
              </div>
              <button
                type="button"
                className="h-11 px-5 rounded-md border border-ink/25 text-ink text-sm font-semibold transition-colors duration-300 hover:bg-ink hover:text-ivory hover:border-ink"
              >
                Select
              </button>
            </div>
          </motion.li>
        ))}
      </ul>

      {/* CTA Banner */}
      <CtaBand
        label="Custom Architecture"
        title={['Need A', 'Custom Theme?']}
        body="Have a unique vision? We engineer custom visual protocols tailored to your specific requirements."
        className="mt-24 sm:mt-32"
      >
        <button type="button" className={`${btnCoralOnInk} w-full sm:w-auto`}>
          Book Now
          <ArrowRight className={btnArrow} aria-hidden="true" />
        </button>
      </CtaBand>
    </PageShell>
  );
}
