import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Copy, 
  Check, 
  ShieldCheck, 
  Phone, 
  User, 
  MessageCircle
} from 'lucide-react';
import { FINANCE_FACTORS, formatCurrency, roundToCentena, roundToDecena } from '../data/financeFactors';

export default function QuoteGenerator({
  cart,
  cartTotal,
  selectedFinancingPlan
}) {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [advisorName, setAdvisorName] = useState('Vitality Core San Borja');
  const [copied, setCopied] = useState(false);

  const today = new Date().toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const basePriceSinIgv = cartTotal / 1.18;
  const igvAmount = cartTotal - basePriceSinIgv;

  const initialAmount = selectedFinancingPlan?.initialAmount ?? roundToCentena(cartTotal * 0.10);
  const balanceToFinance = Math.max(0, cartTotal - initialAmount);

  // Cuotas key comparison (12, 14, 18, 24)
  const keyCuotas = [12, 14, 18, 24].map((cNum) => {
    const f = FINANCE_FACTORS.find(item => item.cuotas === cNum);
    const cuotaAmount = roundToDecena(balanceToFinance * f.coeficiente);
    return {
      cuotas: cNum,
      amount: cuotaAmount,
      total: cuotaAmount * cNum
    };
  });

  // Cash price option con Cupón Familiar 5%
  const cashCouponDcto = cartTotal * 0.95;

  // Build WhatsApp Message (Without gifts)
  const generateWhatsAppMessage = () => {
    let msg = `👑 *VITALITY CORE - ROYAL PRESTIGE PERÚ*\n`;
    msg += `📄 *COTIZACIÓN DE SET PERSONALIZADO*\n`;
    if (clientName) msg += `👤 *Cliente:* ${clientName}\n`;
    msg += `📅 *Fecha:* ${today}\n`;
    msg += `------------------------------------\n\n`;

    msg += `🍳 *DETALLE DEL SET:*\n`;
    cart.forEach((item) => {
      msg += `▪ ${item.qty}x ${item.name} (${item.code}) - ${formatCurrency(item.price * item.qty)}\n`;
    });

    msg += `\n💵 *INVERSIÓN:* \n`;
    msg += `▪ *Precio Total Lista:* ${formatCurrency(cartTotal)}\n`;
    msg += `▪ *Opción Contado (Cupón Familiar -5%):* ${formatCurrency(cashCouponDcto)}\n\n`;

    msg += `📊 *FINANCIAMIENTO DIRECTO:*\n`;
    msg += `▪ *Inicial sugerida:* ${formatCurrency(initialAmount)}\n`;
    msg += `▪ *Saldo a financiar:* ${formatCurrency(balanceToFinance)}\n\n`;
    msg += `*Cuotas Mensuales sugeridas:*\n`;
    keyCuotas.forEach((q) => {
      msg += `  ✦ ${q.cuotas} Meses: *${formatCurrency(q.amount)}* / mes\n`;
    });

    msg += `\n🛡️ *Garantía de Acero Quirúrgico 316L.*\n`;
    msg += `📞 *Asesor:* ${advisorName}`;

    return msg;
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(generateWhatsAppMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(generateWhatsAppMessage());
    const phoneClean = clientPhone.replace(/\D/g, '');
    let url = `https://wa.me/`;
    if (phoneClean) {
      url += phoneClean.startsWith('51') ? phoneClean : `51${phoneClean}`;
    }
    url += `?text=${text}`;
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <FileText className="w-16 h-16 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">No hay productos en tu set para cotizar</h2>
        <p className="text-sm text-slate-500">
          Agrega productos en el armador o elige un set preestablecido.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Control bar (no print) */}
      <div className="no-print bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-extrabold text-[#0B2545]">
              Generador de Cotización
            </h2>
            <p className="text-xs text-slate-500">
              Personaliza con los datos del cliente y compártelo al instante por WhatsApp o PDF.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '¡Copiado!' : 'Copiar Texto'}</span>
            </button>

            <button
              onClick={handleOpenWhatsApp}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Enviar WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Inputs row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-500 font-bold mb-1">Nombre del Cliente:</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Ej. Juan Pérez"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-500 font-bold mb-1">Teléfono / WhatsApp:</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Ej. 956 300 051"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-500 font-bold mb-1">Asesor / Distribuidor:</label>
            <input
              type="text"
              value={advisorName}
              onChange={(e) => setAdvisorName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
            />
          </div>
        </div>
      </div>

      {/* FORMAL QUOTATION SHEET (No Gifts) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-12 space-y-8 font-sans">
        
        {/* Header Branding */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b-2 border-slate-900 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 p-1.5 border border-slate-200 flex items-center justify-center">
              <img 
                src="/assets/brand/logo_vitality.jpg" 
                alt="Vitality Core" 
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div>
              <div className="text-xl font-black tracking-tight text-[#0B2545]">
                VITALITY<span className="text-[#C5A059]">CORE</span>
              </div>
              <div className="text-xs uppercase font-extrabold tracking-widest text-slate-500">
                Distribuidor Autorizado Royal Prestige&reg; Perú
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="inline-block text-xs uppercase font-bold tracking-widest text-[#0B2545] bg-slate-100 px-3 py-1 rounded-full mb-1">
              Cotización Formal 2026
            </span>
            <div className="text-xs text-slate-500 font-medium">Fecha: {today}</div>
          </div>
        </div>

        {/* Client Info Banner */}
        {clientName && (
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider">Cliente:</span>
              <div className="text-base font-extrabold text-[#0B2545]">{clientName}</div>
            </div>
            {clientPhone && (
              <div className="text-right">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Contacto:</span>
                <div className="font-semibold text-slate-700">{clientPhone}</div>
              </div>
            )}
          </div>
        )}

        {/* Products Table */}
        <div className="space-y-3">
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B2545] text-white uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Descripción del Producto</th>
                  <th className="py-3 px-4 text-center">Cant.</th>
                  <th className="py-3 px-4 text-right">P. Unitario</th>
                  <th className="py-3 px-4 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cart.map((item) => (
                  <tr key={item.productId} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-500">{item.code}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[11px] text-slate-500">{item.category}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700">{item.qty}</td>
                    <td className="py-3 px-4 text-right font-medium text-slate-600">{formatCurrency(item.price)}</td>
                    <td className="py-3 px-4 text-right font-bold text-[#0B2545]">{formatCurrency(item.price * item.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Investment & Financing Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
          
          {/* Left: Totals & Cash Options */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Pago al Contado
            </h4>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-baseline font-black">
                <span className="text-slate-900">PRECIO TOTAL DE LISTA:</span>
                <span className="text-lg text-[#0B2545]">{formatCurrency(cartTotal)}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2 text-xs">
              <div className="font-bold text-amber-950">Beneficio Cupón Familiar:</div>
              <div className="flex justify-between text-amber-900 font-extrabold">
                <span>Contado con Cupón Familiar (-5%):</span>
                <span className="font-black text-[#0B2545]">{formatCurrency(cashCouponDcto)}</span>
              </div>
            </div>
          </div>

          {/* Right: Financed Payment Options */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Financiamiento Directo
            </h4>

            <div className="bg-[#0B2545] text-white p-5 rounded-2xl shadow-xs space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-white/10 text-xs">
                <span className="text-slate-300">Depósito Inicial:</span>
                <span className="text-base font-black text-amber-400">{formatCurrency(initialAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300">Saldo a Financiar:</span>
                <span className="font-bold text-white">{formatCurrency(balanceToFinance)}</span>
              </div>

              <div className="pt-2 border-t border-white/10 space-y-1.5 text-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                  Cuotas Mensuales:
                </div>
                {keyCuotas.map(q => (
                  <div key={q.cuotas} className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="font-semibold text-slate-200">{q.cuotas} Meses:</span>
                    <span className="font-black text-base text-amber-300">{formatCurrency(q.amount)} / mes</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Footer Warranties */}
        <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Garantía Oficial de Acero Quirúrgico Grado 316L</span>
          </div>
          <div className="font-semibold text-slate-700">
            Vitality Core
          </div>
        </div>

      </div>

    </div>
  );
}
