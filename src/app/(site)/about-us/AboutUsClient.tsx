'use client';

import { motion } from 'motion/react';
import { Heart, Zap, Target, Camera, Video, Code, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { PageIntro, PageShell, SectionHead } from '@/components/editorial/PageIntro';
import { CtaBand } from '@/components/editorial/CtaBand';
import { CountUp } from '@/components/motion/CountUp';
import { btnArrow, btnCoralOnInk, btnGhostOnInk } from '@/components/editorial/styles';

const EASE = [0.16, 1, 0.3, 1] as const;

export default function AboutUsPage() {
  return (
    <PageShell>
      <PageIntro
        label="The Story of Cwaya"
        note="Sehore, MP · Pan-India"
        title={['Crafting', 'Digital Legacy.']}
        lede="We are more than a creative studio. We are a powerhouse of innovation, blending high-end cinematography, masterful editing, and strategic tech solutions to elevate your brand to the next dimension."
      />

      {/* Headline figure */}
      <dl className="mt-16 sm:mt-24 border-t border-ink/20 pt-8 grid lg:grid-cols-12 gap-6 items-end">
        <dt className="lg:col-span-4 slate text-ink/55 lg:pb-6">Projects Delivered</dt>
        <dd className="lg:col-span-8 lg:text-right font-display font-black text-editorial tracking-[-0.06em] leading-[0.85] [font-size:clamp(5rem,2rem+12vw,13rem)]">
          <CountUp value={500} suffix="+" />
        </dd>
      </dl>

      {/* Mission & Vision */}
      <div className="mt-20 sm:mt-28 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-12">
        {[
          {
            icon: <Target className="w-5 h-5" />,
            title: 'Our Mission',
            text: 'To empower creators and businesses by providing world-class media production and technological infrastructure. We strive to make premium creative services accessible and impactful for everyone.',
          },
          {
            icon: <Zap className="w-5 h-5" />,
            title: 'Our Vision',
            text: 'To become the global standard for digital creativity, where every frame tells a story and every line of code solves a problem. We are building the future of media, one project at a time.',
          },
        ].map((item, i) => (
          <motion.section
            key={item.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, delay: i * 0.08, ease: EASE }}
            className="border-t-2 border-ink pt-6"
          >
            <div className="flex items-center justify-between mb-8">
              <span className="slate text-editorial tabular">{String(i + 1).padStart(2, '0')}</span>
              <span aria-hidden="true" className="w-11 h-11 rounded-full bg-coral text-ink flex items-center justify-center">
                {item.icon}
              </span>
            </div>
            <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-ink tracking-[-0.03em] mb-5">{item.title}</h3>
            <p className="text-lg text-ink/70 leading-relaxed">{item.text}</p>
          </motion.section>
        ))}
      </div>

      {/* Core Values */}
      <section className="mt-24 sm:mt-32">
        <SectionHead
          title={['What Drives Us']}
          lede="The core principles that define our work ethic and creative process."
        />

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 border-t border-ink/20">
          {[
            { icon: <Camera className="w-5 h-5" />, title: "Precision", text: "Every pixel, every frame, perfectly aligned." },
            { icon: <Heart className="w-5 h-5" />, title: "Passion", text: "We love what we do, and it shows in our work." },
            { icon: <Video className="w-5 h-5" />, title: "Innovation", text: "Using the latest AI and tech to push limits." },
            { icon: <Code className="w-5 h-5" />, title: "Reliability", text: "Consistent results that you can always count on." },
          ].map((value, i) => (
            <motion.li
              key={value.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.8, delay: i * 0.08, ease: EASE }}
              className="group py-8 border-b border-ink/15"
            >
              <span
                aria-hidden="true"
                className="w-11 h-11 rounded-full border border-ink/20 text-ink flex items-center justify-center mb-6 transition-colors duration-500 group-hover:bg-coral group-hover:border-coral"
              >
                {value.icon}
              </span>
              <h3 className="font-display text-xl font-bold text-ink mb-2">{value.title}</h3>
              <p className="text-ink/70 leading-relaxed">{value.text}</p>
            </motion.li>
          ))}
        </ul>
      </section>

      {/* CTA Section */}
      <CtaBand title={['Ready to start your', 'next project?']} className="mt-24 sm:mt-32">
        <Link href="/packages" className={`${btnCoralOnInk} w-full sm:w-auto`}>
          View Packages
          <ArrowRight className={btnArrow} aria-hidden="true" />
        </Link>
        <Link href="/contact-us" className={`${btnGhostOnInk} w-full sm:w-auto`}>
          Contact Us
        </Link>
      </CtaBand>
    </PageShell>
  );
}
