// ==============================================================================
// CareSaathi AI - Login Page Rich Decorative Background Component
// Scoped prefix: lgb-
//
// 6 Layered Visuals (Rendered strictly behind interactive content at z-index: 0):
// - Layer 1: Soft slow-drifting mesh gradient blobs (Teal, Mint, Light Blue, Peach)
// - Layer 2: 3-4 flowing SVG wave lines with continuous horizontal & dash flow
// - Layer 3: Faint peripheral line-style medical icons (Plus, Heart, Stethoscope, Pill, Shield, Droplet)
// - Layer 4: Floating rising particles (teal/coral) and expanding concentric pulse rings
// - Layer 5: Faint hospital image watermark (8-12% opacity, 2.5px blur, soft overlay)
// - Layer 6: Subtle dotted grid (opacity 0.04) and micro-grain texture (opacity 0.03)
//
// Performance & Accessibility:
// - pointer-events: none, aria-hidden: true
// - will-change: transform applied ONLY to blobs
// - prefers-reduced-motion stops all animations
// - Mobile (<768px): hides icon pattern, reduces particles to 8
// ==============================================================================

import React from 'react';

// Preset peripheral particle coordinates to keep central content crystal clear
const PARTICLES = [
  { id: 1, left: '4%', size: 4, color: 'teal', duration: 18, delay: 0 },
  { id: 2, left: '9%', size: 5, color: 'coral', duration: 22, delay: 4 },
  { id: 3, left: '14%', size: 3, color: 'teal', duration: 20, delay: 7 },
  { id: 4, left: '19%', size: 4, color: 'sky', duration: 25, delay: 2 },
  { id: 5, left: '26%', size: 3, color: 'teal', duration: 24, delay: 9 },
  { id: 6, left: '33%', size: 4, color: 'coral', duration: 19, delay: 12 },
  { id: 7, left: '42%', size: 3, color: 'teal', duration: 23, delay: 5 },
  { id: 8, left: '49%', size: 4, color: 'sky', duration: 27, delay: 1 },
  // Additional desktop-only particles (9-18)
  { id: 9, left: '56%', size: 3, color: 'teal', duration: 21, delay: 8, desktopOnly: true },
  { id: 10, left: '63%', size: 5, color: 'coral', duration: 26, delay: 3, desktopOnly: true },
  { id: 11, left: '69%', size: 4, color: 'teal', duration: 20, delay: 11, desktopOnly: true },
  { id: 12, left: '74%', size: 3, color: 'sky', duration: 24, delay: 6, desktopOnly: true },
  { id: 13, left: '80%', size: 4, color: 'teal', duration: 22, delay: 13, desktopOnly: true },
  { id: 14, left: '86%', size: 5, color: 'coral', duration: 19, delay: 2, desktopOnly: true },
  { id: 15, left: '91%', size: 3, color: 'teal', duration: 25, delay: 10, desktopOnly: true },
  { id: 16, left: '95%', size: 4, color: 'sky', duration: 23, delay: 4, desktopOnly: true },
  { id: 17, left: '6%', size: 4, color: 'teal', duration: 21, delay: 14, desktopOnly: true },
  { id: 18, left: '89%', size: 3, color: 'coral', duration: 28, delay: 7, desktopOnly: true },
];

export const LoginBackground: React.FC = () => {
  return (
    <div className="lgb-root-container" aria-hidden="true">
      {/* =========================================================================
          LAYER 5: DEDICATED FULL-PAGE HOSPITAL BACKGROUND (Under mesh & icons)
          ========================================================================= */}
      <div className="lgb-hospital-bg-layer" />
      <div className="lgb-hospital-overlay" />

      {/* =========================================================================
          LAYER 1: SOFT MESH GRADIENT BLOBS (Teal, Mint, Light Blue, Peach)
          ========================================================================= */}
      <div className="lgb-mesh-layer">
        <div className="lgb-blob lgb-blob-teal" />
        <div className="lgb-blob lgb-blob-mint" />
        <div className="lgb-blob lgb-blob-sky" />
        <div className="lgb-blob lgb-blob-peach" />
      </div>

      {/* =========================================================================
          LAYER 6A: SUBTLE DOTTED GRID PATTERN (4% Opacity)
          ========================================================================= */}
      <div className="lgb-dot-grid" />

      {/* =========================================================================
          LAYER 2: FLOWING SINE WAVE LINES (Top, Middle, Bottom)
          ========================================================================= */}
      <div className="lgb-waves-layer">
        <svg
          className="lgb-wave-svg"
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="lgbWaveTeal" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2F8F83" stopOpacity="0.05" />
              <stop offset="35%" stopColor="#2F8F83" stopOpacity="0.32" />
              <stop offset="70%" stopColor="#438F84" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#2F8F83" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="lgbWaveCoral" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF7A59" stopOpacity="0.05" />
              <stop offset="40%" stopColor="#FF7A59" stopOpacity="0.26" />
              <stop offset="75%" stopColor="#FF8F73" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#FF7A59" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="lgbWaveSky" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4DA8FF" stopOpacity="0.04" />
              <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#4DA8FF" stopOpacity="0.04" />
            </linearGradient>
          </defs>

          {/* Wave 1: Near Top (y ~ 190) */}
          <path
            d="M -100 180 C 180 130, 420 230, 720 180 C 1020 130, 1260 220, 1540 170"
            stroke="url(#lgbWaveTeal)"
            strokeWidth="1.6"
            strokeLinecap="round"
            className="lgb-wave-line lgb-wave-top"
          />

          {/* Wave 2: Middle (y ~ 490) */}
          <path
            d="M -100 480 C 220 540, 500 430, 780 490 C 1060 550, 1300 450, 1540 500"
            stroke="url(#lgbWaveCoral)"
            strokeWidth="1.4"
            strokeLinecap="round"
            className="lgb-wave-line lgb-wave-mid"
          />

          {/* Wave 3: Near Bottom (y ~ 760) */}
          <path
            d="M -100 780 C 200 720, 480 820, 760 760 C 1040 700, 1280 800, 1540 750"
            stroke="url(#lgbWaveSky)"
            strokeWidth="1.6"
            strokeLinecap="round"
            className="lgb-wave-line lgb-wave-bot"
          />
        </svg>
      </div>

      {/* =========================================================================
          LAYER 4B: CONCENTRIC HEARTBEAT PULSE RINGS (Left & Bottom-Right)
          ========================================================================= */}
      <div className="lgb-pulse-rings-layer">
        {/* Ring cluster 1: Behind left panel (center around x: 20%, y: 46%) */}
        <div className="lgb-ring-emitter lgb-emitter-left">
          <div className="lgb-ring lgb-ring-1" />
          <div className="lgb-ring lgb-ring-2" />
          <div className="lgb-ring lgb-ring-3" />
        </div>

        {/* Ring cluster 2: Bottom Right (center around x: 84%, y: 84%) */}
        <div className="lgb-ring-emitter lgb-emitter-right">
          <div className="lgb-ring lgb-ring-coral-1" />
          <div className="lgb-ring lgb-ring-coral-2" />
        </div>
      </div>

      {/* =========================================================================
          LAYER 3: PERIPHERAL MEDICAL ICONS (0.05 - 0.08 Opacity, Teal Outline)
          Strictly placed in perimeter strips (top, bottom, far-left, far-right)
          ========================================================================= */}
      <div className="lgb-icon-pattern">
        {/* TOP STRIP ICONS */}
        <div className="lgb-icon-wrap" style={{ top: '3.5%', left: '8%', transform: 'rotate(12deg)' }}>
          {/* Heart Icon */}
          <svg className="lgb-med-icon" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#2F8F83" strokeWidth="1.5">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </div>

        <div className="lgb-icon-wrap lgb-float-slow" style={{ top: '4.5%', left: '28%', transform: 'rotate(-8deg)' }}>
          {/* Plus / Cross Icon */}
          <svg className="lgb-med-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2F8F83" strokeWidth="1.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>

        <div className="lgb-icon-wrap" style={{ top: '3%', left: '48%', transform: 'rotate(6deg)' }}>
          {/* Shield Icon */}
          <svg className="lgb-med-icon" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2F8F83" strokeWidth="1.4">
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
          </svg>
        </div>

        <div className="lgb-icon-wrap lgb-float-slow" style={{ top: '4%', right: '28%', transform: 'rotate(15deg)' }}>
          {/* Droplet Icon */}
          <svg className="lgb-med-icon" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#2F8F83" strokeWidth="1.5">
            <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-6-1.5-1.5-3.5-3.5-4-5-.5 1.5-2.5 3.5-4 5-2 2.1-3 4-3 6a7 7 0 0 0 7 7z" />
          </svg>
        </div>

        <div className="lgb-icon-wrap" style={{ top: '4%', right: '7%', transform: 'rotate(-18deg)' }}>
          {/* Pill Icon */}
          <svg className="lgb-med-icon" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#2F8F83" strokeWidth="1.4">
            <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
            <path d="m8.5 8.5 7 7" />
          </svg>
        </div>

        {/* FAR LEFT EDGE ICONS */}
        <div className="lgb-icon-wrap lgb-float-slow" style={{ top: '38%', left: '2%', transform: 'rotate(14deg)' }}>
          {/* Stethoscope Icon */}
          <svg className="lgb-med-icon" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#2F8F83" strokeWidth="1.4">
            <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
            <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
            <circle cx="20" cy="10" r="2" />
          </svg>
        </div>

        <div className="lgb-icon-wrap" style={{ top: '64%', left: '2.5%', transform: 'rotate(-10deg)' }}>
          {/* Plus / Cross Icon */}
          <svg className="lgb-med-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2F8F83" strokeWidth="1.4">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>

        {/* FAR RIGHT EDGE ICONS */}
        <div className="lgb-icon-wrap lgb-float-slow" style={{ top: '42%', right: '2%', transform: 'rotate(-15deg)' }}>
          {/* Plus / Cross Icon */}
          <svg className="lgb-med-icon" width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#2F8F83" strokeWidth="1.4">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>

        <div className="lgb-icon-wrap" style={{ top: '68%', right: '2.5%', transform: 'rotate(20deg)' }}>
          {/* Droplet Icon */}
          <svg className="lgb-med-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2F8F83" strokeWidth="1.4">
            <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-6-1.5-1.5-3.5-3.5-4-5-.5 1.5-2.5 3.5-4 5-2 2.1-3 4-3 6a7 7 0 0 0 7 7z" />
          </svg>
        </div>

        {/* BOTTOM STRIP ICONS */}
        <div className="lgb-icon-wrap" style={{ bottom: '3%', left: '8%', transform: 'rotate(-12deg)' }}>
          {/* Stethoscope Icon */}
          <svg className="lgb-med-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2F8F83" strokeWidth="1.4">
            <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
            <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
            <circle cx="20" cy="10" r="2" />
          </svg>
        </div>

        <div className="lgb-icon-wrap lgb-float-slow" style={{ bottom: '4%', left: '32%', transform: 'rotate(22deg)' }}>
          {/* Pill Icon */}
          <svg className="lgb-med-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2F8F83" strokeWidth="1.5">
            <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
            <path d="m8.5 8.5 7 7" />
          </svg>
        </div>

        <div className="lgb-icon-wrap" style={{ bottom: '3%', left: '55%', transform: 'rotate(-8deg)' }}>
          {/* Shield Icon */}
          <svg className="lgb-med-icon" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#2F8F83" strokeWidth="1.4">
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
          </svg>
        </div>

        <div className="lgb-icon-wrap lgb-float-slow" style={{ bottom: '3.5%', right: '12%', transform: 'rotate(-16deg)' }}>
          {/* Heart Icon */}
          <svg className="lgb-med-icon" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2F8F83" strokeWidth="1.5">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </div>
      </div>

      {/* =========================================================================
          LAYER 4A: RISING FLOATING PARTICLES (Teal, Coral, Sky)
          ========================================================================= */}
      <div className="lgb-particles-layer">
        {PARTICLES.map((p) => (
          <span
            key={p.id}
            className={`lgb-particle lgb-particle-${p.color} ${p.desktopOnly ? 'lgb-particle-desktop-only' : ''}`}
            style={{
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* =========================================================================
          LAYER 6B: FAINT NOISE / MICRO-GRAIN TEXTURE (3% Opacity)
          ========================================================================= */}
      <div className="lgb-grain-texture" />

      {/* Scoped CSS Styles for Background Layers */}
      <style>{`
        /* Root decorative fixed viewport container */
        .lgb-root-container {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
          background: linear-gradient(135deg, #F4FAF8 0%, #FAFAF7 50%, #EDF7F5 100%);
        }

        /* -----------------------------------------------------------------------
           LAYER 5: DEDICATED FULL-PAGE HOSPITAL BACKGROUND (28% Opacity, 1.5px blur)
           ----------------------------------------------------------------------- */
        .lgb-hospital-bg-layer {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background-image: url('/images/hospital-bg.jpg');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          opacity: 0.28;
          filter: blur(1.5px);
          transform: scale(1.03); /* Avoids white edge fringing from blur */
        }

        .lgb-hospital-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.40) 0%,
            rgba(255, 255, 255, 0.15) 50%,
            rgba(255, 255, 255, 0.45) 100%
          );
        }

        /* -----------------------------------------------------------------------
           LAYER 1: MESH GRADIENT BLOBS (Hardware-accelerated transform only)
           ----------------------------------------------------------------------- */
        .lgb-mesh-layer {
          position: absolute;
          inset: 0;
          z-index: 2;
          overflow: hidden;
        }
        .lgb-blob {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          will-change: transform;
        }

        .lgb-blob-teal {
          width: 580px;
          height: 580px;
          top: -80px;
          left: 4%;
          background: radial-gradient(circle, rgba(47, 143, 131, 0.20) 0%, rgba(47, 143, 131, 0) 70%);
          filter: blur(100px);
          animation: lgbBlobDrift1 24s ease-in-out infinite alternate;
        }

        .lgb-blob-mint {
          width: 620px;
          height: 620px;
          bottom: -100px;
          left: 28%;
          background: radial-gradient(circle, rgba(167, 243, 208, 0.22) 0%, rgba(167, 243, 208, 0) 72%);
          filter: blur(115px);
          animation: lgbBlobDrift2 28s ease-in-out infinite alternate;
        }

        .lgb-blob-sky {
          width: 540px;
          height: 540px;
          top: 8%;
          right: 4%;
          background: radial-gradient(circle, rgba(77, 168, 255, 0.18) 0%, rgba(77, 168, 255, 0) 70%);
          filter: blur(105px);
          animation: lgbBlobDrift3 22s ease-in-out infinite alternate;
        }

        .lgb-blob-peach {
          width: 500px;
          height: 500px;
          bottom: 2%;
          right: 20%;
          background: radial-gradient(circle, rgba(255, 122, 89, 0.16) 0%, rgba(255, 122, 89, 0) 72%);
          filter: blur(110px);
          animation: lgbBlobDrift4 26s ease-in-out infinite alternate;
        }

        @keyframes lgbBlobDrift1 {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, 35px) scale(1.08); }
          100% { transform: translate(-30px, 60px) scale(0.96); }
        }
        @keyframes lgbBlobDrift2 {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-45px, -30px) scale(1.12); }
          100% { transform: translate(35px, -50px) scale(0.94); }
        }
        @keyframes lgbBlobDrift3 {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-35px, 45px) scale(1.06); }
          100% { transform: translate(25px, 20px) scale(1.14); }
        }
        @keyframes lgbBlobDrift4 {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(50px, -40px) scale(1.10); }
          100% { transform: translate(-30px, -20px) scale(0.92); }
        }

        /* -----------------------------------------------------------------------
           LAYER 6A: SUBTLE DOTTED GRID (4% Opacity)
           ----------------------------------------------------------------------- */
        .lgb-dot-grid {
          position: absolute;
          inset: 0;
          z-index: 3;
          background-image: radial-gradient(rgba(47, 143, 131, 0.25) 1px, transparent 1px);
          background-size: 32px 32px;
          opacity: 0.16;
          pointer-events: none;
        }

        /* -----------------------------------------------------------------------
           LAYER 2: FLOWING SINE WAVE LINES (Horizontal & Dash travel)
           ----------------------------------------------------------------------- */
        .lgb-waves-layer {
          position: absolute;
          inset: 0;
          z-index: 4;
          overflow: hidden;
        }
        .lgb-wave-svg {
          width: 100%;
          height: 100%;
          display: block;
        }

        @keyframes lgbWaveTravelTop {
          0% { stroke-dashoffset: 0; transform: translateX(0); }
          50% { transform: translateX(20px); }
          100% { stroke-dashoffset: -1200; transform: translateX(0); }
        }
        @keyframes lgbWaveTravelMid {
          0% { stroke-dashoffset: 0; transform: translateX(0); }
          50% { transform: translateX(-25px); }
          100% { stroke-dashoffset: 1200; transform: translateX(0); }
        }
        @keyframes lgbWaveTravelBot {
          0% { stroke-dashoffset: 0; transform: translateX(0); }
          50% { transform: translateX(18px); }
          100% { stroke-dashoffset: -1200; transform: translateX(0); }
        }

        .lgb-wave-line {
          fill: none;
        }
        .lgb-wave-top {
          stroke-dasharray: 400 800;
          animation: lgbWaveTravelTop 26s linear infinite;
        }
        .lgb-wave-mid {
          stroke-dasharray: 350 850;
          animation: lgbWaveTravelMid 32s linear infinite;
        }
        .lgb-wave-bot {
          stroke-dasharray: 380 820;
          animation: lgbWaveTravelBot 30s linear infinite;
        }

        /* -----------------------------------------------------------------------
           LAYER 4B: CONCENTRIC HEARTBEAT PULSE RINGS
           ----------------------------------------------------------------------- */
        .lgb-pulse-rings-layer {
          position: absolute;
          inset: 0;
          z-index: 5;
          overflow: hidden;
        }
        .lgb-ring-emitter {
          position: absolute;
          pointer-events: none;
        }
        .lgb-emitter-left {
          top: 46%;
          left: 20%;
        }
        .lgb-emitter-right {
          bottom: 14%;
          right: 16%;
        }

        .lgb-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          pointer-events: none;
        }

        @keyframes lgbRingExpandTeal {
          0% {
            width: 100px;
            height: 100px;
            opacity: 0.35;
            border: 1.5px solid rgba(47, 143, 131, 0.4);
          }
          100% {
            width: 520px;
            height: 520px;
            opacity: 0;
            border: 1px solid rgba(47, 143, 131, 0);
          }
        }

        @keyframes lgbRingExpandCoral {
          0% {
            width: 80px;
            height: 80px;
            opacity: 0.30;
            border: 1.5px solid rgba(255, 122, 89, 0.35);
          }
          100% {
            width: 440px;
            height: 440px;
            opacity: 0;
            border: 1px solid rgba(255, 122, 89, 0);
          }
        }

        .lgb-ring-1 {
          animation: lgbRingExpandTeal 9s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }
        .lgb-ring-2 {
          animation: lgbRingExpandTeal 9s cubic-bezier(0.16, 1, 0.3, 1) 3s infinite;
        }
        .lgb-ring-3 {
          animation: lgbRingExpandTeal 9s cubic-bezier(0.16, 1, 0.3, 1) 6s infinite;
        }

        .lgb-ring-coral-1 {
          animation: lgbRingExpandCoral 11s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }
        .lgb-ring-coral-2 {
          animation: lgbRingExpandCoral 11s cubic-bezier(0.16, 1, 0.3, 1) 5.5s infinite;
        }

        /* -----------------------------------------------------------------------
           LAYER 3: PERIPHERAL MEDICAL ICONS (0.05 - 0.08 Opacity, Teal Outline)
           ----------------------------------------------------------------------- */
        .lgb-icon-pattern {
          position: absolute;
          inset: 0;
          z-index: 6;
          overflow: hidden;
        }
        .lgb-icon-wrap {
          position: absolute;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }
        .lgb-med-icon {
          display: block;
          opacity: 0.07;
          filter: drop-shadow(0 0 2px rgba(47, 143, 131, 0.2));
        }

        @keyframes lgbIconFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .lgb-float-slow {
          animation: lgbIconFloat 8s ease-in-out infinite;
        }

        /* -----------------------------------------------------------------------
           LAYER 4A: RISING FLOATING PARTICLES (Teal, Coral, Sky)
           ----------------------------------------------------------------------- */
        .lgb-particles-layer {
          position: absolute;
          inset: 0;
          z-index: 7;
          overflow: hidden;
        }
        .lgb-particle {
          position: absolute;
          bottom: -20px;
          border-radius: 50%;
          pointer-events: none;
          animation: lgbParticleRise linear infinite;
        }
        .lgb-particle-teal {
          background-color: #2F8F83;
          box-shadow: 0 0 4px rgba(47, 143, 131, 0.4);
        }
        .lgb-particle-coral {
          background-color: #FF7A59;
          box-shadow: 0 0 4px rgba(255, 122, 89, 0.4);
        }
        .lgb-particle-sky {
          background-color: #38BDF8;
          box-shadow: 0 0 4px rgba(56, 189, 248, 0.4);
        }

        @keyframes lgbParticleRise {
          0% {
            transform: translateY(0) scale(0.7);
            opacity: 0;
          }
          15% {
            opacity: 0.42;
          }
          85% {
            opacity: 0.38;
          }
          100% {
            transform: translateY(-105vh) scale(1.1);
            opacity: 0;
          }
        }

        /* -----------------------------------------------------------------------
           LAYER 6B: FAINT GRAIN / TEXTURE (3% Opacity)
           ----------------------------------------------------------------------- */
        .lgb-grain-texture {
          position: absolute;
          inset: 0;
          z-index: 8;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.035'/%3E%3C/svg%3E");
          pointer-events: none;
        }

        /* -----------------------------------------------------------------------
           RESPONSIVE RULES (<768px): Hide icons, reduce particle count
           ----------------------------------------------------------------------- */
        @media (max-width: 767px) {
          .lgb-icon-pattern {
            display: none !important;
          }
          .lgb-particle-desktop-only {
            display: none !important;
          }
          .lgb-blob-teal {
            width: 380px;
            height: 380px;
          }
          .lgb-blob-mint {
            width: 400px;
            height: 400px;
          }
          .lgb-blob-sky {
            width: 360px;
            height: 360px;
          }
          .lgb-blob-peach {
            width: 340px;
            height: 340px;
          }
        }

        /* -----------------------------------------------------------------------
           PREFERS-REDUCED-MOTION: Turn off all animations
           ----------------------------------------------------------------------- */
        @media (prefers-reduced-motion: reduce) {
          .lgb-blob,
          .lgb-wave-top,
          .lgb-wave-mid,
          .lgb-wave-bot,
          .lgb-ring,
          .lgb-float-slow,
          .lgb-particle {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
};
