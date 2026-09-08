/**
 * Client-side photo compression for report evidence uploads.
 *
 * Vercel caps request bodies at ~4.5MB, but phone photos are routinely
 * 5–10MB. Before a photo is attached to the report form, it is decoded
 * to a canvas, capped at MAX_EDGE px on its longest side, and re-encoded
 * as JPEG — typically well under 1MB with no visible loss at map-report
 * resolution. HEIC/odd formats and decode failures fall back to the
 * original file (the server still enforces the hard 4MB limit).
 */

const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.82;

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY)
    );
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() });
  } catch {
    return file;
  }
}
