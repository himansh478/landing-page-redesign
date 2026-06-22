'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, CreditCard, Sparkles } from 'lucide-react';

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
        body: JSON.stringify({
          amount: price,
          packageType: packageType,
        }),
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
        handler: function (response: any) {
          // Redirect to success page on payment capture
          window.location.href = `/raw-clips/success?order_id=${orderData.orderId}`;
        },
        prefill: {
          name: form.name,
          email: form.email || undefined,
          contact: form.whatsapp,
        },
        theme: {
          color: '#6366f1', // Indigo theme color
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error('Payment Error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" 
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all">
            <X className="w-4 h-4" />
          </button>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 animate-pulse text-yellow-300" /> 
            Unlock Raw Clips
          </h2>
          <p className="text-indigo-100 mt-1 text-sm">
            Get lifetime access to {packageType} Raw Clips Library.
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={handlePayment} className="space-y-5">
            {/* Price Banner */}
            <div className="text-center bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100">
              <p className="text-slate-500 text-sm">Total Amount to Pay</p>
              <p className="text-5xl font-black text-indigo-600 my-1">₹{price}</p>
              <p className="text-slate-400 text-xs">One-time payment • Instant Download</p>
            </div>

            {/* Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">YOUR NAME *</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">WHATSAPP NUMBER *</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 9876543210"
                  value={form.whatsapp}
                  onChange={(e) => setForm(p => ({ ...p, whatsapp: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">EMAIL ADDRESS (OPTIONAL)</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:opacity-95 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Initializing Secure Payment...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Proceed to Payment
                </>
              )}
            </button>
            <p className="text-center text-xs text-slate-400">
              UPI, Cards, Netbanking, & Wallets accepted via Razorpay.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
