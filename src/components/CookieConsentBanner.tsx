'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import Link from 'next/link';

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  const acceptNecessary = () => {
    localStorage.setItem('cookieConsent', 'necessary');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          role="region"
          aria-label="Cookie consent"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-24 sm:bottom-6 sm:max-w-sm z-[100]"
        >
          <div className="bg-paper border border-ink/15 rounded-md shadow-[0_24px_60px_-20px_rgb(var(--ink-rgb)/0.35)] p-5">
            <div className="flex items-start justify-between gap-4 mb-2">
              <p className="slate text-editorial">Cookies</p>
              <button
                onClick={acceptNecessary}
                aria-label="Dismiss — necessary cookies only"
                className="-mt-1 -mr-1 w-8 h-8 flex items-center justify-center rounded-md text-ink/50 hover:text-ink hover:bg-ink/5 transition-colors"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <p className="text-ink/75 text-sm leading-relaxed mb-4">
              We use cookies to improve your experience. By clicking &ldquo;Accept all&rdquo;, you consent to our use of cookies.{' '}
              <Link href="/privacy-policy" className="text-editorial underline underline-offset-2 hover:text-ink">
                Learn more
              </Link>
            </p>
            <div className="flex gap-2">
              <button
                onClick={acceptNecessary}
                className="flex-1 h-10 border border-ink/20 text-ink rounded-md !text-sm font-semibold hover:bg-ink/5 transition-colors"
              >
                Necessary only
              </button>
              <button
                onClick={acceptAll}
                className="flex-1 h-10 bg-editorial text-ivory rounded-md !text-sm font-semibold hover:bg-ink transition-colors"
              >
                Accept all
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
