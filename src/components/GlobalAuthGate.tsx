'use client';

import { useState, useEffect, useRef } from 'react';
import { User, Briefcase, Mail, Phone, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/lib/supabase';

type LoginMode = 'select' | 'customer' | 'work';

interface GlobalAuthGateProps {
  onAuth: () => void;
  onClose?: () => void;
}

const inputClass =
  'w-full bg-ivory border border-ink/15 rounded-md h-12 px-4 text-ink placeholder:text-ink/45 !text-[0.95rem] focus:outline-none focus-visible:outline-2 focus-visible:outline-editorial focus:border-editorial/50 transition-colors';
const iconInputClass = `${inputClass} pl-11`;

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const titles: Record<LoginMode, string> = {
  select: 'Welcome to Cwaya',
  customer: 'Login as Customer',
  work: 'Work Applications',
};

export function GlobalAuthGate({ onAuth, onClose }: GlobalAuthGateProps) {
  const [mode, setModeState] = useState<LoginMode>('select');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  // The parent passes a new inline onClose each render; reading it through a
  // ref keeps the focus-trap effect mount-only so focus isn't yanked around.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const setMode = (next: LoginMode) => {
    setError(null);
    setModeState(next);
  };

  // Focus trap + Escape to close, and restore focus to whatever was focused before.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialog.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onCloseRef.current) {
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => !el.hasAttribute('disabled'));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previouslyFocused?.focus?.();
    };
  }, []);

  const handleCustomerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setIsLoading(true);
    const data = {
      email: fd.get('email') as string,
      phone: fd.get('phone') as string,
    };

    const { error: dbError } = await supabase.from('leads').insert([data]);
    setIsLoading(false);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('_cwaya_auth_v1', 'verified_session_' + btoa(data.email));
    }
    onAuth();
  };

  const handleWorkSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setIsLoading(true);
    const data = {
      full_name: fd.get('fullName') as string,
      whatsapp: fd.get('whatsapp') as string,
      location: fd.get('location') as string,
      state: fd.get('state') as string,
      district: fd.get('district') as string,
      skills: fd.get('skills') as string,
      equipment: fd.get('equipment') as string,
      portfolio: fd.get('portfolio') as string,
    };

    const { error: dbError } = await supabase.from('work_applications').insert([data]);
    setIsLoading(false);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('_cwaya_auth_v1', 'verified_session_' + btoa(data.whatsapp));
    }
    onAuth();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-ink/70 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-gate-title"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="bg-paper border border-ink/15 rounded-md shadow-[0_40px_100px_-30px_rgb(var(--ink-rgb)/0.6)] w-full max-w-md overflow-hidden relative"
      >
        <div className="h-1 bg-coral" aria-hidden="true" />
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-md text-ink/50 hover:text-ink hover:bg-ink/5 transition-colors z-20"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        )}
        <div className="p-7 sm:p-8">
          <div className="mb-7">
            <p className="slate text-editorial mb-3">Cwaya · Identify</p>
            <h2 id="auth-gate-title" className="font-display text-3xl font-extrabold text-ink tracking-[-0.03em] mb-1.5">
              {titles[mode]}
            </h2>
            <p className="text-ink/65">Identify yourself to continue.</p>
          </div>

          <AnimatePresence mode="wait">
            {mode === 'select' && (
              <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-t border-ink/15">
                {[
                  { key: 'customer' as const, icon: User, title: 'Login as Customer', sub: 'I want to book a service.' },
                  { key: 'work' as const, icon: Briefcase, title: 'Work Applications', sub: 'I want to collaborate.' },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setMode(opt.key)}
                    className="group flex items-center gap-4 w-full py-5 px-1 text-left border-b border-ink/15 transition-colors hover:bg-ink/[0.03]"
                  >
                    <opt.icon className="w-5 h-5 text-ink/45 transition-colors group-hover:text-editorial" aria-hidden="true" />
                    <span className="flex-1">
                      <span className="block font-display font-bold text-ink">{opt.title}</span>
                      <span className="block text-sm text-ink/60 font-normal">{opt.sub}</span>
                    </span>
                    <ArrowRight
                      className="w-4 h-4 text-ink/40 transition-transform duration-500 ease-reveal group-hover:translate-x-1 group-hover:text-editorial"
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </motion.div>
            )}

            {mode === 'customer' && (
              <motion.form key="customer" onSubmit={handleCustomerSubmit} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/45" aria-hidden="true" />
                  <input required type="email" name="email" placeholder="Gmail Address" aria-label="Gmail address" className={iconInputClass} />
                </div>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/45" aria-hidden="true" />
                  <input required type="tel" name="phone" placeholder="Calling Number" aria-label="Calling number" className={iconInputClass} />
                </div>
                <div style={{ display: 'none' }} aria-hidden="true"><input type="text" name="website_url" tabIndex={-1} /></div>

                {error && <p className="text-destructive text-sm">{error}</p>}
                <div className="flex gap-2 pt-3">
                  <button type="button" onClick={() => setMode('select')} className="h-12 px-5 rounded-md font-semibold text-ink/70 hover:bg-ink/5">Back</button>
                  <button type="submit" disabled={isLoading} className="flex-1 h-12 bg-editorial text-ivory rounded-md font-semibold hover:bg-ink transition-colors disabled:opacity-60">
                    {isLoading ? 'Loading...' : 'Unlock'}
                  </button>
                </div>
              </motion.form>
            )}

            {mode === 'work' && (
              <motion.form key="work" onSubmit={handleWorkSubmit} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-3">
                <div className="space-y-3 max-h-[40vh] overflow-y-auto px-1 -mx-1 py-1">
                  <input required type="text" name="fullName" placeholder="Full Name" aria-label="Full name" className={inputClass} />
                  <input required type="tel" name="whatsapp" placeholder="WhatsApp Number" aria-label="WhatsApp number" className={inputClass} />
                  <input required type="text" name="location" placeholder="Exact Address" aria-label="Exact address" className={inputClass} />
                  <div className="grid grid-cols-2 gap-3">
                    <input required type="text" name="state" placeholder="State" aria-label="State" className={inputClass} />
                    <input required type="text" name="district" placeholder="District" aria-label="District" className={inputClass} />
                  </div>
                  <input required type="text" name="skills" placeholder="Skills" aria-label="Skills" className={inputClass} />
                  <input required type="text" name="portfolio" placeholder="Portfolio URL" aria-label="Portfolio URL" className={inputClass} />
                </div>

                {error && <p className="text-destructive text-sm">{error}</p>}
                <div className="flex gap-2 pt-3">
                  <button type="button" onClick={() => setMode('select')} className="h-12 px-5 rounded-md font-semibold text-ink/70 hover:bg-ink/5">Back</button>
                  <button type="submit" disabled={isLoading} className="flex-1 h-12 bg-editorial text-ivory rounded-md font-semibold hover:bg-ink transition-colors disabled:opacity-60">
                    {isLoading ? 'Loading...' : 'Apply & Unlock'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
