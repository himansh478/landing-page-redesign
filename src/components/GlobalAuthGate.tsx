'use client';

import { useState, useEffect } from 'react';
import { User, Briefcase, Mail, Phone, MapPin, Wrench, Camera, Link as LinkIcon, Map, Building, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/lib/supabase';
import { Turnstile } from '@marsidev/react-turnstile';

type LoginMode = 'select' | 'customer' | 'work';

interface GlobalAuthGateProps {
  onAuth: () => void;
  onClose?: () => void;
}

const inputClass = "w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none";
const customerInputClass = "w-full bg-slate-50 border-none rounded-xl py-4 pl-12 pr-4 text-slate-900 font-medium focus:ring-2 focus:ring-purple-500 outline-none";

export function GlobalAuthGate({ onAuth, onClose }: GlobalAuthGateProps) {
  const [mode, setMode] = useState<LoginMode>('select');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  useEffect(() => {
    setTurnstileToken(null);
    setError(null);
  }, [mode]);

  const handleCustomerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get('website_url')) return;
    if (!turnstileToken) {
      setError('Please complete the CAPTCHA.');
      return;
    }

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
    if (fd.get('website_url')) return;
    if (!turnstileToken) {
      setError('Please complete the CAPTCHA.');
      return;
    }

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
    <div className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden relative z-10"
      >
        {onClose && (
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full transition-colors z-20">
            <X className="w-5 h-5" />
          </button>
        )}
        <div className="p-8">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              {mode === 'select' ? 'Welcome to Cwaya' : mode === 'customer' ? 'Login as Customer' : 'Work Applications'}
            </h2>
            <p className="text-slate-500 font-medium">Identify yourself to continue.</p>
          </div>

          <AnimatePresence mode="wait">
            {mode === 'select' && (
              <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-4">
                <button onClick={() => setMode('customer')} className="flex items-center justify-between w-full p-6 bg-slate-50 hover:bg-purple-50 rounded-2xl transition-all group text-left border border-transparent hover:border-purple-200">
                  <div className="flex items-center gap-4">
                    <User className="w-6 h-6 text-slate-400 group-hover:text-purple-600" />
                    <div>
                      <h3 className="font-bold text-slate-900">Login as Customer</h3>
                      <p className="text-sm text-slate-500">I want to book a service.</p>
                    </div>
                  </div>
                </button>
                <button onClick={() => setMode('work')} className="flex items-center justify-between w-full p-6 bg-slate-50 hover:bg-indigo-50 rounded-2xl transition-all group text-left border border-transparent hover:border-indigo-200">
                  <div className="flex items-center gap-4">
                    <Briefcase className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
                    <div>
                      <h3 className="font-bold text-slate-900">Work Applications</h3>
                      <p className="text-sm text-slate-500">I want to collaborate.</p>
                    </div>
                  </div>
                </button>
              </motion.div>
            )}

            {mode === 'customer' && (
              <motion.form key="customer" onSubmit={handleCustomerSubmit} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input required type="email" name="email" placeholder="Gmail Address" className={customerInputClass} />
                </div>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input required type="tel" name="phone" placeholder="Calling Number" className={customerInputClass} />
                </div>
                <div style={{ display: 'none' }} aria-hidden="true"><input type="text" name="website_url" /></div>
                <div className="flex justify-center py-2">
                  <Turnstile siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'} onSuccess={setTurnstileToken} />
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setMode('select')} className="px-6 py-4 rounded-xl font-bold text-slate-500">Back</button>
                  <button type="submit" disabled={isLoading} className="flex-1 bg-purple-600 text-white py-4 rounded-xl font-bold shadow-lg">
                    {isLoading ? 'Loading...' : 'Unlock'}
                  </button>
                </div>
              </motion.form>
            )}

            {mode === 'work' && (
              <motion.form key="work" onSubmit={handleWorkSubmit} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="space-y-3 max-h-[40vh] overflow-y-auto px-1">
                  <input required type="text" name="fullName" placeholder="Full Name" className={inputClass} />
                  <input required type="tel" name="whatsapp" placeholder="WhatsApp Number" className={inputClass} />
                  <input required type="text" name="location" placeholder="Exact Address" className={inputClass} />
                  <div className="grid grid-cols-2 gap-3">
                    <input required type="text" name="state" placeholder="State" className={inputClass} />
                    <input required type="text" name="district" placeholder="District" className={inputClass} />
                  </div>
                  <input required type="text" name="skills" placeholder="Skills" className={inputClass} />
                  <input required type="text" name="portfolio" placeholder="Portfolio URL" className={inputClass} />
                </div>
                <div className="flex justify-center py-2">
                  <Turnstile siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'} onSuccess={setTurnstileToken} />
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setMode('select')} className="px-6 py-4 rounded-xl font-bold text-slate-500">Back</button>
                  <button type="submit" disabled={isLoading} className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg">
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
