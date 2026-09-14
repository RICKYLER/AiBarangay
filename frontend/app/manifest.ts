import type { MetadataRoute } from 'next';

/**
 * Web app manifest — makes the site installable ("Add to Home Screen"
 * on iOS, install prompt on Android/Chrome). Next serves this at
 * /manifest.webmanifest and links it in <head> automatically.
 *
 * Regenerate the icons with `node scripts/make-icons.mjs`.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AI Barangay Problem Mapper',
    short_name: 'AI Barangay',
    description:
      'Report community problems, track barangay response, and see AI-assisted insights on a live map of Tagum City.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    theme_color: '#0E4C41',
    background_color: '#F7F6ED',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      {
        src: '/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
