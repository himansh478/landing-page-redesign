'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, Loader2, ArrowRight, AlertTriangle, Play } from 'lucide-react';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  // orderId comes from the URL and is identical on the server and client
  // render, so it's safe to derive the initial status from it directly.
  const [status, setStatus] = useState<'PENDING' | 'SUCCESS' | 'FAILED' | 'LOADING'>(orderId ? 'LOADING' : 'FAILED');
  const [courseSlug, setCourseSlug] = useState<string | null>(null);
  const [isLocal, setIsLocal] = useState(false);
  const [simulating, setSimulating] = useState(false);

  // window.location reflects which machine is actually running the code,
  // which differs between the server render and the browser — this must
  // stay an effect (client-only) rather than a lazy useState initializer,
  // or it would wrongly freeze at the server's render on hydration.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLocal(hostname === 'localhost' || hostname === '127.0.0.1');
    }
  }, []);

  useEffect(() => {
    if (!orderId) return;

    const check = async () => {
      const { data } = await supabase
        .from('course_purchases')
        .select('status, course_id, courses(slug)')
        .eq('order_id', orderId)
        .single();

      if (!data) return;
      if (data.status === 'SUCCESS') {
        setStatus('SUCCESS');
        const courses = data.courses as unknown as { slug: string } | { slug: string }[] | null;
        const slug = Array.isArray(courses) ? courses[0]?.slug : courses?.slug;
        setCourseSlug(slug || null);
        clearInterval(intervalId);
      } else if (data.status === 'FAILED') {
        setStatus('FAILED');
        clearInterval(intervalId);
      } else {
        setStatus('PENDING');
      }
    };

    check();
    const intervalId = setInterval(check, 2500);
    const timeoutId = setTimeout(() => clearInterval(intervalId), 120000);
    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [orderId]);

  const handleSimulateSuccess = async () => {
    if (!orderId) return;
    setSimulating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/courses/dev-confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!data.success) alert('Simulation failed: ' + data.error);
    } catch {
      alert('Error running webhook simulator.');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        {(status === 'LOADING' || status === 'PENDING') && (
          <div className="space-y-4 py-6">
            <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto" />
            <h2 className="text-2xl font-bold">Confirming Payment...</h2>
            <p className="text-slate-400 text-sm px-4">Waiting for payment verification. Keep this tab open.</p>

            {isLocal && status === 'PENDING' && (
              <div className="mt-4 p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl space-y-3">
                <p className="text-xs text-indigo-300 font-semibold uppercase">🛠️ Developer Sandbox</p>
                <p className="text-[11px] text-slate-400">Localhost can&apos;t receive Razorpay webhooks. Simulate it instead.</p>
                <button
                  onClick={handleSimulateSuccess}
                  disabled={simulating}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {simulating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  Simulate Webhook Success
                </button>
              </div>
            )}
          </div>
        )}

        {status === 'SUCCESS' && (
          <div className="space-y-6 py-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
              <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            </div>
            <h2 className="text-3xl font-black text-emerald-400">Payment Verified!</h2>
            <p className="text-slate-300 text-sm">You now have access. Watch it only here — not downloadable.</p>
            <Link
              href={courseSlug ? `/my-courses/${courseSlug}` : '/my-courses'}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 py-3.5 px-6 rounded-2xl font-extrabold"
            >
              Start Watching <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {status === 'FAILED' && (
          <div className="space-y-6 py-6">
            <AlertTriangle className="w-14 h-14 text-red-500 mx-auto" />
            <h2 className="text-2xl font-bold text-red-500">Verification Error</h2>
            <p className="text-slate-400 text-sm">We couldn&apos;t verify this payment. Contact support if you were charged.</p>
            <Link href="/courses" className="text-sm text-slate-500 hover:text-slate-400 font-semibold">
              Back to Courses
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CourseSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <SuccessContent />
    </Suspense>
  );
}
