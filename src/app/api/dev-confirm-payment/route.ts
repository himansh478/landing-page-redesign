import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { RAW_CLIP_PACKAGES, isRawClipPackage, markPurchasePaid } from '@/lib/raw-clip-packages';

// Local testing only: pretends Razorpay captured the right amount for an order.
export async function POST(request: Request) {
  // Only allow this API to run in local development mode for security
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const { data: purchase, error: fetchError } = await supabaseAdmin
      .from('raw_clips_purchases')
      .select('package_type')
      .eq('order_id', orderId)
      .single();

    if (fetchError || !purchase) {
      return NextResponse.json({ success: false, error: 'Order not found in database' }, { status: 400 });
    }

    const pkg = isRawClipPackage(purchase.package_type) ? purchase.package_type : 'Starter';
    const ok = await markPurchasePaid(orderId, 'pay_dev_mock_12345', RAW_CLIP_PACKAGES[pkg].price * 100);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Could not mark the order paid.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Error' }, { status: 500 });
  }
}
