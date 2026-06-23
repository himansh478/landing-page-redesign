import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getPreSignedDownloadUrl } from '@/lib/r2';

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

    // 1. Fetch order details from database
    const { data: purchaseData, error: fetchError } = await supabase
      .from('raw_clips_purchases')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (fetchError || !purchaseData) {
      return NextResponse.json({ success: false, error: 'Order not found in database' }, { status: 400 });
    }

    // 2. Generate secure expiring link from R2
    const fileKey = purchaseData.package_type === 'Pro' ? 'raw-clips-pro.zip' : 'raw-clips-starter.zip';
    let downloadUrl = '';
    try {
      downloadUrl = await getPreSignedDownloadUrl(fileKey, 86400);
    } catch (r2Error) {
      console.warn('R2 URL generation skipped or failed during dev mock. Using a placeholder.');
      downloadUrl = 'https://example.com/demo-download.zip'; // Fallback if R2 credentials aren't ready
    }

    // 3. Mark DB record as SUCCESS
    const { error: updateError } = await supabase
      .from('raw_clips_purchases')
      .update({
        status: 'SUCCESS',
        payment_id: 'pay_dev_mock_12345',
        download_url: downloadUrl,
      })
      .eq('order_id', orderId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
