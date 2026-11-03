import { signInRequired, viewerOf } from '@/captions/server/auth';
import { translate } from '@/captions/server/translate';

/** Seconds the host lets one call run. */
export const maxDuration = 60;

const MOST_LINES = 3000;

export async function POST(request: Request) {
  if (!(await viewerOf(request))) return signInRequired(request);
  const { lines } = (await request.json()) as { lines: string[] };
  if (!lines?.length || lines.length > MOST_LINES) return Response.json({ error: 'Bad request' }, { status: 400 });

  try {
    return Response.json({ lines: await translate(lines) });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : 'Translation failed' }, { status: 502 });
  }
}
