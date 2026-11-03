// Writes a QuickTime Animation MOV: lossless, with a real alpha channel, and read by
// Premiere, After Effects, Resolve and Final Cut. Browsers can't encode video with
// alpha that editors accept, but this format is simple enough to write here, so the
// captions never have to leave the device.
//
// Most of a caption layer is empty and most frames match the one before, so each frame
// stores only the rows that changed, with a full frame every second for easy seeking.

const TIMESCALE = 90000;
const FLUSH_BYTES = 4 * 1024 * 1024;
const LONGEST_RUN = 128;
const LONGEST_LITERAL = 127;
/** One byte per row for the start, plus the rest of the frame's own header. */
const FRAME_HEADER = 15;
const MDAT_POSITION = 20;
const MDAT_HEADER = 16;

type Bytes = number[] | Uint8Array;

const be16 = (n: number) => [(n >>> 8) & 255, n & 255];
const be32 = (n: number) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
const be64 = (n: number) => [...be32(Math.floor(n / 2 ** 32)), ...be32(n % 2 ** 32)];
const ascii = (text: string) => Array.from(text, (c) => c.charCodeAt(0));
const zeros = (count: number) => new Array<number>(count).fill(0);
const pascal = (text: string) => [text.length, ...ascii(text)];

function join(parts: Bytes[]) {
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.length;
  }
  return out;
}

const atom = (type: string, ...parts: Bytes[]) => {
  const body = join(parts);
  return join([be32(body.length + 8), ascii(type), body]);
};

const IDENTITY = [0x00010000, 0, 0, 0, 0x00010000, 0, 0, 0, 0x40000000].flatMap(be32);

function sameRow(a: Uint32Array, b: Uint32Array, row: number, width: number) {
  const start = row * width;
  for (let i = start; i < start + width; i++) if (a[i] !== b[i]) return false;
  return true;
}

export class AnimationWriter {
  private sizes: number[] = [];
  private keyframes: number[] = [];
  private previous: Uint32Array | null = null;
  private pending: Uint8Array[] = [];
  private pendingBytes = 0;
  private position = 0;
  private dataBytes = 0;
  private scratch: Uint8Array;
  private keyEvery: number;
  private frameTicks: number;
  private at = 0;

  constructor(
    private writable: FileSystemWritableFileStream,
    private width: number,
    private height: number,
    fps: number
  ) {
    this.frameTicks = Math.round(TIMESCALE / fps);
    this.keyEvery = Math.max(1, Math.round(fps));
    this.scratch = new Uint8Array((Math.ceil(width * 4 + width / LONGEST_LITERAL) + 3) * height + FRAME_HEADER);
  }

  /** Seconds each frame lasts, after rounding to the file's clock. */
  get frameSeconds() {
    return this.frameTicks / TIMESCALE;
  }

  async start() {
    const header = join([atom('ftyp', ascii('qt  '), be32(0x20050300), ascii('qt  ')), be32(1), ascii('mdat'), be64(0)]);
    await this.append(header);
  }

  /** Adds a frame of straight-alpha RGBA pixels, or null to repeat the last one. */
  async add(rgba: Uint8Array | null) {
    const index = this.sizes.length;
    const key = index % this.keyEvery === 0;
    const pixels = rgba ? new Uint32Array(rgba.slice().buffer) : this.previous;
    if (!pixels) throw new Error('The first frame needs pixels');

    const frame = this.encode(pixels, key ? null : this.previous);
    if (key) this.keyframes.push(index + 1);
    this.sizes.push(frame.length);
    this.dataBytes += frame.length;
    this.previous = pixels;
    await this.append(frame.slice());
  }

  async finish() {
    await this.flush();
    await this.writable.write({ type: 'write', position: MDAT_POSITION + 8, data: new Uint8Array(be64(this.dataBytes + MDAT_HEADER)) });
    await this.writable.write({ type: 'write', position: this.position, data: this.movie() });
    await this.writable.close();
  }

  private put(byte: number) {
    this.scratch[this.at++] = byte;
  }

  private put16(value: number) {
    this.put((value >>> 8) & 255);
    this.put(value & 255);
  }

  private putPixel(value: number) {
    this.put(value >>> 24);
    this.put(value & 255);
    this.put((value >>> 8) & 255);
    this.put((value >>> 16) & 255);
  }

  private encodeRow(pixels: Uint32Array, row: number) {
    const start = row * this.width;
    const end = start + this.width;
    this.put(1); // Skip code: start at the first pixel.

    let i = start;
    while (i < end) {
      let run = 1;
      while (i + run < end && run < LONGEST_RUN && pixels[i + run] === pixels[i]) run++;

      if (run >= 2) {
        this.put(256 - run);
        this.putPixel(pixels[i]);
        i += run;
        continue;
      }

      let count = 1;
      while (i + count < end && count < LONGEST_LITERAL && !(i + count + 1 < end && pixels[i + count] === pixels[i + count + 1])) count++;
      this.put(count);
      for (let k = 0; k < count; k++) this.putPixel(pixels[i + k]);
      i += count;
    }
    this.put(255); // End of row.
  }

  private encode(pixels: Uint32Array, previous: Uint32Array | null) {
    const { height, width } = this;
    let first = 0;
    let last = height;
    if (previous) {
      while (first < height && sameRow(pixels, previous, first, width)) first++;
      while (last > first && sameRow(pixels, previous, last - 1, width)) last--;
    }

    this.at = 4;
    if ((first === 0 && last === height) || first === height) {
      this.put16(0);
    } else {
      this.put16(8);
      this.put16(first);
      this.put16(0);
      this.put16(last - first);
      this.put16(0);
    }
    for (let row = first; row < last; row++) this.encodeRow(pixels, row);
    this.put(0); // End of frame.

    this.scratch.set(be32(this.at), 0);
    return this.scratch.subarray(0, this.at);
  }

  private async append(bytes: Uint8Array) {
    this.pending.push(bytes);
    this.pendingBytes += bytes.length;
    if (this.pendingBytes >= FLUSH_BYTES) await this.flush();
  }

  private async flush() {
    if (this.pendingBytes === 0) return;
    const data = join(this.pending);
    await this.writable.write({ type: 'write', position: this.position, data });
    this.position += data.length;
    this.pending = [];
    this.pendingBytes = 0;
  }

  private movie() {
    const { width, height, sizes, keyframes, frameTicks } = this;
    const duration = sizes.length * frameTicks;

    const description = join([
      be32(86), ascii('rle '), zeros(6), be16(1),
      be16(0), be16(0), ascii('appl'), be32(0), be32(1024),
      be16(width), be16(height), be32(0x00480000), be32(0x00480000), be32(0), be16(1),
      pascal('Animation'), zeros(32 - 'Animation'.length - 1),
      be16(32), be16(0xffff),
    ]);

    const table = atom(
      'stbl',
      atom('stsd', be32(0), be32(1), description),
      atom('stts', be32(0), be32(1), be32(sizes.length), be32(frameTicks)),
      atom('stss', be32(0), be32(keyframes.length), keyframes.flatMap(be32)),
      atom('stsc', be32(0), be32(1), be32(1), be32(sizes.length), be32(1)),
      atom('stsz', be32(0), be32(0), be32(sizes.length), sizes.flatMap(be32)),
      atom('co64', be32(0), be32(1), be64(MDAT_POSITION + MDAT_HEADER))
    );

    const media = atom(
      'mdia',
      atom('mdhd', be32(0), be32(0), be32(0), be32(TIMESCALE), be32(duration), be16(0), be16(0)),
      atom('hdlr', be32(0), ascii('mhlr'), ascii('vide'), zeros(12), pascal('Video')),
      atom(
        'minf',
        atom('vmhd', be32(1), be16(0x40), zeros(6)),
        atom('hdlr', be32(0), ascii('dhlr'), ascii('alis'), zeros(12), pascal('Data')),
        atom('dinf', atom('dref', be32(0), be32(1), atom('alis', be32(1)))),
        table
      )
    );

    return atom(
      'moov',
      atom('mvhd', be32(0), be32(0), be32(0), be32(TIMESCALE), be32(duration), be32(0x00010000), be16(0x0100), zeros(10), IDENTITY, zeros(24), be32(2)),
      atom(
        'trak',
        atom('tkhd', be32(0xf), be32(0), be32(0), be32(1), be32(0), be32(duration), zeros(8), be16(0), be16(0), be16(0), be16(0), IDENTITY, be32(width * 65536), be32(height * 65536)),
        media
      )
    );
  }
}
