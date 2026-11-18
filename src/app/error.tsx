'use client';

import { useEffect } from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Next.js Page Error:', error);
  }, [error]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0F172A',
      color: '#F8FAFC',
      padding: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '560px',
        width: '100%',
        backgroundColor: '#1E293B',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        border: '1px solid #334155'
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '12px', textAlign: 'center' }}>⚠️</div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, textAlign: 'center', marginBottom: '8px', color: '#F1F5F9' }}>
          Error al cargar la página
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#94A3B8', textAlign: 'center', marginBottom: '16px' }}>
          Se ha producido un error al procesar esta vista:
        </p>

        <div style={{
          backgroundColor: '#0F172A',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '0.75rem',
          color: '#F87171',
          fontFamily: 'monospace',
          maxHeight: '180px',
          overflowY: 'auto',
          marginBottom: '20px',
          border: '1px solid #450A0A',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all'
        }}>
          {error?.message || error?.toString() || 'Error desconocido'}
          {error?.digest && (
            <div style={{ color: '#94A3B8', marginTop: '6px' }}>
              Digest: {error.digest}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
          <button
            onClick={() => reset()}
            style={{
              backgroundColor: '#004D99',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '0.9rem',
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            🔄 Intentar de nuevo
          </button>
          <button
            onClick={() => {
              try {
                localStorage.clear();
                sessionStorage.clear();
              } catch (e) {}
              window.location.href = '/';
            }}
            style={{
              backgroundColor: 'transparent',
              color: '#94A3B8',
              fontSize: '0.8rem',
              padding: '10px',
              borderRadius: '10px',
              border: '1px solid #334155',
              cursor: 'pointer'
            }}
          >
            Limpiar datos y volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
