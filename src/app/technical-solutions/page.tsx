'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Bot, Code, Zap, MessageSquare, ArrowRight, Check, Loader } from 'lucide-react';
import { useState } from 'react';
import { createTechnicalBooking } from '@/app/actions/technical-bookings';
import { Turnstile } from '@marsidev/react-turnstile';
import { PageIntro, PageShell } from '@/components/editorial/PageIntro';
import { CtaBand } from '@/components/editorial/CtaBand';
import { ModalShell } from '@/components/editorial/ModalShell';
import { Em } from '@/components/editorial/Showcase';
import { btnArrow, btnCoralOnInk, btnPrimary, fieldClass, textareaClass } from '@/components/editorial/styles';

type TechnicalService = {
  id: number;
  title: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
};

const technicalServices: TechnicalService[] = [
  {
    id: 1,
    title: 'Website Architecture',
    icon: <Code className="w-5 h-5" />,
    description: 'Custom high-performance web deployment tailored to your brand frequency.',
    features: ['Responsive Protocols', 'SEO Core Integration', 'Neural Loading Speed', 'Premium UI/UX'],
  },
  {
    id: 2,
    title: 'Process Automation',
    icon: <Zap className="w-5 h-5" />,
    description: 'Automate your operational workflow and eliminate human latency.',
    features: ['Workflow Optimization', 'Resource Conservation', 'Zero-Error Threshold', 'Linear Scalability'],
  },
  {
    id: 3,
    title: 'Neural AI Bot',
    icon: <Bot className="w-5 h-5" />,
    description: 'Intelligent synaptic bots powered by LLMs for persistent support.',
    features: ['Infinite Availability', 'Context-Aware Logic', 'Polyglot Support', 'Continuous Learning'],
  },
  {
    id: 4,
    title: 'Social Automation',
    icon: <MessageSquare className="w-5 h-5" />,
    description: 'Automated engagement protocols for high-velocity social growth.',
    features: ['Instant Resonance', 'Lead Generation', 'Conversion Logic', 'Metric Analytics'],
  },
];

function BookingModal({ service, onClose }: { service: TechnicalService; onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '', whatsappNumber: '', location: '',
    serviceType: service.title, description: '', message: '',
    website_url: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.website_url) return;
    if (!turnstileToken) {
      alert('Handshake required.');
      return;
    }

    setIsLoading(true);
    const result = await createTechnicalBooking({
      ...formData,
      turnstileToken: turnstileToken,
    });

    setIsLoading(false);
    if (!result.success) {
      alert(result.error || 'Transmission failed.');
      return;
    }

    setIsSubmitted(true);
    setTimeout(onClose, 3000);
  };

  return (
    <ModalShell onClose={onClose} labelledBy="tech-request-title" className="max-w-2xl">
      <div className="p-6 sm:p-10">
        <div className="mb-8 pr-10">
          <p className="slate text-editorial mb-2">Technical Request</p>
          <h2 id="tech-request-title" className="font-display text-3xl sm:text-4xl font-extrabold text-ink tracking-[-0.03em] leading-[1.05]">
            Initiate {service.title}
          </h2>
        </div>

        {isSubmitted ? (
          <div className="text-center py-14 border-t border-ink/15" role="status">
            <div className="w-16 h-16 rounded-full bg-coral flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-ink" aria-hidden="true" />
            </div>
            <h3 className="font-display text-3xl font-extrabold text-ink tracking-[-0.03em] mb-3">Packet Received.</h3>
            <p className="text-ink/65">Our architects will contact you via WhatsApp shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required placeholder="Your Name" aria-label="Your name" className={fieldClass} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input required placeholder="WhatsApp Number" aria-label="WhatsApp number" className={fieldClass} value={formData.whatsappNumber} onChange={e => setFormData({...formData, whatsappNumber: e.target.value})} />
            </div>
            <input required placeholder="Location" aria-label="Location" className={fieldClass} value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
            <textarea required placeholder="Project Architecture Description" aria-label="Project architecture description" rows={4} className={textareaClass} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />

            <div style={{ display: 'none' }}><input type="text" value={formData.website_url} onChange={e => setFormData({...formData, website_url: e.target.value})} /></div>

            <div className="flex justify-center py-2">
              <Turnstile siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'} onSuccess={setTurnstileToken} />
            </div>

            <button disabled={isLoading} className={`${btnPrimary} w-full`}>
              {isLoading ? (
                <Loader className="w-5 h-5 animate-spin" aria-label="Submitting" />
              ) : (
                <>
                  Confirm Protocol
                  <ArrowRight className={btnArrow} aria-hidden="true" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </ModalShell>
  );
}

export default function TechnicalSolutionsPage() {
  const [selectedService, setSelectedService] = useState<TechnicalService | null>(null);

  return (
    <>
      <PageShell>
        <PageIntro
          label="Advanced Tech Protocols"
          title={['Technical', 'Solutions.']}
          lede={
            <>
              Deploying <Em>high-integrity infrastructure</Em> and autonomous neural systems to accelerate your brand&apos;s digital evolution.
            </>
          }
        />

        {/* Services as columns of a spec sheet, separated by hairlines */}
        <ul className="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-ink/20">
          {technicalServices.map((service, idx) => (
            <motion.li
              key={service.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="group flex flex-col py-10 md:px-6 lg:first:pl-0 lg:last:pr-0 border-b lg:border-b-0 border-ink/20 md:[&:nth-child(odd)]:pl-0 md:[&:nth-child(even)]:border-l lg:[&:not(:first-child)]:border-l lg:[&:nth-child(odd)]:pl-6 lg:first:!pl-0"
            >
              <div className="flex items-center justify-between mb-10">
                <span className="slate text-ink/45 tabular">{String(idx + 1).padStart(2, '0')}</span>
                <span
                  aria-hidden="true"
                  className="w-11 h-11 rounded-full border border-ink/20 text-ink flex items-center justify-center transition-colors duration-500 group-hover:bg-coral group-hover:border-coral"
                >
                  {service.icon}
                </span>
              </div>

              <h3 className="font-display text-[1.75rem] font-extrabold text-ink tracking-[-0.03em] leading-[1.08] mb-4">{service.title}</h3>
              <p className="text-ink/70 leading-relaxed mb-8">{service.description}</p>

              <ul className="mb-10 border-t border-ink/15 flex-grow" aria-label={`${service.title} includes`}>
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 py-2.5 border-b border-ink/10 text-sm text-ink/80">
                    <span aria-hidden="true" className="w-1.5 h-1.5 bg-coral rotate-45 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button type="button" onClick={() => setSelectedService(service)} className={`${btnPrimary} w-full h-12`}>
                Book Now
                <ArrowRight className={btnArrow} aria-hidden="true" />
              </button>
            </motion.li>
          ))}
        </ul>

        <CtaBand
          label="Enterprise Scale"
          title={['Infinite', 'Scalability.']}
          body="Ready to deploy high-authority technical protocols for your organization? Contact our Lead Architect."
          className="mt-24 sm:mt-32"
        >
          <button type="button" className={`${btnCoralOnInk} w-full sm:w-auto`}>
            Call Architect
            <ArrowRight className={btnArrow} aria-hidden="true" />
          </button>
        </CtaBand>
      </PageShell>

      <AnimatePresence>
        {selectedService && <BookingModal service={selectedService} onClose={() => setSelectedService(null)} />}
      </AnimatePresence>
    </>
  );
}
