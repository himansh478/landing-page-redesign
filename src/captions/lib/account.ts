import { useCallback, useEffect, useState } from 'react';
import { accountsOn, api, supabase } from './auth';

export type Account = {
  email: string | null;
  freeMinutes: number;
  freeLeft: number;
  paidLeft: number;
  paidUntil: string | null;
  watermark: boolean;
  paymentsReady: boolean;
  usage: { label: string; seconds: number; refunded: boolean; at: string }[];
  orders: { plan: string; amountPaise: number; seconds: number; at: string }[];
};

/** The account, or why a signed-in person isn't let in yet, such as the team-only notice. */
async function readAccount(): Promise<{ account: Account | null; refused: string | null }> {
  const res = await api('/api/captions/account');
  // The session is kept on this device, so the server can know first that it has ended.
  if (res.status === 401) await supabase?.auth.signOut({ scope: 'local' });
  if (res.status === 403) {
    const { error } = (await res.json().catch(() => ({}))) as { error?: string };
    return { account: null, refused: error ?? 'This account is not let in yet.' };
  }
  return { account: res.ok ? ((await res.json()) as Account) : null, refused: null };
}

export const fetchAccount = async () => (await readAccount()).account;

/** The mark goes on unless the account proves it shouldn't, so a failed check can't remove it. */
export async function currentWatermark() {
  if (!accountsOn) return false;
  return (await fetchAccount())?.watermark ?? true;
}

export const minutesLeft = (account: Account) => Math.floor((account.freeLeft + account.paidLeft) / 60);

/** Who is signed in, and their minutes. Local mode reports ready with nobody signed in. */
export function useAccount() {
  const [state, setState] = useState<{ ready: boolean; signedIn: boolean; email: string | null; account: Account | null; refused: string | null }>({
    ready: !accountsOn,
    signedIn: false,
    email: null,
    account: null,
    refused: null,
  });

  const refresh = useCallback(async () => {
    if (!supabase) return;
    const { session } = (await supabase.auth.getSession()).data;
    const { account, refused } = session ? await readAccount() : { account: null, refused: null };
    setState({ ready: true, signedIn: !!session, email: session?.user.email ?? null, account, refused });
  }, []);

  useEffect(() => {
    if (!supabase) return;
    // Supabase can deadlock if its own calls run inside this callback, so they wait a tick.
    const { data } = supabase.auth.onAuthStateChange(() => void setTimeout(refresh));
    return () => data.subscription.unsubscribe();
  }, [refresh]);

  return { ...state, refresh };
}
