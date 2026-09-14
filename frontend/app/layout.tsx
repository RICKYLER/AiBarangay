import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk, IBM_Plex_Mono } from 'next/font/google';
import 'leaflet/dist/leaflet.css';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import RegisterSW from '@/components/pwa/RegisterSW';

/* Editorial civic-tech type system:
   Space Grotesk — display headlines
   Inter — body & UI
   IBM Plex Mono — technical labels (indexes, coordinates, status) */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});
const grotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-display',
  display: 'swap',
});
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'AI Barangay Problem Mapper · Tagum City',
  description:
    'Report community problems, track barangay response, and see AI-assisted insights on a live map of Tagum City.',
  openGraph: {
    title: 'AI Barangay Problem Mapper · Tagum City',
    description:
      'Report community problems, track barangay response, and see AI-assisted insights on a live map of Tagum City.',
    images: ['/og.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  /* iOS Add to Home Screen icon (Android/desktop read the manifest) */
  icons: {
    apple: '/apple-touch-icon.png',
  },
};

/* viewport-fit=cover lets the layout stretch under the notch/home
   indicator when installed as an app — the safe-area insets in
   public.css / resident.css then keep content clear of it. */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0E4C41',
};

/* In dev, tear down any leftover production service worker BEFORE the
   app chunks execute. A SW registered by a previous `next start` (or a
   prod preview on this origin) serves stale cache-first chunks across
   dev recompiles — the crash it causes ("Cannot read properties of
   undefined (reading 'call')") kills React before RegisterSW's cleanup
   effect can run, deadlocking the browser on the broken chunk. This
   plain inline script doesn't depend on hydration, so it always runs;
   when it finds a SW controlling the page it unregisters it, purges
   the caches, and reloads once (sessionStorage flag prevents a loop).
   Not rendered at all in production, where /sw.js is supposed to live. */
const devSwCleanup = `(function () {
  if (!('serviceWorker' in navigator)) return;
  if (!navigator.serviceWorker.controller) return;
  if (sessionStorage.getItem('aib-sw-cleaned')) return;
  sessionStorage.setItem('aib-sw-cleaned', '1');
  navigator.serviceWorker.getRegistrations()
    .then(function (rs) { return Promise.all(rs.map(function (r) { return r.unregister(); })); })
    .then(function () {
      if (!('caches' in window)) return;
      return caches.keys().then(function (ks) {
        return Promise.all(ks.map(function (k) { return caches.delete(k); }));
      });
    })
    .then(function () { window.location.reload(); });
})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${grotesk.variable} ${plexMono.variable}`}
    >
      <body>
        {process.env.NODE_ENV === 'development' && (
          <script dangerouslySetInnerHTML={{ __html: devSwCleanup }} />
        )}
        <AuthProvider>{children}</AuthProvider>
        <RegisterSW />
      </body>
    </html>
  );
}
