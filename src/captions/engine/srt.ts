import { captionEnd, captionStart, type Caption } from './types';

const stamp = (seconds: number) => {
  const ms = Math.round(Math.max(0, seconds) * 1000);
  const pad = (n: number, width = 2) => String(n).padStart(width, '0');
  return `${pad(Math.floor(ms / 3600000))}:${pad(Math.floor(ms / 60000) % 60)}:${pad(Math.floor(ms / 1000) % 60)},${pad(ms % 1000, 3)}`;
};

export const toSrt = (captions: Caption[]) =>
  captions
    .map((c, i) => `${i + 1}\n${stamp(captionStart(c))} --> ${stamp(captionEnd(c))}\n${c.words.map((w) => w.text).join(' ')}\n`)
    .join('\n');
