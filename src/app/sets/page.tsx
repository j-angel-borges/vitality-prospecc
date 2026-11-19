'use client';

import React from 'react';
import { FloatingHubHomeButton } from '@/components/FloatingHubHomeButton';

export default function SetsPage() {
  return (
    <div
      className="relative w-screen bg-slate-50 m-0 p-0 overflow-hidden"
      style={{
        height: '100dvh',
        minHeight: '-webkit-fill-available',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {/* Botón flotante circular con logo Vitality que aparece tras 1 segundo para volver al Hub */}
      <FloatingHubHomeButton position="top-left" />

      {/* Standalone Pixel-Perfect Cotizador Clone with iOS WebKit touch scrolling */}
      <iframe
        src="/sets/cotizador.html"
        title="Vitality Cotizador & Armador de Sets Royal Prestige"
        className="border-0 block"
        style={{
          width: '1px',
          minWidth: '100%',
          height: '100%',
          border: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      />
    </div>
  );
}
