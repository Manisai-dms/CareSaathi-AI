import React from 'react';

// ==============================================================================
// CareSaathi AI - HeroBackground Component
//
// Layer Order (bottom to top):
// 1. Hospital Exterior Photography Layer (/images/hospital-exterior.jpg)
//    - Fallback: Soft teal-to-white gradient if image is loading or missing
//    - Opacity: ~0.20 with a 1.5px soft blur
// 2. White-to-transparent gradient overlays:
//    - Stronger white fade on left behind the headline for maximum readability & contrast
//    - Soft gradient fade toward bottom to seamlessly blend into subsequent sections
// 3. Scattering of subtle medical plus / cross symbols:
//    - Colors: Soft teal (#2F8F83) and pastel coral (#E88B8B)
//    - Opacity: 0.07 to 0.09 (calm, non-distracting)
//    - Placed strictly in empty perimeter zones (top strip, right edge, below CTAs, around 3D canvas)
//    - Never behind primary text or interactive buttons
//    - Gentle CSS float & fade micro-motion, disabled on prefers-reduced-motion
//    - Cleanly reduced on small screens (<768px)
// ==============================================================================

interface PlusItem {
  id: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  size: number;
  rotation: number;
  color: string;
  opacity: number;
  animationType: 'float-slow' | 'float-reverse' | 'fade-gentle' | 'static';
  durationSec: number;
  hideOnMobile?: boolean;
}

// Perimeter-only placement map avoiding headline, paragraph, and buttons
const PLUS_SYMBOLS: PlusItem[] = [
  // --- Top Strip under Navbar ---
  {
    id: 'top-left-1',
    top: '12px',
    left: '4%',
    size: 26,
    rotation: 12,
    color: '#2F8F83',
    opacity: 0.08,
    animationType: 'float-slow',
    durationSec: 8.5,
    hideOnMobile: false
  },
  {
    id: 'top-mid-1',
    top: '18px',
    left: '46%',
    size: 32,
    rotation: -8,
    color: '#2F8F83',
    opacity: 0.07,
    animationType: 'fade-gentle',
    durationSec: 9.0,
    hideOnMobile: true
  },
  {
    id: 'top-right-1',
    top: '10px',
    right: '8%',
    size: 40,
    rotation: 15,
    color: '#E88B8B',
    opacity: 0.08,
    animationType: 'float-slow',
    durationSec: 8.0,
    hideOnMobile: false
  },

  // --- Far Right Edge & Top-Right Canvas Perimeter ---
  {
    id: 'right-edge-1',
    top: '28%',
    right: '2%',
    size: 48,
    rotation: -14,
    color: '#2F8F83',
    opacity: 0.08,
    animationType: 'float-reverse',
    durationSec: 9.5,
    hideOnMobile: false
  },
  {
    id: 'right-edge-2',
    top: '56%',
    right: '3.5%',
    size: 34,
    rotation: 10,
    color: '#E88B8B',
    opacity: 0.07,
    animationType: 'float-slow',
    durationSec: 7.5,
    hideOnMobile: true
  },
  {
    id: 'right-edge-3',
    bottom: '14%',
    right: '5%',
    size: 54,
    rotation: -18,
    color: '#2F8F83',
    opacity: 0.08,
    animationType: 'fade-gentle',
    durationSec: 8.5,
    hideOnMobile: true
  },

  // --- Outer Perimeter around 3D Centerpiece ---
  {
    id: 'canvas-top-right',
    top: '12%',
    right: '28%',
    size: 24,
    rotation: 6,
    color: '#2F8F83',
    opacity: 0.08,
    animationType: 'float-slow',
    durationSec: 7.0,
    hideOnMobile: true
  },
  {
    id: 'canvas-bottom-right',
    bottom: '8%',
    right: '24%',
    size: 30,
    rotation: -10,
    color: '#E88B8B',
    opacity: 0.07,
    animationType: 'float-reverse',
    durationSec: 9.0,
    hideOnMobile: true
  },

  // --- Area Below CTAs & Trust Line (Far Bottom Left) ---
  {
    id: 'bottom-left-1',
    bottom: '12px',
    left: '3%',
    size: 36,
    rotation: 16,
    color: '#2F8F83',
    opacity: 0.08,
    animationType: 'float-slow',
    durationSec: 8.0,
    hideOnMobile: false
  },
  {
    id: 'bottom-left-2',
    bottom: '24px',
    left: '26%',
    size: 22,
    rotation: -12,
    color: '#E88B8B',
    opacity: 0.07,
    animationType: 'fade-gentle',
    durationSec: 9.2,
    hideOnMobile: true
  },
  {
    id: 'bottom-mid-1',
    bottom: '16px',
    left: '48%',
    size: 28,
    rotation: 8,
    color: '#2F8F83',
    opacity: 0.07,
    animationType: 'float-reverse',
    durationSec: 8.8,
    hideOnMobile: true
  }
];

export const HeroBackground: React.FC = () => {
  return (
    <div
      className="hero-background-root"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}
      aria-hidden="true"
    >
      {/* Strengthened Left White-to-Transparent Gradient: covering full hero height for text readability */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 2,
          background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.94) 0%, rgba(255, 255, 255, 0.85) 35%, rgba(255, 255, 255, 0.35) 55%, rgba(255, 255, 255, 0) 72%)'
        }}
      />

      {/* Soft 120px Bottom Gradient Fade into subsequent section to eliminate visible seams */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '120px',
          zIndex: 3,
          background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.80) 100%)'
        }}
      />

      {/* 5. Medical Plus / Cross Symbols Scattering */}
      <div
        className="hero-plus-symbols-container"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 5
        }}
      >
        {PLUS_SYMBOLS.map(item => (
          <div
            key={item.id}
            className={`hero-plus-item ${item.animationType} ${item.hideOnMobile ? 'hide-mobile-plus' : ''}`}
            style={{
              position: 'absolute',
              top: item.top,
              bottom: item.bottom,
              left: item.left,
              right: item.right,
              width: `${item.size}px`,
              height: `${item.size}px`,
              opacity: item.opacity,
              animationDuration: `${item.durationSec}s`,
              transform: `rotate(${item.rotation}deg)`
            }}
          >
            <svg
              viewBox="0 0 24 24"
              width="100%"
              height="100%"
              fill="none"
              stroke={item.color}
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="3" x2="12" y2="21" />
              <line x1="3" y1="12" x2="21" y2="12" />
            </svg>
          </div>
        ))}
      </div>

      {/* Scoped Keyframes & Responsive Rules */}
      <style>{`
        @keyframes heroPlusFloat {
          0% {
            transform: translateY(0px) rotate(var(--rot, 0deg));
          }
          50% {
            transform: translateY(-8px) rotate(var(--rot, 0deg));
          }
          100% {
            transform: translateY(0px) rotate(var(--rot, 0deg));
          }
        }

        @keyframes heroPlusFloatRev {
          0% {
            transform: translateY(0px) rotate(var(--rot, 0deg));
          }
          50% {
            transform: translateY(8px) rotate(var(--rot, 0deg));
          }
          100% {
            transform: translateY(0px) rotate(var(--rot, 0deg));
          }
        }

        @keyframes heroPlusFade {
          0% {
            opacity: var(--base-op, 0.08);
          }
          50% {
            opacity: calc(var(--base-op, 0.08) * 0.45);
          }
          100% {
            opacity: var(--base-op, 0.08);
          }
        }

        .hero-plus-item.float-slow {
          animation: heroPlusFloat ease-in-out infinite;
        }

        .hero-plus-item.float-reverse {
          animation: heroPlusFloatRev ease-in-out infinite;
        }

        .hero-plus-item.fade-gentle {
          animation: heroPlusFade ease-in-out infinite;
        }

        @media (max-width: 768px) {
          .hide-mobile-plus {
            display: none !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-plus-item {
            animation: none !important;
          }
          .hero-exterior-image-layer {
            filter: none !important;
          }
        }
      `}</style>
    </div>
  );
};
