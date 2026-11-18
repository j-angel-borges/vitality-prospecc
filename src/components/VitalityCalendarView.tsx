'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  GoogleCalendarEvent,
  fetchCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  getCachedCalendarEvents
} from '@/services/calendarService';
import { getStoredAccessToken } from '@/services/authService';
import { LeadData } from '@/data/leadTypes';

interface VitalityCalendarViewProps {
  leads: LeadData[];
  isDark?: boolean;
  onConnectGoogle?: () => void;
  currentUserEmail?: string;
}

const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7:00 AM a 9:00 PM
const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const VitalityCalendarView: React.FC<VitalityCalendarViewProps> = ({
  leads,
  isDark = false,
  onConnectGoogle,
  currentUserEmail
}) => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Empezar en Lunes
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const [events, setEvents] = useState<GoogleCalendarEvent[]>(() => getCachedCalendarEvents());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estados para creación rápida de evento (Modal)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [createDate, setCreateDate] = useState<string>('');
  const [createStartTime, setCreateStartTime] = useState<string>('10:00');
  const [createEndTime, setCreateEndTime] = useState<string>('11:00');
  const [createTitle, setCreateTitle] = useState<string>('');
  const [createDesc, setCreateDesc] = useState<string>('');
  const [createLocation, setCreateLocation] = useState<string>('');
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Estados para interacción Drag & Drop / Resize
  const [draggedEvent, setDraggedEvent] = useState<{
    event: GoogleCalendarEvent;
    type: 'move' | 'resize-bottom';
    initialY: number;
    initialStartMinutes: number;
    initialDurationMinutes: number;
    currentDayIndex: number;
  } | null>(null);

  const gridRef = useRef<HTMLDivElement | null>(null);

  // Calcular los 7 días de la semana visible
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [currentWeekStart]);

    const isAuthenticatingRef = useRef<boolean>(false);

  const loadEvents = async (silent = false) => {
    const token = getStoredAccessToken();
    if (!token) {
      if (onConnectGoogle && !isAuthenticatingRef.current) {
        // Disparar reconexión si no hay token
        isAuthenticatingRef.current = true;
        try {
          await onConnectGoogle();
        } finally {
          isAuthenticatingRef.current = false;
        }
      }
      return;
    }

    if (!silent) setIsLoading(true);
    setErrorMessage(null);
    try {
      const minIso = new Date(weekDays[0].getTime() - 24 * 3600 * 1000).toISOString();
      const maxIso = new Date(weekDays[6].getTime() + 48 * 3600 * 1000).toISOString();
      const fetched = await fetchCalendarEvents(token, minIso, maxIso);
      setEvents(fetched);
    } catch (err: any) {
      console.warn('Error loading calendar events:', err);
      const isAuthError = err?.message?.includes('401') || err?.message?.includes('UNAUTHENTICATED') || err?.message?.includes('Invalid Credentials') || err?.message?.includes('403');
      if (isAuthError) {
        // Token de Google expirado o sin permisos de Calendar: limpiar de storage
        try {
          localStorage.removeItem('vitality_google_access_token_v2');
          localStorage.removeItem('vitality_google_access_token_v1');
        } catch {}

        if (onConnectGoogle && !silent && !isAuthenticatingRef.current) {
          isAuthenticatingRef.current = true;
          setErrorMessage('Tu sesión de Google Calendar expiró. Haz clic en "Conectar Google Calendar" para renovarla.');
        } else if (!silent) {
          setErrorMessage('Sesión de Google expirada. Por favor vuelve a iniciar sesión con Google.');
        }
      } else if (!silent) {
        setErrorMessage(err?.message || 'No se pudo conectar con Google Calendar.');
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [currentWeekStart]);

  useEffect(() => {
    const handleTokenUpdated = () => {
      console.log('[CalendarView] Token actualizado, recargando eventos...');
      setErrorMessage(null);
      loadEvents();
    };
    window.addEventListener('vitality_google_token_updated', handleTokenUpdated);
    return () => window.removeEventListener('vitality_google_token_updated', handleTokenUpdated);
  }, [currentWeekStart]);

  const handlePrevWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
  };

  const handleToday = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    setCurrentWeekStart(monday);
  };

  // Abrir modal de creación al hacer clic en una celda horaria
  const handleCellClick = (day: Date, hour: number) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`;
    setCreateDate(dateStr);
    setCreateStartTime(`${pad(hour)}:00`);
    setCreateEndTime(`${pad(hour + 1)}:00`);
    setCreateTitle('Demo Royal Prestige');
    setCreateDesc('Demostración de cocina y salud Vitality');
    setSelectedLeadId('');
    setIsCreateModalOpen(true);
  };

  const handleSaveNewEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getStoredAccessToken();
    if (!token) {
      alert('Debes conectar tu cuenta de Google.');
      return;
    }

    if (!createTitle || !createDate || !createStartTime || !createEndTime) return;

    setIsSubmitting(true);
    try {
      const startIso = new Date(`${createDate}T${createStartTime}:00`).toISOString();
      const endIso = new Date(`${createDate}T${createEndTime}:00`).toISOString();

      let finalDesc = createDesc;
      if (selectedLeadId) {
        const lead = leads.find((l) => l.id === selectedLeadId);
        if (lead) {
          finalDesc += `\n\nLead Asociado:\nNombre: ${lead.nombreMadre}\nTeléfono: ${lead.celular}\nDistrito: ${lead.distrito}`;
        }
      }

      const created = await createCalendarEvent(token, {
        summary: createTitle,
        description: finalDesc,
        location: createLocation,
        startIso,
        endIso
      });

      setEvents((prev) => [...prev, created]);
      setIsCreateModalOpen(false);
    } catch (err: any) {
      alert(`Error creando evento en Google Calendar: ${err?.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('¿Deseas eliminar este evento de Google Calendar?')) return;
    const token = getStoredAccessToken();
    if (!token) return;

    try {
      setEvents((prev) => prev.filter((ev) => ev.id !== eventId));
      await deleteCalendarEvent(token, eventId);
    } catch (err: any) {
      alert(`Error eliminando evento: ${err?.message}`);
      loadEvents(true);
    }
  };

  // ── Drag and Drop / Resize Logic ──────────────────────────────────────────
  const handleMouseDownMove = (
    e: React.MouseEvent,
    event: GoogleCalendarEvent,
    dayIndex: number
  ) => {
    e.stopPropagation();
    const startDate = new Date(event.start.dateTime);
    const endDate = new Date(event.end.dateTime);
    const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
    const durationMinutes = Math.max(30, (endDate.getTime() - startDate.getTime()) / 60000);

    setDraggedEvent({
      event,
      type: 'move',
      initialY: e.clientY,
      initialStartMinutes: startMinutes,
      initialDurationMinutes: durationMinutes,
      currentDayIndex: dayIndex
    });
  };

  const handleMouseDownResize = (
    e: React.MouseEvent,
    event: GoogleCalendarEvent,
    dayIndex: number
  ) => {
    e.stopPropagation();
    const startDate = new Date(event.start.dateTime);
    const endDate = new Date(event.end.dateTime);
    const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
    const durationMinutes = Math.max(30, (endDate.getTime() - startDate.getTime()) / 60000);

    setDraggedEvent({
      event,
      type: 'resize-bottom',
      initialY: e.clientY,
      initialStartMinutes: startMinutes,
      initialDurationMinutes: durationMinutes,
      currentDayIndex: dayIndex
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedEvent) return;

    // Altura de 1 hora = 52px => 1 minuto = 52 / 60 = 0.866px
    const deltaY = e.clientY - draggedEvent.initialY;
    const deltaMinutes = Math.round(deltaY / (52 / 60) / 15) * 15; // Snap de 15 minutos

    if (draggedEvent.type === 'move') {
      const newStartMinutes = Math.max(7 * 60, Math.min(21 * 60, draggedEvent.initialStartMinutes + deltaMinutes));
      const targetDay = weekDays[draggedEvent.currentDayIndex];
      const newStart = new Date(targetDay);
      newStart.setHours(Math.floor(newStartMinutes / 60), newStartMinutes % 60, 0, 0);

      const newEnd = new Date(newStart.getTime() + draggedEvent.initialDurationMinutes * 60000);

      // Actualización optimista local
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === draggedEvent.event.id
            ? { ...ev, start: { dateTime: newStart.toISOString() }, end: { dateTime: newEnd.toISOString() } }
            : ev
        )
      );
    } else if (draggedEvent.type === 'resize-bottom') {
      const newDuration = Math.max(15, draggedEvent.initialDurationMinutes + deltaMinutes);
      const curStart = new Date(draggedEvent.event.start.dateTime);
      const newEnd = new Date(curStart.getTime() + newDuration * 60000);

      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === draggedEvent.event.id
            ? { ...ev, end: { dateTime: newEnd.toISOString() } }
            : ev
        )
      );
    }
  };

  const handleMouseUp = async () => {
    if (!draggedEvent) return;

    const token = getStoredAccessToken();
    const eventToPersist = events.find((ev) => ev.id === draggedEvent.event.id);

    setDraggedEvent(null);

    if (token && eventToPersist) {
      try {
        await updateCalendarEvent(token, eventToPersist.id, {
          startIso: eventToPersist.start.dateTime,
          endIso: eventToPersist.end.dateTime
        });
      } catch (err: any) {
        console.error('Error sincronizando cambio de horario con Google Calendar:', err);
        alert(`Error al actualizar Google Calendar: ${err?.message}`);
        loadEvents(true);
      }
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        background: isDark ? '#0B0F19' : '#F8FAFC',
        color: isDark ? '#F1F5F9' : '#0F172A',
        overflow: 'hidden',
        userSelect: draggedEvent ? 'none' : 'auto'
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* ── BARRA SUPERIOR DEL CALENDARIO ──────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 18px',
          background: isDark ? '#111827' : '#FFFFFF',
          borderBottom: isDark ? '1px solid #1E293B' : '1px solid #E2E8F0',
          gap: '12px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={handleToday}
            style={{
              background: isDark ? '#1E293B' : '#F1F5F9',
              color: isDark ? '#F8FAFC' : '#1E293B',
              border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Hoy
          </button>
          <div style={{ display: 'flex', gap: '3px' }}>
            <button
              type="button"
              onClick={handlePrevWeek}
              style={{
                background: isDark ? '#1E293B' : '#F1F5F9',
                border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                color: isDark ? '#E2E8F0' : '#475569',
                borderRadius: '6px',
                padding: '5px 10px',
                cursor: 'pointer',
                fontWeight: 700
              }}
              title="Semana anterior"
            >
              &#9664;
            </button>
            <button
              type="button"
              onClick={handleNextWeek}
              style={{
                background: isDark ? '#1E293B' : '#F1F5F9',
                border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                color: isDark ? '#E2E8F0' : '#475569',
                borderRadius: '6px',
                padding: '5px 10px',
                cursor: 'pointer',
                fontWeight: 700
              }}
              title="Semana siguiente"
            >
              &#9654;
            </button>
          </div>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: isDark ? '#60A5FA' : '#004D99' }}>
            {MONTHS_ES[weekDays[0].getMonth()]} {weekDays[0].getFullYear()}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => {
              const token = getStoredAccessToken();
              if (!token && onConnectGoogle) {
                onConnectGoogle();
              } else {
                loadEvents();
              }
            }}
            disabled={isLoading}
            style={{
              background: isDark ? '#1E293B' : '#FFFFFF',
              color: isDark ? '#60A5FA' : '#004D99',
              border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Sincronizar Google Calendar"
          >
            <span style={{ display: 'inline-flex', animation: isLoading ? 'spin 1s linear infinite' : 'none' }}>
              🔄
            </span>
            <span>{isLoading ? 'Sincronizando...' : 'Recargar Calendar'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const now = new Date();
              handleCellClick(now, now.getHours() >= 7 && now.getHours() <= 20 ? now.getHours() : 10);
            }}
            style={{
              background: '#004D99',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0, 77, 153, 0.25)'
            }}
          >
            + Agendar Cita
          </button>
        </div>
      </div>

      {errorMessage && (
        <div
          style={{
            background: isDark ? '#7F1D1D' : '#FEE2E2',
            color: isDark ? '#FCA5A5' : '#991B1B',
            padding: '10px 16px',
            fontSize: '0.8rem',
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            borderBottom: isDark ? '1px solid #991B1B' : '1px solid #FECACA'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span>⚠️</span>
            <span>{errorMessage}</span>
            {onConnectGoogle && (errorMessage.includes('expir') || errorMessage.includes('401') || errorMessage.includes('Conectar')) && (
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  onConnectGoogle();
                }}
                style={{
                  background: '#004D99',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0, 77, 153, 0.3)'
                }}
              >
                Conectar Google Calendar
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 800, color: 'inherit', fontSize: '1rem' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ── GRILLA DE SEMANA TIPO GOOGLE CALENDAR ───────────────────────────── */}
      <div
        ref={gridRef}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          position: 'relative'
        }}
      >
        {/* Cabecera de los 7 Días */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '60px repeat(7, 1fr)',
            background: isDark ? '#111827' : '#FFFFFF',
            borderBottom: isDark ? '2px solid #1E293B' : '2px solid #E2E8F0',
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}
        >
          <div style={{ padding: '8px', borderRight: isDark ? '1px solid #1E293B' : '1px solid #E2E8F0' }} />
          {weekDays.map((d, idx) => {
            const isToday = d.toDateString() === new Date().toDateString();
            return (
              <div
                key={idx}
                style={{
                  textAlign: 'center',
                  padding: '8px 4px',
                  borderRight: idx < 6 ? (isDark ? '1px solid #1E293B' : '1px solid #E2E8F0') : 'none',
                  background: isToday ? (isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF') : 'transparent'
                }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: isDark ? '#94A3B8' : '#64748B' }}>
                  {DAYS_ES[d.getDay()]}
                </div>
                <div
                  style={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    marginTop: '2px',
                    color: isToday ? (isDark ? '#60A5FA' : '#004D99') : 'inherit'
                  }}
                >
                  {d.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Filas Horarias (7:00 a 21:00) */}
        <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', position: 'relative' }}>
          {/* Columna de Horas */}
          <div style={{ borderRight: isDark ? '1px solid #1E293B' : '1px solid #E2E8F0' }}>
            {HOURS.map((h) => (
              <div
                key={h}
                style={{
                  height: '52px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: isDark ? '#64748B' : '#94A3B8',
                  textAlign: 'right',
                  paddingRight: '8px',
                  transform: 'translateY(-8px)',
                  boxSizing: 'border-box'
                }}
              >
                {h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`}
              </div>
            ))}
          </div>

          {/* 7 Columnas de Días */}
          {weekDays.map((day, dayIndex) => {
            const isToday = day.toDateString() === new Date().toDateString();

            // Filtrar eventos que caen en este día
            const dayEvents = events.filter((ev) => {
              const evDate = new Date(ev.start.dateTime);
              return evDate.toDateString() === day.toDateString();
            });

            return (
              <div
                key={dayIndex}
                style={{
                  position: 'relative',
                  borderRight: dayIndex < 6 ? (isDark ? '1px solid #1E293B' : '1px solid #E2E8F0') : 'none',
                  background: isToday ? (isDark ? 'rgba(59, 130, 246, 0.04)' : '#F9FBFE') : 'transparent'
                }}
              >
                {/* Líneas Horarias */}
                {HOURS.map((h) => (
                  <div
                    key={h}
                    onClick={() => handleCellClick(day, h)}
                    style={{
                      height: '52px',
                      borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #F1F5F9',
                      cursor: 'pointer'
                    }}
                  />
                ))}

                {/* Bloques de Eventos Superpuestos */}
                {dayEvents.map((ev) => {
                  const evStart = new Date(ev.start.dateTime);
                  const evEnd = new Date(ev.end.dateTime);

                  const startMin = evStart.getHours() * 60 + evStart.getMinutes();
                  const endMin = evEnd.getHours() * 60 + evEnd.getMinutes();
                  const durationMin = Math.max(20, endMin - startMin);

                  // 7:00 AM es el pixel 0
                  const topPx = Math.max(0, ((startMin - 7 * 60) * 52) / 60);
                  const heightPx = Math.max(24, (durationMin * 52) / 60);

                  const isBeingMoved = draggedEvent?.event.id === ev.id && draggedEvent.type === 'move';

                  return (
                    <div
                      key={ev.id}
                      onMouseDown={(e) => handleMouseDownMove(e, ev, dayIndex)}
                      style={{
                        position: 'absolute',
                        top: `${topPx}px`,
                        left: '4px',
                        right: '4px',
                        height: `${heightPx}px`,
                        background: isDark ? 'linear-gradient(135deg, #1E3A8A, #2563EB)' : 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
                        borderLeft: '4px solid #2563EB',
                        border: isDark ? '1px solid #3B82F6' : '1px solid #93C5FD',
                        borderLeftWidth: '4px',
                        borderRadius: '6px',
                        padding: '4px 6px',
                        cursor: 'grab',
                        zIndex: isBeingMoved ? 50 : 5,
                        boxShadow: isBeingMoved ? '0 10px 20px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.08)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transition: isBeingMoved ? 'none' : 'box-shadow 0.15s ease'
                      }}
                      title={`${ev.summary}\n${evStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${evEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\nArrastra para mover | Tira del borde inferior para ampliar/reducir`}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            color: isDark ? '#FFFFFF' : '#1E3A8A',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {ev.summary}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: isDark ? '#93C5FD' : '#3B82F6', fontWeight: 600 }}>
                          {evStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {evEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      {/* Botón eliminar pequeño */}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteEvent(ev.id, e)}
                        style={{
                          position: 'absolute',
                          top: '2px',
                          right: '2px',
                          background: 'transparent',
                          border: 'none',
                          color: isDark ? '#FCA5A5' : '#EF4444',
                          cursor: 'pointer',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '2px'
                        }}
                        title="Eliminar evento"
                      >
                        ✕
                      </button>

                      {/* Manija de Redimensionamiento (Resize Handle abajo) */}
                      <div
                        onMouseDown={(e) => handleMouseDownResize(e, ev, dayIndex)}
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '8px',
                          cursor: 'ns-resize',
                          background: 'rgba(37, 99, 235, 0.2)'
                        }}
                        title="Arrastra para cambiar duración"
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MODAL AGENDAR EVENTO CON LEAD ASOCIADO ─────────────────────────── */}
      {isCreateModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            style={{
              background: isDark ? '#111827' : '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              border: isDark ? '1px solid #334155' : '1px solid #E2E8F0'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: isDark ? '#F8FAFC' : '#0F172A' }}>
                📅 Agendar en Google Calendar
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#94A3B8' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewEvent} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: isDark ? '#CBD5E1' : '#475569' }}>
                  Título de la Cita / Demo:
                </label>
                <input
                  type="text"
                  required
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                    background: isDark ? '#1E293B' : '#FFFFFF',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              {/* Vincular con un Lead existente */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: isDark ? '#CBD5E1' : '#475569' }}>
                  Vincular Lead del CRM (Opcional):
                </label>
                <select
                  value={selectedLeadId}
                  onChange={(e) => {
                    setSelectedLeadId(e.target.value);
                    const sel = leads.find((l) => l.id === e.target.value);
                    if (sel) {
                      setCreateTitle(`Demo: ${sel.nombreMadre}`);
                      setCreateLocation(sel.distrito || '');
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                    background: isDark ? '#1E293B' : '#FFFFFF',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                    fontSize: '0.85rem'
                  }}
                >
                  <option value="">-- Sin vincular lead --</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.nombreMadre} ({l.celular}) - {l.distrito || 'Sin distrito'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha y Horas */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: isDark ? '#CBD5E1' : '#475569' }}>
                    Fecha:
                  </label>
                  <input
                    type="date"
                    required
                    value={createDate}
                    onChange={(e) => setCreateDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '7px 8px',
                      borderRadius: '8px',
                      border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                      background: isDark ? '#1E293B' : '#FFFFFF',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      fontSize: '0.8rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: isDark ? '#CBD5E1' : '#475569' }}>
                    Inicio:
                  </label>
                  <input
                    type="time"
                    required
                    value={createStartTime}
                    onChange={(e) => setCreateStartTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '7px 8px',
                      borderRadius: '8px',
                      border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                      background: isDark ? '#1E293B' : '#FFFFFF',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      fontSize: '0.8rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: isDark ? '#CBD5E1' : '#475569' }}>
                    Fin:
                  </label>
                  <input
                    type="time"
                    required
                    value={createEndTime}
                    onChange={(e) => setCreateEndTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '7px 8px',
                      borderRadius: '8px',
                      border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                      background: isDark ? '#1E293B' : '#FFFFFF',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      fontSize: '0.8rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: isDark ? '#CBD5E1' : '#475569' }}>
                  Lugar / Dirección:
                </label>
                <input
                  type="text"
                  placeholder="Ej: Surco / Domicilio del prospecto"
                  value={createLocation}
                  onChange={(e) => setCreateLocation(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                    background: isDark ? '#1E293B' : '#FFFFFF',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  style={{
                    background: 'transparent',
                    border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                    color: isDark ? '#CBD5E1' : '#475569',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background: '#004D99',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 20px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {isSubmitting ? 'Guardando en Calendar...' : 'Confirmar y Agendar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
