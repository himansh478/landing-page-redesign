import { settleOrder } from '@/captions/server/billing';
import { validWebhook } from '@/captions/server/razorpay';

// Razorpay's own message that a payment was captured. It covers buyers who close the
// tab before returning, and is safe alongside the browser's check: an order only ever
// credits once. Add this URL under Settings > Webhooks with the payment.captured event,
// and put its secret in RAZORPAY_CAPTION_WEBHOOK_SECRET.
export async function POST(request: Request) {
  const body = await request.text();
  if (!validWebhook(body, request.headers.get('x-razorpay-signature') ?? '')) {
    return Response.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  const { event, payload } = JSON.parse(body);
  if (event !== 'payment.captured') return Response.json({ ok: true });

  const { id, order_id: orderId, amount, currency } = payload.payment.entity;
  if (!orderId || currency !== 'INR') return Response.json({ ok: true });

  try {
    const result = await settleOrder(orderId, id, amount, null);
    // Other Cwaya products share this Razorpay account, so a stranger's order is ignored.
    if (!result.ok && result.reason !== 'unknown-order') console.error(`Order ${orderId} not credited: ${result.reason}`);
    return Response.json({ ok: true });
  } catch (e) {
    console.error('Webhook failed:', e);
    return Response.json({ error: 'Try again.' }, { status: 500 });
  }
}
