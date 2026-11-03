import { createHmac, timingSafeEqual } from 'node:crypto';

type Payment = { id: string; order_id: string; amount: number; currency: string; status: string };

export const paymentsOn = () => !!process.env.RAZORPAY_KEY_ID && !!process.env.RAZORPAY_KEY_SECRET;

async function call<T>(path: string, init?: RequestInit) {
  const base = process.env.RAZORPAY_API_URL || 'https://api.razorpay.com';
  const key = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
  const res = await fetch(`${base}/v1${path}`, { ...init, headers: { Authorization: `Basic ${key}`, 'Content-Type': 'application/json' } });
  if (!res.ok) throw new Error(`Razorpay said ${res.status}`);
  return (await res.json()) as T;
}

export const createOrder = (amountPaise: number, receipt: string) =>
  call<{ id: string }>('/orders', { method: 'POST', body: JSON.stringify({ amount: amountPaise, currency: 'INR', receipt }) });

export const fetchPayment = (id: string) => call<Payment>(`/payments/${encodeURIComponent(id)}`);

export const capturePayment = (id: string, amountPaise: number) =>
  call<Payment>(`/payments/${encodeURIComponent(id)}/capture`, { method: 'POST', body: JSON.stringify({ amount: amountPaise, currency: 'INR' }) });

const signed = (secret: string, message: string, given: string) => {
  const expected = createHmac('sha256', secret).update(message).digest();
  const actual = Buffer.from(given, 'hex');
  return expected.length === actual.length && timingSafeEqual(expected, actual);
};

/** Proves a browser's "payment succeeded" really came from Razorpay's checkout. */
export const validCheckout = (order: string, payment: string, signature: string) => signed(process.env.RAZORPAY_KEY_SECRET ?? '', `${order}|${payment}`, signature);

/** An unset secret must refuse everything, never accept an empty signature. */
export function validWebhook(body: string, signature: string) {
  const secret = process.env.RAZORPAY_CAPTION_WEBHOOK_SECRET;
  return !!secret && signed(secret, body, signature);
}
