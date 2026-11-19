import React from 'react';

/**
 * Icono de Pantalla Dividida fiel a Google Chrome / OS split view
 */
export default function SplitViewIcon({ className = "w-4 h-4", isActive = false }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth={isActive ? "2.3" : "1.8"} 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      {/* Marco general de la ventana */}
      <rect x="3" y="4" width="18" height="16" rx="3" ry="3" />
      {/* División central */}
      <line x1="12" y1="4" x2="12" y2="20" strokeWidth={isActive ? "2.5" : "2"} />
      {/* Indicador de mitad izquierda resaltada si está activo */}
      {isActive && (
        <path d="M5 8h4M5 12h4M5 16h3" strokeWidth="1.5" strokeOpacity="0.8" />
      )}
    </svg>
  );
}
