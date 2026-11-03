'use client';

import { useEffect, useState, useSyncExternalStore, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Download, Loader2, ArrowRight, AlertTriangle, Play, Wrench, Send } from 'lucide-react';
import Link from 'next/link';
import { btnCoral, btnGhost } from '@/components/editorial/styles';

const noop = () => () => {};
const isLocalHost = () => window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const notLocalOnServer = () => false;

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  const [status, setStatus] = useState<'PENDING' | 'SUCCESS' | 'FAILED' | 'LOADING'>('LOADING');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [telegramUrl, setTelegramUrl] = useState<string | null>(null);
  const [packageName, setPackageName] = useState<string>('Starter');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // Check if we are on localhost
  const isLocal = useSyncExternalStore(noop, isLocalHost, notLocalOnServer);
  const [simulating, setSimulating] = useState(false);

  // Without an order ID there is nothing to verify.
  const shownStatus = orderId ? status : 'FAILED';
  const shownError = orderId ? errorMsg : 'Invalid Order ID. Please check your purchase.';

  useEffect(() => {
    if (!orderId) return;

    const checkPurchaseStatus = async () => {
      try {
        const res = await fetch(`/api/check-order?order_id=${orderId}`);
        const data = await res.json();

        if (!data.success) {
          console.error('Error fetching purchase:', data.error);
          return;
        }

        setPackageName(data.package_type);
        if (data.status === 'SUCCESS') {
          setStatus('SUCCESS');
          setDownloadUrl(data.download_url);
          setTelegramUrl(data.telegram_url ?? null);
          clearInterval(intervalId);
        } else if (data.status === 'FAILED') {
          setStatus('FAILED');
          clearInterval(intervalId);
        } else {
          setStatus('PENDING');
        }
      } catch (err) {
        console.error('Error in status check:', err);
      }
    };


    // Initial check
    checkPurchaseStatus();

    // Poll database every 2.5 seconds
    const intervalId = setInterval(checkPurchaseStatus, 2500);

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

  useEffect(() => {
    if (status === 'SUCCESS' && orderId) {
      localStorage.setItem('cwaya_order_id', orderId);
      localStorage.setItem('cwaya_unlocked_package', packageName);
    }
  }, [status, orderId, packageName]);

  // Simulate payment captured callback locally
  const handleSimulateSuccess = async () => {
    if (!orderId) return;
    setSimulating(true);
    try {
      const res = await fetch('/api/dev-confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('SUCCESS');
      } else {
        alert('Simulation failed: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Error running webhook simulator.');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="grain relative bg-ivory min-h-screen flex flex-col items-center justify-center px-4 pt-28 pb-20">
      <div className="relative z-10 w-full max-w-md bg-paper border border-ink/15 rounded-[4px] overflow-hidden shadow-[0_40px_80px_-40px_rgb(var(--ink-rgb)/0.5)]">
        <div className="h-1 bg-coral" aria-hidden="true" />
        <div className="p-7 sm:p-8 text-center space-y-6" aria-live="polite">
          <p className="slate text-editorial">Cwaya · RAW library</p>

          {/* Status: Loading / Checking */}
          {shownStatus === 'LOADING' && (
            <div className="space-y-4 py-6">
              <Loader2 className="w-12 h-12 animate-spin text-editorial mx-auto" aria-hidden="true" />
              <h2 className="font-display text-2xl font-extrabold text-ink tracking-[-0.03em]">Verifying Order...</h2>
              <p className="text-ink/65 text-sm">Please wait while we locate your transaction.</p>
            </div>
          )}

          {/* Status: Pending Payment Hook */}
          {shownStatus === 'PENDING' && (
            <div className="space-y-6 py-4">
              <Loader2 className="w-12 h-12 animate-spin text-editorial mx-auto" aria-hidden="true" />
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-extrabold text-ink tracking-[-0.03em]">Confirming Payment...</h2>
                <p className="text-ink/65 text-sm px-4">
                  We are waiting for payment verification webhook from Razorpay. Keep this tab open.
                </p>
              </div>

              {/* Developer simulation panel - only visible on localhost */}
              {isLocal && (
                <div className="mt-8 p-4 bg-ivory border border-dashed border-ink/25 rounded-[4px] text-center space-y-3">
                  <p className="slate text-ink/70 flex items-center justify-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5" aria-hidden="true" />
                    Developer Sandbox
                  </p>
                  <p className="text-xs text-ink/60">
                    Localhost is private so Razorpay cannot send webhooks here. Click below to bypass and verify instantly.
                  </p>
                  <button
                    type="button"
                    onClick={handleSimulateSuccess}
                    disabled={simulating}
                    className="w-full h-10 bg-editorial hover:bg-ink text-ivory text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
                  >
                    {simulating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                    )}
                    Simulate Webhook Success
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Status: Success (Files Unlocked) */}
          {shownStatus === 'SUCCESS' && (
            <div className="space-y-6 py-2">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-coral rounded-full">
                <CheckCircle2 className="w-8 h-8 text-ink" aria-hidden="true" />
              </div>

              <div className="space-y-2">
                <h2 className="font-display text-3xl font-extrabold text-ink tracking-[-0.03em]">Payment Verified!</h2>
                <p className="text-ink/70 text-sm">
                  Thank you! Your {packageName} Raw Clips Package is ready.
                </p>
              </div>

              <dl className="border-y border-ink/15 text-left text-xs text-ink/65 divide-y divide-ink/10">
                <div className="flex gap-3 py-2.5"><dt className="slate text-ink/50 w-20 flex-shrink-0">Order ID</dt><dd className="tabular break-all">{orderId}</dd></div>
                <div className="flex gap-3 py-2.5"><dt className="slate text-ink/50 w-20 flex-shrink-0">Validity</dt><dd>{telegramUrl ? 'Telegram link works for 24 hours, for one Telegram account. Later, send /myfiles to the bot.' : 'Download link is active for 24 hours.'}</dd></div>
              </dl>

              {telegramUrl ? (
                <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className={`${btnCoral} w-full`}>
                  <Send className="w-5 h-5" aria-hidden="true" />
                  Get files on Telegram
                </a>
              ) : downloadUrl ? (
                <a href={downloadUrl} download className={`${btnCoral} w-full`}>
                  <Download className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" aria-hidden="true" />
                  Download 4K Raw Clips ZIP
                </a>
              ) : (
                <div className="p-4 bg-sand/60 border border-ink/15 rounded-[4px] text-ink/80 text-sm text-left">
                  Download URL could not be generated. Please contact support on WhatsApp.
                </div>
              )}

              <Link href="/" className="pencil-link inline-flex items-center gap-2 text-ink font-semibold text-sm">
                Go back to Home <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          )}

          {/* Status: Failed */}
          {shownStatus === 'FAILED' && (
            <div className="space-y-6 py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-destructive/40 rounded-full">
                <AlertTriangle className="w-8 h-8 text-destructive" aria-hidden="true" />
              </div>

              <div className="space-y-2">
                <h2 className="font-display text-2xl font-extrabold text-ink tracking-[-0.03em]">Verification Error</h2>
                <p className="text-ink/65 text-sm px-4">
                  {shownError || 'We could not verify your payment. If you have completed the checkout, please contact our support team.'}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <a
                  href="https://wa.me/918120317074?text=Hi%20Cwaya!%20My%20payment%20verification%20failed%20for%20order%20"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${btnGhost} w-full`}
                >
                  Support on WhatsApp
                </a>
                <Link href="/raw-clips" className="pencil-link slate text-editorial py-2 self-center">
                  Try Again
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="bg-ivory min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-editorial" aria-label="Loading" />
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
