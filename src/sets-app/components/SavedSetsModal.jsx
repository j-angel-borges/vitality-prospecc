import React from 'react';
import { X, Bookmark, Trash2, ArrowRight, Calendar, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '../data/financeFactors';

export default function SavedSetsModal({
  isOpen,
  onClose,
  savedSets,
  onLoadSavedSet,
  onDeleteSavedSet
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#C5A059] flex items-center justify-center">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#0B2545]">
                Configuraciones Guardadas
              </h3>
              <p className="text-xs text-slate-500">
                Sets y cotizaciones almacenadas en tu navegador
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of sets */}
        {savedSets.length === 0 ? (
          <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-700">No tienes configuraciones guardadas</div>
            <p className="text-xs text-slate-500">
              Cuando armes un set en el armador, usa el botón "Guardar Configuración".
            </p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
            {savedSets.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-[#0B2545]/40 transition-all flex items-center justify-between gap-4 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold text-sm text-[#0B2545] truncate">
                    {s.title || 'Set Personalizado'}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                    <span className="font-bold text-amber-700">{formatCurrency(s.total)}</span>
                    <span>&bull;</span>
                    <span>{s.items.reduce((acc, i) => acc + i.qty, 0)} productos</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{s.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onLoadSavedSet(s)}
                    className="px-3 py-2 rounded-xl bg-[#0B2545] text-white hover:bg-[#07192F] text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
                  >
                    <span>Cargar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteSavedSet(s.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
