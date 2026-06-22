'use client';

import { motion } from 'motion/react';
import { Heart, Smartphone, Megaphone, Briefcase, Zap, Flower2, TrendingUp, Film, ArrowLeft, Check, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ServiceBookingForm } from '@/components/ServiceBookingForm';
import Link from 'next/link';

const shootServices = [
  {
    id: 1,
    title: 'Wedding Production',
    icon: <Heart className="w-8 h-8" />,
    description: 'Complete sacred event coverage with cinematic narrative protocols.',
    features: ['Bridal Portraits', 'Ceremony Coverage', 'Candid Moments', 'Drone Cinematography'],
    image: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=1000',
    price: '5000 - 20000',
    gradient: 'from-rose-500 to-pink-900',
    route: '/wedding-portfolio',
  },
  {
    id: 2,
    title: 'Social Content Shoot',
    icon: <Smartphone className="w-8 h-8" />,
    description: 'High-velocity content creation for algorithmic social resonance.',
    features: ['Reel Production', 'YouTube Optimization', 'Professional Lighting', 'Multi-Cam Setup'],
    image: 'https://images.unsplash.com/photo-1598128558393-70ff21433be0?auto=format&fit=crop&q=80&w=1000',
    price: '2000 - 10000',
    gradient: 'from-pink-500 to-rose-900',
    route: '/social-video-portfolio',
  },
  {
    id: 3,
    title: 'Commercial Ads',
    icon: <Megaphone className="w-8 h-8" />,
    description: 'Professional high-conversion advertisement and product cinematography.',
    features: ['30-60s Ad Protocols', 'Product Showcasing', 'Studio Lighting', 'Conversion Grading'],
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1000',
    price: '1000 - 20000',
    gradient: 'from-orange-500 to-yellow-900',
    route: '/commercial-portfolio',
  },
  {
    id: 4,
    title: 'Corporate Identity',
    icon: <Briefcase className="w-8 h-8" />,
    description: 'Professional enterprise-grade coverage of events and brand assets.',
    features: ['Conference Protocols', 'Speaker Interviews', 'Corporate Reels', 'Quick Turnaround'],
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000',
    price: '5000 - 30000',
    gradient: 'from-blue-500 to-cyan-900',
    route: '/corporate-shoot-portfolio',
  },
  {
    id: 5,
    title: 'Marketing Campaigns',
    icon: <Zap className="w-8 h-8" />,
    description: 'Strategic video production engineered for high-impact campaigns.',
    features: ['Tutorial Protocols', 'Explainer Visuals', 'Campaign Logistics', 'Multi-Format Delivery'],
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1000',
    price: '1000 - 10000',
    gradient: 'from-purple-500 to-violet-900',
    route: '/marketing-portfolio',
  },
  {
    id: 6,
    title: 'Religious Events',
    icon: <Flower2 className="w-8 h-8" />,
    description: 'Respectful and artistic coverage of sacred ceremonies and rituals.',
    features: ['Ritual Documentation', 'Devotional Content', 'Sacred Atmosphere', 'Sensitive Editing'],
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=1000',
    price: '1000 - 10000',
    gradient: 'from-amber-500 to-orange-900',
    route: '/religious-portfolio',
  },
  {
    id: 7,
    title: 'Political Strategy',
    icon: <TrendingUp className="w-8 h-8" />,
    description: 'Campaign-ready video production for authoritative public messaging.',
    features: ['Rally Protocols', 'Interview Logistics', 'Campaign Messaging', 'Impact Grading'],
    image: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&q=80&w=1000',
    price: '2000 - 20000',
    gradient: 'from-red-500 to-orange-900',
    route: '/political-portfolio',
  },
  {
    id: 8,
    title: 'Cinematic High-End',
    icon: <Film className="w-8 h-8" />,
    description: 'Top-tier production utilizing cinema-grade equipment and aesthetics.',
    features: ['4K/8K Protocols', 'Drone Cinematography', 'Neural Grade', 'Visual Effects Ready'],
    image: 'https://images.unsplash.com/photo-1533488765986-dfa2a9939acd?auto=format&fit=crop&q=80&w=1000',
    price: '3000 - 30000',
    gradient: 'from-purple-500 to-pink-900',
    route: '/cinematic-portfolio',
  },
];

export default function ProfessionalShootPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');

  const handleBookNow = (title: string) => {
    setSelectedService(title);
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-cyan-600/5 blur-[150px] rounded-full" />
      </div>

      <section className="relative pt-40 pb-32 bg-slate-50 min-h-screen">
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
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-10"
            >
              <Film className="w-3 h-3" />
              Production Core Node
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl lg:text-9xl font-bold mb-10 tracking-tighter leading-none text-slate-900"
            >
              Professional <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-blue-600 to-blue-400">Shoots.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-2xl text-slate-500 max-w-3xl mx-auto font-light leading-relaxed"
            >
              Architecting <span className="text-slate-900 font-medium">cinematic experiences</span> through high-authority production protocols and precision cinematography.
            </motion.p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-32">
            {shootServices.map((service, idx) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative bg-white border border-slate-200 shadow-sm rounded-[48px] overflow-hidden hover:border-blue-300 hover:shadow-xl transition-all duration-500"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
                  
                  <div className="absolute top-8 right-8 w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    {service.icon}
                  </div>

                  <div className="absolute bottom-8 left-8 flex items-center gap-3 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Unit:</span>
                    <span className="text-sm font-bold text-slate-900">₹{service.price}</span>
                  </div>
                </div>

                <div className="p-10">
                  <h3 className="text-3xl font-bold tracking-tight mb-4 group-hover:text-blue-600 transition-colors text-slate-900">{service.title}</h3>
                  <p className="text-slate-500 font-light leading-relaxed mb-8 h-12 line-clamp-2">
                    {service.description}
                  </p>

                  <div className="space-y-4 mb-10">
                    {service.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-3 text-slate-600 text-xs font-medium">
                        <Check className="w-4 h-4 text-blue-500" strokeWidth={3} />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Link 
                      href={service.route}
                      className="h-14 rounded-2xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest flex items-center justify-center hover:bg-slate-200 hover:text-slate-900 transition-all"
                    >
                      Portfolio
                    </Link>
                    <button 
                      onClick={() => handleBookNow(service.title)}
                      className="h-14 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-md"
                    >Book Now</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA Banner */}
          <div className="p-16 rounded-[60px] bg-white border border-slate-200 shadow-sm relative overflow-hidden group text-center lg:text-left">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[100px] -mr-48 -mt-48 group-hover:bg-blue-600/10 transition-colors" />
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
              <div>
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                  <Eye className="w-5 h-5 text-blue-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Custom Production</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter leading-none text-slate-900">Unique <br /> <span className="text-blue-600">Vision?</span></h2>
                <p className="text-slate-500 text-lg font-light max-w-xl leading-relaxed">
                  Every story requires a specific frequency. Let's engineer a custom production protocol tailored to your requirements.
                </p>
              </div>
              <button 
                className="px-12 py-7 rounded-3xl bg-slate-900 text-white font-black text-xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-4"
              >
                <Zap className="w-6 h-6 fill-current" />
                Contact Architect
              </button>
            </div>
          </div>
        </div>
      </section>

      <ServiceBookingForm 
        isOpen={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        selectedService={selectedService} 
      />
    </>
  );
}
