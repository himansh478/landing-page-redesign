'use client';

import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useIsClient } from './useIsClient';

// Paper dialog on an ink scrim, as in GlobalAuthGate: a coral rule along the
// top, a quiet close button, Escape and backdrop click to close. Portaled to
// <body> so page stacking contexts can't tuck it under the fixed header.
export function ModalShell({
  onClose,
  labelledBy,
  children,
  className = 'max-w-md',
  zClass = 'z-[100]',
  closeLabel = 'Close',
}: {
  onClose: () => void;
  labelledBy?: string;
  children: ReactNode;
  className?: string;
  zClass?: string;
  closeLabel?: string;
}) {
  const isClient = useIsClient();
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!isClient) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`fixed inset-0 ${zClass} bg-ink/70 backdrop-blur-sm flex items-center justify-center p-4`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`relative w-full max-h-[92vh] flex flex-col bg-paper border border-ink/15 rounded-md shadow-[0_40px_100px_-30px_rgb(var(--ink-rgb)/0.6)] overflow-hidden ${className}`}
      >
        <div className="h-1 bg-coral flex-shrink-0" aria-hidden="true" />
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-md text-ink/50 hover:text-ink hover:bg-ink/5 transition-colors z-20"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
        <div className="overflow-y-auto">{children}</div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
