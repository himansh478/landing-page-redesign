import { supabaseAdmin } from '@/lib/supabase-admin';
import { deliverMessages, packageMessageIds, sendText } from '@/lib/telegram';

// Handles one Telegram update. Shared by the webhook route (live) and the
// local poller (localhost), so both behave the same.

const SITE = 'https://www.cwaya.me/raw-clips';
const SUPPORT = 'WhatsApp +91 81203 17074';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type TgUser = { id: number; first_name?: string };
type TgMessage = { chat: { id: number; type: string }; from?: TgUser; text?: string };
export type TgUpdate = { update_id: number; message?: TgMessage };

type Purchase = { order_id: string; package_type: string; status: string; telegram_user_id: number | null };
type LinkRow = { token: string; kind: 'package' | 'paid_clip'; order_id: string; clip_id: string | null; expires_at: string; used_by: number | null };

const HELP = [
  'How to get your clips:',
  '',
  `• Free clips: open ${SITE} and tap "Free Download" on a clip. It opens this bot and the clip arrives here.`,
  '• Paid packs: after paying on the website, tap "Get files on Telegram". Your files arrive here.',
  '• Bought before? Send /myfiles to get your paid files again.',
  '',
  `Need help? ${SUPPORT}`,
].join('\n');

export async function handleUpdate(update: TgUpdate): Promise<void> {
  const msg = update.message;
  // Private chats only; ignore groups, channels and non-text messages.
  if (!msg || msg.chat.type !== 'private' || !msg.from || !msg.text) return;

  const chatId = msg.chat.id;
  const user = msg.from;
  const [command, payload = ''] = msg.text.trim().split(/\s+/, 2);

  switch (command.split('@')[0]) {
    case '/start':
      if (payload.startsWith('f_')) return sendFreeClip(chatId, payload.slice(2));
      if (payload.startsWith('p_')) return claimPaid(chatId, user, payload.slice(2));
      await sendText(chatId, `Welcome to Cwaya Raw Clips${user.first_name ? `, ${user.first_name}` : ''}!\n\n${HELP}`);
      return;
    case '/myfiles':
      return sendMyFiles(chatId, user);
    case '/help':
      await sendText(chatId, HELP);
      return;
    default:
      await sendText(chatId, `Send /help to see how to get your clips, or /myfiles for files you bought.`);
  }
}

async function sendFreeClip(chatId: number, clipId: string) {
  if (!UUID.test(clipId)) {
    await sendText(chatId, `That link isn't valid. Pick a clip again on ${SITE}`);
    return;
  }
  const { data: clip } = await supabaseAdmin
    .from('raw_clips')
    .select('title, is_free, is_active, telegram_message_ids')
    .eq('id', clipId)
    .maybeSingle();

  const ids = (clip?.telegram_message_ids as number[] | null) ?? [];
  if (!clip || !clip.is_active || !clip.is_free || ids.length === 0) {
    await sendText(chatId, `This clip isn't available here right now. Pick another one on ${SITE}`);
    return;
  }

  await sendText(chatId, `Here's your free clip: ${clip.title}`);
  if (!(await deliverMessages(chatId, ids))) {
    await sendText(chatId, `Sorry, sending failed. Please try again in a minute. ${SUPPORT}`);
    return;
  }
  await supabaseAdmin.from('raw_clips').update({ download_count: (await downloadCount(clipId)) + 1 }).eq('id', clipId);
}

async function downloadCount(clipId: string) {
  const { data } = await supabaseAdmin.from('raw_clips').select('download_count').eq('id', clipId).maybeSingle();
  return (data?.download_count as number | null) ?? 0;
}

async function claimPaid(chatId: number, user: TgUser, token: string) {
  const { data: link } = await supabaseAdmin
    .from('telegram_links')
    .select('token, kind, order_id, clip_id, expires_at, used_by')
    .eq('token', token)
    .maybeSingle<LinkRow>();

  if (!link) {
    await sendText(chatId, `That link isn't valid. Open it again from the payment page, or send /myfiles if you already claimed it.`);
    return;
  }

  const { data: purchase } = await supabaseAdmin
    .from('raw_clips_purchases')
    .select('order_id, package_type, status, telegram_user_id')
    .eq('order_id', link.order_id)
    .maybeSingle<Purchase>();

  if (!purchase || purchase.status !== 'SUCCESS') {
    await sendText(chatId, `This payment isn't confirmed yet. Wait a minute and open the link again. ${SUPPORT}`);
    return;
  }

  const isOwner = purchase.telegram_user_id === user.id;
  if ((purchase.telegram_user_id && !isOwner) || (link.used_by && link.used_by !== user.id)) {
    await sendText(chatId, `This purchase is already linked to another Telegram account, so it can't be used here. If this is your purchase, contact ${SUPPORT}`);
    return;
  }
  if (!isOwner && new Date(link.expires_at).getTime() < Date.now()) {
    await sendText(chatId, `This link has expired. Open the payment page again to get a fresh link. ${SUPPORT}`);
    return;
  }

  // First claim: tie the purchase to this Telegram account. The
  // "is null" condition makes two people racing for the same link safe.
  if (!purchase.telegram_user_id) {
    await supabaseAdmin
      .from('raw_clips_purchases')
      .update({ telegram_user_id: user.id, telegram_claimed_at: new Date().toISOString() })
      .eq('order_id', purchase.order_id)
      .is('telegram_user_id', null);
    const { data: check } = await supabaseAdmin
      .from('raw_clips_purchases')
      .select('telegram_user_id')
      .eq('order_id', purchase.order_id)
      .maybeSingle();
    if (check?.telegram_user_id !== user.id) {
      await sendText(chatId, `This purchase is already linked to another Telegram account. Contact ${SUPPORT}`);
      return;
    }
  }
  if (!link.used_by) {
    await supabaseAdmin
      .from('telegram_links')
      .update({ used_by: user.id, used_at: new Date().toISOString() })
      .eq('token', link.token)
      .is('used_by', null);
  }

  let ids: number[] = [];
  let label = '';
  if (link.kind === 'package') {
    ids = await packageMessageIds(purchase.package_type);
    label = `your ${purchase.package_type} pack`;
  } else if (link.clip_id) {
    const { data: clip } = await supabaseAdmin
      .from('raw_clips')
      .select('title, is_active, telegram_message_ids')
      .eq('id', link.clip_id)
      .maybeSingle();
    if (clip?.is_active) ids = (clip.telegram_message_ids as number[] | null) ?? [];
    label = clip?.title ?? 'your clip';
  }

  if (ids.length === 0) {
    await sendText(chatId, `Your purchase is linked to this account, but the files aren't uploaded yet. We'll fix this quickly. ${SUPPORT}`);
    return;
  }

  await sendText(chatId, `Payment confirmed. Sending ${label} now. Save the files to your device.\nYou can get them again any time with /myfiles.`);
  if (!(await deliverMessages(chatId, ids))) {
    await sendText(chatId, `Sorry, sending failed. Send /myfiles to try again. ${SUPPORT}`);
  }
}

async function sendMyFiles(chatId: number, user: TgUser) {
  const { data: purchases } = await supabaseAdmin
    .from('raw_clips_purchases')
    .select('order_id, package_type')
    .eq('telegram_user_id', user.id)
    .eq('status', 'SUCCESS');

  const { data: clipLinks } = await supabaseAdmin
    .from('telegram_links')
    .select('clip_id')
    .eq('kind', 'paid_clip')
    .eq('used_by', user.id);

  const packages = [...new Set((purchases ?? []).map((p) => p.package_type as string))];
  const clipIds = [...new Set((clipLinks ?? []).map((l) => l.clip_id as string).filter(Boolean))];

  if (packages.length === 0 && clipIds.length === 0) {
    await sendText(chatId, `No purchases are linked to this Telegram account yet. After paying on the website, tap "Get files on Telegram".\n\n${SITE}`);
    return;
  }

  let ids: number[] = [];
  for (const p of packages) ids = ids.concat(await packageMessageIds(p));
  if (clipIds.length) {
    const { data: clips } = await supabaseAdmin
      .from('raw_clips')
      .select('telegram_message_ids')
      .in('id', clipIds)
      .eq('is_active', true);
    for (const c of clips ?? []) ids = ids.concat((c.telegram_message_ids as number[] | null) ?? []);
  }

  if (ids.length === 0) {
    await sendText(chatId, `Your purchases are linked, but the files aren't uploaded yet. ${SUPPORT}`);
    return;
  }
  await sendText(chatId, `Sending your files again (${packages.length ? packages.join(' + ') + ' pack' : 'your clips'}).`);
  if (!(await deliverMessages(chatId, ids))) {
    await sendText(chatId, `Sorry, sending failed. Please try again in a minute. ${SUPPORT}`);
  }
}
