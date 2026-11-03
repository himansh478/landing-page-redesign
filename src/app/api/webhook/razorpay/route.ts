import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { markPurchasePaid } from '@/lib/raw-clip-packages';

// Set RAZORPAY_WEBHOOK_SECRET to the secret shown when you add this URL
// (/api/webhook/razorpay) as a webhook in Razorpay -> Settings -> Webhooks,
// subscribed to "payment.captured". Without it every webhook is rejected; the
// success page still confirms payments by asking Razorpay directly.
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';

function validSignature(body: string, signature: string) {
  const expected = crypto.createHmac('sha256', WEBHOOK_SECRET).update(body).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (!WEBHOOK_SECRET) {
    console.error('RAZORPAY_WEBHOOK_SECRET is not set; rejecting raw clips webhook.');
    return NextResponse.json({ success: false, error: 'Webhook not configured' }, { status: 500 });
  }

  try {
    const signature = request.headers.get('x-razorpay-signature');
    if (!signature) {
      return NextResponse.json({ success: false, error: 'Signature missing' }, { status: 400 });
    }

    const rawBody = await request.text();
    if (!validSignature(rawBody, signature)) {
      console.warn('Webhook Verification Failed!');
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    if (event === 'payment.captured') {
      const payment = payload.payload.payment.entity;
      const ok = await markPurchasePaid(payment.order_id, payment.id, Number(payment.amount));
      if (!ok) {
        // Unknown order or wrong amount: acknowledge so Razorpay stops retrying,
        // but the order stays unpaid.
        return NextResponse.json({ success: false, error: 'Order not marked paid' });
      }
      console.log(`Raw clips purchase confirmed for order ${payment.order_id}.`);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Webhook Error:', err);
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Error occurred' }, { status: 500 });
  }
}
