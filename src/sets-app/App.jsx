'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import SetBuilder from './components/SetBuilder';
import PreestablishedSetsView from './components/PreestablishedSetsView';
import FinancingCalculator from './components/FinancingCalculator';
import QuoteGenerator from './components/QuoteGenerator';
import SavedSetsModal from './components/SavedSetsModal';
import { PRODUCTS } from './data/products';
import confetti from 'canvas-confetti';

export default function App() {
  const [activeTab, setActiveTab] = useState('builder'); // 'builder' | 'presets' | 'calculator' | 'quote'
  
  // --- MODO PANTALLA DIVIDIDA (SPLIT SCREEN) ---
  const [isSplitMode, setIsSplitMode] = useState(() => {
    try {
      return localStorage.getItem('rp_vitality_split_mode') === 'true';
    } catch {
      return false;
    }
  });

  const [activeSplitSlot, setActiveSplitSlot] = useState('A'); // 'A' | 'B'

  // Cart A state
  const [cartA, setCartA] = useState(() => {
    try {
      const saved = localStorage.getItem('rp_vitality_cart_a') || localStorage.getItem('rp_vitality_cart');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    const initialProd = PRODUCTS.find(p => p.code === 'CO4642');
    return initialProd ? [{
      productId: initialProd.id,
      code: initialProd.code,
      name: initialProd.name,
      price: initialProd.price,
      qty: 1,
      category: initialProd.category
    }] : [];
  });

  // Cart B state (para comparar o armar un segundo set en paralelo)
  const [cartB, setCartB] = useState(() => {
    try {
      const saved = localStorage.getItem('rp_vitality_cart_b');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Saved sets history
  const [savedSets, setSavedSets] = useState(() => {
    try {
      const saved = localStorage.getItem('rp_vitality_saved_sets');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [selectedFinancingPlan, setSelectedFinancingPlan] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('rp_vitality_cart_a', JSON.stringify(cartA));
      // Guardar también en rp_vitality_cart para retrocompatibilidad
      localStorage.setItem('rp_vitality_cart', JSON.stringify(cartA));
    } catch (e) {
      console.error(e);
    }
  }, [cartA]);

  useEffect(() => {
    try {
      localStorage.setItem('rp_vitality_cart_b', JSON.stringify(cartB));
    } catch (e) {
      console.error(e);
    }
  }, [cartB]);

  useEffect(() => {
    try {
      localStorage.setItem('rp_vitality_split_mode', String(isSplitMode));
    } catch (e) {
      console.error(e);
    }
  }, [isSplitMode]);

  useEffect(() => {
    try {
      localStorage.setItem('rp_vitality_saved_sets', JSON.stringify(savedSets));
    } catch (e) {
      console.error(e);
    }
  }, [savedSets]);

  // Totales
  const cartTotalA = useMemo(() => {
    return cartA.reduce((sum, item) => sum + (item.price * item.qty), 0);
  }, [cartA]);

  const cartTotalB = useMemo(() => {
    return cartB.reduce((sum, item) => sum + (item.price * item.qty), 0);
  }, [cartB]);

  // Carrito activo actual según el slot enfocado
  const currentActiveCart = activeSplitSlot === 'B' && isSplitMode ? cartB : cartA;
  const currentActiveCartTotal = activeSplitSlot === 'B' && isSplitMode ? cartTotalB : cartTotalA;

  // Toggle de Pantalla Dividida
  const handleToggleSplitMode = () => {
    setIsSplitMode(prev => {
      const next = !prev;
      if (next && cartB.length === 0 && cartA.length > 0) {
        // Al abrir por primera vez la pantalla dividida, podemos ofrecer copiar el set A o empezar limpio
        // Mantenemos limpio para que el vendedor arme la alternativa
      }
      return next;
    });
  };

  // Generic Cart Item Adder for a specific slot
  const addItemToCartSlot = (setCartState, product) => {
    setCartState((prev) => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item =>
          item.productId === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          code: product.code,
          name: product.name,
          price: product.price,
          qty: 1,
          category: product.category
        }
      ];
    });
  };

  // Add product to active cart slot
  const handleAddToCart = (product) => {
    if (isSplitMode && activeSplitSlot === 'B') {
      addItemToCartSlot(setCartB, product);
    } else {
      addItemToCartSlot(setCartA, product);
    }
  };

  // Update item quantity for a specific slot
  const updateQtyInSlot = (setCartState, productId, newQty) => {
    if (newQty <= 0) {
      setCartState(prev => prev.filter(item => item.productId !== productId));
      return;
    }
    setCartState((prev) =>
      prev.map(item => item.productId === productId ? { ...item, qty: newQty } : item)
    );
  };

  const handleUpdateQty = (productId, newQty) => {
    if (isSplitMode && activeSplitSlot === 'B') {
      updateQtyInSlot(setCartB, productId, newQty);
    } else {
      updateQtyInSlot(setCartA, productId, newQty);
    }
  };

  const handleRemoveFromCart = (productId) => {
    if (isSplitMode && activeSplitSlot === 'B') {
      setCartB(prev => prev.filter(item => item.productId !== productId));
    } else {
      setCartA(prev => prev.filter(item => item.productId !== productId));
    }
  };

  const handleClearCart = () => {
    if (isSplitMode && activeSplitSlot === 'B') {
      setCartB([]);
    } else {
      setCartA([]);
    }
  };

  // Load a Preestablished Set into active cart slot
  const handleLoadPreestablishedSet = (preset, autoSwitchToBuilder = true) => {
    const newItems = [];
    if (preset.items && preset.items.length > 0) {
      preset.items.forEach(i => {
        const prod = PRODUCTS.find(p => p.id === i.productId || p.code === i.code);
        newItems.push({
          productId: prod ? prod.id : i.productId,
          code: prod ? prod.code : i.code,
          name: prod ? prod.name : i.name,
          price: prod ? prod.price : i.price,
          qty: i.qty || 1,
          category: prod ? prod.category : (i.category || 'Sets')
        });
      });
    } else {
      newItems.push({
        productId: preset.id,
        code: preset.id.toUpperCase(),
        name: preset.name,
        price: preset.price,
        qty: 1,
        category: preset.category
      });
    }

    if (isSplitMode && activeSplitSlot === 'B') {
      setCartB(newItems);
    } else {
      setCartA(newItems);
    }

    // Al cargar desde la sección de Combos & Sets, navega automáticamente al Armador
    // para mostrar las piezas seleccionadas y permitir editarlas o combinarlas de inmediato
    if (autoSwitchToBuilder) {
      setActiveTab('builder');
    }
  };

  // Direct calculation jump from preset card
  const handleCalculateSetDirectly = (preset) => {
    handleLoadPreestablishedSet(preset, false);
    setActiveTab('calculator');
  };

  // Save current cart configuration
  const handleSaveCurrentSet = () => {
    const targetCart = isSplitMode && activeSplitSlot === 'B' ? cartB : cartA;
    const targetTotal = isSplitMode && activeSplitSlot === 'B' ? cartTotalB : cartTotalA;

    if (targetCart.length === 0) return;
    const slotLabel = isSplitMode ? ` [Set ${activeSplitSlot}]` : '';
    const titlePrompt = prompt('Nombre para esta configuración:', `Set Royal Prestige${slotLabel} - ${new Date().toLocaleDateString()}`);
    if (!titlePrompt) return;

    const newSave = {
      id: Date.now().toString(),
      title: titlePrompt,
      date: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }),
      total: targetTotal,
      items: [...targetCart]
    };

    setSavedSets(prev => [newSave, ...prev]);
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.6 }
    });
  };

  // Load a saved set into active slot
  const handleLoadSavedSet = (savedSet) => {
    if (isSplitMode && activeSplitSlot === 'B') {
      setCartB(savedSet.items);
    } else {
      setCartA(savedSet.items);
    }
    setIsSavedModalOpen(false);
    setActiveTab('builder');
  };

  // Delete saved set
  const handleDeleteSavedSet = (id) => {
    setSavedSets(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cart={currentActiveCart}
        cartTotal={currentActiveCartTotal}
        onResetCart={handleClearCart}
        savedSetsCount={savedSets.length}
        onOpenSaved={() => setIsSavedModalOpen(true)}
        // Split Screen props
        isSplitMode={isSplitMode}
        onToggleSplitMode={handleToggleSplitMode}
        activeSplitSlot={activeSplitSlot}
        onSelectSplitSlot={(slot) => setActiveSplitSlot(slot)}
        cartA={cartA}
        cartTotalA={cartTotalA}
        cartB={cartB}
        cartTotalB={cartTotalB}
      />

      {/* Main Tab Content */}
      <main className="flex-1">
        {activeTab === 'builder' && (
          <SetBuilder
            cart={currentActiveCart}
            onAddToCart={handleAddToCart}
            onUpdateQty={handleUpdateQty}
            onRemoveFromCart={handleRemoveFromCart}
            onClearCart={handleClearCart}
            cartTotal={currentActiveCartTotal}
            onProceedToCalc={() => setActiveTab('calculator')}
            onProceedToQuote={() => setActiveTab('quote')}
            onSaveCurrentSet={handleSaveCurrentSet}
            // Split Screen props
            isSplitMode={isSplitMode}
            activeSplitSlot={activeSplitSlot}
            onSelectSplitSlot={(slot) => setActiveSplitSlot(slot)}
            cartA={cartA}
            cartTotalA={cartTotalA}
            onUpdateQtyA={(id, qty) => updateQtyInSlot(setCartA, id, qty)}
            onClearCartA={() => setCartA([])}
            cartB={cartB}
            cartTotalB={cartTotalB}
            onUpdateQtyB={(id, qty) => updateQtyInSlot(setCartB, id, qty)}
            onClearCartB={() => setCartB([])}
            onProceedToCalcSlot={(slot) => {
              setActiveSplitSlot(slot);
              setActiveTab('calculator');
            }}
          />
        )}

        {activeTab === 'presets' && (
          <PreestablishedSetsView
            onLoadPreestablishedSet={(preset) => handleLoadPreestablishedSet(preset, true)}
            onCalculateSetDirectly={handleCalculateSetDirectly}
            activeSplitSlot={activeSplitSlot}
            isSplitMode={isSplitMode}
          />
        )}

        {activeTab === 'calculator' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            
            {/* Minimal Header */}
            <div className="pb-4 border-b border-slate-200">
              <h1 className="text-2xl font-black text-[#0B2545] tracking-tight">
                Calculadora de Financiamiento
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Calcula cuotas mensuales de 1 a 24 meses según la inicial y los coeficientes oficiales.
              </p>
            </div>

            {/* Si NO está en pantalla dividida: Vista normal de 1 calculadora */}
            {!isSplitMode ? (
              <FinancingCalculator
                totalAmount={cartTotalA}
                onSelectCuotaPlan={(plan) => setSelectedFinancingPlan(plan)}
                onProceedToQuote={() => setActiveTab('quote')}
                slotId="A"
              />
            ) : (
              /* MODO PANTALLA DIVIDIDA: 
                 - En Celulares (< md): Muestra el slot activo con switch selector
                 - En Laptops y Tablets (>= md): Muestra AMBAS calculadoras lado a lado (Set A | Set B)
              */
              <div>
                {/* Mobile Tab Switcher (< md) */}
                <div className="md:hidden flex items-center justify-center p-1 bg-slate-200 rounded-xl mb-4 gap-1">
                  <button
                    onClick={() => setActiveSplitSlot('A')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${
                      activeSplitSlot === 'A'
                        ? 'bg-[#0B2545] text-amber-400 shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    Set A ({cartA.reduce((s, i) => s + i.qty, 0)})
                  </button>
                  <button
                    onClick={() => setActiveSplitSlot('B')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${
                      activeSplitSlot === 'B'
                        ? 'bg-[#0B2545] text-amber-400 shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    Set B ({cartB.reduce((s, i) => s + i.qty, 0)})
                  </button>
                </div>

                {/* Mobile View (< md): Muestra solo el slot enfocado */}
                <div className="md:hidden">
                  {activeSplitSlot === 'A' ? (
                    <FinancingCalculator
                      totalAmount={cartTotalA}
                      onSelectCuotaPlan={(plan) => setSelectedFinancingPlan(plan)}
                      onProceedToQuote={() => setActiveTab('quote')}
                      slotId="A"
                      slotLabel="Set A"
                    />
                  ) : (
                    <FinancingCalculator
                      totalAmount={cartTotalB}
                      onSelectCuotaPlan={(plan) => setSelectedFinancingPlan(plan)}
                      onProceedToQuote={() => setActiveTab('quote')}
                      slotId="B"
                      slotLabel="Set B"
                    />
                  )}
                </div>

                {/* Desktop & Tablet Dual Split Grid (>= md): Ambas vistas en paralelo lado a lado */}
                <div className="hidden md:grid md:grid-cols-2 gap-6 items-start">
                  
                  {/* Calculadora Set A */}
                  <div className="p-4 bg-white/60 rounded-3xl border-2 border-[#0B2545]/20 shadow-xs">
                    <FinancingCalculator
                      totalAmount={cartTotalA}
                      onSelectCuotaPlan={(plan) => setSelectedFinancingPlan(plan)}
                      onProceedToQuote={() => setActiveTab('quote')}
                      slotId="A"
                      slotLabel="SET A"
                    />
                  </div>

                  {/* Calculadora Set B */}
                  <div className="p-4 bg-white/60 rounded-3xl border-2 border-[#0B2545]/20 shadow-xs">
                    <FinancingCalculator
                      totalAmount={cartTotalB}
                      onSelectCuotaPlan={(plan) => setSelectedFinancingPlan(plan)}
                      onProceedToQuote={() => setActiveTab('quote')}
                      slotId="B"
                      slotLabel="SET B"
                    />
                  </div>

                </div>

              </div>
            )}

          </div>
        )}

        {activeTab === 'quote' && (
          <QuoteGenerator
            cart={currentActiveCart}
            cartTotal={currentActiveCartTotal}
            selectedFinancingPlan={selectedFinancingPlan}
          />
        )}
      </main>

      {/* Saved Sets Modal */}
      <SavedSetsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedSets={savedSets}
        onLoadSavedSet={handleLoadSavedSet}
        onDeleteSavedSet={handleDeleteSavedSet}
      />

      {/* Minimal Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-6 mt-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <span className="font-extrabold text-[#0B2545]">VITALITY CORE</span>
          <span>Royal Prestige&reg; Perú 2026</span>
        </div>
      </footer>

    </div>
  );
}
