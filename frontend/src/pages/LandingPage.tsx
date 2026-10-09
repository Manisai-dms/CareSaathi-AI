import React from 'react';
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
  Layers, 
  Info, 
  Building2, 
  Sparkles, 
  Heart,
  Activity
} from 'lucide-react';

interface LandingPageProps {
  onStartSearch: () => void;
  onExploreCost: () => void;
  onExploreHospitals: () => void;
  onExploreSchemes: () => void;
  onHowItWorks: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartSearch,
  onExploreCost,
  onExploreHospitals,
  onExploreSchemes,
  onHowItWorks
}) => {
  const { t } = useLanguage();

  return (
    <div>
      {/* HERO SECTION */}
      <section style={{
        backgroundColor: 'var(--color-white)',
        borderBottom: '1px solid var(--color-border)',
        padding: '70px 0 80px 0'
      }}>
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center', gap: '48px' }}>
            {/* Left Hero Content */}
            <div>
              <div className="badge badge-teal" style={{ marginBottom: '16px', padding: '6px 14px' }}>
                <Sparkles size={14} />
                <span>AI-Powered Healthcare Navigation for India</span>
              </div>
              <h1 style={{
                fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
                color: 'var(--color-navy)',
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                marginBottom: '20px'
              }}>
                {t('heroHeadline')}
              </h1>
              <p style={{
                fontSize: '1.12rem',
                color: 'var(--color-text-grey)',
                lineHeight: 1.6,
                marginBottom: '32px',
                maxWidth: '540px'
              }}>
                {t('heroSubtitle')}
              </p>

              {/* Call to action buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '32px' }}>
                <button
                  onClick={onStartSearch}
                  className="btn btn-primary btn-lg"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: 800 }}
                >
                  <span>Get Started</span>
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
                gap: '20px',
                fontSize: '0.85rem',
                color: 'var(--color-text-grey)',
                borderTop: '1px solid var(--color-border)',
                paddingTop: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} color="var(--color-teal)" />
                  <span>PM-JAY & Aarogyasri Aligned</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} color="var(--color-teal)" />
                  <span>OpenStreetMap Facilities</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} color="var(--color-teal)" />
                  <span>Non-Diagnostic Responsible AI</span>
                </div>
              </div>
            </div>

            {/* Right Hero Realistic Product Preview */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div style={{
                background: 'linear-gradient(135deg, var(--color-mint) 0%, var(--color-light-blue) 100%)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid #d2e4f3',
                position: 'relative'
              }}>
                {/* Floating Live Badge */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    right: '24px',
                    backgroundColor: '#12304A',
                    color: '#A7F3D0',
                    border: '1px solid #2C8C83',
                    borderRadius: '20px',
                    padding: '4px 12px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(18, 48, 74, 0.25)'
                  }}
                >
                  <Activity size={12} color="#2C8C83" />
                  <span>Live Indicative Tariffs</span>
                </motion.div>

                {/* Simulated UI Card */}
                <div style={{
                  backgroundColor: 'var(--color-white)',
                  borderRadius: 'var(--radius-md)',
                  padding: '22px',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  {/* Top Bar with Live ECG pulse */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-teal">Live Care Preview</span>
                      <svg width="40" height="18" viewBox="0 0 40 18" fill="none">
                        <motion.path
                          d="M 2 9 L 10 9 L 14 3 L 18 15 L 22 5 L 26 12 L 30 9 L 38 9"
                          stroke="#2C8C83"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          animate={{ pathLength: [0.3, 1, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                      </svg>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-grey)' }}>Hyderabad, Telangana</span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', color: 'var(--color-navy)', marginBottom: '4px' }}>
                    Total Knee Replacement (TKR)
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-grey)', marginBottom: '16px' }}>
                    Unilateral Joint Arthroplasty • 3-5 Days Stay
                  </div>

                  {/* Range Block */}
                  <div style={{
                    backgroundColor: 'var(--color-warm-bg)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    marginBottom: '16px',
                    border: '1px solid var(--color-border)'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-grey)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Estimated Range in Hyderabad
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-navy)', marginTop: '2px' }}>
                      ₹0 (Govt / Free) — ₹2,90,000 (Private)
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-teal-dark)', fontWeight: 600, marginTop: '2px' }}>
                      ✓ High Data Confidence • Verified NIMS &amp; Apollo Rates
                    </div>
                  </div>

                  {/* Scheme Tag */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'var(--color-mint)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    marginBottom: '16px',
                    fontSize: '0.82rem',
                    color: 'var(--color-teal-dark)'
                  }}>
                    <ShieldCheck size={18} color="var(--color-teal)" style={{ flexShrink: 0 }} />
                    <div>
                      <strong>Aarogyasri / PM-JAY Match:</strong> 100% Cashless for eligible White Card families up to ₹10 Lakhs.
                    </div>
                  </div>

                  {/* Fast Action */}
                  <button
                    onClick={onStartSearch}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
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

      {/* THREE PROMINENT FEATURE SECTIONS */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 48px auto' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '12px' }}>
              Three Essential Questions Answered in One Place
            </h2>
            <p style={{ color: 'var(--color-text-grey)', fontSize: '1.05rem' }}>
              Designed specifically to alleviate healthcare cost anxiety and navigation friction for Indian families.
            </p>
          </div>

          <div className="grid-3">
            {/* Feature 1 */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-mint)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-teal)',
                marginBottom: '18px'
              }}>
                <DollarSign size={24} />
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '10px' }}>
                {t('featCostTitle')}
              </h3>
              <p style={{ color: 'var(--color-text-grey)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '20px', flex: 1 }}>
                {t('featCostDesc')} Understand what surgeon fees, room rent, implants, and diagnostics contribute to total billing.
              </p>
              <button
                onClick={onExploreCost}
                className="btn btn-secondary btn-sm"
                style={{ alignSelf: 'flex-start' }}
              >
                <span>Estimate Procedure Cost</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Feature 2 */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-light-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-navy)',
                marginBottom: '18px'
              }}>
                <MapPin size={24} />
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '10px' }}>
                {t('featHospTitle')}
              </h3>
              <p style={{ color: 'var(--color-text-grey)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '20px', flex: 1 }}>
                {t('featHospDesc')} Spatial distance calculation, verified treatment availability, bed tariffs, and empanelment listings.
              </p>
              <button
                onClick={onExploreHospitals}
                className="btn btn-secondary btn-sm"
                style={{ alignSelf: 'flex-start' }}
              >
                <span>Find Nearby Facilities</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Feature 3 */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#FFF4E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D97706',
                marginBottom: '18px'
              }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '10px' }}>
                {t('featSchemeTitle')}
              </h3>
              <p style={{ color: 'var(--color-text-grey)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '20px', flex: 1 }}>
                {t('featSchemeDesc')} Check whether your ration card, income, or employment matches government schemes and package ceiling rates.
              </p>
              <button
                onClick={onExploreSchemes}
                className="btn btn-secondary btn-sm"
                style={{ alignSelf: 'flex-start' }}
              >
                <span>Check Scheme Eligibility</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3-STEP EXPLANATION */}
      <section style={{ backgroundColor: 'var(--color-white)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: '60px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 40px auto' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>
              Simple 3-Step Navigation Flow
            </h2>
            <p style={{ color: 'var(--color-text-grey)', fontSize: '0.95rem' }}>
              No medical jargon required. Accessible via text, voice speech, or prescription upload.
            </p>
          </div>

          <div className="grid-3">
            <div style={{
              backgroundColor: 'var(--color-warm-bg)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              border: '1px solid var(--color-border)'
            }}>
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
              backgroundColor: 'var(--color-warm-bg)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              border: '1px solid var(--color-border)'
            }}>
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
              backgroundColor: 'var(--color-warm-bg)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              border: '1px solid var(--color-border)'
            }}>
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
