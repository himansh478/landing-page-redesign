'use client';

import { motion } from 'motion/react';
import { ArrowLeft, Play, Eye, Share2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ServiceBookingForm } from '@/components/ServiceBookingForm';
import { ViewSamplesModal } from '@/components/ViewSamplesModal';
import { socialVideoHighlights } from '@/data/socialVideoHighlights';

export default function SocialVideoPortfolioPage() {
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isSamplesModalOpen, setIsSamplesModalOpen] = useState(false);

  const handleVideoClick = (video: any) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />
      
      <main className="pt-32">
        {/* back button */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-12">
            <Link 
                href="/professional-shoots"
                className="inline-flex items-center gap-3 text-slate-400 hover:text-pink-600 transition-all font-black uppercase tracking-widest text-[10px] group"
            >
                <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-2 transition-transform" />
                Back to Professional Shoots
            </Link>
        </div>

        {/* hero */}
        <section className="pb-24 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pink-50/50 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
            
            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-pink-50 text-pink-600 mb-10 border border-pink-100">
                        <Share2 className="w-3 h-3" />
                        <span className="text-[10px] font-black tracking-[0.2em] uppercase">High-Engagement Social Content</span>
                    </div>
                    <h1 className="text-6xl md:text-9xl font-black text-slate-900 mb-8 tracking-tighter uppercase italic leading-none">
                        Social <span className="text-pink-600">Portfolio</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto font-medium uppercase tracking-widest leading-tight">
                        ImageIcon Reels and YouTube Shorts designed for maximum viral potential and engagement.
                    </p>
                </motion.div>
            </div>
        </section>

        {/* highlights grid */}
        <section className="py-24 bg-slate-50/50">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                    <div>
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                            Social <span className="text-pink-600">Highlights</span>
                        </h2>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-4">
                            Content that stops the scroll
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                    {socialVideoHighlights.map((video, index) => (
                        <motion.div
                            key={video.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => handleVideoClick(video)}
                            className="group relative bg-white rounded-[40px] overflow-hidden border border-slate-100 hover:border-pink-200 transition-all cursor-pointer hover:shadow-[0_40px_80px_-20px_rgba(219,39,119,0.1)] p-2"
                        >
                            <div className="relative aspect-[9/16] rounded-[32px] overflow-hidden bg-slate-100">
                                <img 
                                    src={video.thumbnail} 
                                    alt={video.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl">
                                        <Play className="w-6 h-6 text-pink-600 fill-pink-600 ml-1" />
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-tight group-hover:text-pink-600 transition-colors">
                                    {video.title}
                                </h3>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>

        {/* bottom cta */}
        <section className="py-40 bg-slate-900 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(219,39,119,0.15)_0%,transparent_70%)] pointer-events-none" />
            <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-6xl md:text-9xl font-black text-white mb-12 tracking-tighter uppercase italic leading-[0.9]">
                        Go <span className="text-pink-500">Viral</span>
                    </h2>
                    <p className="text-xl md:text-2xl text-slate-400 mb-20 font-medium uppercase tracking-widest leading-tight max-w-3xl mx-auto">
                        We specialize in creating unique visual content tailored to your specific requirements.
                    </p>
                    <div className="flex flex-wrap gap-8 justify-center">
                        <motion.button
                            onClick={() => setIsSamplesModalOpen(true)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white/5 backdrop-blur-xl border border-white/10 text-white px-12 py-6 rounded-[32px] text-lg font-black transition-all flex items-center gap-4 hover:bg-white/10 uppercase tracking-widest"
                        >
                            <Eye className="w-5 h-5" />
                            View Samples
                        </motion.button>
                        <motion.button
                            onClick={() => setIsBookingModalOpen(true)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-pink-600 text-white px-12 py-6 rounded-[32px] text-lg font-black shadow-2xl shadow-pink-500/20 transition-all hover:bg-pink-500 uppercase tracking-widest"
                        >
                            Get Started
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </section>
      </main>

      <Footer />

      {/* video player */}
      {selectedVideo && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="bg-white border-none text-slate-900 max-w-sm aspect-[9/16] p-2 overflow-hidden rounded-[48px] shadow-[0_64px_128px_-32px_rgba(0,0,0,0.3)]">
            <DialogHeader className="sr-only">
              <DialogTitle>{selectedVideo.title}</DialogTitle>
            </DialogHeader>
            <div className="w-full h-full aspect-[9/16] rounded-[40px] overflow-hidden bg-slate-100">
              <iframe
                width="100%"
                height="100%"
                src={selectedVideo.videoUrl}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* booking modal */}
      <ServiceBookingForm 
        isOpen={isBookingModalOpen} 
        onOpenChange={setIsBookingModalOpen}
        selectedService="Insta & YouTube Video Shoot"
      />

      {/* samples modal */}
      <ViewSamplesModal
        isOpen={isSamplesModalOpen}
        onOpenChange={setIsSamplesModalOpen}
        shootType="Insta & YouTube Video Shoot"
        samples={[]}
      />
    </div>
  );
}
