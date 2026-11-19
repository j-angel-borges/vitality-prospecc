'use client';

import React, { useState } from 'react';

interface LoginGatekeeperModalProps {
  isOpen: boolean;
  isAuthLoading: boolean;
  onLoginWithGoogle: (advisorName?: string) => Promise<void>;
  onClose?: () => void;
  reasonTitle?: string;
  isDark?: boolean;
}

export const LoginGatekeeperModal: React.FC<LoginGatekeeperModalProps> = ({
  isOpen,
  isAuthLoading,
  onLoginWithGoogle,
  onClose,
  reasonTitle,
  isDark = false
}) => {
  const [advisorName, setAdvisorName] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoggingIn || isAuthLoading) return;

    setIsLoggingIn(true);
    setErrorMsg(null);
    try {
      await onLoginWithGoogle(advisorName.trim());
    } catch (err: any) {
      console.error('Error en autenticación Google:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Ventana de acceso cancelada por el usuario. Intenta nuevamente.');
      } else {
        setErrorMsg(err?.message || 'Error al conectar con Google. Verifica tu conexión.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'max(12px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right)) max(12px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left))'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          maxHeight: 'calc(100dvh - 24px)',
          backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
          overflowY: 'auto',
          animation: 'fadeInUp 0.3s ease-out'
        }}
      >
        {/* Header Decorator */}
        <div
          style={{
            background: 'linear-gradient(135deg, #002244 0%, #004D99 50%, #0077CC 100%)',
            padding: '28px 24px',
            textAlign: 'center',
            color: '#FFFFFF',
            position: 'relative'
          }}
        >
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 700,
                transition: 'all 0.15s ease'
              }}
              title="Cerrar"
            >
              ✕
            </button>
          )}

          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              margin: '0 auto 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)'
            }}
          >
            <img
              src="/vitality_symbol.png"
              alt="Vitality"
              style={{ width: '38px', height: '38px', objectFit: 'contain' }}
            />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            {reasonTitle || 'VITALITY CENTRAL'}
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: '0.86rem', opacity: 0.9, fontWeight: 500 }}>
            Royal Prestige Distribution • Control Comercial
          </p>
        </div>

        {/* Content Body */}
        <div style={{ padding: '26px 24px' }}>
          {isAuthLoading ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  border: '3px solid #E2E8F0',
                  borderTopColor: '#004D99',
                  borderRadius: '50%',
                  margin: '0 auto 14px',
                  animation: 'spin 1s linear infinite'
                }}
              />
              <p style={{ margin: 0, fontSize: '0.9rem', color: isDark ? '#94A3B8' : '#64748B', fontWeight: 600 }}>
                Verificando sesión activa...
              </p>
            </div>
          ) : (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '18px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    marginBottom: '8px',
                    color: isDark ? '#E2E8F0' : '#1E293B'
                  }}
                >
                  Nombre de Asesor Comercial:
                </label>
                <input
                  type="text"
                  placeholder="Ej. Ric / Jangel"
                  value={advisorName}
                  onChange={(e) => setAdvisorName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    border: isDark ? '1.5px solid #334155' : '1.5px solid #CBD5E1',
                    background: isDark ? '#1E293B' : '#F8FAFC',
                    color: isDark ? '#F1F5F9' : '#0F172A',
                    fontSize: '0.92rem',
                    outline: 'none',
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                />

                {/* Quick Selection Chips */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setAdvisorName('Ric')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '8px',
                      border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                      background: (advisorName === 'Ric' || advisorName === 'Ricfel') ? (isDark ? 'rgba(124, 58, 237, 0.25)' : '#F5F3FF') : (isDark ? '#1E293B' : '#F1F5F9'),
                      color: (advisorName === 'Ric' || advisorName === 'Ricfel') ? (isDark ? '#C4B5FD' : '#7C3AED') : (isDark ? '#94A3B8' : '#475569'),
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span>Ric</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdvisorName('Jangel')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '8px',
                      border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                      background: advisorName === 'Jangel' ? (isDark ? 'rgba(59, 130, 246, 0.25)' : '#EFF6FF') : (isDark ? '#1E293B' : '#F1F5F9'),
                      color: advisorName === 'Jangel' ? (isDark ? '#93C5FD' : '#004D99') : (isDark ? '#94A3B8' : '#475569'),
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span>Jangel</span>
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    color: '#B91C1C',
                    fontSize: '0.8rem',
                    marginBottom: '16px',
                    fontWeight: 500
                  }}
                >
                  {errorMsg}
                </div>
              )}

              {/* Google Login Button */}
              <button
                type="submit"
                disabled={isLoggingIn}
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  background: isLoggingIn ? '#F1F5F9' : '#FFFFFF',
                  color: '#1E293B',
                  fontWeight: 700,
                  fontSize: '0.94rem',
                  cursor: isLoggingIn ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
              >
                {/* Google "G" Icon */}
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isLoggingIn ? 'Conectando con Google...' : 'Ingresar con cuenta Google'}</span>
              </button>

              <p
                style={{
                  margin: '16px 0 0',
                  fontSize: '0.74rem',
                  color: isDark ? '#94A3B8' : '#64748B',
                  textAlign: 'center',
                  lineHeight: '1.4'
                }}
              >
                🔒 Acceso restringido exclusivamente a asesores autorizados de Vitality.
                Al ingresar se sincronizarán tus pestañas y leads asignados.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
