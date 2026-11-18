export interface CallLogEntry {
  id: string;
  code: 'SC' | 'NC' | 'Col' | 'Bz' | 'll' | string;
  label?: string;
  datetime: string;
  note?: string;
}

export interface LeadData {
  id: string;
  timestamp: string;
  nivelPreocupacion: number | string;
  conocimientoDano: string;
  edadHijos: string;
  preguntaCondicional: string;
  respuestaCondicional: string;
  interesSolucion: string;
  nombreMadre: string;
  celular: string;
  distrito: string;
  observaciones: string;
  gestCall?: string;
  obserCalls?: string;
  callHistory?: CallLogEntry[];
  sheetTab?: string;
  estadoCrm?: 'nuevo' | 'contactado' | 'demo_agendada' | 'ganado' | 'descartado';
  ticketUrl?: string;
  salesRep?: string;
  tipoLead?: 'cliente' | 'rec' | string;
}

export const DEFAULT_SHEET_TABS = [
  'Prospecc',
  'Mod Aviacion (JA)',
  'Mod FS Import',
  'REF Eliana Aspillaga',
  'REF Laura Torres Alvarez',
  'REF Juliana Gil',
  'REF Juan Cabanillas',
  'REF Rita',
  'REF Abigail',
  'CC Faviana',
  'Mod Avcn (R)'
];

export const DEFAULT_REC_TABS = [
  'Esan',
  'Mod Aviacion',
  'RP'
];

export const LS_SHEET_TABS = 'vitality_sheet_tabs_v2';
export const LS_ACTIVE_SHEET_TAB = 'vitality_active_sheet_tab_v2';
export const LS_ACTIVE_ADMIN_REP = 'vitality_active_admin_rep_v1';
export const LS_LEAD_CATEGORY_VIEW = 'vitality_lead_category_view_v1';

export const getSavedSheetTabs = (): string[] => {
  try {
    const s = localStorage.getItem(LS_SHEET_TABS);
    if (s) {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    // fallback
  }
  return DEFAULT_SHEET_TABS;
};
