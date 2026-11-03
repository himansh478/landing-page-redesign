import { signInRequired, viewerOf } from '@/captions/server/auth';
import { settleOrder } from '@/captions/server/billing';
import { capturePayment, fetchPayment, validCheckout } from '@/captions/server/razorpay';

// Runs when the buyer's browser returns from Razorpay. Nothing it says is believed
// until the signature checks out and Razorpay itself confirms the payment.
export async function POST(request: Request) {
  const viewer = await viewerOf(request);
  if (!viewer) return signInRequired(request);

  const { orderId, paymentId, signature } = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (typeof orderId !== 'string' || typeof paymentId !== 'string' || typeof signature !== 'string') {
    return Response.json({ error: 'Bad request.' }, { status: 400 });
  }
  if (!validCheckout(orderId, paymentId, signature)) return Response.json({ error: 'This payment could not be verified.' }, { status: 400 });

  try {
    let payment = await fetchPayment(paymentId);
    if (payment.order_id !== orderId || payment.currency !== 'INR') return Response.json({ error: 'This payment could not be verified.' }, { status: 400 });

    if (payment.status === 'authorized') payment = await capturePayment(paymentId, payment.amount);
    if (payment.status !== 'captured') return Response.json({ error: 'The payment has not completed.' }, { status: 409 });

    const result = await settleOrder(orderId, paymentId, payment.amount, viewer.id);
    if (!result.ok) return Response.json({ error: 'This payment could not be applied.' }, { status: 400 });
    return Response.json({ ok: true });
  } catch (e) {
    console.error('Payment check failed:', e);
    return Response.json({ error: 'Could not confirm the payment yet. If you were charged, your minutes will arrive shortly.' }, { status: 502 });
  }
}
