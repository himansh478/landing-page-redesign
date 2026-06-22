import { NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { amount, packageType } = await request.json();

    if (!amount || !packageType) {
      return NextResponse.json(
        { success: false, error: 'Amount and packageType are required.' },
        { status: 400 }
      );
    }

    // Razorpay accepts amount in paise (e.g. Rs 99 = 9900 paise)
    const amountInPaise = Math.round(amount * 100);

    // 1. Create the order in Razorpay
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    if (!order || !order.id) {
      throw new Error('Failed to create order in Razorpay.');
    }

    // 2. Insert the pending purchase order in Supabase database
    const { error: dbError } = await supabase
      .from('raw_clips_purchases')
      .insert([
        {
          order_id: order.id,
          amount: amount,
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
  } catch (err: any) {
    console.error('Create Order API Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Something went wrong.' },
      { status: 500 }
    );
  }
}
