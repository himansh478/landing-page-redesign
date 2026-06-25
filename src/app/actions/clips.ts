'use server';

import { supabase } from '@/lib/supabase';
import cloudinary from '@/lib/cloudinary';

// Sabhi active clips fetch karo
export async function getAllClips() {
  const { data, error } = await supabase
    .from('raw_clips')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    // Supabase table may not exist in local/dev environments.
    // Fail gracefully without spamming server logs; caller will fallback to demo clips.
    return [];
  }

  const clips = data || [];

  // Generate Cloudinary URLs dynamically for assets
  if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
    for (const clip of clips) {
      // 1. Generate thumbnail URL with auto optimization
      if (clip.r2_thumbnail_key) {
        clip.thumbnail_url = cloudinary.url(clip.r2_thumbnail_key, { 
          resource_type: 'image', 
          format: 'auto', 
          quality: 'auto' 
        });
      }

      // 2. Generate video URLs (high quality, direct download, no compression)
      if (clip.r2_video_key) {
        const keys = clip.r2_video_key.split(',').map(k => k.trim()).filter(Boolean);
        const urls = keys.map(key => {
          return cloudinary.url(key, { 
            resource_type: 'video',
            flags: 'attachment',
            secure: true
          });
        });
        (clip as any).video_urls = urls;
        
        // Backward compatibility
        if (clip.is_free) {
          clip.free_drive_url = urls.join(',');
        }
      } else {
        (clip as any).video_urls = [];
      }
    }
  }

  return clips;
}

// Unlock request submit karo (after UPI payment)
export async function submitUnlockRequest(input: {
  name: string;
  whatsapp: string;
  email?: string;
  upi_ref: string; // UPI transaction reference number
  website_url?: string; // honeypot
}) {
  // Honeypot
  if (input.website_url) return { success: false };

  if (!input.name || !input.whatsapp || !input.upi_ref) {
    return { success: false, error: 'Saari details bharein!' };
  }

  const { error } = await supabase.from('clip_unlock_requests').insert([
    {
      name: input.name,
      whatsapp: input.whatsapp,
      email: input.email || null,
      upi_ref: input.upi_ref,
      status: 'pending',
    },
  ]);

  if (error) {
    console.error('Unlock request error:', error);
    return { success: false, error: 'Submit nahi hua, dobara try karo.' };
  }

  return { success: true };
}

// Admin: sabhi unlock requests fetch karo
export async function getUnlockRequests() {
  const { data, error } = await supabase
    .from('clip_unlock_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
}

// Admin: request approve karo
export async function approveUnlockRequest(id: string) {
  const { error } = await supabase
    .from('clip_unlock_requests')
    .update({ status: 'approved' })
    .eq('id', id);

  return { success: !error };
}

// Admin: naya clip add karo
export async function addClip(input: {
  title: string;
  category: string;
  description?: string;
  thumbnail_url: string;
  free_drive_url?: string;
  paid_drive_url: string;
  duration?: string;
  tags?: string;
  is_free: boolean;
}) {
  const { error } = await supabase.from('raw_clips').insert([input]);
  return { success: !error, error: error?.message };
}

// Admin: clip delete karo
export async function deleteClip(id: string) {
  const { error } = await supabase
    .from('raw_clips')
    .update({ is_active: false })
    .eq('id', id);
  return { success: !error };
}

// Download count increment karo
export async function incrementDownload(id: string) {
  await supabase.rpc('increment_download', { clip_id: id });
}

// Paid clips ke download URLs generate karo after verification of purchase order
export async function getUnlockedVideoUrls(clipId: string, orderId: string) {
  try {
    // 1. Verify payment status in database
    const { data: purchase, error: purchaseError } = await supabase
      .from('raw_clips_purchases')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (purchaseError || !purchase || purchase.status !== 'SUCCESS') {
      return { success: false, error: 'Unauthorized: purchase not found or incomplete' };
    }

    // 2. Fetch the clip
    const { data: clip, error: clipError } = await supabase
      .from('raw_clips')
      .select('*')
      .eq('id', clipId)
      .single();

    if (clipError || !clip) {
      return { success: false, error: 'Clip not found' };
    }

    if (!clip.r2_video_key) {
      return { success: true, urls: [] };
    }

    // 3. Generate high quality secure attachment URLs
    const keys = clip.r2_video_key.split(',').map((k: string) => k.trim()).filter(Boolean);
    const urls = keys.map((key: string) => {
      return cloudinary.url(key, {
        resource_type: 'video',
        flags: 'attachment',
        secure: true
      });
    });

    return { success: true, urls };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
