'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, CreditCard, PlayCircle, X } from 'lucide-react';
import type { Course } from '@/types';

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
        theme: { color: '#6366f1' },
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
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm sticky top-24 space-y-5">
      {freePreviewLessonId && (
        <div>
          {previewUrl ? (
            <div className="relative">
              <video src={previewUrl} controls controlsList="nodownload" className="w-full aspect-video rounded-xl bg-black" />
              <button onClick={() => setPreviewUrl(null)} className="absolute top-2 right-2 bg-black/60 rounded-full p-1.5">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          ) : (
            <button
              onClick={loadPreview}
              disabled={previewLoading}
              className="w-full aspect-video rounded-xl bg-slate-900 flex items-center justify-center text-white gap-2 hover:bg-slate-800"
            >
              {previewLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <PlayCircle className="w-10 h-10" />}
              <span className="text-sm font-semibold">Watch free preview</span>
            </button>
          )}
        </div>
      )}

      <div>
        <p className="text-slate-500 text-sm">One-time payment</p>
        <p className="text-4xl font-black text-slate-900">₹{course.price}</p>
      </div>

      {checking ? (
        <div className="h-12 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
        </div>
      ) : owned ? (
        <a
          href={`/my-courses/${course.slug}`}
          className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700"
        >
          Go to your course
        </a>
      ) : (
        <button
          onClick={handleBuy}
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
          Buy Now
        </button>
      )}

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <p className="text-xs text-slate-400 text-center">Streams on this site only. No downloads.</p>
    </div>
  );
}
