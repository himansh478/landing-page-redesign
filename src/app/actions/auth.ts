'use server';

import { cookies } from 'next/headers';
import { isAdminSession, newAdminSession, passwordMatches } from '@/lib/admin-session';

export async function verifyAdminPassword(password: string) {
  if (!passwordMatches((password || '').trim())) return { success: false, error: 'Incorrect password' };

  const { value, maxAge } = newAdminSession();
  const cookieStore = await cookies();
  cookieStore.set('admin_session', value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge,
    path: '/',
  });
  return { success: true };
}

export async function checkAdminAuth() {
  const cookieStore = await cookies();
  return isAdminSession(cookieStore.get('admin_session')?.value);
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
}
