import {
  LeadData,
  CallLogEntry,
  DEFAULT_SHEET_TABS,
  LS_SHEET_TABS,
  LS_ACTIVE_SHEET_TAB
} from '@/data/leadTypes';
import { db as firestoreDb } from '@/firebase/firebaseClient';
import { collection as fsCollection, doc as fsDoc, setDoc as fsSetDoc, getDoc as fsGetDoc, deleteDoc as fsDeleteDoc, onSnapshot as fsOnSnapshot, query as fsQuery, serverTimestamp as fsServerTimestamp, updateDoc as fsUpdateDoc } from 'firebase/firestore';

export const LEADS_COLLECTION = 'leads';
export const SETTINGS_COLLECTION = 'crm_settings';
export const SETTINGS_CONFIG_DOC = 'config';

export function subscribeToCloudTabs(callback: (tabs: string[]) => void): () => void {
  const docRef = fsDoc(firestoreDb, SETTINGS_COLLECTION, SETTINGS_CONFIG_DOC);
  return fsOnSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data.sheetTabs) && data.sheetTabs.length > 0) {
          try {
            localStorage.setItem(LS_SHEET_TABS, JSON.stringify(data.sheetTabs));
          } catch (e) {}
          callback(data.sheetTabs);
          return;
        }
      }
      callback(DEFAULT_SHEET_TABS);
    },
    (err) => {
      console.warn('Error listening to cloud tabs, using local fallback:', err);
      callback(DEFAULT_SHEET_TABS);
    }
  );
}

export async function addCloudTab(tabName: string): Promise<string[]> {
  const cleanName = tabName.trim();
  if (!cleanName) return DEFAULT_SHEET_TABS;

  const docRef = fsDoc(firestoreDb, SETTINGS_COLLECTION, SETTINGS_CONFIG_DOC);
  let currentTabs = DEFAULT_SHEET_TABS;
  try {
    const snap = await fsGetDoc(docRef);
    if (snap.exists() && Array.isArray(snap.data()?.sheetTabs)) {
      currentTabs = snap.data().sheetTabs;
    }
  } catch (e) {
    console.warn('Error reading tabs from cloud:', e);
  }

  const newTabs = Array.from(new Set([...currentTabs, cleanName]));
  try {
    await fsSetDoc(docRef, { sheetTabs: newTabs, updatedAt: fsServerTimestamp() }, { merge: true });
  } catch (e) {
    console.warn('Error saving new tab to cloud:', e);
  }

  try {
    localStorage.setItem(LS_SHEET_TABS, JSON.stringify(newTabs));
    localStorage.setItem(LS_ACTIVE_SHEET_TAB, cleanName);
  } catch (e) {}

  return newTabs;
}

export async function deleteCloudTab(tabName: string): Promise<string[]> {
  if (DEFAULT_SHEET_TABS.includes(tabName)) {
    console.warn('Cannot delete base tabs');
    return DEFAULT_SHEET_TABS;
  }

  const docRef = fsDoc(firestoreDb, SETTINGS_COLLECTION, SETTINGS_CONFIG_DOC);
  let currentTabs = DEFAULT_SHEET_TABS;
  try {
    const snap = await fsGetDoc(docRef);
    if (snap.exists() && Array.isArray(snap.data()?.sheetTabs)) {
      currentTabs = snap.data().sheetTabs;
    }
  } catch (e) {}

  const newTabs = currentTabs.filter((t) => t !== tabName);
  try {
    await fsSetDoc(docRef, { sheetTabs: newTabs, updatedAt: fsServerTimestamp() }, { merge: true });
  } catch (e) {}

  try {
    localStorage.setItem(LS_SHEET_TABS, JSON.stringify(newTabs));
  } catch (e) {}

  return newTabs;
}

export function subscribeToCloudLeads(callback: (leads: LeadData[]) => void): () => void {
  const q = fsQuery(fsCollection(firestoreDb, LEADS_COLLECTION));
  return fsOnSnapshot(
    q,
    (snapshot) => {
      const cloudList: LeadData[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        cloudList.push({
          id: d.id,
          timestamp: data.timestamp || data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          nivelPreocupacion: data.nivelPreocupacion || '',
          conocimientoDano: data.conocimientoDano || data.pollutionAwareness || '',
          edadHijos: data.edadHijos || '',
          preguntaCondicional: data.preguntaCondicional || '',
          respuestaCondicional: data.respuestaCondicional || '',
          interesSolucion: data.interesSolucion || '',
          nombreMadre: data.nombreMadre || data.fullName || '',
          celular: data.celular || data.phoneNumber || '',
          distrito: data.distrito || data.district || '',
          observaciones: data.observaciones || data.notes || '',
          gestCall: data.gestCall || '',
          obserCalls: data.obserCalls || '',
          callHistory: data.callHistory || [],
          sheetTab: data.sheetTab || 'Prospecc',
          estadoCrm: data.estadoCrm || 'nuevo',
          salesRep: data.salesRep || 'Jose Angel',
          tipoLead: data.tipoLead || 'cliente',
          numeroCliente: data.numeroCliente || '',
          apellido: data.apellido || '',
          provincia: data.provincia || '',
          direccion: data.direccion || '',
          informacionCuenta: data.informacionCuenta || '',
          ordenes: data.ordenes || '',
          emprendedores: data.emprendedores || '',
          clienteFicha: data.clienteFicha || undefined
        });
      });
      callback(cloudList);
    },
    (err) => {
      console.warn('Error subscribing to leads:', err);
    }
  );
}

export async function saveCloudLead(lead: LeadData): Promise<void> {
  const docRef = fsDoc(firestoreDb, LEADS_COLLECTION, lead.id);
  await fsSetDoc(
    docRef,
    {
      ...lead,
      updatedAt: fsServerTimestamp()
    },
    { merge: true }
  );
}

export async function updateCloudLeadField(leadId: string, field: keyof LeadData, value: any): Promise<void> {
  const docRef = fsDoc(firestoreDb, LEADS_COLLECTION, leadId);
  await fsSetDoc(
    docRef,
    {
      [field]: value,
      updatedAt: fsServerTimestamp()
    },
    { merge: true }
  );
}

export async function addCloudCallLog(
  leadOrId: LeadData | string,
  log: CallLogEntry,
  currentLogs?: CallLogEntry[]
): Promise<LeadData> {
  const leadId = typeof leadOrId === 'string' ? leadOrId : leadOrId.id;
  const baseLead = typeof leadOrId === 'object' && leadOrId !== null ? leadOrId : null;
  const existingLogs = Array.isArray(baseLead?.callHistory) ? baseLead!.callHistory : (currentLogs || []);
  const updatedLogs = [log, ...existingLogs];

  const docRef = fsDoc(firestoreDb, LEADS_COLLECTION, leadId);
  await fsSetDoc(
    docRef,
    {
      callHistory: updatedLogs,
      gestCall: log.code,
      updatedAt: fsServerTimestamp()
    },
    { merge: true }
  );

  return {
    ...(baseLead || ({ id: leadId } as any)),
    callHistory: updatedLogs,
    gestCall: log.code
  };
}

export async function deleteCloudCallLog(
  leadOrId: LeadData | string,
  logId: string,
  currentLogs?: CallLogEntry[]
): Promise<LeadData> {
  const leadId = typeof leadOrId === 'string' ? leadOrId : leadOrId.id;
  const baseLead = typeof leadOrId === 'object' && leadOrId !== null ? leadOrId : null;
  const existingLogs = Array.isArray(baseLead?.callHistory) ? baseLead!.callHistory : (currentLogs || []);
  const updated = existingLogs.filter((l) => l.id !== logId);
  const newGest = updated.length > 0 ? updated[0].code : '';

  const docRef = fsDoc(firestoreDb, LEADS_COLLECTION, leadId);
  await fsSetDoc(
    docRef,
    {
      callHistory: updated,
      gestCall: newGest,
      updatedAt: fsServerTimestamp()
    },
    { merge: true }
  );

  return {
    ...(baseLead || ({ id: leadId } as any)),
    callHistory: updated,
    gestCall: newGest
  };
}

export async function clearCloudNCLogs(
  leadOrId: LeadData | string,
  currentLogs?: CallLogEntry[]
): Promise<LeadData> {
  const leadId = typeof leadOrId === 'string' ? leadOrId : leadOrId.id;
  const baseLead = typeof leadOrId === 'object' && leadOrId !== null ? leadOrId : null;
  const existingLogs = Array.isArray(baseLead?.callHistory) ? baseLead!.callHistory : (currentLogs || []);
  const filtered = existingLogs.filter((l) => l.code !== 'NC');
  const newGest = filtered.length > 0 ? filtered[0].code : '';

  const docRef = fsDoc(firestoreDb, LEADS_COLLECTION, leadId);
  await fsSetDoc(
    docRef,
    {
      callHistory: filtered,
      gestCall: newGest,
      updatedAt: fsServerTimestamp()
    },
    { merge: true }
  );

  return {
    ...(baseLead || ({ id: leadId } as any)),
    callHistory: filtered,
    gestCall: newGest
  };
}

export async function deleteCloudLead(leadId: string): Promise<void> {
  const docRef = fsDoc(firestoreDb, LEADS_COLLECTION, leadId);
  await fsDeleteDoc(docRef);
}
