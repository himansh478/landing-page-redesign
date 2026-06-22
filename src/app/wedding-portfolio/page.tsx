'use client';

import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Play, X, Zap, Heart, Camera, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ServiceBookingForm } from '@/components/ServiceBookingForm';
import Link from 'next/link';

const weddingHighlights = [
  {
    id: 1,
    title: 'Eternal Resonance Alpha',
    thumbnail: 'https://img.youtube.com/vi/dIRN9hI6_Rk/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/dIRN9hI6_Rk',
    category: 'Highlights',
    duration: '0:45',
  },
  {
    id: 2,
    title: 'Divine Union Beta',
    thumbnail: 'https://img.youtube.com/vi/nX41UPdjDV4/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/nX41UPdjDV4',
    category: 'Emotions',
    duration: '1:20',
  },
  {
    id: 3,
    title: 'Sacred Details Gamma',
    thumbnail: 'https://img.youtube.com/vi/mDTOyJBvJs8/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/mDTOyJBvJs8',
    category: 'Details',
    duration: '0:30',
  },
  {
    id: 4,
    title: 'Ceremonial Celebration Delta',
    thumbnail: 'https://img.youtube.com/vi/-l0cn9-bCEs/maxresdefault.jpg',
    videoUrl: "https://www.youtube.com/embed/-l0cn9-bCEs",
    category: 'Celebration',
    duration: '1:00',
  }
];

export default function WeddingPortfolioPage() {
  const router = useRouter();
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-rose-500/30">
      
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-rose-500/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-pink-500/5 blur-[150px] rounded-full" />
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
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 border border-rose-200 text-rose-600 text-[10px] font-black uppercase tracking-[0.3em] mb-10"
            >
              <Heart className="w-3 h-3" />
              Eternal Narrative Documentation
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl lg:text-9xl font-bold mb-10 tracking-tighter leading-none text-slate-900"
            >
              Wedding <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-rose-600 to-rose-500">Portfolio.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-2xl text-slate-500 max-w-3xl mx-auto font-light leading-relaxed"
            >
              Preserving <span className="text-slate-900 font-medium">timeless love stories</span> through advanced cinematic protocols and emotional narrative engineering.
            </motion.p>
          </div>

          {/* Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12 mb-32">
            {weddingHighlights.map((video, idx) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelectedVideo(video)}
                className="group relative cursor-pointer"
              >
                <div className="relative aspect-[16/10] rounded-[60px] overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-xl group-hover:border-rose-300 transition-all duration-700">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title} 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90" />
                  
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-50 group-hover:scale-100">
                    <div className="w-24 h-24 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-2xl">
                      <Play className="w-10 h-10 fill-current ml-2" />
                    </div>
                  </div>

                  <div className="absolute bottom-12 left-12 right-12">
                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-300 mb-4">{video.category}</div>
                    <h3 className="text-4xl font-bold tracking-tight mb-4 text-white">{video.title}</h3>
                    <div className="text-slate-300 text-sm font-light tracking-widest">{video.duration} Runtime</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA Banner */}
          <div className="p-16 rounded-[60px] bg-white border border-slate-200 shadow-sm relative overflow-hidden group text-center lg:text-left">
            <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/5 blur-[100px] -mr-48 -mt-48 group-hover:bg-rose-600/10 transition-colors" />
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
              <div>
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                  <Camera className="w-5 h-5 text-rose-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Preservation Protocols</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter leading-none text-slate-900">Protect The <br /> <span className="text-rose-600">Legacy.</span></h2>
                <p className="text-slate-500 text-lg font-light max-w-xl leading-relaxed">
                  Ready to deploy high-authority cinematic protocols for your union? Let's initiate the session.
                </p>
              </div>
              <button 
                onClick={() => setIsBookingModalOpen(true)}
                className="px-12 py-7 rounded-3xl bg-slate-900 text-white font-black text-xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl hover:shadow-2xl hover:bg-rose-600 flex items-center gap-4"
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
            <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
              <X className="w-10 h-10" />
            </button>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-6xl aspect-video rounded-[60px] overflow-hidden bg-black shadow-2xl border border-white/10"
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
        selectedService="Wedding Shoot" 
      />
    </main>
  );
}
