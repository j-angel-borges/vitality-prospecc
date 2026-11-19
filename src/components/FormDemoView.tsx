'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/firebase/firebaseClient';
import { CrmUserProfile, getUserProfile, getAllCrmUsers, getStoredAccessToken } from '@/services/authService';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const FormDemoView: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<CrmUserProfile | null>(null);
  const [crmUsers, setCrmUsers] = useState<CrmUserProfile[]>([]);

  // Form Fields
  const [tipoCita, setTipoCita] = useState<'demo' | 'socio'>('demo');
  const [asesor, setAsesor] = useState<string>('');
  const [cliente, setCliente] = useState<string>('');
  const [celular, setCelular] = useState<string>('');
  const [direccion, setDireccion] = useState<string>('');
  const [fecha, setFecha] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [hora, setHora] = useState<string>('16:00');
  const [observaciones, setObservaciones] = useState<string>('');

  // States
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [agendadoExitoso, setAgendadoExitoso] = useState<boolean>(false);
  const [copiedMsg, setCopiedMsg] = useState<boolean>(false);

  // Load auth & users
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setCurrentUser(u);
      if (u) {
        const p = await getUserProfile(u.uid, u.email);
        setUserProfile(p);
        if (p?.assignedRepName) {
          setAsesor(p.assignedRepName);
        } else if (p?.displayName) {
          setAsesor(p.displayName);
        }
      }
    });

    getAllCrmUsers().then(users => setCrmUsers(users));
    return () => unsub();
  }, []);

  // Duration in hours/minutes
  const duracionTexto = tipoCita === 'demo' ? '2 horas y media' : '30 minutos';
  const duracionMinutos = tipoCita === 'demo' ? 150 : 30;

  // Sound generator using Web Audio API
  const playBellSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Dual tone bell chime (A5 + E6)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, ctx.currentTime); // 880 Hz
      osc1.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1320, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(2640, ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.8);
      osc2.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.warn('Audio no soportado o bloqueado:', e);
    }
  };

  // Build WhatsApp text formatted exactly like screenshot examples
  const buildWhatsAppMessage = () => {
    const fechaObj = new Date(`${fecha}T${hora || '12:00'}`);
    const fechaFormat = !isNaN(fechaObj.getTime())
      ? fechaObj.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })
      : fecha;

    if (tipoCita === 'demo') {
      return `Ejecutivo: ${asesor || 'Asesor Vitality'}\nCliente: ${cliente || 'Sin especificar'}\nDireccion: ${direccion || 'A coordinar'}\nFecha: ${fechaFormat}\nHora: ${hora}\nDuración: 2h 30m\nObservaciones: ${observaciones || 'Cita confirmada'}`;
    } else {
      return `${asesor || 'Asesor Vitality'}\nSocio: ${cliente || 'Sin especificar'}\nDireccion: ${direccion || 'A coordinar'}\nFecha: ${fechaFormat}\nHora: ${hora}\nDuración: 30 min\nObservaciones: ${observaciones || 'Reunión de oportunidad'}`;
    }
  };

  // Copy to clipboard & sound
  const handleBellClick = () => {
    playBellSound();
    const msg = buildWhatsAppMessage();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(msg);
      setCopiedMsg(true);
      setTimeout(() => setCopiedMsg(false), 3000);
    }
  };

  // Submit appointment
  const handleAgendar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente.trim()) {
      alert('Por favor ingresa el nombre del Cliente o Socio.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Guardar en Firestore colección 'citas_agenda'
      const startDateTime = new Date(`${fecha}T${hora}`);
      const endDateTime = new Date(startDateTime.getTime() + duracionMinutos * 60 * 1000);

      await addDoc(collection(db, 'citas_agenda'), {
        tipoCita,
        asesor: asesor || userProfile?.displayName || 'Asesor Vitality',
        asesorEmail: currentUser?.email || '',
        cliente: cliente.trim(),
        celular: celular.trim(),
        direccion: direccion.trim(),
        fecha,
        hora,
        duracionMinutos,
        startIso: startDateTime.toISOString(),
        endIso: endDateTime.toISOString(),
        observaciones: observaciones.trim(),
        createdAt: serverTimestamp()
      });

      // 2. Intentar registrar en Google Calendar si hay token disponible
      const token = getStoredAccessToken();
      if (token) {
        try {
          const calendarEvent = {
            summary: tipoCita === 'demo' ? `🍳 Demo: ${cliente} (${asesor})` : `🤝 Socio: ${cliente} (${asesor})`,
            location: direccion,
            description: `Tipo: ${tipoCita.toUpperCase()}\nAsesor: ${asesor}\nCliente: ${cliente}\nCelular: ${celular}\nObservaciones: ${observaciones}`,
            start: { dateTime: startDateTime.toISOString() },
            end: { dateTime: endDateTime.toISOString() },
            attendees: [
              ...(currentUser?.email ? [{ email: currentUser.email }] : []),
              { email: 'jangelborges@gmail.com' }
            ]
          };

          await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(calendarEvent)
          });
        } catch (calErr) {
          console.warn('Advertencia agendando en Google Calendar:', calErr);
        }
      }

      setAgendadoExitoso(true);
      playBellSound();
    } catch (err) {
      console.error('Error al agendar cita:', err);
      alert('Error guardando la cita en la base de datos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
            title="Volver al Hub"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </Link>
          <div className="flex items-center gap-2.5">
            <img src="/vitality_symbol.png" alt="Vitality" className="w-7 h-7 object-contain" />
            <div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                Gestión de Citas (FormDemo)
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                  Vitality ERP
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Agendamiento de demostraciones y socios con cálculo de duración y sincronización
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/crm"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-900/40 text-blue-300 hover:bg-blue-900/60 border border-blue-500/30 transition-all flex items-center gap-1.5"
          >
            <span>Ir al CRM</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Form Header */}
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              Registrar Nueva Cita de Llamada
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Rellena los datos de la cita concertada. Las Demos se marcarán por 2h 30m y los Socios por 30m.
            </p>
          </div>

          <form onSubmit={handleAgendar} className="space-y-5">
            {/* Tipo de Cita Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Tipo de Cita
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTipoCita('demo')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    tipoCita === 'demo'
                      ? 'border-blue-500 bg-blue-600/15 ring-2 ring-blue-500/30 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-blue-400">Demostración (Demo)</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                      2h 30m
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Cita culinaria completa con degustación y presentación de productos.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setTipoCita('socio')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    tipoCita === 'socio'
                      ? 'border-amber-500 bg-amber-600/15 ring-2 ring-amber-500/30 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-amber-400">Reunión de Socio</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                      30 min
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Entrevista de oportunidad, plan de compensación o incorporación.
                  </p>
                </button>
              </div>
            </div>

            {/* Asesor y Cliente */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Asesor / Ejecutivo
                </label>
                <select
                  value={asesor}
                  onChange={(e) => setAsesor(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Ricfel Olaizola">Ricfel Olaizola (SuperAdmin)</option>
                  <option value="Jose Angel Borges">José Angel Borges (SuperAdmin)</option>
                  {crmUsers
                    .filter(u => u.displayName && !['Ricfel Olaizola', 'José Angel Borges'].includes(u.displayName))
                    .map(u => (
                      <option key={u.uid} value={u.displayName}>
                        {u.displayName}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {tipoCita === 'demo' ? 'Nombre del Cliente' : 'Nombre del Socio'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Rocio Giraldo / Cezar Calderon"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Celular y Dirección */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Teléfono Celular / WhatsApp
                </label>
                <input
                  type="tel"
                  placeholder="Ej. 992963045"
                  value={celular}
                  onChange={(e) => setCelular(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Dirección y Referencia
                </label>
                <input
                  type="text"
                  placeholder="Ej. Jr Raymundo Carcamo 1000 Sta Catalina"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Fecha y Hora Integradas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Fecha de la Cita
                </label>
                <input
                  type="date"
                  required
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Hora de Inicio (Duración: {duracionTexto})
                </label>
                <input
                  type="time"
                  required
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Observaciones y Notas
              </label>
              <textarea
                rows={3}
                placeholder="Notas de la llamada, productos de interés, asistentes a la cita..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
              />
            </div>

            {/* Actions Bar */}
            <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-900/30 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>{isSubmitting ? 'Agendando...' : 'Agendar Cita en Calendario'}</span>
              </button>

              {/* Botón Campana Animada (Habilitado tras agendar o al tener datos) */}
              <button
                type="button"
                onClick={handleBellClick}
                className={`py-3 px-5 rounded-xl border font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  agendadoExitoso
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-lg shadow-amber-500/20 animate-pulse'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
                title="Hacer clic para sonar campana y copiar formato para WhatsApp"
              >
                {/* Campana SVG */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={agendadoExitoso ? 'animate-bounce' : ''}
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <span>{copiedMsg ? '¡Copiado para WhatsApp!' : 'Copiar Formato (Campana)'}</span>
              </button>
            </div>
          </form>

          {/* Success Box */}
          {agendadoExitoso && (
            <div className="mt-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                  ✓
                </div>
                <div>
                  <p className="font-bold text-emerald-300">¡Cita agendada exitosamente!</p>
                  <p className="text-emerald-400/80 mt-0.5">
                    Registrada en Firestore y lista para sincronizarse en Google Calendar.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleBellClick}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
              >
                Copiar WhatsApp
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
