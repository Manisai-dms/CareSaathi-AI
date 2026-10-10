// ==============================================================================
// CareSaathi AI - Upgraded Homepage & Hero Centerpiece
// Features: Premium 3D Healthcare Orb centerpiece, live question input bar,
// microphone & prescription triggers, brand color palette & glassmorphism.
// ==============================================================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { 
  ArrowRight, 
  Search, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  DollarSign, 
  Mic, 
  FileText, 
  Sparkles, 
  Info,
  Clock,
  Compass,
  Zap,
  Activity
} from 'lucide-react';

interface LandingPageProps {
  onStartSearch: (query?: string) => void;
  onExploreCost: () => void;
  onExploreHospitals: () => void;
  onExploreSchemes: () => void;
  onHowItWorks: () => void;
  onOpenVoice?: () => void;
  onOpenRx?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartSearch,
  onExploreCost,
  onExploreHospitals,
  onExploreSchemes,
  onHowItWorks,
  onOpenVoice,
  onOpenRx
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const QUICK_CONDITIONS = [
    { label: "Total Knee Replacement", query: "Total Knee Replacement" },
    { label: "Cataract Surgery", query: "Cataract Eye Surgery" },
    { label: "MRI Brain Scan", query: "MRI Brain Scan" },
    { label: "Heart Stent / Angioplasty", query: "Heart Stent Angioplasty" },
    { label: "Dialysis Care", query: "Kidney Dialysis" }
  ];

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      onStartSearch(searchQuery.trim());
    } else {
      onStartSearch();
    }
  };

  const handleChipClick = (query: string) => {
    setSearchQuery(query);
    onStartSearch(query);
  };

  return (
    <div>
      {/* ========================================================================= */}
      {/* HERO SECTION — 3D HEALTHCARE CENTERPIECE + LIVE QUESTION INPUT */}
      {/* ========================================================================= */}
      <section style={{
        background: 'radial-gradient(ellipse at 80% 20%, rgba(231, 243, 239, 0.7) 0%, rgba(250, 250, 247, 0.9) 60%, #FAFAF7 100%)',
        borderBottom: '1px solid var(--color-border)',
        padding: '54px 0 74px 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle ambient light gradient glow behind the 3D object */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(67, 143, 132, 0.12) 0%, rgba(94, 234, 212, 0.05) 50%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="grid-2" style={{ alignItems: 'center', gap: '44px' }}>
            
            {/* Left Hero Content: Headline, Search Bar, Voice/Rx & CTAs */}
            <div>
              <div className="badge badge-teal" style={{ marginBottom: '16px', padding: '6px 14px' }}>
                <Sparkles size={14} />
                <span>AI-Powered Healthcare Navigation for India</span>
              </div>

              <h1 style={{
                fontSize: 'clamp(2.2rem, 3.8vw, 3.3rem)',
                color: 'var(--color-navy)',
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                marginBottom: '18px',
                fontWeight: 800
              }}>
                {t('heroHeadline')}
              </h1>

              <p style={{
                fontSize: '1.1rem',
                color: 'var(--color-text-grey)',
                lineHeight: 1.6,
                marginBottom: '26px',
                maxWidth: '540px'
              }}>
                {t('heroSubtitle')}
              </p>

              {/* LIVE HEALTHCARE QUESTION INPUT WITH VOICE & PRESCRIPTION BUTTONS */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: '1.5px solid var(--color-border)',
                boxShadow: 'var(--shadow-md)',
                padding: '8px 10px 8px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '14px',
                maxWidth: '560px',
                transition: 'all 0.2s ease',
              }}>
                <Search size={20} color="var(--color-text-grey)" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Ask a medical cost, surgery, or test..."
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
                    fontSize: '0.98rem',
                    color: 'var(--color-navy)',
                    backgroundColor: 'transparent',
                    minWidth: '130px'
                  }}
                  aria-label="Search disease, procedure, or hospital"
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {onOpenVoice && (
                    <button
                      type="button"
                      onClick={onOpenVoice}
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        border: '1px solid rgba(67, 143, 132, 0.3)',
                        backgroundColor: 'var(--color-mint)',
                        color: 'var(--color-teal-dark)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      title="Speak inquiry via Microphone"
                      aria-label="Real Voice Search"
                    >
                      <Mic size={18} />
                    </button>
                  )}

                  {onOpenRx && (
                    <button
                      type="button"
                      onClick={onOpenRx}
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        border: '1px solid rgba(147, 197, 253, 0.4)',
                        backgroundColor: 'var(--color-light-blue)',
                        color: 'var(--color-navy)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      title="Upload Prescription OCR Image"
                      aria-label="Upload Prescription Image"
                    >
                      <FileText size={18} />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="btn btn-primary"
                    style={{ padding: '9px 18px', fontSize: '0.92rem', fontWeight: 700 }}
                  >
                    <span>Explore</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              {/* Quick condition chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px', maxWidth: '560px' }}>
                <span style={{ fontSize: '0.76rem', color: 'var(--color-text-grey)', fontWeight: 600, alignSelf: 'center' }}>
                  Popular:
                </span>
                {QUICK_CONDITIONS.map((cond, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleChipClick(cond.query)}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.85)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '20px',
                      padding: '4px 11px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: 'var(--color-navy)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = 'var(--color-mint)';
                      e.currentTarget.style.borderColor = 'var(--color-teal)';
                      e.currentTarget.style.color = 'var(--color-teal-dark)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                      e.currentTarget.style.color = 'var(--color-navy)';
                    }}
                  >
                    {cond.label}
                  </button>
                ))}
              </div>

              {/* Call to action buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '28px' }}>
                <button
                  onClick={() => onStartSearch()}
                  className="btn btn-primary btn-lg"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: 800 }}
                >
                  <span>Start 5-Step Journey</span>
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={onHowItWorks}
                  className="btn btn-secondary btn-lg"
                >
                  <span>{t('howItWorksBtn')}</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '18px',
                fontSize: '0.84rem',
                color: 'var(--color-text-grey)',
                borderTop: '1px solid var(--color-border)',
                paddingTop: '18px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} color="var(--color-teal)" />
                  <span>PM-JAY & Aarogyasri Aligned</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} color="var(--color-teal)" />
                  <span>Pan-India Facility Registry</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} color="var(--color-teal)" />
                  <span>Non-Diagnostic Responsible AI</span>
                </div>
              </div>
            </div>

            {/* Right Hero: Live Healthcare Tariff Preview Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <div style={{
                position: 'relative',
                borderRadius: '24px',
                background: 'linear-gradient(145deg, rgba(231, 243, 239, 0.8) 0%, rgba(234, 242, 248, 0.9) 100%)',
                border: '1.5px solid rgba(67, 143, 132, 0.28)',
                boxShadow: '0 20px 45px rgba(24, 50, 71, 0.08)',
                padding: '24px',
              }}>
                {/* Floating Live Badge */}
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '24px',
                  backgroundColor: 'var(--color-navy)',
                  color: '#A7F3D0',
                  border: '1px solid var(--color-teal)',
                  borderRadius: '20px',
                  padding: '4px 14px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(24, 50, 71, 0.25)'
                }}>
                  <Activity size={12} color="#5EEAD4" />
                  <span>Live Indicative Tariffs</span>
                </div>

                {/* Main Preview Container */}
                <div style={{
                  backgroundColor: 'var(--color-white)',
                  borderRadius: '16px',
                  padding: '22px',
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid var(--color-border)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-teal">Live Care Preview</span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--color-teal-dark)', fontWeight: 700 }}>
                        NABH Verified
                      </span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-grey)' }}>
                      Hyderabad, Telangana
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', color: 'var(--color-navy)', marginBottom: '4px', fontWeight: 800 }}>
                    Total Knee Replacement (TKR)
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-grey)', marginBottom: '16px' }}>
                    Unilateral Joint Arthroplasty • 3-5 Days Stay
                  </div>

                  {/* Range Block */}
                  <div style={{
                    backgroundColor: 'var(--color-warm-bg)',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    marginBottom: '16px',
                    border: '1px solid var(--color-border)'
                  }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-text-grey)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                      Estimated Range in Hyderabad
                    </div>
                    <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-navy)', marginTop: '2px' }}>
                      ₹0 (Govt / Free) — ₹2,90,000 (Private)
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-teal-dark)', fontWeight: 600, marginTop: '4px' }}>
                      ✓ High Data Confidence • Verified NIMS &amp; Apollo Tariffs
                    </div>
                  </div>

                  {/* 3-Tier Overview Pill */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ backgroundColor: 'var(--color-mint)', borderRadius: '8px', padding: '8px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--color-teal-dark)', fontWeight: 700 }}>Govt Hospital</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-navy)' }}>₹0</div>
                    </div>
                    <div style={{ backgroundColor: 'var(--color-light-blue)', borderRadius: '8px', padding: '8px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.68rem', color: '#1E40AF', fontWeight: 700 }}>NABH Pvt</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-navy)' }}>₹1.6L - ₹2.5L</div>
                    </div>
                    <div style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', padding: '8px 10px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--color-text-grey)', fontWeight: 700 }}>Premium</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-navy)' }}>₹2.8L - ₹4.2L</div>
                    </div>
                  </div>

                  {/* Scheme Eligibility Tag */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: 'var(--color-mint)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    marginBottom: '16px',
                    fontSize: '0.82rem',
                    color: 'var(--color-teal-dark)',
                    border: '1px solid rgba(67, 143, 132, 0.25)'
                  }}>
                    <ShieldCheck size={18} color="var(--color-teal)" style={{ flexShrink: 0 }} />
                    <div>
                      <strong>Aarogyasri / PM-JAY Match:</strong> 100% Cashless for eligible White Card families up to ₹10 Lakhs.
                    </div>
                  </div>

                  {/* Fast Action */}
                  <button
                    onClick={() => onStartSearch()}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '12px', fontSize: '0.95rem', fontWeight: 700 }}
                  >
                    <span>Run Full Search for Your Treatment</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* THREE PROMINENT PILLARS OF HEALTHCARE NAVIGATION */}
      {/* ========================================================================= */}
      <section className="section" style={{ backgroundColor: 'var(--color-white)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 48px auto' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '12px', color: 'var(--color-navy)' }}>
              Three Essential Questions Answered in One Place
            </h2>
            <p style={{ color: 'var(--color-text-grey)', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Designed specifically to alleviate healthcare cost anxiety and navigation friction for Indian families.
            </p>
          </div>

          <div className="grid-3">
            {/* Feature 1: Procedure Cost Estimation */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', borderRadius: '18px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-mint)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-teal)',
                marginBottom: '18px'
              }}>
                <DollarSign size={26} />
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', color: 'var(--color-navy)' }}>
                {t('featCostTitle')}
              </h3>
              <p style={{ color: 'var(--color-text-grey)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '22px', flex: 1 }}>
                {t('featCostDesc')} Understand what surgeon fees, room rent, implants, and diagnostics contribute to total billing across Government, NABH Private, and Premium tiers.
              </p>
              <button
                onClick={onExploreCost}
                className="btn btn-secondary btn-sm"
                style={{ alignSelf: 'flex-start', fontWeight: 700 }}
              >
                <span>Estimate Procedure Cost</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Feature 2: Hospital Discovery */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', borderRadius: '18px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-light-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-navy)',
                marginBottom: '18px'
              }}>
                <MapPin size={26} />
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', color: 'var(--color-navy)' }}>
                {t('featHospTitle')}
              </h3>
              <p style={{ color: 'var(--color-text-grey)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '22px', flex: 1 }}>
                {t('featHospDesc')} Spatial distance calculation, verified treatment availability, bed tariffs, and empanelment listings across all Indian districts.
              </p>
              <button
                onClick={onExploreHospitals}
                className="btn btn-secondary btn-sm"
                style={{ alignSelf: 'flex-start', fontWeight: 700 }}
              >
                <span>Find Nearby Facilities</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Feature 3: Government Scheme Matching */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', borderRadius: '18px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                backgroundColor: '#FFF4E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D97706',
                marginBottom: '18px'
              }}>
                <ShieldCheck size={26} />
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', color: 'var(--color-navy)' }}>
                {t('featSchemeTitle')}
              </h3>
              <p style={{ color: 'var(--color-text-grey)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '22px', flex: 1 }}>
                {t('featSchemeDesc')} Check whether your ration card, income, or state residence qualifies for PM-JAY and state schemes like Aarogyasri with package ceiling rates.
              </p>
              <button
                onClick={onExploreSchemes}
                className="btn btn-secondary btn-sm"
                style={{ alignSelf: 'flex-start', fontWeight: 700 }}
              >
                <span>Check Scheme Eligibility</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3-STEP EXPLANATION WITH REFINED CARD DEPTH */}
      {/* ========================================================================= */}
      <section style={{
        backgroundColor: 'var(--color-warm-bg)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
        padding: '64px 0'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 40px auto' }}>
            <h2 style={{ fontSize: '1.9rem', marginBottom: '10px', color: 'var(--color-navy)' }}>
              Simple 3-Step Navigation Flow
            </h2>
            <p style={{ color: 'var(--color-text-grey)', fontSize: '0.95rem' }}>
              No medical jargon required. Accessible via text, voice speech, or prescription upload.
            </p>
          </div>

          <div className="grid-3">
            <div style={{
              backgroundColor: 'var(--color-white)',
              borderRadius: 'var(--radius-lg)',
              padding: '26px',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-mint)',
                color: 'var(--color-teal-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.9rem',
                marginBottom: '14px'
              }}>
                1
              </div>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--color-navy)',
                marginBottom: '8px'
              }}>
                {t('step1Title')}
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-text-grey)', lineHeight: 1.5 }}>
                {t('step1Desc')} Natural language entity parsing extracts symptoms, procedures, and localities automatically.
              </p>
            </div>

            <div style={{
              backgroundColor: 'var(--color-white)',
              borderRadius: 'var(--radius-lg)',
              padding: '26px',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-light-blue)',
                color: 'var(--color-navy)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.9rem',
                marginBottom: '14px'
              }}>
                2
              </div>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--color-navy)',
                marginBottom: '8px'
              }}>
                {t('step2Title')}
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-text-grey)', lineHeight: 1.5 }}>
                {t('step2Desc')} Transparently view government, charitable, and private options with detailed component breakdowns.
              </p>
            </div>

            <div style={{
              backgroundColor: 'var(--color-white)',
              borderRadius: 'var(--radius-lg)',
              padding: '26px',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#FFF4E5',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.9rem',
                marginBottom: '14px'
              }}>
                3
              </div>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--color-navy)',
                marginBottom: '8px'
              }}>
                {t('step3Title')}
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-text-grey)', lineHeight: 1.5 }}>
                {t('step3Desc')} Verify PM-JAY and Aarogyasri package codes and get connected directly to official helplines and directions.
              </p>
            </div>
          </div>

          {/* Transparent Caveat Box */}
          <div style={{
            marginTop: '36px',
            backgroundColor: 'var(--color-light-blue)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 20px',
            border: '1px solid #d2e4f3',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.85rem',
            color: 'var(--color-navy)'
          }}>
            <Info size={20} color="var(--color-teal)" style={{ flexShrink: 0 }} />
            <span>
              <strong>Transparency Note:</strong> All estimated prices are indicative ranges based on published hospital tariffs and reference surveys. Official scheme eligibility requires verification by hospital Aarogyamitras or the National Health Authority portal.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
