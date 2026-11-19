'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/firebase/firebaseClient';
import { CrmUserProfile, getAllCrmUsers, getStoredAccessToken } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import { LoginGatekeeperModal } from '@/components/LoginGatekeeperModal';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { FloatingHubHomeButton } from '@/components/FloatingHubHomeButton';

export const FormDemoView: React.FC = () => {
  const { currentUser, userProfile, isAuthLoading, loginWithGoogle } = useAuth();
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

  // Sincronizar asesor activo con perfil de Auth
  useEffect(() => {
    if (userProfile) {
      if (userProfile.assignedRepName) {
        setAsesor(userProfile.assignedRepName);
      } else if (userProfile.displayName) {
        setAsesor(userProfile.displayName);
      }
    }
  }, [userProfile]);

  useEffect(() => {
    getAllCrmUsers().then(users => setCrmUsers(users));
  }, []);

  // Duration in hours/minutes
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
      setTimeout(() => setCopiedMsg(false), 2500);
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
    <div className="min-h-[100dvh] w-full bg-[#F8FAFC] text-slate-800 flex flex-col overflow-x-hidden">
      {/* Top Bar with Safe-Area Clearance for iOS & Android (Light Header) */}
      <header className="border-b border-slate-200/90 bg-white/80 backdrop-blur-md px-4 sm:px-6 py-3.5 sm:py-4 pt-[max(0.75rem,env(safe-area-inset-top))] pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <Link
            href="/"
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors shrink-0 active:scale-95"
            title="Volver al Hub"
            aria-label="Volver al Hub"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </Link>
          <div className="flex items-center gap-2 min-w-0">
            <img src="/vitality_symbol.png" alt="Vitality" className="w-6 h-6 sm:w-7 sm:h-7 object-contain shrink-0" />
            <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-[#002244] truncate">
              Gestión de Citas
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/crm"
            className="w-9 h-9 rounded-xl bg-blue-50 text-[#004D99] hover:bg-blue-100 border border-blue-200/80 transition-all flex items-center justify-center active:scale-95"
            title="Ir al CRM"
            aria-label="Ir al CRM"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M3 9h18M9 21V9"/>
            </svg>
          </Link>
        </div>
      </header>

      {/* Main Content Area (Clean White Card with Mobile Calibration) */}
      <main className="flex-1 max-w-xl w-full mx-auto px-3 sm:px-4 py-3 sm:py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-4 sm:p-7 shadow-sm relative overflow-hidden">
          {/* Subtle Light Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />

          {/* Form Header */}
          <div className="mb-4 text-center sm:text-left">
            <h2 className="text-sm sm:text-lg font-extrabold text-[#002244] tracking-tight">
              Registrar Nueva Cita de Llamada
            </h2>
          </div>

          <form onSubmit={handleAgendar} className="space-y-4 sm:space-y-5">
            {/* Tipo de Cita Selector (Clean without 2h30m / 30min badges as requested) */}
            <div>
              <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Tipo de Cita
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTipoCita('demo')}
                  style={{ touchAction: 'manipulation' }}
                  className={`p-3.5 rounded-xl border text-center transition-all ${
                    tipoCita === 'demo'
                      ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/25 text-[#002244] font-bold shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 font-semibold'
                  }`}
                >
                  <span className="text-sm">Demostración (Demo)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTipoCita('socio')}
                  style={{ touchAction: 'manipulation' }}
                  className={`p-3.5 rounded-xl border text-center transition-all ${
                    tipoCita === 'socio'
                      ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-500/25 text-amber-950 font-bold shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 font-semibold'
                  }`}
                >
                  <span className="text-sm">Reunión de Socio</span>
                </button>
              </div>
            </div>

            {/* Asesor y Cliente */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">
                  Asesor / Ejecutivo
                </label>
                <select
                  value={asesor}
                  onChange={(e) => setAsesor(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-base sm:text-sm font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none min-h-[44px]"
                >
                  <option value="Ricfel">Ricfel (SuperAdmin)</option>
                  <option value="Jangel">Jangel (SuperAdmin)</option>
                  {crmUsers
                    .filter(u => u.displayName && !['Ricfel', 'Jangel', 'Ricfel Olaizola', 'José Angel Borges', 'Jose Angel'].includes(u.displayName))
                    .map(u => (
                      <option key={u.uid} value={u.displayName}>
                        {u.displayName}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">
                  {tipoCita === 'demo' ? 'Nombre del Cliente' : 'Nombre del Socio'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Rocio Giraldo / Cezar Calderon"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-base sm:text-sm font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none min-h-[44px]"
                />
              </div>
            </div>

            {/* Celular y Dirección */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">
                  Teléfono Celular / WhatsApp
                </label>
                <input
                  type="tel"
                  placeholder="Ej. 992963045"
                  value={celular}
                  onChange={(e) => setCelular(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-base sm:text-sm font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">
                  Dirección y Referencia
                </label>
                <input
                  type="text"
                  placeholder="Ej. Jr Raymundo Carcamo 1000 Sta Catalina"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-base sm:text-sm font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none min-h-[44px]"
                />
              </div>
            </div>

            {/* Fecha y Hora Integradas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">
                  Fecha de la Cita
                </label>
                <input
                  type="date"
                  required
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-base sm:text-sm font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">
                  Hora de Inicio
                </label>
                <input
                  type="time"
                  required
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-base sm:text-sm font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none min-h-[44px]"
                />
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">
                Observaciones y Notas
              </label>
              <textarea
                rows={2}
                placeholder="Notas de la llamada, productos de interés..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-base sm:text-sm font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none resize-none"
              />
            </div>

            {/* Actions Bar: Pure SVGs with Ergonomic Calibration */}
            <div className="pt-2 flex items-center justify-center gap-3.5">
              {/* Submit Agendar Button: Pure SVG */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{ touchAction: 'manipulation' }}
                className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#002244] to-[#004D99] hover:from-[#001833] hover:to-[#003d7a] text-white flex items-center justify-center shadow-md shadow-blue-950/20 transition-all active:scale-95 disabled:opacity-50"
                title="Agendar Cita en Calendario"
                aria-label="Agendar Cita en Calendario"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                    <path d="M9 16l2 2 4-4"/>
                  </svg>
                )}
              </button>

              {/* Botón Campana Animada: Pure SVG */}
              <button
                type="button"
                onClick={handleBellClick}
                style={{ touchAction: 'manipulation' }}
                className={`w-12 h-12 rounded-xl border transition-all flex items-center justify-center active:scale-95 ${
                  agendadoExitoso || copiedMsg
                    ? 'bg-amber-50 border-amber-400 text-amber-700 shadow-md shadow-amber-500/15 animate-pulse'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
                }`}
                title="Sonar campana y copiar formato para WhatsApp"
                aria-label="Sonar campana y copiar formato para WhatsApp"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={agendadoExitoso || copiedMsg ? 'animate-bounce' : ''}
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </button>
            </div>
          </form>

          {/* Feedback Toast */}
          {copiedMsg && (
            <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center font-bold animate-in fade-in">
              ¡Formato copiado al portapapeles para WhatsApp!
            </div>
          )}

          {/* Success Box */}
          {agendadoExitoso && !copiedMsg && (
            <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold shrink-0">
                  ✓
                </div>
                <span className="font-bold truncate">¡Cita agendada exitosamente!</span>
              </div>
              <button
                type="button"
                onClick={handleBellClick}
                style={{ touchAction: 'manipulation' }}
                className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors flex items-center justify-center shrink-0 active:scale-95 shadow-xs"
                title="Copiar para WhatsApp"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Botón flotante circular con logo Vitality que aparece tras 1 segundo para volver al Hub */}
      <FloatingHubHomeButton position="bottom-right" />
    </div>
  );
};
