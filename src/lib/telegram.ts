import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Server-only Telegram helpers. The bot token must never reach the browser:
// never import this file into a 'use client' component.

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const USERNAME = (process.env.TELEGRAM_BOT_USERNAME || '').replace(/^@/, '');
const STORAGE_CHAT_ID = process.env.TELEGRAM_STORAGE_CHAT_ID || '';

export const telegramConfigured = () => Boolean(TOKEN && USERNAME && STORAGE_CHAT_ID);
export const botUsername = () => USERNAME;
export const storageChatId = () => STORAGE_CHAT_ID;

// Secret that Telegram (or the local poller) must send with every update.
// Derived from the bot token, so there is no extra setting to manage.
export function webhookSecret() {
  return crypto.createHash('sha256').update(`${TOKEN}:cwaya-webhook`).digest('hex').slice(0, 48);
}

type TgResponse<T> = { ok: boolean; result?: T; description?: string };

export async function tg<T = unknown>(method: string, body: Record<string, unknown>): Promise<TgResponse<T>> {
  const res = await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json() as Promise<TgResponse<T>>;
}

export const sendText = (chatId: number, text: string) =>
  tg('sendMessage', { chat_id: chatId, text, link_preview_options: { is_disabled: true } });

/** Deep link that opens the bot with a start payload (max 64 chars: A-Z a-z 0-9 _ -). */
export const botLink = (payload: string) => `https://t.me/${USERNAME}?start=${payload}`;

/**
 * Copies stored files from the private channel into a user's chat. The user
 * gets a normal copy (no "forwarded from" header pointing at the channel).
 */
export async function deliverMessages(chatId: number, messageIds: number[]): Promise<boolean> {
  const ids = [...new Set(messageIds)].sort((a, b) => a - b);
  if (ids.length === 0) return false;
  for (let i = 0; i < ids.length; i += 100) {
    const chunk = ids.slice(i, i + 100);
    const res = await tg('copyMessages', { chat_id: chatId, from_chat_id: STORAGE_CHAT_ID, message_ids: chunk });
    if (!res.ok) {
      console.error('Telegram copyMessages failed:', res.description);
      return false;
    }
  }
  return true;
}

/**
 * Reads what an admin pasted: message links like https://t.me/c/3930487618/4
 * (one per line, or comma/space separated) or bare message numbers. Links
 * from any other channel are rejected.
 */
export function parseMessageLinks(input: string): { ids: number[]; errors: string[] } {
  const channelNumber = STORAGE_CHAT_ID.replace(/^-100/, '');
  const ids: number[] = [];
  const errors: string[] = [];
  for (const raw of input.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean)) {
    const link = raw.match(/t\.me\/c\/(\d+)\/(\d+)/);
    if (link) {
      if (link[1] !== channelNumber) errors.push(`${raw} is from a different channel`);
      else ids.push(Number(link[2]));
    } else if (/^\d+$/.test(raw)) {
      ids.push(Number(raw));
    } else {
      errors.push(`${raw} is not a Telegram message link`);
    }
  }
  return { ids: [...new Set(ids)].sort((a, b) => a - b), errors };
}

export const messageLinkFor = (id: number) => `https://t.me/c/${STORAGE_CHAT_ID.replace(/^-100/, '')}/${id}`;

const newToken = () => crypto.randomBytes(18).toString('base64url'); // 24 chars

const LINK_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * One-time Telegram link for a PAID purchase (a package, or one paid clip).
 * Only call after the order is confirmed paid. Reuses a still-valid link
 * instead of minting a new one on every page poll.
 */
export async function paidTelegramLink(
  orderId: string,
  kind: 'package' | 'paid_clip',
  clipId?: string
): Promise<string | null> {
  if (!telegramConfigured()) return null;

  let query = supabaseAdmin
    .from('telegram_links')
    .select('token')
    .eq('order_id', orderId)
    .eq('kind', kind)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1);
  query = clipId ? query.eq('clip_id', clipId) : query.is('clip_id', null);
  const { data: existing } = await query;
  if (existing && existing[0]) return botLink(`p_${existing[0].token}`);

  const token = newToken();
  const { error } = await supabaseAdmin.from('telegram_links').insert({
    token,
    kind,
    order_id: orderId,
    clip_id: clipId ?? null,
    expires_at: new Date(Date.now() + LINK_TTL_MS).toISOString(),
  });
  if (error) {
    console.error('Could not create Telegram link:', error.message);
    return null;
  }
  return botLink(`p_${token}`);
}

/** Message ids for a package, or [] if it has none set. */
export async function packageMessageIds(packageType: string): Promise<number[]> {
  const { data } = await supabaseAdmin
    .from('raw_clip_packages')
    .select('telegram_message_ids')
    .eq('package_type', packageType)
    .maybeSingle();
  return (data?.telegram_message_ids as number[] | null) ?? [];
}
