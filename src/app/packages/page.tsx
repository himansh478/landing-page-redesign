'use client';

import { motion } from 'motion/react';
import { Phone, CheckCircle2, Video, Camera, Clock, CalendarDays, HelpCircle, ArrowLeft, Sparkles, Zap, Smartphone, Instagram } from 'lucide-react';
import Link from 'next/link';

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
    color: 'from-blue-500 to-cyan-500',
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
    color: 'from-purple-500 to-pink-500',
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
    color: 'from-orange-500 to-red-500',
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
    color: 'from-rose-500 to-pink-600',
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
    color: 'from-pink-500 via-rose-500 to-orange-500',
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
    <>
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-600/5 blur-[150px] rounded-full" />
      </div>

      <section className="relative pt-40 pb-32 overflow-hidden bg-slate-50 min-h-screen">
        <div className="container mx-auto px-6 relative z-10">
          <Link 
            href="/" 
            className="group inline-flex items-center gap-3 text-slate-500 hover:text-slate-900 transition-all mb-16 text-xs font-black uppercase tracking-[0.3em]"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
            Back to Studio
          </Link>

          <div className="text-center mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] font-black uppercase tracking-[0.3em] mb-10"
            >
              <Zap className="w-3 h-3" />
              Pan-India Travel Active
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-8xl lg:text-9xl font-bold mb-10 tracking-tighter leading-none text-slate-900"
            >
              Investment <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-600 to-slate-400">Architectures.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-2xl text-slate-500 max-w-3xl mx-auto font-light leading-relaxed"
            >
              Transparent, performance-driven pricing for brands that refuse to compromise on visual excellence.
            </motion.p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
            {pricingPlans.map((plan, idx) => (
              <motion.div
                key={plan.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`group relative p-10 rounded-[40px] bg-white border transition-all duration-500 flex flex-col shadow-sm hover:shadow-md ${
                  plan.featured ? 'border-indigo-300 shadow-[0_0_40px_rgba(79,70,229,0.1)] scale-105 z-10' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[10px] font-black tracking-widest px-6 py-2 rounded-full uppercase shadow-md">
                    Most Strategic
                  </div>
                )}
                
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-10 group-hover:scale-110 transition-transform shadow-md`}>
                  <plan.icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-bold mb-2 tracking-tight uppercase text-slate-900">{plan.title}</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-10">{plan.subtitle}</div>

                <ul className="space-y-4 mb-12 flex-grow">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-4 text-slate-500 group/item">
                      <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                      <span className="text-xs font-medium leading-tight group-hover/item:text-slate-700 transition-colors">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={`https://wa.me/918120317074?text=${encodeURIComponent(
                    `Hello! I want to book the *${plan.title}* package (${plan.price}). Please share more details.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-5 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] text-center hover:bg-indigo-600 transition-all shadow-md hover:shadow-lg"
                >
                  Book Now
                </a>
              </motion.div>
            ))}
          </div>

          {/* Action Banner */}
          <div className="p-16 rounded-[60px] bg-white border border-slate-200 relative overflow-hidden mb-32 shadow-sm">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 blur-[100px] -mr-48 -mt-48" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="text-center md:text-left max-w-xl">
                <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter leading-none text-slate-900">Custom <br /> <span className="text-indigo-600">Neural Flows.</span></h2>
                <p className="text-slate-500 text-lg font-light">
                  Need an enterprise-scale solution? We design custom technical architectures and production workflows for large organizations.
                </p>
              </div>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-4 px-12 py-7 rounded-3xl bg-slate-900 text-white font-black text-xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                <Phone className="w-6 h-6" />
                Discovery Call
              </a>
            </div>
          </div>

          {/* FAQ */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold mb-4 tracking-tighter text-slate-900">Common Inquiries</h2>
              <p className="text-slate-500 font-light">Everything you need to know about our production lifecycle.</p>
            </div>
            <div className="space-y-6">
              {faqs.map((faq, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="p-10 rounded-[40px] bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-default group"
                >
                  <div className="flex gap-8">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors border border-slate-100">
                      <HelpCircle className="w-7 h-7 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-4 tracking-tight text-slate-900">{faq.q}</h3>
                      <p className="text-slate-600 font-light leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
