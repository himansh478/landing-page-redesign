'use client';

import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Play, X, Zap, Film, Camera, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ServiceBookingForm } from '@/components/ServiceBookingForm';
import Link from 'next/link';

const documentaryVideos = [
  {
    id: 1,
    title: 'Neural Reality Alpha',
    thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=1000',
    videoUrl: 'https://www.youtube.com/embed/OtP2gr4hZGQ?si=YBidET9TA93RUbzS',
    category: 'Lifestyle',
    duration: '18:45',
    type: 'documentary'
  },
  {
    id: 2,
    title: 'Ecological Protocol Beta',
    thumbnail: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1000',
    videoUrl: 'https://www.youtube.com/embed/aUOf2anD2n8?si=QvY1pvoo5XgVd1vt',
    category: 'Environment',
    duration: '22:30',
    type: 'documentary'
  },
  {
    id: 3,
    title: 'Cultural Synthesis Gamma',
    thumbnail: 'https://images.unsplash.com/photo-1465495910483-0d554a008b83?auto=format&fit=crop&q=80&w=1000',
    videoUrl: 'https://www.youtube.com/embed/vh9rBp_4eHU?si=pMQ0Cbwyt4tKUVdY',
    category: 'Culture',
    duration: '25:15',
    type: 'documentary'
  }
];

const documentaryShorts = [
  {
    id: 4,
    title: 'Social Impact Delta',
    thumbnail: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=1000',
    videoUrl: 'https://www.youtube.com/embed/lcUJ8kQ7vfs',
    type: 'short'
  },
  {
    id: 5,
    title: 'Natural Logic Epsilon',
    thumbnail: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=1000',
    videoUrl: 'https://www.youtube.com/embed/C54oK8D9cDg',
    type: 'short'
  }
];

export default function DocumentaryPortfolioPage() {
  const router = useRouter();
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-500/30">
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-cyan-600/5 blur-[150px] rounded-full" />
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
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-10"
            >
              <Film className="w-3 h-3" />
              Documentary Narrative Core
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl lg:text-9xl font-bold mb-10 tracking-tighter leading-none"
            >
              Documentary <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-blue-600 to-blue-500">Portfolio.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-2xl text-slate-500 max-w-3xl mx-auto font-light leading-relaxed"
            >
              Engineering <span className="text-slate-900 font-medium">high-authority narratives</span> through immersive pacing protocols and cinematic storytelling architecture.
            </motion.p>
          </div>

          {/* Documentary Films Section */}
          <div className="mb-40">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <Film className="w-6 h-6 text-blue-500" />
                <h2 className="text-3xl font-bold tracking-tight uppercase tracking-[0.2em]">Cinematic Films</h2>
              </div>
              <div className="h-px flex-grow mx-8 bg-white/10" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {documentaryVideos.map((video, idx) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setSelectedVideo(video)}
                  className="group relative cursor-pointer"
                >
                  <div className="relative aspect-video rounded-[48px] overflow-hidden bg-white border border-slate-200 shadow-sm group-hover:border-blue-300 transition-all duration-700">
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

                    <div className="absolute bottom-10 left-10 right-10 flex items-center justify-between">
                      <h3 className="text-2xl font-bold tracking-tight group-hover:text-blue-400 transition-colors">{video.title}</h3>
                      <span className="text-[10px] font-black tracking-widest text-slate-500 px-3 py-1 rounded-full border border-white/5 bg-black/50">{video.duration}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Documentary Shorts Section */}
          <div className="mb-40">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <Zap className="w-6 h-6 text-cyan-500" />
                <h2 className="text-3xl font-bold tracking-tight uppercase tracking-[0.2em]">Vertical Insights</h2>
              </div>
              <div className="h-px flex-grow mx-8 bg-white/10" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {documentaryShorts.map((video, idx) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setSelectedVideo(video)}
                  className="group relative cursor-pointer"
                >
                  <div className="relative aspect-[9/16] rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm group-hover:border-cyan-300 transition-all duration-700">
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
                      <h3 className="text-sm font-bold tracking-tight group-hover:text-cyan-400 transition-colors leading-tight uppercase tracking-widest">{video.title}</h3>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA Banner */}
          <div className="p-16 rounded-[60px] bg-white border border-slate-200 shadow-sm relative overflow-hidden group text-center lg:text-left">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[100px] -mr-48 -mt-48 group-hover:bg-blue-600/20 transition-colors" />
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
              <div>
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                  <Camera className="w-5 h-5 text-blue-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Archive Node</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter leading-none">Tell Your <br /> <span className="text-blue-500">Truth.</span></h2>
                <p className="text-slate-500 text-lg font-light max-w-xl leading-relaxed">
                  Ready to deploy high-authority documentary protocols for your vision? Let's initiate the session.
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
              className={`relative w-full shadow-2xl border border-white/10 rounded-[60px] overflow-hidden bg-black ${selectedVideo.type === 'documentary' ? 'max-w-6xl aspect-video' : 'max-w-sm aspect-[9/16]'}`}
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
        selectedService="Documentary Edit" 
      />
</main>
  );
}
