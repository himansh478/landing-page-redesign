'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, Download, Loader2, ArrowRight, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order_id');

  const [status, setStatus] = useState<'PENDING' | 'SUCCESS' | 'FAILED' | 'LOADING'>('LOADING');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [packageName, setPackageName] = useState<string>('Starter');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setErrorMsg('Invalid Order ID. Please check your purchase.');
      setStatus('FAILED');
      return;
    }

    let intervalId: NodeJS.Timeout;

    const checkPurchaseStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('raw_clips_purchases')
          .select('status, download_url, package_type')
          .eq('order_id', orderId)
          .single();

        if (error) {
          console.error('Error fetching purchase:', error);
          return;
        }

        if (data) {
          setPackageName(data.package_type);
          if (data.status === 'SUCCESS') {
            setStatus('SUCCESS');
            setDownloadUrl(data.download_url);
            clearInterval(intervalId);
          } else if (data.status === 'FAILED') {
            setStatus('FAILED');
            clearInterval(intervalId);
          } else {
            setStatus('PENDING');
          }
        }
      } catch (err) {
        console.error('Error in status check:', err);
      }
    };

    // Initial check
    checkPurchaseStatus();

    // Poll database every 2.5 seconds
    intervalId = setInterval(checkPurchaseStatus, 2500);

    // Timeout polling after 2 minutes to prevent infinite loops
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      if (status === 'PENDING' || status === 'LOADING') {
        setErrorMsg('Verification is taking longer than expected. Please refresh this page or contact support.');
      }
    }, 120000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [orderId, status]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        
        {/* Status: Loading / Checking */}
        {status === 'LOADING' && (
          <div className="space-y-4 py-8">
            <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto" />
            <h2 className="text-2xl font-bold">Verifying Order...</h2>
            <p className="text-slate-400 text-sm">Please wait while we locate your transaction.</p>
          </div>
        )}

        {/* Status: Pending Payment Hook */}
        {status === 'PENDING' && (
          <div className="space-y-4 py-8">
            <div className="relative w-16 h-16 mx-auto">
              <Loader2 className="absolute inset-0 w-16 h-16 animate-spin text-indigo-500" />
              <div className="absolute inset-2 bg-indigo-500/10 rounded-full animate-ping" />
            </div>
            <h2 className="text-2xl font-bold">Confirming Payment...</h2>
            <p className="text-slate-400 text-sm px-4">
              We are waiting for payment verification webhook from Razorpay. Keep this tab open.
            </p>
          </div>
        )}

        {/* Status: Success (Files Unlocked) */}
        {status === 'SUCCESS' && (
          <div className="space-y-6 py-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
              <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight text-emerald-400">Payment Verified!</h2>
              <p className="text-slate-300 text-sm">
                Thank you! Your {packageName} Raw Clips Package is ready.
              </p>
            </div>

            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-left text-xs text-slate-400 space-y-1">
              <p><span className="font-semibold text-slate-300">Order ID:</span> {orderId}</p>
              <p><span className="font-semibold text-slate-300">Validity:</span> Download link is active for 24 hours.</p>
            </div>

            {downloadUrl ? (
              <a
                href={downloadUrl}
                download
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 py-4 rounded-2xl font-extrabold text-lg hover:shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                Download 4K Raw Clips ZIP
              </a>
            ) : (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl text-yellow-500 text-sm text-left">
                Download URL could not be generated. Please contact support on WhatsApp.
              </div>
            )}

            <Link
              href="/"
              className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-semibold text-sm transition-all"
            >
              Go back to Home <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Status: Failed */}
        {status === 'FAILED' && (
          <div className="space-y-6 py-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-red-500">Verification Error</h2>
              <p className="text-slate-400 text-sm px-4">
                {errorMsg || 'We could not verify your payment. If you have completed the checkout, please contact our support team.'}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <a
                href="https://wa.me/917000000000?text=Hi%20Cwaya!%20My%20payment%20verification%20failed%20for%20order%20"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-slate-800 text-white py-3 rounded-2xl font-bold hover:bg-slate-700 transition-all"
              >
                Support on WhatsApp
              </a>
              <Link href="/raw-clips" className="text-sm text-slate-500 hover:text-slate-400 font-semibold py-2">
                Try Again
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
