'use client';

import { motion } from 'motion/react';
import React from 'react';
import { ArrowRight, Play, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const HeroSection = React.memo(function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 selection:bg-indigo-500/30">
      {/* Dynamic Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Animated Grid */}
        <div 
          className="absolute inset-0 opacity-[0.2]"
          style={{
            backgroundImage: `linear-gradient(#818cf8 1px, transparent 1px), linear-gradient(to right, #818cf8 1px, transparent 1px)`,
            backgroundSize: '80px 80px'
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 text-center">
        {/* Elite Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-indigo-200 bg-white/80 backdrop-blur-xl text-indigo-600 text-xs font-black mb-10 uppercase tracking-[0.3em] shadow-sm"
        >
          <Sparkles className="w-4 h-4 animate-spin-slow" />
          The New Standard in Creative Tech
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-8xl lg:text-9xl font-bold mb-10 tracking-tighter leading-none"
        >
          <span className="text-slate-900">Stop Overpaying for</span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">Mediocrity.</span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-3xl text-slate-600 max-w-4xl mx-auto font-light leading-relaxed mb-16"
        >
          Everything Your Brand Needs, Under One <br className="hidden md:block" />
          <span className="text-slate-900 font-medium italic underline decoration-indigo-500 underline-offset-8">Creative Roof.</span>
        </motion.p>

        {/* Value Prop Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-20"
        >
          {[
            { icon: Zap, label: 'Viral Edits', color: 'text-amber-500' },
            { icon: Sparkles, label: 'Cinematic Logic', color: 'text-indigo-600' },
            { icon: ShieldCheck, label: 'Agency Quality', color: 'text-emerald-600' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <item.icon className={`w-5 h-5 ${item.color}`} />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-700">{item.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Main Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <Link
            href="/find-to-fill"
            className="group relative inline-flex items-center justify-center px-12 py-7 rounded-[24px] bg-slate-900 text-white font-bold text-xl transition-all duration-500 hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl overflow-hidden"
          >
            <span className="relative z-10 uppercase tracking-widest">I have work</span>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity" />
          </Link>
          
          <Link
            href="/find-clients"
            className="group relative inline-flex items-center justify-center px-12 py-7 rounded-[24px] border-2 border-slate-300 bg-white/50 backdrop-blur-xl text-slate-900 font-bold text-xl transition-all duration-500 hover:scale-105 active:scale-95 hover:border-indigo-500/50"
          >
            <span className="relative z-10 uppercase tracking-widest">Find Work</span>
            <div className="absolute inset-0 bg-slate-100 translate-y-full group-hover:translate-y-0 transition-transform" />
          </Link>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Explore Studio</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-[1px] h-12 bg-gradient-to-b from-indigo-500 to-transparent"
        />
      </motion.div>
    </section>
  );
});

export { HeroSection };
