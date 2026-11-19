import React, { useState, useMemo, useEffect } from 'react';
import { 
  RotateCcw, 
  Check, 
  Ticket, 
  Eye, 
  EyeOff, 
  Pencil, 
  Plus, 
  X, 
  TrendingDown, 
  ArrowRight,
  Gift,
  Percent,
  Sparkles
} from 'lucide-react';
import { 
  FINANCE_FACTORS, 
  INITIAL_PRESETS, 
  roundToCentena, 
  roundToDecena, 
  formatCurrency 
} from '../data/financeFactors';
import confetti from 'canvas-confetti';

export default function FinancingCalculator({
  totalAmount = 0,
  onUpdateTotalAmount,
  onSelectCuotaPlan,
  onProceedToQuote,
  slotId = 'A', // 'A' | 'B' para independizar datos en modo dividido
  slotLabel = ''
}) {
  const activeTotal = typeof totalAmount === 'number' && totalAmount > 0 ? totalAmount : 0;

  // Claves de persistencia por slot para independizar completamente el Set A del Set B
  const keyPrefix = `rp_vitality_calc_${slotId}_`;

  // --- FILA 1 (PRINCIPAL) ---
  const [selectedInitialPercent, setSelectedInitialPercent] = useState(() => {
    try {
      const saved = localStorage.getItem(`${keyPrefix}init_pct1`);
      return saved !== null && [15, 20, 25].includes(parseInt(saved, 10)) ? parseInt(saved, 10) : 15;
    } catch {
      return 15;
    }
  });

  const [customInitialAmount, setCustomInitialAmount] = useState(() => {
    try {
      return localStorage.getItem(`${keyPrefix}custom_init1`) || '';
    } catch {
      return '';
    }
  });

  const [showPencilInput, setShowPencilInput] = useState(false);
  const [revealedCuotas, setRevealedCuotas] = useState({});

  // --- FILA 2 COMPARATIVA ---
  const [isComparing2, setIsComparing2] = useState(() => {
    try {
      return localStorage.getItem(`${keyPrefix}comparing2`) === 'true';
    } catch {
      return false;
    }
  });

  const [compareInitialPercent, setCompareInitialPercent] = useState(() => {
    try {
      const saved = localStorage.getItem(`${keyPrefix}init_pct2`);
      return saved !== null && [15, 20, 25].includes(parseInt(saved, 10)) ? parseInt(saved, 10) : 20;
    } catch {
      return 20;
    }
  });

  const [compareCustomInitial, setCompareCustomInitial] = useState(() => {
    try {
      return localStorage.getItem(`${keyPrefix}custom_init2`) || '';
    } catch {
      return '';
    }
  });

  const [showComparePencilInput, setShowComparePencilInput] = useState(false);
  const [revealedCompareCuotas, setRevealedCompareCuotas] = useState({});

  // --- FILA 3 COMPARATIVA ---
  const [isComparing3, setIsComparing3] = useState(() => {
    try {
      return localStorage.getItem(`${keyPrefix}comparing3`) === 'true';
    } catch {
      return false;
    }
  });

  const [compareInitialPercent3, setCompareInitialPercent3] = useState(() => {
    try {
      const saved = localStorage.getItem(`${keyPrefix}init_pct3`);
      return saved !== null && [15, 20, 25].includes(parseInt(saved, 10)) ? parseInt(saved, 10) : 25;
    } catch {
      return 25;
    }
  });

  const [compareCustomInitial3, setCompareCustomInitial3] = useState(() => {
    try {
      return localStorage.getItem(`${keyPrefix}custom_init3`) || '';
    } catch {
      return '';
    }
  });

  const [showComparePencilInput3, setShowComparePencilInput3] = useState(false);
  const [revealedCompareCuotas3, setRevealedCompareCuotas3] = useState({});

  // Guardar en localStorage de forma aislada por cada slot
  useEffect(() => {
    try {
      localStorage.setItem(`${keyPrefix}init_pct1`, String(selectedInitialPercent));
      localStorage.setItem(`${keyPrefix}custom_init1`, customInitialAmount);
      localStorage.setItem(`${keyPrefix}comparing2`, String(isComparing2));
      localStorage.setItem(`${keyPrefix}init_pct2`, String(compareInitialPercent));
      localStorage.setItem(`${keyPrefix}custom_init2`, compareCustomInitial);
      localStorage.setItem(`${keyPrefix}comparing3`, String(isComparing3));
      localStorage.setItem(`${keyPrefix}init_pct3`, String(compareInitialPercent3));
      localStorage.setItem(`${keyPrefix}custom_init3`, compareCustomInitial3);
    } catch (e) {
      console.error(e);
    }
  }, [
    keyPrefix,
    selectedInitialPercent,
    customInitialAmount,
    isComparing2,
    compareInitialPercent,
    compareCustomInitial,
    isComparing3,
    compareInitialPercent3,
    compareCustomInitial3
  ]);

  // Distractor Estratégico de Cierre: Descuentos de Contado
  const [isCashDiscount3Applied, setIsCashDiscount3Applied] = useState(false); // 3% Descuento Especial
  const [isCouponBroken, setIsCouponBroken] = useState(false); // 5% Cupón Familiar
  const [filterView, setFilterView] = useState('popular'); // 'popular' | 'all'

  // Beneficio / Regalo de Fábrica (Botón sutil en gris)
  const [isGiftRevealed, setIsGiftRevealed] = useState(false);

  // Determinar regalo de fábrica oficial según lista de precios 2026
  const matchingGift = useMemo(() => {
    if (activeTotal >= 7500) {
      return {
        sku: 'CO4911',
        name: 'Multipan Oficial',
        subtitle: 'Sartén y horno de 11 funciones en acero quirúrgico 316L',
        valorOficial: 'S/ 4,095',
        image: '/assets/products_2026/CO4911.webp'
      };
    } else if (activeTotal >= 4500) {
      return {
        sku: 'CO0101',
        name: 'Cafetera Chocolatera',
        subtitle: 'Chocolatera & cafetera de alta retención térmica en acero 316L',
        valorOficial: 'S/ 1,780',
        image: '/assets/products_2026/CO0101.webp'
      };
    } else {
      return {
        sku: 'CO4807',
        name: 'Colador de Acero Quirúrgico',
        subtitle: 'Colador ergonómico de precisión en acero quirúrgico grado 316L',
        valorOficial: 'S/ 1,420',
        image: '/assets/products_2026/CO4807.webp'
      };
    }
  }, [activeTotal]);

  const handleRevealGift = () => {
    setIsGiftRevealed(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#0B2545', '#d97706', '#f59e0b', '#2563eb', '#1e3a8a']
    });
  };

  // Descuentos aplicables SOLO a la versión de Contado:
  // - Descuento del 3% (Especial Contado)
  // - Cupón Familiar del 5%
  const cashDiscountRate = (isCashDiscount3Applied ? 0.03 : 0) + (isCouponBroken ? 0.05 : 0);
  const cashDiscountAmount = activeTotal * cashDiscountRate;
  const cashFinalPrice = Math.max(0, activeTotal - cashDiscountAmount);

  // --- CÁLCULO INICIAL 1 ---
  const initialAmount1 = useMemo(() => {
    if (customInitialAmount !== '') {
      const num = parseFloat(customInitialAmount) || 0;
      return roundToCentena(num);
    }
    const raw = (activeTotal * selectedInitialPercent) / 100;
    return roundToCentena(raw);
  }, [activeTotal, selectedInitialPercent, customInitialAmount]);

  const balanceToFinance1 = Math.max(0, activeTotal - initialAmount1);

  // --- CÁLCULO INICIAL 2 (COMPARATIVA 2) ---
  const initialAmount2 = useMemo(() => {
    if (compareCustomInitial !== '') {
      const num = parseFloat(compareCustomInitial) || 0;
      return roundToCentena(num);
    }
    const raw = (activeTotal * compareInitialPercent) / 100;
    return roundToCentena(raw);
  }, [activeTotal, compareInitialPercent, compareCustomInitial]);

  const balanceToFinance2 = Math.max(0, activeTotal - initialAmount2);

  // --- CÁLCULO INICIAL 3 (COMPARATIVA 3) ---
  const initialAmount3 = useMemo(() => {
    if (compareCustomInitial3 !== '') {
      const num = parseFloat(compareCustomInitial3) || 0;
      return roundToCentena(num);
    }
    const raw = (activeTotal * compareInitialPercent3) / 100;
    return roundToCentena(raw);
  }, [activeTotal, compareInitialPercent3, compareCustomInitial3]);

  const balanceToFinance3 = Math.max(0, activeTotal - initialAmount3);

  // Planes de cuotas para balance 1
  const cuotasData1 = useMemo(() => {
    return FINANCE_FACTORS.map((f) => {
      const exactCuota = balanceToFinance1 * f.coeficiente;
      const displayCuota = roundToDecena(exactCuota);
      return {
        ...f,
        displayCuota
      };
    });
  }, [balanceToFinance1]);

  // Planes de cuotas para balance 2
  const cuotasData2 = useMemo(() => {
    return FINANCE_FACTORS.map((f) => {
      const exactCuota = balanceToFinance2 * f.coeficiente;
      const displayCuota = roundToDecena(exactCuota);
      return {
        ...f,
        displayCuota
      };
    });
  }, [balanceToFinance2]);

  // Planes de cuotas para balance 3
  const cuotasData3 = useMemo(() => {
    return FINANCE_FACTORS.map((f) => {
      const exactCuota = balanceToFinance3 * f.coeficiente;
      const displayCuota = roundToDecena(exactCuota);
      return {
        ...f,
        displayCuota
      };
    });
  }, [balanceToFinance3]);

  // Cuotas clave: estrictamente 12, 16 y 24
  const KEY_CUOTAS_NUMS = [12, 16, 24];

  const displayedCuotas1 = useMemo(() => {
    if (filterView === 'popular') {
      return cuotasData1.filter(c => KEY_CUOTAS_NUMS.includes(c.cuotas));
    }
    return cuotasData1;
  }, [cuotasData1, filterView]);

  const displayedCuotas2 = useMemo(() => {
    if (filterView === 'popular') {
      return cuotasData2.filter(c => KEY_CUOTAS_NUMS.includes(c.cuotas));
    }
    return cuotasData2;
  }, [cuotasData2, filterView]);

  const displayedCuotas3 = useMemo(() => {
    if (filterView === 'popular') {
      return cuotasData3.filter(c => KEY_CUOTAS_NUMS.includes(c.cuotas));
    }
    return cuotasData3;
  }, [cuotasData3, filterView]);

  // Revelar / ocultar cuota individual
  const toggleReveal1 = (cuotasNum) => {
    setRevealedCuotas(prev => ({
      ...prev,
      [cuotasNum]: !prev[cuotasNum]
    }));
  };

  const toggleReveal2 = (cuotasNum) => {
    setRevealedCompareCuotas(prev => ({
      ...prev,
      [cuotasNum]: !prev[cuotasNum]
    }));
  };

  const toggleReveal3 = (cuotasNum) => {
    setRevealedCompareCuotas3(prev => ({
      ...prev,
      [cuotasNum]: !prev[cuotasNum]
    }));
  };

  const handleToggleCashDiscount3 = () => {
    if (!isCashDiscount3Applied) {
      setIsCashDiscount3Applied(true);
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.6 }
      });
    } else {
      setIsCashDiscount3Applied(false);
    }
  };

  const handleBreakCoupon = () => {
    if (isCouponBroken) return;
    setIsCouponBroken(true);
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const handleResetCoupon = () => {
    setIsCouponBroken(false);
    setIsCashDiscount3Applied(false);
  };

  return (
    <div className="w-full space-y-5">
      
      {/* Header con Indicador de Slot si aplica */}
      {slotLabel && (
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#0B2545]" />
            <h2 className="text-lg font-black text-[#0B2545] tracking-tight">
              {slotLabel}
            </h2>
          </div>
          <span className="text-xs font-extrabold text-[#0B2545] bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
            Total: {formatCurrency(activeTotal)}
          </span>
        </div>
      )}

      {/* Top Bar: Total Set (Fijo solo lectura) & Cupón Familiar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Total Set Fijo y Puro (Sin input de alterar) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 shadow-2xs">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total del Set</span>
            <div className="text-2xl font-black text-[#0B2545] mt-0.5">
              {formatCurrency(activeTotal)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-semibold text-slate-400">PVP Oficial 2026</span>
          </div>
        </div>

        {/* Contado con Descuento del 3% y Cupón Familiar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col justify-between gap-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                {cashDiscountRate > 0 
                  ? `Precio Contado (${(cashDiscountRate * 100).toFixed(0)}% dcto.)` 
                  : 'Precio Contado'}
              </span>
              <div className="text-2xl font-black text-[#0B2545] mt-0.5">
                {formatCurrency(cashFinalPrice)}
              </div>
            </div>

            {/* Botón de Refrescar / Limpiar Descuentos de Contado */}
            <button
              onClick={handleResetCoupon}
              title="Restablecer descuentos de contado"
              className="p-2 rounded-xl text-slate-400 hover:text-[#0B2545] hover:bg-slate-100 transition-all active:rotate-180 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Botones de Descuentos Exclusivos de Contado */}
          <div className="space-y-2">
            
            {/* 1. Descuento Especial del 3% (Minimalista: solo SVG y 3%) */}
            {!isCashDiscount3Applied ? (
              <button
                type="button"
                onClick={handleToggleCashDiscount3}
                title="Activar 3% de descuento al contado"
                className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl flex items-center justify-between transition-all group active:scale-98 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-[#0B2545]" />
                  <span className="text-xs font-black text-[#0B2545]">
                    3%
                  </span>
                </div>
                <span className="text-[11px] font-extrabold text-[#0B2545] group-hover:underline">
                  &gt;
                </span>
              </button>
            ) : (
              <div 
                onClick={handleToggleCashDiscount3}
                title="Clic para remover descuento 3%"
                className="p-2.5 bg-blue-50/80 rounded-xl border border-blue-200 text-xs flex items-center justify-between animate-in fade-in duration-300 cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-[#0B2545]" />
                  <span className="font-black text-[#0B2545]">3% Aplicado</span>
                </div>
                <span className="font-black text-[#0B2545]">
                  -{formatCurrency(activeTotal * 0.03)}
                </span>
              </div>
            )}

            {/* 2. Cupón Familiar Interactivo (5%) */}
            {!isCouponBroken ? (
              <button
                type="button"
                onClick={handleBreakCoupon}
                className="w-full py-2 px-3 bg-linear-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 hover:from-amber-500/20 hover:to-amber-500/30 border border-amber-300 rounded-xl flex items-center justify-between transition-all group active:scale-98 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-[#0B2545]" />
                  <span className="text-xs font-black text-[#0B2545]">
                    Cupón Familiar (-5%)
                  </span>
                </div>
                <span className="text-[11px] font-extrabold text-[#0B2545] group-hover:underline">
                  Clic para validar &gt;
                </span>
              </button>
            ) : (
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs flex items-center justify-between animate-in fade-in duration-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#0B2545]" />
                  <div>
                    <span className="font-black text-[#0B2545]">Cupón Familiar Aplicado (-5%)</span>
                    <div className="text-[10px] text-amber-800 font-bold">Quedan 4/6 cupos disponibles</div>
                  </div>
                </div>
                <span className="font-black text-[#0B2545]">
                  -{formatCurrency(activeTotal * 0.05)}
                </span>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* --- FILA 1: DEPOSITO INICIAL PRINCIPAL --- */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
        
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              {(isComparing2 || isComparing3) ? 'Escenario 1 • Depósito Inicial:' : 'Depósito Inicial:'}
            </span>
            <span className="text-sm font-extrabold text-[#0B2545] bg-slate-100 px-2.5 py-0.5 rounded-lg whitespace-nowrap">
              {formatCurrency(initialAmount1)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            {INITIAL_PRESETS.map((pct) => (
              <button
                key={pct}
                onClick={() => {
                  setSelectedInitialPercent(pct);
                  setCustomInitialAmount('');
                  setShowPencilInput(false);
                }}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedInitialPercent === pct && customInitialAmount === '' && !showPencilInput
                    ? 'bg-[#0B2545] text-amber-400 shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {pct === 0 ? '0%' : `${pct}%`}
              </button>
            ))}

            {/* Lápiz SVG para Inicial Personalizada */}
            <button
              onClick={() => setShowPencilInput(!showPencilInput)}
              title="Ingresar monto personalizado de inicial"
              className={`p-1.5 rounded-lg border transition-all cursor-pointer shrink-0 ${
                showPencilInput || customInitialAmount !== ''
                  ? 'bg-[#0B2545] border-[#0B2545] text-amber-400 shadow-2xs'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Input desplegable del Lápiz si está activo */}
        {showPencilInput && (
          <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl flex items-center justify-between gap-3 animate-in fade-in duration-200">
            <span className="text-xs font-bold text-slate-800">
              Monto Personalizado de Inicial:
            </span>
            <div className="flex items-center gap-2 w-48">
              <span className="text-xs font-black text-[#0B2545]">S/</span>
              <input
                type="number"
                min="0"
                step="50"
                value={customInitialAmount}
                onChange={(e) => {
                  setCustomInitialAmount(e.target.value);
                  setSelectedInitialPercent(null);
                }}
                placeholder="Ej: 3000"
                autoFocus
                className="w-full text-right font-extrabold text-sm bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-900 focus:outline-hidden focus:border-[#0B2545]"
              />
            </div>
          </div>
        )}

        {/* Saldo y Selector de Vista */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <span className="text-slate-500 font-medium">
            Saldo a financiar: <strong className="text-[#0B2545] font-extrabold">{formatCurrency(balanceToFinance1)}</strong>
          </span>
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setFilterView('popular')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                filterView === 'popular'
                  ? 'bg-[#0B2545] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Planes Clave
            </button>
            <button
              onClick={() => setFilterView('all')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                filterView === 'all'
                  ? 'bg-[#0B2545] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ver Todas
            </button>
          </div>
        </div>

        {/* Grid de Cuotas Fila 1 (12, 16, 24) */}
        <div className={`grid gap-3 ${
          filterView === 'popular' 
            ? 'grid-cols-1 sm:grid-cols-3' 
            : 'grid-cols-2 sm:grid-cols-4 md:grid-cols-5'
        }`}>
          {displayedCuotas1.map((plan) => {
            const isRevealed = revealedCuotas[plan.cuotas];

            return (
              <div
                key={plan.cuotas}
                className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-center flex flex-col justify-between min-h-[110px] transition-all hover:border-slate-300 hover:shadow-2xs"
              >
                <div className="text-xs font-black text-[#0B2545] uppercase tracking-wider">
                  {plan.cuotas} Cuotas
                </div>

                {!isRevealed ? (
                  <button
                    onClick={() => toggleReveal1(plan.cuotas)}
                    className="my-auto py-1.5 px-4 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-[#0B2545] text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all active:scale-95 mx-auto cursor-pointer shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#0B2545]" />
                    <span>Ver</span>
                  </button>
                ) : (
                  <div
                    onClick={() => toggleReveal1(plan.cuotas)}
                    title="Clic para ocultar"
                    className="my-auto cursor-pointer group"
                  >
                    <div className="text-2xl font-black text-[#0B2545] group-hover:scale-105 transition-transform">
                      {formatCurrency(plan.displayCuota)}
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold block leading-none mt-1">
                      / mes
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* --- COMPARACIÓN DE INICIALES (FILAS 2 Y 3 EN NAVY & AMARILLO) --- */}
      
      {/* FILA 2 COMPARATIVA */}
      {isComparing2 && (
        <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border-2 border-slate-300 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 shadow-2xs">
          
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-200">
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              <span className="text-xs font-bold text-[#0B2545] uppercase tracking-wide">
                Escenario 2 • Otra Inicial:
              </span>
              <span className="text-sm font-extrabold text-[#0B2545] bg-white border border-slate-200 px-2.5 py-0.5 rounded-lg shadow-2xs whitespace-nowrap">
                {formatCurrency(initialAmount2)}
              </span>
              <span className="text-[11px] font-bold text-[#0B2545] bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md whitespace-nowrap">
                (+{formatCurrency(Math.max(0, initialAmount2 - initialAmount1))})
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1">
              {INITIAL_PRESETS.map((pct) => (
                <button
                  key={pct}
                  onClick={() => {
                    setCompareInitialPercent(pct);
                    setCompareCustomInitial('');
                    setShowComparePencilInput(false);
                  }}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    compareInitialPercent === pct && compareCustomInitial === '' && !showComparePencilInput
                      ? 'bg-[#0B2545] text-amber-400 shadow-2xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {pct === 0 ? '0%' : `${pct}%`}
                </button>
              ))}

              {/* Lápiz para la Fila 2 */}
              <button
                onClick={() => setShowComparePencilInput(!showComparePencilInput)}
                title="Monto personalizado para comparar"
                className={`p-1.5 rounded-lg border transition-all cursor-pointer shrink-0 ${
                  showComparePencilInput || compareCustomInitial !== ''
                    ? 'bg-[#0B2545] border-[#0B2545] text-amber-400 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>

              {/* Botón cerrar Fila 2 */}
              <button
                onClick={() => {
                  setIsComparing2(false);
                  if (isComparing3) {
                    setIsComparing3(false);
                  }
                }}
                title="Cerrar comparación 2"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all ml-1 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Input Lápiz Fila 2 */}
          {showComparePencilInput && (
            <div className="p-3 bg-white border border-slate-300 rounded-xl flex items-center justify-between gap-3 animate-in fade-in duration-200">
              <span className="text-xs font-bold text-[#0B2545]">
                Monto Personalizado Fila 2:
              </span>
              <div className="flex items-center gap-2 w-48">
                <span className="text-xs font-black text-[#0B2545]">S/</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={compareCustomInitial}
                  onChange={(e) => {
                    setCompareCustomInitial(e.target.value);
                    setCompareInitialPercent(null);
                  }}
                  placeholder="Ej: 4000"
                  autoFocus
                  className="w-full text-right font-extrabold text-sm bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-900 focus:outline-hidden focus:border-[#0B2545]"
                />
              </div>
            </div>
          )}

          {/* Cuotas Fila 2 (12, 16, 24) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {displayedCuotas2.map((plan) => {
              const isRevealed = revealedCompareCuotas[plan.cuotas];
              const plan1 = displayedCuotas1.find(p => p.cuotas === plan.cuotas);
              const monthlyDiff = plan1 ? (plan1.displayCuota - plan.displayCuota) : 0;

              return (
                <div
                  key={plan.cuotas}
                  className="bg-white rounded-2xl p-4 border border-slate-200 text-center flex flex-col justify-between min-h-[110px] shadow-2xs"
                >
                  <div className="text-xs font-black text-[#0B2545] uppercase tracking-wider">
                    {plan.cuotas} Cuotas
                  </div>

                  {!isRevealed ? (
                    <button
                      onClick={() => toggleReveal2(plan.cuotas)}
                      className="my-auto py-1.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#0B2545] text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all active:scale-95 mx-auto cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#0B2545]" />
                      <span>Ver</span>
                    </button>
                  ) : (
                    <div
                      onClick={() => toggleReveal2(plan.cuotas)}
                      title="Clic para ocultar"
                      className="my-auto cursor-pointer group"
                    >
                      <div className="text-2xl font-black text-[#0B2545] group-hover:scale-105 transition-transform">
                        {formatCurrency(plan.displayCuota)}
                      </div>
                      {monthlyDiff > 0 && (
                        <div className="flex items-center justify-center gap-1 text-[11px] font-extrabold text-[#0B2545] bg-amber-50 border border-amber-200 py-0.5 px-2 rounded-md mt-1">
                          <TrendingDown className="w-3 h-3 text-[#0B2545]" />
                          <span>Baja {formatCurrency(monthlyDiff)}/mes</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* FILA 3 COMPARATIVA (MÁXIMO 3 INICIALES) */}
      {isComparing3 && (
        <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border-2 border-slate-300 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 shadow-2xs">
          
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-200">
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              <span className="text-xs font-bold text-[#0B2545] uppercase tracking-wide">
                Escenario 3 • Tercera Inicial:
              </span>
              <span className="text-sm font-extrabold text-[#0B2545] bg-white border border-slate-200 px-2.5 py-0.5 rounded-lg shadow-2xs whitespace-nowrap">
                {formatCurrency(initialAmount3)}
              </span>
              <span className="text-[11px] font-bold text-[#0B2545] bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md whitespace-nowrap">
                (+{formatCurrency(Math.max(0, initialAmount3 - initialAmount1))})
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1">
              {INITIAL_PRESETS.map((pct) => (
                <button
                  key={pct}
                  onClick={() => {
                    setCompareInitialPercent3(pct);
                    setCompareCustomInitial3('');
                    setShowComparePencilInput3(false);
                  }}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    compareInitialPercent3 === pct && compareCustomInitial3 === '' && !showComparePencilInput3
                      ? 'bg-[#0B2545] text-amber-400 shadow-2xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {pct === 0 ? '0%' : `${pct}%`}
                </button>
              ))}

              {/* Lápiz para la Fila 3 */}
              <button
                onClick={() => setShowComparePencilInput3(!showComparePencilInput3)}
                title="Monto personalizado Fila 3"
                className={`p-1.5 rounded-lg border transition-all cursor-pointer shrink-0 ${
                  showComparePencilInput3 || compareCustomInitial3 !== ''
                    ? 'bg-[#0B2545] border-[#0B2545] text-amber-400 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>

              {/* Botón cerrar Fila 3 */}
              <button
                onClick={() => setIsComparing3(false)}
                title="Cerrar comparación 3"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all ml-1 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Input Lápiz Fila 3 */}
          {showComparePencilInput3 && (
            <div className="p-3 bg-white border border-slate-300 rounded-xl flex items-center justify-between gap-3 animate-in fade-in duration-200">
              <span className="text-xs font-bold text-[#0B2545]">
                Monto Personalizado Fila 3:
              </span>
              <div className="flex items-center gap-2 w-48">
                <span className="text-xs font-black text-[#0B2545]">S/</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={compareCustomInitial3}
                  onChange={(e) => {
                    setCompareCustomInitial3(e.target.value);
                    setCompareInitialPercent3(null);
                  }}
                  placeholder="Ej: 6000"
                  autoFocus
                  className="w-full text-right font-extrabold text-sm bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-900 focus:outline-hidden focus:border-[#0B2545]"
                />
              </div>
            </div>
          )}

          {/* Cuotas Fila 3 (12, 16, 24) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {displayedCuotas3.map((plan) => {
              const isRevealed = revealedCompareCuotas3[plan.cuotas];
              const plan1 = displayedCuotas1.find(p => p.cuotas === plan.cuotas);
              const monthlyDiff = plan1 ? (plan1.displayCuota - plan.displayCuota) : 0;

              return (
                <div
                  key={plan.cuotas}
                  className="bg-white rounded-2xl p-4 border border-slate-200 text-center flex flex-col justify-between min-h-[110px] shadow-2xs"
                >
                  <div className="text-xs font-black text-[#0B2545] uppercase tracking-wider">
                    {plan.cuotas} Cuotas
                  </div>

                  {!isRevealed ? (
                    <button
                      onClick={() => toggleReveal3(plan.cuotas)}
                      className="my-auto py-1.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#0B2545] text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all active:scale-95 mx-auto cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#0B2545]" />
                      <span>Ver</span>
                    </button>
                  ) : (
                    <div
                      onClick={() => toggleReveal3(plan.cuotas)}
                      title="Clic para ocultar"
                      className="my-auto cursor-pointer group"
                    >
                      <div className="text-2xl font-black text-[#0B2545] group-hover:scale-105 transition-transform">
                        {formatCurrency(plan.displayCuota)}
                      </div>
                      {monthlyDiff > 0 && (
                        <div className="flex items-center justify-center gap-1 text-[11px] font-extrabold text-[#0B2545] bg-amber-50 border border-amber-200 py-0.5 px-2 rounded-md mt-1">
                          <TrendingDown className="w-3 h-3 text-[#0B2545]" />
                          <span>Baja {formatCurrency(monthlyDiff)}/mes</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* BOTÓN + COMPARAR (MÁXIMO 3 INICIALES) */}
      {(!isComparing2 || !isComparing3) && (
        <div className="flex justify-center">
          <button
            onClick={() => {
              if (!isComparing2) {
                setIsComparing2(true);
                setCompareInitialPercent(selectedInitialPercent >= 20 ? 30 : 20);
              } else if (!isComparing3) {
                setIsComparing3(true);
                setCompareInitialPercent3(compareInitialPercent >= 30 ? 40 : 30);
              }
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-dashed border-[#0B2545]/40 hover:border-[#0B2545] bg-slate-50/50 hover:bg-[#0B2545]/5 text-[#0B2545] text-xs font-black transition-all active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>
              {!isComparing2 ? 'Comparar con otra inicial' : 'Agregar 3ra inicial de comparación (Máx. 3)'}
            </span>
          </button>
        </div>
      )}

      {/* SECCIÓN REGALO / BENEFICIO EXCLUSIVO (DISCRETO) */}
      {!isCouponBroken && (
        <div className="pt-2 flex flex-col items-center">
          {!isGiftRevealed ? (
            <button
              onClick={handleRevealGift}
              title="Beneficio especial"
              className="group p-2 rounded-full text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition-all flex items-center justify-center cursor-pointer"
            >
              <Gift className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </button>
          ) : (
            <div className="w-full bg-linear-to-r from-amber-50/80 via-white to-amber-50/80 border border-amber-200/90 rounded-2xl p-4 shadow-sm relative animate-in fade-in zoom-in-95 duration-200">
              <button
                onClick={() => setIsGiftRevealed(false)}
                className="absolute top-2.5 right-2.5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-24 h-24 rounded-xl bg-white border border-amber-200/60 p-1.5 flex items-center justify-center shrink-0 shadow-2xs">
                  <img
                    src={matchingGift.image}
                    alt={matchingGift.name}
                    className="max-h-full max-w-full object-contain mix-blend-multiply"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-100/80 text-amber-900 text-[10px] font-black tracking-wide uppercase mb-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Cortesía Especial de Fábrica</span>
                  </div>
                  <h4 className="text-base font-black text-slate-900 leading-tight">
                    {matchingGift.name}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                    {matchingGift.subtitle}
                  </p>
                  <div className="mt-1.5 text-[11px] font-bold text-amber-800">
                    Valor referencial de lista: <span className="line-through text-slate-400 font-normal mr-1">{matchingGift.valorOficial}</span> <span className="text-[#0B2545] font-black">Gratis</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
