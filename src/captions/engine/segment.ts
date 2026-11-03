import type { Canvas, CanvasKit, Image as SkImage, InputRect } from 'canvaskit-wasm';

// Text behind the person: frame, then captions, then the person again on top. The
// mask comes from a model running in the browser, so the picture stays on this device.
const WASM = '/mediapipe/wasm';
const MODEL = '/models/selfie_segmenter.tflite';
/** Confidence range that fades from background to person, for a soft edge. */
const EDGE_LOW = 0.45;
const EDGE_HIGH = 0.7;

type Segmenter = import('@mediapipe/tasks-vision').ImageSegmenter;
type Source = Parameters<Segmenter['segment']>[0];

export class PersonMask {
  private constructor(private segmenter: Segmenter) {}

  static async create() {
    const { FilesetResolver, ImageSegmenter } = await import('@mediapipe/tasks-vision');
    const vision = await FilesetResolver.forVisionTasks(WASM);
    const segmenter = await ImageSegmenter.createFromOptions(vision, {
      baseOptions: { modelAssetPath: MODEL, delegate: 'CPU' },
      runningMode: 'IMAGE',
      outputCategoryMask: false,
      outputConfidenceMasks: true,
    });
    return new PersonMask(segmenter);
  }

  /** The person as an image whose alpha is 1 on them and 0 elsewhere. */
  read(ck: CanvasKit, source: Source): SkImage | null {
    const result = this.segmenter.segment(source);
    const masks = result?.confidenceMasks;
    if (!masks?.length) return null;

    const mask = masks[masks.length - 1];
    const { width, height } = mask;
    const confidence = mask.getAsFloat32Array();
    const pixels = new Uint8Array(width * height * 4);
    for (let i = 0; i < confidence.length; i++) {
      const x = Math.min(1, Math.max(0, (confidence[i] - EDGE_LOW) / (EDGE_HIGH - EDGE_LOW)));
      pixels[i * 4 + 3] = Math.round(x * x * (3 - 2 * x) * 255);
    }
    for (const m of masks) m.close();

    return ck.MakeImage({ width, height, alphaType: ck.AlphaType.Unpremul, colorType: ck.ColorType.RGBA_8888, colorSpace: ck.ColorSpace.SRGB }, pixels, width * 4);
  }

  close() {
    this.segmenter.close();
  }
}

/** Draws only the person from `frame` over whatever is on the canvas. `view` is the part of the frame in shot. */
export function drawCutout(ck: CanvasKit, canvas: Canvas, frame: SkImage, mask: SkImage, view: { left: number; share: number }, target: InputRect) {
  const part = (image: SkImage) => ck.LTRBRect(view.left * image.width(), 0, (view.left + view.share) * image.width(), image.height());
  canvas.saveLayer();
  canvas.drawImageRectOptions(frame, part(frame), target, ck.FilterMode.Linear, ck.MipmapMode.None, null);
  const paint = new ck.Paint();
  paint.setBlendMode(ck.BlendMode.DstIn);
  canvas.drawImageRectOptions(mask, part(mask), target, ck.FilterMode.Linear, ck.MipmapMode.None, paint);
  paint.delete();
  canvas.restore();
}
