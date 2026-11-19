import React, { useState, useMemo } from 'react';
import { 
  Check, 
  ArrowRight, 
  Maximize2, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  LayoutGrid, 
  Columns 
} from 'lucide-react';
import { PREESTABLISHED_SETS, SET_CATEGORIES } from '../data/preestablishedSets';
import { formatCurrency } from '../data/financeFactors';
import confetti from 'canvas-confetti';

export default function PreestablishedSetsView({
  onLoadPreestablishedSet,
  onCalculateSetDirectly,
  activeSplitSlot = 'A',
  isSplitMode = false
}) {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [loadedSetId, setLoadedSetId] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [viewMode, setViewMode] = useState('pairs'); // 'pairs' (de 2 en 2 fijado) | 'grid' (todos en grilla)

  const categories = SET_CATEGORIES;

  // Clasificación por jerarquía:
  // 1. Sistemas de Cocina y Combos de Ollas (ordenados de mayor a menor precio)
  // 2. Juegos Culinarios (cuchillos, sartenes/planchas) y Equipos/Accesorios (ordenados de mayor a menor precio)
  const filteredSets = useMemo(() => {
    const sets = PREESTABLISHED_SETS.filter((set) => {
      if (selectedCategory === 'Todos') return true;
      return set.category === selectedCategory;
    });

    // Función que asigna prioridad de grupo:
    // 0: Sistemas de cocina y combos que incluyen sistemas de ollas
    // 1: Cuchillos, sartenes, planchas, equipos eléctricos y accesorios individuales
    const getGroupPriority = (set) => {
      if (set.category === 'Sistemas de Cocina') return 0;
      if (set.id.startsWith('combo-') || set.id.startsWith('set-completo-') || set.id.startsWith('set-8-') || set.id.startsWith('set-4-')) return 0;
      return 1;
    };

    return [...sets].sort((a, b) => {
      const groupA = getGroupPriority(a);
      const groupB = getGroupPriority(b);
      if (groupA !== groupB) {
        return groupA - groupB; // Primero sistemas de cocina / combos de ollas
      }
      return b.price - a.price; // De mayor a menor precio dentro del grupo
    });
  }, [selectedCategory]);

  // Agrupar de dos en dos
  const pairs = useMemo(() => {
    const res = [];
    for (let i = 0; i < filteredSets.length; i += 2) {
      res.push(filteredSets.slice(i, i + 2));
    }
    return res;
  }, [filteredSets]);

  // Resetear índice al cambiar de categoría si excede el rango
  const safePairIndex = Math.min(currentPairIndex, Math.max(0, pairs.length - 1));

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setCurrentPairIndex(0);
  };

  const handleNextPair = () => {
    if (safePairIndex < pairs.length - 1) {
      setCurrentPairIndex(prev => Math.min(pairs.length - 1, prev + 1));
    }
  };

  const handlePrevPair = () => {
    if (safePairIndex > 0) {
      setCurrentPairIndex(prev => Math.max(0, prev - 1));
    }
  };

  const handleSelectSet = (set) => {
    onLoadPreestablishedSet(set);
    setLoadedSetId(set.id);
    confetti({
      particleCount: 35,
      spread: 55,
      origin: { y: 0.7 }
    });
    setTimeout(() => {
      setLoadedSetId(null);
    }, 1800);
  };

  const currentPair = pairs[safePairIndex] || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Minimal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#0B2545] tracking-tight">
              Combos & Sets Preestablecidos
            </h1>
            {isSplitMode && (
              <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black uppercase ${
                activeSplitSlot === 'B' 
                  ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                  : 'bg-blue-100 text-blue-900 border border-blue-300'
              }`}>
                Cargando en Set {activeSplitSlot}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Sistemas de cocina y combos exclusivos organizados por jerarquía.
          </p>
        </div>

        {/* Minimal Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#0B2545] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* VISTA 1: DE DOS EN DOS (PAIRS) FIJADO */}
      {viewMode === 'pairs' ? (
        <div 
          className="relative bg-white/70 rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs focus:outline-hidden"
        >
          
          {/* Barra superior: Controles de navegación y Botón Switch a Grilla */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs text-slate-400 font-medium">
                Usa las flechas para explorar
              </span>
            </div>

            {/* Controles: Flecha Izq, Flecha Der + Botón Grilla SVG */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevPair}
                disabled={safePairIndex === 0}
                title="Ver anteriores"
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  safePairIndex === 0
                    ? 'opacity-30 border-slate-200 text-slate-400 cursor-not-allowed'
                    : 'border-slate-300 bg-white text-[#0B2545] hover:bg-slate-50 shadow-2xs active:scale-95'
                }`}
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={handleNextPair}
                disabled={safePairIndex >= pairs.length - 1}
                title="Ver siguientes"
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  safePairIndex >= pairs.length - 1
                    ? 'opacity-30 border-slate-200 text-slate-400 cursor-not-allowed'
                    : 'border-[#0B2545] bg-[#0B2545] text-amber-400 shadow-2xs active:scale-95 hover:bg-[#07192F]'
                }`}
              >
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <div className="h-5 w-px bg-slate-200 mx-1" />

              {/* Botón SVG de Grilla para cambiar a vista completa */}
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                title="Cambiar a vista de grilla completa"
                className="p-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 hover:text-[#0B2545] shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden md:inline text-xs font-bold">Ver todos</span>
              </button>
            </div>
          </div>

          {/* Visualización en Grande de los 2 Sets del Par Actual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-300">
            {currentPair.map((set) => {
              const isJustLoaded = loadedSetId === set.id;

              return (
                <div
                  key={set.id}
                  className={`bg-white rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-lg ${
                    isJustLoaded ? 'ring-2 ring-emerald-500 border-emerald-500' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  
                  {/* Product Photo en Formato Grande con Botón Expandir */}
                  <div className="relative aspect-16/10 sm:aspect-16/11 bg-slate-50 flex items-center justify-center p-6 border-b border-slate-100 overflow-hidden group">
                    {set.image ? (
                      <img
                        src={set.image}
                        alt={set.name}
                        className="max-h-[260px] sm:max-h-[300px] w-auto max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                        onClick={() => setExpandedImage({ src: set.image, title: set.name })}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="text-slate-300 text-sm font-bold uppercase tracking-wider">
                        Foto en Catálogo 2026
                      </div>
                    )}

                    {/* Botón para expandir imagen en la esquina */}
                    {set.image && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedImage({ src: set.image, title: set.name });
                        }}
                        title="Ver imagen completa"
                        aria-label="Expandir imagen"
                        className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-[#0B2545] shadow-xs border border-slate-200/80 transition-transform active:scale-90 cursor-pointer z-10"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Card Body Amplio: Nombre, Descripción & Precio */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                          {set.category}
                        </span>
                        <span className="text-xs font-bold text-slate-400 font-mono">
                          {set.code}
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-black text-[#0B2545] leading-snug mt-1">
                        {set.name}
                      </h3>

                      {set.description && (
                        <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                          {set.description}
                        </p>
                      )}
                    </div>

                    {/* Price & Single Action Button */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                      <div>
                        <span className="text-xs text-slate-400 font-semibold block leading-none">Precio Total</span>
                        <span className="text-2xl sm:text-3xl font-black text-[#0B2545]">
                          {formatCurrency(set.price)}
                        </span>
                      </div>

                      <button
                        onClick={() => handleSelectSet(set)}
                        className={`py-3 px-5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                          isJustLoaded
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-[#0B2545] hover:bg-[#07192F] text-amber-400 active:scale-95 shadow-md'
                        }`}
                      >
                        {isJustLoaded ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>¡Cargado con éxito!</span>
                          </>
                        ) : (
                          <>
                            <span>Cargar al Armador</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>

        </div>
      ) : (
        /* VISTA 2: GRILLA COMPLETA */
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-bold text-slate-500">
              Mostrando todos los {filteredSets.length} sets disponibles
            </span>
            <button
              type="button"
              onClick={() => setViewMode('pairs')}
              title="Volver a la vista de 2 en 2"
              className="p-2 px-3 rounded-xl border border-[#0B2545] bg-[#0B2545] text-amber-400 shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <Columns className="w-4 h-4" />
              <span>Ver de 2 en 2</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredSets.map((set) => {
              const isJustLoaded = loadedSetId === set.id;

              return (
                <div
                  key={set.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-md ${
                    isJustLoaded ? 'ring-2 ring-emerald-500 border-emerald-500' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="relative aspect-4/3 bg-slate-100 flex items-center justify-center p-3 border-b border-slate-100 overflow-hidden group">
                    {set.image ? (
                      <img
                        src={set.image}
                        alt={set.name}
                        className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                        onClick={() => setExpandedImage({ src: set.image, title: set.name })}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="text-slate-300 text-xs font-bold uppercase tracking-wider">
                        Foto en Catálogo 2026
                      </div>
                    )}

                    {set.image && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedImage({ src: set.image, title: set.name });
                        }}
                        title="Ver imagen completa"
                        aria-label="Expandir imagen"
                        className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-[#0B2545] shadow-xs border border-slate-200/80 transition-transform active:scale-90 cursor-pointer z-10"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="text-base font-extrabold text-[#0B2545] leading-snug">
                        {set.name}
                      </h3>
                      {set.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {set.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[11px] text-slate-400 font-semibold block leading-none">Precio Total</span>
                        <span className="text-xl font-black text-[#0B2545]">
                          {formatCurrency(set.price)}
                        </span>
                      </div>

                      <button
                        onClick={() => handleSelectSet(set)}
                        className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isJustLoaded
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-[#0B2545] hover:bg-[#07192F] text-white active:scale-95 shadow-2xs'
                        }`}
                      >
                        {isJustLoaded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>¡Cargado!</span>
                          </>
                        ) : (
                          <>
                            <span>Cargar al Armador</span>
                            <ArrowRight className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Lightbox para expandir imagen completa */}
      {expandedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setExpandedImage(null)}
        >
          <div 
            className="relative bg-white rounded-3xl max-w-3xl w-full p-4 md:p-6 shadow-2xl flex flex-col items-center border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Lightbox */}
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-lg font-black text-[#0B2545]">
                {expandedImage.title}
              </h3>
              <button
                type="button"
                onClick={() => setExpandedImage(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Cerrar vista completa"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenedor de la Imagen */}
            <div className="w-full flex items-center justify-center bg-slate-50/60 rounded-2xl p-2 md:p-4 min-h-[300px] max-h-[75vh] overflow-hidden">
              <img 
                src={expandedImage.src} 
                alt={expandedImage.title} 
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-xs"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
