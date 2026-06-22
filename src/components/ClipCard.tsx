'use client';

import { useState } from 'react';
import { Download, Lock, Play, Clock, Tag, Star } from 'lucide-react';
import { UnlockModal } from './UnlockModal';

interface Clip {
  id: string;
  title: string;
  category: string;
  description?: string;
  thumbnail_url: string;
  free_drive_url?: string;
  paid_drive_url?: string;
  duration?: string;
  tags?: string;
  is_free: boolean;
  download_count?: number;
}

interface ClipCardProps {
  clip: Clip;
}

const categoryColors: Record<string, string> = {
  Wedding: 'bg-pink-100 text-pink-700',
  Cinematic: 'bg-indigo-100 text-indigo-700',
  Commercial: 'bg-amber-100 text-amber-700',
  Corporate: 'bg-blue-100 text-blue-700',
  Drone: 'bg-sky-100 text-sky-700',
  Reel: 'bg-purple-100 text-purple-700',
  Default: 'bg-slate-100 text-slate-700',
};

export function ClipCard({ clip }: ClipCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const categoryColor = categoryColors[clip.category] || categoryColors.Default;

  const handleDownload = () => {
    if (clip.is_free && clip.free_drive_url) {
      window.open(clip.free_drive_url, '_blank');
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <div
        className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-indigo-100 hover:-translate-y-1"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-slate-900">
          {clip.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={clip.thumbnail_url}
              alt={clip.title}
              className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center">
              <Play className="w-12 h-12 text-white/30" />
            </div>
          )}

          {/* Overlay on hover */}
          <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 border border-white/30">
              <Play className="w-8 h-8 text-white fill-white" />
            </div>
          </div>

          {/* Duration badge */}
          {clip.duration && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {clip.duration}
            </div>
          )}

          {/* FREE / PAID badge */}
          <div className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 ${clip.is_free ? 'bg-green-500 text-white' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'}`}>
            {clip.is_free ? (
              <>✨ FREE</>
            ) : (
              <><Lock className="w-3 h-3" /> ₹19</>
            )}
          </div>

          {/* Quality badge */}
          <div className="absolute top-2 right-2 bg-amber-400 text-amber-900 text-xs font-black px-2 py-1 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-900" />
            4K RAW
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-2 ${categoryColor}`}>
            {clip.category}
          </span>

          {/* Title */}
          <h3 className="font-bold text-slate-800 text-base leading-snug mb-1 line-clamp-2">
            {clip.title}
          </h3>

          {/* Description */}
          {clip.description && (
            <p className="text-slate-500 text-xs line-clamp-2 mb-3">{clip.description}</p>
          )}

          {/* Tags */}
          {clip.tags && (
            <div className="flex flex-wrap gap-1 mb-3">
              {clip.tags.split(',').slice(0, 3).map((tag, i) => (
                <span key={i} className="flex items-center gap-0.5 text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                  <Tag className="w-2.5 h-2.5" />
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Download count */}
          {clip.download_count !== undefined && clip.download_count > 0 && (
            <p className="text-xs text-slate-400 mb-3">
              📥 {clip.download_count} downloads
            </p>
          )}

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
              clip.is_free
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:opacity-90 shadow-md hover:shadow-green-200'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 shadow-md hover:shadow-indigo-200'
            }`}
          >
            {clip.is_free ? (
              <>
                <Download className="w-4 h-4" />
                Free Download
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Unlock @ ₹19
              </>
            )}
          </button>
        </div>
      </div>

      {showModal && <UnlockModal onClose={() => setShowModal(false)} />}
    </>
  );
}
