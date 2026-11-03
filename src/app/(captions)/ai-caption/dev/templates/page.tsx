'use client';

import { useEffect, useRef, useState } from 'react';
import { CaptionRenderer } from '@/captions/engine/renderer';
import { loadCanvasKit, loadFonts } from '@/captions/engine/studio';
import { familiesOf, templateList } from '@/captions/engine/templates';
import type { Caption, Style } from '@/captions/engine/types';

const FRAME_WIDTH = 1080;
const FRAME_HEIGHT = 1920;
const CELL_HEIGHT = 700;
const COLUMNS = 3;
const SHEET_WIDTH = 540;

// Row templates at full size on a 9:16 frame, built from the same engine as an export.
export default function TemplatesTest() {
  const sheetRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState('Drawing…');

  useEffect(() => {
    (async () => {
      const ck = await loadCanvasKit();
      const fonts = await loadFonts();
      const chosen = templateList.filter((t) => t.rows);
      await Promise.all(chosen.flatMap((t) => familiesOf(t).map((family) => fonts.ensure(family))));

      const surface = ck.MakeSurface(FRAME_WIDTH, FRAME_HEIGHT);
      if (!surface) throw new Error('No surface');
      const renderer = new CaptionRenderer(ck, fonts.provider, FRAME_WIDTH, FRAME_HEIGHT);
      const canvas = surface.getCanvas();

      const sheet = sheetRef.current;
      const context = sheet?.getContext('2d');
      if (!sheet || !context) return;
      const scale = SHEET_WIDTH / FRAME_WIDTH;
      sheet.width = SHEET_WIDTH * COLUMNS;
      sheet.height = Math.ceil(chosen.length / COLUMNS) * CELL_HEIGHT * scale;

      chosen.forEach((template: Style, i) => {
        const caption: Caption = { id: `sample-${i}`, words: (template.preview ?? []).map((text) => ({ text, start: 0, end: 2 })) };
        canvas.clear(ck.parseColorString('#1B1C20'));
        renderer.draw(canvas, [caption], 1.5, () => ({ ...template, anchorX: 0.5, anchorY: 0.5, blend: 'normal' }));
        surface.flush();
        const image = surface.makeImageSnapshot();
        const pixels = image.readPixels(0, (FRAME_HEIGHT - CELL_HEIGHT) / 2, { width: FRAME_WIDTH, height: CELL_HEIGHT, alphaType: ck.AlphaType.Unpremul, colorType: ck.ColorType.RGBA_8888, colorSpace: ck.ColorSpace.SRGB });
        image.delete();
        if (!pixels) return;
        const cell = new OffscreenCanvas(FRAME_WIDTH, CELL_HEIGHT);
        cell.getContext('2d')?.putImageData(new ImageData(new Uint8ClampedArray(pixels as Uint8Array), FRAME_WIDTH, CELL_HEIGHT), 0, 0);
        context.drawImage(cell, (i % COLUMNS) * SHEET_WIDTH, Math.floor(i / COLUMNS) * CELL_HEIGHT * scale, SHEET_WIDTH, CELL_HEIGHT * scale);
      });

      renderer.dispose();
      surface.delete();
      setStatus(`Drew ${chosen.length} templates`);
    })().catch((e) => setStatus(`Failed: ${e instanceof Error ? e.message : e}`));
  }, []);

  return (
    <main style={{ padding: 16 }}>
      <p id="status">{status}</p>
      <canvas ref={sheetRef} id="sheet" />
    </main>
  );
}
