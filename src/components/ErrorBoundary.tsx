'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  private handleClearAndReload = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {}
      window.location.href = '/';
    }
  };

  public render() {
    if (this.state.hasError) {
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
              {this.props.fallbackTitle || 'Ocurrió un error en la aplicación'}
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#94A3B8', textAlign: 'center', marginBottom: '16px' }}>
              Se ha detectado una excepción en el navegador. Aquí están los detalles para el diagnóstico:
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
              {this.state.error?.toString() || 'Error desconocido'}
              {this.state.errorInfo?.componentStack && (
                <div style={{ color: '#94A3B8', marginTop: '8px' }}>
                  {this.state.errorInfo.componentStack}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
              <button
                onClick={this.handleReload}
                style={{
                  backgroundColor: '#004D99',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}
              >
                🔄 Reintentar y recargar
              </button>
              <button
                onClick={this.handleClearAndReload}
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
                Limpiar datos locales y volver al inicio
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
