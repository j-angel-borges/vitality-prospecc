/**
 * Servicio para sincronizar y consultar Google People API (Contactos)
 */

export interface GoogleContact {
  resourceName: string;
  name: string;
  phoneRaw: string;
  phoneNormalized: string; // últimos 9 dígitos
}

const LS_CONTACTS_CACHE = 'vitality_google_contacts_cache_v1';
const LS_CONTACTS_TIMESTAMP = 'vitality_google_contacts_timestamp_v1';

/**
 * Normaliza cualquier formato de teléfono a los últimos 9 dígitos
 * Ejemplos:
 * '+51 981 290 633' -> '981290633'
 * '51981290633'     -> '981290633'
 * '981290633'       -> '981290633'
 */
export function normalizePhone(phone?: string | null): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 8) {
    return `9${digits}`;
  }
  if (digits.length >= 9) {
    return digits.slice(-9);
  }
  return digits;
}

/**
 * Obtener contactos cacheados en localStorage
 */
export function getCachedContacts(): GoogleContact[] {
  try {
    const raw = localStorage.getItem(LS_CONTACTS_CACHE);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return [];
}

/**
 * Guardar contactos en caché
 */
export function setCachedContacts(contacts: GoogleContact[]) {
  try {
    localStorage.setItem(LS_CONTACTS_CACHE, JSON.stringify(contacts));
    localStorage.setItem(LS_CONTACTS_TIMESTAMP, String(Date.now()));
  } catch {}
}

/**
 * Consultar contactos desde Google People API con el access token de OAuth
 */
export async function fetchGoogleContacts(accessToken: string): Promise<GoogleContact[]> {
  const contacts: GoogleContact[] = [];
  let pageToken: string | undefined = undefined;

  try {
    do {
      const url = new URL('https://people.googleapis.com/v1/people/me/connections');
      url.searchParams.set('personFields', 'names,phoneNumbers');
      url.searchParams.set('pageSize', '1000');
      if (pageToken) {
        url.searchParams.set('pageToken', pageToken);
      }

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json'
        }
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Google People API HTTP error:', res.status, errorText);
        throw new Error(`Google People API (${res.status}): ${errorText}`);
      }

      const data = await res.json();
      const connections = data.connections || [];

      for (const person of connections) {
        const name = person.names?.[0]?.displayName || 'Sin Nombre';
        const phones = person.phoneNumbers || [];
        for (const p of phones) {
          const raw = p.value || '';
          const norm = normalizePhone(raw);
          if (norm && norm.length >= 7) {
            contacts.push({
              resourceName: person.resourceName || '',
              name,
              phoneRaw: raw,
              phoneNormalized: norm
            });
          }
        }
      }

      pageToken = data.nextPageToken;
    } while (pageToken);

    setCachedContacts(contacts);
    return contacts;
  } catch (err: any) {
    console.error('Error fetching google contacts:', err);
    throw err;
  }
}

/**
 * Crea un mapa indexado de contactos por los últimos 9 dígitos para O(1) lookups
 */
export function createContactsMap(contacts: GoogleContact[]): Map<string, GoogleContact> {
  const map = new Map<string, GoogleContact>();
  for (const c of contacts) {
    if (c.phoneNormalized) {
      map.set(c.phoneNormalized, c);
    }
  }
  return map;
}

/**
 * Genera y descarga un CSV compatible con Google Contacts para importación directa
 */
export function exportLeadsToGoogleContactsCsv(leads: Array<{ nombreMadre: string; celular: string; distrito?: string; sheetTab?: string }>, filename = 'contactos_vitality_rp.csv') {
  if (leads.length === 0) return;

  // Cabeceras oficiales estándar reconocidas por Google Contacts
  const headers = ['Name', 'Given Name', 'Family Name', 'Phone 1 - Type', 'Phone 1 - Value', 'Organization 1 - Name', 'Notes'];
  
  const rows = leads.map(l => {
    const rawName = (l.nombreMadre || 'Contacto Vitality').trim();
    const cleanPhone = (l.celular || '').replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.length === 9 ? `+51 ${cleanPhone}` : cleanPhone;
    
    // Nombres
    const parts = rawName.split(/\s+/);
    const givenName = parts[0] || '';
    const familyName = parts.slice(1).join(' ') || '';
    const notes = `Pestaña: ${l.sheetTab || ''} | Distrito: ${l.distrito || ''} | Generado por Vitality CRM`;

    return [
      `"${rawName.replace(/"/g, '""')}"`,
      `"${givenName.replace(/"/g, '""')}"`,
      `"${familyName.replace(/"/g, '""')}"`,
      `"Mobile"`,
      `"${phoneWithCountry}"`,
      `"Royal Prestige - Vitality"`,
      `"${notes.replace(/"/g, '""')}"`
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
