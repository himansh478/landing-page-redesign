'use client';

import { PartnerRegistrationForm } from '@/components/PartnerRegistrationForm';
import { motion } from 'motion/react';
import { Rocket, Wallet, Handshake } from 'lucide-react';
import { PageIntro, PageShell } from '@/components/editorial/PageIntro';

const benefits = [
  { icon: <Rocket className="w-5 h-5" />, title: 'Daily Leads', text: 'Get notified about shoots and editing projects every day.' },
  { icon: <Wallet className="w-5 h-5" />, title: 'Fair Pricing', text: 'We ensure you get paid what you deserve for your hard work.' },
  { icon: <Handshake className="w-5 h-5" />, title: 'Network', text: 'Collaborate with other professionals and grow together.' },
];

export default function JoinAsPartnerPage() {
  return (
    <PageShell>
      <PageIntro
        label="For Photographers & Editors"
        title={['Grow Your Creative', 'Business']}
        lede="We connect the best creative talent with high-value clients. Join our network and get access to premium projects in your area."
      />

      <div className="mt-14 sm:mt-20 grid lg:grid-cols-12 gap-12 lg:gap-10 items-start">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-8"
        >
          <PartnerRegistrationForm />
        </motion.div>

        <ul className="lg:col-span-4 lg:sticky lg:top-32 border-t border-ink/20">
          {benefits.map((b, i) => (
            <li key={b.title} className="group flex gap-5 py-6 border-b border-ink/15">
              <span className="slate text-ink/45 pt-3 tabular">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <span
                  aria-hidden="true"
                  className="w-11 h-11 rounded-full border border-ink/20 text-ink flex items-center justify-center mb-4 transition-colors duration-500 group-hover:bg-coral group-hover:border-coral"
                >
                  {b.icon}
                </span>
                <h3 className="font-display text-xl font-bold text-ink mb-1.5">{b.title}</h3>
                <p className="text-ink/70 text-sm leading-relaxed">{b.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </PageShell>
  );
}
