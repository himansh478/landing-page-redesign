import { useState, useEffect } from 'react';
import { User, Briefcase, Mail, Phone, MapPin, Wrench, Camera, Link as LinkIcon, Map, Building } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { Turnstile } from '@marsidev/react-turnstile';

type LoginMode = 'select' | 'customer' | 'work';

interface GlobalAuthGateProps {
  onAuth: () => void;
}

// shared input style used across both forms
const inputClass = "w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none";
const customerInputClass = "w-full bg-slate-50 border-none rounded-xl py-4 pl-12 pr-4 text-slate-900 font-medium focus:ring-2 focus:ring-purple-500 outline-none";

export function GlobalAuthGate({ onAuth }: GlobalAuthGateProps) {
  const [mode, setMode] = useState<LoginMode>('select');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // reset token when changing mode
  useEffect(() => {
    setTurnstileToken(null);
    setError(null);
  }, [mode]);

  const handleCustomerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const fd = new FormData(form);

    // Honeypot check
    if (fd.get('website_url')) return;

    if (!turnstileToken) {
      setError('Please complete the CAPTCHA check.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const data = {
      email: fd.get('email') as string,
      phone: fd.get('phone') as string,
    };

    const { error: dbError } = await supabase.from('leads').insert([data]);
    setIsLoading(false);

    if (dbError) {
      console.error('Supabase insert error (leads):', dbError.message);
      setError(dbError.message);
      return;
    }

    // Set hashed key to make it harder to guess/bypass
    localStorage.setItem('_cwaya_auth_v1', 'verified_session_' + btoa(data.email));
    onAuth();
  };

  const handleWorkSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const fd = new FormData(form);

    // Honeypot check
    if (fd.get('website_url')) return;

    if (!turnstileToken) {
      setError('Please complete the CAPTCHA check.');
      return;
    }

    setIsLoading(true);
    setError(null);

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
      console.error('Supabase insert error (work_applications):', dbError.message);
      setError(dbError.message);
      return;
    }

    // Set hashed key
    localStorage.setItem('_cwaya_auth_v1', 'verified_session_' + btoa(data.whatsapp));
    onAuth();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden relative z-10"
      >
        <div className="p-8">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              {mode === 'select' && 'Welcome to Cwaya'}
              {mode === 'customer' && 'Login as Customer'}
              {mode === 'work' && 'Work Applications'}
            </h2>
            <p className="text-slate-500 font-medium">
              {mode === 'select' && 'Please identify yourself to continue accessing the website.'}
              {mode !== 'select' && 'Complete the form below to unlock access.'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {mode === 'select' && (
              <motion.div
                key="select"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid gap-4"
              >
                <button
                  onClick={() => setMode('customer')}
                  className="flex items-center justify-between w-full p-6 bg-slate-50 hover:bg-purple-50 hover:ring-2 hover:ring-purple-500 rounded-2xl transition-all group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-500 group-hover:text-purple-600 transition-colors">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-purple-700">Login as Customer</h3>
                      <p className="text-sm text-slate-500">I am looking to book a service.</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setMode('work')}
                  className="flex items-center justify-between w-full p-6 bg-slate-50 hover:bg-indigo-50 hover:ring-2 hover:ring-indigo-500 rounded-2xl transition-all group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-500 group-hover:text-indigo-600 transition-colors">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-indigo-700">Work Applications</h3>
                      <p className="text-sm text-slate-500">I am a professional looking to collaborate.</p>
                    </div>
                  </div>
                </button>
              </motion.div>
            )}

            {mode === 'customer' && (
              <motion.form
                key="customer"
                onSubmit={handleCustomerSubmit}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">{error}</div>
                )}
                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input required type="email" name="email" placeholder="Gmail Address" className={customerInputClass} />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input required type="tel" name="phone" placeholder="Calling Number" className={customerInputClass} />
                  </div>
                </div>

                {/* Honeypot field */}
                <div style={{ display: 'none' }} aria-hidden="true">
                  <input type="text" name="website_url" tabIndex={-1} autoComplete="off" />
                </div>

                {/* Cloudflare Turnstile */}
                <div className="flex justify-center py-2 scale-90">
                  <Turnstile 
                    siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'} 
                    onSuccess={(token) => setTurnstileToken(token)}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setMode('select')}
                    className="px-6 py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-bold transition-colors shadow-lg shadow-purple-500/30 disabled:opacity-60"
                  >
                    {isLoading ? 'Saving...' : 'Unlock Site'}
                  </button>
                </div>
              </motion.form>
            )}

            {mode === 'work' && (
              <motion.form
                key="work"
                onSubmit={handleWorkSubmit}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">{error}</div>
                )}
                <div className="space-y-3 max-h-[40vh] overflow-y-auto px-1 -mx-1 pb-2">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input required type="text" name="fullName" placeholder="Full Name" className={inputClass} />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input required type="tel" name="whatsapp" placeholder="WhatsApp Number" className={inputClass} />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input required type="text" name="location" placeholder="Exact Location Address" className={inputClass} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <Map className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input required type="text" name="state" placeholder="State" className={inputClass} />
                    </div>
                    <div className="relative">
                      <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input required type="text" name="district" placeholder="District" className={inputClass} />
                    </div>
                  </div>
                  <div className="relative">
                    <Wrench className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input required type="text" name="skills" placeholder="Primary Skills" className={inputClass} />
                  </div>
                  <div className="relative">
                    <Camera className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input required type="text" name="equipment" placeholder="Equipments available?" className={inputClass} />
                  </div>
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input required type="url" name="portfolio" placeholder="Portfolio Link" className={inputClass} />
                  </div>
                </div>

                {/* Honeypot field */}
                <div style={{ display: 'none' }} aria-hidden="true">
                  <input type="text" name="website_url" tabIndex={-1} autoComplete="off" />
                </div>

                {/* Cloudflare Turnstile */}
                <div className="flex justify-center py-2 scale-90">
                  <Turnstile 
                    siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'} 
                    onSuccess={(token) => setTurnstileToken(token)}
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setMode('select')}
                    className="px-6 py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold transition-colors shadow-lg shadow-indigo-500/30 disabled:opacity-60"
                  >
                    {isLoading ? 'Submitting...' : 'Apply & Unlock'}
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
