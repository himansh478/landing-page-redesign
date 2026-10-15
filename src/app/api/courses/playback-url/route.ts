import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getUserFromBearer } from '@/lib/auth-utils';
import { getVideoPlaybackUrl } from '@/lib/cloudinary-video';

// The one place video_key ever leaves the database. Issues a signed,
// expiring Cloudinary URL (a few minutes) for an "authenticated" video
// asset, and only after verifying the requester is allowed to watch this
// specific lesson.
export async function POST(request: Request) {
  try {
    const { lessonId } = await request.json();
    if (!lessonId) {
      return NextResponse.json({ success: false, error: 'lessonId is required.' }, { status: 400 });
    }

    const { data: lesson, error: lessonError } = await supabaseAdmin
      .from('lessons')
      .select('id, course_id, video_key, is_free_preview, status')
      .eq('id', lessonId)
      .single();

    if (lessonError || !lesson || lesson.status !== 'published') {
      return NextResponse.json({ success: false, error: 'Lesson not found.' }, { status: 404 });
    }

    if (!lesson.is_free_preview) {
      const user = await getUserFromBearer(request);
      if (!user) {
        return NextResponse.json({ success: false, error: 'Please log in.' }, { status: 401 });
      }

      const { data: purchase } = await supabaseAdmin
        .from('course_purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', lesson.course_id)
        .eq('status', 'SUCCESS')
        .maybeSingle();

      if (!purchase) {
        return NextResponse.json({ success: false, error: 'You have not purchased this course.' }, { status: 403 });
      }
    }

    const expiresIn = 300; // 5 minutes
    const url = getVideoPlaybackUrl(lesson.video_key, expiresIn);

    return NextResponse.json({ success: true, url, expiresIn });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to get playback URL.';
    console.error('Playback URL error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
