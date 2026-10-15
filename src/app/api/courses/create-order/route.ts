import { NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getUserFromBearer } from '@/lib/auth-utils';

export async function POST(request: Request) {
  try {
    const user = await getUserFromBearer(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Please log in to buy this course.' }, { status: 401 });
    }

    const { courseId } = await request.json();
    if (!courseId) {
      return NextResponse.json({ success: false, error: 'courseId is required.' }, { status: 400 });
    }

    // Price always comes from the database, never trust a client-supplied amount.
    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .select('id, price, title, published')
      .eq('id', courseId)
      .eq('published', true)
      .single();

    if (courseError || !course) {
      return NextResponse.json({ success: false, error: 'Course not found.' }, { status: 404 });
    }

    // Already own it? Don't let them pay twice.
    const { data: existing } = await supabaseAdmin
      .from('course_purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .eq('status', 'SUCCESS')
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: false, error: 'You already own this course.' }, { status: 400 });
    }

    const amountInPaise = Math.round(Number(course.price) * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `course_${Date.now()}`,
    });

    if (!order || !order.id) {
      throw new Error('Failed to create order in Razorpay.');
    }

    const { error: dbError } = await supabaseAdmin.from('course_purchases').insert([{
      user_id: user.id,
      course_id: course.id,
      order_id: order.id,
      amount: course.price,
      status: 'PENDING',
    }]);

    if (dbError) {
      console.error('Supabase insert error:', dbError);
      throw new Error('Failed to log order in database.');
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      keyId: process.env.RAZORPAY_KEY_ID || '',
      courseTitle: course.title,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Something went wrong.';
    console.error('Course create-order API error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
