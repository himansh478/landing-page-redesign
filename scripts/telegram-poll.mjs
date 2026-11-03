// Runs the Telegram bot on localhost.
//
// Telegram can't reach a website on your own PC, so instead of a webhook this
// script asks Telegram for new messages ("long polling") and passes each one
// to the website's bot route, exactly like Telegram's webhook would.
//
// Start the website first (npm run dev), then in a second terminal:
//   npm run bot
//
// Stop with Ctrl + C.

import crypto from 'node:crypto';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SITE = process.env.BOT_SITE_URL || 'http://localhost:3000';

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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const me = await api('getMe');
if (!me.ok) {
  console.error('Bot token was rejected by Telegram:', me.description);
  process.exit(1);
}

// Polling and a live webhook can't run at the same time. Never remove a live
// webhook from here; that would take the live bot offline.
const hook = await api('getWebhookInfo');
if (hook.result?.url) {
  console.error(`A live webhook is set (${hook.result.url}). Polling would conflict with it, so this script won't run.`);
  process.exit(1);
}

console.log(`@${me.result.username} is running on localhost → ${SITE}/api/telegram/webhook`);
console.log('Open the bot in Telegram and send /start. Press Ctrl + C to stop.\n');

let offset = 0;
for (;;) {
  try {
    const res = await api('getUpdates', { offset, timeout: 30, allowed_updates: ['message'] });
    if (!res.ok) {
      console.error('getUpdates failed:', res.description);
      await sleep(5000);
      continue;
    }
    for (const update of res.result) {
      offset = update.update_id + 1;
      const text = update.message?.text;
      if (text) console.log(`← ${update.message.from?.first_name ?? 'user'}: ${text.split(' ')[0]}${text.includes(' ') ? ' …' : ''}`);
      try {
        const r = await fetch(`${SITE}/api/telegram/webhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Telegram-Bot-Api-Secret-Token': SECRET },
          body: JSON.stringify(update),
        });
        if (!r.ok) console.error(`  website answered ${r.status}`);
      } catch {
        console.error(`  couldn't reach ${SITE}. Is the website running (npm run dev)?`);
      }
    }
  } catch (err) {
    console.error('Network error:', err.message);
    await sleep(5000);
  }
}
