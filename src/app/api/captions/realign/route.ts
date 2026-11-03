import { realign, type Language } from '@/captions/server/align';
import { signInRequired, viewerOf } from '@/captions/server/auth';
import { convert } from '@/captions/server/convert';

/** Seconds the host lets one call run. */
export const maxDuration = 60;

const MOST_WORDS = 200;

// Re-times one short phrase after a word fix. The browser sends only that phrase's audio.
export async function POST(request: Request) {
  if (!(await viewerOf(request))) return signInRequired(request);
  const form = await request.formData();
  const audio = form.get('audio');
  const words = JSON.parse(String(form.get('words'))) as string[];
  const language = form.get('language') as Language;
  if (!(audio instanceof Blob) || !words.length || words.length > MOST_WORDS) return Response.json({ error: 'Bad request' }, { status: 400 });

  try {
    // The timing model reads Devanagari, so Hindi-language edits are spelt out first.
    const converted = language === 'hi' ? await convert(words) : [];
    const spoken = language === 'hi' ? converted.map((c) => c.spoken) : words;
    const timed = await realign(await audio.arrayBuffer(), spoken, language);
    return Response.json({ timed, converted });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : 'Re-timing failed' }, { status: 502 });
  }
}
