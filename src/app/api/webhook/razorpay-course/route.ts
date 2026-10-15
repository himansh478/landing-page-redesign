import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Separate webhook endpoint from /api/webhook/razorpay (raw clips) so the
// two product flows never interfere with each other. Register this exact
// URL as its own webhook destination in the Razorpay dashboard (Settings ->
// Webhooks -> Add New Webhook) and use the secret it gives you for
// RAZORPAY_COURSE_WEBHOOK_SECRET. Subscribe it to the "payment.captured" event.
const WEBHOOK_SECRET = process.env.RAZORPAY_COURSE_WEBHOOK_SECRET || '';

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('x-razorpay-signature');
    if (!signature) {
      return NextResponse.json({ success: false, error: 'Signature missing' }, { status: 400 });
    }

    const rawBody = await request.text();

    const shasum = crypto.createHmac('sha256', WEBHOOK_SECRET);
    shasum.update(rawBody);
    const digest = shasum.digest('hex');

    if (digest !== signature) {
      console.warn('Course webhook verification failed!');
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    if (event === 'payment.captured') {
      const paymentEntity = payload.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;

      const { error: updateError } = await supabaseAdmin
        .from('course_purchases')
        .update({ status: 'SUCCESS', payment_id: paymentId })
        .eq('order_id', orderId);

      if (updateError) {
        console.error('Course webhook DB update failed:', updateError);
        return NextResponse.json({ success: false, error: 'Database update failed' }, { status: 500 });
      }

      console.log(`Course purchase successful for order: ${orderId}`);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error occurred';
    console.error('Course webhook error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
