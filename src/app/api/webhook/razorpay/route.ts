import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';
import cloudinary from '@/lib/cloudinary';

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';

// Map package types to filenames in Cloudinary
const PACKAGE_FILES: Record<string, string> = {
  'Starter': 'raw-clips-starter.zip',
  'Pro': 'raw-clips-pro.zip',        
};

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('x-razorpay-signature');
    if (!signature) {
      return NextResponse.json({ success: false, error: 'Signature missing' }, { status: 400 });
    }

    const rawBody = await request.text();

    // Verify signature
    const shasum = crypto.createHmac('sha256', WEBHOOK_SECRET);
    shasum.update(rawBody);
    const digest = shasum.digest('hex');

    if (digest !== signature) {
      console.warn('Webhook Verification Failed!');
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 });
    }

    // Parsed payload
    const payload = JSON.parse(rawBody);
    const event = payload.event;

    console.log(`Razorpay Webhook Event Received: ${event}`);

    if (event === 'payment.captured') {
      const paymentEntity = payload.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;

      // 1. Fetch order details from database to see which package was bought
      const { data: purchaseData, error: fetchError } = await supabase
        .from('raw_clips_purchases')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (fetchError || !purchaseData) {
        console.error('Order not found in database for Order ID:', orderId);
        return NextResponse.json({ success: false, error: 'Order not found' }, { status: 400 });
      }

      const packageType = purchaseData.package_type;
      const fileKey = PACKAGE_FILES[packageType] || 'raw-clips-starter.zip';

      // 2. Generate secure expiring link (24 hours / 86400 seconds) from Cloudinary
      let downloadUrl = '';
      try {
        downloadUrl = cloudinary.utils.url(fileKey, {
          resource_type: 'raw',
          type: 'authenticated',
          sign_url: true,
          secure: true,
          expires_at: Math.floor(Date.now() / 1000) + 86400, // 24 hours
        });
      } catch (fbError) {
        console.error('Cloudinary Storage URL generation error:', fbError);
        // Fallback or handle it. Don't block DB update, but log it.
      }

      // 3. Update the DB record as SUCCESS and store payment_id & download_url
      const { error: updateError } = await supabase
        .from('raw_clips_purchases')
        .update({
          status: 'SUCCESS',
          payment_id: paymentId,
          download_url: downloadUrl || null,
        })
        .eq('order_id', orderId);

      if (updateError) {
        console.error('Database update failed:', updateError);
        return NextResponse.json({ success: false, error: 'Database update failed' }, { status: 500 });
      }

      console.log(`Purchase successful for Order: ${orderId}. R2 link generated.`);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Webhook Error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Error occurred' }, { status: 500 });
  }
}
