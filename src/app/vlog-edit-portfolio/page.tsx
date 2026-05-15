'use client';

import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Play, X, Zap, PlayCircle, Smartphone, Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ServiceBookingForm } from '@/components/ServiceBookingForm';
import Link from 'next/link';

const youtubeVideos = [
  {
    id: 1,
    title: 'Neural Journey Alpha',
    videoUrl: 'https://www.youtube.com/embed/ycx5GzNAzRk',
    thumbnail: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&q=80&w=1000',
    type: 'youtube'
  },
  {
    id: 2,
    title: 'Cinematic Expansion Beta',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=1000',
    type: 'youtube'
  },
  {
    id: 3,
    title: 'Visual Synthesis Gamma',
    videoUrl: 'https://www.youtube.com/embed/ulTmnr_u_Ew?si=AS3-4qqjMV9A0qLr',
    thumbnail: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=1000',
    type: 'youtube'
  }
];

const reelVideos = [
  {
    id: 4,
    title: 'Synaptic Reel Delta',
    videoUrl: 'https://www.youtube.com/embed/IQogBDh_jX0',
    thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=1000',
    type: 'reel'
  },
  {
    id: 5,
    title: 'Viral Protocol Epsilon',
    videoUrl: 'https://youtube.com/embed/rpdcZPsCZHk?si=WsbtCBjsY6wkXOZt',
    thumbnail: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1000',
    type: 'reel'
  }
];

export default function VlogEditPortfolioPage() {
  const router = useRouter();
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-red-500/30">
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-600/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-orange-600/5 blur-[150px] rounded-full" />
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
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100 border border-red-200 text-red-600 text-[10px] font-black uppercase tracking-[0.3em] mb-10"
            >
              <PlayCircle className="w-3 h-3" />
              Dynamic Narrative Processing
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl lg:text-9xl font-bold mb-10 tracking-tighter leading-none"
            >
              Vlog <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-red-600 to-red-500">Portfolio.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-2xl text-slate-500 max-w-3xl mx-auto font-light leading-relaxed"
            >
              Deploying <span className="text-slate-900 font-medium">high-velocity edits</span> for modern storytellers through advanced transition protocols and rhythmic engineering.
            </motion.p>
          </div>

          {/* Long Form Section */}
          <div className="mb-40">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <PlayCircle className="w-6 h-6 text-red-500" />
                <h2 className="text-3xl font-bold tracking-tight uppercase tracking-[0.2em]">Long Form Protocols</h2>
              </div>
              <div className="h-px flex-grow mx-8 bg-white/10" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {youtubeVideos.map((video, idx) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setSelectedVideo(video)}
                  className="group relative cursor-pointer"
                >
                  <div className="relative aspect-video rounded-[48px] overflow-hidden bg-white border border-slate-200 shadow-sm group-hover:border-red-300 transition-all duration-700">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title} 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-50 group-hover:scale-100">
                      <div className="w-20 h-20 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-3xl">
                        <Play className="w-8 h-8 fill-current" />
                      </div>
                    </div>

                    <div className="absolute bottom-10 left-10 right-10">
                      <h3 className="text-2xl font-bold tracking-tight group-hover:text-red-400 transition-colors">{video.title}</h3>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Vertical Form Section */}
          <div className="mb-40">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <Smartphone className="w-6 h-6 text-orange-500" />
                <h2 className="text-3xl font-bold tracking-tight uppercase tracking-[0.2em]">Vertical Protocols</h2>
              </div>
              <div className="h-px flex-grow mx-8 bg-white/10" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {reelVideos.map((video, idx) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setSelectedVideo(video)}
                  className="group relative cursor-pointer"
                >
                  <div className="relative aspect-[9/16] rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm group-hover:border-orange-300 transition-all duration-700">
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
                      <h3 className="text-sm font-bold tracking-tight group-hover:text-orange-400 transition-colors leading-tight">{video.title}</h3>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA Banner */}
          <div className="p-16 rounded-[60px] bg-white border border-slate-200 shadow-sm relative overflow-hidden group text-center lg:text-left">
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 blur-[100px] -mr-48 -mt-48 group-hover:bg-red-600/20 transition-colors" />
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
              <div>
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                  <Camera className="w-5 h-5 text-red-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Production Ready</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter leading-none">Initiate Your <br /> <span className="text-red-500">Vlog Edit.</span></h2>
                <p className="text-slate-500 text-lg font-light max-w-xl leading-relaxed">
                  Ready to deploy high-authority editing protocols for your vlogs? Let's initiate the session.
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
              className={`relative w-full shadow-2xl border border-white/10 rounded-[60px] overflow-hidden bg-black ${selectedVideo.type === 'youtube' ? 'max-w-6xl aspect-video' : 'max-w-sm aspect-[9/16]'}`}
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
        selectedService="Vlog Edit" 
      />
</main>
  );
}
