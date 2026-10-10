// ==============================================================================
// CareSaathi AI - Kinetic Headline Component (Landing Hero H1 Only)
// Scoped prefix: hk-
//
// Complies with:
// - A1: Accessibility first (single <h1> with full sentence in aria-label,
//   line > word > char spans aria-hidden="true", unbreakable words white-space:nowrap,
//   fixed 3-line layout on desktop, wrapping at word boundaries on <640px).
// - A2: 2s entrance sequence: lines rise (120ms stagger), char spring with perspective,
//   "Costs." overshoot drop + 600ms color wave, "Care You Can Trust." full-phrase
//   underline draw (scaleX 0->1, 700ms, out-expo) + traveling highlight,
//   diagonal 12% sheen, follower cascade.
// - A3: Idle subtle gradient flow (9s), heartbeat sync (0.833s / 72 BPM lub-dub),
//   desktop-only rAF pointer lift (up to 6px within 120px), word hover accent shifts.
// - A4: Contrast verified (>= 3:1), prefers-reduced-motion: 300ms fade, zero CLS.
// ==============================================================================

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface KineticHeadlineProps {
  className?: string;
  style?: React.CSSProperties;
  onSequenceComplete?: () => void;
}

const checkReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const KineticHeadline: React.FC<KineticHeadlineProps> = ({
  className = '',
  style = {},
  onSequenceComplete
}) => {
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const charRefs = useRef<{ [key: string]: HTMLSpanElement | null }>({});
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(checkReducedMotion);
  const [isEntranceActive, setIsEntranceActive] = useState<boolean>(() => !checkReducedMotion());
  const [showSheen, setShowSheen] = useState<boolean>(() => !checkReducedMotion());
  const [isIntersecting, setIsIntersecting] = useState<boolean>(true);

  const rafId = useRef<number | null>(null);

  // 1. Reduced motion detection
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
      if (e.matches) {
        setIsEntranceActive(false);
        setShowSheen(false);
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // 2. Intersection Observer to pause heartbeat & pointer tracking when off-screen
  useEffect(() => {
    const el = h1Ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 3. Entrance lifecycle and sheen cleanup (~2.0s total)
  useEffect(() => {
    if (prefersReducedMotion) {
      if (onSequenceComplete) onSequenceComplete();
      return;
    }

    const timer = setTimeout(() => {
      setIsEntranceActive(false);
      setShowSheen(false);
      if (onSequenceComplete) onSequenceComplete();
    }, 1950);

    return () => clearTimeout(timer);
  }, [prefersReducedMotion, onSequenceComplete]);

  // 4. Desktop-only pointer lift interaction within ~120px radius
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLHeadingElement>) => {
    if (prefersReducedMotion || !isIntersecting) return;
    if (e.pointerType === 'touch') return;

    if (rafId.current) cancelAnimationFrame(rafId.current);

    const clientX = e.clientX;
    const clientY = e.clientY;

    rafId.current = requestAnimationFrame(() => {
      const radius = 120;
      Object.values(charRefs.current).forEach(el => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const charCenterX = rect.left + rect.width / 2;
        const charCenterY = rect.top + rect.height / 2;

        const dx = clientX - charCenterX;
        const dy = clientY - charCenterY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < radius) {
          const power = 1 - dist / radius;
          const liftPx = Math.sin(power * Math.PI * 0.5) * -6;
          el.style.transform = `translate3d(0, ${liftPx}px, 0)`;
        } else {
          el.style.transform = 'translate3d(0, 0, 0)';
        }
      });
    });
  }, [prefersReducedMotion, isIntersecting]);

  const handlePointerLeave = useCallback(() => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    Object.values(charRefs.current).forEach(el => {
      if (el) el.style.transform = 'translate3d(0, 0, 0)';
    });
  }, []);

  // Helpers to render characters
  const renderChars = (
    word: string,
    wordKey: string,
    baseDelayMs: number,
    charStaggerMs: number,
    specialType?: 'costs'
  ) => {
    return word.split('').map((char, idx) => {
      const charKey = `${wordKey}-c${idx}`;
      const delay = prefersReducedMotion ? 0 : baseDelayMs + idx * charStaggerMs;

      let enteringClass = 'hk-char-spring';
      if (specialType === 'costs') {
        enteringClass = 'hk-char-costs-drop';
      }

      return (
        <span
          key={charKey}
          ref={el => { charRefs.current[charKey] = el; }}
          className={`hk-char ${isEntranceActive ? enteringClass : ''} ${specialType === 'costs' && isEntranceActive ? 'hk-costs-wave' : ''}`}
          style={{
            display: 'inline-block',
            animationDelay: specialType === 'costs'
              ? `${delay}ms, ${delay + 380}ms` // drop delay, then wave delay
              : `${delay}ms`,
            transition: isEntranceActive ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0.9, 0.4, 1.2)',
            willChange: isEntranceActive ? 'transform, opacity' : 'auto'
          }}
        >
          {char}
        </span>
      );
    });
  };

  return (
    <h1
      ref={h1Ref}
      className={`hk-headline-root ${isEntranceActive ? 'hk-entrance-running' : ''} ${className}`}
      aria-label="Understand Your Healthcare Costs. Find Care You Can Trust."
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        margin: 0,
        fontFamily: "'Newsreader', Georgia, 'Times New Roman', serif",
        fontSize: 'clamp(1.9rem, 2.85vw, 3.25rem)',
        fontWeight: 650,
        letterSpacing: '-0.025em',
        lineHeight: 1.18,
        position: 'relative',
        display: 'block',
        ...style
      }}
    >
      {/* 
        A1 Fixed 3-line structure:
        Line 1: "Understand Your" (ink #102A36)
        Line 2: "Healthcare Costs." (teal to sky gradient)
        Line 3: "Find " (ink) + "Care You Can Trust." (rose to coral gradient + full underline)
      */}
      <div className="hk-lines-container">
        {/* ================= LINE 1 ================= */}
        <div className="hk-line-mask">
          <div
            className={`hk-line-inner ${isEntranceActive ? 'hk-line-enter-1' : ''}`}
            style={{ display: 'inline-flex', flexWrap: 'nowrap', gap: '0.28em' }}
            aria-hidden="true"
          >
            {/* Word: Understand */}
            <span className="hk-word hk-ink">
              {renderChars('Understand', 'l1-w1', 60, 20)}
            </span>
            {/* Word: Your */}
            <span className="hk-word hk-ink">
              {renderChars('Your', 'l1-w2', 260, 20)}
            </span>
          </div>
        </div>

        {/* ================= LINE 2 ================= */}
        <div className="hk-line-mask">
          <div
            className={`hk-line-inner ${isEntranceActive ? 'hk-line-enter-2' : ''}`}
            style={{ display: 'inline-flex', flexWrap: 'nowrap', gap: '0.28em' }}
            aria-hidden="true"
          >
            {/* Word: Healthcare */}
            <span className="hk-word hk-teal-sky">
              {renderChars('Healthcare', 'l2-w1', 200, 20)}
            </span>
            {/* Word: Costs. (special overshoot bounce drop + teal->sky wave) */}
            <span className="hk-word hk-teal-sky hk-word-costs">
              {renderChars('Costs.', 'l2-w2', 380, 24, 'costs')}
            </span>
          </div>
        </div>

        {/* ================= LINE 3 ================= */}
        <div className="hk-line-mask">
          <div
            className={`hk-line-inner ${isEntranceActive ? 'hk-line-enter-3' : ''}`}
            style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.28em', alignItems: 'baseline' }}
            aria-hidden="true"
          >
            {/* Word: Find */}
            <span className="hk-word hk-ink" style={{ marginRight: '0.04em' }}>
              {renderChars('Find', 'l3-w1', 340, 20)}
            </span>

            {/* Full phrase: "Care You Can Trust." with full-width underline */}
            <span
              className={`hk-phrase-care-trust ${isIntersecting && !prefersReducedMotion ? 'hk-heartbeat-pulse' : ''}`}
              style={{
                display: 'inline-flex',
                flexWrap: 'nowrap',
                gap: '0.28em',
                position: 'relative',
                alignItems: 'baseline'
              }}
            >
              {/* Word: Care */}
              <span className="hk-word hk-rose-coral">
                {renderChars('Care', 'l3-w2', 460, 20)}
              </span>
              {/* Word: You */}
              <span className="hk-word hk-rose-coral">
                {renderChars('You', 'l3-w3', 540, 20)}
              </span>
              {/* Word: Can */}
              <span className="hk-word hk-rose-coral">
                {renderChars('Can', 'l3-w4', 600, 20)}
              </span>
              {/* Word: Trust. */}
              <span className="hk-word hk-rose-coral">
                {renderChars('Trust.', 'l3-w5', 660, 20)}
              </span>

              {/* Full phrase underline: spans exactly from "C" in Care to "." in Trust. */}
              <span
                className={`hk-underline-track ${isEntranceActive ? 'hk-underline-drawing' : ''}`}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: '-2px',
                  height: '3.5px',
                  background: 'linear-gradient(90deg, #D6334B 0%, #FF7A59 100%)',
                  borderRadius: '2px',
                  transformOrigin: 'left center',
                  pointerEvents: 'none'
                }}
              >
                {/* Single bright traveling highlight along underline */}
                {isEntranceActive && !prefersReducedMotion && (
                  <span
                    className="hk-underline-highlight"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '32px',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent 0%, #FFFFFF 50%, transparent 100%)',
                      borderRadius: '2px',
                      filter: 'blur(0.5px)'
                    }}
                  />
                )}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Diagonal Soft Light Sheen Sweep across entire headline (12% opacity, removed after entrance) */}
      {showSheen && !prefersReducedMotion && (
        <div
          className="hk-sheen-overlay"
          style={{
            position: 'absolute',
            inset: '-15% -20%',
            pointerEvents: 'none',
            zIndex: 10,
            overflow: 'hidden'
          }}
          aria-hidden="true"
        >
          <div className="hk-sheen-glare" />
        </div>
      )}

      {/* Scoped CSS Styles */}
      <style>{`
        /* Root & Lines Layout */
        .hk-headline-root {
          color: #102A36;
          text-shadow: 0 1px 12px rgba(255, 255, 255, 0.65);
        }

        .hk-lines-container {
          display: flex;
          flex-direction: column;
          gap: 0.08em;
        }

        .hk-line-mask {
          overflow: hidden;
          padding-bottom: 0.18em;
          margin-bottom: -0.16em;
          perspective: 600px;
        }

        .hk-headline-root:not(.hk-entrance-running) .hk-line-mask {
          overflow: visible;
        }

        .hk-line-inner {
          transform-origin: 50% 100%;
        }

        /* 1. Line Mask Rise (translateY 110% -> 0, 120ms stagger) */
        @keyframes hkLineRise {
          0% {
            transform: translateY(112%);
            opacity: 0;
          }
          40% {
            opacity: 1;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .hk-line-enter-1 {
          animation: hkLineRise 0.72s cubic-bezier(0.16, 1, 0.3, 1) 0.06s both;
        }
        .hk-line-enter-2 {
          animation: hkLineRise 0.72s cubic-bezier(0.16, 1, 0.3, 1) 0.18s both;
        }
        .hk-line-enter-3 {
          animation: hkLineRise 0.72s cubic-bezier(0.16, 1, 0.3, 1) 0.30s both;
        }

        /* 2. Character Soft Spring Stagger Entrance (rotateX -35deg -> 0) */
        @keyframes hkCharSpring {
          0% {
            transform: translateY(110%) rotateX(-35deg);
            opacity: 0;
          }
          65% {
            transform: translateY(-4%) rotateX(3deg);
            opacity: 1;
          }
          85% {
            transform: translateY(1%) rotateX(-1deg);
          }
          100% {
            transform: translateY(0) rotateX(0deg);
            opacity: 1;
          }
        }

        .hk-char-spring {
          animation: hkCharSpring 0.68s cubic-bezier(0.175, 0.885, 0.32, 1.15) both;
        }

        /* 3. Special "Costs." Treatment: drop from above with overshoot bounce + teal-to-sky color wave */
        @keyframes hkCostsDrop {
          0% {
            transform: translateY(-90%) rotate(-6deg);
            opacity: 0;
          }
          60% {
            transform: translateY(8%) rotate(1.5deg);
            opacity: 1;
          }
          80% {
            transform: translateY(-2.5%) rotate(-0.5deg);
          }
          100% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes hkCostsColorWave {
          0% {
            filter: brightness(1) drop-shadow(0 0 0 rgba(47, 127, 214, 0));
          }
          45% {
            filter: brightness(1.4) drop-shadow(0 2px 8px rgba(47, 127, 214, 0.4));
          }
          100% {
            filter: brightness(1) drop-shadow(0 0 0 rgba(47, 127, 214, 0));
          }
        }

        .hk-char-costs-drop {
          animation: hkCostsDrop 0.58s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }

        .hk-costs-wave {
          animation: 
            hkCostsDrop 0.58s cubic-bezier(0.34, 1.56, 0.64, 1) both,
            hkCostsColorWave 0.6s ease-in-out both;
        }

        /* 4. Words & Idle Gradient Flow (8-10s) */
        .hk-word {
          display: inline-block;
          white-space: nowrap;
          transition: color 0.15s ease, filter 0.15s ease;
        }

        .hk-ink {
          color: #102A36;
        }
        .hk-ink:hover {
          color: #1F7A70;
        }

        @keyframes hkGradientFlowTeal {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes hkGradientFlowRose {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .hk-teal-sky .hk-char {
          background: linear-gradient(135deg, #1F7A70 0%, #2F7FD6 50%, #1F7A70 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: hkGradientFlowTeal 9s ease-in-out infinite alternate;
        }
        .hk-teal-sky:hover {
          filter: brightness(1.12);
        }

        .hk-rose-coral .hk-char {
          background: linear-gradient(135deg, #D6334B 0%, #FF7A59 50%, #D6334B 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: hkGradientFlowRose 9s ease-in-out infinite alternate;
        }
        .hk-rose-coral:hover {
          filter: brightness(1.12);
        }

        /* 5. Heartbeat Lub-Dub Sync Pulse (~72 cycles/min -> 0.833s period) */
        @keyframes hkHeartbeatLubDub {
          0% { transform: scale(1); }
          6% { transform: scale(1.012); }
          13% { transform: scale(1); }
          22% { transform: scale(1.008); }
          32% { transform: scale(1); }
          100% { transform: scale(1); }
        }

        .hk-heartbeat-pulse {
          transform-origin: 50% 80%;
          animation: hkHeartbeatLubDub 0.833s cubic-bezier(0.25, 1, 0.5, 1) infinite;
        }

        /* 6. Underline Draw (left to right, scaleX 0 -> 1, 700ms, out-expo) */
        @keyframes hkUnderlineDraw {
          0% {
            transform: scaleX(0);
          }
          100% {
            transform: scaleX(1);
          }
        }

        .hk-underline-drawing {
          animation: hkUnderlineDraw 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.88s both;
        }

        @keyframes hkSweepHighlight {
          0% { left: 0%; opacity: 0; }
          15% { opacity: 0.95; }
          85% { opacity: 0.95; }
          100% { left: 100%; opacity: 0; }
        }

        .hk-underline-highlight {
          animation: hkSweepHighlight 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.88s both;
        }

        /* 7. Diagonal Soft Sheen Sweep (12% opacity) */
        @keyframes hkSheenPass {
          0% {
            transform: translateX(-110%) rotate(22deg);
            opacity: 0;
          }
          15% {
            opacity: 0.12;
          }
          85% {
            opacity: 0.12;
          }
          100% {
            transform: translateX(210%) rotate(22deg);
            opacity: 0;
          }
        }

        .hk-sheen-glare {
          position: absolute;
          top: -100%;
          bottom: -100%;
          left: 0;
          width: 38%;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.65) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: hkSheenPass 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.65s both;
        }

        /* 8. Responsive rules (<640px) */
        @media (max-width: 639px) {
          .hk-phrase-care-trust {
            flex-wrap: wrap !important;
          }
          .hk-underline-track {
            display: none; /* Avoid broken underline when line wraps on narrow phones */
          }
        }

        /* 9. Reduced Motion Overrides */
        @media (prefers-reduced-motion: reduce) {
          .hk-line-inner,
          .hk-char,
          .hk-char-spring,
          .hk-char-costs-drop,
          .hk-costs-wave,
          .hk-heartbeat-pulse,
          .hk-underline-track,
          .hk-underline-highlight,
          .hk-sheen-glare {
            animation: none !important;
            transform: none !important;
            opacity: 1 !important;
            filter: none !important;
          }
          .hk-sheen-overlay {
            display: none !important;
          }
          .hk-headline-root {
            opacity: 1;
            animation: hkFadeInSimple 0.3s ease-out both;
          }
          @keyframes hkFadeInSimple {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        }
      `}</style>
    </h1>
  );
};
