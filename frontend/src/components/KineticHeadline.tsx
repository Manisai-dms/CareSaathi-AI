// ==============================================================================
// CareSaathi AI - Kinetic Headline Component (Landing Hero H1 Only)
//
// Features:
// 1. Accessibility First: Single semantic <h1> with full sentence in aria-label,
//    visible children aria-hidden="true" in line > word > char spans.
// 2. Entrance Sequence (~1.8s):
//    - Line masks rise out of overflow:hidden (translateY 110% -> 0), 120ms line stagger.
//    - Characters stagger 18-22ms with soft spring and rotateX(-35deg -> 0).
//    - "Healthcare Costs." gradient sweep (teal -> sky).
//    - "Care You Can Trust." rose -> coral gradient, underline draws (scaleX 0 -> 1, 700ms)
//      with traveling bright highlight.
//    - One soft diagonal light sheen (12% opacity) passes across headline once, then removed.
// 3. Idle Behaviour:
//    - Slow gradient flow (8-10s ease-in-out).
//    - Heartbeat sync: "Care You Can Trust." and underline pulse (scale 1 -> 1.012 -> 1)
//      in time with the 3D heart's lub-dub (~72 cycles/min, ~0.833s period).
//    - Pointer interaction: characters within ~120px lift up to 6px (desktop only).
//    - Word hover color shift (150ms).
// 4. Reduced Motion & Performance:
//    - prefers-reduced-motion: simple 300ms opacity fade.
//    - will-change removed after entrance; rAF-throttled pointer tracking.
// ==============================================================================

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface WordConfig {
  text: string;
  type: 'ink' | 'teal-sky' | 'rose-coral';
}

interface LineConfig {
  words: WordConfig[];
}

const HEADLINE_LINES: LineConfig[] = [
  {
    words: [
      { text: 'Understand', type: 'ink' },
      { text: 'Your', type: 'ink' },
      { text: 'Healthcare', type: 'teal-sky' },
      { text: 'Costs.', type: 'teal-sky' }
    ]
  },
  {
    words: [
      { text: 'Find', type: 'ink' },
      { text: 'Care', type: 'rose-coral' },
      { text: 'You', type: 'rose-coral' },
      { text: 'Can', type: 'rose-coral' },
      { text: 'Trust.', type: 'rose-coral' }
    ]
  }
];

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
  const [isHoveringHeadline, setIsHoveringHeadline] = useState<boolean>(false);
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

  // 2. Intersection Observer to pause heartbeat / interaction when off-screen
  useEffect(() => {
    const el = h1Ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 3. Entrance lifecycle and sheen cleanup (~1.8s)
  useEffect(() => {
    if (prefersReducedMotion) {
      if (onSequenceComplete) onSequenceComplete();
      return;
    }

    const timer = setTimeout(() => {
      setIsEntranceActive(false);
      setShowSheen(false);
      if (onSequenceComplete) onSequenceComplete();
    }, 1850);

    return () => clearTimeout(timer);
  }, [prefersReducedMotion, onSequenceComplete]);

  // 4. Pointer Interaction (Desktop only: characters within ~120px lift up to 6px)
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLHeadingElement>) => {
    if (prefersReducedMotion || !isIntersecting) return;
    if (window.matchMedia('(pointer: coarse)').matches) return; // Touch devices excluded

    if (rafId.current) cancelAnimationFrame(rafId.current);

    const clientX = e.clientX;
    const clientY = e.clientY;

    rafId.current = requestAnimationFrame(() => {
      const radius = 120;
      const maxLift = 6;

      Object.values(charRefs.current).forEach(charEl => {
        if (!charEl) return;
        const rect = charEl.getBoundingClientRect();
        const charCenterX = rect.left + rect.width / 2;
        const charCenterY = rect.top + rect.height / 2;

        const dist = Math.hypot(clientX - charCenterX, clientY - charCenterY);

        if (dist < radius) {
          const factor = 1 - dist / radius;
          // Smooth bell-curve lift
          const lift = -maxLift * Math.sin((factor * Math.PI) / 2);
          charEl.style.transform = `translateY(${lift.toFixed(2)}px)`;
        } else {
          charEl.style.transform = 'translateY(0px)';
        }
      });
    });
  }, [prefersReducedMotion, isIntersecting]);

  const handlePointerLeave = useCallback(() => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    setIsHoveringHeadline(false);
    Object.values(charRefs.current).forEach(charEl => {
      if (charEl) {
        charEl.style.transform = 'translateY(0px)';
      }
    });
  }, []);

  const handlePointerEnter = useCallback(() => {
    if (!window.matchMedia('(pointer: coarse)').matches) {
      setIsHoveringHeadline(true);
    }
  }, []);

  // Compute character stagger delays
  let totalCharIndex = 0;

  return (
    <h1
      ref={h1Ref}
      aria-label="Understand Your Healthcare Costs. Find Care You Can Trust."
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className={`hero-kinetic-h1 ${className}`}
      style={{
        fontFamily: "Georgia, 'Plus Jakarta Sans', serif",
        fontSize: 'clamp(2.3rem, 4.2vw, 3.5rem)',
        fontWeight: 700,
        lineHeight: 1.16,
        letterSpacing: '-0.025em',
        color: '#102A36',
        margin: '0 0 18px 0',
        position: 'relative',
        cursor: isHoveringHeadline ? 'pointer' : 'default',
        userSelect: 'none',
        ...style
      }}
    >
      {/* Visual Content: All spans aria-hidden="true" for screen reader accessibility */}
      <div
        aria-hidden="true"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          position: 'relative',
          width: '100%'
        }}
      >
        {HEADLINE_LINES.map((line, lineIdx) => {
          const lineDelay = lineIdx * 120; // 120ms between lines

          return (
            <div
              key={`line-${lineIdx}`}
              className="kinetic-line-mask"
              style={{
                overflow: 'hidden',
                paddingBottom: '0.14em',
                marginBottom: '-0.14em',
                perspective: '1000px',
                display: 'block',
                position: 'relative'
              }}
            >
              <div
                className={`kinetic-line-inner ${isEntranceActive ? 'entering' : ''}`}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'baseline',
                  rowGap: '4px',
                  columnGap: '0.28em',
                  animationDelay: `${lineDelay}ms`,
                  willChange: isEntranceActive ? 'transform' : 'auto'
                }}
              >
                {line.words.map((word, wordIdx) => {
                  const isTealSky = word.type === 'teal-sky';
                  const isRoseCoral = word.type === 'rose-coral';
                  const wordKey = `l${lineIdx}-w${wordIdx}`;

                  return (
                    <span
                      key={wordKey}
                      className={`kinetic-word-wrapper ${word.type} ${isRoseCoral && lineIdx === 1 ? 'heartbeat-target' : ''}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'baseline',
                        whiteSpace: 'nowrap',
                        position: 'relative',
                        transition: 'color 0.15s ease, filter 0.15s ease'
                      }}
                    >
                      {/* Character spans */}
                      {word.text.split('').map((char, charInWordIdx) => {
                        totalCharIndex++;
                        const charKey = `${wordKey}-c${charInWordIdx}`;
                        const charDelay = prefersReducedMotion
                          ? 0
                          : lineDelay + (charInWordIdx + (wordIdx * 6)) * 20;

                        return (
                          <span
                            key={charKey}
                            ref={el => { charRefs.current[charKey] = el; }}
                            className={`kinetic-char ${isEntranceActive ? 'char-entering' : ''} ${isTealSky ? 'gradient-teal' : ''} ${isRoseCoral ? 'gradient-rose' : ''}`}
                            style={{
                              display: 'inline-block',
                              transformOrigin: '50% 100%',
                              animationDelay: `${charDelay}ms`,
                              transition: isEntranceActive ? 'none' : 'transform 0.18s cubic-bezier(0.2, 0.9, 0.4, 1.2)',
                              willChange: isEntranceActive ? 'transform, opacity' : 'auto'
                            }}
                          >
                            {char}
                          </span>
                        );
                      })}

                      {/* Underline for the final "Care You Can Trust." phrase */}
                      {lineIdx === 1 && wordIdx === line.words.length - 1 && (
                        <span
                          className={`kinetic-underline-anchor ${isEntranceActive ? 'underline-drawing' : ''} ${isIntersecting && !prefersReducedMotion ? 'underline-pulsing' : ''}`}
                          style={{
                            position: 'absolute',
                            left: '-3.2em', // Spans back to cover "Care You Can Trust."
                            right: 0,
                            bottom: '0px',
                            height: '3px',
                            background: 'linear-gradient(90deg, #D6334B 0%, #FF7A59 100%)',
                            borderRadius: '2px',
                            transformOrigin: 'left',
                            pointerEvents: 'none'
                          }}
                        >
                          {/* Single traveling bright highlight during entrance */}
                          {isEntranceActive && !prefersReducedMotion && (
                            <span
                              className="underline-highlight-sweep"
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '28px',
                                height: '100%',
                                background: 'linear-gradient(90deg, transparent 0%, #FFFFFF 50%, transparent 100%)',
                                borderRadius: '2px',
                                filter: 'blur(0.5px)'
                              }}
                            />
                          )}
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Diagonal Soft Light Sheen Sweep across headline (12% opacity, removed after entrance) */}
      {showSheen && !prefersReducedMotion && (
        <div
          className="kinetic-headline-sheen"
          style={{
            position: 'absolute',
            inset: '-10% -20%',
            pointerEvents: 'none',
            zIndex: 10,
            overflow: 'hidden'
          }}
          aria-hidden="true"
        >
          <div className="sheen-glare-band" />
        </div>
      )}

      {/* Scoped CSS Styles & Keyframes */}
      <style>{`
        /* 1. Line Mask Rise Entrance */
        @keyframes lineRise {
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

        .kinetic-line-inner.entering {
          animation: lineRise 0.75s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        /* 2. Character Soft Spring Stagger Entrance */
        @keyframes charSpring {
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

        .kinetic-char.char-entering {
          animation: charSpring 0.68s cubic-bezier(0.175, 0.885, 0.32, 1.15) both;
        }

        /* 3. Gradient Styles with Slow Idle Flow */
        @keyframes gradientFlowTeal {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes gradientFlowRose {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .kinetic-char.gradient-teal {
          background: linear-gradient(135deg, #1F7A70 0%, #246BB5 50%, #1F7A70 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
          animation: gradientFlowTeal 9s ease-in-out infinite alternate;
        }

        .kinetic-char.gradient-rose {
          background: linear-gradient(135deg, #D6334B 0%, #D95338 50%, #D6334B 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
          animation: gradientFlowRose 9s ease-in-out infinite alternate;
        }

        /* 4. Heartbeat Sync Lub-Dub Pulse (~72 cycles/min -> 0.833s period) */
        @keyframes heartPulseSync {
          0% { transform: scale(1); }
          6% { transform: scale(1.012); }
          13% { transform: scale(1); }
          22% { transform: scale(1.008); }
          32% { transform: scale(1); }
          100% { transform: scale(1); }
        }

        .heartbeat-target {
          transform-origin: 50% 80%;
          animation: heartPulseSync 0.833s cubic-bezier(0.25, 1, 0.5, 1) infinite;
        }

        /* 5. Underline Entrance Draw & Traveling Highlight */
        @keyframes underlineDraw {
          0% {
            transform: scaleX(0);
          }
          100% {
            transform: scaleX(1);
          }
        }

        .kinetic-underline-anchor.underline-drawing {
          animation: underlineDraw 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.85s both;
        }

        @keyframes sweepHighlight {
          0% { left: 0%; opacity: 0; }
          15% { opacity: 0.9; }
          85% { opacity: 0.9; }
          100% { left: 100%; opacity: 0; }
        }

        .underline-highlight-sweep {
          animation: sweepHighlight 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.85s both;
        }

        .kinetic-underline-anchor.underline-pulsing {
          transform-origin: 50% 50%;
          animation: heartPulseSync 0.833s cubic-bezier(0.25, 1, 0.5, 1) infinite;
        }

        /* 6. Diagonal Sheen Across Entire Headline */
        @keyframes sheenPass {
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

        .sheen-glare-band {
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
          animation: sheenPass 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.65s both;
        }

        /* 7. Hover Micro-Interaction */
        .kinetic-word-wrapper.ink:hover {
          color: #1F7A70;
        }

        .kinetic-word-wrapper.teal-sky:hover {
          filter: brightness(1.08);
        }

        .kinetic-word-wrapper.rose-coral:hover {
          filter: brightness(1.08);
        }

        /* 8. Reduced Motion Overrides */
        @media (prefers-reduced-motion: reduce) {
          .kinetic-line-inner,
          .kinetic-char,
          .heartbeat-target,
          .kinetic-underline-anchor,
          .underline-highlight-sweep,
          .sheen-glare-band {
            animation: none !important;
            transform: none !important;
            opacity: 1 !important;
          }
          .kinetic-headline-sheen {
            display: none !important;
          }
          .hero-kinetic-h1 {
            opacity: 1;
            animation: fadeInSimple 0.3s ease-out both;
          }
          @keyframes fadeInSimple {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        }
      `}</style>
    </h1>
  );
};
