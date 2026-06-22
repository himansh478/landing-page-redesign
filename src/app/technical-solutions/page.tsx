'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Bot, Code, Zap, MessageSquare, ArrowRight, X, Check, Cpu, Sparkles, Loader } from 'lucide-react';
import { useState } from 'react';
import { createTechnicalBooking } from '@/app/actions/technical-bookings';
import { Turnstile } from '@marsidev/react-turnstile';

const technicalServices = [
  {
    id: 1,
    title: 'Website Architecture',
    icon: <Code className="w-8 h-8" />,
    description: 'Custom high-performance web deployment tailored to your brand frequency.',
    features: ['Responsive Protocols', 'SEO Core Integration', 'Neural Loading Speed', 'Premium UI/UX'],
    gradient: 'from-blue-500 to-cyan-900',
  },
  {
    id: 2,
    title: 'Process Automation',
    icon: <Zap className="w-8 h-8" />,
    description: 'Automate your operational workflow and eliminate human latency.',
    features: ['Workflow Optimization', 'Resource Conservation', 'Zero-Error Threshold', 'Linear Scalability'],
    gradient: 'from-yellow-500 to-orange-900',
  },
  {
    id: 3,
    title: 'Neural AI Bot',
    icon: <Bot className="w-8 h-8" />,
    description: 'Intelligent synaptic bots powered by LLMs for persistent support.',
    features: ['Infinite Availability', 'Context-Aware Logic', 'Polyglot Support', 'Continuous Learning'],
    gradient: 'from-purple-500 to-pink-900',
  },
  {
    id: 4,
    title: 'Social Automation',
    icon: <MessageSquare className="w-8 h-8" />,
    description: 'Automated engagement protocols for high-velocity social growth.',
    features: ['Instant Resonance', 'Lead Generation', 'Conversion Logic', 'Metric Analytics'],
    gradient: 'from-pink-500 to-rose-900',
  },
];

const fieldClass = "w-full bg-white border border-slate-200 rounded-2xl px-6 py-5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition-all font-light shadow-sm";

function BookingModal({ service, onClose }: { service: any; onClose: () => void }) {
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
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white border border-slate-200 rounded-[60px] max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-12 overflow-y-auto max-h-full">
          <div className="flex justify-between items-start mb-12">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-2">Technical Request</div>
              <h2 className="text-4xl font-bold tracking-tight text-slate-900">Initiate {service.title}</h2>
            </div>
            <button onClick={onClose} className="p-4 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500">
              <X className="w-6 h-6" />
            </button>
          </div>

          {isSubmitted ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-8">
                <Check className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-slate-900">Packet Received.</h3>
              <p className="text-slate-500">Our architects will contact you via WhatsApp shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input required placeholder="Your Name" className={fieldClass} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input required placeholder="WhatsApp Number" className={fieldClass} value={formData.whatsappNumber} onChange={e => setFormData({...formData, whatsappNumber: e.target.value})} />
              </div>
              <input required placeholder="Location" className={fieldClass} value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              <textarea required placeholder="Project Architecture Description" rows={4} className={fieldClass + " resize-none"} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              
              <div style={{ display: 'none' }}><input type="text" value={formData.website_url} onChange={e => setFormData({...formData, website_url: e.target.value})} /></div>
              
              <div className="flex justify-center py-4">
                <Turnstile siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'} onSuccess={setTurnstileToken} />
              </div>

              <button disabled={isLoading} className="w-full h-20 rounded-3xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 shadow-xl hover:shadow-2xl hover:bg-blue-600">
                {isLoading ? <Loader className="w-6 h-6 animate-spin" /> : 'Confirm Protocol'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function TechnicalSolutionsPage() {
  const [selectedService, setSelectedService] = useState<any>(null);

  return (
    <>
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-cyan-600/5 blur-[150px] rounded-full" />
      </div>

      <section className="relative pt-40 pb-32 bg-slate-50 min-h-screen">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-10"
            >
              <Cpu className="w-3 h-3" />
              Advanced Tech Protocols
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl lg:text-9xl font-bold mb-10 tracking-tighter leading-none text-slate-900"
            >
              Technical <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-blue-600 to-blue-400">Solutions.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-2xl text-slate-500 max-w-3xl mx-auto font-light leading-relaxed"
            >
              Deploying <span className="text-slate-900 font-medium">high-integrity infrastructure</span> and autonomous neural systems to accelerate your brand's digital evolution.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-40">
            {technicalServices.map((service, idx) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative"
              >
                <div className="h-full p-10 rounded-[48px] bg-white border border-slate-200 shadow-sm group-hover:border-blue-300 group-hover:shadow-xl transition-all duration-500 flex flex-col">
                  <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-10 shadow-md group-hover:scale-110 transition-transform duration-500`}>
                    {service.icon}
                  </div>

                  <h3 className="text-3xl font-bold tracking-tight mb-4 text-slate-900">{service.title}</h3>
                  <p className="text-slate-500 text-base font-light leading-relaxed mb-8 flex-grow">
                    {service.description}
                  </p>

                  <div className="space-y-4 mb-10">
                    {service.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-3 text-slate-600 text-xs font-medium">
                        <Check className="w-4 h-4 text-blue-500" strokeWidth={3} />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => setSelectedService(service)}
                    className="w-full h-16 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-md active:scale-95"
                  >
                    Book Now
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="p-16 rounded-[60px] bg-white border border-slate-200 shadow-sm relative overflow-hidden group text-center lg:text-left">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[100px] -mr-48 -mt-48 group-hover:bg-blue-600/10 transition-colors" />
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
              <div>
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Enterprise Scale</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter leading-none text-slate-900">Infinite <br /> <span className="text-blue-600">Scalability.</span></h2>
                <p className="text-slate-500 text-lg font-light max-w-xl leading-relaxed">
                  Ready to deploy high-authority technical protocols for your organization? Contact our Lead Architect.
                </p>
              </div>
              <button 
                className="px-12 py-7 rounded-3xl bg-slate-900 text-white font-black text-xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-4"
              >
                <Zap className="w-6 h-6 fill-current" />
                Call Architect
              </button>
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selectedService && <BookingModal service={selectedService} onClose={() => setSelectedService(null)} />}
      </AnimatePresence>
    </>
  );
}
