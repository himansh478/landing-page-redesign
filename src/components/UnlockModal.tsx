'use client';

import { useState, useEffect } from 'react';
import { Loader2, CreditCard } from 'lucide-react';
import { ModalShell } from './editorial/ModalShell';
import { btnCoral, fieldClass, labelClass } from './editorial/styles';

interface UnlockModalProps {
  onClose: () => void;
  price?: number;
}

export function UnlockModal({ onClose, price = 19 }: UnlockModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    whatsapp: '',
    email: '',
  });

  const packageType = price >= 99 ? 'Pro' : 'Starter';

  // Load Razorpay Standard Checkout Script dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.whatsapp) {
      setError('Please fill in Name and WhatsApp Number.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Call our API to create Razorpay Order
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Price is set on the server from the package; only the package is sent.
        body: JSON.stringify({ packageType }),
      });

      const orderData = await res.json();

      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to initialize payment.');
      }

      // 2. Configure and Open Razorpay Checkout Checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: 'INR',
        name: 'Cwaya Raw Clips',
        description: `${packageType} Raw Clips Library`,
        order_id: orderData.orderId,
        handler: function () {
          // Redirect to success page on payment capture
          window.location.href = `/raw-clips/success?order_id=${orderData.orderId}`;
        },
        prefill: {
          name: form.name,
          email: form.email || undefined,
          contact: form.whatsapp,
        },
        theme: {
          color: '#226192', // editorial blue
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      console.error('Payment Error:', err);
      setError((err instanceof Error && err.message) || 'Payment failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <ModalShell onClose={onClose} labelledBy="unlock-title" zClass="z-[9999]">
      {/* Header */}
      <div className="p-6 sm:p-7 pr-16 border-b border-ink/15">
        <p className="slate text-editorial mb-2">Cwaya · RAW library</p>
        <h2 id="unlock-title" className="font-display text-3xl font-extrabold text-ink tracking-[-0.03em]">
          Unlock Raw Clips
        </h2>
        <p className="text-ink/65 mt-1 text-sm">
          Get lifetime access to {packageType} Raw Clips Library.
        </p>
      </div>

      <div className="p-6 sm:p-7">
        <form onSubmit={handlePayment} className="space-y-5">
          {/* Price Banner */}
          <div className="text-center bg-ivory rounded-[4px] py-5 px-4 border border-ink/10">
            <p className="slate text-ink/55">Total Amount to Pay</p>
            <p className="font-display font-black text-ink tracking-[-0.05em] leading-none text-6xl tabular my-2">₹{price}</p>
            <p className="text-ink/55 text-xs">One-time payment • Instant Download</p>
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            <div>
              <label htmlFor="unlock-name" className={labelClass}>YOUR NAME *</label>
              <input
                id="unlock-name"
                type="text"
                placeholder="Enter your name"
                value={form.name}
                onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                className={fieldClass}
                required
              />
            </div>

            <div>
              <label htmlFor="unlock-whatsapp" className={labelClass}>WHATSAPP NUMBER *</label>
              <input
                id="unlock-whatsapp"
                type="tel"
                placeholder="e.g. +91 9876543210"
                value={form.whatsapp}
                onChange={(e) => setForm(p => ({ ...p, whatsapp: e.target.value }))}
                className={fieldClass}
                required
              />
            </div>

            <div>
              <label htmlFor="unlock-email" className={labelClass}>EMAIL ADDRESS (OPTIONAL)</label>
              <input
                id="unlock-email"
                type="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                className={fieldClass}
              />
            </div>
          </div>

          {error && <p role="alert" className="text-destructive text-sm text-center font-medium">{error}</p>}

          <button type="submit" disabled={isLoading} className={`${btnCoral} w-full`}>
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                Initializing Secure Payment...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" aria-hidden="true" />
                Proceed to Payment
              </>
            )}
          </button>
          <p className="text-center text-xs text-ink/55">
            UPI, Cards, Netbanking, &amp; Wallets accepted via Razorpay.
          </p>
        </form>
      </div>
    </ModalShell>
  );
}
