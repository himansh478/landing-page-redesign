'use server';

import { cookies } from 'next/headers';

export async function verifyAdminPassword(password: string) {
  const adminPassword = process.env.ADMIN_PASSWORD || 'gour@1@#$';
  
  if (password === adminPassword) {
    const cookieStore = await cookies();
    cookieStore.set('admin_session', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    return { success: true };
  }
  return { success: false, error: 'Incorrect password' };
}

export async function checkAdminAuth() {
  const cookieStore = await cookies();
  return cookieStore.get('admin_session')?.value === 'true';
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
}
