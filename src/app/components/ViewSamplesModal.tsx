import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { X } from 'lucide-react';

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
  samples: Sample[];
}

// TODO: replace placeholder URLs with actual project videos
const sampleVideosMap: Record<string, Sample[]> = {
  'Wedding Shoot': [
    { id: 1, title: 'Wedding Highlights - Cinematic', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', aspectRatio: '16:9', duration: '4:30' },
    { id: 2, title: 'Wedding Reel - Instagram Style', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', aspectRatio: '9:16', duration: '0:60' },
    { id: 3, title: 'Wedding Ceremony - Full Edit', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', aspectRatio: '16:9', duration: '15:00' },
  ],
  'Insta & YouTube Video Shoot': [
    { id: 1, title: 'YouTube Video Sample', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', aspectRatio: '16:9', duration: '8:30' },
    { id: 2, title: 'Instagram Reel Sample', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', aspectRatio: '9:16', duration: '0:30' },
    { id: 3, title: 'Instagram Reel - Trending', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', aspectRatio: '9:16', duration: '0:45' },
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
        <DialogContent className="bg-white border border-slate-200 text-slate-900 max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl">
          <DialogHeader className="p-8 pb-0">
            <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight">
              {shootType} - <span className="text-gradient">Sample Videos</span>
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-light">
              Browse our best work in both landscape (16:9) and vertical (9:16) formats
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
            {samples.map((sample) => (
              <div
                key={sample.id}
                className="group cursor-pointer bg-slate-50 border border-slate-200 rounded-xl overflow-hidden hover:border-indigo-500 transition-all hover:shadow-xl hover:-translate-y-1"
                onClick={() => setSelectedVideo(sample)}
              >
                <div
                  className="bg-slate-200 flex items-center justify-center relative overflow-hidden"
                  style={{ aspectRatio: sample.aspectRatio === '16:9' ? '16 / 9' : '9 / 16' }}
                >
                  <iframe
                    src={sample.videoUrl}
                    title={sample.title}
                    className="w-full h-full pointer-events-none"
                    frameBorder="0"
                  />
                  <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="bg-indigo-600 p-4 rounded-full shadow-2xl transform scale-75 group-hover:scale-100 transition-transform">
                      <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 leading-tight">{sample.title}</h3>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <span className="bg-slate-200 px-2 py-1 rounded">{sample.aspectRatio}</span>
                    {sample.duration && <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded">{sample.duration}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* full screen video viewer */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="bg-white border border-slate-200 text-slate-900 max-w-4xl p-0 overflow-hidden shadow-2xl">
          {selectedVideo && (
            <div className="flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{selectedVideo.title}</h3>
                <button onClick={() => setSelectedVideo(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-400 hover:text-slate-600" />
                </button>
              </div>

              <div className="bg-slate-900 flex items-center justify-center p-8">
                <div
                  className="shadow-2xl rounded-2xl overflow-hidden border border-white/10"
                  style={{
                    width: '100%',
                    aspectRatio: selectedVideo.aspectRatio === '16:9' ? '16 / 9' : '9 / 16',
                    maxWidth: selectedVideo.aspectRatio === '16:9' ? '100%' : '400px',
                  }}
                >
                  <iframe
                    src={selectedVideo.videoUrl}
                    title={selectedVideo.title}
                    className="w-full h-full"
                    allowFullScreen
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              </div>

              <div className="p-8 border-t border-slate-100 bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-slate-500 text-sm font-medium">
                      Format: <span className="text-slate-900 font-bold">{selectedVideo.aspectRatio}</span>
                    </p>
                    {selectedVideo.duration && (
                      <p className="text-slate-500 text-sm font-medium">
                        Duration: <span className="text-slate-900 font-bold">{selectedVideo.duration}</span>
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedVideo(null)}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
