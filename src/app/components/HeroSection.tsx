import { motion } from 'motion/react';
import React from 'react';
import { ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router';

const HeroSection = React.memo(function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-deep-space">
      {/* background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/70 via-transparent to-purple-100/50 dark:from-indigo-950/40 dark:via-transparent dark:to-purple-950/30 pointer-events-none" />

      {/* floating ambient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[32rem] h-[32rem] bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[32rem] h-[32rem] bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-[100px] animate-pulse [animation-delay:1s]" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-400/15 dark:bg-pink-600/08 rounded-full blur-[80px] animate-pulse [animation-delay:2s]" />
        {/* grid pattern for dark mode */}
        <div className="hidden dark:block absolute inset-0 opacity-[0.03]"
          style={{backgroundImage: 'linear-gradient(#818cf8 1px, transparent 1px), linear-gradient(to right, #818cf8 1px, transparent 1px)', backgroundSize: '60px 60px'}}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36 text-center">
        {/* badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-semibold mb-7 tracking-wide shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          Premium Creative & Tech Services · India
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-slate-900 dark:text-white mb-5 leading-[1.1] tracking-[-0.03em]"
          style={{ fontFamily: 'Outfit, Inter, sans-serif' }}
        >
          Stop Overpaying for
          <br />
          <span className="text-gradient">Mediocrity</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.25 }}
          className="text-lg sm:text-xl lg:text-2xl text-slate-600 dark:text-slate-300 mb-5 max-w-3xl mx-auto leading-relaxed font-light tracking-wide"
        >
          Everything Your Brand Needs, Under One{' '}
          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Creative Roof.</span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.35 }}
          className="text-sm sm:text-base lg:text-lg text-slate-500 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed px-3 py-4 rounded-2xl glass-panel-light"
        >
          From{' '}
          <span className="text-slate-800 dark:text-slate-200 font-semibold">cinematic shoots</span>
          {' '}and{' '}
          <span className="text-slate-800 dark:text-slate-200 font-semibold">viral edits</span>
          {' '}to{' '}
          <span className="text-indigo-600 dark:text-indigo-400 font-bold">AI chatbots</span>
          {' '}and{' '}
          <span className="text-purple-600 dark:text-purple-400 font-bold">automation</span>
          —premium results at a fraction of agency costs.
        </motion.p>

        {/* cta buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.45 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            to="/packages"
            className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-base shadow-lg hover:shadow-indigo-500/30 hover:shadow-2xl transition-all duration-300 neon-border"
          >
            View Packages
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button
            onClick={() => window.dispatchEvent(new Event('open-auth-gate'))}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-white/5 text-slate-800 dark:text-slate-100 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 font-bold text-base transition-all duration-300 backdrop-blur-sm"
          >
            <Play className="w-4 h-4 fill-current" />
            Connect with Us
          </button>
        </motion.div>

        {/* trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-14 flex flex-wrap gap-6 justify-center items-center text-xs sm:text-sm text-slate-400 dark:text-slate-500 font-medium"
        >
          {['✦ 100% Satisfaction', '✦ Premium Quality', '✦ Fast Delivery', '✦ Affordable Pricing'].map(badge => (
            <span key={badge} className="tracking-wide">{badge}</span>
          ))}
        </motion.div>
      </div>

      {/* scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="w-6 h-10 border-2 border-indigo-400/40 dark:border-indigo-500/40 rounded-full flex items-start justify-center p-2 transition-colors"
        >
          <div className="w-1 h-2 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
});

export { HeroSection };
