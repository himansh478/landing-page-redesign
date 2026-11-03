'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Play, Info } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { chipClass, btnGhostOnInk } from './editorial/styles';

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
        <DialogContent className="max-w-5xl w-[calc(100%-2rem)] p-0 gap-0 overflow-hidden rounded-md">
          <div className="h-1 bg-coral" aria-hidden="true" />
          <div className="p-6 sm:p-8 max-h-[85vh] overflow-y-auto">
            <DialogHeader className="mb-8 text-left pr-10">
              <p className="slate text-editorial mb-2">Cwaya · Samples</p>
              <DialogTitle className="font-display text-3xl sm:text-4xl font-extrabold text-ink tracking-[-0.03em] leading-[1.05]">
                {shootType} <span className="text-editorial">Samples</span>
              </DialogTitle>
              <DialogDescription className="text-ink/65 text-base sm:text-lg pt-1">
                Explore our portfolio of high-end {shootType.toLowerCase()} productions.
              </DialogDescription>
            </DialogHeader>

            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8 border-t border-ink/15 pt-8">
              {samples.map((sample) => (
                <li key={sample.id}>
                  <button type="button" className="group block w-full text-left" onClick={() => setSelectedVideo(sample)}>
                    <span
                      className="relative block bg-ink rounded-[4px] ring-1 ring-ink/10 overflow-hidden"
                      style={{ aspectRatio: sample.aspectRatio === '16:9' ? '16 / 9' : '9 / 16' }}
                    >
                      <iframe
                        src={sample.videoUrl}
                        title={sample.title}
                        tabIndex={-1}
                        className="w-full h-full pointer-events-none opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                        frameBorder="0"
                      />
                      <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center bg-ink/30 group-hover:bg-transparent transition-colors">
                        <span className="w-14 h-14 rounded-full bg-ivory text-ink flex items-center justify-center transition-[transform,background-color] duration-500 ease-reveal group-hover:scale-110 group-hover:bg-coral">
                          <Play className="w-6 h-6 ml-0.5 fill-current" />
                        </span>
                      </span>
                    </span>
                    <span className="block pt-4">
                      <span className="block font-display font-bold text-ink tracking-[-0.01em] group-hover:text-editorial transition-colors">{sample.title}</span>
                      <span className="flex items-center gap-3 mt-2 slate text-ink/55">
                        {sample.aspectRatio === '16:9' ? 'Landscape' : 'Vertical'}
                        {sample.duration && <span className="tabular text-ink/45">· {sample.duration}</span>}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            {samples.length === 0 && (
              <div className="py-16 text-center border-y border-ink/15">
                <Info className="w-8 h-8 text-ink/30 mx-auto mb-4" aria-hidden="true" />
                <h3 className="font-display text-xl font-bold text-ink">Coming Soon</h3>
                <p className="text-ink/60">We&apos;re updating our samples for this category.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Full Preview Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
            <DialogContent className="on-ink max-w-4xl w-[calc(100%-2rem)] bg-ink border-ivory/10 text-ivory p-0 gap-0 overflow-hidden rounded-md z-[100] [&>button:last-child]:text-ivory/60 [&>button:last-child]:hover:text-ivory [&>button:last-child]:hover:bg-ivory/10">
              <div className="flex flex-col max-h-[92vh] overflow-y-auto">
                <div className="flex items-center gap-3 p-5 sm:p-6 pr-16 border-b border-ivory/10">
                  <span className={chipClass}>
                    <span className="rec-dot w-1.5 h-1.5 rounded-full bg-coral" aria-hidden="true" /> Preview
                  </span>
                  <DialogTitle className="font-display text-lg sm:text-2xl font-bold text-ivory tracking-[-0.02em] truncate">{selectedVideo.title}</DialogTitle>
                </div>

                <div className="bg-[#0E1923] flex items-center justify-center p-4 md:p-8">
                  <div
                    className="relative w-full rounded-[4px] overflow-hidden bg-black ring-1 ring-ivory/10"
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

                <div className="p-5 sm:p-6 border-t border-ivory/10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <dl className="flex gap-8">
                    <div>
                      <dt className="slate text-ivory/50 mb-1">Format</dt>
                      <dd className="font-semibold text-ivory">{selectedVideo.aspectRatio === '16:9' ? 'Landscape (16:9)' : 'Vertical (9:16)'}</dd>
                    </div>
                    {selectedVideo.duration && (
                      <div>
                        <dt className="slate text-ivory/50 mb-1">Duration</dt>
                        <dd className="font-semibold text-ivory tabular">{selectedVideo.duration}</dd>
                      </div>
                    )}
                  </dl>
                  <button type="button" onClick={() => setSelectedVideo(null)} className={`${btnGhostOnInk} w-full md:w-auto`}>
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
