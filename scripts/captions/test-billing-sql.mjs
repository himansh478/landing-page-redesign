import { LOCAL, startLocalBackend } from './local-backend.mjs';

// First check of the schema itself: does it load, and do the money rules hold?
const { db, server, callRpc } = await startLocalBackend();
const ok = (label, pass, extra = '') => console.log(`${pass ? 'PASS' : 'FAIL'}  ${label} ${extra}`);
const service = (name, args) => callRpc(name, args, 'service_role');

const makeUser = async (email) => {
  const { rows } = await db.query("insert into auth.users (id, email, password_hash, salt) values (gen_random_uuid(), $1, 'x', 'x') returning id", [email]);
  return rows[0].id;
};
const a = await makeUser('a@test.local');
const b = await makeUser('b@test.local');
const FREE = 600;

let s = await service('caption_state', { p_user: a, p_free_seconds: FREE });
ok('new account: 10 free minutes, watermark on', s.freeLeft === 600 && s.paidLeft === 0 && s.watermark === true, JSON.stringify(s));

const spent = await service('caption_spend', { p_user: a, p_seconds: 100, p_free_seconds: FREE, p_label: 'clip' });
s = await service('caption_state', { p_user: a, p_free_seconds: FREE });
ok('spending uses free minutes', spent.ok && s.freeLeft === 500);

const over = await service('caption_spend', { p_user: a, p_seconds: 501, p_free_seconds: FREE, p_label: 'too long' });
s = await service('caption_state', { p_user: a, p_free_seconds: FREE });
ok('over the limit is refused and nothing is taken', !over.ok && over.short === 1 && s.freeLeft === 500);

await service('caption_refund', { p_user: a, p_usage: spent.usageId });
s = await service('caption_state', { p_user: a, p_free_seconds: FREE });
ok('refund gives free minutes back', s.freeLeft === 600);
const again = await service('caption_refund', { p_user: a, p_usage: spent.usageId });
s = await service('caption_state', { p_user: a, p_free_seconds: FREE });
ok('second refund does nothing', again.ok === false && s.freeLeft === 600);

const spentB = await service('caption_spend', { p_user: b, p_seconds: 50, p_free_seconds: FREE, p_label: 'b' });
const stolen = await service('caption_refund', { p_user: a, p_usage: spentB.usageId });
ok("someone can't refund another person's usage", stolen.ok === false);

await service('caption_open_order', { p_order: 'order_1', p_user: a, p_plan: 'starter', p_amount: 19900, p_seconds: 3600, p_days: 30 });
let settle = await service('caption_settle_order', { p_order: 'order_1', p_payment: 'pay_1', p_paid_paise: 100, p_user: a });
s = await service('caption_state', { p_user: a, p_free_seconds: FREE });
ok('wrong amount adds no minutes', settle.reason === 'wrong-amount' && s.paidLeft === 0);
settle = await service('caption_settle_order', { p_order: 'order_1', p_payment: 'pay_1', p_paid_paise: 19900, p_user: b });
s = await service('caption_state', { p_user: a, p_free_seconds: FREE });
ok("another person can't claim the order", settle.reason === 'not-yours' && s.paidLeft === 0);
settle = await service('caption_settle_order', { p_order: 'order_1', p_payment: 'pay_1', p_paid_paise: 19900, p_user: a });
s = await service('caption_state', { p_user: a, p_free_seconds: FREE });
ok('correct payment adds minutes and removes the watermark', settle.ok && s.paidLeft === 3600 && s.watermark === false);
const replay = await service('caption_settle_order', { p_order: 'order_1', p_payment: 'pay_1', p_paid_paise: 19900 });
s = await service('caption_state', { p_user: a, p_free_seconds: FREE });
ok('browser and webhook both arriving credits once', replay.already === true && s.paidLeft === 3600);
const unknown = await service('caption_settle_order', { p_order: 'nope', p_payment: 'pay_2', p_paid_paise: 19900 });
ok('unknown order is refused', unknown.reason === 'unknown-order');

await service('caption_spend', { p_user: a, p_seconds: 700, p_free_seconds: FREE, p_label: 'big' });
s = await service('caption_state', { p_user: a, p_free_seconds: FREE });
ok('free minutes go first, then the pack', s.freeLeft === 0 && s.paidLeft === 3500, JSON.stringify(s));

const results = await Promise.all(Array.from({ length: 12 }, () => service('caption_spend', { p_user: a, p_seconds: 500, p_free_seconds: FREE, p_label: 'race' })));
s = await service('caption_state', { p_user: a, p_free_seconds: FREE });
ok('12 uploads at once can never overspend', results.filter((r) => r.ok).length === 7 && s.paidLeft === 0, `allowed ${results.filter((r) => r.ok).length}, left ${s.paidLeft}`);

await db.query("update caption_credits set expires_at = now() - interval '1 day' where user_id = $1", [a]);
s = await service('caption_state', { p_user: a, p_free_seconds: FREE });
ok('an expired pack stops counting and the watermark returns', s.paidLeft === 0 && s.watermark === true);

for (const role of ['anon', 'authenticated']) {
  for (const [fn, args] of [
    ['caption_state', { p_user: a, p_free_seconds: FREE }],
    ['caption_settle_order', { p_order: 'order_1', p_payment: 'x', p_paid_paise: 1 }],
    ['caption_spend', { p_user: a, p_seconds: 1, p_free_seconds: FREE, p_label: 'x' }],
    ['caption_project_list', { p_user: a }],
  ]) {
    let denied = false;
    try {
      await callRpc(fn, args, role);
    } catch (e) {
      denied = e.message.includes('permission denied');
    }
    ok(`${role} can't call ${fn}`, denied);
  }
  for (const table of ['caption_credits', 'caption_usage', 'caption_orders', 'caption_projects']) {
    let denied = false;
    try {
      await db.transaction(async (tx) => {
        await tx.exec(`set local role ${role}`);
        await tx.query(`select * from public.${table}`);
      });
    } catch (e) {
      denied = e.message.includes('permission denied');
    }
    ok(`${role} can't read ${table}`, denied);
  }
}

await service('caption_project_save', { p_user: a, p_id: 'p1', p_name: 'One', p_data: { media: { duration: 5 }, doc: { tokens: [] } } });
await service('caption_project_save', { p_user: a, p_id: 'p1', p_name: 'One renamed', p_data: { media: { duration: 5 } } });
const list = await service('caption_project_list', { p_user: a });
ok('project saves and updates in place', list.length === 1 && list[0].name === 'One renamed');
const other = await service('caption_project_get', { p_user: b, p_id: 'p1' });
ok("someone can't read another person's project", other === null);
await service('caption_project_delete', { p_user: b, p_id: 'p1' });
ok("someone can't delete another person's project", (await service('caption_project_list', { p_user: a })).length === 1);

const history = await service('caption_history', { p_user: a, p_limit: 5 });
ok('history lists usage and paid orders', history.usage.length === 5 && history.orders.length === 1);

await db.exec(readFileSync_schema());
ok('schema can be run a second time', true);

server.close();
await db.close();
console.log('done', LOCAL.port);

function readFileSync_schema() {
  return process.getBuiltinModule('node:fs').readFileSync(new URL('../../src/scripts/caption-schema.sql', import.meta.url), 'utf8');
}
