'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { X, Play, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Sample {
  id: number;
  title: string;
  videoUrl: string;
  aspectRatio: '16:9' | '9:16';
  duration?: string;
}

interface ViewSamplesModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  shootType: string;
}

const sampleVideosMap: Record<string, Sample[]> = {
  'Wedding Shoot': [
    { id: 1, title: 'Wedding Highlights - Cinematic', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', aspectRatio: '16:9', duration: '4:30' },
    { id: 2, title: 'Wedding Reel - ImageIcon Style', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', aspectRatio: '9:16', duration: '1:00' },
    { id: 3, title: 'Wedding Ceremony - Full Edit', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', aspectRatio: '16:9', duration: '15:00' },
  ],
  'Insta & YouTube Video Shoot': [
    { id: 1, title: 'YouTube Video Sample', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', aspectRatio: '16:9', duration: '8:30' },
    { id: 2, title: 'ImageIcon Reel Sample', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', aspectRatio: '9:16', duration: '0:30' },
    { id: 3, title: 'ImageIcon Reel - Trending', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', aspectRatio: '9:16', duration: '0:45' },
  ],
  'Commercial Shoot': [
    { id: 1, title: 'Commercial Ad - Product Shot', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', aspectRatio: '16:9', duration: '1:00' },
    { id: 2, title: 'Commercial Vertical Ad', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', aspectRatio: '9:16', duration: '0:30' },
    { id: 3, title: 'Brand Video - Cinematic', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', aspectRatio: '16:9', duration: '3:45' },
  ],
};

export function ViewSamplesModal({ isOpen, onOpenChange, shootType }: ViewSamplesModalProps) {
  const [selectedVideo, setSelectedVideo] = useState<Sample | null>(null);
  const samples = sampleVideosMap[shootType] || [];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl bg-zinc-950 border border-white/10 p-0 overflow-hidden rounded-[32px] shadow-2xl">
          <div className="p-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
            <DialogHeader className="mb-10 text-center">
              <DialogTitle className="text-4xl font-bold text-white mb-2">
                {shootType} <span className="text-purple-500">Samples</span>
              </DialogTitle>
              <DialogDescription className="text-zinc-400 text-lg">
                Explore our portfolio of high-end {shootType.toLowerCase()} productions.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {samples.map((sample) => (
                <motion.div
                  key={sample.id}
                  whileHover={{ y: -5 }}
                  className="group relative bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden hover:border-purple-500/50 transition-all cursor-pointer"
                  onClick={() => setSelectedVideo(sample)}
                >
                  <div 
                    className="relative bg-zinc-800 flex items-center justify-center overflow-hidden"
                    style={{ aspectRatio: sample.aspectRatio === '16:9' ? '16 / 9' : '9 / 16' }}
                  >
                    <iframe
                      src={sample.videoUrl}
                      title={sample.title}
                      className="w-full h-full pointer-events-none opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                      frameBorder="0"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-transparent transition-all">
                      <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center scale-75 group-hover:scale-100 transition-transform shadow-2xl shadow-purple-500/50">
                        <Play className="w-8 h-8 ml-1 fill-current" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-white font-bold mb-3 group-hover:text-purple-400 transition-colors">{sample.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-500 bg-white/5 px-3 py-1 rounded-full uppercase tracking-tighter">
                        {sample.aspectRatio === '16:9' ? 'Landscape' : 'Vertical'}
                      </span>
                      {sample.duration && (
                        <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full uppercase tracking-tighter">
                          {sample.duration}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {samples.length === 0 && (
              <div className="py-20 text-center bg-white/5 rounded-[32px] border border-dashed border-white/10">
                <Info className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-zinc-500">Coming Soon</h3>
                <p className="text-zinc-600">We're updating our samples for this category.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Full Preview Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
            <DialogContent className="max-w-4xl bg-black border border-white/10 p-0 overflow-hidden rounded-[32px] shadow-2xl z-[100]">
              <div className="flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                  <h3 className="text-2xl font-bold text-white tracking-tight">{selectedVideo.title}</h3>
                  <button 
                    onClick={() => setSelectedVideo(null)}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="bg-zinc-950 flex items-center justify-center p-4 md:p-8">
                  <div
                    className="relative w-full shadow-2xl rounded-2xl overflow-hidden bg-black"
                    style={{
                      aspectRatio: selectedVideo.aspectRatio === '16:9' ? '16 / 9' : '9 / 16',
                      maxWidth: selectedVideo.aspectRatio === '16:9' ? '100%' : '400px',
                    }}
                  >
                    <iframe
                      src={`${selectedVideo.videoUrl}?autoplay=1`}
                      title={selectedVideo.title}
                      className="absolute inset-0 w-full h-full"
                      allowFullScreen
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                </div>

                <div className="p-8 bg-zinc-900/50 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex gap-4">
                    <div className="bg-white/5 px-6 py-2 rounded-2xl border border-white/10">
                      <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest mb-1">Format</p>
                      <p className="text-white font-bold">{selectedVideo.aspectRatio === '16:9' ? 'Landscape (16:9)' : 'Vertical (9:16)'}</p>
                    </div>
                    {selectedVideo.duration && (
                      <div className="bg-white/5 px-6 py-2 rounded-2xl border border-white/10">
                        <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest mb-1">Duration</p>
                        <p className="text-white font-bold">{selectedVideo.duration}</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedVideo(null)}
                    className="w-full md:w-auto px-10 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-purple-500/20"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
}
