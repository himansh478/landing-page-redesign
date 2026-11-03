import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { confirmWithRazorpay } from '@/lib/raw-clip-packages';
import { packageMessageIds, paidTelegramLink, telegramConfigured } from '@/lib/telegram';

type Row = { status: string; download_url: string | null; package_type: string };

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const read = () =>
      supabaseAdmin
        .from('raw_clips_purchases')
        .select('status, download_url, package_type')
        .eq('order_id', orderId)
        .single<Row>();

    let { data, error } = await read();

    if (error || !data) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Still pending: ask Razorpay directly instead of waiting only on the
    // webhook. Marks the order paid if a matching captured payment exists.
    if (data.status === 'PENDING' && (await confirmWithRazorpay(orderId))) {
      ({ data, error } = await read());
      if (error || !data) {
        return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
      }
    }

    const paid = data.status === 'SUCCESS';

    // Package files on Telegram: hand out a one-time bot link (reused while valid).
    let telegramUrl: string | null = null;
    if (paid && telegramConfigured() && (await packageMessageIds(data.package_type)).length > 0) {
      telegramUrl = await paidTelegramLink(orderId, 'package');
    }

    return NextResponse.json({
      success: true,
      status: data.status,
      // Download links are only handed out once the order is paid.
      download_url: paid ? data.download_url : null,
      telegram_url: telegramUrl,
      package_type: data.package_type,
    });
  } catch (err: unknown) {
    console.error('Check Order API Error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
