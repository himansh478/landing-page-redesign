import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  // 1. Check admin auth
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session')?.value;
  if (adminSession !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await req.json();
    const { title, category, description, duration, tags, isFree, videoKey, thumbnailKey } = payload;

    // 2. Validate required fields
    if (!title || !category) {
      return NextResponse.json({ error: 'Title aur category required hain.' }, { status: 400 });
    }

    if (!videoKey || !thumbnailKey) {
      return NextResponse.json({ error: 'Video key aur thumbnail key required hain.' }, { status: 400 });
    }

    // 3. Save entry in Supabase
    const clipData: Record<string, unknown> = {
      title,
      category,
      description: description || '',
      duration: duration || '',
      tags: tags || '',
      is_free: isFree,
      is_active: true,
      thumbnail_url: '', // We generate signed URLs dynamically in getAllClips()
      r2_thumbnail_key: thumbnailKey,
      r2_video_key: videoKey,
      download_count: 0,
    };

    // Set corresponding drive URL fields to the Firebase key
    if (isFree) {
      clipData.free_drive_url = videoKey;
    } else {
      clipData.paid_drive_url = videoKey;
    }

    const { data, error } = await supabase
      .from('raw_clips')
      .insert([clipData])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      clip: data,
      message: 'Clip successfully upload ho gaya!',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Upload clip API error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
