'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { botUsername, messageLinkFor, parseMessageLinks, storageChatId, telegramConfigured } from '@/lib/telegram';
import { RAW_CLIP_PACKAGES } from '@/lib/raw-clip-packages';
import { checkAdminAuth } from './auth';

async function requireAdmin() {
  if (!(await checkAdminAuth())) throw new Error('Unauthorized');
}

const CATEGORIES = ['Wedding', 'Cinematic', 'Commercial', 'Corporate', 'Drone', 'Reel'];

export type AdminTelegramClip = {
  id: string;
  title: string;
  category: string;
  is_free: boolean;
  is_active: boolean;
  thumbnail_url: string;
  links: string[];
};

export type TelegramAdminData = {
  configured: boolean;
  botUsername: string;
  storageChatId: string;
  /** Set when the raw clips tables aren't created in Supabase yet */
  setupError?: string;
  packages: { packageType: string; price: number; links: string[] }[];
  clips: AdminTelegramClip[];
};

export async function getTelegramAdminData(): Promise<TelegramAdminData> {
  await requireAdmin();
  const base = { configured: telegramConfigured(), botUsername: botUsername(), storageChatId: storageChatId(), packages: [], clips: [] };

  const [pkgRes, clipRes] = await Promise.all([
    supabaseAdmin.from('raw_clip_packages').select('package_type, telegram_message_ids'),
    supabaseAdmin
      .from('raw_clips')
      .select('id, title, category, is_free, is_active, thumbnail_url, telegram_message_ids')
      .order('created_at', { ascending: false }),
  ]);

  const err = pkgRes.error || clipRes.error;
  if (err) return { ...base, setupError: err.message };

  const toLinks = (ids: number[] | null) => (ids ?? []).map(messageLinkFor);
  const byType = new Map((pkgRes.data ?? []).map((p) => [p.package_type as string, p.telegram_message_ids as number[] | null]));

  return {
    ...base,
    packages: Object.entries(RAW_CLIP_PACKAGES).map(([packageType, p]) => ({
      packageType,
      price: p.price,
      links: toLinks(byType.get(packageType) ?? null),
    })),
    clips: (clipRes.data ?? []).map((c) => ({
      id: c.id as string,
      title: c.title as string,
      category: c.category as string,
      is_free: c.is_free as boolean,
      is_active: c.is_active as boolean,
      thumbnail_url: (c.thumbnail_url as string) || '',
      links: toLinks(c.telegram_message_ids as number[] | null),
    })),
  };
}

type SaveResult = { success: boolean; error?: string; count?: number };

export async function savePackageLinks(packageType: string, input: string): Promise<SaveResult> {
  await requireAdmin();
  if (!(packageType in RAW_CLIP_PACKAGES)) return { success: false, error: 'Unknown package.' };
  const { ids, errors } = parseMessageLinks(input);
  if (errors.length) return { success: false, error: errors.join('; ') };

  const { error } = await supabaseAdmin
    .from('raw_clip_packages')
    .upsert({ package_type: packageType, telegram_message_ids: ids, updated_at: new Date().toISOString() });
  if (error) return { success: false, error: error.message };
  return { success: true, count: ids.length };
}

export async function saveClipLinks(clipId: string, input: string): Promise<SaveResult> {
  await requireAdmin();
  const { ids, errors } = parseMessageLinks(input);
  if (errors.length) return { success: false, error: errors.join('; ') };

  const { error } = await supabaseAdmin.from('raw_clips').update({ telegram_message_ids: ids }).eq('id', clipId);
  if (error) return { success: false, error: error.message };
  revalidatePath('/raw-clips');
  return { success: true, count: ids.length };
}

export async function setClipActive(clipId: string, active: boolean): Promise<SaveResult> {
  await requireAdmin();
  const { error } = await supabaseAdmin.from('raw_clips').update({ is_active: active }).eq('id', clipId);
  if (error) return { success: false, error: error.message };
  revalidatePath('/raw-clips');
  return { success: true };
}

export async function createTelegramClip(input: {
  title: string;
  category: string;
  description?: string;
  duration?: string;
  tags?: string;
  isFree: boolean;
  thumbnailUrl?: string;
  links: string;
}): Promise<SaveResult> {
  await requireAdmin();
  const title = input.title.trim();
  if (!title) return { success: false, error: 'Title is required.' };
  if (!CATEGORIES.includes(input.category)) return { success: false, error: 'Pick a category.' };
  if (input.thumbnailUrl && !/^https:\/\/res\.cloudinary\.com\//.test(input.thumbnailUrl)) {
    return { success: false, error: 'Thumbnail must be uploaded to Cloudinary.' };
  }

  const { ids, errors } = parseMessageLinks(input.links);
  if (errors.length) return { success: false, error: errors.join('; ') };
  if (ids.length === 0) return { success: false, error: 'Paste at least one Telegram message link.' };

  const { error } = await supabaseAdmin.from('raw_clips').insert({
    title,
    category: input.category,
    description: input.description?.trim() || '',
    duration: input.duration?.trim() || '',
    tags: input.tags?.trim() || '',
    is_free: input.isFree,
    is_active: true,
    thumbnail_url: input.thumbnailUrl || '',
    telegram_message_ids: ids,
  });
  if (error) return { success: false, error: error.message };
  revalidatePath('/raw-clips');
  return { success: true, count: ids.length };
}

// Main dashboard: purchases list (moved server-side; the table is locked to the browser).
export async function listRawClipPurchasesAdmin() {
  await requireAdmin();
  const { data, error } = await supabaseAdmin
    .from('raw_clips_purchases')
    .select('id, created_at, order_id, payment_id, amount, package_type, status, download_url, telegram_user_id')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) return [];
  return data ?? [];
}
