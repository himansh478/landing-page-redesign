import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import cloudinary from '@/lib/cloudinary';

// Signs a Cloudinary upload request server-side so the admin's browser can
// upload a video directly to Cloudinary without ever seeing the API secret.
// type: 'authenticated' is part of the SIGNED parameters, so the uploaded
// video is private by construction — enforced by this code, not by a
// dashboard preset setting someone could accidentally leave as "Public".
export async function POST(req: Request) {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session')?.value;
  if (adminSession !== 'true') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { courseId } = await req.json();
    if (!courseId) {
      return NextResponse.json({ success: false, error: 'courseId is required.' }, { status: 400 });
    }

    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!apiKey || !apiSecret || !cloudName) {
      return NextResponse.json({ success: false, error: 'Cloudinary env vars missing on the server.' }, { status: 500 });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `courses/${courseId}`;
    const type = 'authenticated';

    const signature = cloudinary.utils.api_sign_request({ timestamp, type, folder }, apiSecret);

    return NextResponse.json({ success: true, signature, timestamp, apiKey, cloudName, folder, type });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to sign upload.';
    console.error('Sign upload error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
