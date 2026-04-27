import { motion } from 'motion/react';
import { ArrowLeft, Play } from 'lucide-react';
import { Link } from 'react-router';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { ServiceBookingForm } from '../components/ServiceBookingForm';
import { DocumentaryVideo } from './documentaryTypes.ts';

const documentaryVideos: DocumentaryVideo[] = [
  {
    id: 1,
    title: 'sample1 ',
    thumbnail: '/images/documentry%20image.png',
    videoUrl: 'https://www.youtube.com/embed/OtP2gr4hZGQ?si=YBidET9TA93RUbzS',
    category: 'Lifestyle',
    duration: '18:45',
    description: 'A compelling documentary capturing real human stories with cinematic pacing and professional grade editing.',
    type: 'documentary'
  },
  {
    id: 2,
    title: 'sample 2',
    thumbnail: '/images/documentry%20image.png',
    videoUrl: 'https://www.youtube.com/embed/aUOf2anD2n8?si=QvY1pvoo5XgVd1vt',
    category: 'Environment',
    duration: '22:30',
    description: 'Powerful environmental documentary with stunning visuals and impactful storytelling.',
    type: 'documentary'
  },
  {
    id: 3,
    title: 'sample 3',
    thumbnail: '/images/documentry%20image.png',
    videoUrl: 'https://www.youtube.com/embed/vh9rBp_4eHU?si=pMQ0Cbwyt4tKUVdY',
    category: 'Culture',
    duration: '25:15',
    description: 'Documentary exploring rich cultural heritage with professional color grading and motion graphics.',
    type: 'documentary'
  },
  {
    id: 4,
    title: 'sample 4',
    thumbnail: '/images/documentry%20image.png',
    videoUrl: 'https://www.youtube.com/embed/WtUET9U7Xm4?si=G8iTNg1hq7fJzN-Y',
    category: 'Technology',
    duration: '19:20',
    description: 'Exploring innovation and entrepreneurship with dynamic editing and B-roll integration.',
    type: 'documentary'
  },
];

const documentaryShorts: DocumentaryVideo[] = [
  {
    id: 5,
    title: 'Sample 1',
    thumbnail: '/images/documentry%20image.png',
    videoUrl: 'https://www.youtube.com/embed/lcUJ8kQ7vfs',
    category: 'Social',
    duration: '21:50',
    description: 'Inspiring documentary about community-driven social change with professional production quality.',
    type: 'short'
  },
  {
    id: 6,
    title: 'Sample 2',
    thumbnail: '/images/documentry%20image.png',
    videoUrl: 'https://www.youtube.com/embed/C54oK8D9cDg',
    category: 'Nature',
    duration: '24:10',
    description: 'Stunning wildlife documentary with cinematic cinematography and professional editing.',
    type: 'short'
  },
  {
    id: 7,
    title: 'sample 3',
    thumbnail: '/images/documentry%20image.png',
    videoUrl: 'https://www.youtube.com/embed/_CJGH66GtSA',
    category: 'Nature',
    duration: '15:30',
    description: 'Mind-blowing ocean documentary with incredible underwater footage.',
    type: 'short'
  },
  {
    id: 8,
    title: 'sample 4',
    thumbnail: '/images/documentry%20image.png',
    videoUrl: 'https://www.youtube.com/embed/W_KwVAAGts8',
    category: 'Lifestyle',
    duration: '18:20',
    description: 'Urban documentary capturing city life and human connections.',
    type: 'short'
  },
];

export function DocumentaryPortfolioPage() {
  const [selectedVideo, setSelectedVideo] = useState<DocumentaryVideo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const handleVideoClick = (video: DocumentaryVideo) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const handleBooking = () => {
    setIsBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* sticky nav */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            to="/masterful-editing"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
            Back to Editing Services
          </Link>
        </div>
      </div>

      {/* hero */}
      <section className="py-20 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.05)_0%,transparent_50%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-8 tracking-tight">
              Documentary <span className="text-gradient">Portfolio</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto font-light leading-relaxed">
              Professional documentary productions with compelling narratives, expert pacing, and cinematic quality.
            </p>
          </motion.div>
        </div>
      </section>

      {/* long form videos */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Documentary <span className="text-blue-600">Films</span></h2>
            <div className="h-1 flex-grow mx-8 bg-slate-100 rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {documentaryVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => handleVideoClick(video)}
                className="group relative bg-white rounded-[40px] overflow-hidden border border-slate-100 hover:border-blue-200 transition-all cursor-pointer shadow-2xl shadow-slate-200/50 hover:shadow-blue-500/10"
              >
                
                <div className="relative w-full aspect-video bg-slate-100 p-2">
                  <div className="w-full h-full overflow-hidden rounded-[32px]">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[32px] m-2" />

                  
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-50 group-hover:scale-100">
                    <div className="w-20 h-20 bg-white text-blue-600 rounded-full flex items-center justify-center shadow-2xl">
                      <Play className="w-8 h-8 fill-blue-600" />
                    </div>
                  </div>

                  
                  <div className="absolute bottom-5 right-5 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-slate-900 text-sm font-black shadow-lg">
                    {video.duration}
                  </div>
                </div>

                
                <div className="p-8">
                  <h3 className="text-2xl font-black text-slate-900 mb-6 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                    {video.title}
                  </h3>

                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-slate-200 group-hover:bg-blue-600"
                  >
                    Watch Now
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* shorts */}
      <section className="py-20 border-t border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Documentary <span className="text-cyan-600">Shorts</span></h2>
            <div className="h-1 flex-grow mx-8 bg-slate-200 rounded-full" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {documentaryShorts.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => handleVideoClick(video)}
                className="group relative bg-white rounded-3xl overflow-hidden border border-slate-100 hover:border-cyan-200 transition-all cursor-pointer shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-cyan-500/10"
              >
                
                <div className="relative w-full aspect-[9/16] bg-slate-100 p-1">
                  <div className="w-full h-full overflow-hidden rounded-[22px]">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[22px] m-1" />

                  
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-50 group-hover:scale-100">
                    <div className="w-16 h-16 bg-white text-cyan-600 rounded-full flex items-center justify-center shadow-2xl">
                      <Play className="w-7 h-7 fill-cyan-600" />
                    </div>
                  </div>
                </div>

                
                <div className="p-4">
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-cyan-600 transition-colors line-clamp-2 uppercase tracking-tight leading-tight">
                    {video.title}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* bottom cta */}
      <section className="py-32 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.2)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight">
              Ready to Tell Your <span className="text-blue-400">Story?</span>
            </h2>
            <p className="text-xl text-slate-400 mb-12 font-light leading-relaxed">
              Professional editing that brings your documentary vision to life with cinematic quality.
            </p>
            <motion.button
              onClick={handleBooking}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 text-white px-12 py-5 rounded-2xl text-xl font-black shadow-2xl shadow-blue-500/40 transition-all hover:bg-blue-500 active:scale-95 uppercase tracking-widest text-sm"
            >
              Get Started
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* video player */}
      {selectedVideo && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className={`bg-white border border-slate-200 text-slate-900 p-2 overflow-hidden rounded-[40px] shadow-2xl ${selectedVideo.type === 'documentary' ? 'max-w-5xl aspect-video' : 'max-w-sm aspect-[9/16]'}`}>
            <DialogHeader className="sr-only">
              <DialogTitle>{selectedVideo.title}</DialogTitle>
            </DialogHeader>

            <div className={`w-full h-full rounded-[32px] overflow-hidden bg-slate-100 ${selectedVideo.type === 'documentary' ? 'aspect-video' : 'aspect-[9/16]'}`}>
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
        selectedService="Documentary Edit"
      />
    </div>
  );
}
