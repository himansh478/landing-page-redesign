'use client';

import { motion } from 'motion/react';
import { ArrowLeft, Film, Clapperboard, Crown, Mountain, Music, Camera, CheckCircle2, Zap, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Link from 'next/link';

const themes = [
  {
    id: 1, title: 'KGF Cinematic', icon: <Crown className="w-8 h-8" />,
    description: 'Dark, gritty, and powerful cinematography inspired by KGF aesthetics',
    features: ['Intense Color Grading', 'Dramatic Lighting', 'Epic Transitions', 'Powerful Music'],
    gradient: 'from-amber-500 to-orange-900', price: '₹25,000+',
  },
  {
    id: 2, title: 'Pushparaj Folk', icon: <Film className="w-8 h-8" />,
    description: 'Bold and rustic style with mass appeal elements and earthy tones',
    features: ['Rustic Aesthetics', 'Mass Scenes', 'Bold Edits', 'Dynamic BGM'],
    gradient: 'from-red-500 to-rose-900', price: '₹25,000+',
  },
  {
    id: 3, title: 'Trader Professional', icon: <Clapperboard className="w-8 h-8" />,
    description: 'Professional and sleek corporate/business style for the modern era',
    features: ['Corporate Look', 'Professional Edits', 'Clean Transitions', 'Business Tone'],
    gradient: 'from-blue-500 to-indigo-900', price: '₹20,000+',
  },
  {
    id: 4, title: 'South Heritage', icon: <Music className="w-8 h-8" />,
    description: 'Vibrant colors and traditional South Indian cultural aesthetics',
    features: ['Vibrant Colors', 'Traditional Elements', 'Cultural Touch', 'Folk Music'],
    gradient: 'from-green-500 to-emerald-900', price: '₹22,000+',
  },
  {
    id: 5, title: 'Rajasthan Royal', icon: <Mountain className="w-8 h-8" />,
    description: 'Royal heritage with rich cultural elements and desert warmth',
    features: ['Royal Aesthetics', 'Heritage Look', 'Warm Tones', 'Traditional Music'],
    gradient: 'from-orange-500 to-red-900', price: '₹22,000+',
  },
  {
    id: 6, title: 'Western Modern', icon: <Camera className="w-8 h-8" />,
    description: 'Hollywood-style modern cinematography with global appeal',
    features: ['Cinematic Look', 'Modern Edits', 'Western Music', 'High Production'],
    gradient: 'from-purple-500 to-fuchsia-900', price: '₹30,000+',
  },
];

export default function ThemeBasedPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-purple-500/30">
      <Header />
      
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-600/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-600/5 blur-[150px] rounded-full" />
      </div>

      <section className="relative pt-40 pb-32">
        <div className="container mx-auto px-6 relative z-10">
          <Link 
            href="/" 
            className="group inline-flex items-center gap-3 text-slate-500 hover:text-slate-900 transition-all mb-16 text-xs font-black uppercase tracking-[0.3em]"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
            Back to Home
          </Link>

          <div className="text-center mb-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 border border-purple-200 text-purple-600 text-[10px] font-black uppercase tracking-[0.3em] mb-10"
            >
              <Sparkles className="w-3 h-3" />
              Aesthetic Engineering
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl lg:text-9xl font-bold mb-10 tracking-tighter leading-none"
            >
              Theme Based <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-purple-600 to-purple-400">Edit & Shoot.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-2xl text-slate-500 max-w-3xl mx-auto font-light leading-relaxed"
            >
              Deploying <span className="text-slate-900 font-medium">cinematic blueprints</span> tailored to your narrative's specific frequency and cultural resonance.
            </motion.p>
          </div>

          {/* Themes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
            {themes.map((theme, idx) => (
              <motion.div
                key={theme.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative"
              >
                <div className="h-full p-10 rounded-[48px] bg-white border border-slate-200 shadow-sm group-hover:border-purple-300 group-hover:shadow-xl transition-all duration-500 flex flex-col">
                  <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center mb-10 shadow-md group-hover:scale-110 transition-transform duration-500`}>
                    {theme.icon}
                  </div>

                  <h3 className="text-3xl font-bold tracking-tight mb-4 text-slate-900">{theme.title}</h3>
                  <p className="text-slate-500 text-lg font-light leading-relaxed mb-8 flex-grow">
                    {theme.description}
                  </p>

                  <div className="space-y-4 mb-10">
                    {theme.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-3 text-slate-600 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-purple-500" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Estimation</div>
                      <div className="text-2xl font-bold text-slate-900 tracking-tight">{theme.price}</div>
                    </div>
                    <button className="px-6 py-4 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-purple-600 transition-all shadow-md">
                      Select
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA Banner */}
          <div className="p-16 rounded-[60px] bg-white border border-slate-200 shadow-sm relative overflow-hidden group text-center lg:text-left">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/5 blur-[100px] -mr-48 -mt-48 group-hover:bg-purple-600/10 transition-colors" />
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
              <div>
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                  <Clapperboard className="w-5 h-5 text-purple-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Custom Architecture</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter leading-none text-slate-900">Need A <br /> <span className="text-purple-600">Custom Theme?</span></h2>
                <p className="text-slate-500 text-lg font-light max-w-xl leading-relaxed">
                  Have a unique vision? We engineer custom visual protocols tailored to your specific requirements.
                </p>
              </div>
              <button 
                className="px-12 py-7 rounded-3xl bg-slate-900 text-white font-black text-xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-4"
              >
                <Zap className="w-6 h-6 fill-current" />Book Now</button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
