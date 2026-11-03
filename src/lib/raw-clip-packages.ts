import { supabaseAdmin } from '@/lib/supabase-admin';
import cloudinary from '@/lib/cloudinary';
import { razorpay } from '@/lib/razorpay';

// Single source of truth for what each raw-clips package costs and delivers.
// Prices are set HERE on the server; the amount a browser sends is ignored.
export const RAW_CLIP_PACKAGES = {
  Starter: { price: 19, file: 'raw-clips-starter.zip' },
  Pro: { price: 99, file: 'raw-clips-pro.zip' },
} as const;

export type RawClipPackage = keyof typeof RAW_CLIP_PACKAGES;

export function isRawClipPackage(value: unknown): value is RawClipPackage {
  return typeof value === 'string' && value in RAW_CLIP_PACKAGES;
}

// Signed, 24-hour Cloudinary link to the package ZIP.
export function packageDownloadUrl(packageType: string): string | null {
  const pkg = isRawClipPackage(packageType) ? RAW_CLIP_PACKAGES[packageType] : RAW_CLIP_PACKAGES.Starter;
  try {
    return cloudinary.utils.url(pkg.file, {
      resource_type: 'raw',
      type: 'authenticated',
      sign_url: true,
      secure: true,
      expires_at: Math.floor(Date.now() / 1000) + 86400,
    });
  } catch (err) {
    console.error('Cloudinary download URL generation failed:', err);
    return null;
  }
}

type Purchase = { order_id: string; amount: number; package_type: string; status: string };

/**
 * Marks an order paid, but only if the captured amount matches the server-side
 * price of the package that order was created for. Returns false otherwise.
 */
export async function markPurchasePaid(orderId: string, paymentId: string, paidPaise: number): Promise<boolean> {
  const { data: purchase, error } = await supabaseAdmin
    .from('raw_clips_purchases')
    .select('order_id, amount, package_type, status')
    .eq('order_id', orderId)
    .single<Purchase>();

  if (error || !purchase) {
    console.error('Raw clips purchase not found for order:', orderId);
    return false;
  }
  if (purchase.status === 'SUCCESS') return true;

  const expected = isRawClipPackage(purchase.package_type) ? RAW_CLIP_PACKAGES[purchase.package_type].price : null;
  if (expected === null || paidPaise !== expected * 100) {
    console.warn(`Amount mismatch for order ${orderId}: paid ${paidPaise} paise, expected ${expected === null ? 'unknown package' : expected * 100}`);
    return false;
  }

  const { error: updateError } = await supabaseAdmin
    .from('raw_clips_purchases')
    .update({ status: 'SUCCESS', payment_id: paymentId, download_url: packageDownloadUrl(purchase.package_type) })
    .eq('order_id', orderId);

  if (updateError) {
    console.error('Raw clips purchase update failed:', updateError);
    return false;
  }
  return true;
}

/**
 * Asks Razorpay directly whether an order has a captured payment, so buyers
 * get their download even if the webhook is missing or delayed.
 */
export async function confirmWithRazorpay(orderId: string): Promise<boolean> {
  try {
    const res = (await razorpay.orders.fetchPayments(orderId)) as {
      items?: { id: string; status: string; amount: number | string }[];
    };
    const captured = res.items?.find((p) => p.status === 'captured');
    if (!captured) return false;
    return markPurchasePaid(orderId, captured.id, Number(captured.amount));
  } catch (err) {
    console.error('Razorpay order lookup failed:', err instanceof Error ? err.message : err);
    return false;
  }
}
