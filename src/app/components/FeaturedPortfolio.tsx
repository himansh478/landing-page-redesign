import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface VideoItem {
  id: number;
  title: string;
  category: string;
  thumbnail: string;
  views: string;
}

const videos: VideoItem[] = [
  {
    id: 1,
    title: 'Cinematic Brand Film - Tech Startup Launch',
    category: 'Commercial',
    thumbnail: 'https://images.unsplash.com/photo-1628571201562-cf216865f739?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB2aWRlbyUyMHByb2R1Y3Rpb24lMjBzdHVkaW98ZW58MXx8fHwxNzcwNjM4MjQzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    views: '1.2M'
  },
  {
    id: 2,
    title: 'Product Photography - Luxury Watch Collection',
    category: 'Photography',
    thumbnail: 'https://images.unsplash.com/photo-1516542076529-1ea3854896f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMGFnZW5jeSUyMG9mZmljZSUyMHdvcmtzcGFjZXxlbnwxfHx8fDE3NzA1NjIyMDV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    views: '850K'
  },
  {
    id: 3,
    title: 'Social Media Campaign - Viral Reels Series',
    category: 'Social Media',
    thumbnail: 'https://images.unsplash.com/photo-1752859951149-7d3fc700a7ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwc3RhcnR1cCUyMG9mZmljZSUyMG1vZGVybnxlbnwxfHx8fDE3NzA2MDM1MjR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    views: '2.4M'
  }
];

export function FeaturedPortfolio() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  return (
    <section id="portfolio" className="py-12 sm:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            Trending <span className="text-gradient">Now</span>
          </h2>
          <p className="text-xl text-slate-500 font-light">
            Our most popular work that's making waves
          </p>
        </motion.div>

        {/* Video Slider */}
        <div className="relative overflow-hidden rounded-2xl shadow-2xl shadow-indigo-500/10 border border-slate-200">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="relative aspect-video bg-slate-200 rounded-2xl overflow-hidden group"
            >
              <img
                src={videos[currentIndex].thumbnail}
                alt={videos[currentIndex].title}
                className="w-full h-full object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

              {/* Play button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 sm:w-20 h-14 sm:h-20 bg-indigo-600 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-500/50 hover:bg-indigo-700 transition-colors"
              >
                <Play className="w-6 sm:w-8 h-6 sm:h-8 text-white ml-1" fill="white" />
              </motion.button>

              {/* Video Info */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
                <span className="inline-block px-4 py-1.5 bg-indigo-600 text-white text-xs sm:text-sm font-bold rounded-full mb-2 sm:mb-4 shadow-lg shadow-indigo-500/40">
                  {videos[currentIndex].category}
                </span>
                <h3 className="text-lg sm:text-3xl lg:text-4xl font-black text-white mb-1 sm:mb-3 drop-shadow-md">
                  {videos[currentIndex].title}
                </h3>
                <p className="text-slate-200 flex items-center gap-2 text-sm sm:text-lg font-light drop-shadow-sm">
                  <Play className="w-4 h-4 fill-white" />
                  {videos[currentIndex].views} views
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 w-10 sm:w-14 h-10 sm:h-14 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all border border-white/30 z-10 shadow-lg"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 w-10 sm:w-14 h-10 sm:h-14 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all border border-white/30 z-10 shadow-lg"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-6 sm:mt-10">
          {videos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                  ? 'bg-indigo-600 w-10'
                  : 'bg-slate-300 hover:bg-slate-400 w-3'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Thumbnail Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
          {videos.map((video, index) => (
            <motion.button
              key={video.id}
              onClick={() => setCurrentIndex(index)}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className={`relative aspect-video rounded-xl overflow-hidden transition-all duration-300 ${index === currentIndex
                  ? 'ring-4 ring-indigo-500 ring-offset-4 ring-offset-slate-50 shadow-xl'
                  : 'shadow-md border border-slate-200'
                }`}
            >
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-slate-900/40 hover:bg-slate-900/20 transition-colors ${index === currentIndex ? 'opacity-0' : ''}`} />
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
