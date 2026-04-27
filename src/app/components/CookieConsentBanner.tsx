import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, X, CheckCircle } from 'lucide-react';

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // show after small delay so it doesn't flash on page load
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
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-[100]"
        >
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl shadow-slate-300/50 p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Cookie className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-slate-900 text-base mb-1">We use cookies 🍪</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  We use cookies to improve your experience and analyse traffic. By clicking "Accept All", you consent to our use of cookies.{' '}
                  <a href="/privacy-policy#cookies" className="text-indigo-600 hover:underline font-medium">
                    Learn more
                  </a>
                </p>
              </div>
              <button
                onClick={acceptNecessary}
                className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0 mt-1"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={acceptNecessary}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors"
              >
                Necessary Only
              </button>
              <button
                onClick={acceptAll}
                className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-black transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                <CheckCircle className="w-4 h-4" />
                Accept All
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
