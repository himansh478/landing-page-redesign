'use client';

import Image from 'next/image';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Copy, Download, Maximize2, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { PromptItem } from '@/types/prompts';
import { ModalShell } from './ModalShell';
import { chipClass } from './styles';

// Copies text and reports "copied" for two seconds.
function useCopy() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Older browsers / insecure contexts: fall back to a hidden textarea
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  };

  return { copied, copy };
}

const num = (i: number) => String(i + 1).padStart(2, '0');

const aspectClass = (item: PromptItem) => (item.media.type === 'video' ? 'aspect-[9/16]' : 'aspect-[2/3]');

// Cloudinary serves cross-origin, where the download attribute is ignored;
// fl_attachment makes it send the file as a download instead.
const downloadUrl = (src: string) =>
  src.startsWith('https://res.cloudinary.com/') ? src.replace('/upload/', '/upload/fl_attachment/') : src;

// Image or video result. Remote (Cloudinary) images skip Next's optimizer so
// no remotePatterns config is needed. Video previews play muted on hover.
function MediaView({
  media,
  sizes,
  className,
  priority = false,
  preview = false,
}: {
  media: PromptItem['media'];
  sizes: string;
  className: string;
  priority?: boolean;
  preview?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  if (media.type === 'video') {
    return (
      <>
        <video
          ref={ref}
          src={media.src}
          poster={media.poster}
          muted={preview}
          loop={preview}
          playsInline
          controls={!preview}
          preload="metadata"
          aria-label={media.alt}
          onMouseEnter={preview ? () => void ref.current?.play().catch(() => {}) : undefined}
          onMouseLeave={preview ? () => ref.current?.pause() : undefined}
          className={`absolute inset-0 w-full h-full ${className}`}
        />
        {preview && (
          <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="w-10 h-10 rounded-full bg-ink/60 text-ivory flex items-center justify-center backdrop-blur-sm">
              <Play className="w-4 h-4 ml-0.5 fill-current" />
            </span>
          </span>
        )}
      </>
    );
  }
  return (
    <Image
      src={media.src}
      alt={media.alt}
      fill
      sizes={sizes}
      className={className}
      priority={priority}
      unoptimized={!media.src.startsWith('/')}
    />
  );
}

function CopyButton({ text, compact = false }: { text: string; compact?: boolean }) {
  const { copied, copy } = useCopy();
  return (
    <>
      <button
        type="button"
        onClick={() => copy(text)}
        className={`inline-flex items-center justify-center gap-1.5 rounded-md font-semibold transition-colors duration-300 ${
          compact ? 'h-9 px-3 text-xs' : 'h-10 px-4 text-sm'
        } ${copied ? 'bg-coral text-ink' : 'bg-editorial text-ivory hover:bg-ink'}`}
      >
        {copied ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : <Copy className="w-3.5 h-3.5" aria-hidden="true" />}
        {copied ? 'Copied' : compact ? 'Copy' : 'Copy prompt'}
      </button>
      <span className="sr-only" aria-live="polite">{copied ? 'Prompt copied to clipboard' : ''}</span>
    </>
  );
}

// Compact gallery: 2 per row on phones (4 on screen), 6 per row on desktop.
// A card opens the full prompt in a dialog; Copy works straight from the card.
export function PromptGallery({ items }: { items: PromptItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const active = open === null ? null : items[open];

  return (
    <>
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-3 gap-y-6 sm:gap-x-5 sm:gap-y-8">
        {items.map((item, i) => (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: (i % 6) * 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="group flex flex-col min-w-0"
          >
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`Open prompt ${num(i)}: ${item.title}`}
              className={`relative block w-full overflow-hidden rounded-[4px] bg-ink ring-1 ring-ink/15 ${aspectClass(item)}`}
            >
              <MediaView
                media={item.media}
                sizes="(min-width: 1024px) 16vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform duration-1000 ease-reveal group-hover:scale-[1.04]"
                priority={i < 6}
                preview
              />
              <span className={`absolute top-2 left-2 ${chipClass}`}>{num(i)}</span>
              <span
                aria-hidden="true"
                className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-ivory text-ink flex items-center justify-center transition-colors duration-300 group-hover:bg-coral"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </span>
            </button>

            <h2 className="mt-3 font-display text-sm sm:text-[0.95rem] font-bold text-ink leading-snug line-clamp-1">{item.title}</h2>
            {/* sm:line-clamp-2 sets display itself; a separate sm:block would undo the clamp */}
            <p className="hidden sm:line-clamp-2 mt-1 text-xs text-ink/60 leading-relaxed">{item.prompt}</p>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOpen(i)}
                className="h-9 px-2 rounded-md border border-ink/25 text-ink text-xs font-semibold transition-colors duration-300 hover:border-ink hover:bg-ink/5"
              >
                View
              </button>
              <CopyButton text={item.prompt} compact />
            </div>
          </motion.li>
        ))}
      </ul>

      <AnimatePresence>
        {active && open !== null && (
          <ModalShell onClose={() => setOpen(null)} labelledBy="prompt-dialog-title" className="max-w-4xl">
            <div className="grid sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-6 p-5 sm:p-7">
              <figure className="max-w-[16rem] sm:max-w-none mx-auto sm:mx-0 w-full">
                <div className={`relative overflow-hidden rounded-[4px] bg-ink ring-1 ring-ink/15 ${aspectClass(active)}`}>
                  <MediaView media={active.media} sizes="(min-width: 640px) 360px, 256px" className="object-cover" />
                </div>
                <figcaption className="mt-2 flex justify-between items-center gap-3 slate text-ink/50">
                  <span>Result · {num(open)}</span>
                  <a href={downloadUrl(active.media.src)} download className="pencil-link inline-flex items-center gap-1.5 text-editorial">
                    <Download className="w-3.5 h-3.5" aria-hidden="true" />
                    {active.media.type === 'video' ? 'Save video' : 'Save image'}
                  </a>
                </figcaption>
              </figure>

              <div className="min-w-0 flex flex-col">
                <p className="slate text-editorial mb-2 pr-10">Prompt {num(open)}</p>
                <h2 id="prompt-dialog-title" className="font-display text-2xl sm:text-3xl font-extrabold text-ink tracking-[-0.03em] leading-[1.05] pr-10">
                  {active.title}
                </h2>

                <p className="slate text-ink/55 mt-5 mb-2">Upload with the prompt</p>
                <ol className="border-t border-ink/15 mb-5">
                  {active.uploads.map((u, i) => (
                    <li key={u} className="flex items-center gap-3 py-2 border-b border-ink/10 text-sm text-ink/80">
                      <span className="slate text-ink/45 tabular w-6">{num(i)}</span>
                      {u}
                    </li>
                  ))}
                </ol>

                <div className="bg-ivory border border-ink/15 rounded-[4px] overflow-hidden flex flex-col min-h-0">
                  <div className="flex items-center justify-between gap-4 px-4 py-2.5 border-b border-ink/15 bg-sand/40">
                    <span className="slate text-ink/60">Prompt text</span>
                    <CopyButton text={active.prompt} />
                  </div>
                  <pre
                    tabIndex={0}
                    className="max-h-[40vh] overflow-y-auto px-4 py-4 whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-ink/80"
                  >
                    {active.prompt}
                  </pre>
                </div>
              </div>
            </div>
          </ModalShell>
        )}
      </AnimatePresence>
    </>
  );
}
