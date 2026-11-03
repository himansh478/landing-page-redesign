import { signInRequired, viewerOf } from '@/captions/server/auth';
import { proofread } from '@/captions/server/proofread';

/** Seconds the host lets one call run. */
export const maxDuration = 60;

const MOST_WORDS = 12000;

export async function POST(request: Request) {
  if (!(await viewerOf(request))) return signInRequired(request);
  const { words, vocabulary } = (await request.json()) as { words: string[]; vocabulary?: string[] };
  if (!words?.length || words.length > MOST_WORDS) return Response.json({ error: 'Bad request' }, { status: 400 });

  try {
    return Response.json({ suggestions: await proofread(words, vocabulary ?? []) });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : 'Proofreading failed' }, { status: 502 });
  }
}
