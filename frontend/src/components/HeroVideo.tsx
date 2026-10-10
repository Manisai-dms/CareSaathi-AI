import React, { useEffect, useRef, useState } from 'react';

// ==============================================================================
// CareSaathi AI - HeroVideo Component
//
// Mounted inside the landing page hero section behind hero text & CTA buttons.
//
// Layer Order (bottom to top):
// 1. Fallback Hospital Exterior Image (/images/hospital-exterior.jpg)
// 2. Poster Image (/videos/hospital-hero-poster.jpg) - if present
// 3. Hero Video (WebM / MP4) with 0.8s fade-in (opacity 0 -> 0.85) once ready
//
// Performance & Accessibility:
// - prefers-reduced-motion: reduce -> do not load video, show poster/fallback only
// - Screen width < 768px -> do not load video, show poster/fallback only
// - navigator.connection.saveData === true -> do not load video, show poster/fallback only
// - IntersectionObserver: pauses video when scrolled out of view, resumes when returned
// - Page visibility API: pauses video when browser tab is inactive, resumes when active
// - Non-blocking playback initiated after first paint
// - Graceful fallback: zero errors or blank frames if .mp4 / .webm / .jpg files are absent
// ==============================================================================

interface HeroVideoProps {
  className?: string;
  style?: React.CSSProperties;
}

export const HeroVideo: React.FC<HeroVideoProps> = ({ className, style }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Client capability & state management
  const [canLoadVideo, setCanLoadVideo] = useState<boolean>(false);
  const [isVideoReady, setIsVideoReady] = useState<boolean>(false);
  const [isVideoError, setIsVideoError] = useState<boolean>(false);
  const [posterError, setPosterError] = useState<boolean>(false);
  const [isInView, setIsInView] = useState<boolean>(true);
  const [isTabVisible, setIsTabVisible] = useState<boolean>(true);

  // 1. Capability checks on mount: reduced-motion, small screen (<768px), saveData
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkCapabilities = () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isMobile = window.innerWidth < 768;
      const isSaveData = Boolean(
        (navigator as { connection?: { saveData?: boolean } }).connection?.saveData === true
      );

      const allowVideo = !prefersReducedMotion && !isMobile && !isSaveData;
      setCanLoadVideo(allowVideo);
    };

    checkCapabilities();

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = () => checkCapabilities();
    const handleResize = () => checkCapabilities();

    if (motionQuery.addEventListener) {
      motionQuery.addEventListener('change', handleMotionChange);
    } else {
      motionQuery.addListener(handleMotionChange);
    }
    window.addEventListener('resize', handleResize);

    return () => {
      if (motionQuery.removeEventListener) {
        motionQuery.removeEventListener('change', handleMotionChange);
      } else {
        motionQuery.removeListener(handleMotionChange);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 2. IntersectionObserver: pause video when hero scrolled out of view, resume when returned
  useEffect(() => {
    if (!canLoadVideo || typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsInView(entry.isIntersecting);
      },
      {
        threshold: 0.05
      }
    );

    const currentEl = containerRef.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    return () => {
      if (currentEl) {
        observer.unobserve(currentEl);
      }
      observer.disconnect();
    };
  }, [canLoadVideo]);

  // 3. Tab visibility listener: pause when inactive, resume when active
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      setIsTabVisible(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // 4. Playback control: start after first paint, pause/play on visibility change
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || !canLoadVideo || isVideoError) return;

    // Ensure muted in code as required
    videoEl.muted = true;

    const shouldPlay = isInView && isTabVisible;

    if (shouldPlay) {
      // Start playback after first paint using requestAnimationFrame
      const rafId = requestAnimationFrame(() => {
        try {
          const playPromise = videoEl.play();
          if (playPromise !== undefined) {
            playPromise.catch((_err) => {
              // Silently handle if autoplay blocked or source missing; fallback remains visible
            });
          }
        } catch (_e) {
          // Gracefully caught
        }
      });
      return () => cancelAnimationFrame(rafId);
    } else {
      try {
        videoEl.pause();
      } catch (_e) {
        // Safe pause
      }
    }
  }, [canLoadVideo, isInView, isTabVisible, isVideoError]);

  return (
    <div
      ref={containerRef}
      className={`hero-video-container ${className || ''}`}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        ...style
      }}
      aria-hidden="true"
    >
      {/* Layer 1: Base Fallback Hospital Exterior Image (Always present directly behind video) */}
      <div
        className="hero-fallback-exterior-image"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          backgroundImage: "url('/images/hospital-exterior.jpg')",
          backgroundPosition: 'center 35%',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          opacity: 0.85
        }}
      />

      {/* Layer 1B: Poster Image (Overlay if available; hides cleanly on error if missing) */}
      {!posterError && (
        <img
          src="/videos/hospital-hero-poster.jpg"
          alt=""
          onError={() => setPosterError(true)}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 35%',
            opacity: 0.85,
            display: 'block'
          }}
        />
      )}

      {/* Layer 2: Video Player (Rendered only when motion & bandwidth constraints allow) */}
      {canLoadVideo && !isVideoError && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/videos/hospital-hero-poster.jpg"
          onCanPlay={() => setIsVideoReady(true)}
          onPlaying={() => setIsVideoReady(true)}
          onError={() => setIsVideoError(true)}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 3,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 35%',
            opacity: isVideoReady ? 0.85 : 0,
            transition: 'opacity 0.8s ease-in-out',
            display: 'block'
          }}
        >
          <source src="/videos/hospital-hero.webm" type="video/webm" onError={() => {/* safe fallback */}} />
          <source src="/videos/hospital-hero.mp4" type="video/mp4" onError={() => {/* safe fallback */}} />
        </video>
      )}
    </div>
  );
};
