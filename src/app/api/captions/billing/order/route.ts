import { isPlan, PLANS } from '@/captions/lib/plans';
import { signInRequired, viewerOf } from '@/captions/server/auth';
import { openOrder } from '@/captions/server/billing';
import { createOrder, paymentsOn } from '@/captions/server/razorpay';

// The plan alone comes from the browser. Price and minutes always come from plans.ts.
export async function POST(request: Request) {
  const viewer = await viewerOf(request);
  if (!viewer) return signInRequired(request);
  if (!paymentsOn()) return Response.json({ error: 'Payments are not switched on yet.' }, { status: 503 });

  const { plan: id } = (await request.json().catch(() => ({}))) as { plan?: unknown };
  if (!isPlan(id)) return Response.json({ error: 'Unknown plan.' }, { status: 400 });

  const plan = PLANS[id];
  const amount = plan.price * 100;
  try {
    const order = await createOrder(amount, `cap_${viewer.id.slice(0, 8)}_${Date.now()}`);
    await openOrder(order.id, viewer.id, id, amount, plan.minutes * 60, plan.days);
    return Response.json({ orderId: order.id, amount, currency: 'INR', keyId: process.env.RAZORPAY_KEY_ID, name: plan.name });
  } catch (e) {
    console.error('Order failed:', e);
    return Response.json({ error: 'Could not start the payment. Please try again.' }, { status: 502 });
  }
}
