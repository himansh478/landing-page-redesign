import { signInRequired, viewerOf } from '@/captions/server/auth';
import { convert } from '@/captions/server/convert';

/** Seconds the host lets one call run. */
export const maxDuration = 60;

const MOST_WORDS = 2000;

// Respells edited words into the other scripts.
export async function POST(request: Request) {
  if (!(await viewerOf(request))) return signInRequired(request);
  const { words } = (await request.json()) as { words: string[] };
  if (!words?.length || words.length > MOST_WORDS) return Response.json({ error: 'Bad request' }, { status: 400 });

  try {
    return Response.json({ converted: await convert(words) });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : 'Language step failed' }, { status: 502 });
  }
}
