import { FREE_MINUTES } from '@/captions/lib/plans';
import { rpc } from './supabase';

const FREE_SECONDS = FREE_MINUTES * 60;
const HISTORY_ROWS = 25;

export type AccountState = { freeLeft: number; paidLeft: number; paidUntil: string | null; watermark: boolean };
type Spend = { ok: true; usageId: number } | { ok: false; short: number };
type Settled = { ok: boolean; already?: boolean; reason?: string };

export const accountState = (user: string) => rpc<AccountState>('caption_state', { p_user: user, p_free_seconds: FREE_SECONDS });

export const accountHistory = (user: string) => rpc<{ usage: unknown[]; orders: unknown[] }>('caption_history', { p_user: user, p_limit: HISTORY_ROWS });

/** Takes minutes before the work starts, so parallel uploads can't overspend. */
export const spend = (user: string, seconds: number, label: string) =>
  rpc<Spend>('caption_spend', { p_user: user, p_seconds: seconds, p_free_seconds: FREE_SECONDS, p_label: label });

export const refund = (user: string, usageId: number) => rpc<{ ok: boolean }>('caption_refund', { p_user: user, p_usage: usageId });

export const openOrder = (order: string, user: string, plan: string, amountPaise: number, seconds: number, days: number) =>
  rpc('caption_open_order', { p_order: order, p_user: user, p_plan: plan, p_amount: amountPaise, p_seconds: seconds, p_days: days });

/** Credits an order once. `user` is set when the buyer confirms; webhooks leave it out. */
export const settleOrder = (order: string, payment: string, paidPaise: number, user: string | null) =>
  rpc<Settled>('caption_settle_order', { p_order: order, p_payment: payment, p_paid_paise: paidPaise, p_user: user });

/** What sync stores for a project. */
export const saveCloudProject = (user: string, id: string, name: string, data: unknown) =>
  rpc('caption_project_save', { p_user: user, p_id: id, p_name: name, p_data: data });
export const listCloudProjects = (user: string) => rpc<unknown[]>('caption_project_list', { p_user: user });
export const getCloudProject = (user: string, id: string) => rpc<unknown>('caption_project_get', { p_user: user, p_id: id });
export const deleteCloudProject = (user: string, id: string) => rpc('caption_project_delete', { p_user: user, p_id: id });
