'use client';

import React, { useState, useEffect } from 'react';
import { promptPwaInstall } from './PwaRegister';
import { Download, Smartphone, X, Share } from 'lucide-react';

interface InstallAppButtonProps {
  className?: string;
  variant?: 'badge' | 'button' | 'admin-icon';
  isDark?: boolean;
}

export function InstallAppButton({ className = '', variant = 'button', isDark = false }: InstallAppButtonProps) {
  const [isStandalone, setIsStandalone] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);

      const ua = window.navigator.userAgent.toLowerCase();
      setIsIos(/iphone|ipad|ipod/.test(ua));
    }
  }, []);

  if (isStandalone) {
    return null; // Don't show button if already installed as standalone PWA
  }

  const handleInstallClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const outcome = await promptPwaInstall();
    if (outcome === 'manual') {
      setShowManualModal(true);
    }
  };

  return (
    <>
      {variant === 'badge' ? (
        <button
          onClick={handleInstallClick}
          className={`flex items-center justify-center w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-accent backdrop-blur-md border border-accent/60 shadow-sm transition-all active:scale-95 ${className}`}
          title="Instalar App / Acceso directo en tu celular"
          aria-label="Instalar app"
        >
          <Download className="w-4 h-4 text-accent" />
        </button>
      ) : variant === 'admin-icon' ? (
        <button
          onClick={handleInstallClick}
          style={{
            background: isDark ? '#1E293B' : '#FFFFFF',
            color: isDark ? '#60A5FA' : '#004D99',
            border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
            borderRadius: '8px',
            padding: '6px 8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
          className={className}
          title="Instalar App / Acceso directo en tu celular"
          aria-label="Instalar aplicación"
        >
          <Download style={{ width: '14px', height: '14px' }} />
        </button>
      ) : (
        <button
          onClick={handleInstallClick}
          className={`flex items-center justify-center w-10 h-10 rounded-xl bg-accent text-accent-foreground shadow-lg hover:bg-accent/90 transition-all active:scale-95 ${className}`}
          title="Instalar App / Acceso directo en tu celular"
          aria-label="Instalar aplicación"
        >
          <Download className="w-5 h-5" />
        </button>
      )}

      {/* Modal de Instrucciones Manuales para Brave / Chrome / Safari */}
      {showManualModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setShowManualModal(false)}
        >
          <div 
            className="bg-[#0B1528] text-white border border-[#2563EB]/40 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-[#004D99] flex items-center justify-center shadow-md">
                  <Smartphone className="w-5 h-5 text-[#86EFAC]" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">Instalar Vitality</h3>
                  <p className="text-xs text-white/60">Acceso directo en tu celular</p>
                </div>
              </div>
              <button
                onClick={() => setShowManualModal(false)}
                className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm bg-white/5 p-4 rounded-2xl border border-white/10">
              {isIos ? (
                <>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-accent text-accent-foreground font-bold text-xs flex items-center justify-center shrink-0">1</span>
                    <p className="text-white/90">
                      Toca el botón <strong className="text-white">Compartir</strong> (<Share className="w-3.5 h-3.5 inline mx-0.5 text-accent" />) en la barra de tu navegador Safari/Brave.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-accent text-accent-foreground font-bold text-xs flex items-center justify-center shrink-0">2</span>
                    <p className="text-white/90">
                      Desliza hacia abajo y pulsa <strong className="text-white">"Agregar a la pantalla de inicio"</strong>.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-accent text-accent-foreground font-bold text-xs flex items-center justify-center shrink-0">1</span>
                    <p className="text-white/90">
                      Toca el menú de tu navegador <strong className="text-white">(tres puntos ⋮)</strong> en la esquina superior derecha.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-accent text-accent-foreground font-bold text-xs flex items-center justify-center shrink-0">2</span>
                    <p className="text-white/90">
                      Selecciona <strong className="text-white">"Instalar aplicación"</strong> o <strong className="text-white">"Agregar a la pantalla principal"</strong>.
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="pt-1">
              <button
                onClick={() => setShowManualModal(false)}
                className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-bold text-sm shadow-md hover:bg-accent/90 active:scale-95 transition-all text-center"
              >
                ¡Entendido!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
