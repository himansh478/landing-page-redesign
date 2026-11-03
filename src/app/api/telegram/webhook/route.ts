import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { telegramConfigured, webhookSecret } from '@/lib/telegram';
import { handleUpdate, type TgUpdate } from '@/lib/telegram-bot';

// Receives Telegram updates: from Telegram itself once a webhook is set (live),
// or from scripts/telegram-poll.mjs on localhost. Both must send the secret
// header, so random callers can't make the bot send files.
export async function POST(request: Request) {
  if (!telegramConfigured()) {
    return NextResponse.json({ ok: false, error: 'Telegram not configured' }, { status: 503 });
  }

  const given = Buffer.from(request.headers.get('x-telegram-bot-api-secret-token') || '');
  const expected = Buffer.from(webhookSecret());
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const update = (await request.json()) as TgUpdate;
    await handleUpdate(update);
  } catch (err) {
    // Always answer 200 so Telegram doesn't retry the same update forever.
    console.error('Telegram update failed:', err instanceof Error ? err.message : err);
  }
  return NextResponse.json({ ok: true });
}
