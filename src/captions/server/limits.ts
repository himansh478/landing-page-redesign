// Free tiers cap calls per minute, and a long video makes dozens of calls. Waiting
// and trying again turns a limit into a slower upload instead of a failed one.
const ATTEMPTS = 8;
const FIRST_WAIT = 2000;
const LONGEST_WAIT = 65000;
const JITTER = 1500;
/** A request that hangs must fail and retry, not freeze the whole upload. */
const REQUEST_TIMEOUT = 60000;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** How long a service asks us to wait. Gemini says so in the reply, not in the headers. */
async function askedWait(res: Response) {
  const header = Number(res.headers.get('retry-after')) * 1000;
  if (header) return header;
  const reply = await res.clone().json().catch(() => null);
  const details: { retryDelay?: string }[] = reply?.error?.details ?? [];
  return parseFloat(details.find((detail) => detail.retryDelay)?.retryDelay ?? '0') * 1000;
}

export async function fetchWithRetry(url: string, make: () => RequestInit, attempts = ATTEMPTS) {
  for (let attempt = 0; ; attempt++) {
    const last = attempt === attempts - 1;
    let asked = 0;
    let reason = 'no answer';
    try {
      const res = await fetch(url, { ...make(), signal: AbortSignal.timeout(REQUEST_TIMEOUT) });
      const busy = res.status === 429 || res.status >= 500;
      if (!busy || last) return res;
      asked = await askedWait(res);
      // A daily limit won't clear by waiting, so the caller hears at once.
      if (asked > LONGEST_WAIT) return res;
      reason = String(res.status);
    } catch (e) {
      if (last) throw e;
    }
    // Services ask for a few seconds even when the limit lasts a minute, so the wait still
    // grows, and parallel calls spread out instead of all coming back together.
    const pause = Math.min(LONGEST_WAIT, Math.max(asked, FIRST_WAIT * 2 ** attempt)) + Math.random() * JITTER;
    console.warn(`${new URL(url).host} said ${reason}, trying again in ${(pause / 1000).toFixed(1)} s`);
    await wait(pause);
  }
}

/** Runs tasks with a limit, keeping the output in input order. */
export async function inOrder<T, R>(items: T[], limit: number, run: (item: T) => Promise<R>) {
  const results = new Array<R>(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const index = next++;
        results[index] = await run(items[index]);
      }
    })
  );
  return results;
}
