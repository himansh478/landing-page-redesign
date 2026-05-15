'use client';

import { motion } from 'motion/react';
import { Film, Camera, Share2, Users, Bot, ArrowRight, Sparkles, Wand2, Zap, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

const services = [
  {
    id: 1,
    title: 'Editing Types',
    icon: Film,
    description: 'Cinematic storytelling with elite color grading and sound design.',
    href: '/masterful-editing',
    features: ['Viral Reels', 'YouTube Systems', '3D Animation'],
    gradient: 'from-purple-500 via-pink-500 to-rose-500',
    glow: 'group-hover:shadow-purple-500/10'
  },
  {
    id: 2,
    title: 'Precision Shoots',
    icon: Camera,
    description: 'High-end production for products, weddings, and commercial ad films.',
    href: '/professional-shoots',
    features: ['4K Production', 'Product Macro', 'Event Elite'],
    gradient: 'from-blue-500 via-indigo-500 to-violet-500',
    glow: 'group-hover:shadow-blue-500/10'
  },
  {
    id: 3,
    title: 'Digital Authority',
    icon: Share2,
    description: 'Strategic social media management that dominates the algorithm.',
    href: '/social-media-management',
    features: ['Growth Systems', 'Content Strategy', 'Analytics'],
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    glow: 'group-hover:shadow-orange-500/10'
  }
];

export function ServiceHub() {
  const router = useRouter();

  return (
    <section className="relative py-32 bg-white overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] mb-6 shadow-sm">
            <Zap className="w-3 h-3 text-indigo-500" />
            Ecosystem of Excellence
          </div>
          <h2 className="text-4xl md:text-7xl font-bold mb-8 tracking-tighter leading-none text-slate-900">
            Your Complete <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-600 to-slate-400">Creative Arsenal</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-light leading-relaxed">
            From viral social content to studio-grade production. 
            Select your gateway to digital dominance.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {services.map((service, idx) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => router.push(service.href)}
              className={`group relative bg-slate-50 border border-slate-200 rounded-[40px] p-8 cursor-pointer hover:border-slate-300 transition-all duration-500 hover:-translate-y-2 shadow-md hover:shadow-xl ${service.glow}`}
            >
              {/* Card Glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-[40px]`} />
              
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.gradient} p-[1px] mb-8 group-hover:scale-110 transition-transform duration-500 shadow-md`}>
                <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center">
                  <service.icon className="w-8 h-8 text-slate-900" />
                </div>
              </div>

              <h3 className="text-2xl font-bold mb-4 tracking-tight uppercase text-slate-900 group-hover:text-indigo-600 transition-colors">{service.title}</h3>
              <p className="text-slate-500 text-sm font-light leading-relaxed mb-8 group-hover:text-slate-600 transition-colors">{service.description}</p>
              
              <div className="space-y-3 mb-10">
                {service.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-500 transition-colors">
                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${service.gradient}`} />
                    {feature}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-slate-900 text-xs font-bold uppercase tracking-widest group-hover:gap-4 transition-all group-hover:text-indigo-600">
                Enter Studio
                <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}