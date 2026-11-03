'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkAdminAuth } from './auth';
import type { PromptItem, PromptKind } from '@/types/prompts';

async function requireAdmin() {
  const ok = await checkAdminAuth();
  if (!ok) throw new Error('Unauthorized');
}

type PromptRow = {
  id: string;
  kind: PromptKind;
  title: string;
  prompt: string;
  uploads: string[] | null;
  media_type: 'image' | 'video';
  media_url: string;
  media_public_id: string | null;
  poster_url: string | null;
  width: number | null;
  height: number | null;
  published: boolean;
  sort_order: number;
  created_at: string;
};

const toItem = (r: PromptRow): PromptItem => ({
  id: r.id,
  kind: r.kind,
  title: r.title,
  prompt: r.prompt,
  uploads: r.uploads ?? [],
  media: {
    type: r.media_type,
    src: r.media_url,
    poster: r.poster_url ?? undefined,
    alt: r.title,
    width: r.width ?? 1024,
    height: r.height ?? 1536,
  },
  published: r.published,
});

const pagePath = (kind: PromptKind) => (kind === 'photo' ? '/photo-prompts' : '/video-prompts');

// ───────────── PUBLIC ─────────────

// Returns [] if the table doesn't exist yet, so the pages still render.
export async function getPublishedPrompts(kind: PromptKind): Promise<PromptItem[]> {
  const { data, error } = await supabaseAdmin
    .from('prompts')
    .select('*')
    .eq('kind', kind)
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return (data as PromptRow[]).map(toItem);
}

// ───────────── ADMIN ─────────────

export async function listPromptsAdmin(): Promise<{ items: PromptItem[]; error?: string }> {
  await requireAdmin();
  const { data, error } = await supabaseAdmin
    .from('prompts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return { items: [], error: error.message };
  return { items: (data as PromptRow[]).map(toItem) };
}

export async function createPrompt(input: {
  kind: PromptKind;
  title: string;
  prompt: string;
  uploads: string[];
  mediaType: 'image' | 'video';
  mediaUrl: string;
  mediaPublicId?: string;
  posterUrl?: string;
  width?: number;
  height?: number;
}): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  const title = input.title.trim();
  const prompt = input.prompt.trim();
  if (!title || !prompt || !input.mediaUrl) return { success: false, error: 'Title, prompt and media are required.' };
  if (!['photo', 'video'].includes(input.kind)) return { success: false, error: 'Invalid prompt type.' };
  if (!/^https:\/\/res\.cloudinary\.com\//.test(input.mediaUrl)) return { success: false, error: 'Media must be uploaded to Cloudinary.' };

  const { error } = await supabaseAdmin.from('prompts').insert({
    kind: input.kind,
    title,
    prompt,
    uploads: input.uploads.map((u) => u.trim()).filter(Boolean),
    media_type: input.mediaType,
    media_url: input.mediaUrl,
    media_public_id: input.mediaPublicId ?? null,
    poster_url: input.posterUrl ?? null,
    width: input.width ?? null,
    height: input.height ?? null,
    published: true,
  });
  if (error) return { success: false, error: error.message };
  revalidatePath(pagePath(input.kind));
  return { success: true };
}

export async function setPromptPublished(id: string, kind: PromptKind, published: boolean) {
  await requireAdmin();
  const { error } = await supabaseAdmin.from('prompts').update({ published }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath(pagePath(kind));
}

export async function deletePrompt(id: string, kind: PromptKind) {
  await requireAdmin();
  const { error } = await supabaseAdmin.from('prompts').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath(pagePath(kind));
}
