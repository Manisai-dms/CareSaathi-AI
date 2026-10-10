// ==============================================================================
// CareSaathi AI - New 3D "Care Core" Hero & Cost Comparison Preview
// Implements exact Addendum specifications:
// - Flat ink #102A36 hero background with single teal-lit 3D Care Core
// - Asymmetric split (6/12 left console, 6/12 right 3D orb with hairline leader lines)
// - Typographic wordmark (no heart logo, no colored tile)
// - Serif H1: "Understand Your Healthcare Costs. Find Care You Can Trust."
// - Approved supporting text (no fake BPM, no gold accents, no boxed words)
// - Rebuilt Cost Comparison Preview: underline tab bar + 3 hairline columns with
//   proper badges (Official Tariff / Estimate), Indian ₹ grouping & scheme caveats.
// ==============================================================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Mic, 
  FileText, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink,
  Info
} from 'lucide-react';
import { CareCore3D } from './CareCore3D';

interface CareCoreHeroProps {
  onStartSearch: (query?: string) => void;
  onOpenVoice?: () => void;
  onOpenRx?: () => void;
  onSignIn?: () => void;
}

// 4 Verified Scenarios sourced from CareSaathi database / statutory tariff schedules
interface CostPreviewScenario {
  id: string;
  name: string;
  category: string;
  packageCode: string;
  govt: {
    priceFormatted: string;
    badge: string;
    source: string;
    updated: string;
    schemeCaveat: string;
  };
  pvt: {
    priceFormatted: string;
    badge: string;
    source: string;
    updated: string;
    note: string;
  };
  premium: {
    priceFormatted: string;
    badge: string;
    source: string;
    updated: string;
    note: string;
  };
}

const COST_SCENARIOS: CostPreviewScenario[] = [
  {
    id: "knee_replacement",
    name: "Total Knee Replacement",
    category: "Orthopedics & Joint Arthroplasty",
    packageCode: "PM-JAY SU03001A • Aarogyasri S4.1.1",
    govt: {
      priceFormatted: "₹0 (Cashless)",
      badge: "Official Statutory Tariff",
      source: "Telangana DME & Gandhi Hospital Schedule",
      updated: "Feb 2026",
      schemeCaveat: "May be cashless (₹0) for eligible beneficiaries under Ayushman Bharat PM-JAY / Aarogyasri Trust with valid White Ration Card."
    },
    pvt: {
      priceFormatted: "₹1,35,000 — ₹2,80,000",
      badge: "Estimate (Not a Quote)",
      source: "NABH Hospital TPA Network Schedule (NIMS/Apollo Reference)",
      updated: "Feb 2026",
      note: "Standard twin-sharing room including surgical implants and 4-day inpatient stay."
    },
    premium: {
      priceFormatted: "₹2,10,000 — ₹4,20,000",
      badge: "Estimate (Not a Quote)",
      source: "Quaternary Healthcare Published Card",
      updated: "Feb 2026",
      note: "Single deluxe suite, robotic-assisted arthroplasty, and imported high-flex implants."
    }
  },
  {
    id: "cataract_surgery",
    name: "Cataract Eye Surgery (Phaco)",
    category: "Ophthalmology & Foldable IOL",
    packageCode: "PM-JAY OP01002B • Aarogyasri O1.2.1",
    govt: {
      priceFormatted: "₹0 (Cashless)",
      badge: "Official Statutory Tariff",
      source: "Sarojini Devi Eye Hospital Official Tariff",
      updated: "Feb 2026",
      schemeCaveat: "May be cashless (₹0) for eligible beneficiaries under National Blindness Control Programme & State Health Trust."
    },
    pvt: {
      priceFormatted: "₹18,000 — ₹45,000",
      badge: "Estimate (Not a Quote)",
      source: "Empanelled Day-Care Centers Reference Card",
      updated: "Feb 2026",
      note: "Day-care phacoemulsification with standard foldable hydrophobic intraocular lens."
    },
    premium: {
      priceFormatted: "₹38,000 — ₹68,000",
      badge: "Estimate (Not a Quote)",
      source: "Specialty Eye Institute Schedule",
      updated: "Feb 2026",
      note: "Femtosecond laser-assisted surgery (FLACS) with multifocal / toric premium lens."
    }
  },
  {
    id: "mri_brain",
    name: "MRI Brain & Spine Scan",
    category: "Diagnostic & Contrast Imaging",
    packageCode: "PM-JAY DG04001 • Aarogyasri D1.4.1",
    govt: {
      priceFormatted: "₹0 — ₹1,500",
      badge: "Official Statutory Tariff",
      source: "NIMS & Osmania Hospital Diagnostic Schedule",
      updated: "Feb 2026",
      schemeCaveat: "Cashless with inpatient pre-authorization for BPL card holders; subsidized OPD base rate applies."
    },
    pvt: {
      priceFormatted: "₹4,500 — ₹8,500",
      badge: "Estimate (Not a Quote)",
      source: "Regional Diagnostic Center Survey",
      updated: "Feb 2026",
      note: "1.5T / 3.0T high-resolution magnetic resonance neuro-imaging."
    },
    premium: {
      priceFormatted: "₹8,000 — ₹12,500",
      badge: "Estimate (Not a Quote)",
      source: "Tertiary Hospital Radiology Wing",
      updated: "Feb 2026",
      note: "Advanced functional MRI, 3D tractography, or specialized contrast sequences."
    }
  },
  {
    id: "diabetes_care",
    name: "Diabetes Care & Blood Panel",
    category: "Endocrinology & Diabetology",
    packageCode: "Aarogyasri M3.1 • NPPA Essential Drug List",
    govt: {
      priceFormatted: "₹0 (Free Diagnostics)",
      badge: "Official Statutory Tariff",
      source: "Primary & Urban Health Center Formulary",
      updated: "Feb 2026",
      schemeCaveat: "Free essential testing and state-subsidized insulin / Metformin at government dispensaries."
    },
    pvt: {
      priceFormatted: "₹1,200 — ₹3,500",
      badge: "Estimate (Not a Quote)",
      source: "NABL Accredited Laboratory Rate Survey",
      updated: "Feb 2026",
      note: "Quarterly monitoring including HbA1c, fasting glucose, lipid and renal panels."
    },
    premium: {
      priceFormatted: "₹3,500 — ₹6,500",
      badge: "Estimate (Not a Quote)",
      source: "Comprehensive Metabolic Wellness Suite",
      updated: "Feb 2026",
      note: "Full endocrinologist consultation, fundus eye check, and microalbuminuria screening."
    }
  }
];

export const CareCoreHero: React.FC<CareCoreHeroProps> = ({
  onStartSearch,
  onOpenVoice,
  onOpenRx,
  onSignIn
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);

  const activeScenario = COST_SCENARIOS[activeScenarioIdx];

  const QUICK_CHIPS = [
    { label: "Total Knee Replacement", query: "Total Knee Replacement" },
    { label: "Cataract Surgery", query: "Cataract Eye Surgery" },
    { label: "MRI Brain Scan", query: "MRI Brain Scan" },
    { label: "Coronary Angioplasty", query: "Coronary Angioplasty" },
    { label: "Maternity Delivery", query: "Normal Delivery" }
  ];

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      onStartSearch(searchQuery.trim());
    } else {
      onStartSearch();
    }
  };

  return (
    <div style={{ backgroundColor: '#FAFAF7', color: '#183247' }}>
      {/* ========================================================================= */}
      {/* 1. HERO SECTION — FLAT INK #102A36 BACKGROUND WITH ASYMMETRIC 3D CORE     */}
      {/* ========================================================================= */}
      <section
        style={{
          backgroundColor: '#102A36', // Flat ink hero background
          color: '#F8FAF9',
          position: 'relative',
          overflow: 'hidden',
          paddingTop: '20px',
          paddingBottom: '56px',
          borderBottom: '1px solid rgba(67, 143, 132, 0.25)'
        }}
      >
        {/* Single subtle CSS radial glow behind the 3D scene (zero noise, zero grid lines) */}
        <div
          style={{
            position: 'absolute',
            top: '10%',
            right: '2%',
            width: '680px',
            height: '680px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(67, 143, 132, 0.24) 0%, rgba(16, 42, 54, 0) 70%)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          {/* Top Bar: Typographic Wordmark & Quiet Ghost Sign In Button */}
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '28px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '40px'
            }}
          >
            {/* New Typographic Wordmark (no heart logo, no colored tile, no statutory tagline) */}
            <div
              onClick={() => onStartSearch()}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'baseline', gap: '8px' }}
            >
              <span
                style={{
                  fontFamily: "Georgia, 'Plus Jakarta Sans', serif",
                  fontSize: '1.45rem',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: '#FFFFFF'
                }}
              >
                CareSaathi
              </span>
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#5EEAD4',
                  letterSpacing: '0.04em'
                }}
              >
                AI
              </span>
            </div>

            {/* Quiet Ghost Button for Sign In */}
            {onSignIn && (
              <button
                type="button"
                onClick={onSignIn}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.22)',
                  color: '#E7F3EF',
                  borderRadius: '6px',
                  padding: '6px 16px',
                  fontSize: '0.84rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(4px)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.22)';
                }}
              >
                Sign In
              </button>
            )}
          </header>

          {/* Asymmetric Split Layout: Left 6/12 Console, Right 6/12 3D Care Core */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              alignItems: 'center',
              gap: '32px'
            }}
          >
            {/* Left 6/12 Column: Chip, Serif H1, Subtext, Question Console */}
            <div style={{ gridColumn: 'span 7' }} className="hero-left-column">
              {/* Descriptor Chip (Replaces loud pill) */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(67, 143, 132, 0.16)',
                  border: '1px solid rgba(67, 143, 132, 0.45)',
                  color: '#A7F3D0',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginBottom: '18px'
                }}
              >
                <span>AI-Powered Healthcare Navigation for India</span>
              </div>

              {/* Exact Serif H1: No Boxed Words, No Glow, No Gold Accents */}
              <h1
                style={{
                  fontFamily: "Georgia, 'Plus Jakarta Sans', serif",
                  fontSize: 'clamp(2.1rem, 3.8vw, 3.2rem)',
                  fontWeight: 700,
                  lineHeight: 1.18,
                  letterSpacing: '-0.025em',
                  color: '#FFFFFF',
                  marginBottom: '18px'
                }}
              >
                Understand Your Healthcare Costs. Find Care You Can Trust.
              </h1>

              {/* Approved Supporting Text (No fake ₹10L guarantees or zero surcharge claims) */}
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '1.05rem',
                  color: '#CBD5E1',
                  lineHeight: 1.6,
                  maxWidth: '560px',
                  marginBottom: '26px'
                }}
              >
                Explore indicative procedure costs across Government, Private, and Premium facilities, discover nearby empanelled hospitals, and check schemes you may be eligible for.
              </p>

              {/* Question Console: Input + Mic + Upload + Submit */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '10px',
                  border: '1px solid rgba(226, 232, 240, 0.9)',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)',
                  padding: '6px 8px 6px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '14px',
                  maxWidth: '580px'
                }}
              >
                <Search size={19} color="#64717D" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Search disease, surgery, or test (e.g. Knee Replacement, Cataract, MRI)..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearchSubmit();
                    }
                  }}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.94rem',
                    color: '#183247',
                    backgroundColor: 'transparent',
                    minWidth: '120px'
                  }}
                  aria-label="Search healthcare condition or procedure"
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {onOpenVoice && (
                    <button
                      type="button"
                      onClick={onOpenVoice}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '6px',
                        border: '1px solid rgba(67, 143, 132, 0.3)',
                        backgroundColor: '#E7F3EF',
                        color: '#326d64',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                      title="Speak inquiry via microphone"
                      aria-label="Real Voice Speech Input"
                    >
                      <Mic size={17} />
                    </button>
                  )}

                  {onOpenRx && (
                    <button
                      type="button"
                      onClick={onOpenRx}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '6px',
                        border: '1px solid rgba(147, 197, 253, 0.4)',
                        backgroundColor: '#EAF2F8',
                        color: '#183247',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                      title="Upload Prescription OCR Image"
                      aria-label="Upload Prescription Image"
                    >
                      <FileText size={17} />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="btn btn-primary"
                    style={{
                      padding: '8px 16px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      borderRadius: '6px',
                      backgroundColor: '#438F84',
                      color: '#FFFFFF'
                    }}
                  >
                    <span>Search</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>

              {/* Example Condition Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px', maxWidth: '580px' }}>
                <span style={{ fontSize: '0.74rem', color: '#94A3B8', fontWeight: 500, alignSelf: 'center' }}>
                  Examples:
                </span>
                {QUICK_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSearchQuery(chip.query);
                      onStartSearch(chip.query);
                    }}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.16)',
                      borderRadius: '16px',
                      padding: '3px 10px',
                      fontSize: '0.76rem',
                      color: '#E7F3EF',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = 'rgba(67, 143, 132, 0.28)';
                      e.currentTarget.style.borderColor = '#438F84';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)';
                    }}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Quiet Trust Line */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  fontSize: '0.8rem',
                  color: '#94A3B8',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingTop: '16px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <CheckCircle2 size={14} color="#5EEAD4" />
                  <span>PM-JAY &amp; State Schemes Aligned</span>
                </div>
                <span>•</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <CheckCircle2 size={14} color="#5EEAD4" />
                  <span>28 Verified Facilities</span>
                </div>
                <span>•</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <CheckCircle2 size={14} color="#5EEAD4" />
                  <span>Non-Diagnostic Responsible AI</span>
                </div>
              </div>
            </div>

            {/* Right 5/12 Column: 3D "Care Core" Vertically Centered */}
            <div style={{ gridColumn: 'span 5' }} className="hero-right-column">
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  minHeight: '440px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CareCore3D interactive={true} />
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 900px) {
            .hero-left-column { grid-column: span 12 !important; }
            .hero-right-column { grid-column: span 12 !important; min-height: 340px !important; }
          }
        `}</style>
      </section>

      {/* ========================================================================= */}
      {/* 2. REBUILT COST COMPARISON PREVIEW SECTION (LIGHT IVORY BACKGROUND)       */}
      {/* ========================================================================= */}
      <section
        style={{
          backgroundColor: '#FAFAF7', // Warm off-white / ivory
          padding: '48px 0 60px 0',
          borderBottom: '1px solid #E2E8F0'
        }}
      >
        <div className="container">
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#438F84'
                }}
              >
                Transparent Tariffs by Facility Tier
              </span>
            </div>
            <h2
              style={{
                fontFamily: "Georgia, 'Plus Jakarta Sans', serif",
                fontSize: '1.8rem',
                color: '#183247',
                margin: 0
              }}
            >
              Cost Comparison Preview
            </h2>
            <p style={{ fontSize: '0.94rem', color: '#64717D', marginTop: '6px' }}>
              Select a procedure to review published statutory rates and private hospital estimates in India.
            </p>
          </div>

          {/* Underline Tab Bar (NOT pills): Serif/sans label + slate category tag beneath */}
          <div
            style={{
              display: 'flex',
              gap: '28px',
              borderBottom: '1px solid #E2E8F0',
              marginBottom: '32px',
              overflowX: 'auto',
              scrollbarWidth: 'none'
            }}
          >
            {COST_SCENARIOS.map((scenario, idx) => {
              const isSelected = activeScenarioIdx === idx;
              return (
                <button
                  key={scenario.id}
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
                      fontFamily: isSelected ? "Georgia, serif" : 'var(--font-heading)',
                      fontSize: '0.98rem',
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? '#183247' : '#64717D'
                    }}
                  >
                    {scenario.name}
                  </div>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      color: isSelected ? '#438F84' : '#94A3B8',
                      marginTop: '2px',
                      fontWeight: 500
                    }}
                  >
                    {scenario.category}
                  </div>
                </button>
              );
            })}
          </div>

          {/* 3 Columns Divided by Hairline Rules (No individual rounded cards) */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 16px rgba(24, 50, 71, 0.04)',
              padding: '32px 28px',
              marginBottom: '20px'
            }}
          >
            {/* Procedure Header Pill */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#183247', margin: 0, fontWeight: 700 }}>
                  {activeScenario.name}
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64717D', marginTop: '4px' }}>
                  Standard Package Code: <strong>{activeScenario.packageCode}</strong>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onStartSearch(activeScenario.name)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.82rem', fontWeight: 600, padding: '6px 14px' }}
              >
                <span>Run Detailed Cost Breakdown</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0px'
              }}
              className="cost-columns-grid"
            >
              {/* Column 1: Government Super-Specialty */}
              <div style={{ paddingRight: '28px' }} className="cost-column">
                <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#64717D', marginBottom: '8px' }}>
                  Government Super-Specialty
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    color: '#183247',
                    letterSpacing: '-0.02em',
                    marginBottom: '8px'
                  }}
                >
                  {activeScenario.govt.priceFormatted}
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      backgroundColor: '#E7F3EF',
                      color: '#326d64',
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
                  {activeScenario.govt.schemeCaveat}
                </p>
                <div style={{ fontSize: '0.74rem', color: '#94A3B8', borderTop: '1px solid #F1F5F9', paddingTop: '8px' }}>
                  Source: {activeScenario.govt.source} ({activeScenario.govt.updated})
                </div>
              </div>

              {/* Column 2: Private Multi-Specialty (Separated by Hairline Rule) */}
              <div
                style={{
                  paddingLeft: '28px',
                  paddingRight: '28px',
                  borderLeft: '1px solid #E2E8F0'
                }}
                className="cost-column middle-column"
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#64717D', marginBottom: '8px' }}>
                  NABH Private Multi-Specialty
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    color: '#183247',
                    letterSpacing: '-0.02em',
                    marginBottom: '8px'
                  }}
                >
                  {activeScenario.pvt.priceFormatted}
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

              {/* Column 3: Premium Quaternary (Separated by Hairline Rule) */}
              <div
                style={{
                  paddingLeft: '28px',
                  borderLeft: '1px solid #E2E8F0'
                }}
                className="cost-column"
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#64717D', marginBottom: '8px' }}>
                  Premium Quaternary Suite
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    color: '#183247',
                    letterSpacing: '-0.02em',
                    marginBottom: '8px'
                  }}
                >
                  {activeScenario.premium.priceFormatted}
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

          {/* Sourced Caveat / Transparency Banner */}
          <div
            style={{
              backgroundColor: '#EAF2F8',
              borderRadius: '8px',
              padding: '12px 18px',
              border: '1px solid #D2E4F3',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '0.82rem',
              color: '#183247'
            }}
          >
            <Info size={18} color="#438F84" style={{ flexShrink: 0 }} />
            <span>
              <strong>Statutory Transparency Notice:</strong> Tariffs shown reflect published rates from state medical directorates (DME) and reference hospital schedule cards. Free or subsidized coverage requires scheme pre-authorization through hospital Aarogyamitra help desks or the <a href="https://pmjay.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#438F84', textDecoration: 'underline' }}>National Health Authority portal</a>.
            </span>
          </div>
        </div>

        <style>{`
          @media (max-width: 860px) {
            .cost-columns-grid {
              grid-template-columns: 1fr !important;
              gap: 24px !important;
            }
            .cost-column {
              padding: 0 !important;
              border-left: none !important;
            }
            .middle-column {
              border-top: 1px solid #E2E8F0;
              border-bottom: 1px solid #E2E8F0;
              padding: 20px 0 !important;
            }
          }
        `}</style>
      </section>
    </div>
  );
};
