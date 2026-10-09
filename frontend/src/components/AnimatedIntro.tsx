import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Activity, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  X, 
  Building2, 
  CheckCircle2, 
  Sparkles,
  Stethoscope,
  DollarSign
} from 'lucide-react';

interface AnimatedIntroProps {
  onComplete: () => void;
}

// Word-level kinetic typography data for the canonical headline
const HEADLINE_PARTS = [
  { text: "Know", highlight: false },
  { text: "the", highlight: false },
  { text: "Cost.", highlight: true, color: "#A7F3D0", bg: "rgba(167, 243, 208, 0.14)", border: "rgba(44, 140, 131, 0.6)", glow: "rgba(44, 140, 131, 0.3)" },
  { text: "Find", highlight: false },
  { text: "the", highlight: false },
  { text: "Care.", highlight: true, color: "#5EEAD4", bg: "rgba(94, 234, 212, 0.14)", border: "rgba(20, 184, 166, 0.6)", glow: "rgba(20, 184, 166, 0.3)" },
  { text: "Discover", highlight: false },
  { text: "the", highlight: false },
  { text: "Support.", highlight: true, color: "#FDE68A", bg: "rgba(253, 230, 138, 0.14)", border: "rgba(245, 158, 11, 0.6)", glow: "rgba(245, 158, 11, 0.3)" }
];

export const AnimatedIntro: React.FC<AnimatedIntroProps> = ({ onComplete }) => {
  const [activeProcedureIdx, setActiveProcedureIdx] = useState<number>(0);
  const [bpmCounter, setBpmCounter] = useState<number>(72);
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Real procedures for the live interactive tariff preview
  const PREVIEW_PROCEDURES = [
    {
      name: "Total Knee Replacement (TKR)",
      category: "Orthopedics & Joint Arthroplasty",
      govt: "₹0 (Cashless)",
      govtNote: "100% Free under Aarogyasri Trust",
      pvt: "₹1,35,000 — ₹2,80,000",
      pvtNote: "NABH Standard Multi-Specialty",
      premium: "₹2,10,000 — ₹4,20,000",
      premiumNote: "Apollo / AIG Quaternary Suites",
      scheme: "Aarogyasri / PM-JAY Empanelled",
      badge: "Surgical Package"
    },
    {
      name: "Cataract Eye Surgery (Phaco)",
      category: "Ophthalmology & Foldable IOL",
      govt: "₹0 (Free)",
      govtNote: "Sarojini Devi / Govt Eye Centers",
      pvt: "₹18,000 — ₹45,000",
      pvtNote: "Day-care Phacoemulsification",
      premium: "₹38,000 — ₹65,000",
      premiumNote: "LVPEI / Premium Laser Suites",
      scheme: "100% Cashless for BPL Food Security Cards",
      badge: "Day Care"
    },
    {
      name: "MRI Brain & Spine Scan",
      category: "Diagnostic & Contrast Imaging",
      govt: "₹0 — ₹1,500",
      govtNote: "State Teaching Hospitals (NIMS / Osmania)",
      pvt: "₹4,500 — ₹8,500",
      pvtNote: "1.5T / 3.0T High Resolution",
      premium: "₹8,000 — ₹12,500",
      premiumNote: "Continental / AIG Diagnostic Wings",
      scheme: "Covered with Inpatient Pre-Authorization",
      badge: "Diagnostics"
    },
    {
      name: "Diabetes Care & Blood Panel",
      category: "Endocrinology & Comprehensive Tests",
      govt: "₹0 (Free Diagnostics)",
      govtNote: "Primary & Tertiary Health Centers",
      pvt: "₹1,200 — ₹3,500",
      pvtNote: "Lipid, HbA1c, Renal Profile",
      premium: "₹3,500 — ₹6,500",
      premiumNote: "Executive Wellness Checkups",
      scheme: "State Subsidized Essential Medicine & Testing",
      badge: "Outpatient"
    }
  ];

  // Gentle rhythmic heartbeat simulation
  useEffect(() => {
    if (prefersReduced) return;
    const bpmInterval = setInterval(() => {
      setBpmCounter(prev => 70 + Math.floor(Math.random() * 5));
    }, 2800);
    return () => clearInterval(bpmInterval);
  }, [prefersReduced]);

  // Auto-cycle procedures every 4.2 seconds
  useEffect(() => {
    if (prefersReduced) return;
    const interval = setInterval(() => {
      setActiveProcedureIdx((prev) => (prev + 1) % PREVIEW_PROCEDURES.length);
    }, 4200);
    return () => clearInterval(interval);
  }, [prefersReduced]);

  const handleFinish = () => {
    try {
      localStorage.setItem('caresaathi_intro_seen', 'true');
    } catch (e) {
      console.warn("Storage error", e);
    }
    onComplete();
  };

  const activeProcedure = PREVIEW_PROCEDURES[activeProcedureIdx];

  // Floating ambient medical cross particles (Pure medical aesthetic, no neon)
  const PARTICLES = [
    { top: '15%', left: '8%', size: 14, duration: 6, delay: 0 },
    { top: '22%', right: '10%', size: 18, duration: 7, delay: 1 },
    { top: '65%', left: '12%', size: 12, duration: 8, delay: 2 },
    { top: '78%', right: '14%', size: 16, duration: 6.5, delay: 0.5 },
    { top: '45%', left: '4%', size: 10, duration: 9, delay: 1.5 },
    { top: '85%', left: '45%', size: 14, duration: 7.5, delay: 2.5 }
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="CareSaathi AI Welcome Screen"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#0C1E2D', // Deep Healthcare Midnight Navy
        color: '#F8FAF9',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px 24px',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}
    >
      {/* 1. Natural Clinical Ambient Glow (Warm Teal & Soft Mint, Zero Neon) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at 50% 25%, rgba(44, 140, 131, 0.28) 0%, rgba(12, 30, 45, 0) 60%),
            radial-gradient(circle at 12% 75%, rgba(44, 140, 131, 0.15) 0%, rgba(12, 30, 45, 0) 50%),
            radial-gradient(circle at 88% 30%, rgba(245, 158, 11, 0.08) 0%, rgba(12, 30, 45, 0) 45%)
          `,
          pointerEvents: 'none'
        }}
      />

      {/* Delicate Micro-Grid Texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          pointerEvents: 'none'
        }}
      />

      {/* Floating Gentle Medical Cross Elements */}
      {!prefersReduced && PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -18, 0],
            opacity: [0.2, 0.5, 0.2],
            rotate: [0, 90, 180]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            top: p.top,
            left: p.left,
            right: p.right,
            width: `${p.size}px`,
            height: `${p.size}px`,
            color: 'rgba(44, 140, 131, 0.35)',
            pointerEvents: 'none',
            fontSize: `${p.size}px`,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          +
        </motion.div>
      ))}

      {/* 2. Top Header Navigation: Brand + Live Vitals Monitor + Quick Skip */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1240px',
          width: '100%',
          margin: '0 auto',
          paddingBottom: '8px'
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'rgba(44, 140, 131, 0.22)',
              border: '2px solid #2C8C83',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 25px rgba(44, 140, 131, 0.45)'
            }}
          >
            <Heart size={24} color="#2C8C83" fill="#2C8C83" />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: '1.4rem', letterSpacing: '-0.02em', color: '#FFFFFF', lineHeight: 1.1 }}>
              CareSaathi <span style={{ color: '#2C8C83' }}>AI</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Statutory Healthcare Navigator
            </div>
          </div>
        </div>

        {/* Live Vitals Ticker Badge (Clinical Authenticity) */}
        <div
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(44, 140, 131, 0.4)',
            borderRadius: '24px',
            padding: '6px 16px',
            backdropFilter: 'blur(10px)'
          }}
          className="header-vitals-badge"
        >
          <style>{`
            @media (min-width: 768px) {
              .header-vitals-badge { display: flex !important; }
            }
          `}</style>
          <motion.div
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ duration: 0.85, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              boxShadow: '0 0 10px #10B981'
            }}
          />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#A7F3D0' }}>
            {bpmCounter} BPM Rhythm
          </span>
          <span style={{ color: '#64748B' }}>•</span>
          <span style={{ fontSize: '0.78rem', color: '#E2E8F0', fontWeight: 600 }}>
            28+ Facilities Across India Verified
          </span>
        </div>

        {/* Quick Skip to Sign In Button */}
        <button
          onClick={handleFinish}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#F8FAF9',
            borderRadius: '24px',
            padding: '8px 22px',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(8px)'
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.16)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
        >
          <span>Skip to Sign In</span>
          <X size={15} />
        </button>
      </div>

      {/* 3. Central Hero Stage: Concentric Heartbeat Wave + Kinetic Letter Typography */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1100px',
          width: '100%',
          margin: 'auto',
          padding: '16px 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        {/* Animated Concentric Heartbeat Centerpiece */}
        <div style={{ position: 'relative', width: '136px', height: '136px', marginBottom: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Concentric Ring 1 (Expansion Pulse) */}
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '2px solid rgba(44, 140, 131, 0.7)',
              pointerEvents: 'none'
            }}
          />

          {/* Concentric Ring 2 (Secondary Echo) */}
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0.1, 0.8] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.35 }}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '1.5px solid rgba(94, 234, 212, 0.8)',
              pointerEvents: 'none'
            }}
          />

          {/* Clinical Core Orb with Dynamic ECG SVG Path */}
          <div
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              backgroundColor: '#0F273D',
              border: '2.5px solid #2C8C83',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 35px rgba(44, 140, 131, 0.6)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* SVG ECG Waveform */}
            <svg width="88" height="52" viewBox="0 0 88 52" fill="none">
              <motion.path
                d="M 2 26 L 18 26 L 26 7 L 36 45 L 46 14 L 54 34 L 62 26 L 86 26"
                stroke="#2C8C83"
                strokeWidth="3.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                animate={{ pathLength: [0.15, 1, 0.15] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </svg>

            {/* Glowing Tracer Particle */}
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.3, 0.8] }}
              transition={{ duration: 1.1, repeat: Infinity }}
              style={{
                position: 'absolute',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#A7F3D0',
                boxShadow: '0 0 12px #A7F3D0'
              }}
            />
          </div>

          {/* Floating Orbiting Healthcare Badges */}
          <div
            style={{
              position: 'absolute',
              top: '-6px',
              right: '-48px',
              backgroundColor: 'rgba(15, 39, 61, 0.85)',
              border: '1.5px solid rgba(44, 140, 131, 0.7)',
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '0.74rem',
              fontWeight: 700,
              color: '#A7F3D0',
              backdropFilter: 'blur(8px)',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
            }}
          >
            🏛️ PM-JAY &amp; Aarogyasri
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '-6px',
              left: '-48px',
              backgroundColor: 'rgba(15, 39, 61, 0.85)',
              border: '1.5px solid rgba(44, 140, 131, 0.7)',
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '0.74rem',
              fontWeight: 700,
              color: '#5EEAD4',
              backdropFilter: 'blur(8px)',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
            }}
          >
            🏥 Pan-India Hospital Discovery
          </div>
        </div>

        {/* Clinical Mission Tag */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(44, 140, 131, 0.18)',
            border: '1px solid rgba(44, 140, 131, 0.5)',
            color: '#E7F3EF',
            padding: '6px 18px',
            borderRadius: '24px',
            fontSize: '0.82rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            marginBottom: '16px'
          }}
        >
          <Activity size={15} color="#2C8C83" />
          <span>Transparent Healthcare Intelligence for India</span>
        </motion.div>

        {/* KINETIC TYPOGRAPHY / LETTER & WORD ANIMATION */}
        {/* Exact Headline: "Know the Cost. Find the Care. Discover the Support." */}
        <div
          style={{
            fontSize: 'clamp(2.1rem, 5vw, 3.4rem)',
            fontWeight: 900,
            color: '#FFFFFF',
            lineHeight: 1.18,
            marginBottom: '16px',
            letterSpacing: '-0.03em',
            maxWidth: '960px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '8px 14px'
          }}
        >
          {HEADLINE_PARTS.map((w, idx) => (
            <motion.span
              key={idx}
              initial={{ opacity: 0, y: 22, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.1 + idx * 0.07,
                ease: [0.22, 1, 0.36, 1]
              }}
              whileHover={{ scale: 1.05, y: -2 }}
              style={w.highlight ? {
                color: w.color,
                backgroundColor: w.bg,
                border: `1.5px solid ${w.border}`,
                padding: '2px 14px',
                borderRadius: '12px',
                boxShadow: `0 0 22px ${w.glow}`,
                display: 'inline-block'
              } : {
                display: 'inline-block'
              }}
            >
              {w.text}
            </motion.span>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          style={{
            fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
            color: '#94A3B8',
            maxWidth: '720px',
            lineHeight: 1.6,
            marginBottom: '26px'
          }}
        >
          Compare verified statutory tariffs across <strong>Government</strong>, <strong>Private</strong>, and <strong>Premium</strong> hospitals. Unlock up to ₹10 Lakhs cashless coverage under official schemes with zero hidden surcharges.
        </motion.p>

        {/* 4. Live Interactive Healthcare Tariff Ticker with Smooth Animated Tab Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          style={{
            width: '100%',
            maxWidth: '820px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(44, 140, 131, 0.35)',
            borderRadius: '20px',
            padding: '20px 24px',
            marginBottom: '28px',
            backdropFilter: 'blur(14px)',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.35)'
          }}
        >
          {/* Interactive Procedure Selectors */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {PREVIEW_PROCEDURES.map((p, idx) => (
              <button
                key={p.name}
                onClick={() => setActiveProcedureIdx(idx)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '20px',
                  border: 'none',
                  backgroundColor: activeProcedureIdx === idx ? '#2C8C83' : 'rgba(255, 255, 255, 0.07)',
                  color: '#FFFFFF',
                  fontSize: '0.82rem',
                  fontWeight: activeProcedureIdx === idx ? 800 : 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{p.name.split(' (')[0]}</span>
                <span style={{
                  fontSize: '0.65rem',
                  backgroundColor: activeProcedureIdx === idx ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                  padding: '1px 6px',
                  borderRadius: '10px'
                }}>
                  {p.badge}
                </span>
              </button>
            ))}
          </div>

          {/* Procedure Live Tariffs Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeProcedure.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', textAlign: 'left' }}>
                {/* 1. Government Super-Specialty */}
                <div style={{
                  backgroundColor: 'rgba(15, 39, 61, 0.8)',
                  border: '1.5px solid rgba(44, 140, 131, 0.55)',
                  borderRadius: '14px',
                  padding: '14px 16px',
                  position: 'relative'
                }}>
                  <div style={{ fontSize: '0.72rem', color: '#A7F3D0', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    1. Government Super-Specialty
                  </div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#FFFFFF', margin: '4px 0 2px' }}>
                    {activeProcedure.govt}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#CBD5E1' }}>
                    {activeProcedure.govtNote}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#2C8C83', fontWeight: 700, marginTop: '6px' }}>
                    NIMS • Gandhi • Osmania
                  </div>
                </div>

                {/* 2. Private Multi-Specialty */}
                <div style={{
                  backgroundColor: 'rgba(15, 39, 61, 0.8)',
                  border: '1.5px solid rgba(94, 234, 212, 0.35)',
                  borderRadius: '14px',
                  padding: '14px 16px'
                }}>
                  <div style={{ fontSize: '0.72rem', color: '#5EEAD4', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    2. Private Multi-Specialty
                  </div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#FFFFFF', margin: '4px 0 2px' }}>
                    {activeProcedure.pvt}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#CBD5E1' }}>
                    {activeProcedure.pvtNote}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 700, marginTop: '6px' }}>
                    Yashoda • CARE • KIMS • Medicover
                  </div>
                </div>

                {/* 3. Premium Quaternary */}
                <div style={{
                  backgroundColor: 'rgba(15, 39, 61, 0.8)',
                  border: '1.5px solid rgba(245, 158, 11, 0.5)',
                  borderRadius: '14px',
                  padding: '14px 16px'
                }}>
                  <div style={{ fontSize: '0.72rem', color: '#FCD34D', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    3. Premium Quaternary
                  </div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#FFFFFF', margin: '4px 0 2px' }}>
                    {activeProcedure.premium}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#CBD5E1' }}>
                    {activeProcedure.premiumNote}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#F59E0B', fontWeight: 700, marginTop: '6px' }}>
                    ⭐ Apollo • AIG • Continental
                  </div>
                </div>
              </div>

              {/* Verified Scheme Bottom Bar */}
              <div style={{
                marginTop: '14px',
                padding: '8px 14px',
                backgroundColor: 'rgba(44, 140, 131, 0.15)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '0.82rem',
                color: '#A7F3D0'
              }}>
                <ShieldCheck size={17} color="#A7F3D0" />
                <span><strong>Public Scheme Protection:</strong> {activeProcedure.scheme}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* 5. PROMINENT GET STARTED CTA BUTTON WITH PULSING HALO */}
        <motion.button
          onClick={handleFinish}
          whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(44, 140, 131, 0.85)" }}
          whileTap={{ scale: 0.98 }}
          style={{
            backgroundColor: '#2C8C83', // Healthcare Emerald Teal
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '40px',
            padding: '18px 52px',
            fontSize: '1.25rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 8px 30px rgba(44, 140, 131, 0.65)',
            letterSpacing: '-0.01em',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Gleaming light reflection animation */}
          {!prefersReduced && (
            <motion.div
              animate={{ x: ['-100%', '220%'] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '45%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent)',
                pointerEvents: 'none'
              }}
            />
          )}
          <span>Get Started</span>
          <ArrowRight size={22} />
        </motion.button>
      </div>

      {/* 6. Bottom Trust Indicators Footer */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1240px',
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
          fontSize: '0.82rem',
          color: '#94A3B8',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 size={16} color="#2C8C83" />
          <span>NPPA &amp; PM-JAY HBP 2.2 Tariffs</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 size={16} color="#2C8C83" />
          <span>Real Facility Photos &amp; Verified Helplines</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 size={16} color="#2C8C83" />
          <span>Consent-First &amp; 256-Bit Encrypted Privacy</span>
        </div>
      </div>
    </div>
  );
};
