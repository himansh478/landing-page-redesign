import { motion } from 'motion/react';
import React from 'react';

const HeroSection = React.memo(function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-deep-space">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/60 via-transparent to-purple-100/40" />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-pink-300/15 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 text-center card-3d-wrap">
        <motion.div
          initial={{ opacity: 0, y: 30, rotateX: 10 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 3, ease: "easeInOut" }}
          className="card-3d"
        >
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">
            Stop Overpaying for
            <br />
            <span className="text-gradient">
              Mediocrity
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="text-lg sm:text-xl lg:text-3xl text-slate-600 mb-4 max-w-4xl mx-auto leading-relaxed font-light tracking-wide">
            Everything Your Brand Needs, Under One <span className="text-indigo-600 font-medium">3D Roof.</span>
          </p>

          <p className="text-sm sm:text-base lg:text-xl text-slate-500 mb-10 max-w-3xl mx-auto leading-relaxed font-light px-2 glass-panel-light p-4 rounded-2xl inline-block">
            From <span className="text-slate-800 font-medium">cinematic shoots</span> and <span className="text-slate-800 font-medium">viral edits</span> to <span className="text-indigo-600 font-semibold">AI chatbots</span> and <span className="text-purple-600 font-semibold">automation</span>—we deliver premium results at a fraction of agency costs. Your vision, handled.
          </p>


        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-6 h-10 border-2 border-indigo-400/50 hover:border-indigo-500 rounded-full flex items-start justify-center p-2 transition-colors shadow-md"
        >
          <div className="w-1 h-2 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
    );
});
export { HeroSection };
