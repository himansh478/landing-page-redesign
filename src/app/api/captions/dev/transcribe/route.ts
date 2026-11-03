import { loudness } from '@/captions/server/align';
import { findSpeechGaps } from '@/captions/server/speech-gaps';
import { transcribe } from '@/captions/server/transcribe';

// Dev only: runs just the listening step, for measuring it without the slow language step.
export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') return new Response('Not found', { status: 404 });
  const audio = await request.arrayBuffer();
  const envelope = await loudness(audio);
  const { words, language, reread, secondLooks, improved } = await transcribe(audio, Promise.resolve(envelope), [], () => {});
  return Response.json({ language, reread, secondLooks, improved, words, speechGaps: findSpeechGaps(envelope, words) });
}
