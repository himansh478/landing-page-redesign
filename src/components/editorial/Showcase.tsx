'use client';

import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Play, X } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ServiceBookingForm } from '../ServiceBookingForm';
import { useIsClient } from './useIsClient';
import { PageIntro, PageShell } from './PageIntro';
import { CtaBand } from './CtaBand';
import { btnArrow, btnCoralOnInk, chipClass } from './styles';

// Portfolio pages as reels on the editor's desk: each clip is a frame with
// slate chips (as on the hero monitor), and playback opens in a dark
// screening-room lightbox.

export type ShowcaseClip = {
  id: number | string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  category?: string;
  duration?: string;
};

/** feature: two large frames. wide: 16:9 three-up. vertical: 9:16 reels. */
export type ClipFormat = 'feature' | 'wide' | 'vertical';
/** Shape of the player when a clip is opened. */
export type PlayerFormat = 'vertical' | 'wide';

const gridByFormat: Record<ClipFormat, string> = {
  feature: 'grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12',
  wide: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10',
  vertical: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-8',
};

const aspectByFormat: Record<ClipFormat, string> = {
  feature: 'aspect-[16/10]',
  wide: 'aspect-video',
  vertical: 'aspect-[9/16]',
};

const clipId = (n: number) => `C${String(n).padStart(3, '0')}`;

export function ClipGrid({
  clips,
  format,
  onSelect,
  startIndex = 0,
}: {
  clips: ShowcaseClip[];
  format: ClipFormat;
  onSelect: (clip: ShowcaseClip) => void;
  startIndex?: number;
}) {
  const large = format !== 'vertical';

  return (
    <ul className={`grid ${gridByFormat[format]}`}>
      {clips.map((clip, i) => (
        <motion.li
          key={clip.id}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: (i % 4) * 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="min-w-0"
        >
          <button type="button" onClick={() => onSelect(clip)} className="group block w-full text-left">
            <span className={`relative block overflow-hidden rounded-[4px] bg-ink ring-1 ring-ink/10 ${aspectByFormat[format]}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={clip.thumbnail}
                alt=""
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
                className="absolute inset-0 w-full h-full object-cover opacity-90 transition-[transform,opacity] duration-1000 ease-reveal group-hover:scale-[1.04] group-hover:opacity-100"
              />
              <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/0 to-ink/20" />
              <span aria-hidden="true" className="absolute inset-x-0 top-0 p-3 sm:p-4 flex justify-between gap-2">
                <span className={chipClass}>{clipId(startIndex + i + 1)}</span>
                {clip.duration && <span className={`${chipClass} tabular`}>{clip.duration}</span>}
              </span>
              <span
                aria-hidden="true"
                className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ivory text-ink flex items-center justify-center transition-[transform,background-color] duration-500 ease-reveal group-hover:scale-110 group-hover:bg-coral group-focus-visible:bg-coral ${
                  large ? 'w-16 h-16' : 'w-12 h-12'
                }`}
              >
                <Play className={`fill-current ml-0.5 ${large ? 'w-6 h-6' : 'w-4 h-4'}`} />
              </span>
            </span>
            <span className="block pt-4">
              {clip.category && <span className="block slate text-ink/55 mb-1.5">{clip.category}</span>}
              <span
                className={`block font-display font-bold text-ink tracking-[-0.02em] transition-colors group-hover:text-editorial ${
                  large ? 'text-xl sm:text-2xl leading-tight' : 'text-sm sm:text-base leading-snug'
                }`}
              >
                {clip.title}
              </span>
              {clip.duration && large && <span className="block slate text-ink/45 mt-2 tabular">{clip.duration} Runtime</span>}
            </span>
          </button>
        </motion.li>
      ))}
    </ul>
  );
}

export function ClipSection({
  reel,
  title,
  sub,
  count,
  children,
  className = '',
}: {
  reel: string;
  title?: string;
  sub?: string;
  count: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="flex items-end justify-between gap-6 border-t border-ink/20 pt-5 mb-8 sm:mb-10">
        <div className="min-w-0">
          <p className={`slate text-editorial ${title || sub ? 'mb-2' : ''}`}>{reel}</p>
          {title && <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink tracking-[-0.025em]">{title}</h2>}
          {sub && <p className="slate text-ink/50 mt-2">{sub}</p>}
        </div>
        <span className="slate text-ink/45 flex-shrink-0 tabular">
          {String(count).padStart(2, '0')} {count === 1 ? 'clip' : 'clips'}
        </span>
      </div>
      {children}
    </section>
  );
}

export function VideoLightbox({
  clip,
  format,
  onClose,
}: {
  clip: ShowcaseClip | null;
  format: PlayerFormat;
  onClose: () => void;
}) {
  const isClient = useIsClient();
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!clip) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [clip]);

  if (!isClient) return null;

  // Portaled so page stacking contexts can't put it under the fixed header.
  return createPortal(
    <AnimatePresence>
      {clip && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="on-ink fixed inset-0 z-[100] bg-ink/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={clip.title}
        >
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close video"
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-11 h-11 rounded-full border border-ivory/25 text-ivory flex items-center justify-center transition-colors hover:bg-coral hover:border-coral hover:text-ink z-10"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>

          <motion.figure
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className={`w-full ${format === 'wide' ? 'max-w-6xl' : 'max-w-sm'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`relative w-full overflow-hidden rounded-[4px] bg-black ring-1 ring-ivory/15 ${
                format === 'wide' ? 'aspect-video' : 'aspect-[9/16] max-h-[78vh] mx-auto'
              }`}
            >
              <iframe
                src={clip.videoUrl}
                title={clip.title}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <figcaption className="mt-3 flex justify-between gap-4 slate text-ivory/60">
              <span className="truncate">{clip.title}</span>
              {clip.duration && <span className="tabular flex-shrink-0">{clip.duration}</span>}
            </figcaption>
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export type ShowcaseSection = {
  title?: string;
  sub?: string;
  clips: ShowcaseClip[];
  format: ClipFormat;
  player: PlayerFormat;
};

// A complete portfolio page: intro, one or more reels of clips, a dark CTA
// that opens the booking form, and the lightbox.
export function ShowcasePage({
  back,
  kicker,
  title,
  lede,
  sections,
  cta,
  service,
}: {
  back: { href: string; label: string };
  kicker: string;
  title: ReactNode[];
  lede: ReactNode;
  sections: ShowcaseSection[];
  cta: { label: string; title: ReactNode[]; body: string };
  service: string;
}) {
  const [selected, setSelected] = useState<{ clip: ShowcaseClip; player: PlayerFormat } | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const offsets = sections.map((_, i) => sections.slice(0, i).reduce((n, s) => n + s.clips.length, 0));

  return (
    <>
      <PageShell>
        <PageIntro back={back} note={kicker} title={title} lede={lede} />

        <div className="mt-16 sm:mt-20 space-y-20 sm:space-y-24">
          {sections.map((section, i) => (
            <ClipSection
              key={i}
              reel={`Reel ${String(i + 1).padStart(2, '0')}`}
              title={section.title}
              sub={section.sub}
              count={section.clips.length}
            >
              <ClipGrid
                clips={section.clips}
                format={section.format}
                startIndex={offsets[i]}
                onSelect={(clip) => setSelected({ clip, player: section.player })}
              />
            </ClipSection>
          ))}
        </div>

        <CtaBand label={cta.label} title={cta.title} body={cta.body} className="mt-24 sm:mt-32">
          <button type="button" onClick={() => setIsBookingModalOpen(true)} className={`${btnCoralOnInk} w-full sm:w-auto`}>
            Book Now
            <ArrowRight className={btnArrow} aria-hidden="true" />
          </button>
        </CtaBand>
      </PageShell>

      <VideoLightbox clip={selected?.clip ?? null} format={selected?.player ?? 'vertical'} onClose={() => setSelected(null)} />

      <ServiceBookingForm isOpen={isBookingModalOpen} onOpenChange={setIsBookingModalOpen} selectedService={service} />
    </>
  );
}

// Emphasis inside a lede (replaces the old bold slate span)
export function Em({ children }: { children: ReactNode }) {
  return <span className="text-ink font-semibold">{children}</span>;
}
