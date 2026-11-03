'use client';

import { motion } from 'motion/react';
import { BarChart3, Users, Calendar, TrendingUp, ArrowRight } from 'lucide-react';
import { PageIntro, PageShell } from '@/components/editorial/PageIntro';
import { Magnetic } from '@/components/motion/Magnetic';
import { btnArrow, btnCoral } from '@/components/editorial/styles';

export default function SocialMediaManagementPage() {
  const managementFeatures = [
    {
      icon: <Calendar className="w-5 h-5" />,
      title: 'Content Strategy',
      description: 'Custom content calendars tailored to your brand voice and target audience for maximum impact.'
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: 'Account Handling',
      description: 'Professional management of your ImageIcon, YouTube, and Users with regular high-quality posting.'
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: 'Growth Strategy',
      description: 'Strategic planning to increase your engagement, reach, and follower loyalty through organic methods.'
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: 'Advanced Analytics',
      description: 'Deep analysis of your accounts to generate helpful insights and monthly performance reports.'
    }
  ];

  return (
    <PageShell>
      <PageIntro
        label="Digital Dominance"
        title={['Social', 'Management']}
        lede="Elevate your digital presence with strategic content, engagement-focused management, and data-driven growth."
      />

      <ol className="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-2 gap-x-10 border-t border-ink/20">
        {managementFeatures.map((item, index) => (
          <motion.li
            key={item.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, delay: (index % 2) * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="group grid grid-cols-[auto_1fr] gap-x-5 sm:gap-x-8 py-9 sm:py-12 border-b border-ink/20"
          >
            <span className="slate text-ink/45 pt-2 tabular">{String(index + 1).padStart(2, '0')}</span>
            <div>
              <span
                aria-hidden="true"
                className="inline-flex w-11 h-11 rounded-full border border-ink/20 text-ink items-center justify-center mb-6 transition-colors duration-500 group-hover:bg-coral group-hover:border-coral"
              >
                {item.icon}
              </span>
              <h3 className="font-display text-[1.75rem] sm:text-4xl font-extrabold text-ink tracking-[-0.03em] leading-[1.05] mb-4">
                {item.title}
              </h3>
              <p className="text-ink/70 leading-relaxed max-w-md">{item.description}</p>
            </div>
          </motion.li>
        ))}
      </ol>

      {/* Bottom CTA */}
      <div className="mt-16 sm:mt-20 flex sm:justify-end">
        <Magnetic className="w-full sm:w-auto">
          <button type="button" className={`${btnCoral} w-full sm:w-auto h-16 px-9 text-lg`}>
            Start Growing Your Brand
            <ArrowRight className={btnArrow} aria-hidden="true" />
          </button>
        </Magnetic>
      </div>
    </PageShell>
  );
}
