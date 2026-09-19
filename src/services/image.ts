import { Asset } from 'expo-asset';
import { Directory, File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { config, providers } from '@/config';
import { images } from '@/theme/images';
import { isDemoMode } from './demo';
import { createInteraction, outputImage } from './gemini';

const MAX_EDGE = 1600;

function photosDir(): Directory {
  const dir = new Directory(Paths.document, 'photos');
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

const newPhotoFile = (extension = 'jpg') => new File(photosDir(), `photo-${Date.now()}.${extension}`);

/**
 * Normalises a captured/picked photo (orientation, size, JPEG) and copies it
 * into app storage so products keep their image after the picker cache is cleared.
 */
export async function preparePhoto(uri: string): Promise<string> {
  const context = ImageManipulator.manipulate(uri);
  const probe = await context.renderAsync();
  const longest = Math.max(probe.width, probe.height);
  if (longest > MAX_EDGE) {
    context.resize(probe.width >= probe.height ? { width: MAX_EDGE } : { height: MAX_EDGE });
  }
  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({ compress: 0.86, format: SaveFormat.JPEG });

  // Keep the photo in app storage so it survives the picker cache being cleared.
  // copySync, not copy: the async version returns before the file exists, so the
  // URI we hand back would point at nothing and every preview would be blank.
  try {
    const destination = newPhotoFile();
    new File(saved.uri).copySync(destination);
    if (destination.exists) return destination.uri;
  } catch {
    // fall through to the manipulator's own file, which is a real file too
  }
  return saved.uri;
}

/** Replaces the background with white via remove.bg. Returns the new local file URI. */
export async function removeBackground(uri: string): Promise<string> {
  if (!config.removeBgApiKey) throw new Error('Background removal is not configured.');

  const form = new FormData();
  // React Native's FormData accepts { uri, name, type } file descriptors.
  form.append('image_file', { uri, name: 'product.jpg', type: 'image/jpeg' } as unknown as Blob);
  form.append('size', 'auto');
  form.append('bg_color', 'ffffff');
  form.append('format', 'jpg');

  const response = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: { 'X-Api-Key': config.removeBgApiKey },
    body: form,
  });
  if (!response.ok) {
    throw new Error(`remove.bg failed (${response.status})`);
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  const destination = newPhotoFile();
  destination.write(bytes);
  return destination.uri;
}

/** JPEG as base64, or null when the file cannot be read; callers carry on without the photo. */
export async function photoToBase64OrNull(uri: string | null, width = 1024): Promise<string | null> {
  if (!uri) return null;
  try {
    return await photoToBase64(uri, width);
  } catch {
    return null;
  }
}

/** JPEG as base64 for sending to a vision/image model. */
export async function photoToBase64(uri: string, width = 1024): Promise<string> {
  const context = ImageManipulator.manipulate(uri);
  context.resize({ width });
  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({ compress: 0.8, format: SaveFormat.JPEG, base64: true });
  if (!saved.base64) throw new Error('Could not encode photo.');
  return saved.base64;
}

export type StudioStyle = 'white' | 'home' | 'flatlay' | 'closeup' | 'festive' | 'custom';

const STYLE_PROMPTS: Record<Exclude<StudioStyle, 'custom'>, string> = {
  white:
    'Place the product on a seamless pure white studio sweep (RGB 255,255,255) with a soft natural contact shadow. ' +
    'Centre it, fill about 80% of the frame. This must meet marketplace main-image rules (ONDC, GeM, Amazon): white background, no props.',
  home:
    'Place the product in a tasteful, uncluttered modern Indian home setting where it would naturally be used or displayed ' +
    '(e.g. on a side table, shelf or wall), with soft window light and a gently blurred background. The product stays the clear hero.',
  flatlay:
    'Show the product as a top-down flat lay, laid neatly flat and fully visible on a plain light neutral surface, evenly lit, ' +
    'with folds smoothed. Ideal for sarees, stoles, dupattas, rugs, paintings and embroidery.',
  closeup:
    'Make a macro-style close-up of the most detailed part of the product so the weave, brushwork, carving or stitching is crisp, ' +
    'with the rest of the product softly out of focus on a plain neutral background.',
  festive:
    'Place the product in a warm, elegant Indian festive gifting scene: soft warm light, a few subtle diyas or marigold petals ' +
    'blurred in the background, never covering or touching the product.',
};

function studioPrompt(style: StudioStyle, customPrompt?: string) {
  const scene = style === 'custom' ? `Follow the artisan's instructions for the scene: """${(customPrompt ?? '').trim()}"""` : STYLE_PROMPTS[style];
  return [
    'You are a professional product photographer and retoucher for an Indian handicrafts e-commerce catalogue.',
    'Take the handmade product from the provided photo and produce a studio product shot.',
    '1. Remove the original background, hands, clutter and any other objects completely.',
    `2. ${scene}`,
    '3. Keep the product itself exactly as it is: same shape, proportions, colours, painted patterns, textures, weave and imperfections. Do not redraw, restyle, add or remove details, text or logos.',
    '4. Correct the lighting and white balance so colours look true to life: even soft key light, gentle fill, no blown highlights or colour cast.',
    '5. Straighten the product; camera at eye level with a slight downward angle unless the scene says otherwise.',
    'Output one photorealistic square image with no text, watermark or border.',
  ].join('\n');
}

/** Demo mode: the bundled example studio shot, after a pause that matches a real render. */
async function demoStudioShot(): Promise<string> {
  const [asset] = await Promise.all([
    Asset.fromModule(images.demoStudio).downloadAsync(),
    new Promise((resolve) => setTimeout(resolve, 5000)),
  ]);
  const source = asset.localUri ?? asset.uri;
  if (!source) throw new Error('Demo photo is missing.');
  try {
    const destination = newPhotoFile();
    new File(source).copySync(destination);
    if (destination.exists) return destination.uri;
  } catch {
    // The bundled asset may not live on a path File can copy; re-encode it instead,
    // so what we return is always a real JPEG the AI steps can read.
  }
  try {
    return await preparePhoto(source);
  } catch {
    // Displayable either way, even if the AI steps cannot encode it.
    return source;
  }
}

/**
 * Creates a studio-style product photo: background removed and product placed on a
 * chosen studio scene with corrected lighting. Uses Gemini image editing, or remove.bg (white only) as fallback.
 */
export async function createStudioShot(uri: string, style: StudioStyle, customPrompt?: string): Promise<string> {
  if (isDemoMode() || providers.studio === 'demo') return demoStudioShot();
  if (providers.studio === 'remove.bg') return removeBackground(uri);
  if (providers.studio !== 'gemini') throw new Error('Photo studio is not configured.');

  const response = await createInteraction({
    model: config.geminiImageModel,
    input: [
      { type: 'text', text: studioPrompt(style, customPrompt) },
      { type: 'image', mime_type: 'image/jpeg', data: await photoToBase64(uri, 1536) },
    ],
    // image_size is only accepted by the Gemini 3 image models.
    response_format: {
      type: 'image',
      aspect_ratio: '1:1',
      mime_type: 'image/jpeg',
      ...(config.geminiImageModel.startsWith('gemini-3') ? { image_size: '1K' } : {}),
    },
  });

  const image = outputImage(response);
  if (!image) throw new Error('The studio did not return an image. Try again.');

  const destination = newPhotoFile(image.mimeType === 'image/png' ? 'png' : 'jpg');
  destination.write(image.data, { encoding: 'base64' });
  return destination.uri;
}
