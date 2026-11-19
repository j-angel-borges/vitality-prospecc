'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const SetsVitalityApp = dynamic(() => import('@/sets-app/App'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-wider text-slate-400 uppercase">
          Cargando Cotizador de Sets Vitality...
        </p>
      </div>
    </div>
  )
});

export default function SetsPage() {
  return (
    <main className="w-full min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <SetsVitalityApp />
    </main>
  );
}
