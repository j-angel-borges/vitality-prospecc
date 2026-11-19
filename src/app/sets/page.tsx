'use client';

import React from 'react';
import Link from 'next/link';

export default function SetsPage() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-50 m-0 p-0">
      {/* Floating Back Button to Vitality ERP Hub */}
      <Link
        href="/"
        className="fixed top-3 left-3 z-50 w-9 h-9 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md shadow-lg border border-slate-700/60 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        title="Volver al Hub Vitality ERP"
        aria-label="Volver al Hub Vitality ERP"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </Link>

      {/* Standalone Pixel-Perfect Cotizador Clone of https://sets-vitality.web.app/ */}
      <iframe
        src="/sets/cotizador.html"
        title="Vitality Cotizador & Armador de Sets Royal Prestige"
        className="w-full h-full border-0 block"
        style={{ border: 'none', width: '100vw', height: '100vh' }}
      />
    </div>
  );
}
