import CanvasKitInit, { type CanvasKit, type Surface } from 'canvaskit-wasm';
import { FontBook } from './fonts';
import { CaptionRenderer } from './renderer';

export type Studio = { ck: CanvasKit; surface: Surface; fonts: FontBook; renderer: CaptionRenderer };

let kit: Promise<CanvasKit> | null = null;

export const loadCanvasKit = () => (kit ??= CanvasKitInit({ locateFile: (file) => `/wasm/${file}` }));

let book: FontBook | null = null;

export async function loadFonts() {
  const ck = await loadCanvasKit();
  return (book ??= new FontBook(ck));
}

const studios = new WeakMap<HTMLCanvasElement, Promise<Studio>>();

/** One studio per canvas: WebGL ties a surface to its canvas for good. */
export function createStudio(canvasEl: HTMLCanvasElement, width: number, height: number) {
  let studio = studios.get(canvasEl);
  if (!studio) {
    studio = (async () => {
      const ck = await loadCanvasKit();
      const fonts = await loadFonts();
      const surface = ck.MakeWebGLCanvasSurface(canvasEl, ck.ColorSpace.SRGB, { preserveDrawingBuffer: 1 });
      if (!surface) throw new Error('Could not create a drawing surface');
      return { ck, surface, fonts, renderer: new CaptionRenderer(ck, fonts.provider, width, height) };
    })();
    studios.set(canvasEl, studio);
  }
  return studio;
}
