import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Activity, MapPin, ShieldCheck, ArrowRight, X } from 'lucide-react';

interface AnimatedIntroProps {
  onComplete: () => void;
}

export const AnimatedIntro: React.FC<AnimatedIntroProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(0);
  const [costCount, setCostCount] = useState<number>(0);
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (prefersReduced) {
      // If user prefers reduced motion, skip automatically after brief moment
      return;
    }

    // Timeline: 0 -> 1.8s (Step 0), 1.8s -> 3.6s (Step 1), 3.6s -> 5.4s (Step 2), 5.4s (Step 3: ready)
    const t1 = setTimeout(() => setStep(1), 1800);
    const t2 = setTimeout(() => setStep(2), 3600);
    const t3 = setTimeout(() => setStep(3), 5200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [prefersReduced]);

  // Animate count up in step 1
  useEffect(() => {
    if (step >= 1) {
      let start = 0;
      const end = 180000;
      const duration = 1200;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutQuart
        const ease = 1 - Math.pow(1 - progress, 4);
        setCostCount(Math.floor(start + (end - start) * ease));
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [step]);

  const handleFinish = () => {
    try {
      localStorage.setItem('caresaathi_intro_seen', 'true');
    } catch (e) {
      console.warn("Storage error", e);
    }
    onComplete();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#183247', // Deep Navy
      color: '#FAFAF7',
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px',
      overflow: 'hidden'
    }}>
      {/* Top Bar with Skip Button and Progress Bar */}
      <div style={{
        position: 'absolute',
        top: '24px',
        left: '24px',
        right: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Heart size={20} color="#438F84" fill="#438F84" />
          <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', color: '#FFFFFF' }}>
            CareSaathi <span style={{ color: '#438F84' }}>AI</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Progress Indicators */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                style={{
                  width: '28px',
                  height: '4px',
                  borderRadius: '2px',
                  backgroundColor: step >= i ? '#438F84' : 'rgba(255, 255, 255, 0.2)',
                  transition: 'background-color 0.4s ease'
                }}
              />
            ))}
          </div>

          {/* Skip Button */}
          <button
            onClick={handleFinish}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              borderRadius: '20px',
              padding: '6px 14px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>Skip Intro</span>
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Main Animation Stage */}
      <div style={{ maxWidth: '640px', width: '100%', textAlign: 'center', position: 'relative', minHeight: '360px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          {/* SCENE 0: Heartbeat line turning into a Rupee symbol */}
          {step === 0 && (
            <motion.div
              key="scene0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              {/* Animated ECG Pulse to Rupee SVG */}
              <div style={{
                width: '130px',
                height: '130px',
                borderRadius: '50%',
                backgroundColor: 'rgba(67, 143, 132, 0.15)',
                border: '2px solid #438F84',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '28px',
                position: 'relative'
              }}>
                <svg width="100" height="60" viewBox="0 0 100 60" fill="none">
                  <motion.path
                    d="M 5 30 L 25 30 L 35 10 L 45 50 L 55 20 L 65 35 L 75 30 L 95 30"
                    stroke="#438F84"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                  />
                </svg>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9, duration: 0.4, type: "spring" }}
                  style={{
                    position: 'absolute',
                    fontSize: '2.5rem',
                    fontWeight: 900,
                    color: '#E7F3EF'
                  }}
                >
                  ₹
                </motion.div>
              </div>

              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{ fontSize: '1.9rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '10px' }}
              >
                From Clinical Fear to Financial Clarity
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{ fontSize: '1rem', color: '#94A3B8', maxWidth: '480px', lineHeight: 1.5 }}
              >
                No Indian family should face an emergency hospital admission blind to the probable costs.
              </motion.p>
            </motion.div>
          )}

          {/* SCENE 1: Cost Range building up with statutory references */}
          {step === 1 && (
            <motion.div
              key="scene1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <div style={{
                backgroundColor: 'rgba(231, 243, 239, 0.1)',
                border: '1px solid rgba(67, 143, 132, 0.4)',
                borderRadius: '16px',
                padding: '24px 32px',
                marginBottom: '20px',
                width: '100%',
                maxWidth: '460px'
              }}>
                <div style={{ fontSize: '0.8rem', color: '#438F84', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                  Transparent Cost Range Building
                </div>
                <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#FFFFFF', margin: '8px 0' }}>
                  ₹0 — ₹{costCount.toLocaleString('en-IN')}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                  <span style={{ backgroundColor: '#183247', color: '#438F84', border: '1px solid #438F84', borderRadius: '4px', padding: '3px 8px', fontSize: '0.72rem', fontWeight: 600 }}>
                    NPPA S.O. 2668(E) Cap
                  </span>
                  <span style={{ backgroundColor: '#183247', color: '#438F84', border: '1px solid #438F84', borderRadius: '4px', padding: '3px 8px', fontSize: '0.72rem', fontWeight: 600 }}>
                    CGHS Gazette Rates
                  </span>
                  <span style={{ backgroundColor: '#183247', color: '#438F84', border: '1px solid #438F84', borderRadius: '4px', padding: '3px 8px', fontSize: '0.72rem', fontWeight: 600 }}>
                    PM-JAY HBP 2.2
                  </span>
                </div>
              </div>

              <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
                Evidence-Based Indicative Pricing
              </h2>
              <p style={{ fontSize: '0.95rem', color: '#94A3B8', maxWidth: '480px' }}>
                Transparent price bands grounded in statutory public healthcare benefit packages and hospital tariffs.
              </p>
            </motion.div>
          )}

          {/* SCENE 2: Map pins & count-up stats over Hyderabad */}
          {(step === 2 || step === 3) && (
            <motion.div
              key="scene2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}
            >
              {/* Graphic Stats Pill Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', width: '100%', marginBottom: '28px' }}>
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.07)',
                    border: '1px solid rgba(67, 143, 132, 0.3)',
                    borderRadius: '12px',
                    padding: '16px 12px'
                  }}
                >
                  <MapPin size={22} color="#438F84" style={{ marginBottom: '6px' }} />
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FFFFFF' }}>13+</div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Verified Hospitals in Hyderabad</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.07)',
                    border: '1px solid rgba(67, 143, 132, 0.3)',
                    borderRadius: '12px',
                    padding: '16px 12px'
                  }}
                >
                  <Activity size={22} color="#438F84" style={{ marginBottom: '6px' }} />
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FFFFFF' }}>14+</div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Canonical Medical Procedures</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.07)',
                    border: '1px solid rgba(67, 143, 132, 0.3)',
                    borderRadius: '12px',
                    padding: '16px 12px'
                  }}
                >
                  <ShieldCheck size={22} color="#438F84" style={{ marginBottom: '6px' }} />
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FFFFFF' }}>₹10L</div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Aarogyasri / PM-JAY Coverage</div>
                </motion.div>
              </div>

              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
                Know the Cost. Find the Care.
              </h2>
              <p style={{ fontSize: '0.95rem', color: '#94A3B8', marginBottom: '24px', maxWidth: '480px' }}>
                Compare government, charitable, and private facilities with public scheme eligibility navigation.
              </p>

              {/* Get Started Button */}
              <motion.button
                onClick={handleFinish}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  backgroundColor: '#438F84', // Teal
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '30px',
                  padding: '14px 36px',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 4px 16px rgba(67, 143, 132, 0.4)'
                }}
              >
                <span>Get Started</span>
                <ArrowRight size={18} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
