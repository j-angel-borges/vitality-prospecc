// Factores oficiales de financiamiento Royal Prestige (1 a 24 cuotas)
// Extraídos directamente de las matrices operativas de Vitality Core / Royal Prestige 2026

export const FINANCE_FACTORS = [
  { cuotas: 1,  coeficiente: 1.0300, label: '1 Mes' },
  { cuotas: 2,  coeficiente: 0.5298, label: '2 Meses' },
  { cuotas: 3,  coeficiente: 0.3600, label: '3 Meses' },
  { cuotas: 4,  coeficiente: 0.2751, label: '4 Meses' },
  { cuotas: 5,  coeficiente: 0.2243, label: '5 Meses' },
  { cuotas: 6,  coeficiente: 0.1904, label: '6 Meses (Semestral)' },
  { cuotas: 7,  coeficiente: 0.1663, label: '7 Meses' },
  { cuotas: 8,  coeficiente: 0.1482, label: '8 Meses' },
  { cuotas: 9,  coeficiente: 0.1342, label: '9 Meses' },
  { cuotas: 10, coeficiente: 0.1230, label: '10 Meses' },
  { cuotas: 11, coeficiente: 0.1138, label: '11 Meses' },
  { cuotas: 12, coeficiente: 0.1062, label: '12 Meses (1 Año)', isPopular: true },
  { cuotas: 13, coeficiente: 0.0998, label: '13 Meses' },
  { cuotas: 14, coeficiente: 0.0943, label: '14 Meses', isPopular: true },
  { cuotas: 15, coeficiente: 0.0896, label: '15 Meses' },
  { cuotas: 16, coeficiente: 0.0855, label: '16 Meses', isPopular: true },
  { cuotas: 17, coeficiente: 0.0818, label: '17 Meses' },
  { cuotas: 18, coeficiente: 0.0786, label: '18 Meses (1.5 Años)', isPopular: true },
  { cuotas: 19, coeficiente: 0.0758, label: '19 Meses' },
  { cuotas: 20, coeficiente: 0.0732, label: '20 Meses' },
  { cuotas: 21, coeficiente: 0.0709, label: '21 Meses' },
  { cuotas: 22, coeficiente: 0.0688, label: '22 Meses' },
  { cuotas: 23, coeficiente: 0.0669, label: '23 Meses' },
  { cuotas: 24, coeficiente: 0.0652, label: '24 Meses (2 Años)', isPopular: true },
];

// Presets de porcentajes de inicial
export const INITIAL_PRESETS = [15, 20, 25];

// Descuentos de Contado
export const CASH_DISCOUNTS = [
  { label: 'Precio Lista (Contado estándar)', value: 0 },
  { label: '5% Descuento Especial Contado', value: 0.05 },
  { label: '7% Cupo Familiar Limitado Contado', value: 0.07 },
  { label: '10% Descuento Campaña / Evento', value: 0.10 }
];

// Redondeos habituales en Royal Prestige
export function roundToCentena(val) {
  if (val <= 0) return 0;
  return Math.ceil(val / 100) * 100;
}

export function roundToDecena(val) {
  if (val <= 0) return 0;
  return Math.ceil(val / 10) * 10;
}

// Formateador de moneda en Soles
export function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return 'S/. 0.00';
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount).replace('PEN', 'S/.');
}
