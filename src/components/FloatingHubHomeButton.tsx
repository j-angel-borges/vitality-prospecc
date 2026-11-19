'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface FloatingHubHomeButtonProps {
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  className?: string;
  style?: React.CSSProperties;
}

export const FloatingHubHomeButton: React.FC<FloatingHubHomeButtonProps> = ({
  position = 'bottom-left',
  className = '',
  style = {}
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    // Aparece suavemente después de 1 segundo de tener la sección abierta
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const getPositionStyles = (): React.CSSProperties => {
    switch (position) {
      case 'bottom-left':
        return {
          left: 'max(0.75rem, env(safe-area-inset-left))',
          bottom: 'max(0.75rem, env(safe-area-inset-bottom))',
        };
      case 'bottom-right':
        return {
          right: 'max(0.75rem, env(safe-area-inset-right))',
          bottom: 'max(0.75rem, env(safe-area-inset-bottom))',
        };
      case 'top-left':
        return {
          left: 'max(0.75rem, env(safe-area-inset-left))',
          top: 'max(0.75rem, env(safe-area-inset-top))',
        };
      case 'top-right':
        return {
          right: 'max(0.75rem, env(safe-area-inset-right))',
          top: 'max(0.75rem, env(safe-area-inset-top))',
        };
      default:
        return {};
    }
  };

  return (
    <Link
      href="/"
      style={{
        position: 'fixed',
        zIndex: 9999,
        ...getPositionStyles(),
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'scale(1)' : 'scale(0.7)',
        pointerEvents: isVisible ? 'auto' : 'none',
        transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        touchAction: 'manipulation',
        ...style
      }}
      className={`group w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 hover:bg-white text-slate-800 shadow-lg hover:shadow-xl border border-slate-200/90 backdrop-blur-md flex items-center justify-center active:scale-90 transition-all ${className}`}
      title="Volver a Inicio (Hub Vitality ERP)"
      aria-label="Volver a Inicio (Hub Vitality ERP)"
    >
      <img
        src="/vitality_symbol.png"
        alt="Vitality"
        className="w-5 h-5 sm:w-5.5 sm:h-5.5 object-contain transition-transform group-hover:scale-110 drop-shadow-xs"
      />
    </Link>
  );
};
