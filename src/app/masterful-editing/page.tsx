'use client';

import { motion, AnimatePresence } from 'motion/react';
import { PlayCircle, Film, Sparkles, Heart, ArrowLeft, Check, Play, Eye, ArrowRight, Sparkle, Video } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ServiceBookingForm } from '@/components/ServiceBookingForm';

const portfolioRoutes: Record<string, string> = {
  'Vlog Edit': '/vlog-edit-portfolio',
  'Documentary Edit': '/documentary-portfolio',
  'Reel Edit': '/reel-portfolio',
  'Wedding Edit': '/wedding-portfolio',
};

const editingServices = [
  {
    id: 1,
    title: 'Vlog Edit',
    icon: Video,
    description: 'Dynamic pacing and professional storytelling for creators.',
    features: ['Jump cuts & transitions', 'Color correction', 'Background music', 'Text overlays & graphics'],
    image: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?q=80&w=2070&auto=format&fit=crop',
    price: '₹300 - ₹1,000',
    color: 'text-red-600',
    bg: 'bg-red-100',
  },
  {
    id: 2,
    title: 'Documentary Edit',
    icon: Film,
    description: 'Cinematic documentary grading and deep-narrative pacing.',
    features: ['Pacing & Dynamic Visuals', 'Motion Graphics', 'B-roll integration', 'Subtitle integration'],
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop',
    price: '₹300 - ₹2,000',
    color: 'text-blue-600',
    bg: 'bg-blue-100',
  },
  {
    id: 3,
    title: 'Reel Edit',
    icon: Sparkles,
    description: 'High-engagement viral reels with trending SFX.',
    features: ['Trending transitions', 'Viral effects & filters', 'Beat-synced editing'],
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop',
    price: '₹50 - ₹2,000',
    color: 'text-pink-600',
    bg: 'bg-pink-100',
  },
  {
    id: 5,
    title: 'Wedding Edit',
    icon: Heart,
    description: 'Emotional storytelling that preserves your legacy.',
    features: ['Cinematic highlights reel', 'Full ceremony edit', 'Romantic color grading', 'Audio from vows & speeches'],
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop',
    price: '₹500 - ₹5,000',
    color: 'text-rose-600',
    bg: 'bg-rose-100',
  },
];

export default function MasterfulEditingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');

  const handleBookNow = (title: string) => {
    setSelectedService(title);
    setIsModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-purple-500/30">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(147,51,234,0.1),transparent_70%)] opacity-50" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 border border-purple-200 text-purple-600 text-sm font-bold mb-8 uppercase tracking-widest">
              <Sparkle className="w-4 h-4" />
              Elite Post-Production
            </div>
            <h1 className="text-5xl md:text-8xl font-bold mb-8 tracking-tighter leading-none text-slate-900">
              Masterful <br />
              <span className="text-purple-600">Editing</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto font-light leading-relaxed mb-12">
              Transform raw footage into captivating cinematic experiences. 
              Specialized editing services crafted for world-class storytellers.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {editingServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-white rounded-[40px] border border-slate-200 overflow-hidden hover:border-purple-300 transition-all duration-500 shadow-sm hover:shadow-xl"
              >
                {/* Image Container */}
                <div className="relative h-72 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
                  
                  {/* Icon Badge */}
                  <div className={`absolute top-6 right-6 w-14 h-14 rounded-2xl ${service.bg} ${service.color} flex items-center justify-center backdrop-blur-md border border-slate-100 group-hover:scale-110 transition-transform shadow-md`}>
                    <service.icon className="w-7 h-7" />
                  </div>

                  {/* Price Badge */}
                  <div className="absolute bottom-6 left-6 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold text-sm shadow-md">
                    {service.price}
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-3 uppercase tracking-tighter group-hover:text-purple-600 transition-colors text-slate-900">
                    {service.title}
                  </h3>
                  <p className="text-slate-500 font-light mb-8 text-sm leading-relaxed">{service.description}</p>
                  
                  <ul className="space-y-4 mb-10">
                    {service.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-3 text-xs font-bold text-slate-500 uppercase tracking-tighter">
                        <Check className="w-4 h-4 text-purple-500" strokeWidth={3} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="grid grid-cols-2 gap-4">
                    <Link
                      href={portfolioRoutes[service.title] || '#'}
                      className="py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2 hover:text-slate-900"
                    >
                      <Eye className="w-4 h-4" />
                      Portfolio
                    </Link>
                    <button
                      onClick={() => handleBookNow(service.title)}
                      className="py-4 rounded-2xl bg-purple-600 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-purple-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    >
                      Book Now
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Quote Section */}
      <section className="py-32 bg-slate-100">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto bg-white border border-slate-200 shadow-sm rounded-[60px] p-12 md:p-24 text-center relative overflow-hidden group hover:shadow-xl transition-all">
            <div className="absolute inset-0 bg-purple-600/5 blur-[120px] pointer-events-none group-hover:bg-purple-600/10 transition-all" />
            <h2 className="text-4xl md:text-7xl font-bold text-slate-900 mb-8 tracking-tighter">
              Bespoke <br /> <span className="text-purple-600">Post-Production</span>
            </h2>
            <p className="text-xl text-slate-500 mb-12 font-light leading-relaxed max-w-2xl mx-auto">
              Every masterpiece requires a unique lens. Let's discuss your custom 
              editing workflow and bring your specific vision to the screen.
            </p>
            <button className="px-12 py-6 bg-slate-900 text-white rounded-3xl text-xs uppercase tracking-widest font-black hover:bg-purple-600 hover:text-white transition-all shadow-xl hover:shadow-2xl">
              Get Custom Quote
            </button>
          </div>
        </div>
      </section>

      <ServiceBookingForm isOpen={isModalOpen} onOpenChange={setIsModalOpen} selectedService={selectedService} />
    </main>
  );
}
