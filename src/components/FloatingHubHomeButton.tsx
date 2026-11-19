'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface FloatingHubHomeButtonProps {
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  className?: string;
  style?: React.CSSProperties;
}

export const FloatingHubHomeButton: React.FC<FloatingHubHomeButtonProps> = ({
  position = 'bottom-right',
  className = '',
  style = {}
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    // Aparece suavemente después de exactamente 1 segundo de tener la sección abierta
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const getPositionStyles = (): React.CSSProperties => {
    switch (position) {
      case 'bottom-right':
        return {
          right: 'max(14px, env(safe-area-inset-right))',
          // Elevado un poco más para confort visual y ergonómico sobre cualquier barra inferior
          bottom: 'max(72px, calc(env(safe-area-inset-bottom) + 66px))',
        };
      case 'bottom-left':
        return {
          left: 'max(14px, env(safe-area-inset-left))',
          bottom: 'max(72px, calc(env(safe-area-inset-bottom) + 66px))',
        };
      case 'top-left':
        return {
          left: 'max(14px, env(safe-area-inset-left))',
          top: 'max(14px, env(safe-area-inset-top))',
        };
      case 'top-right':
        return {
          right: 'max(14px, env(safe-area-inset-right))',
          top: 'max(14px, env(safe-area-inset-top))',
        };
      default:
        return {
          right: 'max(14px, env(safe-area-inset-right))',
          bottom: 'max(72px, calc(env(safe-area-inset-bottom) + 66px))',
        };
    }
  };

  return (
    <>
      <style jsx global>{`
        @keyframes popExpandEntrance {
          0% {
            opacity: 0;
            transform: scale(0.15);
          }
          65% {
            opacity: 1;
            transform: scale(1.18);
          }
          85% {
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes subtleFloatMotion {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        .vitality-floating-hub-container {
          animation: popExpandEntrance 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .vitality-floating-hub-inner {
          animation: subtleFloatMotion 3s ease-in-out infinite;
        }
      `}</style>

      {isVisible && (
        <div
          style={{
            position: 'fixed',
            zIndex: 9999,
            ...getPositionStyles(),
            ...style
          }}
          className="vitality-floating-hub-container"
        >
          <Link
            href="/"
            className={`vitality-floating-hub-inner group w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white text-slate-800 shadow-[0_8px_24px_rgba(0,34,68,0.28)] hover:shadow-[0_10px_28px_rgba(0,34,68,0.36)] border-[1.5px] border-[#004D99] backdrop-blur-md flex items-center justify-center active:scale-90 transition-all ${className}`}
            title="Volver al Hub Principal (Vitality ERP)"
            aria-label="Volver al Hub Principal (Vitality ERP)"
          >
            <img
              src="/vitality_symbol.png"
              alt="Vitality"
              className="w-5.5 h-5.5 sm:w-6 sm:h-6 object-contain transition-transform group-hover:scale-110 drop-shadow-xs"
            />
          </Link>
        </div>
      )}
    </>
  );
};
