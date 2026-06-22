'use client';

import { motion } from 'motion/react';
import { Sparkles, Heart, Zap, Target, Users, Camera, Video, Code } from 'lucide-react';
import Image from 'next/image';

export default function AboutUsPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 selection:bg-indigo-500/30 overflow-hidden">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/5 blur-[120px] rounded-full" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-8"
              >
                <Sparkles className="w-4 h-4" />
                The Story of Cwaya
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none mb-8"
              >
                Crafting <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
                  Digital Legacy.
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg text-slate-500 max-w-2xl font-light leading-relaxed mb-12"
              >
                We are more than a creative studio. We are a powerhouse of innovation, blending high-end cinematography, masterful editing, and strategic tech solutions to elevate your brand to the next dimension.
              </motion.p>
            </div>
            <div className="flex-1 relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="relative z-10 rounded-[60px] overflow-hidden border-8 border-white shadow-2xl"
                >
                    <div className="aspect-square bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-12">
                        <Users className="w-32 h-32 text-white/20 absolute -top-10 -right-10" />
                        <div className="text-center">
                            <h2 className="text-white text-6xl font-black mb-2">500+</h2>
                            <p className="text-indigo-100 font-bold uppercase tracking-widest text-sm">Projects Delivered</p>
                        </div>
                    </div>
                </motion.div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl" />
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              whileHover={{ y: -10 }}
              className="p-12 rounded-[48px] bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mb-8">
                <Target className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-3xl font-bold mb-6">Our Mission</h3>
              <p className="text-slate-500 leading-relaxed font-light">
                To empower creators and businesses by providing world-class media production and technological infrastructure. We strive to make premium creative services accessible and impactful for everyone.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -10 }}
              className="p-12 rounded-[48px] bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all"
            >
              <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mb-8">
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold mb-6">Our Vision</h3>
              <p className="text-slate-500 leading-relaxed font-light">
                To become the global standard for digital creativity, where every frame tells a story and every line of code solves a problem. We are building the future of media, one project at a time.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6">What Drives Us</h2>
            <p className="text-slate-500 max-w-xl mx-auto font-light">The core principles that define our work ethic and creative process.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Camera />, title: "Precision", text: "Every pixel, every frame, perfectly aligned." },
              { icon: <Heart />, title: "Passion", text: "We love what we do, and it shows in our work." },
              { icon: <Video />, title: "Innovation", text: "Using the latest AI and tech to push limits." },
              { icon: <Code />, title: "Reliability", text: "Consistent results that you can always count on." },
            ].map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-8"
              >
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6 text-indigo-600 group-hover:scale-110 transition-transform">
                  {value.icon}
                </div>
                <h4 className="text-xl font-bold mb-3">{value.title}</h4>
                <p className="text-sm text-slate-500 font-light">{value.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pb-32 px-6">
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="max-w-5xl mx-auto p-12 md:p-20 rounded-[60px] bg-gradient-to-br from-indigo-600 to-purple-700 text-white text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">Ready to start your <br /> next project?</h2>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a href="/packages" className="bg-white text-indigo-600 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all shadow-xl">
                View Packages
              </a>
              <a href="/contact-us" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all">
                Contact Us
              </a>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
