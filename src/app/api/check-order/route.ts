import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    // Query database for the specific order.
    // This runs on the server, so we only return the specific requested row.
    const { data, error } = await supabase
      .from('raw_clips_purchases')
      .select('status, download_url, package_type')
      .eq('order_id', orderId)
      .single();

    if (error || !data) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      status: data.status,
      download_url: data.download_url,
      package_type: data.package_type,
    });
  } catch (err: any) {
    console.error('Check Order API Error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
