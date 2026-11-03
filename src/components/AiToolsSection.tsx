'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Camera, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { RevealLines } from './motion/RevealLines';

interface AiTool {
  id: number;
  title: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
  path: string;
  healthEndpoint?: string;
}

// shows live/offline badge for tools that have a health check endpoint
function HealthBadge({ url }: { url: string }) {
  const [status, setStatus] = useState<'loading' | 'online' | 'offline'>('loading');

  useEffect(() => {
    fetch(url)
      .then(r => r.json())
      .then(d => setStatus(d.status === 'healthy' ? 'online' : 'offline'))
      .catch(() => setStatus('offline'));
  }, [url]);

  if (status === 'loading') return null;

  const isOnline = status === 'online';
  return (
    <span
      className={`inline-flex items-center gap-1.5 slate !text-[10px] px-2 py-1 rounded-[3px] border transition-colors duration-500 ${
        isOnline
          ? 'border-ink/20 text-ink/70 group-hover:border-ivory/30 group-hover:text-ivory/85'
          : 'border-destructive/40 text-destructive group-hover:border-ivory/30 group-hover:text-ivory/85'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'rec-dot bg-coral' : 'bg-destructive'}`} />
      {isOnline ? 'Live' : 'Offline'}
    </span>
  );
}

const aiTools: AiTool[] = [
  {
    id: 2,
    title: 'AI Photo Sharing',
    icon: <Camera className="w-6 h-6" />,
    description: 'Event code enter karo, selfie upload karo — InsightFace AI tumhari saari photos crowd mein dhundh leta hai instantly.',
    features: ['Face Recognition (InsightFace)', 'Bulk Batch Upload', 'Event Code System', 'Cosine Similarity Matching'],
    path: '/ai-photo-sharing',
    healthEndpoint: 'https://gour-himansh-ai.hf.space/api/health'
  },
];

// Same editorial index as ServiceHub: hovering a row sweeps editorial-blue ink across it.
export function AiToolsSection() {
  const router = useRouter();

  const handleToolClick = (tool: AiTool) => {
    if (tool.path.startsWith('/')) {
      router.push(tool.path);
    } else {
      window.open(tool.path, '_blank');
    }
  };

  return (
    <section id="ai-tools" className="relative py-24 sm:py-32 bg-ivory border-t border-ink/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* section header */}
        <div className="grid lg:grid-cols-12 gap-8 items-end mb-14 sm:mb-16">
          <div className="lg:col-span-7">
            <p className="slate text-editorial mb-5 flex items-center gap-2">
              <span aria-hidden="true" className="rec-dot w-1.5 h-1.5 rounded-full bg-coral" />
              Next-Gen AI Capabilities
            </p>
            <RevealLines as="h2" className="display-lg font-display text-ink" lines={['Supercharge with', <span key="ai" className="text-editorial">AI Tools Suite</span>]} />
          </div>
          <p className="lg:col-span-4 lg:col-start-9 text-lg text-ink/70 leading-relaxed">
            Harness the power of advanced artificial intelligence to elevate your media. Enhance, upscale, and organize with unprecedented speed and precision.
          </p>
        </div>

        {/* tools index */}
        <ul className="border-t border-ink/20">
          {aiTools.map((tool, index) => (
            <motion.li
              key={tool.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="border-b border-ink/20"
            >
              <button
                type="button"
                onClick={() => handleToolClick(tool)}
                className="group relative w-full text-left grid grid-cols-12 gap-x-4 gap-y-4 items-center py-8 sm:py-10 px-1 sm:px-5 overflow-hidden focus-visible:outline-offset-[-2px]"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-editorial origin-left scale-x-0 transition-transform duration-700 ease-reveal group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none"
                />
                <span className="relative col-span-2 sm:col-span-1 w-11 h-11 rounded-md border border-ink/20 text-ink flex items-center justify-center transition-colors duration-500 group-hover:border-ivory/30 group-hover:text-coral group-focus-visible:text-coral" aria-hidden="true">
                  {tool.icon}
                </span>
                <span className="relative col-span-10 sm:col-span-11 lg:col-span-4 flex flex-col gap-2">
                  <span className="font-display font-extrabold tracking-[-0.03em] text-ink [font-size:clamp(1.6rem,1rem+1.9vw,2.6rem)] leading-[1.05] transition-colors duration-500 group-hover:text-ivory group-focus-visible:text-ivory">
                    {tool.title}
                  </span>
                  {tool.healthEndpoint && (
                    <span>
                      <HealthBadge url={tool.healthEndpoint} />
                    </span>
                  )}
                </span>
                <span className="relative col-span-12 sm:col-start-2 sm:col-span-10 lg:col-start-auto lg:col-span-4 text-ink/70 leading-relaxed transition-colors duration-500 group-hover:text-ivory/85 group-focus-visible:text-ivory/85">
                  {tool.description}
                  <span className="flex flex-wrap gap-1.5 mt-4">
                    {tool.features.map((feature) => (
                      <span
                        key={feature}
                        className="slate !text-[10px] !tracking-[0.12em] px-2 py-1 rounded-[3px] border border-ink/20 text-ink/65 transition-colors duration-500 group-hover:border-ivory/30 group-hover:text-ivory/80"
                      >
                        {feature}
                      </span>
                    ))}
                  </span>
                </span>
                <span className="relative col-span-12 sm:col-start-2 sm:col-span-11 lg:col-start-auto lg:col-span-3 flex items-center justify-between lg:justify-end gap-4">
                  <span className="slate text-ink/60 transition-colors duration-500 group-hover:text-ivory">Launch Tool</span>
                  <span
                    aria-hidden="true"
                    className="flex-shrink-0 w-11 h-11 rounded-full border border-ink/25 flex items-center justify-center text-ink transition-all duration-500 ease-reveal group-hover:bg-coral group-hover:border-coral group-hover:-rotate-45 group-focus-visible:bg-coral group-focus-visible:border-coral"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </span>
              </button>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
