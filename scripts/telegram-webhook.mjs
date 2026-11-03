// Points the Telegram bot at the live website, so it answers buyers without this PC.
//
//   npm run bot:live
//
// After this, `npm run bot` (local polling) refuses to run, because Telegram sends
// every message to the live site instead.

import crypto from 'node:crypto';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SITE = process.env.BOT_LIVE_URL || 'https://www.cwaya.me';

if (!TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN is missing from .env.local');
  process.exit(1);
}

// Same secret the website route expects (derived from the bot token).
const SECRET = crypto.createHash('sha256').update(`${TOKEN}:cwaya-webhook`).digest('hex').slice(0, 48);

const api = async (method, params = {}) => {
  const res = await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return res.json();
};

const me = await api('getMe');
if (!me.ok) {
  console.error('Bot token was rejected by Telegram:', me.description);
  process.exit(1);
}

// The live site must hold the same token, or Telegram's messages would be turned away.
const check = await fetch(`${SITE}/api/telegram/webhook`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-telegram-bot-api-secret-token': SECRET },
  body: JSON.stringify({ update_id: 0 }),
});
if (!check.ok) {
  console.error(`${SITE} refused the bot (${check.status}). Check the TELEGRAM_* settings in Vercel.`);
  process.exit(1);
}

const set = await api('setWebhook', { url: `${SITE}/api/telegram/webhook`, secret_token: SECRET, allowed_updates: ['message'] });
if (!set.ok) {
  console.error('Telegram refused the webhook:', set.description);
  process.exit(1);
}

const info = (await api('getWebhookInfo')).result ?? {};
console.log(`@${me.result.username} now answers from ${info.url}`);
console.log(`Messages waiting: ${info.pending_update_count ?? 0}. Last error: ${info.last_error_message ?? 'none'}.`);
