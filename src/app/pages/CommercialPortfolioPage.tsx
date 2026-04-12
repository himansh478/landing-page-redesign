import { motion } from 'motion/react';
import { ArrowLeft, Play, Eye } from 'lucide-react';
import { Link } from 'react-router';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { ServiceBookingForm } from '../components/ServiceBookingForm';
import { ViewSamplesModal } from '../components/ViewSamplesModal';
import { commercialHighlights, PortfolioVideo } from './commercialHighlights.ts';

export function CommercialPortfolioPage() {
  const [selectedVideo, setSelectedVideo] = useState<PortfolioVideo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isSamplesModalOpen, setIsSamplesModalOpen] = useState(false);

  const handleVideoClick = (video: PortfolioVideo) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const handleBooking = () => {
    setIsBookingModalOpen(true);
  };

  const handleViewSamples = () => {
    setIsSamplesModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with back button */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            to="/professional-shoots"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-orange-600 font-bold transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
            Back to Professional Shoots
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-20 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.05)_0%,transparent_50%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-8 tracking-tight">
              Commercial <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-yellow-600">Portfolio</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto font-light leading-relaxed">
              Professional ad films and product showcases designed to elevate your brand identity.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quick Highlights Section - 9:16 Aspect Ratio */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Quick <span className="text-orange-600">Highlights</span></h2>
            <div className="h-1 flex-grow mx-8 bg-slate-100 rounded-full" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {commercialHighlights.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => handleVideoClick(video)}
                className="group relative bg-white rounded-3xl overflow-hidden border border-slate-100 hover:border-orange-200 transition-all cursor-pointer shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-orange-500/10"
              >
                {/* Thumbnail */}
                <div className="relative w-full aspect-[9/16] bg-slate-100 p-1">
                  <div className="w-full h-full overflow-hidden rounded-[22px]">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[22px] m-1" />
                  
                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-50 group-hover:scale-100">
                    <div className="w-16 h-16 bg-white text-orange-600 rounded-full flex items-center justify-center shadow-2xl">
                    <Play className="w-7 h-7 fill-orange-600 text-orange-600" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 bg-white border-t border-slate-50">
                  <h3 className="text-sm font-black text-slate-900 leading-tight group-hover:text-orange-600 transition-colors line-clamp-2 uppercase tracking-tight">
                    {video.title}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.2)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight leading-[1.1]">
              Elevate Your <span className="text-orange-400">Brand</span>
            </h2>
            <p className="text-xl text-slate-400 mb-12 font-light leading-relaxed">
              We specialize in creating unique visual content tailored to your specific requirements.
            </p>
            <div className="flex gap-6 flex-wrap justify-center">
              <motion.button
                onClick={handleViewSamples}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-5 rounded-2xl text-xl font-black transition-all flex items-center gap-3 hover:bg-white/20 shadow-2xl active:scale-95 uppercase tracking-widest text-sm"
              >
                <Eye className="w-6 h-6" />
                View Samples
              </motion.button>
              <motion.button
                onClick={handleBooking}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-orange-600 text-white px-10 py-5 rounded-2xl text-xl font-black shadow-2xl shadow-orange-500/40 transition-all hover:bg-orange-500 active:scale-95 uppercase tracking-widest text-sm"
              >
                Get Started
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Video Player Modal */}
      {selectedVideo && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="bg-white border border-slate-200 text-slate-900 max-w-sm aspect-[9/16] p-2 overflow-hidden rounded-[40px] shadow-2xl shadow-slate-200">
            <DialogHeader className="sr-only">
              <DialogTitle>{selectedVideo.title}</DialogTitle>
            </DialogHeader>
            
            <div className="w-full h-full aspect-[9/16] rounded-[32px] overflow-hidden bg-slate-100">
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

      {/* Booking Form Modal */}
      <ServiceBookingForm 
        isOpen={isBookingModalOpen} 
        onOpenChange={setIsBookingModalOpen}
        selectedService="Commercial Shoot"
      />

      {/* View Samples Modal */}
      <ViewSamplesModal
        isOpen={isSamplesModalOpen}
        onOpenChange={setIsSamplesModalOpen}
        shootType="Commercial Shoot"
        samples={[]}
      />
    </div>
  );
}
