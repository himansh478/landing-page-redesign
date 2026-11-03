'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAccount, type Account } from '@/captions/lib/account';
import { accountsOn, api, supabase } from '@/captions/lib/auth';
import { PLANS, type PlanId } from '@/captions/lib/plans';

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { email?: string };
  theme: { color: string };
  handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
  modal: { ondismiss: () => void };
};

// Read locally rather than declared on Window, which the website's own checkout already types.
type Checkout = new (options: RazorpayOptions) => { open(): void };
const checkout = () => (window as unknown as { Razorpay?: Checkout }).Razorpay;

const CHECKOUT_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

const loadCheckout = () =>
  new Promise<void>((resolve, reject) => {
    if (checkout()) return resolve();
    const script = document.createElement('script');
    script.src = CHECKOUT_SCRIPT;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Could not load the payment page.'));
    document.body.appendChild(script);
  });

const day = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const minutes = (seconds: number) => (seconds / 60).toFixed(seconds % 60 ? 1 : 0);

function Minutes({ account }: { account: Account }) {
  return (
    <div className="stats">
      <div className="stat">
        <b id="free-left">{minutes(account.freeLeft)}</b>
        <span>free minutes left of {account.freeMinutes} this month</span>
      </div>
      <div className="stat">
        <b id="paid-left">{minutes(account.paidLeft)}</b>
        <span>{account.paidUntil ? `paid minutes, valid until ${day(account.paidUntil)}` : 'paid minutes'}</span>
      </div>
      <div className="stat">
        <b id="watermark">{account.watermark ? 'On' : 'Off'}</b>
        <span>{account.watermark ? 'watermark. Any pack removes it' : 'watermark, while your pack is valid'}</span>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const { ready, signedIn, account, refresh } = useAccount();
  const [buying, setBuying] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (accountsOn && ready && !signedIn) location.replace('/ai-caption/login?next=/ai-caption/account');
  }, [ready, signedIn]);

  const confirm = async (orderId: string, paymentId: string, signature: string) => {
    const res = await api('/api/captions/billing/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, paymentId, signature }),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) throw new Error(body.error ?? 'This payment could not be confirmed.');
  };

  const buy = async (plan: PlanId) => {
    setBuying(plan);
    setError(null);
    setMessage(null);
    try {
      const res = await api('/api/captions/billing/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const order = (await res.json()) as { orderId: string; amount: number; currency: string; keyId: string; error?: string };
      if (!res.ok) throw new Error(order.error ?? 'Could not start the payment.');

      await loadCheckout();
      new (checkout()!)({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Cwaya Captions',
        description: `${PLANS[plan].name}: ${PLANS[plan].minutes} minutes`,
        order_id: order.orderId,
        prefill: { email: account?.email ?? undefined },
        theme: { color: '#ef8557' },
        handler: (response) => {
          confirm(response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature)
            .then(() => {
              setMessage('Payment received. Your minutes are ready.');
              return refresh();
            })
            .catch((e) => setError(e instanceof Error ? e.message : 'This payment could not be confirmed.'))
            .finally(() => setBuying(null));
        },
        modal: { ondismiss: () => setBuying(null) },
      }).open();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start the payment.');
      setBuying(null);
    }
  };

  if (!accountsOn) {
    return (
      <main className="home">
        <h1>Accounts are off</h1>
        <p className="lead">This copy runs in local mode, with no limits.</p>
        <Link href="/ai-caption">Back to your projects</Link>
      </main>
    );
  }
  if (!account) return <main className="home">Loading your account…</main>;

  return (
    <main className="home">
      <div className="account-bar">
        <Link href="/ai-caption">Your projects</Link>
        <button className="ghost" onClick={() => supabase?.auth.signOut()}>
          Sign out
        </button>
      </div>
      <h1>Your account</h1>
      <p className="lead">{account.email}</p>

      <Minutes account={account} />
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {message && <p role="status">{message}</p>}

      <h2 className="section-title">Buy minutes</h2>
      {!account.paymentsReady && <p className="hint">Payments aren&apos;t switched on yet.</p>}
      <div className="plans">
        {(Object.keys(PLANS) as PlanId[]).map((id) => {
          const plan = PLANS[id];
          return (
            <div className="plan" key={id}>
              <b>{plan.name}</b>
              <div className="price">₹{plan.price}</div>
              <span>
                {plan.minutes} minutes, valid {plan.days} days
              </span>
              <span>No watermark</span>
              <button className="primary" disabled={!account.paymentsReady || buying !== null} onClick={() => buy(id)}>
                {buying === id ? 'One moment…' : `Buy ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      <h2 className="section-title">Recent videos</h2>
      {account.usage.length === 0 ? (
        <p className="hint">Nothing yet.</p>
      ) : (
        <table className="history" id="usage">
          <thead>
            <tr>
              <th>Date</th>
              <th>Video</th>
              <th>Minutes</th>
            </tr>
          </thead>
          <tbody>
            {account.usage.map((row, i) => (
              <tr key={i}>
                <td>{day(row.at)}</td>
                <td>{row.label}</td>
                <td className="number">{row.refunded ? 'Refunded' : minutes(row.seconds)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {account.orders.length > 0 && (
        <>
          <h2 className="section-title">Payments</h2>
          <table className="history" id="orders">
            <thead>
              <tr>
                <th>Date</th>
                <th>Pack</th>
                <th>Paid</th>
              </tr>
            </thead>
            <tbody>
              {account.orders.map((row, i) => (
                <tr key={i}>
                  <td>{day(row.at)}</td>
                  <td>{PLANS[row.plan as PlanId]?.name ?? row.plan}</td>
                  <td className="number">₹{row.amountPaise / 100}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </main>
  );
}
