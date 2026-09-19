import { Platform } from 'react-native';
import { Directory, File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat, FlipType } from 'expo-image-manipulator';
import { ImageFormat, Skia } from '@shopify/react-native-skia';

export type CropRatio = 'free' | '1:1' | '4:5' | '4:3';

export interface PhotoEdits {
  /** Clockwise, in quarter turns. */
  rotate: 0 | 90 | 180 | 270;
  flip: boolean;
  crop: CropRatio;
  /** -1 … 1, 0 = unchanged. */
  brightness: number;
  contrast: number;
  saturation: number;
  warmth: number;
}

export const NO_EDITS: PhotoEdits = { rotate: 0, flip: false, crop: 'free', brightness: 0, contrast: 0, saturation: 0, warmth: 0 };

/** Colour sliders need Skia, which isn't loaded on the web build. */
export const colorEditingSupported = Platform.OS !== 'web';

export const hasGeometryEdits = (e: PhotoEdits) => e.rotate !== 0 || e.flip || e.crop !== 'free';
export const hasColorEdits = (e: PhotoEdits) => e.brightness !== 0 || e.contrast !== 0 || e.saturation !== 0 || e.warmth !== 0;

const RATIOS: Record<Exclude<CropRatio, 'free'>, number> = { '1:1': 1, '4:5': 4 / 5, '4:3': 4 / 3 };

function editsDir(): Directory {
  const dir = new Directory(Paths.document, 'photos');
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

/** Rotate, flip and centre-crop. Returns the input URI untouched when there is nothing to do. */
export async function applyGeometry(uri: string, edits: PhotoEdits): Promise<string> {
  if (!hasGeometryEdits(edits)) return uri;
  const context = ImageManipulator.manipulate(uri);
  if (edits.rotate) context.rotate(edits.rotate);
  if (edits.flip) context.flip(FlipType.Horizontal);
  if (edits.crop !== 'free') {
    const { width, height } = await context.renderAsync();
    const ratio = RATIOS[edits.crop];
    const cropWidth = Math.min(width, Math.round(height * ratio));
    const cropHeight = Math.min(height, Math.round(cropWidth / ratio));
    context.crop({
      originX: Math.round((width - cropWidth) / 2),
      originY: Math.round((height - cropHeight) / 2),
      width: cropWidth,
      height: cropHeight,
    });
  }
  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({ compress: 0.9, format: SaveFormat.JPEG });
  return saved.uri;
}

/**
 * 4×5 colour matrix (row-major, offsets in 0–1) for the four sliders.
 * Order: saturation → contrast → brightness → warmth.
 */
export function colorMatrix({ brightness, contrast, saturation, warmth }: PhotoEdits): number[] {
  const s = 1 + saturation;
  const lr = 0.2126 * (1 - s);
  const lg = 0.7152 * (1 - s);
  const lb = 0.0722 * (1 - s);
  const c = 1 + contrast * 0.6;
  const offset = (1 - c) / 2 + brightness * 0.25;
  const warm = warmth * 0.08;
  return [
    (lr + s) * c, lg * c, lb * c, 0, offset + warm,
    lr * c, (lg + s) * c, lb * c, 0, offset,
    lr * c, lg * c, (lb + s) * c, 0, offset - warm,
    0, 0, 0, 1, 0,
  ];
}

/** Bakes the colour sliders into a new JPEG file. */
export async function applyColor(uri: string, edits: PhotoEdits): Promise<string> {
  if (!hasColorEdits(edits) || !colorEditingSupported) return uri;
  const data = await Skia.Data.fromURI(uri);
  const image = Skia.Image.MakeImageFromEncoded(data);
  if (!image) throw new Error('Could not read photo.');
  const surface = Skia.Surface.Make(image.width(), image.height());
  if (!surface) throw new Error('Could not edit photo.');
  const paint = Skia.Paint();
  paint.setColorFilter(Skia.ColorFilter.MakeMatrix(colorMatrix(edits)));
  surface.getCanvas().drawImage(image, 0, 0, paint);
  surface.flush();
  const base64 = surface.makeImageSnapshot().encodeToBase64(ImageFormat.JPEG, 90);
  const destination = new File(editsDir(), `edit-${Date.now()}.jpg`);
  destination.write(base64, { encoding: 'base64' });
  return destination.uri;
}

/** Final export: geometry then colour, saved in app storage. */
export async function exportEdited(uri: string, edits: PhotoEdits): Promise<string> {
  const shaped = await applyGeometry(uri, edits);
  const colored = await applyColor(shaped, edits);
  if (colored !== shaped || shaped === uri) return colored;
  const destination = new File(editsDir(), `edit-${Date.now()}.jpg`);
  try {
    new File(shaped).copySync(destination);
    if (destination.exists) return destination.uri;
  } catch {
    // fall through to the shaped file
  }
  return shaped;
}
