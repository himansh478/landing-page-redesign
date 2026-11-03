'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, ArrowRight } from 'lucide-react';
import { CwayaMark } from '@/components/brand/CwayaMark';

const inputClass =
  'w-full bg-ivory border border-ink/15 rounded-md h-12 px-4 text-ink placeholder:text-ink/40 focus:outline-none focus-visible:outline-2 focus-visible:outline-editorial focus:border-editorial/50 transition-colors';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/my-courses';

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Account created! Check your email to confirm it, then sign in.');
        setMode('signin');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(redirectTo);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grain relative min-h-screen bg-ivory flex items-center justify-center px-4 pt-28 pb-16">
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-paper border border-ink/15 rounded-[4px] overflow-hidden shadow-[0_40px_80px_-50px_rgb(var(--ink-rgb)/0.5)]">
          <div className="h-1 bg-coral" aria-hidden="true" />
          <div className="p-7 sm:p-9">
            <div className="flex items-center gap-3 mb-8">
              <CwayaMark className="w-9 h-9" />
              <p className="slate text-editorial">{mode === 'signin' ? 'Courses · Sign in' : 'Courses · Sign up'}</p>
            </div>

            <h1 className="font-display text-4xl font-extrabold text-ink tracking-[-0.035em] mb-2">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-ink/65 mb-8">
              {mode === 'signin' ? 'Sign in to access your purchased courses.' : 'Sign up to buy and watch courses.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="slate text-ink/60 block mb-2">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="login-password" className="slate text-ink/60 block mb-2">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
              </div>

              {error && (
                <p role="alert" className="text-destructive text-sm">
                  {error}
                </p>
              )}
              {message && (
                <p role="status" className="text-editorial text-sm font-medium">
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group w-full h-12 mt-2 bg-editorial text-ivory rounded-md font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-ink disabled:opacity-60"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />}
                {mode === 'signin' ? 'Sign in' : 'Sign up'}
                {!loading && <ArrowRight className="w-4 h-4 transition-transform duration-500 ease-reveal group-hover:translate-x-1" aria-hidden="true" />}
              </button>
            </form>

            <button
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError(null);
                setMessage(null);
              }}
              className="w-full mt-6 pt-6 border-t border-ink/10 !text-sm text-ink/65 hover:text-ink"
            >
              {mode === 'signin' ? 'New here? Create an account' : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ivory" />}>
      <LoginPageContent />
    </Suspense>
  );
}
