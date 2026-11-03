'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { accountsOn, supabase } from '@/captions/lib/auth';

type Mode = 'signin' | 'signup' | 'forgot' | 'reset';

const TITLES: Record<Mode, string> = {
  signin: 'Sign in',
  signup: 'Create your account',
  forgot: 'Reset your password',
  reset: 'Choose a new password',
};

const ACTIONS: Record<Mode, string> = {
  signin: 'Sign in',
  signup: 'Create account',
  forgot: 'Send reset link',
  reset: 'Save password',
};

// A reset link signs the person in. It is read here because Supabase clears it from
// the address, and announces it, before this page may be listening.
const cameToReset = typeof location !== 'undefined' && location.hash.includes('type=recovery');

/** Where they came from, but only ever within this site. */
function backTarget() {
  try {
    const next = new URL(new URLSearchParams(location.search).get('next') ?? '/ai-caption', location.origin);
    if (next.origin === location.origin) return next.pathname + next.search;
  } catch {
    // A broken link just goes home.
  }
  return '/ai-caption';
}

const goBack = () => location.assign(backTarget());

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (cameToReset) setMode('reset');
  }, []);

  const change = (next: Mode) => {
    setMode(next);
    setError(null);
    setMessage(null);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    setMessage(null);

    const home = `${location.origin}/ai-caption`;
    try {
      if (mode === 'signin') {
        const { error: failed } = await supabase.auth.signInWithPassword({ email, password });
        if (failed) throw failed;
        goBack();
      } else if (mode === 'signup') {
        const { data, error: failed } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: home } });
        if (failed) throw failed;
        if (data.session) goBack();
        else {
          setMessage(`We sent a link to ${email}. Open it to finish, then sign in here. Not there in a few minutes? Check spam, or use Google above.`);
          setMode('signin');
        }
      } else if (mode === 'forgot') {
        const { error: failed } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${home}/login` });
        if (failed) throw failed;
        setMessage('If that email has an account, a reset link is on its way.');
      } else {
        const { error: failed } = await supabase.auth.updateUser({ password });
        if (failed) throw failed;
        goBack();
      }
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  // Google has already proved the email belongs to them, so there is no password to forget
  // and no confirmation email to wait for, and the team list can trust the address.
  const withGoogle = async () => {
    if (!supabase) return;
    setBusy(true);
    setError(null);
    const { error: failed } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${location.origin}${backTarget()}` } });
    if (failed) {
      setError(failed.message);
      setBusy(false);
    }
  };

  if (!accountsOn) {
    return (
      <main className="auth">
        <h1>Accounts are off</h1>
        <p className="notice-line">This copy runs in local mode, with no sign-in needed.</p>
        <Link href="/ai-caption">Back to your projects</Link>
      </main>
    );
  }

  return (
    <main className="auth">
      <h1>{TITLES[mode]}</h1>
      <p className="notice-line">Your Cwaya account works here too.</p>
      {(mode === 'signin' || mode === 'signup') && (
        <>
          <button type="button" id="google" className="primary" onClick={withGoogle} disabled={busy}>
            {mode === 'signup' ? 'Sign up with Google' : 'Continue with Google'}
          </button>
          <p className="notice-line">
            {mode === 'signup' ? 'Quickest: one tap, with no email to wait for. Or use your email below.' : 'Or sign in with your email and password.'}
          </p>
        </>
      )}
      <form onSubmit={submit}>
        {mode !== 'reset' && (
          <label>
            Email
            <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
        )}
        {mode !== 'forgot' && (
          <label>
            {mode === 'reset' ? 'New password' : 'Password'}
            <input
              id="password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {message && <p role="status">{message}</p>}
        <button id="submit" disabled={busy}>
          {busy ? 'One moment…' : ACTIONS[mode]}
        </button>
      </form>
      {mode !== 'reset' && (
        <div className="links">
          {mode === 'signin' ? (
            <>
              <button className="ghost" id="to-signup" onClick={() => change('signup')}>
                New here? Create an account
              </button>
              <button className="ghost" onClick={() => change('forgot')}>
                Forgot password?
              </button>
            </>
          ) : (
            <button className="ghost" onClick={() => change('signin')}>
              {mode === 'signup' ? 'Have an account? Sign in' : 'Back to sign in'}
            </button>
          )}
        </div>
      )}
    </main>
  );
}
