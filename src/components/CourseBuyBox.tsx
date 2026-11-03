'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, ArrowRight, Play, X, ShieldCheck } from 'lucide-react';
import type { Course } from '@/types';
import { Magnetic } from './motion/Magnetic';

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function CourseBuyBox({ course, freePreviewLessonId }: { course: Course; freePreviewLessonId: string | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [owned, setOwned] = useState(false);
  const [checking, setChecking] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const checkOwnership = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setChecking(false);
        return;
      }
      const { data } = await supabase
        .from('course_purchases')
        .select('id')
        .eq('course_id', course.id)
        .eq('status', 'SUCCESS')
        .maybeSingle();
      setOwned(!!data);
      setChecking(false);
    };
    checkOwnership();
  }, [course.id]);

  const loadPreview = async () => {
    if (!freePreviewLessonId) return;
    setPreviewLoading(true);
    try {
      const res = await fetch('/api/courses/playback-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: freePreviewLessonId }),
      });
      const data = await res.json();
      if (data.success) setPreviewUrl(data.url);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleBuy = async () => {
    setError(null);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push(`/login?redirect=/courses/${course.slug}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/courses/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ courseId: course.id }),
      });
      const orderData = await res.json();
      if (!orderData.success) throw new Error(orderData.error || 'Failed to start checkout.');

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: 'INR',
        name: 'Cwaya Courses',
        description: course.title,
        order_id: orderData.orderId,
        handler: function () {
          router.push(`/courses/success?order_id=${orderData.orderId}`);
        },
        prefill: { email: session.user.email || undefined },
        theme: { color: '#226192' },
        modal: { ondismiss: function () { setLoading(false); } },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Payment failed.');
      setLoading(false);
    }
  };

  return (
    <aside className="lg:sticky lg:top-28 bg-paper border border-ink/15 rounded-[4px] overflow-hidden" aria-label="Purchase">
      {freePreviewLessonId && (
        <div className="relative aspect-video bg-ink">
          {previewUrl ? (
            <>
              <video src={previewUrl} controls controlsList="nodownload" autoPlay className="w-full h-full" />
              <button
                onClick={() => setPreviewUrl(null)}
                aria-label="Close preview"
                className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-ink/70 text-ivory hover:bg-ink"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </>
          ) : (
            <button
              onClick={loadPreview}
              disabled={previewLoading}
              className="group absolute inset-0 w-full flex flex-col items-center justify-center gap-3 text-ivory"
              style={{
                background:
                  'radial-gradient(60% 80% at 70% 30%, rgb(var(--editorial-rgb) / 0.9), transparent 65%), radial-gradient(40% 60% at 25% 80%, rgb(var(--coral-rgb) / 0.55), transparent 60%), var(--ink)',
              }}
            >
              <span className="w-16 h-16 rounded-full bg-ivory text-ink flex items-center justify-center transition-transform duration-500 ease-reveal group-hover:scale-110">
                {previewLoading ? <Loader2 className="w-6 h-6 animate-spin" aria-hidden="true" /> : <Play className="w-6 h-6 ml-1 fill-current" aria-hidden="true" />}
              </span>
              <span className="slate text-ivory/85">Watch free preview</span>
            </button>
          )}
          <span aria-hidden="true" className="absolute top-3 left-3 slate !text-[10px] bg-ink/70 text-ivory px-2 py-1 rounded-[3px] flex items-center gap-1.5 pointer-events-none">
            <span className="rec-dot w-1.5 h-1.5 rounded-full bg-coral" /> Preview
          </span>
        </div>
      )}

      <div className="p-6 sm:p-7">
        <p className="slate text-ink/55">One-time payment</p>
        <p className="font-display font-black text-ink tracking-[-0.05em] leading-none mt-2 mb-6 text-6xl tabular">₹{course.price}</p>

        {checking ? (
          <div className="h-14 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-ink/40" aria-label="Checking your access" />
          </div>
        ) : owned ? (
          <a
            href={`/my-courses/${course.slug}`}
            className="group w-full inline-flex items-center justify-center gap-2 bg-editorial text-ivory h-14 rounded-md font-semibold transition-colors hover:bg-ink"
          >
            Go to your course
            <ArrowRight className="w-5 h-5 transition-transform duration-500 ease-reveal group-hover:translate-x-1" aria-hidden="true" />
          </a>
        ) : (
          <Magnetic strength={0.15} className="w-full">
            <button
              onClick={handleBuy}
              disabled={loading}
              className="group w-full bg-coral text-ink h-14 rounded-md font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-ink hover:text-ivory disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : null}
              Buy now
              {!loading && <ArrowRight className="w-5 h-5 transition-transform duration-500 ease-reveal group-hover:translate-x-1" aria-hidden="true" />}
            </button>
          </Magnetic>
        )}

        {error && (
          <p role="alert" className="text-destructive text-sm mt-3">
            {error}
          </p>
        )}

        <p className="flex items-center gap-2 text-xs text-ink/60 mt-5 pt-5 border-t border-ink/10">
          <ShieldCheck className="w-4 h-4 text-editorial flex-shrink-0" aria-hidden="true" />
          Streams on this site only. No downloads.
        </p>
      </div>
    </aside>
  );
}
