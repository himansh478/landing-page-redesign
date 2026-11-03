'use client';

import Link from 'next/link';
import { minutesLeft, type Account } from '@/captions/lib/account';
import { accountsOn, supabase } from '@/captions/lib/auth';

/** The top line on the home page: sign in, or minutes left and sign out. */
export function AccountBar({ ready, signedIn, account }: { ready: boolean; signedIn: boolean; account: Account | null }) {
  if (!accountsOn || !ready) return null;

  if (!signedIn) {
    return (
      <div className="account-bar">
        <Link href="/ai-caption/login">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="account-bar">
      {account && (
        <Link href="/ai-caption/account" id="minutes-left">
          {minutesLeft(account)} minutes left
        </Link>
      )}
      <button className="ghost" onClick={() => supabase?.auth.signOut()}>
        Sign out
      </button>
    </div>
  );
}
