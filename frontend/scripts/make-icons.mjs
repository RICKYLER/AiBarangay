/**
 * make-icons — generates the PWA app icons from the Lucide "landmark"
 * glyph on the deep-forest-green brand background.
 *
 * One-off utility: outputs to frontend/public/. Re-run after changing
 * the glyph or palette:
 *   npm i -D sharp   (first time only)
 *   node scripts/make-icons.mjs
 */
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public');

const BRAND_GREEN = '#0E4C41';
const IVORY = '#F7F6ED';

/* Lucide "landmark" (24×24, stroke-based) — same glyph as the site
   brand mark, so the installed app matches the header. */
const LANDMARK_PATHS = `
  <line x1="3" x2="21" y1="22" y2="22"/>
  <line x1="6" x2="6" y1="18" y2="11"/>
  <line x1="10" x2="10" y1="18" y2="11"/>
  <line x1="14" x2="14" y1="18" y2="11"/>
  <line x1="18" x2="18" y1="18" y2="11"/>
  <polygon points="12 2 20 7 4 7"/>
`;

/**
 * Full-bleed icon SVG: solid brand square, landmark centered.
 * `glyph` is the fraction of the canvas the glyph occupies —
 * maskable icons keep it inside the 80% safe zone (≈0.5).
 */
function iconSvg(size, glyph) {
  const g = size * glyph;
  const offset = (size - g) / 2;
  const scale = g / 24;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${BRAND_GREEN}"/>
  <g transform="translate(${offset} ${offset}) scale(${scale})"
     fill="none" stroke="${IVORY}" stroke-width="1.8"
     stroke-linecap="round" stroke-linejoin="round">
    ${LANDMARK_PATHS}
  </g>
</svg>`;
}

const TARGETS = [
  { file: 'icon-192.png',          size: 192, glyph: 0.58 },
  { file: 'icon-512.png',          size: 512, glyph: 0.58 },
  { file: 'icon-maskable-512.png', size: 512, glyph: 0.50 }, /* 80% safe zone */
  { file: 'apple-touch-icon.png',  size: 180, glyph: 0.58 },
];

for (const { file, size, glyph } of TARGETS) {
  await sharp(Buffer.from(iconSvg(size, glyph)))
    .png()
    .toFile(path.join(OUT, file));
  console.log(`✓ public/${file} (${size}×${size})`);
}
