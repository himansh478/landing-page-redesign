'use client';

import { useState, useSyncExternalStore } from 'react';
import { AnimatePresence } from 'motion/react';
import { Download, Lock, Play, Clock, Loader2 } from 'lucide-react';
import { UnlockModal } from './UnlockModal';
import { ModalShell } from './editorial/ModalShell';
import { chipClass, tagClass } from './editorial/styles';
import { getPaidClipTelegramLink, getUnlockedVideoUrls } from '@/app/actions/clips';

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
  /** Delivered by the Telegram bot instead of a direct download */
  on_telegram?: boolean;
  /** Free clips on Telegram: opens the bot, which sends the clip */
  telegram_url?: string;
}

interface ClipCardProps {
  clip: Clip;
}

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

// A paid order unlocks every clip; read it from localStorage after hydration.
const subscribeStorage = (cb: () => void) => {
  window.addEventListener('storage', cb);
  return () => window.removeEventListener('storage', cb);
};
const hasOrder = () => !!localStorage.getItem('cwaya_order_id');
const noOrderOnServer = () => false;

export function ClipCard({ clip }: ClipCardProps) {
  const [showModal, setShowModal] = useState(false);
  const orderUnlocked = useSyncExternalStore(subscribeStorage, hasOrder, noOrderOnServer);
  const isUnlocked = clip.is_free || orderUnlocked;
  const [downloadUrls, setDownloadUrls] = useState<string[]>([]);
  const [showDownloadListModal, setShowDownloadListModal] = useState(false);
  const [isLoadingUrls, setIsLoadingUrls] = useState(false);

  const handleDownload = async () => {
    if (clip.is_free && clip.telegram_url) {
      window.open(clip.telegram_url, '_blank', 'noopener');
      return;
    }
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
          // Clips stored on Telegram: a one-time bot link instead of a file URL
          if (clip.on_telegram) {
            const link = await getPaidClipTelegramLink(clip.id, orderId);
            if (link) {
              // Same tab: popup blockers stop window.open after an await
              window.location.href = link;
              return;
            }
          }
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
        } catch {
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
      <article className="group relative flex flex-col h-full bg-paper rounded-[4px] overflow-hidden ring-1 ring-ink/10 transition-shadow duration-500 hover:shadow-[0_30px_60px_-35px_rgb(var(--ink-rgb)/0.55)]">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-ink">
          {clip.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={clip.thumbnail_url}
              alt={clip.title}
              className="w-full h-full object-cover transition-transform duration-1000 ease-reveal group-hover:scale-[1.05]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="w-10 h-10 text-ivory/30" aria-hidden="true" />
            </div>
          )}

          {/* Overlay on hover */}
          <div aria-hidden="true" className="absolute inset-0 bg-ink/40 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="w-12 h-12 rounded-full bg-ivory text-ink flex items-center justify-center">
              <Play className="w-5 h-5 ml-0.5 fill-current" />
            </span>
          </div>

          {/* FREE / PAID badge */}
          <span
            className={`absolute top-3 left-3 slate !text-[10px] !tracking-[0.14em] px-2 py-1 rounded-[3px] inline-flex items-center gap-1 ${
              clip.is_free ? 'bg-coral text-ink' : 'bg-ink/80 text-ivory backdrop-blur-sm'
            }`}
          >
            {clip.is_free ? (
              <>Free</>
            ) : (
              <><Lock className="w-3 h-3" aria-hidden="true" /> ₹19</>
            )}
          </span>

          {/* Quality badge */}
          <span className={`absolute top-3 right-3 ${chipClass}`}>4K RAW</span>

          {/* Duration badge */}
          {clip.duration && (
            <span className={`absolute bottom-3 right-3 ${chipClass} tabular`}>
              <Clock className="w-3 h-3" aria-hidden="true" />
              {clip.duration}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-4 sm:p-5">
          {/* Category */}
          <span className="slate text-editorial mb-2">{clip.category}</span>

          {/* Title */}
          <h3 className="font-display font-bold text-ink text-base sm:text-lg leading-snug tracking-[-0.01em] mb-1.5 line-clamp-2">
            {clip.title}
          </h3>

          {/* Description */}
          {clip.description && (
            <p className="text-ink/65 text-sm leading-relaxed line-clamp-2 mb-3">{clip.description}</p>
          )}

          {/* Tags */}
          {clip.tags && (
            <ul className="flex flex-wrap gap-1.5 mb-3" aria-label="Tags">
              {clip.tags.split(',').slice(0, 3).map((tag, i) => (
                <li key={i} className={tagClass}>
                  {tag.trim()}
                </li>
              ))}
            </ul>
          )}

          {/* Download count */}
          {clip.download_count !== undefined && clip.download_count > 0 && (
            <p className="slate text-ink/50 mb-3 flex items-center gap-1.5 tabular">
              <Download className="w-3 h-3" aria-hidden="true" />
              {clip.download_count} downloads
            </p>
          )}

          {/* Download Button */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={isLoadingUrls}
            className={`mt-auto w-full flex items-center justify-center gap-2 h-11 px-4 rounded-md font-semibold text-sm transition-colors duration-300 disabled:opacity-60 ${
              isUnlocked ? 'bg-editorial text-ivory hover:bg-ink' : 'bg-coral text-ink hover:bg-ink hover:text-ivory'
            }`}
          >
            {isLoadingUrls ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                Fetching links...
              </>
            ) : clip.is_free ? (
              <>
                <Download className="w-4 h-4" aria-hidden="true" />
                Free Download
              </>
            ) : isUnlocked ? (
              <>
                <Download className="w-4 h-4" aria-hidden="true" />
                Download Clip
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" aria-hidden="true" />
                Unlock @ ₹19
              </>
            )}
          </button>
          {clip.on_telegram && (isUnlocked || clip.is_free) && (
            <p className="slate !text-[10px] text-ink/50 text-center mt-2">Opens in Telegram</p>
          )}
        </div>
      </article>

      {showModal && <UnlockModal onClose={() => setShowModal(false)} />}

      <AnimatePresence>
        {showDownloadListModal && (
          <ModalShell onClose={() => setShowDownloadListModal(false)} labelledBy={`dl-${clip.id}`} zClass="z-[99999]">
            <div className="p-6 space-y-4">
              <div className="pr-10">
                <h3 id={`dl-${clip.id}`} className="font-display text-xl font-extrabold text-ink tracking-[-0.02em]">Download Files</h3>
                <p className="text-ink/65 text-sm mt-1">
                  Yeh clip {downloadUrls.length} alag-alag videos se bani hai. Aap niche se har video ko ek-ek karke download kar sakte hain:
                </p>
              </div>

              <ul className="max-h-[300px] overflow-y-auto border-t border-ink/15">
                {downloadUrls.map((url, index) => {
                  const fileName = getFileName(url);
                  return (
                    <li key={index} className="flex items-center justify-between gap-4 py-3.5 border-b border-ink/15">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink truncate">
                          {fileName.includes('raw-clips') ? `Video Part #${index + 1}` : fileName}
                        </p>
                        <p className="slate !text-[10px] text-ink/50 mt-0.5">Video File</p>
                      </div>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-editorial hover:bg-ink text-ivory font-semibold text-xs h-9 px-3.5 rounded-md transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" aria-hidden="true" />
                        Download
                      </a>
                    </li>
                  );
                })}
              </ul>

              <button
                type="button"
                onClick={() => setShowDownloadListModal(false)}
                className="w-full h-11 rounded-md border border-ink/25 text-ink font-semibold text-sm transition-colors hover:border-ink hover:bg-ink/5"
              >
                Close
              </button>
            </div>
          </ModalShell>
        )}
      </AnimatePresence>
    </>
  );
}
