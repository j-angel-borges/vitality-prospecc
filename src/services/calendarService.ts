/**
 * Servicio para sincronización bidireccional con Google Calendar API v3
 */

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  htmlLink?: string;
  leadId?: string;
  colorId?: string;
}

const LS_CALENDAR_CACHE = 'vitality_google_calendar_cache_v1';

export function getCachedCalendarEvents(): GoogleCalendarEvent[] {
  try {
    const raw = localStorage.getItem(LS_CALENDAR_CACHE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setCachedCalendarEvents(events: GoogleCalendarEvent[]): void {
  try {
    localStorage.setItem(LS_CALENDAR_CACHE, JSON.stringify(events));
  } catch {}
}

/**
 * Obtener eventos del calendario primario del usuario autenticado
 */
export async function fetchCalendarEvents(
  accessToken: string,
  timeMin?: string,
  timeMax?: string
): Promise<GoogleCalendarEvent[]> {
  try {
    const min = timeMin || new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
    const max = timeMax || new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString();

    const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
    url.searchParams.set('timeMin', min);
    url.searchParams.set('timeMax', max);
    url.searchParams.set('singleEvents', 'true');
    url.searchParams.set('orderBy', 'startTime');
    url.searchParams.set('maxResults', '250');

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn('Google Calendar API fetch error:', res.status, errText);
      if (res.status === 401) {
        throw new Error('401: Credenciales de Google inválidas o expiradas. Por favor reconecta tu cuenta.');
      }
      if (res.status === 403) {
        throw new Error('403: Permisos insuficientes de Google Calendar. Por favor acepta los permisos solicitados.');
      }
      throw new Error(`Google Calendar API (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const items = data.items || [];

    const mapped: GoogleCalendarEvent[] = items
      .filter((it: any) => it.start && (it.start.dateTime || it.start.date))
      .map((it: any) => {
        const startIso = it.start.dateTime || `${it.start.date}T09:00:00`;
        const endIso = it.end?.dateTime || it.end?.date ? (it.end.dateTime || `${it.end.date}T10:00:00`) : new Date(new Date(startIso).getTime() + 3600000).toISOString();
        return {
          id: it.id,
          summary: it.summary || 'Demo / Llamada Vitality',
          description: it.description || '',
          location: it.location || '',
          start: { dateTime: startIso, timeZone: it.start.timeZone },
          end: { dateTime: endIso, timeZone: it.end.timeZone },
          htmlLink: it.htmlLink,
          colorId: it.colorId
        };
      });

    setCachedCalendarEvents(mapped);
    return mapped;
  } catch (err: any) {
    console.error('Error in fetchCalendarEvents:', err);
    throw err;
  }
}

/**
 * Crear un nuevo evento en Google Calendar
 */
export async function createCalendarEvent(
  accessToken: string,
  event: {
    summary: string;
    description?: string;
    location?: string;
    startIso: string;
    endIso: string;
  }
): Promise<GoogleCalendarEvent> {
  const url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
  const body = {
    summary: event.summary,
    description: event.description || '',
    location: event.location || '',
    start: {
      dateTime: event.startIso
    },
    end: {
      dateTime: event.endIso
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('Error creating Google Calendar event:', res.status, errText);
    throw new Error(`Google Calendar API Create (${res.status}): ${errText}`);
  }

  const created = await res.json();
  return {
    id: created.id,
    summary: created.summary,
    description: created.description,
    location: created.location,
    start: { dateTime: created.start.dateTime || created.start.date },
    end: { dateTime: created.end.dateTime || created.end.date },
    htmlLink: created.htmlLink
  };
}

/**
 * Actualizar las horas (arrastrar, expandir, reducir) o datos de un evento existente en Google Calendar
 */
export async function updateCalendarEvent(
  accessToken: string,
  eventId: string,
  updates: {
    summary?: string;
    description?: string;
    location?: string;
    startIso?: string;
    endIso?: string;
  }
): Promise<GoogleCalendarEvent> {
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`;
  
  const patchBody: any = {};
  if (updates.summary !== undefined) patchBody.summary = updates.summary;
  if (updates.description !== undefined) patchBody.description = updates.description;
  if (updates.location !== undefined) patchBody.location = updates.location;
  if (updates.startIso !== undefined) patchBody.start = { dateTime: updates.startIso };
  if (updates.endIso !== undefined) patchBody.end = { dateTime: updates.endIso };

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(patchBody)
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('Error patching Google Calendar event:', res.status, errText);
    throw new Error(`Google Calendar API Update (${res.status}): ${errText}`);
  }

  const updated = await res.json();
  return {
    id: updated.id,
    summary: updated.summary,
    description: updated.description,
    location: updated.location,
    start: { dateTime: updated.start.dateTime || updated.start.date },
    end: { dateTime: updated.end.dateTime || updated.end.date },
    htmlLink: updated.htmlLink
  };
}

/**
 * Eliminar un evento en Google Calendar
 */
export async function deleteCalendarEvent(accessToken: string, eventId: string): Promise<void> {
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok && res.status !== 404 && res.status !== 410) {
    const errText = await res.text();
    console.error('Error deleting Google Calendar event:', res.status, errText);
    throw new Error(`Google Calendar API Delete (${res.status}): ${errText}`);
  }
}
