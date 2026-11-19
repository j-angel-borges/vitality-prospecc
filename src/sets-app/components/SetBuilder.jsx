import React, { useState, useMemo } from 'react';
import { Search, Plus, Minus, ArrowRight } from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '../data/products';
import { FINANCE_FACTORS, formatCurrency, roundToCentena, roundToDecena } from '../data/financeFactors';
import { filterProductsSmart } from '../utils/searchEngine';

export default function SetBuilder({
  cart,
  onAddToCart,
  onUpdateQty,
  onRemoveFromCart,
  onClearCart,
  cartTotal,
  onProceedToCalc,
  onProceedToQuote,
  // Split Screen props
  isSplitMode = false,
  activeSplitSlot = 'A',
  onSelectSplitSlot,
  cartA = [],
  cartTotalA = 0,
  onUpdateQtyA,
  onClearCartA,
  cartB = [],
  cartTotalB = 0,
  onUpdateQtyB,
  onClearCartB,
  onProceedToCalcSlot
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  // Smart keyword and category search
  const filteredProducts = useMemo(() => {
    // If user is searching text, search across the entire catalog to avoid missing matches
    const effectiveCategory = searchQuery.trim() ? 'Todos' : selectedCategory;
    return filterProductsSmart(PRODUCTS, searchQuery, effectiveCategory);
  }, [searchQuery, selectedCategory]);

  const cartMap = useMemo(() => {
    const map = new Map();
    cart.forEach(item => map.set(item.productId, item.qty));
    return map;
  }, [cart]);

  // Quick cuotas estimation for 12 and 24 months
  const defaultInitial = roundToCentena(cartTotal * 0.10);
  const balance = Math.max(0, cartTotal - defaultInitial);
  const factor12 = FINANCE_FACTORS.find(f => f.cuotas === 12)?.coeficiente || 0.1062;
  const factor24 = FINANCE_FACTORS.find(f => f.cuotas === 24)?.coeficiente || 0.0652;
  const cuota12 = roundToDecena(balance * factor12);
  const cuota24 = roundToDecena(balance * factor24);

  // Cuotas Slot A
  const defaultInitialA = roundToCentena(cartTotalA * 0.10);
  const balanceA = Math.max(0, cartTotalA - defaultInitialA);
  const cuota12A = roundToDecena(balanceA * factor12);
  const cuota24A = roundToDecena(balanceA * factor24);

  // Cuotas Slot B
  const defaultInitialB = roundToCentena(cartTotalB * 0.10);
  const balanceB = Math.max(0, cartTotalB - defaultInitialB);
  const cuota12B = roundToDecena(balanceB * factor12);
  const cuota24B = roundToDecena(balanceB * factor24);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      
      {/* Minimal Title */}
      <div className="pb-4 mb-5 border-b border-slate-200">
        <h1 className="text-2xl font-black text-[#0B2545] tracking-tight">
          Armador de Sets
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Busca productos por nombre o medida (ej. <span className="font-semibold text-slate-700">sarten 20</span>, <span className="font-semibold text-slate-700">olla 6</span>, <span className="font-semibold text-slate-700">licuadora</span>) o navega por secciones.
        </p>
      </div>

      {/* Grid: Catalog (8 cols) + Cart Sidebar (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Search, Section Filter Pills & Product Grid */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Search bar & Section Filter */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por código, nombre o medida (ej. sarten 20, olla 4, maxtractor)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-1 focus:ring-[#0B2545]"
              />
            </div>

            {/* Official Sections Pills (Clean, no count numbers) */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSearchQuery('');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    selectedCategory === cat && !searchQuery.trim()
                      ? 'bg-[#0B2545] text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Compact Product Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredProducts.map((prod) => {
              const qtyInCart = cartMap.get(prod.id) || 0;

              return (
                <div
                  key={prod.id}
                  className={`bg-white rounded-xl border p-3.5 transition-all flex flex-col justify-between ${
                    qtyInCart > 0
                      ? 'border-[#0B2545] ring-1 ring-[#0B2545] bg-slate-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    {/* Code & Section */}
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-mono text-[11px] font-bold text-slate-400">
                        {prod.code}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold truncate bg-slate-100 px-1.5 py-0.5 rounded">
                        {prod.category}
                      </span>
                    </div>

                    {/* Product Name */}
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {prod.name}
                    </h3>
                  </div>

                  {/* Price & Counter / Add Button */}
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-base font-extrabold text-[#0B2545]">
                      {formatCurrency(prod.price)}
                    </span>

                    {qtyInCart > 0 ? (
                      <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                        <button
                          onClick={() => onUpdateQty(prod.id, qtyInCart - 1)}
                          className="w-6 h-6 rounded bg-white text-slate-700 flex items-center justify-center font-bold text-xs hover:bg-slate-200"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-[#0B2545]">
                          {qtyInCart}
                        </span>
                        <button
                          onClick={() => onUpdateQty(prod.id, qtyInCart + 1)}
                          className="w-6 h-6 rounded bg-[#0B2545] text-white flex items-center justify-center font-bold text-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => onAddToCart(prod)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#0B2545] hover:bg-[#07192F] text-white rounded-lg text-xs font-bold transition-all active:scale-95"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Agregar</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center border border-slate-200 text-xs text-slate-500">
              No se encontraron productos con "{searchQuery}".
            </div>
          )}

        </div>

        {/* Right: Sidebar normal o Pantalla Dividida en Paralelo */}
        <div className="lg:col-span-4 sticky top-20 space-y-3">
          
          {!isSplitMode ? (
            /* --- MODO NORMAL (UN SOLO SET) --- */
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm font-extrabold text-[#0B2545]">
                  Resumen del Set ({cart.reduce((a, b) => a + b.qty, 0)})
                </h2>
                {cart.length > 0 && (
                  <button
                    onClick={onClearCart}
                    className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                  >
                    Vaciar
                  </button>
                )}
              </div>

              {/* Items list */}
              {cart.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  Selecciona productos para armar tu set.
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1 no-scrollbar text-xs">
                  {cart.map((item) => (
                    <div
                      key={item.productId}
                      className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 truncate">{item.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {item.qty} unid. &bull; {formatCurrency(item.price)}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onUpdateQty(item.productId, item.qty - 1)}
                          className="w-5 h-5 rounded bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold cursor-pointer"
                          title="Restar 1"
                        >
                          -
                        </button>
                        <span className="w-5 text-center font-bold">{item.qty}</span>
                        <button
                          onClick={() => onUpdateQty(item.productId, item.qty + 1)}
                          className="w-5 h-5 rounded bg-[#0B2545] text-white flex items-center justify-center font-bold cursor-pointer"
                          title="Sumar 1"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Total */}
              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-500">TOTAL:</span>
                <span className="text-2xl font-black text-[#0B2545]">
                  {formatCurrency(cartTotal)}
                </span>
              </div>

              {/* Quick Cuotas Preview */}
              {cartTotal > 0 && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">
                    Cuotas sugeridas (Inicial {formatCurrency(defaultInitial)}):
                  </div>
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>12 Meses:</span>
                    <span className="text-[#0B2545]">{formatCurrency(cuota12)} / mes</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>24 Meses:</span>
                    <span className="text-[#0B2545]">{formatCurrency(cuota24)} / mes</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2 pt-1">
                <button
                  disabled={cart.length === 0}
                  onClick={onProceedToCalc}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    cart.length > 0
                      ? 'bg-[#0B2545] hover:bg-[#07192F] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>Calculadora Completa de Cuotas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  disabled={cart.length === 0}
                  onClick={onProceedToQuote}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    cart.length > 0
                      ? 'border-[#0B2545] text-[#0B2545] hover:bg-slate-50'
                      : 'border-slate-200 text-slate-300 cursor-not-allowed'
                  }`}
                >
                  <span>Generar Cotización</span>
                </button>
              </div>

            </div>
          ) : (
            /* --- MODO PANTALLA DIVIDIDA: DOS SETS (SET A vs SET B) --- */
            <div className="space-y-3">
              
              {/* SET A CARD */}
              <div 
                onClick={() => onSelectSplitSlot && onSelectSplitSlot('A')}
                className={`bg-white rounded-2xl p-4 space-y-3 border-2 transition-all cursor-pointer ${
                  activeSplitSlot === 'A'
                    ? 'border-[#0B2545] shadow-md ring-2 ring-[#0B2545]/15'
                    : 'border-slate-200 hover:border-slate-300 opacity-90'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide ${
                      activeSplitSlot === 'A' ? 'bg-[#0B2545] text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      SET A {activeSplitSlot === 'A' ? '• ACTIVO' : ''}
                    </span>
                    <span className="text-xs font-extrabold text-slate-700">
                      ({cartA.reduce((a, b) => a + b.qty, 0)} items)
                    </span>
                  </div>
                  {cartA.length > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onClearCartA(); }}
                      className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
                    >
                      Vaciar
                    </button>
                  )}
                </div>

                {/* Items Set A */}
                {cartA.length === 0 ? (
                  <div className="text-center py-3 text-xs text-slate-400">
                    {activeSplitSlot === 'A' ? '👈 Elige productos del catálogo para el Set A' : 'Set A vacío (clic para activar)'}
                  </div>
                ) : (
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 no-scrollbar text-xs">
                    {cartA.map((item) => (
                      <div
                        key={item.productId}
                        className="p-1.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between gap-1.5"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-slate-900 truncate text-[11px]">{item.name}</div>
                          <div className="text-[10px] text-slate-500">
                            {item.qty} unid. &bull; {formatCurrency(item.price)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); onUpdateQtyA(item.productId, item.qty - 1); }}
                            className="w-4 h-4 rounded bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs"
                          >
                            -
                          </button>
                          <span className="w-4 text-center font-bold text-xs">{item.qty}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); onUpdateQtyA(item.productId, item.qty + 1); }}
                            className="w-4 h-4 rounded bg-[#0B2545] text-white flex items-center justify-center font-bold text-xs"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Total & Acción Set A */}
                <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                  <span className="text-[11px] font-bold text-slate-500">TOTAL SET A:</span>
                  <span className="text-lg font-black text-[#0B2545]">
                    {formatCurrency(cartTotalA)}
                  </span>
                </div>

                {cartTotalA > 0 && (
                  <div className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-lg font-bold">
                    <span className="text-slate-500">12 cuotas:</span>
                    <span className="text-[#0B2545]">{formatCurrency(cuota12A)}/mes</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); if (onProceedToCalcSlot) onProceedToCalcSlot('A'); }}
                      className="ml-2 text-[10px] text-amber-700 hover:underline font-extrabold"
                    >
                      Calcular &gt;
                    </button>
                  </div>
                )}
              </div>

              {/* SET B CARD */}
              <div 
                onClick={() => onSelectSplitSlot && onSelectSplitSlot('B')}
                className={`bg-white rounded-2xl p-4 space-y-3 border-2 transition-all cursor-pointer ${
                  activeSplitSlot === 'B'
                    ? 'border-[#0B2545] shadow-md ring-2 ring-[#0B2545]/15'
                    : 'border-slate-200 hover:border-slate-300 opacity-90'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide ${
                      activeSplitSlot === 'B' ? 'bg-[#0B2545] text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      SET B {activeSplitSlot === 'B' ? '• ACTIVO' : ''}
                    </span>
                    <span className="text-xs font-extrabold text-slate-700">
                      ({cartB.reduce((a, b) => a + b.qty, 0)} items)
                    </span>
                  </div>
                  {cartB.length > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onClearCartB(); }}
                      className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
                    >
                      Vaciar
                    </button>
                  )}
                </div>

                {/* Items Set B */}
                {cartB.length === 0 ? (
                  <div className="text-center py-3 text-xs text-slate-400">
                    {activeSplitSlot === 'B' ? '👈 Elige productos del catálogo para el Set B' : 'Set B vacío (clic para activar)'}
                  </div>
                ) : (
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 no-scrollbar text-xs">
                    {cartB.map((item) => (
                      <div
                        key={item.productId}
                        className="p-1.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between gap-1.5"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-slate-900 truncate text-[11px]">{item.name}</div>
                          <div className="text-[10px] text-slate-500">
                            {item.qty} unid. &bull; {formatCurrency(item.price)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); onUpdateQtyB(item.productId, item.qty - 1); }}
                            className="w-4 h-4 rounded bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs"
                          >
                            -
                          </button>
                          <span className="w-4 text-center font-bold text-xs">{item.qty}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); onUpdateQtyB(item.productId, item.qty + 1); }}
                            className="w-4 h-4 rounded bg-[#0B2545] text-white flex items-center justify-center font-bold text-xs"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Total & Acción Set B */}
                <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                  <span className="text-[11px] font-bold text-slate-500">TOTAL SET B:</span>
                  <span className="text-lg font-black text-[#0B2545]">
                    {formatCurrency(cartTotalB)}
                  </span>
                </div>

                {cartTotalB > 0 && (
                  <div className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-lg font-bold">
                    <span className="text-slate-500">12 cuotas:</span>
                    <span className="text-[#0B2545]">{formatCurrency(cuota12B)}/mes</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); if (onProceedToCalcSlot) onProceedToCalcSlot('B'); }}
                      className="ml-2 text-[10px] text-[#0B2545] hover:underline font-extrabold"
                    >
                      Calcular &gt;
                    </button>
                  </div>
                )}
              </div>

              {/* Comparador Rápido entre A y B */}
              {(cartTotalA > 0 || cartTotalB > 0) && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between font-extrabold text-amber-950">
                    <span>Diferencia A vs B:</span>
                    <span>{formatCurrency(Math.abs(cartTotalA - cartTotalB))}</span>
                  </div>
                  <p className="text-[10px] text-amber-900/80">
                    {cartTotalA > cartTotalB 
                      ? 'El Set A incluye mayor valor o piezas que el Set B.' 
                      : cartTotalB > cartTotalA 
                        ? 'El Set B incluye mayor valor o piezas que el Set A.' 
                        : 'Ambos sets tienen exactamente el mismo monto.'}
                  </p>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
