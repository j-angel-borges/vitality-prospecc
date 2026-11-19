import React from 'react';

/**
 * Icono SVG de Expandir / Pantalla Completa (sin texto)
 * Oculta barra de navegación y pestañas del navegador (Brave / Chrome / Tablet)
 */
export default function ExpandViewIcon({ className = "w-4 h-4", isActive = false }) {
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
      {!isActive ? (
        <>
          {/* Esquinas hacia afuera (Expandir) */}
          <path d="M15 3h6v6" />
          <path d="M9 21H3v-6" />
          <path d="M21 3l-7 7" />
          <path d="M3 21l7-7" />
        </>
      ) : (
        <>
          {/* Esquinas hacia adentro (Salir de Pantalla Completa) */}
          <path d="M4 14h6v6" />
          <path d="M20 10h-6V4" />
          <path d="M14 10l7-7" />
          <path d="M3 21l7-7" />
        </>
      )}
    </svg>
  );
}
