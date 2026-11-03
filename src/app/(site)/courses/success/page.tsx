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
    <div className="on-ink min-h-screen bg-ink text-ivory flex flex-col items-center justify-center px-4 pt-28 pb-16">
      <div className="w-full max-w-md border border-ivory/15 rounded-[4px] overflow-hidden" aria-live="polite">
        <div className={`h-1 ${status === 'FAILED' ? 'bg-destructive' : 'bg-coral'}`} aria-hidden="true" />
        <div className="p-8">
          {(status === 'LOADING' || status === 'PENDING') && (
            <div className="space-y-4 py-4">
              <p className="slate text-coral flex items-center gap-2">
                <span className="rec-dot w-1.5 h-1.5 rounded-full bg-coral" aria-hidden="true" />
                Rendering
              </p>
              <h1 className="font-display text-3xl font-extrabold tracking-[-0.03em]">Confirming payment…</h1>
              <p className="text-ivory/70">Waiting for payment verification. Keep this tab open.</p>
              <Loader2 className="w-6 h-6 animate-spin text-ivory/50" aria-hidden="true" />

              {isLocal && status === 'PENDING' && (
                <div className="mt-6 p-4 border border-dashed border-ivory/25 rounded-[4px] space-y-3">
                  <p className="slate text-ivory/60">Developer sandbox</p>
                  <p className="text-xs text-ivory/60">Localhost can&apos;t receive Razorpay webhooks. Simulate it instead.</p>
                  <button
                    onClick={handleSimulateSuccess}
                    disabled={simulating}
                    className="w-full h-10 bg-ivory text-ink !text-sm font-semibold rounded-md flex items-center justify-center gap-1.5 hover:bg-coral transition-colors disabled:opacity-50"
                  >
                    {simulating ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> : <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />}
                    Simulate webhook success
                  </button>
                </div>
              )}
            </div>
          )}

          {status === 'SUCCESS' && (
            <div className="space-y-5 py-2">
              <p className="slate text-coral flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Print it
              </p>
              <h1 className="font-display text-4xl font-extrabold tracking-[-0.035em]">Payment verified.</h1>
              <p className="text-ivory/75">You now have access. Watch it only here — not downloadable.</p>
              <Link
                href={courseSlug ? `/my-courses/${courseSlug}` : '/my-courses'}
                className="group inline-flex items-center gap-2 bg-coral text-ink h-12 px-6 rounded-md font-semibold transition-colors hover:bg-ivory"
              >
                Start watching
                <ArrowRight className="w-4 h-4 transition-transform duration-500 ease-reveal group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </div>
          )}

          {status === 'FAILED' && (
            <div className="space-y-5 py-2">
              <p className="slate text-ivory/60 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" aria-hidden="true" /> Verification error
              </p>
              <h1 className="font-display text-3xl font-extrabold tracking-[-0.03em]">We couldn&apos;t verify this payment.</h1>
              <p className="text-ivory/70">Contact support if you were charged.</p>
              <Link href="/courses" className="pencil-link inline-block font-semibold text-ivory">
                Back to courses
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CourseSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink" />}>
      <SuccessContent />
    </Suspense>
  );
}
