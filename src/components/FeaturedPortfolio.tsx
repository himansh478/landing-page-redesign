'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { RevealLines } from './motion/RevealLines';

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

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % videos.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);

  const current = videos[currentIndex];

  return (
    <section id="portfolio" className="py-24 sm:py-32 bg-paper border-t border-ink/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8 items-end mb-12 sm:mb-16">
          <div className="lg:col-span-7">
            <p className="slate text-editorial mb-5">Now screening</p>
            <RevealLines as="h2" className="display-lg font-display text-ink" lines={['Trending', <span key="now" className="text-editorial">Now</span>]} />
          </div>
          <p className="lg:col-span-4 lg:col-start-9 text-lg text-ink/70 leading-relaxed">
            Our most popular work that&apos;s making waves
          </p>
        </div>

        {/* main video slider */}
        <div className="relative overflow-hidden rounded-[4px] bg-ink ring-1 ring-ink/15 shadow-[0_40px_80px_-40px_rgb(var(--ink-rgb)/0.55)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, clipPath: 'inset(0 0 0 100%)' }}
              animate={{ opacity: 1, clipPath: 'inset(0 0 0 0%)' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-video overflow-hidden group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={current.thumbnail} alt={current.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent" />

              {/* play btn */}
              <button
                type="button"
                aria-label={`Play ${current.title}`}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 sm:w-20 h-14 sm:h-20 bg-ivory text-ink rounded-full flex items-center justify-center transition-[transform,background-color] duration-500 ease-reveal hover:scale-110 hover:bg-coral"
              >
                <Play className="w-6 sm:w-8 h-6 sm:h-8 ml-1 fill-current" aria-hidden="true" />
              </button>

              {/* video info overlay */}
              <div className="on-ink absolute bottom-0 left-0 right-0 p-4 sm:p-8">
                <span className="inline-block slate !text-[10px] bg-coral text-ink px-2 py-1 rounded-[3px] mb-2 sm:mb-4">
                  {current.category}
                </span>
                <h3 className="font-display text-lg sm:text-3xl lg:text-4xl font-extrabold text-ivory tracking-[-0.03em] mb-1 sm:mb-3">
                  {current.title}
                </h3>
                <p className="slate text-ivory/70 flex items-center gap-2 tabular">
                  <Play className="w-3 h-3 fill-current" aria-hidden="true" />
                  {current.views} views
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* prev/next arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 sm:w-12 h-10 sm:h-12 rounded-full border border-ivory/30 bg-ink/50 text-ivory flex items-center justify-center transition-colors hover:bg-ivory hover:text-ink z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 sm:w-12 h-10 sm:h-12 rounded-full border border-ivory/30 bg-ink/50 text-ivory flex items-center justify-center transition-colors hover:bg-ivory hover:text-ink z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* dot indicators */}
        <div className="flex justify-center gap-2 mt-6 sm:mt-8">
          {videos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-500 ease-reveal ${
                index === currentIndex ? 'bg-coral w-10' : 'bg-ink/20 hover:bg-ink/40 w-4'
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : undefined}
            />
          ))}
        </div>

        {/* thumbnail strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-10">
          {videos.map((video, index) => (
            <button
              key={video.id}
              onClick={() => setCurrentIndex(index)}
              className={`group relative aspect-video rounded-[4px] overflow-hidden transition-shadow duration-300 ${
                index === currentIndex ? 'ring-2 ring-coral ring-offset-4 ring-offset-paper' : 'ring-1 ring-ink/10'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover transition-transform duration-1000 ease-reveal group-hover:scale-[1.04]" />
              <span aria-hidden="true" className={`absolute inset-0 bg-ink/40 transition-opacity group-hover:opacity-50 ${index === currentIndex ? 'opacity-0' : ''}`} />
              <span aria-hidden="true" className="absolute top-2 left-2 inline-flex bg-ink/80 text-ivory slate !text-[10px] !tracking-[0.14em] px-2 py-1 rounded-[3px]">
                C{String(index + 1).padStart(3, '0')}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
