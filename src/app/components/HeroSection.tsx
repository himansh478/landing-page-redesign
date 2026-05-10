import { motion } from 'motion/react';
import React from 'react';
import { ArrowRight, Play, Video, Wand2, Megaphone, Heart, Briefcase, Scissors, Smartphone, Palette, Film, MonitorPlay, Camera, Share2 } from 'lucide-react';
import { Link } from 'react-router';

const floatingTags = [
  { icon: Video, label: 'Vlog Edit', delay: 0, top: '20%', left: '8%' },
  { icon: Wand2, label: 'AI Edit', delay: 1.2, top: '15%', right: '12%' },
  { icon: Megaphone, label: 'Political Shoot', delay: 0.5, bottom: '35%', left: '5%' },
  { icon: Heart, label: 'Wedding Shoot', delay: 2.1, bottom: '30%', right: '8%' },
  { icon: Briefcase, label: 'Corporate Shoot', delay: 1.8, top: '45%', left: '2%' },
  { icon: Scissors, label: 'Master Editing', delay: 0.8, top: '35%', right: '3%' },
  { icon: Smartphone, label: 'Reel Edit', delay: 2.5, top: '10%', left: '35%' },
  { icon: Palette, label: 'Theme Based', delay: 1.5, bottom: '20%', right: '35%' },
  { icon: Film, label: 'Documentary', delay: 0.3, bottom: '15%', left: '25%' },
  { icon: MonitorPlay, label: 'Commercial', delay: 2.8, top: '8%', right: '35%' },
  { icon: Camera, label: 'Cinematic', delay: 1.1, top: '55%', right: '2%' },
  { icon: Share2, label: 'Social Video', delay: 0.7, top: '65%', left: '6%' },
];

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

      {/* Floating service icons */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden max-w-7xl mx-auto">
        {floatingTags.map((tag, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, y: [0, -15, 0] }}
            transition={{ 
              opacity: { duration: 1, delay: tag.delay },
              scale: { duration: 1, delay: tag.delay },
              y: { repeat: Infinity, duration: 4 + (index % 2), delay: tag.delay, ease: "easeInOut" }
            }}
            className="absolute flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-white/30 md:bg-white/40 dark:bg-slate-900/30 md:dark:bg-slate-900/40 backdrop-blur-md border border-indigo-200/30 md:border-indigo-200/50 dark:border-indigo-500/20 md:dark:border-indigo-500/30 shadow-sm text-[10px] md:text-xs font-medium text-slate-600/80 md:text-slate-700 dark:text-slate-400/80 md:dark:text-slate-300"
            style={{ 
              top: tag.top, 
              left: tag.left, 
              right: tag.right, 
              bottom: tag.bottom 
            }}
          >
            <tag.icon className="w-3 h-3 md:w-3.5 md:h-3.5 text-indigo-500/70 md:text-indigo-600 dark:text-indigo-400/70 md:dark:text-indigo-400" />
            {tag.label}
          </motion.div>
        ))}
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
          className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black mb-5 leading-[1.1] tracking-[-0.03em]"
          style={{ fontFamily: 'Outfit, Inter, sans-serif' }}
        >
          <span className="text-slate-900 dark:text-white text-3d">Stop Overpaying for</span>
          <br />
          <span className="text-gradient-3d">Mediocrity</span>
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
            to="/shoot-booking"
            className="group relative inline-flex items-center justify-center px-10 py-5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] hover:bg-right text-white font-black text-xl shadow-2xl hover:shadow-indigo-500/50 transition-all duration-500 hover:scale-110 active:scale-95 animate-shimmer"
          >
            <span className="relative z-10 uppercase tracking-widest">I_have_work</span>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-400 to-purple-400 blur-xl opacity-20 group-hover:opacity-60 transition-opacity animate-pulse" />
          </Link>
          <Link
            to="/find-clients"
            className="group relative inline-flex items-center justify-center px-10 py-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white/10 dark:bg-white/5 text-slate-900 dark:text-white font-black text-xl transition-all duration-500 hover:scale-110 active:scale-95 backdrop-blur-md hover:border-indigo-500 overflow-hidden"
          >
            <span className="relative z-10 uppercase tracking-widest">Find Clients</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </Link>
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
