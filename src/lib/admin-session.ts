import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';

// The admin password lives only in the ADMIN_PASSWORD setting, never in the code.
// The session cookie is signed, so nobody can make one by hand, and changing the
// password signs every admin out.
const WEEK = 60 * 60 * 24 * 7;

const password = () => process.env.ADMIN_PASSWORD ?? '';
// The service-role key is long and random, which keeps the signature strong even with a short password.
const signingKey = () => `${password()}:${process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''}`;
const sign = (expires: number) => createHmac('sha256', signingKey()).update(`admin:${expires}`).digest('hex');

const same = (a: string, b: string) => {
  const digest = (text: string) => createHmac('sha256', 'compare').update(text).digest();
  return timingSafeEqual(digest(a), digest(b));
};

export function passwordMatches(input: string) {
  return !!password() && same(input, password());
}

export function newAdminSession() {
  const expires = Math.floor(Date.now() / 1000) + WEEK;
  return { value: `${expires}.${sign(expires)}`, maxAge: WEEK };
}

export function isAdminSession(value: string | undefined) {
  if (!password() || !value) return false;
  const [expires, mac] = value.split('.');
  const when = Number(expires);
  if (!when || when < Date.now() / 1000 || !mac) return false;
  return same(mac, sign(when));
}
