// ==============================================================================
// CareSaathi AI - Public Landing Page (Light, Multi-Tone, No Sidebar/Shell)
// Composition:
// 1. Sticky translucent ivory nav with wordmark, links, "Log in" & "Get Started"
// 2. Light Hero: descriptor chip, serif H1, approved subtext, CTAs, Care Path 3D
// 3. How it works: 3 editorial columns with 01/02/03 serif numbers
// 4. Product preview: "Illustrative example, not a quote" 3-tier cost preview
// 5. Trust & transparency: 3 tier badges explained
// 6. Final CTA band & clean footer
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { KineticHeadline } from '../components/KineticHeadline';
import { HeroBackground } from '../components/HeroBackground';
import { HeroVideo } from '../components/HeroVideo';
import { 
  ArrowRight, 
  ChevronRight
} from 'lucide-react';

interface PublicLandingPageProps {
  onNavigateToLogin: (mode: 'login' | 'register') => void;
  onNavigateToMethodology?: () => void;
  isAuthenticated?: boolean;
  onOpenDashboard?: () => void;
}

interface CostScenario {
  id: string;
  name: string;
  category: string;
  packageCode: string;
  govt: {
    price: string;
    badge: string;
    source: string;
    updated: string;
    caveat: string;
  };
  pvt: {
    price: string;
    badge: string;
    source: string;
    updated: string;
    note: string;
  };
  premium: {
    price: string;
    badge: string;
    source: string;
    updated: string;
    note: string;
  };
}

const PREVIEW_SCENARIOS: CostScenario[] = [
  {
    id: 'knee_replacement',
    name: 'Total Knee Replacement',
    category: 'Orthopedics & Joint Arthroplasty',
    packageCode: 'PM-JAY SU03001A • Aarogyasri S4.1.1',
    govt: {
      price: '₹0 (Cashless)',
      badge: 'Official Statutory Tariff',
      source: 'Telangana DME & Gandhi Hospital Schedule',
      updated: 'Feb 2026',
      caveat: 'May be cashless (₹0) for eligible beneficiaries under Ayushman Bharat PM-JAY / Aarogyasri Trust with valid White Ration Card.'
    },
    pvt: {
      price: '₹1,35,000 — ₹2,80,000',
      badge: 'Estimate (Not a Quote)',
      source: 'NABH Hospital TPA Network Schedule (NIMS/Apollo Reference)',
      updated: 'Feb 2026',
      note: 'Standard twin-sharing room including surgical implants and 4-day inpatient stay.'
    },
    premium: {
      price: '₹2,10,000 — ₹4,20,000',
      badge: 'Estimate (Not a Quote)',
      source: 'Quaternary Healthcare Published Card',
      updated: 'Feb 2026',
      note: 'Single deluxe suite, robotic-assisted arthroplasty, and imported high-flex implants.'
    }
  },
  {
    id: 'cataract_surgery',
    name: 'Cataract Eye Surgery (Phaco)',
    category: 'Ophthalmology & Foldable IOL',
    packageCode: 'PM-JAY OP01002B • Aarogyasri O1.2.1',
    govt: {
      price: '₹0 (Cashless)',
      badge: 'Official Statutory Tariff',
      source: 'Sarojini Devi Eye Hospital Official Tariff',
      updated: 'Feb 2026',
      caveat: 'May be cashless (₹0) for eligible beneficiaries under National Blindness Control Programme & State Health Trust.'
    },
    pvt: {
      price: '₹18,000 — ₹45,000',
      badge: 'Estimate (Not a Quote)',
      source: 'Empanelled Day-Care Centers Reference Card',
      updated: 'Feb 2026',
      note: 'Day-care phacoemulsification with standard foldable hydrophobic intraocular lens.'
    },
    premium: {
      price: '₹38,000 — ₹68,000',
      badge: 'Estimate (Not a Quote)',
      source: 'Specialty Eye Institute Schedule',
      updated: 'Feb 2026',
      note: 'Femtosecond laser-assisted surgery (FLACS) with multifocal / toric premium lens.'
    }
  },
  {
    id: 'mri_brain',
    name: 'MRI Brain & Spine Scan',
    category: 'Diagnostic & Contrast Imaging',
    packageCode: 'PM-JAY DG04001 • Aarogyasri D1.4.1',
    govt: {
      price: '₹0 — ₹1,500',
      badge: 'Official Statutory Tariff',
      source: 'NIMS & Osmania Hospital Diagnostic Schedule',
      updated: 'Feb 2026',
      caveat: 'Cashless with inpatient pre-authorization for BPL card holders; subsidized OPD base rate applies.'
    },
    pvt: {
      price: '₹4,500 — ₹8,500',
      badge: 'Estimate (Not a Quote)',
      source: 'Regional Diagnostic Center Survey',
      updated: 'Feb 2026',
      note: '1.5T / 3.0T high-resolution magnetic resonance neuro-imaging.'
    },
    premium: {
      price: '₹8,000 — ₹12,500',
      badge: 'Estimate (Not a Quote)',
      source: 'Tertiary Hospital Radiology Wing',
      updated: 'Feb 2026',
      note: 'Advanced functional MRI, 3D tractography, or specialized contrast sequences.'
    }
  },
  {
    id: 'diabetes_care',
    name: 'Diabetes Care & Blood Panel',
    category: 'Endocrinology & Diabetology',
    packageCode: 'Aarogyasri M3.1 • NPPA Essential Drug List',
    govt: {
      price: '₹0 (Free Diagnostics)',
      badge: 'Official Statutory Tariff',
      source: 'Primary & Urban Health Center Formulary',
      updated: 'Feb 2026',
      caveat: 'Free essential testing and state-subsidized insulin / Metformin at government dispensaries.'
    },
    pvt: {
      price: '₹1,200 — ₹3,500',
      badge: 'Estimate (Not a Quote)',
      source: 'NABL Accredited Laboratory Rate Survey',
      updated: 'Feb 2026',
      note: 'Quarterly monitoring including HbA1c, fasting glucose, lipid and renal panels.'
    },
    premium: {
      price: '₹3,500 — ₹6,500',
      badge: 'Estimate (Not a Quote)',
      source: 'Comprehensive Metabolic Wellness Suite',
      updated: 'Feb 2026',
      note: 'Full endocrinologist consultation, fundus eye check, and microalbuminuria screening.'
    }
  }
];

export const PublicLandingPage: React.FC<PublicLandingPageProps> = ({
  onNavigateToLogin,
  onNavigateToMethodology,
  isAuthenticated = false,
  onOpenDashboard
}) => {
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const activeScenario = PREVIEW_SCENARIOS[activeScenarioIdx];

  // Reset scroll to top on arrival so animations play fresh from the beginning
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      className="paper-grain"
      style={{
        minHeight: '100vh',
        color: '#102A36',
        position: 'relative',
        backgroundColor: 'transparent',
        background: 'transparent'
      }}
    >
      {/* Layer 1: Full-Page Fixed Hospital Exterior Background Layer */}
      <div
        className="landing-fixed-hospital-bg"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage: "url('/images/hospital-exterior.jpg')",
          backgroundPosition: 'center 30%',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          opacity: 0.55,
          filter: 'saturate(1.1) contrast(1.05)'
        }}
        aria-hidden="true"
      />

      {/* Layer 2: Unified Full-Page Vertical White Gradient Overlay */}
      <div
        className="landing-page-vertical-overlay"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0.25) 55%, rgba(255, 255, 255, 0.70) 100%)'
        }}
        aria-hidden="true"
      />

      {/* Subtle Paper Grain Ambient Overlay */}
      <div className="paper-grain-overlay" />

      {/* ========================================================================= */}
      {/* 1. STICKY TRANSLUCENT IVORY NAV BAR                                      */}
      {/* ========================================================================= */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 90,
          backgroundColor: 'rgba(250, 250, 247, 0.88)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.75)',
          padding: '14px 24px'
        }}
        aria-label="Public Navigation"
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Wordmark (no heart logo, no colored tile) */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'baseline', gap: '6px' }}
          >
            <span
              style={{
                fontFamily: "Georgia, 'Plus Jakarta Sans', serif",
                fontSize: '1.4rem',
                fontWeight: 700,
                color: '#102A36',
                letterSpacing: '-0.02em'
              }}
            >
              CareSaathi
            </span>
            <span
              style={{
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#438F84',
                letterSpacing: '0.04em'
              }}
            >
              AI
            </span>
          </div>

          {/* Center Links (Desktop) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '28px',
              fontSize: '0.9rem',
              fontWeight: 500,
              color: '#64717D'
            }}
            className="landing-nav-links"
          >
            <button
              type="button"
              onClick={() => scrollToSection('about')}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 'inherit' }}
            >
              About
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('how-it-works')}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 'inherit' }}
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('product-preview')}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 'inherit' }}
            >
              Costs
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('trust-transparency')}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 'inherit' }}
            >
              Trust Badges
            </button>
            {onNavigateToMethodology && (
              <button
                type="button"
                onClick={onNavigateToMethodology}
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 'inherit' }}
              >
                Methodology
              </button>
            )}
          </div>

          {/* Right Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={onOpenDashboard}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#438F84',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.86rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>← Back to app</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenDashboard}
                  className="btn btn-primary"
                  style={{
                    backgroundColor: '#438F84',
                    color: '#FFFFFF',
                    borderRadius: '6px',
                    padding: '7px 18px',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>Open Dashboard</span>
                  <ArrowRight size={14} />
                </button>
              </>
            ) : (
              <>
                {/* Secondary Log In Ghost Button */}
                <button
                  type="button"
                  onClick={() => onNavigateToLogin('login')}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(24, 50, 71, 0.25)',
                    color: '#102A36',
                    borderRadius: '6px',
                    padding: '7px 16px',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                    e.currentTarget.style.borderColor = '#438F84';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(24, 50, 71, 0.25)';
                  }}
                >
                  Log in
                </button>

                {/* Primary Get Started Teal Button */}
                <button
                  type="button"
                  onClick={() => onNavigateToLogin('register')}
                  className="btn btn-primary"
                  style={{
                    backgroundColor: '#438F84',
                    color: '#FFFFFF',
                    borderRadius: '6px',
                    padding: '7px 18px',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>Get Started</span>
                  <ArrowRight size={14} />
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* 2. LIGHT HERO SECTION                                                     */}
      {/* ========================================================================= */}
      <section
        style={{
          position: 'relative',
          zIndex: 10,
          minHeight: 'calc(100vh - 68px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '48px 24px 64px 24px',
          overflow: 'hidden',
          backgroundColor: 'transparent'
        }}
        className="hero-section"
      >
        {/* Layer 1 & 2: Hero Video Layer and Fallback Image */}
        <HeroVideo />

        {/* Layer 3 & 4: Gradient Overlays and Plus Symbols */}
        <HeroBackground />

        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            width: '100%',
            position: 'relative',
            zIndex: 10
          }}
          className="hero-inner-container"
        >
          {/* Hero Text Column (max 660px, left-aligned, right side left open for hospital photo) */}
          <div
            className="hero-content-col"
            style={{
              maxWidth: '660px',
              position: 'relative',
              zIndex: 5
            }}
          >
            {/* Descriptor Chip with Animated Pulse Dot */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 12px',
                borderRadius: '4px',
                backgroundColor: 'rgba(67, 143, 132, 0.12)',
                border: '1px solid rgba(67, 143, 132, 0.35)',
                color: '#326D64',
                fontSize: '0.74rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '16px'
              }}
            >
              <span className="pulse-dot-rose" aria-hidden="true" />
              <span>AI-Powered Healthcare Navigation for India</span>
            </div>

            {/* Kinetic Animated H1 Headline (Accessibility-first, 1.8s entrance, heartbeat sync) */}
            <KineticHeadline />

            {/* Illustrative Heartbeat Waveform Chip (Decorative only, no fake data) */}
            <div
              className="hero-follower-1"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                border: '1px solid rgba(229, 56, 79, 0.22)',
                boxShadow: '0 2px 8px rgba(16, 42, 54, 0.04)',
                marginTop: '16px',
                marginBottom: '18px'
              }}
            >
              <svg width="28" height="12" viewBox="0 0 28 12" fill="none" style={{ overflow: 'visible' }} aria-hidden="true">
                <path
                  d="M 0 6 L 7 6 L 10 1 L 13 11 L 15 3 L 17 8 L 20 6 L 28 6"
                  stroke="url(#miniEcgGradHero)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient id="miniEcgGradHero" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FF7A59" />
                    <stop offset="35%" stopColor="#8B6CFF" />
                    <stop offset="70%" stopColor="#4DA8FF" />
                    <stop offset="100%" stopColor="#2EC4B6" />
                  </linearGradient>
                </defs>
              </svg>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64717D', letterSpacing: '0.02em' }}>
                Illustrative Rhythm • In Motion
              </span>
            </div>

            {/* Approved Supporting Text */}
            <p
              className="hero-follower-2"
              style={{
                fontSize: '1.08rem',
                color: '#64717D',
                lineHeight: 1.62,
                maxWidth: '540px',
                marginBottom: '28px',
                textShadow: '0 1px 2px rgba(255, 255, 255, 0.6)'
              }}
            >
              Explore indicative procedure costs across Government, Private, and Premium facilities, discover nearby empanelled hospitals, and check schemes you may be eligible for.
            </p>

            {/* CTAs: Open Dashboard when authenticated, or Get Started + Log In when signed out */}
            <div
              className="hero-follower-3"
              style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', flexWrap: 'wrap' }}
            >
              {isAuthenticated ? (
                <>
                  <button
                    type="button"
                    onClick={onOpenDashboard}
                    className="btn btn-primary btn-sheen"
                    style={{
                      backgroundColor: '#438F84',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      padding: '12px 26px',
                      fontSize: '0.98rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      border: 'none',
                      boxShadow: '0 4px 14px rgba(67, 143, 132, 0.25)'
                    }}
                  >
                    <span>Open Dashboard</span>
                    <ArrowRight size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={onOpenDashboard}
                    className="btn-ghost-draw"
                    style={{
                      background: 'transparent',
                      border: '1.5px solid rgba(24, 50, 71, 0.3)',
                      color: '#102A36',
                      borderRadius: '8px',
                      padding: '11px 22px',
                      fontSize: '0.96rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Back to app
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onNavigateToLogin('register')}
                    className="btn btn-primary btn-sheen"
                    style={{
                      backgroundColor: '#438F84',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      padding: '12px 24px',
                      fontSize: '0.98rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      border: 'none',
                      boxShadow: '0 4px 14px rgba(67, 143, 132, 0.25)'
                    }}
                  >
                    <span>Get Started</span>
                    <ArrowRight size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigateToLogin('login')}
                    className="btn-ghost-draw"
                    style={{
                      background: 'transparent',
                      border: '1.5px solid rgba(24, 50, 71, 0.3)',
                      color: '#102A36',
                      borderRadius: '8px',
                      padding: '11px 22px',
                      fontSize: '0.96rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Log in
                  </button>
                </>
              )}
            </div>

            {/* Quiet Trust Line */}
            <div
              className="hero-follower-4"
              style={{
                fontSize: '0.82rem',
                color: '#64717D',
                lineHeight: 1.5,
                borderTop: '1px solid #E2E8F0',
                paddingTop: '14px',
                maxWidth: '540px',
                textShadow: '0 1px 2px rgba(255, 255, 255, 0.6)'
              }}
            >
              Estimates are informational. Always confirm with the hospital or scheme authority.
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Mini ECG Waveform Divider (Centered in soft transition zone with 32px space above & below) */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.80)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          padding: '32px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 0
        }}
        aria-hidden="true"
      >
        <div
          style={{
            maxWidth: '1240px',
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
          <div style={{ padding: '0 16px', display: 'flex', alignItems: 'center' }}>
            <svg width="56" height="16" viewBox="0 0 56 16" fill="none">
              <path
                d="M 0 8 L 15 8 L 20 2 L 26 14 L 31 4 L 35 11 L 40 8 L 56 8"
                stroke="url(#ecgDividerGrad)"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <defs>
                <linearGradient id="ecgDividerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FF7A59" />
                  <stop offset="35%" stopColor="#8B6CFF" />
                  <stop offset="70%" stopColor="#4DA8FF" />
                  <stop offset="100%" stopColor="#2EC4B6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2B. ABOUT CARESAATHI AI: EDITORIAL BAND HIGHLIGHTING REAL CAPABILITIES    */}
      {/* ========================================================================= */}
      <section
        id="about"
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '72px 24px',
          backgroundColor: 'rgba(255, 255, 255, 0.80)',
          backdropFilter: 'blur(6px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)'
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              gap: '40px',
              alignItems: 'start'
            }}
            className="about-grid-layout"
          >
            {/* Left Column (span 5): Editorial Lead Sentence */}
            <div style={{ gridColumn: 'span 5' }} className="about-left-col">
              <div
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#1F7A70',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span style={{ width: '18px', height: '2px', backgroundColor: '#438F84', display: 'inline-block' }} />
                <span>About CareSaathi AI</span>
              </div>

              <h2
                style={{
                  fontFamily: "Georgia, 'Plus Jakarta Sans', serif",
                  fontSize: 'clamp(1.75rem, 2.6vw, 2.3rem)',
                  fontWeight: 700,
                  lineHeight: 1.25,
                  letterSpacing: '-0.02em',
                  color: '#102A36',
                  marginBottom: '20px'
                }}
              >
                CareSaathi AI helps you understand indicative{' '}
                <span className="marker-highlight-teal">healthcare costs in India</span>, find{' '}
                <span className="marker-highlight-sky">empanelled hospitals</span>, and check{' '}
                <span className="marker-highlight-rose">government schemes</span> you may be eligible for.
              </h2>

              <p
                style={{
                  fontSize: '0.94rem',
                  color: '#64717D',
                  lineHeight: 1.65,
                  marginBottom: '24px'
                }}
              >
                Built specifically to demystify medical tariffs, out-of-pocket expenses, and statutory health protection across Central and State government programs.
              </p>

              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.88)',
                  border: '1px solid #E2E8F0',
                  fontSize: '0.8rem',
                  color: '#64717D',
                  lineHeight: 1.5
                }}
              >
                <span style={{ fontWeight: 600, color: '#102A36' }}>Honest Note:</span> Estimates are informational and not a quotation. Confirm with the hospital or scheme authority.
              </div>
            </div>

            {/* Right Column (span 7): 4 Colour-Coded Feature Blocks */}
            <div
              style={{
                gridColumn: 'span 7',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '20px'
              }}
              className="about-features-grid"
            >
              {/* Feature 1: Cost estimates (Teal) */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.88)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '10px',
                  padding: '24px',
                  border: '1px solid #E2E8F0',
                  borderTop: '3px solid #1F7A70',
                  boxShadow: '0 4px 16px rgba(16, 42, 54, 0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2EC4B6' }} />
                  <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#102A36', margin: 0 }}>
                     Cost estimates
                  </h3>
                </div>
                <p style={{ fontSize: '0.86rem', color: '#64717D', lineHeight: 1.55, margin: 0 }}>
                  Benchmark procedure charges across official statutory schedules, NABH private network averages, and premium tiers with honest itemized breakdowns.
                </p>
              </div>

              {/* Feature 2: Hospital discovery (Sky) */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.88)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '10px',
                  padding: '24px',
                  border: '1px solid #E2E8F0',
                  borderTop: '3px solid #246BB5',
                  boxShadow: '0 4px 16px rgba(16, 42, 54, 0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#4DA8FF' }} />
                  <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#102A36', margin: 0 }}>
                    Hospital discovery
                  </h3>
                </div>
                <p style={{ fontSize: '0.86rem', color: '#64717D', lineHeight: 1.55, margin: 0 }}>
                  Locate 28 empanelled facilities across Indian cities with real ownership types (Government vs Private) and verified NABH accreditation.
                </p>
              </div>

              {/* Feature 3: Scheme guidance (Rose) */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.88)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '10px',
                  padding: '24px',
                  border: '1px solid #E2E8F0',
                  borderTop: '3px solid #D6334B',
                  boxShadow: '0 4px 16px rgba(16, 42, 54, 0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FF7A59' }} />
                  <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#102A36', margin: 0 }}>
                    Scheme guidance
                  </h3>
                </div>
                <p style={{ fontSize: '0.86rem', color: '#64717D', lineHeight: 1.55, margin: 0 }}>
                  Check eligibility criteria and covered treatment packages for Ayushman Bharat PM-JAY and State programs (Aarogyasri).
                </p>
              </div>

              {/* Feature 4: Voice and prescription input (Violet) */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.88)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '10px',
                  padding: '24px',
                  border: '1px solid #E2E8F0',
                  borderTop: '3px solid #5E3CD6',
                  boxShadow: '0 4px 16px rgba(16, 42, 54, 0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#8B6CFF' }} />
                  <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#102A36', margin: 0 }}>
                    Voice & prescription input
                  </h3>
                </div>
                <p style={{ fontSize: '0.86rem', color: '#64717D', lineHeight: 1.55, margin: 0 }}>
                  Instant natural queries in 6 regional Indian languages or prescription upload for automated procedure identification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. HOW IT WORKS: THREE EDITORIAL COLUMNS (01 / 02 / 03)                   */}
      {/* ========================================================================= */}
      <section
        id="how-it-works"
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '64px 24px',
          borderTop: '1px solid rgba(226, 232, 240, 0.8)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          backgroundColor: 'rgba(255, 255, 255, 0.80)',
          backdropFilter: 'blur(6px)'
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ marginBottom: '36px' }}>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#438F84',
                textTransform: 'uppercase',
                letterSpacing: '0.06em'
              }}
            >
              How It Works
            </span>
            <h2
              style={{
                fontFamily: "Georgia, serif",
                fontSize: '2rem',
                color: '#102A36',
                marginTop: '4px',
                marginBottom: '8px'
              }}
            >
              Three Steps to Healthcare Transparency
            </h2>
            <p style={{ color: '#64717D', fontSize: '0.98rem' }}>
              Designed to eliminate financial uncertainty before stepping into a hospital.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0px',
              backgroundColor: 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(8px)',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              overflow: 'hidden'
            }}
            className="how-it-works-grid"
          >
            {/* Step 01 */}
            <div style={{ padding: '36px 30px' }} className="how-step-col">
              <div
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: '2.4rem',
                  fontWeight: 700,
                  color: '#438F84',
                  lineHeight: 1,
                  marginBottom: '16px'
                }}
              >
                01
              </div>
              <h3 style={{ fontSize: '1.2rem', color: '#102A36', marginBottom: '10px', fontWeight: 700 }}>
                State Your Care Needs
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64717D', lineHeight: 1.6 }}>
                Type a surgery, diagnostic test, or symptom in plain English, Telugu, or Hindi. You can also dictate via voice speech or upload an doctor prescription image for OCR breakdown.
              </p>
            </div>

            {/* Step 02 */}
            <div
              style={{
                padding: '36px 30px',
                borderLeft: '1px solid #E2E8F0'
              }}
              className="how-step-col step-middle"
            >
              <div
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: '2.4rem',
                  fontWeight: 700,
                  color: '#438F84',
                  lineHeight: 1,
                  marginBottom: '16px'
                }}
              >
                02
              </div>
              <h3 style={{ fontSize: '1.2rem', color: '#102A36', marginBottom: '10px', fontWeight: 700 }}>
                Compare Tariff Tiers
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64717D', lineHeight: 1.6 }}>
                Review side-by-side cost benchmarks across Government Super-Specialty hospitals, NABH Private Multi-Specialties, and Premium Quaternary Suites, broken down by surgical fees, bed charges, and diagnostics.
              </p>
            </div>

            {/* Step 03 */}
            <div
              style={{
                padding: '36px 30px',
                borderLeft: '1px solid #E2E8F0'
              }}
              className="how-step-col"
            >
              <div
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: '2.4rem',
                  fontWeight: 700,
                  color: '#438F84',
                  lineHeight: 1,
                  marginBottom: '16px'
                }}
              >
                03
              </div>
              <h3 style={{ fontSize: '1.2rem', color: '#102A36', marginBottom: '10px', fontWeight: 700 }}>
                Match Protection Schemes
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64717D', lineHeight: 1.6 }}>
                Identify applicable financial coverage under Ayushman Bharat PM-JAY and State Aarogyasri Trust. Locate verified empanelled hospitals within your district with direct contact helplines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. PRODUCT PREVIEW: COST COMPARISON (ILLUSTRATIVE EXAMPLE)               */}
      {/* ========================================================================= */}
      <section
        id="product-preview"
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '64px 24px',
          backgroundColor: 'rgba(255, 255, 255, 0.80)',
          backdropFilter: 'blur(6px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)'
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#438F84'
                }}
              >
                Product Preview
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  backgroundColor: '#E2E8F0',
                  color: '#475569',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontWeight: 600
                }}
              >
                Illustrative example, not a quote
              </span>
            </div>
            <h2
              style={{
                fontFamily: "Georgia, serif",
                fontSize: '2rem',
                color: '#102A36',
                margin: 0
              }}
            >
              Indicative Tariffs by Facility Tier
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#64717D', marginTop: '6px' }}>
              Select a clinical procedure to inspect published state schedules and private hospital estimates.
            </p>
          </div>

          {/* Underline Tab Bar (Not Pills) */}
          <div
            style={{
              display: 'flex',
              gap: '28px',
              borderBottom: '1px solid #E2E8F0',
              marginBottom: '28px',
              overflowX: 'auto',
              scrollbarWidth: 'none'
            }}
          >
            {PREVIEW_SCENARIOS.map((sc, idx) => {
              const isSelected = activeScenarioIdx === idx;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => setActiveScenarioIdx(idx)}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: isSelected ? '2.5px solid #438F84' : '2.5px solid transparent',
                    padding: '8px 4px 14px 4px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div
                    style={{
                      fontFamily: isSelected ? "Georgia, serif" : 'inherit',
                      fontSize: '0.96rem',
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? '#102A36' : '#64717D'
                    }}
                  >
                    {sc.name}
                  </div>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      color: isSelected ? '#438F84' : '#94A3B8',
                      marginTop: '2px',
                      fontWeight: 500
                    }}
                  >
                    {sc.category}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Three Hairline Columns Container */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(8px)',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '32px 28px',
              boxShadow: '0 4px 16px rgba(24, 50, 71, 0.04)',
              marginBottom: '20px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#102A36', margin: 0, fontWeight: 700 }}>
                  {activeScenario.name}
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64717D', marginTop: '4px' }}>
                  Standard Package Code: <strong>{activeScenario.packageCode}</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigateToLogin('register')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.82rem', fontWeight: 600, padding: '6px 14px' }}
              >
                <span>View Full Hospital Directory</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0px'
              }}
              className="preview-columns-grid"
            >
              {/* Col 1: Government */}
              <div style={{ paddingRight: '28px' }} className="preview-col">
                <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#64717D', marginBottom: '8px' }}>
                  Government Super-Specialty
                </div>
                <div
                  style={{
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    color: '#102A36',
                    letterSpacing: '-0.02em',
                    marginBottom: '8px'
                  }}
                >
                  {activeScenario.govt.price}
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      backgroundColor: '#E7F3EF',
                      color: '#326D64',
                      border: '1px solid rgba(67, 143, 132, 0.3)',
                      borderRadius: '4px',
                      padding: '2px 8px',
                      fontSize: '0.72rem',
                      fontWeight: 600
                    }}
                  >
                    {activeScenario.govt.badge}
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#64717D', lineHeight: 1.5, marginBottom: '10px' }}>
                  {activeScenario.govt.caveat}
                </p>
                <div style={{ fontSize: '0.74rem', color: '#94A3B8', borderTop: '1px solid #F1F5F9', paddingTop: '8px' }}>
                  Source: {activeScenario.govt.source} ({activeScenario.govt.updated})
                </div>
              </div>

              {/* Col 2: NABH Private */}
              <div
                style={{
                  paddingLeft: '28px',
                  paddingRight: '28px',
                  borderLeft: '1px solid #E2E8F0'
                }}
                className="preview-col middle-preview-col"
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#64717D', marginBottom: '8px' }}>
                  NABH Private Multi-Specialty
                </div>
                <div
                  style={{
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    color: '#102A36',
                    letterSpacing: '-0.02em',
                    marginBottom: '8px'
                  }}
                >
                  {activeScenario.pvt.price}
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      backgroundColor: '#EAF2F8',
                      color: '#1E40AF',
                      border: '1px solid rgba(147, 197, 253, 0.4)',
                      borderRadius: '4px',
                      padding: '2px 8px',
                      fontSize: '0.72rem',
                      fontWeight: 600
                    }}
                  >
                    {activeScenario.pvt.badge}
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#64717D', lineHeight: 1.5, marginBottom: '10px' }}>
                  {activeScenario.pvt.note}
                </p>
                <div style={{ fontSize: '0.74rem', color: '#94A3B8', borderTop: '1px solid #F1F5F9', paddingTop: '8px' }}>
                  Source: {activeScenario.pvt.source} ({activeScenario.pvt.updated})
                </div>
              </div>

              {/* Col 3: Premium Quaternary */}
              <div
                style={{
                  paddingLeft: '28px',
                  borderLeft: '1px solid #E2E8F0'
                }}
                className="preview-col"
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#64717D', marginBottom: '8px' }}>
                  Premium Quaternary Suite
                </div>
                <div
                  style={{
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    color: '#102A36',
                    letterSpacing: '-0.02em',
                    marginBottom: '8px'
                  }}
                >
                  {activeScenario.premium.price}
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      backgroundColor: '#F1F5F9',
                      color: '#475569',
                      border: '1px solid #CBD5E1',
                      borderRadius: '4px',
                      padding: '2px 8px',
                      fontSize: '0.72rem',
                      fontWeight: 600
                    }}
                  >
                    {activeScenario.premium.badge}
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#64717D', lineHeight: 1.5, marginBottom: '10px' }}>
                  {activeScenario.premium.note}
                </p>
                <div style={{ fontSize: '0.74rem', color: '#94A3B8', borderTop: '1px solid #F1F5F9', paddingTop: '8px' }}>
                  Source: {activeScenario.premium.source} ({activeScenario.premium.updated})
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. TRUST AND TRANSPARENCY: THREE BADGES EXPLAINED                         */}
      {/* ========================================================================= */}
      <section
        id="trust-transparency"
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '64px 24px',
          backgroundColor: 'rgba(255, 255, 255, 0.80)',
          backdropFilter: 'blur(6px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)'
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ marginBottom: '36px' }}>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#438F84',
                textTransform: 'uppercase',
                letterSpacing: '0.06em'
              }}
            >
              Transparency Standards
            </span>
            <h2
              style={{
                fontFamily: "Georgia, serif",
                fontSize: '2rem',
                color: '#102A36',
                marginTop: '4px',
                marginBottom: '8px'
              }}
            >
              How Every Number is Labeled
            </h2>
            <p style={{ color: '#64717D', fontSize: '0.98rem' }}>
              We never present hardcoded estimates as verified government tariffs. Every price in CareSaathi carries an explicit confidence badge.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px'
            }}
            className="badges-explain-grid"
          >
            {/* Badge 1: Official Statutory Tariff */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(8px)',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '28px 24px'
              }}
            >
              <div style={{ marginBottom: '14px' }}>
                <span
                  style={{
                    backgroundColor: '#E7F3EF',
                    color: '#326D64',
                    border: '1px solid rgba(67, 143, 132, 0.4)',
                    borderRadius: '4px',
                    padding: '4px 10px',
                    fontSize: '0.76rem',
                    fontWeight: 700
                  }}
                >
                  Official Statutory Tariff
                </span>
              </div>
              <h3 style={{ fontSize: '1.15rem', color: '#102A36', marginBottom: '8px', fontWeight: 700 }}>
                Government Directorate Rate
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64717D', lineHeight: 1.6 }}>
                Directly synchronized with state Department of Medical Education (DME) gazettes, teaching hospital rate cards, and Aarogyasri Trust benefit packages.
              </p>
            </div>

            {/* Badge 2: Estimate (Not a Quote) */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(8px)',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '28px 24px'
              }}
            >
              <div style={{ marginBottom: '14px' }}>
                <span
                  style={{
                    backgroundColor: '#EAF2F8',
                    color: '#1E40AF',
                    border: '1px solid rgba(147, 197, 253, 0.4)',
                    borderRadius: '4px',
                    padding: '4px 10px',
                    fontSize: '0.76rem',
                    fontWeight: 700
                  }}
                >
                  Estimate (Not a Quote)
                </span>
              </div>
              <h3 style={{ fontSize: '1.15rem', color: '#102A36', marginBottom: '8px', fontWeight: 700 }}>
                Empirical Market Survey
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64717D', lineHeight: 1.6 }}>
                Aggregated from published TPA insurance schedules, NABH accredited network rate surveys, and verified hospital tariff disclosures across Indian metros.
              </p>
            </div>

            {/* Badge 3: Unverified / Variable */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(8px)',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '28px 24px'
              }}
            >
              <div style={{ marginBottom: '14px' }}>
                <span
                  style={{
                    backgroundColor: '#F1F5F9',
                    color: '#475569',
                    border: '1px solid #CBD5E1',
                    borderRadius: '4px',
                    padding: '4px 10px',
                    fontSize: '0.76rem',
                    fontWeight: 700
                  }}
                >
                  Unverified / Variable
                </span>
              </div>
              <h3 style={{ fontSize: '1.15rem', color: '#102A36', marginBottom: '8px', fontWeight: 700 }}>
                Facility Direct Inquiry
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64717D', lineHeight: 1.6 }}>
                Flagged whenever clinical package inclusions (consumables, surgeon charges, implant models) have not yet been confirmed via institutional schedules.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. FINAL CTA BAND & CLEAN FOOTER                                          */}
      {/* ========================================================================= */}
      <section
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '64px 24px 72px 24px',
          textAlign: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.80)',
          backdropFilter: 'blur(6px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)'
        }}
      >
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: "Georgia, serif",
              fontSize: '2.2rem',
              color: '#102A36',
              marginBottom: '14px',
              letterSpacing: '-0.02em'
            }}
          >
            Take Control of Healthcare Uncertainty Today
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#64717D', lineHeight: 1.6, marginBottom: '28px' }}>
            Compare costs across 28 verified healthcare facilities, explore public schemes, and prepare with confidence.
          </p>

          <button
            type="button"
            onClick={() => isAuthenticated && onOpenDashboard ? onOpenDashboard() : onNavigateToLogin('register')}
            className="btn btn-primary"
            style={{
              backgroundColor: '#438F84',
              color: '#FFFFFF',
              borderRadius: '8px',
              padding: '13px 32px',
              fontSize: '1rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              border: 'none',
              boxShadow: '0 6px 18px rgba(67, 143, 132, 0.28)'
            }}
          >
            <span>{isAuthenticated ? 'Open Dashboard' : 'Get Started with CareSaathi'}</span>
            <ArrowRight size={17} />
          </button>
        </div>
      </section>

      {/* Clean Public Footer */}
      <footer
        style={{
          position: 'relative',
          zIndex: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.80)',
          backdropFilter: 'blur(6px)',
          borderTop: '1px solid rgba(226, 232, 240, 0.8)',
          padding: '40px 24px 32px 24px'
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '18px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontFamily: "Georgia, serif", fontSize: '1.2rem', fontWeight: 700, color: '#102A36' }}>
              CareSaathi
            </span>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#438F84' }}>
              AI
            </span>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8', marginLeft: '12px' }}>
              • 28 Empanelled Facilities Verified
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '0.84rem', color: '#64717D' }}>
            {isAuthenticated ? (
              <span onClick={onOpenDashboard} style={{ cursor: 'pointer', color: '#438F84', fontWeight: 600 }}>
                Open Dashboard
              </span>
            ) : (
              <>
                <span onClick={() => onNavigateToLogin('login')} style={{ cursor: 'pointer' }}>
                  Sign In
                </span>
                <span onClick={() => onNavigateToLogin('register')} style={{ cursor: 'pointer' }}>
                  Create Account
                </span>
              </>
            )}
            <a href="https://pmjay.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#438F84' }}>
              PM-JAY Portal
            </a>
            <a href="https://aarogyasri.telangana.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#438F84' }}>
              Aarogyasri Trust
            </a>
          </div>
        </div>

        <div style={{ maxWidth: '1240px', margin: '16px auto 0 auto', fontSize: '0.74rem', color: '#94A3B8', textAlign: 'center' }}>
          CareSaathi AI provides informational estimates based on published statutory schedules and survey data. Always confirm pre-authorization with hospital Aarogyamitra desks.
        </div>
      </footer>

      <style>{`
        body, #root {
          background-color: transparent !important;
        }

        @media (max-width: 768px) {
          .landing-fixed-hospital-bg {
            position: absolute !important;
            top: 0 !important;
            height: 100% !important;
            background-attachment: scroll !important;
            opacity: 0.40 !important;
          }
          .landing-page-vertical-overlay {
            position: absolute !important;
            top: 0 !important;
            height: 100% !important;
          }
        }

        @media (max-width: 900px) {
          .landing-nav-links {
            display: none !important;
          }
          .hero-content-col {
            max-width: 100% !important;
          }
          .about-grid-layout {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
          }
          .about-left-col {
            grid-column: span 12 !important;
          }
          .about-features-grid {
            grid-column: span 12 !important;
          }
          .how-it-works-grid {
            grid-template-columns: 1fr !important;
          }
          .step-middle {
            border-left: none !important;
            border-top: 1px solid #E2E8F0 !important;
            border-bottom: 1px solid #E2E8F0 !important;
          }
          .preview-columns-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .preview-col {
            padding: 0 !important;
            border-left: none !important;
          }
          .middle-preview-col {
            border-top: 1px solid #E2E8F0 !important;
            border-bottom: 1px solid #E2E8F0 !important;
            padding: 20px 0 !important;
          }
          .badges-explain-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          .about-features-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
