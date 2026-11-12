import { signInRequired, viewerOf } from '@/captions/server/auth';
import { accountHistory, accountState } from '@/captions/server/billing';
import { FREE_MINUTES } from '@/captions/lib/plans';
import { paymentsOn } from '@/captions/server/razorpay';
import { accountsOn } from '@/captions/server/supabase';

const NO_WATERMARK_EMAILS = [
  'sudhanshugour89@gmail.com',
  'himanshgour7@gmail.com',
];

export async function GET(request: Request) {
  const viewer = await viewerOf(request);
  if (!viewer) return signInRequired(request);
  if (!accountsOn()) return Response.json({ error: 'Accounts are off.' }, { status: 404 });

  const [state, history] = await Promise.all([accountState(viewer.id), accountHistory(viewer.id)]);
  const isVip = !!viewer.email && NO_WATERMARK_EMAILS.includes(viewer.email.toLowerCase());
  const watermark = isVip ? false : state.watermark;

  return Response.json({ email: viewer.email, freeMinutes: FREE_MINUTES, paymentsReady: paymentsOn(), ...state, watermark, ...history });
}
