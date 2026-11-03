import type { CanvasKit, TypefaceFontProvider } from 'canvaskit-wasm';
import type { FontWeightName } from './types';

type FontFile = { family: string; weight: FontWeightName; file: string; devanagari?: boolean };

// All OFL or Apache, so free for commercial use. Static files only: CanvasKit
// shows a variable font's default weight, so it could not honour a chosen one.
export const FONT_FILES: FontFile[] = [
  { family: 'Poppins', weight: 'SemiBold', file: 'Poppins-SemiBold.ttf', devanagari: true },
  { family: 'Poppins', weight: 'ExtraBold', file: 'Poppins-ExtraBold.ttf', devanagari: true },
  { family: 'Poppins', weight: 'Black', file: 'Poppins-Black.ttf', devanagari: true },
  { family: 'Anton', weight: 'Normal', file: 'Anton-Regular.ttf' },
  { family: 'Bebas Neue', weight: 'Normal', file: 'BebasNeue-Regular.ttf' },
  { family: 'Archivo Black', weight: 'Normal', file: 'ArchivoBlack-Regular.ttf' },
  { family: 'Kanit', weight: 'ExtraBold', file: 'Kanit-ExtraBold.ttf' },
  { family: 'Luckiest Guy', weight: 'Normal', file: 'LuckiestGuy-Regular.ttf' },
  { family: 'Bangers', weight: 'Normal', file: 'Bangers-Regular.ttf' },
  { family: 'Alfa Slab One', weight: 'Normal', file: 'AlfaSlabOne-Regular.ttf' },
  { family: 'Lilita One', weight: 'Normal', file: 'LilitaOne-Regular.ttf' },
  { family: 'Titan One', weight: 'Normal', file: 'TitanOne-Regular.ttf' },
  { family: 'Russo One', weight: 'Normal', file: 'RussoOne-Regular.ttf' },
  { family: 'Great Vibes', weight: 'Normal', file: 'GreatVibes-Regular.ttf' },
  { family: 'Alex Brush', weight: 'Normal', file: 'AlexBrush-Regular.ttf' },
  { family: 'Satisfy', weight: 'Normal', file: 'Satisfy-Regular.ttf' },
  { family: 'Allison', weight: 'Normal', file: 'Allison-Regular.ttf' },
  { family: 'DM Serif Display', weight: 'Normal', file: 'DMSerifDisplay-Regular.ttf' },
  { family: 'Instrument Serif', weight: 'Normal', file: 'InstrumentSerif-Regular.ttf' },
  { family: 'Abril Fatface', weight: 'Normal', file: 'AbrilFatface-Regular.ttf' },
  { family: 'Mukta', weight: 'ExtraBold', file: 'Mukta-ExtraBold.ttf', devanagari: true },
  { family: 'Hind', weight: 'Bold', file: 'Hind-Bold.ttf', devanagari: true },
  { family: 'Rozha One', weight: 'Normal', file: 'RozhaOne-Regular.ttf', devanagari: true },
  { family: 'Yatra One', weight: 'Normal', file: 'YatraOne-Regular.ttf', devanagari: true },
  { family: 'Kalam', weight: 'Bold', file: 'Kalam-Bold.ttf', devanagari: true },
  { family: 'Khand', weight: 'Bold', file: 'Khand-Bold.ttf', devanagari: true },
  { family: 'Laila', weight: 'Bold', file: 'Laila-Bold.ttf', devanagari: true },
  { family: 'Amita', weight: 'Bold', file: 'Amita-Bold.ttf', devanagari: true },
  { family: 'Tiro Devanagari Hindi', weight: 'Normal', file: 'TiroDevanagariHindi-Regular.ttf', devanagari: true },
  { family: 'Sarpanch', weight: 'Black', file: 'Sarpanch-Black.ttf', devanagari: true },
  { family: 'Modak', weight: 'Normal', file: 'Modak-Regular.ttf', devanagari: true },
  { family: 'Mea Culpa', weight: 'Normal', file: 'MeaCulpa-Regular.ttf' },
  { family: 'Imperial Script', weight: 'Normal', file: 'ImperialScript-Regular.ttf' },
  { family: 'Birthstone', weight: 'Normal', file: 'Birthstone-Regular.ttf' },
  { family: 'Bungee', weight: 'Normal', file: 'Bungee-Regular.ttf' },
  { family: 'Righteous', weight: 'Normal', file: 'Righteous-Regular.ttf' },
  { family: 'Passion One', weight: 'Bold', file: 'PassionOne-Bold.ttf' },
  { family: 'Black Ops One', weight: 'Normal', file: 'BlackOpsOne-Regular.ttf' },
  { family: 'Staatliches', weight: 'Normal', file: 'Staatliches-Regular.ttf' },
  { family: 'Lobster', weight: 'Normal', file: 'Lobster-Regular.ttf' },
  { family: 'Pacifico', weight: 'Normal', file: 'Pacifico-Regular.ttf' },
  { family: 'Permanent Marker', weight: 'Normal', file: 'PermanentMarker-Regular.ttf' },
  { family: 'Biryani', weight: 'Black', file: 'Biryani-Black.ttf', devanagari: true },
  { family: 'Rajdhani', weight: 'Bold', file: 'Rajdhani-Bold.ttf', devanagari: true },
  { family: 'Sahitya', weight: 'Bold', file: 'Sahitya-Bold.ttf', devanagari: true },
  { family: 'Kurale', weight: 'Normal', file: 'Kurale-Regular.ttf', devanagari: true },
  { family: 'Pragati Narrow', weight: 'Bold', file: 'PragatiNarrow-Bold.ttf', devanagari: true },
  { family: 'Ranga', weight: 'Bold', file: 'Ranga-Bold.ttf', devanagari: true },
  { family: 'Vesper Libre', weight: 'Black', file: 'VesperLibre-Heavy.ttf', devanagari: true },
  { family: 'Palanquin Dark', weight: 'Bold', file: 'PalanquinDark-Bold.ttf', devanagari: true },
  { family: 'Inter', weight: 'Normal', file: 'Inter-Regular.ttf' },
  { family: 'Inter', weight: 'Black', file: 'Inter-Black.ttf' },
  { family: 'Goldman', weight: 'Bold', file: 'Goldman-Bold.ttf' },
  { family: 'Sofia Sans Extra Condensed', weight: 'Black', file: 'SofiaSansExtraCondensed-Black.ttf' },
];

/** Used for any letter the chosen font lacks, so Hindi never shows empty boxes. */
export const FALLBACK_FAMILIES = ['Poppins'];

export const FONT_FAMILIES = [...new Set(FONT_FILES.map((f) => f.family))];

export const weightsOf = (family: string) => FONT_FILES.filter((f) => f.family === family).map((f) => f.weight);

const SCRIPT_FAMILIES = ['Great Vibes', 'Alex Brush', 'Satisfy', 'Allison', 'Mea Culpa', 'Imperial Script', 'Birthstone', 'Pacifico'];

/** Joined-up script fonts are unreadable in capitals. */
export const isScriptFont = (family: string) => SCRIPT_FAMILIES.includes(family);

export const hasDevanagari = (family: string) => FONT_FILES.some((f) => f.family === family && f.devanagari);

/** Loads fonts on demand so the editor starts fast. */
export class FontBook {
  readonly provider: TypefaceFontProvider;
  private loaded = new Map<string, Promise<void>>();

  constructor(ck: CanvasKit) {
    this.provider = ck.TypefaceFontProvider.Make();
  }

  private load(font: FontFile) {
    let job = this.loaded.get(font.file);
    if (!job) {
      job = fetch(`/fonts/${font.file}`)
        .then((r) => r.arrayBuffer())
        .then((data) => this.provider.registerFont(data, font.family));
      this.loaded.set(font.file, job);
    }
    return job;
  }

  /** Loads every weight of a family, plus the fallback. */
  async ensure(family: string) {
    const wanted = FONT_FILES.filter((f) => f.family === family || FALLBACK_FAMILIES.includes(f.family));
    await Promise.all(wanted.map((f) => this.load(f)));
  }
}
