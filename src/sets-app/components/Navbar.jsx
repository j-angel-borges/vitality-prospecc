import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../data/financeFactors';
import { ChevronRight } from 'lucide-react';
import SplitViewIcon from './SplitViewIcon';
import ExpandViewIcon from './ExpandViewIcon';

export default function Navbar({
  activeTab,
  setActiveTab,
  cart,
  cartTotal,
  // Split Screen props
  isSplitMode = false,
  onToggleSplitMode,
  activeSplitSlot = 'A',
  onSelectSplitSlot,
  cartA = [],
  cartTotalA = 0,
  cartB = [],
  cartTotalB = 0
}) {
  const totalItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fsElement =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement;
      setIsFullscreen(Boolean(fsElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const handleToggleFullscreen = async () => {
    try {
      const docEl = document.documentElement;
      const isCurrentlyFullscreen =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement;

      if (!isCurrentlyFullscreen) {
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen({ navigationUI: 'hide' }).catch(() => docEl.requestFullscreen());
        } else if (docEl.webkitRequestFullscreen) {
          docEl.webkitRequestFullscreen();
        } else if (docEl.msRequestFullscreen) {
          docEl.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    } catch (err) {
      console.error('Error al alternar pantalla completa:', err);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo ONLY (No text) */}
          <div 
            className="flex items-center cursor-pointer py-1" 
            onClick={() => setActiveTab('builder')}
            title="Inicio"
          >
            <img 
              src="/assets/brand/logo_vitality.jpg" 
              alt="Logo" 
              className="h-10 w-10 object-cover rounded-xl border border-slate-200 shadow-2xs hover:scale-105 transition-transform"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>

          {/* Minimal Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('builder')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'builder'
                  ? 'bg-white text-[#0B2545] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Armador de Sets</span>
              {totalItemsCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-black bg-[#0B2545] text-white rounded-full">
                  {totalItemsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('presets')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'presets'
                  ? 'bg-white text-[#0B2545] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Combos & Sets
            </button>

            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'calculator'
                  ? 'bg-white text-[#0B2545] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Calculadora Cuotas
            </button>

            {/* Separador vertical para independizar totalmente el clic */}
            <div className="h-4 w-px bg-slate-300 mx-1.5" />

            {/* Flechita discreta para desplegar Cotización */}
            <div className="flex items-center">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab(prev => prev === 'quote' ? 'calculator' : 'quote');
                }}
                title={activeTab === 'quote' ? 'Ocultar cotización' : 'Desplegar cotización'}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'quote'
                    ? 'bg-[#0B2545] text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-800 hover:bg-slate-200'
                }`}
              >
                <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${activeTab === 'quote' ? 'rotate-90' : ''}`} />
              </button>

              {/* Si está desplegada / activa, muestra la pestaña de Cotización */}
              {activeTab === 'quote' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('quote')}
                  className="px-3 py-2 rounded-lg text-xs font-bold bg-white text-[#0B2545] shadow-xs ml-1 animate-in fade-in duration-200 cursor-pointer"
                >
                  Cotización
                </button>
              )}
            </div>
          </nav>

          {/* Right Action Bar: Split Screen Button + Fullscreen Button + Cart Total Badge */}
          <div className="flex items-center gap-2">
            
            {/* Botón de Pantalla Dividida (Solo SVG, sin texto) */}
            {onToggleSplitMode && (
              <button
                type="button"
                onClick={onToggleSplitMode}
                title={isSplitMode ? "Cerrar Pantalla Dividida" : "Dividir Pantalla para Armar 2 Sets en Paralelo"}
                className={`p-2.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                  isSplitMode
                    ? 'bg-[#0B2545] text-amber-400 border-[#0B2545] shadow-xs ring-2 ring-[#0B2545]/20'
                    : 'bg-white border-slate-200 text-slate-500 hover:text-[#0B2545] hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
                }`}
              >
                <SplitViewIcon className="w-4 h-4" isActive={isSplitMode} />
              </button>
            )}

            {/* Botón de Expandir / Pantalla Completa (Solo SVG, sin texto) */}
            <button
              type="button"
              onClick={handleToggleFullscreen}
              title={isFullscreen ? "Salir de Pantalla Completa" : "Expandir a Pantalla Completa"}
              className={`p-2.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                isFullscreen
                  ? 'bg-[#0B2545] text-amber-400 border-[#0B2545] shadow-xs ring-2 ring-[#0B2545]/20'
                  : 'bg-white border-slate-200 text-slate-500 hover:text-[#0B2545] hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
              }`}
            >
              <ExpandViewIcon className="w-4 h-4" isActive={isFullscreen} />
            </button>

            {/* Selector de Sets en Modo Dividido o Cart Badge Normal */}
            {!isSplitMode ? (
              <button
                type="button"
                onClick={() => setActiveTab('calculator')}
                className="bg-[#0B2545] hover:bg-[#07192F] text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-2xs cursor-pointer"
              >
                <span className="text-amber-400 font-extrabold">{formatCurrency(cartTotal)}</span>
                {totalItemsCount > 0 && (
                  <span className="bg-white/20 px-1.5 py-0.5 rounded-md text-[10px]">{totalItemsCount}</span>
                )}
              </button>
            ) : (
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1">
                <button
                  type="button"
                  onClick={() => onSelectSplitSlot && onSelectSplitSlot('A')}
                  title="Activar Set A para agregar productos"
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeSplitSlot === 'A'
                      ? 'bg-[#0B2545] text-amber-400 shadow-xs ring-2 ring-[#0B2545]/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <span>Set A:</span>
                  <span className={activeSplitSlot === 'A' ? 'text-amber-400' : 'text-slate-700'}>
                    {formatCurrency(cartTotalA)}
                  </span>
                </button>

                <div className="h-4 w-px bg-slate-300" />

                <button
                  type="button"
                  onClick={() => onSelectSplitSlot && onSelectSplitSlot('B')}
                  title="Activar Set B para agregar productos"
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeSplitSlot === 'B'
                      ? 'bg-[#0B2545] text-amber-400 shadow-xs ring-2 ring-[#0B2545]/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <span>Set B:</span>
                  <span className={activeSplitSlot === 'B' ? 'text-amber-400' : 'text-slate-700'}>
                    {formatCurrency(cartTotalB)}
                  </span>
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Mobile Sub-Nav */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-100 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('builder')}
            className={`py-1.5 px-3 rounded-lg ${
              activeTab === 'builder' ? 'text-[#0B2545] bg-slate-100' : 'text-slate-500'
            }`}
          >
            Armador
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`py-1.5 px-3 rounded-lg ${
              activeTab === 'presets' ? 'text-[#0B2545] bg-slate-100' : 'text-slate-500'
            }`}
          >
            Sets
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('calculator')}
            className={`py-1.5 px-3 rounded-lg ${
              activeTab === 'calculator' ? 'text-[#0B2545] bg-slate-100' : 'text-slate-500'
            }`}
          >
            Cuotas
          </button>

          {/* Separador móvil */}
          <div className="h-4 w-px bg-slate-200 mx-0.5" />

          {/* Flechita móvil discreta */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab(prev => prev === 'quote' ? 'calculator' : 'quote');
            }}
            className={`p-1.5 rounded-lg ${activeTab === 'quote' ? 'bg-[#0B2545] text-white' : 'text-slate-400'}`}
            title="Cotización"
          >
            <ChevronRight className={`w-3.5 h-3.5 ${activeTab === 'quote' ? 'rotate-90' : ''}`} />
          </button>

          {activeTab === 'quote' && (
            <button
              type="button"
              onClick={() => setActiveTab('quote')}
              className="py-1.5 px-2 rounded-lg text-[#0B2545] bg-slate-100 font-bold"
            >
              Cotización
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
