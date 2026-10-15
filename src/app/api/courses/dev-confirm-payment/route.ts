import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getUserFromBearer } from '@/lib/auth-utils';

// Local-development-only stand-in for the Razorpay webhook, which cannot
// reach localhost. Mirrors src/app/api/dev-confirm-payment/route.ts, but
// also checks the order belongs to the requesting user.
export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const user = await getUserFromBearer(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const { data: purchase, error: fetchError } = await supabaseAdmin
      .from('course_purchases')
      .select('*')
      .eq('order_id', orderId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !purchase) {
      return NextResponse.json({ success: false, error: 'Order not found for this user.' }, { status: 400 });
    }

    const { error: updateError } = await supabaseAdmin
      .from('course_purchases')
      .update({ status: 'SUCCESS', payment_id: 'pay_dev_mock_course' })
      .eq('order_id', orderId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
