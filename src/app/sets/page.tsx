'use client';

import React from 'react';
import Link from 'next/link';

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
      {/* Floating Back Button to Vitality ERP Hub with iOS/Android Safe-Area clearance */}
      <Link
        href="/"
        className="fixed z-50 w-10 h-10 rounded-2xl bg-slate-900/85 hover:bg-slate-900 text-white backdrop-blur-md shadow-lg border border-slate-700/60 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        style={{
          top: 'max(0.75rem, env(safe-area-inset-top))',
          left: 'max(0.75rem, env(safe-area-inset-left))',
          touchAction: 'manipulation'
        }}
        title="Volver al Hub Vitality ERP"
        aria-label="Volver al Hub Vitality ERP"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </Link>

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
