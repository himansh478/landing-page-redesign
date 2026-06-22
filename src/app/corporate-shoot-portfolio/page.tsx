'use client';

import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Play, X, Zap, Briefcase, Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ServiceBookingForm } from '@/components/ServiceBookingForm';
import Link from 'next/link';

const corporateReels = [
  {
    id: 1,
    title: 'Executive Summary Alpha',
    thumbnail: 'https://api.microlink.io/?url=https://www.instagram.com/reel/DMCdspZSACx/&screenshot=true&meta=false&embed=screenshot.url',
    videoUrl: 'https://www.instagram.com/reel/DMCdspZSACx/embed',
    category: 'Corporate',
    type: 'reel'
  },
  {
    id: 2,
    title: 'Brand Vision Beta',
    thumbnail: 'https://img.youtube.com/vi/hdtGKrTJnrE/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/hdtGKrTJnrE',
    category: 'Corporate',
    type: 'reel'
  },
  {
    id: 3,
    title: 'Product Logic Gamma',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'Corporate',
    type: 'reel'
  },
  {
    id: 4,
    title: 'Strategy Session Delta',
    thumbnail: 'https://img.youtube.com/vi/I2R467vzWRo/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/I2R467vzWRo',
    category: 'Corporate',
    type: 'reel'
  }
];

export default function CorporateShootPortfolioPage() {
  const router = useRouter();
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-500/30">
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-slate-600/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-600/5 blur-[150px] rounded-full" />
      </div>

      <section className="relative pt-40 pb-32">
        <div className="container mx-auto px-6 relative z-10">
          <Link 
            href="/professional-shoots" 
            className="group inline-flex items-center gap-3 text-slate-500 hover:text-slate-900 transition-all mb-16 text-xs font-black uppercase tracking-[0.3em]"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
            Back to Shoots
          </Link>

          <div className="text-center mb-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-10"
            >
              <Briefcase className="w-3 h-3" />
              Enterprise Solutions
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl lg:text-9xl font-bold mb-10 tracking-tighter leading-none"
            >
              Corporate <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-zinc-600 to-zinc-500">Professionalism.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-2xl text-slate-500 max-w-3xl mx-auto font-light leading-relaxed"
            >
              Architecting <span className="text-slate-900 font-medium">brand authority</span> through precision cinematography and sophisticated corporate visual strategies.
            </motion.p>
          </div>

          {/* Highlights Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-32">
            {corporateReels.map((video, idx) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelectedVideo(video)}
                className="group relative cursor-pointer"
              >
                <div className="relative aspect-[9/16] rounded-[48px] overflow-hidden bg-white border border-slate-200 shadow-sm group-hover:border-white/20 transition-all duration-500">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title} 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
                  
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-50 group-hover:scale-100">
                    <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-2xl">
                      <Play className="w-6 h-6 fill-current" />
                    </div>
                  </div>

                  <div className="absolute bottom-8 left-8 right-8 text-center">
                    <h3 className="text-[10px] font-black tracking-[0.3em] uppercase opacity-50 group-hover:opacity-100 transition-opacity">{video.title}</h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA Banner */}
          <div className="p-16 rounded-[60px] bg-white border border-slate-200 shadow-sm relative overflow-hidden group text-center lg:text-left">
            <div className="absolute top-0 right-0 w-96 h-96 bg-zinc-600/10 blur-[100px] -mr-48 -mt-48 group-hover:bg-zinc-600/20 transition-colors" />
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
              <div>
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                  <Camera className="w-5 h-5 text-slate-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Enterprise Protocols</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter leading-none">Elevate Your <br /> <span className="text-white">Business.</span></h2>
                <p className="text-slate-500 text-lg font-light max-w-xl leading-relaxed">
                  Ready to deploy professional cinematography for your corporate narrative? Let's initiate the session.
                </p>
              </div>
              <button 
                onClick={() => setIsBookingModalOpen(true)}
                className="px-12 py-7 rounded-3xl bg-slate-900 text-white font-black text-xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-3xl flex items-center gap-4"
              >
                <Zap className="w-6 h-6 fill-current" />Book Now</button>
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
              className="relative w-full max-w-[450px] aspect-[9/16] rounded-[48px] overflow-hidden bg-black shadow-2xl border border-white/10"
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
        selectedService="Corporate Event Shoot" 
      />
</main>
  );
}
