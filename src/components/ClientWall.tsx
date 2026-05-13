'use client';

import { motion } from 'motion/react';
import React from 'react';

const brands = [
  'Cinematic Precision',
  'Viral Engineering',
  'Neural Workflows',
  'Elite Production',
  'Creative Dominance',
  'Studio Grade Quality',
  'Punctual Delivery',
  'Unlimited Potential',
];

const stats = [
  { value: '500+', label: 'Global Clients', colors: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/10' },
  { value: '2k+', label: 'Assets Delivered', colors: 'from-purple-500 to-pink-600', shadow: 'shadow-purple-500/10' },
  { value: '100%', label: 'Retention Rate', colors: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/10' },
  { value: '24/7', label: 'Support Systems', colors: 'from-orange-500 to-red-600', shadow: 'shadow-orange-500/10' },
];

export function ClientWall() {
  return (
    <section className="relative py-32 bg-slate-50 overflow-hidden border-t border-slate-200/60">
      {/* Background Blobs */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter leading-none text-slate-900">
            The Studio <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500">Performance Report</span>
          </h2>
          <p className="text-slate-500 text-lg font-light max-w-2xl mx-auto">
            Measurable impact for brands that demand nothing less than perfection. 
            Our track record speaks in results, not just pixels.
          </p>
        </motion.div>

        {/* Marquee */}
        <div className="relative py-12 border-y border-slate-200 bg-white/50 backdrop-blur-xl mb-24 overflow-hidden group">
          <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-slate-50 to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-slate-50 to-transparent z-10" />
          
          <div className="flex whitespace-nowrap animate-marquee">
            {[...brands, ...brands].map((brand, i) => (
              <div
                key={i}
                className="inline-flex items-center gap-4 mx-12 text-2xl font-bold tracking-tighter text-slate-400 hover:text-slate-900 transition-colors duration-500 cursor-default"
              >
                <span className="text-indigo-500">✦</span> {brand}
              </div>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -10 }}
              className={`group relative bg-white border border-slate-200 rounded-[40px] p-10 text-center transition-all duration-500 hover:border-slate-300 shadow-sm hover:shadow-lg ${stat.shadow}`}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[40px]" />
              <div className={`text-5xl md:text-6xl font-bold bg-gradient-to-br ${stat.colors} bg-clip-text text-transparent mb-4 tracking-tighter leading-none`}>
                {stat.value}
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover:text-slate-700 transition-colors">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </section>
  );
}
