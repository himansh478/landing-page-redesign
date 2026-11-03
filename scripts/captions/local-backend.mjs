import { createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { PGlite } from '@electric-sql/pglite';

// A stand-in for Supabase and Razorpay, for testing accounts and payments without
// touching the real ones. It runs real Postgres (PGlite) with the real schema, so the
// SQL is tested for real; only login and Razorpay's API are imitated. Data lives in
// memory and disappears when it stops. Started by scripts/dev-local.mjs.
export const LOCAL = {
  port: 54399,
  anonKey: 'local-anon-key',
  serviceKey: 'local-service-key',
  razorpayKey: 'rzp_test_local',
  razorpaySecret: 'local-razorpay-secret',
  webhookSecret: 'local-webhook-secret',
  // For signing up by hand on the login page. Nothing here exists outside this stand-in.
  testUser: { email: 'tester@example.com', password: 'local-test-password' },
};

const JWT_SECRET = randomBytes(32);

const base64url = (value) => Buffer.from(value).toString('base64url');

function issueToken(user) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const body = base64url(JSON.stringify({ sub: user.id, email: user.email, role: 'authenticated', aud: 'authenticated', iat: now, exp: now + 3600 }));
  const signature = createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function readToken(token) {
  const [header, body, signature] = (token ?? '').split('.');
  if (!header || !body || !signature) return null;
  const expected = createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest();
  const given = Buffer.from(signature, 'base64url');
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  const claims = JSON.parse(Buffer.from(body, 'base64url').toString());
  return claims.exp > Date.now() / 1000 ? claims : null;
}

const hashPassword = (password, salt) => scryptSync(password, salt, 32).toString('hex');

export async function startLocalBackend() {
  const db = new PGlite();
  await db.exec(`
    create schema auth;
    create table auth.users (id uuid primary key, email text unique not null, password_hash text not null, salt text not null, created_at timestamptz default now());
    create role anon;
    create role authenticated;
    create role service_role bypassrls;
    grant usage on schema public to anon, authenticated, service_role;
    grant usage on schema auth to service_role;
    grant references on auth.users to service_role;
  `);
  await db.exec(readFileSync(new URL('../../src/scripts/caption-schema.sql', import.meta.url), 'utf8'));

  const sessions = new Map();
  const razorpay = { orders: new Map(), payments: new Map() };

  const publicUser = (row) => ({
    id: row.id,
    aud: 'authenticated',
    role: 'authenticated',
    email: row.email,
    app_metadata: {},
    user_metadata: {},
    created_at: row.created_at,
  });

  const sessionFor = (row) => {
    const refresh = randomBytes(24).toString('hex');
    sessions.set(refresh, row.id);
    return {
      access_token: issueToken(row),
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      refresh_token: refresh,
      user: publicUser(row),
    };
  };

  const callRpc = async (name, args, role) => {
    if (!/^[a-z_]+$/.test(name)) throw new Error('Bad function name');
    const keys = Object.keys(args);
    const named = keys.map((key, i) => `${key} := $${i + 1}`).join(', ');
    const values = keys.map((key) => (args[key] !== null && typeof args[key] === 'object' ? JSON.stringify(args[key]) : args[key]));
    return db.transaction(async (tx) => {
      await tx.exec(`set local role ${role}`);
      const { rows } = await tx.query(`select public.${name}(${named}) as result`, values);
      return rows[0].result;
    });
  };

  const handle = async (req, url, body) => {
    const path = url.pathname;
    const bearer = req.headers.authorization?.replace(/^Bearer /i, '');

    if (path === '/auth/v1/signup' && req.method === 'POST') {
      const salt = randomBytes(8).toString('hex');
      const { rows } = await db.query('insert into auth.users (id, email, password_hash, salt) values ($1, $2, $3, $4) on conflict do nothing returning *', [
        randomUUID(),
        body.email.toLowerCase(),
        hashPassword(body.password, salt),
        salt,
      ]);
      if (!rows[0]) return [422, { code: 'user_already_exists', message: 'User already registered' }];
      return [200, sessionFor(rows[0])];
    }

    if (path === '/auth/v1/token' && req.method === 'POST') {
      if (url.searchParams.get('grant_type') === 'password') {
        const { rows } = await db.query('select * from auth.users where email = $1', [body.email.toLowerCase()]);
        const row = rows[0];
        if (!row || hashPassword(body.password, row.salt) !== row.password_hash) return [400, { error: 'invalid_grant', error_description: 'Invalid login credentials', message: 'Invalid login credentials' }];
        return [200, sessionFor(row)];
      }
      const id = sessions.get(body.refresh_token);
      if (!id) return [400, { error: 'invalid_grant', message: 'Invalid refresh token' }];
      const { rows } = await db.query('select * from auth.users where id = $1', [id]);
      return [200, sessionFor(rows[0])];
    }

    if (path === '/auth/v1/user') {
      const claims = readToken(bearer);
      if (!claims) return [401, { message: 'invalid JWT' }];
      if (req.method === 'PUT' && body.password) {
        const salt = randomBytes(8).toString('hex');
        await db.query('update auth.users set password_hash = $1, salt = $2 where id = $3', [hashPassword(body.password, salt), salt, claims.sub]);
      }
      const { rows } = await db.query('select * from auth.users where id = $1', [claims.sub]);
      return rows[0] ? [200, publicUser(rows[0])] : [401, { message: 'User not found' }];
    }

    if (path === '/auth/v1/recover') return [200, {}];

    // Test helper standing in for the link in a password reset email.
    if (path === '/auth/test/recovery-link' && req.method === 'POST') {
      const { rows } = await db.query('select * from auth.users where email = $1', [body.email.toLowerCase()]);
      if (!rows[0]) return [404, { message: 'No such user' }];
      const session = sessionFor(rows[0]);
      const fragment = new URLSearchParams({ access_token: session.access_token, refresh_token: session.refresh_token, expires_in: '3600', expires_at: String(session.expires_at), token_type: 'bearer', type: 'recovery' });
      return [200, { link: `${body.redirectTo}#${fragment}` }];
    }

    if (path === '/auth/v1/logout') return [204, null];

    if (path.startsWith('/rest/v1/rpc/') && req.method === 'POST') {
      const role = bearer === LOCAL.serviceKey ? 'service_role' : 'anon';
      try {
        return [200, await callRpc(path.split('/').pop(), body, role)];
      } catch (e) {
        return [e.message.includes('permission denied') ? 403 : 400, { message: e.message, code: e.code }];
      }
    }

    if (path === '/razorpay/v1/orders' && req.method === 'POST') {
      const expected = `Basic ${Buffer.from(`${LOCAL.razorpayKey}:${LOCAL.razorpaySecret}`).toString('base64')}`;
      if (req.headers.authorization !== expected) return [401, { error: { description: 'Authentication failed' } }];
      const order = { id: `order_${randomBytes(7).toString('hex')}`, amount: body.amount, currency: body.currency, status: 'created', receipt: body.receipt };
      razorpay.orders.set(order.id, order);
      return [200, order];
    }

    const payment = path.match(/^\/razorpay\/v1\/payments\/([^/]+)(\/capture)?$/);
    if (payment) {
      const entity = razorpay.payments.get(payment[1]);
      if (!entity) return [404, { error: { description: 'Payment not found' } }];
      if (payment[2]) entity.status = 'captured';
      return [200, entity];
    }

    // Test helper standing in for a customer paying on Razorpay's own page.
    if (path === '/razorpay/test/pay' && req.method === 'POST') {
      const order = razorpay.orders.get(body.orderId);
      if (!order) return [404, { error: 'No such order' }];
      const id = `pay_${randomBytes(7).toString('hex')}`;
      razorpay.payments.set(id, { id, order_id: order.id, amount: body.amount ?? order.amount, currency: order.currency, status: body.status ?? 'captured' });
      return [200, { paymentId: id }];
    }

    return [404, { message: `No local route for ${req.method} ${path}` }];
  };

  const server = createServer((req, res) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', async () => {
      const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': '*',
        'Content-Type': 'application/json',
      };
      if (req.method === 'OPTIONS') {
        res.writeHead(204, headers).end();
        return;
      }
      try {
        const url = new URL(req.url, `http://localhost:${LOCAL.port}`);
        const text = Buffer.concat(chunks).toString();
        const [status, body] = await handle(req, url, text ? JSON.parse(text) : {});
        res.writeHead(status, headers).end(body === null ? undefined : JSON.stringify(body));
      } catch (e) {
        res.writeHead(500, headers).end(JSON.stringify({ message: e.message }));
      }
    });
  });

  await new Promise((resolve) => server.listen(LOCAL.port, 'localhost', resolve));
  return { db, server, callRpc };
}

if (process.argv[1]?.endsWith('local-backend.mjs')) {
  await startLocalBackend();
  console.log(`Local Supabase and Razorpay stand-in on http://localhost:${LOCAL.port}`);
}
