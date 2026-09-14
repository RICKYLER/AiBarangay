'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * useInstallPrompt — PWA install state for the "Download App" flows.
 *
 * canInstall   the browser fired `beforeinstallprompt` (Chrome/Edge/
 *              Android, production build over HTTPS/localhost) and the
 *              native install dialog is one promptInstall() away.
 * isStandalone the site is already running as an installed app — every
 *              download entry point should hide itself.
 * platform     'ios' | 'android' | 'other' — iOS never fires
 *              beforeinstallprompt, so iPhone users get the manual
 *              "Share → Add to Home Screen" steps instead.
 *
 * The event is captured on the capture phase so this hook sees it even
 * if another listener calls preventDefault() first.
 */
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [platform, setPlatform] = useState('other');

  useEffect(() => {
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
      setPlatform('ios');
    } else if (/Android/i.test(ua)) {
      setPlatform('android');
    } else {
      setPlatform('other');
    }

    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      Boolean(navigator.standalone);
    setIsStandalone(standalone);

    const onBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const onInstalled = () => setDeferredPrompt(null);

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt, { capture: true });
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt, { capture: true });
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return 'unavailable';
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    return outcome; /* 'accepted' | 'dismissed' */
  }, [deferredPrompt]);

  return {
    canInstall: Boolean(deferredPrompt),
    isStandalone,
    platform,
    promptInstall,
  };
}
