import { wakeWorker } from '@/captions/server/align';

// A free Hugging Face Space sleeps after two days with no requests, and its first job after
// that waits for it to start. A daily ping from Vercel's cron (vercel.json) keeps it awake.
// It only asks the worker whether it is ready, so it is safe to leave open.
export const maxDuration = 60;

export async function GET() {
  try {
    return Response.json(await wakeWorker());
  } catch (e) {
    return Response.json({ error: `The timing worker did not answer: ${e}` }, { status: 502 });
  }
}
