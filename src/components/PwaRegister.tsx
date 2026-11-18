'use client';

import { useEffect, useState } from 'react';

// Global reference to the deferred install prompt
let deferredPrompt: any = null;

export function getDeferredInstallPrompt() {
  return deferredPrompt;
}

export function promptPwaInstall(): Promise<'accepted' | 'dismissed' | 'manual'> {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    return deferredPrompt.userChoice.then((choice: any) => {
      deferredPrompt = null;
      return choice.outcome as 'accepted' | 'dismissed';
    });
  }
  return Promise.resolve('manual');
}

export function PwaRegister() {
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('Vitality Service Worker registrado'))
        .catch((err) => console.warn('SW registration failed:', err));
    }

    // 2. Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
      setCanInstall(true);
      window.dispatchEvent(new CustomEvent('pwa-installable'));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  return null;
}
