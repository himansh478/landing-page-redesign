import { NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { RAW_CLIP_PACKAGES, isRawClipPackage } from '@/lib/raw-clip-packages';

export async function POST(request: Request) {
  try {
    // Only the package name is trusted from the browser; its price comes from
    // the server, so the amount can't be edited client-side.
    const { packageType } = await request.json();

    if (!isRawClipPackage(packageType)) {
      return NextResponse.json(
        { success: false, error: 'Unknown package. Choose Starter or Pro.' },
        { status: 400 }
      );
    }

    const amount = RAW_CLIP_PACKAGES[packageType].price;

    // Razorpay accepts amount in paise (e.g. Rs 99 = 9900 paise)
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: { product: 'raw_clips', package_type: packageType },
    });

    if (!order || !order.id) {
      throw new Error('Failed to create order in Razorpay.');
    }

    const { error: dbError } = await supabaseAdmin
      .from('raw_clips_purchases')
      .insert([
        {
          order_id: order.id,
          amount,
          package_type: packageType,
          status: 'PENDING',
        },
      ]);

    if (dbError) {
      console.error('Supabase insert error:', dbError);
      throw new Error('Failed to log order in database.');
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      keyId: process.env.RAZORPAY_KEY_ID || '',
    });
  } catch (err: unknown) {
    console.error('Create Order API Error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Something went wrong.' },
      { status: 500 }
    );
  }
}
