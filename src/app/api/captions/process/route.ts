import { ALL_FORMATS, BufferSource, Input } from 'mediabunny';
import { isTooLong, TOO_LONG } from '@/captions/lib/plans';
import { captionText } from '@/captions/lib/project';
import { align, loudness, type WordTiming } from '@/captions/server/align';
import { signInRequired, viewerOf } from '@/captions/server/auth';
import { refund, spend } from '@/captions/server/billing';
import { convert } from '@/captions/server/convert';
import { chooseWords, listenTwice } from '@/captions/server/listen';
import { findSpeechGaps, heardWords } from '@/captions/server/speech-gaps';
import { accountsOn } from '@/captions/server/supabase';
import { transcribe } from '@/captions/server/transcribe';
import { applyVocabulary } from '@/captions/server/vocabulary';

/** A minute of the largest audio a camera writes, with room to spare. */
const LARGEST_AUDIO = 40 * 1024 * 1024;
const LOUDNESS_STEP = 0.01;
const HEADER_SLACK = 2;
/** A service can hang without ever failing, so a job has a last moment to give up. */
const LONGEST_JOB = 240000;
/** Seconds the host lets this run, above LONGEST_JOB so the job's own limit and refund come first. */
export const maxDuration = 300;
/** How often a silent job tells the phone it is still working. */
const HEARTBEAT = 5000;
const TOO_SLOW = 'This is taking too long, so we stopped. Your minutes were given back. Please try again.';
const NO_SOUND = 'We could not read the sound in this file.';
const WENT_WRONG = 'Something went wrong while making your captions. Your minutes were given back. Please try again in a few minutes.';

/** An error whose message is written for the person, so it can be shown as it is. */
class ShownError extends Error {}

function readHeader<T>(request: Request, name: string, fallback: T): T {
  try {
    return JSON.parse(decodeURIComponent(request.headers.get(name) ?? '')) as T;
  } catch {
    return fallback;
  }
}

// Audio in, timed words out. Progress streams back as one JSON object per line.
// Minutes are taken from the audio itself before any work starts, and given back if
// the job fails, so nobody pays for an upload that produced nothing.
export async function POST(request: Request) {
  if (Number(request.headers.get('content-length') ?? 0) > LARGEST_AUDIO) {
    return Response.json({ error: TOO_LONG }, { status: 413 });
  }
  // Read before refusing: Safari reports an answer that arrives mid-upload as "Load failed",
  // so someone not let in would never see why.
  const audio = await request.arrayBuffer();
  const viewer = await viewerOf(request);
  if (!viewer) return signInRequired(request);

  const vocabulary = readHeader<string[]>(request, 'x-vocabulary', []);
  const label = readHeader<string>(request, 'x-project-name', 'Video').slice(0, 120);

  let length: number;
  try {
    length = await new Input({ formats: ALL_FORMATS, source: new BufferSource(audio) }).computeDuration();
  } catch {
    return Response.json({ error: 'We could not read the sound in this file.' }, { status: 400 });
  }
  if (!(length > 0)) return Response.json({ error: 'This file has no sound to caption.' }, { status: 400 });
  if (isTooLong(length)) return Response.json({ error: TOO_LONG }, { status: 413 });

  const charge = accountsOn() ? await spend(viewer.id, Math.ceil(length), label) : null;
  if (charge && !charge.ok) {
    const minutes = Math.ceil(charge.short / 60);
    return Response.json({ error: `You need ${minutes} more minute${minutes === 1 ? '' : 's'} for this video.`, short: charge.short }, { status: 402 });
  }
  // A failed job and a phone that left both give the minutes back, but only once.
  let refunded = false;
  const giveBack = async () => {
    if (refunded || !charge?.ok) return;
    refunded = true;
    await refund(viewer.id, charge.usageId).catch((e) => console.warn(`Refund failed: ${e}`));
  };

  const encoder = new TextEncoder();
  /** The phone closed the connection, so nothing more can reach it. */
  let gone = false;
  const opened = Date.now();
  const leave = () => {
    if (gone) return;
    gone = true;
    console.warn(`The phone left after ${((Date.now() - opened) / 1000).toFixed(1)} s, so its minutes go back`);
    void giveBack();
  };

  const stream = new ReadableStream({
    cancel: leave,
    async start(controller) {
      const write = (text: string) => {
        if (gone) return;
        try {
          controller.enqueue(encoder.encode(text));
        } catch {
          leave();
        }
      };
      const send = (event: object) => write(JSON.stringify(event) + '\n');
      // Some steps run for most of a minute with nothing to report, and phones and mobile
      // networks cut a connection that stays silent that long. Blank lines keep it open.
      const beat = setInterval(() => write('\n'), HEARTBEAT);
      const started = Date.now();
      const steps: string[] = [];
      const seconds = (from: number) => ((Date.now() - from) / 1000).toFixed(1);
      const timed = <T,>(name: string, work: Promise<T>) => {
        const from = Date.now();
        return work.finally(() => steps.push(`${name} ${seconds(from)}`));
      };
      const job = async () => {
        send({ stage: 'transcribing' });
        // Each step starts as soon as it can, so they overlap instead of queueing.
        // The loudness comes from the timing worker. Without it the checks that use it are
        // skipped, so captions are still made while that worker is down.
        const loud = timed(
          'sound',
          loudness(audio).catch((e) => {
            console.warn(`Loudness unavailable, going on without it: ${e}`);
            return [] as number[];
          }),
        ).then((heard) => {
          // The charge came from the file's own header, so the sound itself has to agree.
          if (heard.length * LOUDNESS_STEP > length + HEADER_SLACK) throw new ShownError(NO_SOUND);
          return heard;
        });
        loud.catch(() => {});

        let listening: Promise<string[][]> = Promise.resolve([]);
        const { language, duration, words: found } = await timed('whisper', transcribe(audio, loud, vocabulary, (fraction) => send({ stage: 'transcribing', fraction }), (settled) => {
          listening = timed('gemini', listenTwice(audio, settled, vocabulary));
        }));
        const heard = await loud;
        // With no loudness to check against, every word Whisper heard is kept.
        const raw = chooseWords(await listening, heard.length ? heardWords(found, heard) : found);
        if (raw.length === 0) {
          await giveBack();
          send({ stage: 'error', message: 'No speech was found in this video.' });
          return;
        }

        send({ stage: 'converting' });
        const clean = raw.map((w) => w.word.replace(/[,.?!।]+$/, ''));
        const converted =
          language === 'en' ? clean.map((word) => ({ fixed: word, spoken: word, hinglish: word })) : await timed('language', convert(raw.map((w) => w.word), vocabulary, (fraction) => send({ stage: 'converting', fraction })));
        const words = applyVocabulary(raw.map((w, i) => ({ ...w, ...converted[i] })), vocabulary);

        send({ stage: 'aligning' });
        // If the timing worker can't be reached, Whisper's own word times are kept: rougher,
        // but captions the person can fix beat a failed job.
        let exact: (WordTiming | null)[] = [];
        let envelope = heard;
        let roughTiming = false;
        try {
          ({ timed: exact, envelope } = await timed('timing', align(audio, words.map((w) => w.spoken), words, language)));
        } catch (e) {
          roughTiming = true;
          console.warn(`Timing unavailable, keeping Whisper's word times: ${e}`);
        }

        const tokens = words.map((word, i) => ({
          source: language === 'en' ? word.fixed + (word.word.match(/[,.?!]+$/)?.[0] ?? '') : word.fixed,
          ...captionText(word),
          endsPhrase: /[,.?!।]$/.test(word.word),
          // A word the timing model cannot read keeps Whisper's estimate.
          start: exact[i]?.start ?? word.start,
          end: exact[i]?.end ?? word.end,
          score: exact[i]?.score ?? 0,
          unsure: word.unsure,
        }));

        // Blocks are timed apart, so a rare word near a seam can land before its neighbour.
        tokens.forEach((token, i) => {
          const before = tokens[i - 1];
          if (before && token.start < before.start) {
            token.start = before.start + 0.02;
            token.end = Math.max(token.end, token.start + 0.02);
          }
        });

        console.log(`Captions for ${length.toFixed(0)} s of sound took ${seconds(started)} s (${steps.join(', ')})${roughTiming ? ', with Whisper timing' : ''}${gone ? ', but the phone had left, so the minutes went back' : ''}`);
        send({ stage: 'done', result: { language, duration, tokens, envelope, speechGaps: findSpeechGaps(envelope, tokens), ...(roughTiming ? { roughTiming } : {}) } });
      };
      try {
        await Promise.race([job(), new Promise<never>((_, reject) => setTimeout(() => reject(new ShownError(TOO_SLOW)), LONGEST_JOB))]);
      } catch (e) {
        await giveBack();
        // A service's own error means nothing to the person, and can show its account details.
        send({ stage: 'error', message: e instanceof ShownError ? e.message : WENT_WRONG });
        // Last, and as plain text: logging an Error object threw here and lost a refund.
        console.warn(`Captions failed after ${seconds(started)} s (${steps.join(', ')}): ${e}`);
      } finally {
        clearInterval(beat);
        if (!gone) controller.close();
      }
    },
  });

  return new Response(stream, { headers: { 'Content-Type': 'application/x-ndjson' } });
}
