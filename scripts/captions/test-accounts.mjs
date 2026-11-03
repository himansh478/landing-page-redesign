import { createHmac, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { LOCAL } from './local-backend.mjs';

// End-to-end test of login, minutes and payments, through the app's real API routes,
// against the local stand-in (npm run dev:accounts or the captions-accounts preview).
// The speech pipeline really runs, so the clip's audio goes to Groq, Gemini and Modal.
const APP = 'http://localhost:3100';
const STANDIN = `http://localhost:${LOCAL.port}`;
const SPEECH = readFileSync('../ai caption/work/yt-1-b.m4a');
const LONG = readFileSync('../ai caption/work/yt-1-b-long.m4a');
const SPEECH_SECONDS = 22;
const STARTER = 3600;

let failures = 0;
const check = (name, passed, detail) => {
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}${passed || detail === undefined ? '' : ` (${JSON.stringify(detail).slice(0, 300)})`}`);
  if (!passed) failures++;
};

const json = { 'Content-Type': 'application/json' };
const hmac = (text, secret) => createHmac('sha256', secret).update(text).digest('hex');

async function signUp() {
  const email = `t${randomUUID().slice(0, 8)}@example.com`;
  const res = await fetch(`${STANDIN}/auth/v1/signup`, { method: 'POST', headers: json, body: JSON.stringify({ email, password: randomUUID() }) });
  const session = await res.json();
  return { email, id: session.user.id, auth: { Authorization: `Bearer ${session.access_token}` } };
}

const account = async (user) => (await fetch(`${APP}/api/captions/account`, { headers: user.auth })).json();

async function upload(user, audio, name = 'Test video') {
  const res = await fetch(`${APP}/api/captions/process`, { method: 'POST', headers: { ...user.auth, 'x-project-name': encodeURIComponent(JSON.stringify(name)) }, body: audio });
  if (res.status !== 200) return { status: res.status, body: await res.json() };
  const lines = (await res.text()).trim().split('\n').map((line) => JSON.parse(line));
  return { status: 200, last: lines.at(-1) };
}

const standinRpc = (name, args) =>
  fetch(`${STANDIN}/rest/v1/rpc/${name}`, { method: 'POST', headers: { ...json, Authorization: `Bearer ${LOCAL.serviceKey}` }, body: JSON.stringify(args) });

const order = async (user, body) => {
  const res = await fetch(`${APP}/api/captions/billing/order`, { method: 'POST', headers: { ...user.auth, ...json }, body: JSON.stringify(body) });
  return { status: res.status, body: await res.json() };
};

async function pay(orderId, extra = {}) {
  const res = await fetch(`${STANDIN}/razorpay/test/pay`, { method: 'POST', headers: json, body: JSON.stringify({ orderId, ...extra }) });
  return (await res.json()).paymentId;
}

const verify = async (user, orderId, paymentId, signature = hmac(`${orderId}|${paymentId}`, LOCAL.razorpaySecret)) => {
  const res = await fetch(`${APP}/api/captions/billing/verify`, { method: 'POST', headers: { ...user.auth, ...json }, body: JSON.stringify({ orderId, paymentId, signature }) });
  return res.status;
};

const webhook = async (event, entity, secret = LOCAL.webhookSecret) => {
  const body = JSON.stringify({ event, payload: { payment: { entity } } });
  const res = await fetch(`${APP}/api/captions/webhook/razorpay`, { method: 'POST', headers: { ...json, 'x-razorpay-signature': hmac(body, secret) }, body });
  return res.status;
};

function wav(seconds, realSeconds = seconds) {
  const rate = 16000;
  const chunk = (bytes) => {
    const head = Buffer.alloc(8);
    head.write('data', 0);
    head.writeUInt32LE(bytes, 4);
    return Buffer.concat([head, Buffer.alloc(bytes)]);
  };
  const format = Buffer.alloc(24);
  format.write('fmt ', 0);
  format.writeUInt32LE(16, 4);
  format.writeUInt16LE(1, 8);
  format.writeUInt16LE(1, 10);
  format.writeUInt32LE(rate, 12);
  format.writeUInt32LE(rate * 2, 16);
  format.writeUInt16LE(2, 20);
  format.writeUInt16LE(16, 22);
  const parts = [format, chunk(seconds * rate * 2)];
  if (realSeconds > seconds) parts.push(chunk((realSeconds - seconds) * rate * 2));
  const body = Buffer.concat(parts);
  const head = Buffer.alloc(12);
  head.write('RIFF', 0);
  head.writeUInt32LE(body.length + 4, 4);
  head.write('WAVE', 8);
  return Buffer.concat([head, body]);
}

console.log('\n-- Every route needs a signed-in person');
const routes = [
  ['GET', '/api/captions/account'],
  ['POST', '/api/captions/process'],
  ['POST', '/api/captions/realign'],
  ['POST', '/api/captions/convert'],
  ['POST', '/api/captions/translate'],
  ['POST', '/api/captions/proofread'],
  ['POST', '/api/captions/export'],
  ['POST', '/api/captions/billing/order'],
  ['POST', '/api/captions/billing/verify'],
  ['GET', '/api/captions/projects'],
  ['GET', '/api/captions/projects/abc'],
  ['PUT', '/api/captions/projects/abc'],
  ['DELETE', '/api/captions/projects/abc'],
];
for (const [method, path] of routes) {
  const body = method === 'POST' || method === 'PUT' ? '{}' : undefined;
  const none = await fetch(APP + path, { method, body });
  const forged = await fetch(APP + path, { method, body, headers: { Authorization: 'Bearer aaa.bbb.ccc' } });
  check(`${method} ${path} refuses no token and a forged token`, none.status === 401 && forged.status === 401, [none.status, forged.status]);
}

console.log('\n-- New accounts');
const a = await signUp();
const b = await signUp();
let state = await account(a);
check('10 free minutes', state.freeLeft === 600 && state.freeMinutes === 10, state);
check('no paid minutes, watermark on', state.paidLeft === 0 && state.watermark === true, state);
check('own email, payments ready', state.email === a.email && state.paymentsReady === true, state);

console.log('\n-- Minutes are charged from the audio');
let run = await upload(a, SPEECH, 'मेरा वीडियो');
check('a real clip comes back with words', run.last?.stage === 'done' && run.last.result.tokens.length > 20, run.last);
console.log(`     ${run.last?.result?.tokens.length} words`);
state = await account(a);
check(`charged ${SPEECH_SECONDS} s`, state.freeLeft === 600 - SPEECH_SECONDS, state.freeLeft);
check('shown in usage with its name', state.usage.length === 1 && state.usage[0].label === 'मेरा वीडियो' && state.usage[0].seconds === SPEECH_SECONDS, state.usage);

const before = performance.now();
run = await upload(a, LONG);
const refusedIn = performance.now() - before;
check('a video over 1 minute is refused', run.status === 413 && /up to 1 minute/.test(run.body.error), run);
check('refused before any outside work', refusedIn < 15000, refusedIn);
state = await account(a);
check('nothing charged for the refused video', state.freeLeft === 600 - SPEECH_SECONDS && state.usage.length === 1, state.freeLeft);

run = await upload(a, wav(5));
check('silence: no captions', run.last?.stage === 'error', run.last ?? run);
state = await account(a);
check('silence: minutes given back', state.freeLeft === 600 - SPEECH_SECONDS, state.freeLeft);
check('silence: shown as refunded', state.usage[0].refunded === true, state.usage[0]);

run = await upload(a, wav(2, 60));
check('a file hiding more sound than its header says is stopped', run.last?.message === 'We could not read the sound in this file.', run.last ?? run);
state = await account(a);
check('and its minutes are given back', state.freeLeft === 600 - SPEECH_SECONDS, state.freeLeft);

run = await upload(a, Buffer.from('this is not audio'));
check('junk is refused without a charge', run.status === 400 && (await account(a)).usage.length === 3, run);

console.log('\n-- Minutes run out');
const d = await signUp();
await standinRpc('caption_spend', { p_user: d.id, p_seconds: 590, p_free_seconds: 600, p_label: 'used earlier' });
run = await upload(d, SPEECH);
check('a video longer than the balance is refused', run.status === 402 && run.body.short === SPEECH_SECONDS - 10, run);
check('and nothing is charged for it', (await account(d)).freeLeft === 10);

console.log('\n-- Parallel uploads cannot overspend');
const c = await signUp();
await standinRpc('caption_spend', { p_user: c.id, p_seconds: 570, p_free_seconds: 600, p_label: 'used earlier' });
const parallel = await Promise.all([1, 2, 3, 4].map(() => upload(c, SPEECH)));
const passed = parallel.filter((one) => one.status === 200).length;
check('only one of four fits in the last 30 s', passed === 1 && parallel.filter((one) => one.status === 402).length === 3, parallel.map((one) => one.status));
state = await account(c);
check('balance is exact', state.freeLeft === 8, state.freeLeft);

console.log('\n-- Buying minutes');
let bought = await order(a, { plan: 'starter', amount: 1, price: 1, minutes: 99999 });
check('price comes from the server', bought.status === 200 && bought.body.amount === 19900 && bought.body.currency === 'INR' && bought.body.keyId === LOCAL.razorpayKey, bought);
check('an unknown plan is refused', (await order(a, { plan: 'free-forever' })).status === 400);

const first = bought.body.orderId;
const firstPayment = await pay(first);
check('a forged signature is refused', (await verify(a, first, firstPayment, 'f'.repeat(64))) === 400);
check('no credit from it', (await account(a)).paidLeft === 0);

check('a real payment is accepted', (await verify(a, first, firstPayment)) === 200);
state = await account(a);
check('minutes arrive', state.paidLeft === STARTER, state.paidLeft);
check('watermark goes off', state.watermark === false, state.watermark);
const days = (new Date(state.paidUntil) - Date.now()) / 86400000;
check('valid for 30 days', days > 29.9 && days < 30.1, days);
check('payment shown', state.orders.length === 1 && state.orders[0].amountPaise === 19900 && state.orders[0].plan === 'starter', state.orders);

check('sending it twice is safe', (await verify(a, first, firstPayment)) === 200 && (await account(a)).paidLeft === STARTER);
check('another person cannot claim it', (await verify(b, first, firstPayment)) === 400 && (await account(b)).paidLeft === 0);

const entity = { id: firstPayment, order_id: first, amount: 19900, currency: 'INR' };
check('webhook after the browser adds nothing', (await webhook('payment.captured', entity)) === 200 && (await account(a)).paidLeft === STARTER);

const low = (await order(a, { plan: 'starter' })).body.orderId;
check('an underpaid order is refused', (await verify(a, low, await pay(low, { amount: 100 }))) === 400 && (await account(a)).paidLeft === STARTER);

const failed = (await order(a, { plan: 'starter' })).body.orderId;
check('a failed payment gives nothing', (await verify(a, failed, await pay(failed, { status: 'failed' }))) === 409 && (await account(a)).paidLeft === STARTER);

const swapped = (await order(a, { plan: 'starter' })).body.orderId;
check("another order's payment is refused", (await verify(a, swapped, firstPayment)) === 400 && (await account(a)).paidLeft === STARTER);

const held = (await order(a, { plan: 'starter' })).body.orderId;
check('an authorized payment is captured and credited', (await verify(a, held, await pay(held, { status: 'authorized' }))) === 200 && (await account(a)).paidLeft === STARTER * 2);

console.log('\n-- Webhook, for a buyer who closes the tab');
const closed = (await order(b, { plan: 'creator' })).body.orderId;
const closedEntity = { id: await pay(closed), order_id: closed, amount: 49900, currency: 'INR' };
check('a forged webhook is refused', (await webhook('payment.captured', closedEntity, 'wrong-secret')) === 400 && (await account(b)).paidLeft === 0);
check('the real webhook credits the buyer', (await webhook('payment.captured', closedEntity)) === 200 && (await account(b)).paidLeft === 200 * 60);
check('its replay adds nothing', (await webhook('payment.captured', closedEntity)) === 200 && (await account(b)).paidLeft === 200 * 60);
check('other Cwaya orders are ignored', (await webhook('payment.captured', { id: 'pay_x', order_id: 'order_someone_else', amount: 1900, currency: 'INR' })) === 200);
const lowHook = (await order(b, { plan: 'studio' })).body.orderId;
check('an underpaid webhook credits nothing', (await webhook('payment.captured', { id: await pay(lowHook, { amount: 1 }), order_id: lowHook, amount: 1, currency: 'INR' })) === 200 && (await account(b)).paidLeft === 200 * 60);

console.log('\n-- Project sync keeps people apart');
const save = (user, id, body) => fetch(`${APP}/api/captions/projects/${id}`, { method: 'PUT', headers: { ...user.auth, ...json }, body: typeof body === 'string' ? body : JSON.stringify(body) });
const list = async (user) => (await (await fetch(`${APP}/api/captions/projects`, { headers: user.auth })).json()).projects;
const get = (user, id) => fetch(`${APP}/api/captions/projects/${id}`, { headers: user.auth });
const remove = (user, id) => fetch(`${APP}/api/captions/projects/${id}`, { method: 'DELETE', headers: user.auth });

check('a project saves', (await save(a, 'p1', { name: 'Mine', data: { secret: 'a' } })).status === 200);
check("it shows in the owner's list", (await list(a)).some((row) => row.id === 'p1' && row.name === 'Mine'));
check("it isn't in anyone else's", (await list(b)).length === 0);
check('others get not found', (await get(b, 'p1')).status === 404);
await save(b, 'p1', { name: 'Theirs', data: { secret: 'b' } });
check("the same id from someone else doesn't overwrite it", (await (await get(a, 'p1')).json()).data.data?.secret === 'a' || (await (await get(a, 'p1')).json()).data.secret === 'a');
await remove(b, 'p1');
check("someone else's delete doesn't touch it", (await get(a, 'p1')).status === 200);
check('a strange id is refused', (await get(a, '..%2F..%2Fetc')).status === 400);
check('bad JSON is refused', (await save(a, 'p2', 'not json')).status === 400);
check('a huge project is refused', (await save(a, 'p3', { name: 'x', data: { text: 'x'.repeat(5 * 1024 * 1024) } })).status === 413);
await remove(a, 'p1');
check('the owner can delete it', (await get(a, 'p1')).status === 404);

console.log('\n-- Server export only takes plain numbers');
const exportWith = (options) => {
  const form = new FormData();
  form.set('video', new Blob(['x']));
  form.set('overlay', new Blob(['x']));
  form.set('options', JSON.stringify(options));
  return fetch(`${APP}/api/captions/export`, { method: 'POST', headers: a.auth, body: form });
};
check('filter text in a size is refused', (await exportWith({ width: '1080,movie=/etc/passwd', height: 1920 })).status === 400);
check('filter text in the crop is refused', (await exportWith({ width: 1080, height: 1920, crop: { share: '1;drawtext', path: [] } })).status === 400);
check('filter text in the path is refused', (await exportWith({ width: 1080, height: 1920, crop: { share: 0.5, path: [{ time: 0, left: '0;x' }] } })).status === 400);
check('missing options are refused', (await fetch(`${APP}/api/captions/export`, { method: 'POST', headers: a.auth, body: new FormData() })).status === 400);
check('a body that is no form is refused', (await fetch(`${APP}/api/captions/export`, { method: 'POST', headers: { ...a.auth, ...json }, body: '{}' })).status === 400);

console.log(failures ? `\n${failures} FAILED` : '\nAll passed');
process.exit(failures ? 1 : 0);
