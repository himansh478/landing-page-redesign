import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2, isR2Configured, getPreSignedUploadUrl } from '@/lib/r2';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB
const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_VIDEO_TYPES = [
  'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm',
  'video/x-matroska', 'video/mpeg',
];
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/avif',
];

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100);
}

export async function POST(req: NextRequest) {
  // 1. Check admin auth
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session')?.value;
  if (adminSession !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Check R2 is configured
  if (!isR2Configured()) {
    return NextResponse.json(
      { error: 'Cloudflare R2 is not configured. Add R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY to your environment variables.' },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();

    // 3. Extract fields
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const description = (formData.get('description') as string) || '';
    const duration = (formData.get('duration') as string) || '';
    const tags = (formData.get('tags') as string) || '';
    const isFree = formData.get('is_free') === 'true';
    const videoFile = formData.get('video') as File | null;
    const thumbnailFile = formData.get('thumbnail') as File | null;

    // 4. Validate required fields
    if (!title || !category) {
      return NextResponse.json({ error: 'Title aur category required hain.' }, { status: 400 });
    }

    if (!videoFile && !thumbnailFile) {
      return NextResponse.json({ error: 'Video ya thumbnail file upload karo.' }, { status: 400 });
    }

    const timestamp = Date.now();
    let videoKey = '';
    let thumbnailKey = '';
    let thumbnailUrl = '';

    // 5. Upload thumbnail to R2
    if (thumbnailFile) {
      if (!ALLOWED_IMAGE_TYPES.includes(thumbnailFile.type)) {
        return NextResponse.json({ error: 'Invalid thumbnail type. JPG, PNG, WebP allowed.' }, { status: 400 });
      }
      if (thumbnailFile.size > MAX_THUMBNAIL_SIZE) {
        return NextResponse.json({ error: 'Thumbnail 5MB se zyada nahi ho sakti.' }, { status: 400 });
      }

      const ext = thumbnailFile.name.split('.').pop() || 'jpg';
      thumbnailKey = `thumbnails/${timestamp}-${sanitizeFilename(title)}.${ext}`;
      const thumbBuffer = Buffer.from(await thumbnailFile.arrayBuffer());
      const thumbResult = await uploadToR2(thumbBuffer, thumbnailKey, thumbnailFile.type);

      if (!thumbResult.success) {
        return NextResponse.json({ error: `Thumbnail upload failed: ${thumbResult.error}` }, { status: 500 });
      }
      // Generate a download URL for the thumbnail (long-lived = 7 days)
      const { getPreSignedDownloadUrl } = await import('@/lib/r2');
      thumbnailUrl = await getPreSignedDownloadUrl(thumbnailKey, 7 * 24 * 3600);
    }

    // 6. Upload video to R2
    let videoUrl = '';
    if (videoFile) {
      if (!ALLOWED_VIDEO_TYPES.includes(videoFile.type)) {
        return NextResponse.json({ error: 'Invalid video type. MP4, MOV, AVI, WebM, MKV allowed.' }, { status: 400 });
      }
      if (videoFile.size > MAX_VIDEO_SIZE) {
        return NextResponse.json({ error: 'Video 500MB se zyada nahi ho sakti.' }, { status: 400 });
      }

      const ext = videoFile.name.split('.').pop() || 'mp4';
      videoKey = `clips/${timestamp}-${sanitizeFilename(title)}.${ext}`;
      const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
      const videoResult = await uploadToR2(videoBuffer, videoKey, videoFile.type);

      if (!videoResult.success) {
        return NextResponse.json({ error: `Video upload failed: ${videoResult.error}` }, { status: 500 });
      }
      videoUrl = videoKey; // Store key, generate signed URL on demand
    }

    // 7. Save entry in Supabase
    const clipData: Record<string, unknown> = {
      title,
      category,
      description,
      duration,
      tags,
      is_free: isFree,
      is_active: true,
      thumbnail_url: thumbnailUrl || '',
      r2_thumbnail_key: thumbnailKey || null,
      r2_video_key: videoKey || null,
      download_count: 0,
    };

    // For free clips, set the drive URL to the R2 video key
    if (isFree && videoKey) {
      clipData.free_drive_url = videoKey;
    } else if (videoKey) {
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
    console.error('Upload clip error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET: Generate a pre-signed upload URL for large files (client-side direct upload)
 */
export async function GET(req: NextRequest) {
  // Check admin auth
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session')?.value;
  if (adminSession !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const filename = searchParams.get('filename');
  const contentType = searchParams.get('contentType');
  const folder = searchParams.get('folder') || 'clips';

  if (!filename || !contentType) {
    return NextResponse.json({ error: 'filename and contentType required' }, { status: 400 });
  }

  try {
    const key = `${folder}/${Date.now()}-${sanitizeFilename(filename)}`;
    const uploadUrl = await getPreSignedUploadUrl(key, contentType);

    return NextResponse.json({ uploadUrl, key });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
