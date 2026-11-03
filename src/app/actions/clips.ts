'use server';

import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import cloudinary from '@/lib/cloudinary';
import { botLink, paidTelegramLink, telegramConfigured } from '@/lib/telegram';
import { checkAdminAuth } from './auth';

async function requireAdmin() {
  if (!(await checkAdminAuth())) throw new Error('Unauthorized');
}

type ClipRow = {
  id: string;
  title: string;
  category: string;
  description?: string;
  duration?: string;
  tags?: string;
  is_free: boolean;
  is_active: boolean;
  download_count?: number;
  created_at: string;
  r2_thumbnail_key?: string | null;
  r2_video_key?: string | null;
  thumbnail_url?: string | null;
  free_drive_url?: string | null;
  paid_drive_url?: string | null;
  telegram_message_ids?: number[] | null;
};

// What the browser receives: no storage keys, and download links only for free clips.
export type PublicClip = Omit<
  ClipRow,
  'r2_thumbnail_key' | 'r2_video_key' | 'thumbnail_url' | 'free_drive_url' | 'paid_drive_url' | 'telegram_message_ids'
> & {
  thumbnail_url: string;
  video_urls: string[];
  free_drive_url?: string;
  /** The file is delivered by the Telegram bot */
  on_telegram: boolean;
  /** Free clips only: opens the bot, which sends the clip */
  telegram_url?: string;
};

const videoUrlsFor = (videoKey: string | null | undefined) =>
  (videoKey || '')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean)
    .map((key) => cloudinary.url(key, { resource_type: 'video', flags: 'attachment', secure: true }));

// Sabhi active clips fetch karo — public list.
// Paid clips never include their video keys or download links here; those are
// only handed out by getUnlockedVideoUrls() after a verified purchase.
export async function getAllClips(): Promise<PublicClip[]> {
  // Server key: raw_clips is locked to the browser (anon) key by RLS.
  const { data, error } = await supabaseAdmin
    .from('raw_clips')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    // Supabase table may not exist in local/dev environments.
    // Fail gracefully without spamming server logs; caller will fallback to demo clips.
    return [];
  }

  const hasCloudinary = !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  return ((data || []) as ClipRow[]).map((row): PublicClip => {
    // Strip storage keys and any stored download links before anything leaves the server
    const { r2_video_key, r2_thumbnail_key, paid_drive_url: _paid, free_drive_url, telegram_message_ids, ...rest } = row;
    void _paid;
    const on_telegram = telegramConfigured() && (telegram_message_ids?.length ?? 0) > 0;

    const thumbnail_url =
      hasCloudinary && r2_thumbnail_key
        ? cloudinary.url(r2_thumbnail_key, { resource_type: 'image', format: 'auto', quality: 'auto' })
        : row.thumbnail_url ?? '';

    if (!row.is_free) {
      return { ...rest, thumbnail_url, video_urls: [], on_telegram };
    }

    const video_urls = hasCloudinary ? videoUrlsFor(r2_video_key) : [];
    return {
      ...rest,
      thumbnail_url,
      video_urls,
      free_drive_url: video_urls.length ? video_urls.join(',') : free_drive_url ?? undefined,
      on_telegram,
      telegram_url: on_telegram ? botLink(`f_${row.id}`) : undefined,
    };
  });
}

// One-time Telegram link for a paid clip, after checking the order is paid.
// Returns null when the clip isn't on Telegram (caller falls back to Cloudinary).
export async function getPaidClipTelegramLink(clipId: string, orderId: string): Promise<string | null> {
  if (!telegramConfigured()) return null;

  const { data: purchase } = await supabaseAdmin
    .from('raw_clips_purchases')
    .select('status')
    .eq('order_id', orderId)
    .maybeSingle();
  if (purchase?.status !== 'SUCCESS') return null;

  const { data: clip } = await supabaseAdmin
    .from('raw_clips')
    .select('is_free, is_active, telegram_message_ids')
    .eq('id', clipId)
    .maybeSingle();
  if (!clip || clip.is_free || !clip.is_active || !(clip.telegram_message_ids as number[] | null)?.length) return null;

  return paidTelegramLink(orderId, 'paid_clip', clipId);
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
  await requireAdmin();
  const { data, error } = await supabaseAdmin
    .from('clip_unlock_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
}

// Admin: request approve karo
export async function approveUnlockRequest(id: string) {
  await requireAdmin();
  const { error } = await supabaseAdmin
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
  await requireAdmin();
  const { error } = await supabaseAdmin.from('raw_clips').insert([input]);
  return { success: !error, error: error?.message };
}

// Admin: clip delete karo
export async function deleteClip(id: string) {
  await requireAdmin();
  const { error } = await supabaseAdmin
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
    // 1. Verify payment status in database (server key: unaffected by RLS)
    const { data: purchase, error: purchaseError } = await supabaseAdmin
      .from('raw_clips_purchases')
      .select('status')
      .eq('order_id', orderId)
      .single();

    if (purchaseError || !purchase || purchase.status !== 'SUCCESS') {
      return { success: false, error: 'Unauthorized: purchase not found or incomplete' };
    }

    // 2. Fetch the clip
    const { data: clip, error: clipError } = await supabaseAdmin
      .from('raw_clips')
      .select('r2_video_key')
      .eq('id', clipId)
      .eq('is_active', true)
      .single();

    if (clipError || !clip) {
      return { success: false, error: 'Clip not found' };
    }

    // 3. Generate high quality secure attachment URLs
    return { success: true, urls: videoUrlsFor(clip.r2_video_key) };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch download URLs.' };
  }
}
