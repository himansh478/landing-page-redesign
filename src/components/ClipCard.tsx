'use client';

import { useState, useEffect } from 'react';
import { Download, Lock, Play, Clock, Tag, Star, X, Loader2 } from 'lucide-react';
import { UnlockModal } from './UnlockModal';
import { getUnlockedVideoUrls } from '@/app/actions/clips';

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
  video_urls?: string[];
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

const getFileName = (url: string) => {
  try {
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];
    const name = lastPart.split('?')[0];
    return decodeURIComponent(name);
  } catch {
    return 'Video File';
  }
};

export function ClipCard({ clip }: ClipCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [downloadUrls, setDownloadUrls] = useState<string[]>([]);
  const [showDownloadListModal, setShowDownloadListModal] = useState(false);
  const [isLoadingUrls, setIsLoadingUrls] = useState(false);

  const categoryColor = categoryColors[clip.category] || categoryColors.Default;

  useEffect(() => {
    if (clip.is_free) {
      setIsUnlocked(true);
    } else {
      const orderId = localStorage.getItem('cwaya_order_id');
      if (orderId) {
        setIsUnlocked(true);
      }
    }
  }, [clip.is_free]);

  const handleDownload = async () => {
    if (clip.is_free) {
      const urls = clip.video_urls || (clip.free_drive_url ? clip.free_drive_url.split(',') : []);
      if (urls.length <= 1 && urls[0]) {
        window.open(urls[0], '_blank');
      } else {
        setDownloadUrls(urls);
        setShowDownloadListModal(true);
      }
    } else {
      const orderId = localStorage.getItem('cwaya_order_id');
      if (orderId) {
        setIsLoadingUrls(true);
        try {
          const res = await getUnlockedVideoUrls(clip.id, orderId);
          if (res.success && res.urls) {
            if (res.urls.length <= 1 && res.urls[0]) {
              window.open(res.urls[0], '_blank');
            } else {
              setDownloadUrls(res.urls);
              setShowDownloadListModal(true);
            }
          } else {
            alert(res.error || 'Failed to fetch download URLs.');
          }
        } catch (err) {
          alert('Failed to get download URLs.');
        } finally {
          setIsLoadingUrls(false);
        }
      } else {
        setShowModal(true);
      }
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
            disabled={isLoadingUrls}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
              clip.is_free
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:opacity-90 shadow-md hover:shadow-green-200'
                : isUnlocked
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:opacity-90 shadow-md hover:shadow-green-200'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 shadow-md hover:shadow-indigo-200'
            }`}
          >
            {isLoadingUrls ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Fetching links...
              </>
            ) : clip.is_free ? (
              <>
                <Download className="w-4 h-4" />
                Free Download
              </>
            ) : isUnlocked ? (
              <>
                <Download className="w-4 h-4" />
                Download Clip
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

      {showDownloadListModal && (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative space-y-4">
            <button 
              onClick={() => setShowDownloadListModal(false)}
              className="absolute top-4 right-4 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-all"
            >
              <X className="w-4 h-4" />
            </button>
            
            <h3 className="text-xl font-black text-white pr-6">Download Files</h3>
            <p className="text-slate-400 text-xs mt-1">
              Yeh clip {downloadUrls.length} alag-alag videos se bani hai. Aap niche se har video ko ek-ek karke download kar sakte hain:
            </p>
            
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {downloadUrls.map((url, index) => {
                const fileName = getFileName(url);
                return (
                  <div key={index} className="flex items-center justify-between p-3.5 bg-slate-950/50 border border-slate-800 rounded-2xl hover:border-indigo-500/30 transition-all group">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-sm font-bold text-slate-200 truncate group-hover:text-indigo-400 transition-colors">
                        {fileName.includes('raw-clips') ? `Video Part #${index + 1}` : fileName}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider font-semibold">Video File</p>
                    </div>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </a>
                  </div>
                );
              })}
            </div>
            
            <button 
              onClick={() => setShowDownloadListModal(false)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition-all text-sm mt-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
