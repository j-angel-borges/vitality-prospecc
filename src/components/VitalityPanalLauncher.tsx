'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/firebase/firebaseClient';
import { CrmUserProfile, getUserProfile, logoutUser } from '@/services/authService';
import { LoginGatekeeperModal } from '@/components/LoginGatekeeperModal';

interface SubAppBubble {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  badge?: string;
  bgGradient: string;
  shadowColor: string;
  iconSvg: React.ReactNode;
}

export const VitalityPanalLauncher: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<CrmUserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Smartwatch Clock
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  // Interactive organic fluid mesh tracking mouse/touch coordinates
  const [targetPos, setTargetPos] = useState({ x: 500, y: 350 });
  const [smoothPos, setSmoothPos] = useState({ x: 500, y: 350 });
  const lastTouchTime = useRef<number>(0);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
      setCurrentDate(now.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'short' }).toUpperCase());
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Listen to mouse and touch movements across Android & iOS
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setTargetPos({ x: e.clientX, y: e.clientY });
      lastTouchTime.current = Date.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        setTargetPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
        lastTouchTime.current = Date.now();
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchMove);
    };
  }, []);

  // Smooth lerp animation loop with organic ambient drift when idle
  useEffect(() => {
    let animId: number;
    let t = 0;

    const animate = () => {
      t += 0.02;
      const isIdle = Date.now() - lastTouchTime.current > 2000;

      setSmoothPos((prev) => {
        let tx = targetPos.x;
        let ty = targetPos.y;

        // Subtle ambient organic breathing when idle (useful on mobile phones resting on table)
        if (isIdle) {
          tx += Math.sin(t) * 35;
          ty += Math.cos(t * 0.8) * 30;
        }

        const dx = tx - prev.x;
        const dy = ty - prev.y;
        return {
          x: prev.x + dx * 0.08,
          y: prev.y + dy * 0.08,
        };
      });

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [targetPos]);

  // Listen to Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setCurrentUser(u);
      if (u) {
        const p = await getUserProfile(u.uid, u.email);
        setUserProfile(p);
      } else {
        setUserProfile(null);
      }
      setIsAuthLoading(false);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setUserProfile(null);
  };

  // SubApps Definition matching requested modules
  const subApps: SubAppBubble[] = [
    {
      id: 'crm',
      title: 'CRM',
      subtitle: 'Leads & Clientes',
      href: '/crm',
      badge: 'Principal',
      bgGradient: 'linear-gradient(135deg, #002244 0%, #004D99 100%)',
      shadowColor: 'rgba(0, 77, 153, 0.35)',
      iconSvg: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 sm:w-8 sm:h-8">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M3 9h18M9 21V9"/>
        </svg>
      )
    },
    {
      id: 'sets',
      title: 'Sets',
      subtitle: 'Cotizador RP',
      href: '/sets',
      badge: 'Catálogo',
      bgGradient: 'linear-gradient(135deg, #78350F 0%, #D97706 100%)',
      shadowColor: 'rgba(217, 119, 6, 0.35)',
      iconSvg: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FDE68A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 sm:w-8 sm:h-8">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
      )
    },
    {
      id: 'prospecc',
      title: 'Prospecc',
      subtitle: 'Captación',
      href: '/prospecc',
      badge: 'Embudo',
      bgGradient: 'linear-gradient(135deg, #064E3B 0%, #059669 100%)',
      shadowColor: 'rgba(5, 150, 105, 0.35)',
      iconSvg: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#A7F3D0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 sm:w-8 sm:h-8">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="6"/>
          <circle cx="12" cy="12" r="2"/>
        </svg>
      )
    },
    {
      id: 'formdemo',
      title: 'FormDemo',
      subtitle: 'Gestión Citas',
      href: '/formdemo',
      badge: 'Citas',
      bgGradient: 'linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%)',
      shadowColor: 'rgba(124, 58, 237, 0.35)',
      iconSvg: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#DDD6FE" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 sm:w-8 sm:h-8">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
          <path d="M12 14l2 2 4-4"/>
        </svg>
      )
    }
  ];

  return (
    <div className="relative min-h-[100dvh] w-full bg-[#F8FAFC] text-slate-800 flex flex-col justify-between overflow-x-hidden overflow-y-auto select-none">
      {/* Dynamic Organic Navy Fluid Layer */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
        {/* Main navy organic fluid blob following mouse/touch */}
        <div
          className="absolute w-[360px] h-[360px] sm:w-[520px] sm:h-[520px] rounded-full blur-[70px] sm:blur-[90px] opacity-25"
          style={{
            transform: `translate3d(${smoothPos.x - 180}px, ${smoothPos.y - 180}px, 0)`,
            background: 'radial-gradient(circle, #002244 0%, #0B2545 45%, #004D99 75%, transparent 100%)',
            willChange: 'transform',
          }}
        />
        {/* Secondary organic fluid blob trailing */}
        <div
          className="absolute w-[280px] h-[280px] sm:w-[420px] sm:h-[420px] rounded-full blur-[80px] sm:blur-[100px] opacity-20"
          style={{
            transform: `translate3d(${smoothPos.x * 0.85 - 140}px, ${smoothPos.y * 0.85 - 140}px, 0)`,
            background: 'radial-gradient(circle, #1E3A8A 0%, #002244 55%, transparent 100%)',
            willChange: 'transform',
          }}
        />
        {/* Ambient subtle light accents */}
        <div className="absolute -top-32 -left-32 w-72 sm:w-96 h-72 sm:h-96 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-72 sm:w-96 h-72 sm:h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Frosted glass translucent wash */}
      <div className="absolute inset-0 bg-white/60 backdrop-blur-[35px] sm:backdrop-blur-[45px] pointer-events-none" style={{ zIndex: 1 }} />

      {/* Top Bar: Smartwatch User Profile (Top-Left) & Logo (Top-Right) */}
      <header className="relative z-20 px-4 sm:px-6 py-3.5 sm:py-6 pt-[max(0.85rem,env(safe-area-inset-top))] pl-[max(0.85rem,env(safe-area-inset-left))] pr-[max(0.85rem,env(safe-area-inset-right))] flex items-center justify-between gap-2">
        {/* User Profile Pill (Smartwatch Style in Top-Left) */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {currentUser ? (
            <div className="flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl bg-white/80 border border-slate-200/90 backdrop-blur-md shadow-sm max-w-[200px] sm:max-w-none">
              <div className="relative shrink-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-[#002244] to-[#004D99] flex items-center justify-center font-extrabold text-white text-xs sm:text-sm shadow-sm">
                  {(userProfile?.displayName || currentUser.displayName || currentUser.email || 'A').charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-500 rounded-full ring-2 ring-white" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[90px] sm:max-w-none">
                  {userProfile?.displayName || currentUser.displayName || 'Asesor Comercial'}
                </span>
                <span className="text-[9px] sm:text-[10px] font-semibold text-blue-700">
                  {userProfile?.role === 'ultra_admin' ? 'UltraAdmin' : (userProfile?.role === 'superadmin' ? 'SuperAdmin' : 'Asesor')}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="ml-1 sm:ml-2 w-7 h-7 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-500 flex items-center justify-center transition-colors shrink-0"
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
                </svg>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl bg-[#002244] hover:bg-[#003366] text-white text-xs font-bold shadow-md shadow-blue-950/15 transition-all active:scale-95"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>
              </svg>
              <span>Acceso Comercial</span>
            </button>
          )}
        </div>

        {/* Brand Symbol (Top-Right) */}
        <div className="flex items-center gap-2 shrink-0">
          <img src="/vitality_symbol.png" alt="Vitality" className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-sm" />
          <div className="hidden xs:flex flex-col text-right">
            <span className="text-[11px] sm:text-xs font-extrabold tracking-wider text-[#002244] uppercase">Vitality ERP</span>
            <span className="text-[9px] sm:text-[10px] text-slate-500 font-medium">Royal Prestige</span>
          </div>
        </div>
      </header>

      {/* Center Stage: Smartwatch Dial & Honeycomb Panal Launcher */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 py-4 sm:py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {/* Smartwatch Clock & Date Display */}
        <div className="flex flex-col items-center mb-6 sm:mb-8 text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 sm:py-1 rounded-full bg-white/80 border border-slate-200/90 shadow-sm mb-1.5 sm:mb-2 backdrop-blur-md">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            <span className="text-[9px] sm:text-[10px] font-extrabold tracking-widest text-[#002244] uppercase">
              {currentDate || 'VITALITY CENTRAL'}
            </span>
          </div>
          <div className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#002244] font-mono drop-shadow-sm">
            {currentTime || '12:00:00 PM'}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1 font-medium">
            Toca un icono para acceder a la sub-aplicación
          </p>
        </div>

        {/* Honeycomb Grid Container (Staggered Circular Bubbles) */}
        <div className="relative max-w-lg w-full flex flex-col items-center gap-4 sm:gap-6">
          {/* Row 1: CRM & SETS */}
          <div className="flex items-center justify-center gap-5 sm:gap-10">
            {subApps.slice(0, 2).map((app) => (
              <Link
                key={app.id}
                href={app.href}
                className="group relative flex flex-col items-center focus:outline-none"
                style={{ touchAction: 'manipulation' }}
              >
                {/* Outer Circular Bubble with Glow */}
                <div
                  className="w-24 h-24 sm:w-30 sm:h-30 md:w-32 md:h-32 rounded-full flex flex-col items-center justify-center p-2.5 sm:p-3 transition-all duration-300 transform group-hover:scale-110 active:scale-95 border-2 border-white/60 group-hover:border-white shadow-lg"
                  style={{
                    background: app.bgGradient,
                    boxShadow: `0 12px 24px ${app.shadowColor}`
                  }}
                >
                  <div className="transition-transform duration-300 group-hover:-translate-y-1">
                    {app.iconSvg}
                  </div>
                  <span className="mt-0.5 sm:mt-1 text-xs sm:text-sm md:text-base font-extrabold tracking-tight text-white drop-shadow">
                    /{app.title}
                  </span>
                </div>
                {/* Subtitle tag */}
                <span className="mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] font-bold text-slate-600 tracking-wide uppercase transition-colors group-hover:text-[#002244]">
                  {app.subtitle}
                </span>
              </Link>
            ))}
          </div>

          {/* Row 2: PROSPECC & FORMDEMO (Offset / Honeycomb Stagger) */}
          <div className="flex items-center justify-center gap-5 sm:gap-10">
            {subApps.slice(2, 4).map((app) => (
              <Link
                key={app.id}
                href={app.href}
                className="group relative flex flex-col items-center focus:outline-none"
                style={{ touchAction: 'manipulation' }}
              >
                {/* Outer Circular Bubble with Glow */}
                <div
                  className="w-24 h-24 sm:w-30 sm:h-30 md:w-32 md:h-32 rounded-full flex flex-col items-center justify-center p-2.5 sm:p-3 transition-all duration-300 transform group-hover:scale-110 active:scale-95 border-2 border-white/60 group-hover:border-white shadow-lg"
                  style={{
                    background: app.bgGradient,
                    boxShadow: `0 12px 24px ${app.shadowColor}`
                  }}
                >
                  <div className="transition-transform duration-300 group-hover:-translate-y-1">
                    {app.iconSvg}
                  </div>
                  <span className="mt-0.5 sm:mt-1 text-xs sm:text-sm md:text-base font-extrabold tracking-tight text-white drop-shadow">
                    /{app.title}
                  </span>
                </div>
                {/* Subtitle tag */}
                <span className="mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] font-bold text-slate-600 tracking-wide uppercase transition-colors group-hover:text-[#002244]">
                  {app.subtitle}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Login Gatekeeper Modal */}
      <LoginGatekeeperModal
        isOpen={isLoginModalOpen}
        isAuthLoading={isAuthLoading}
        onLoginWithGoogle={async (advisorName) => {
          const { loginWithGoogle } = await import('@/services/authService');
          const { user, profile } = await loginWithGoogle(advisorName);
          setCurrentUser(user);
          setUserProfile(profile);
          setIsLoginModalOpen(false);
        }}
        isDark={false}
      />
    </div>
  );
};
