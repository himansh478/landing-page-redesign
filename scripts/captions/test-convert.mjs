import { registerHooks } from 'node:module';

// The language step's failure handling, with a fake Gemini, so no calls go out. Usage:
//   node scripts/test-convert.mjs
registerHooks({
  resolve(specifier, context, next) {
    if (specifier === './limits' || specifier === './gemini') return next(`${specifier}.ts`, context);
    return next(specifier, context);
  },
});

const { convert } = await import('../../src/captions/server/convert.ts');

const counts = {};
const reply = (items) => ({
  ok: true,
  json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify(items) }] } }] }),
});

let script = () => null;
globalThis.fetch = async (url, init) => {
  const model = url.match(/models\/([^:]+)/)[1];
  counts[model] = (counts[model] ?? 0) + 1;
  const text = JSON.parse(init.body).contents[0].parts[0].text;
  const words = JSON.parse(text.slice(text.lastIndexOf('Tokens:') + 8));
  const good = words.map((w) => [`स${w}`.replace(/[a-z0-9]/g, 'क'), w]);
  return script({ model, words, good }) ?? reply(good);
};

const words = Array.from({ length: 50 }, (_, i) => `w${i}`);
const check = (name, passed, detail) => console.log(`${passed ? 'PASS' : 'FAIL'} ${name}${passed ? '' : ` ${JSON.stringify(detail).slice(0, 200)}`}`);
const reset = () => Object.keys(counts).forEach((k) => delete counts[k]);

// 1. Big batches always lose one word, small ones are fine.
script = ({ words: w, good }) => (w.length > 10 ? reply(good.slice(1)) : null);
let out = await convert(words);
check('a miscounted batch is split until it works', out.length === 50 && out.every((t, i) => t.fixed === `w${i}`), out.length);

// 3. Latin letters in the Hindi field are asked for again, then used if nothing better comes.
reset();
let first = true;
script = ({ good }) => {
  if (!first) return null;
  first = false;
  return reply(good.map(([, hinglish]) => ['reel', hinglish]));
};
out = await convert(words.slice(0, 3));
check('English letters in the Hindi view are retried', out.every((t) => !/[a-z]/.test(t.spoken)), out);

reset();
script = ({ good }) => reply(good.map(([, hinglish]) => ['बोনস', hinglish]));
out = await convert(words.slice(0, 2));
check('Bengali letters are asked again once, and the job still finishes', out.length === 2 && Object.values(counts).reduce((a, b) => a + b, 0) === 2, counts);

// 4. Real Hindi with marks, numbers and joiners passes first time.
reset();
script = ({ words: w }) => reply(w.map(() => ['क्ष‍त्र ज्ञ हूँ दो हज़ार', 'x']));
out = await convert(['a']);
check('real Devanagari is accepted first time', Object.values(counts).reduce((a, b) => a + b, 0) === 1, counts);

// 5. A true outage still reports failure instead of inventing text.
reset();
script = () => ({ ok: false, status: 400, headers: new Headers() });
let failed = false;
await convert(['a']).catch(() => (failed = true));
check('a real failure is still reported', failed);

// 6. One word left in English letters is asked about alone.
reset();
script = ({ words: w, good }) => reply(w.length === 1 ? good : good.map((t, i) => (i === 0 ? ['Instagram', t[1]] : t)));
out = await convert(['x', 'y', 'z']);
check('a word left in English letters is fixed on its own', out.every((t) => !/[a-z]/i.test(t.spoken)) && out.length === 3, out);

// 7. A model out of its daily limit hands over at once, with no waiting.
reset();
const dailyLimit = () =>
  new Response(JSON.stringify({ error: { details: [{ retryDelay: '50320s' }] } }), { status: 429 });
script = ({ model, good }) => (model === 'gemini-3.5-flash-lite' ? dailyLimit() : reply(good));
const started = performance.now();
out = await convert(['x', 'y']);
check('a daily limit moves to the next model at once', out.length === 2 && counts['gemini-3.5-flash-lite'] === 1 && counts['gemini-3.1-flash-lite'] === 1 && performance.now() - started < 1000, counts);

// 8. Every model out still fails quickly, and is reported, rather than hanging.
reset();
script = () => dailyLimit();
failed = false;
const began = performance.now();
await convert(['a']).catch(() => (failed = true));
check('all models out fails fast', failed && performance.now() - began < 1000, counts);
