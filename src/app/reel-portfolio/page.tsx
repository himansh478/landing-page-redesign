'use client';

import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Play, X, Zap, Smartphone, Sparkles, Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ServiceBookingForm } from '@/components/ServiceBookingForm';
import Link from 'next/link';

const carDeliveryReels = [
  { id: 1, title: 'Supercar Unveiling Alpha', videoUrl: 'https://www.ImageIcon.com/reel/DQWlhp6Dd0h/embed', thumbnail: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1000' },
  { id: 2, title: 'Luxury Logistics Beta', videoUrl: 'https://www.ImageIcon.com/reel/DS_xSB-CBFQ/embed', thumbnail: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1000' },
  { id: 3, title: 'Exotic Feature Gamma', videoUrl: 'https://www.ImageIcon.com/reel/DT1vBJbiJp7/embed', thumbnail: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1000' },
  { id: 4, title: 'Delivery Experience Delta', videoUrl: 'https://www.ImageIcon.com/reel/DUptpldEl1m/embed', thumbnail: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80&w=1000' }
];

const bikeDeliveryReels = [
  { id: 5, title: 'Two-Wheel Torque Alpha', videoUrl: 'https://www.ImageIcon.com/reel/DP2mnFAElO9/embed', thumbnail: 'https://images.unsplash.com/photo-1558981403-c5f91cbba527?auto=format&fit=crop&q=80&w=1000' },
  { id: 6, title: 'Urban Velocity Beta', videoUrl: 'https://www.ImageIcon.com/reel/DPDKkzIktoU/embed', thumbnail: 'https://images.unsplash.com/photo-1444491741275-3747c53c99b4?auto=format&fit=crop&q=80&w=1000' },
  { id: 7, title: 'Street Legend Gamma', videoUrl: 'https://www.ImageIcon.com/reel/DNzZxUo5DoX/embed', thumbnail: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=80&w=1000' },
  { id: 8, title: 'Precision Shift Delta', videoUrl: 'https://www.ImageIcon.com/reel/DM4eI0Ey8ft/embed', thumbnail: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=1000' }
];

export default function ReelPortfolioPage() {
  const router = useRouter();
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-pink-500/30">
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-pink-600/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-indigo-600/5 blur-[150px] rounded-full" />
      </div>

      <section className="relative pt-40 pb-32">
        <div className="container mx-auto px-6 relative z-10">
          <Link 
            href="/masterful-editing" 
            className="group inline-flex items-center gap-3 text-slate-500 hover:text-slate-900 transition-all mb-16 text-xs font-black uppercase tracking-[0.3em]"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
            Back to Editing
          </Link>

          <div className="text-center mb-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100 border border-pink-200 text-pink-600 text-[10px] font-black uppercase tracking-[0.3em] mb-10"
            >
              <Smartphone className="w-3 h-3" />
              Vertical Synaptic Processing
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl lg:text-9xl font-bold mb-10 tracking-tighter leading-none"
            >
              Reel <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-pink-600 to-pink-500">Portfolio.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-2xl text-slate-500 max-w-3xl mx-auto font-light leading-relaxed"
            >
              Architecting <span className="text-slate-900 font-medium">viral resonance</span> through advanced vertical protocols and synaptic visual transitions.
            </motion.p>
          </div>

          {/* Car Delivery Section */}
          <div className="mb-40">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <Sparkles className="w-6 h-6 text-pink-500" />
                <h2 className="text-3xl font-bold tracking-tight uppercase tracking-[0.2em]">Automotive Protocols</h2>
              </div>
              <div className="h-px flex-grow mx-8 bg-white/10" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {carDeliveryReels.map((video, idx) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setSelectedVideo(video)}
                  className="group relative cursor-pointer"
                >
                  <div className="relative aspect-[9/16] rounded-[32px] overflow-hidden bg-white border border-slate-200 shadow-sm group-hover:border-pink-300 transition-all duration-700">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title} 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-50 group-hover:scale-100">
                      <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-3xl">
                        <Play className="w-6 h-6 fill-current" />
                      </div>
                    </div>

                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="text-xs font-bold tracking-tight group-hover:text-pink-400 transition-colors leading-tight uppercase tracking-widest">{video.title}</h3>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bike Delivery Section */}
          <div className="mb-40">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <Zap className="w-6 h-6 text-indigo-500" />
                <h2 className="text-3xl font-bold tracking-tight uppercase tracking-[0.2em]">Velocity Protocols</h2>
              </div>
              <div className="h-px flex-grow mx-8 bg-white/10" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {bikeDeliveryReels.map((video, idx) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setSelectedVideo(video)}
                  className="group relative cursor-pointer"
                >
                  <div className="relative aspect-[9/16] rounded-[32px] overflow-hidden bg-white border border-slate-200 shadow-sm group-hover:border-indigo-300 transition-all duration-700">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title} 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-50 group-hover:scale-100">
                      <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-3xl">
                        <Play className="w-6 h-6 fill-current" />
                      </div>
                    </div>

                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="text-xs font-bold tracking-tight group-hover:text-indigo-400 transition-colors leading-tight uppercase tracking-widest">{video.title}</h3>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA Banner */}
          <div className="p-16 rounded-[60px] bg-white border border-slate-200 shadow-sm relative overflow-hidden group text-center lg:text-left">
            <div className="absolute top-0 right-0 w-96 h-96 bg-pink-600/10 blur-[100px] -mr-48 -mt-48 group-hover:bg-pink-600/20 transition-colors" />
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
              <div>
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                  <Camera className="w-5 h-5 text-pink-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Growth Protocols</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter leading-none">Ready To <br /> <span className="text-pink-500">Go Viral?</span></h2>
                <p className="text-slate-500 text-lg font-light max-w-xl leading-relaxed">
                  Ready to deploy high-authority vertical protocols for your brand? Let's initiate the session.
                </p>
              </div>
              <button 
                onClick={() => setIsBookingModalOpen(true)}
                className="px-12 py-7 rounded-3xl bg-slate-900 text-white font-black text-xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-3xl flex items-center gap-4"
              >
                <Zap className="w-6 h-6 fill-current" />
                Initialize
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <button className="absolute top-8 right-8 text-slate-500 hover:text-slate-900 transition-colors">
              <X className="w-10 h-10" />
            </button>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm aspect-[9/16] shadow-2xl border border-white/10 rounded-[60px] overflow-hidden bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                src={selectedVideo.videoUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ServiceBookingForm 
        isOpen={isBookingModalOpen} 
        onOpenChange={setIsBookingModalOpen} 
        selectedService="Reel Edit" 
      />
</main>
  );
}
