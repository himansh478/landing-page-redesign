// All pricing lives here. The server reads these numbers when it creates an order, so
// a browser can never change what it pays. Prices are in rupees.
export const FREE_MINUTES = 10;

export const PLANS = {
  starter: { name: 'Starter', price: 199, minutes: 60, days: 30 },
  creator: { name: 'Creator', price: 499, minutes: 200, days: 30 },
  studio: { name: 'Studio', price: 1499, minutes: 800, days: 30 },
} as const;

// Captions are tuned and tested on short clips, so longer videos are turned away. Files
// run a little over their stated length, so a one-minute export still fits.
const LONGEST_VIDEO = 60;
const LENGTH_SLACK = 0.5;

export const isTooLong = (seconds: number) => seconds > LONGEST_VIDEO + LENGTH_SLACK;
export const TOO_LONG = 'Videos can be up to 1 minute long. Please trim this one and try again.';

export type PlanId = keyof typeof PLANS;

export const isPlan = (value: unknown): value is PlanId => typeof value === 'string' && value in PLANS;
