import React from 'react';
import { Heart, ShieldCheck, PhoneCall, ExternalLink, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  setActiveTab: (tab: string) => void;
  onReplayIntro?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab, onReplayIntro }) => {
  const { t } = useLanguage();

  return (
    <footer style={{
      backgroundColor: 'var(--color-navy)',
      color: 'var(--color-white)',
      padding: '50px 0 24px 0',
      marginTop: 'auto'
    }}>
      <div className="container">
        <div className="grid-4" style={{ marginBottom: '40px' }}>
          {/* Col 1: About CareSaathi */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <Heart size={18} fill="white" />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800 }}>
                CareSaathi <span style={{ color: 'var(--color-teal-light)' }}>AI</span>
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.6, marginBottom: '16px' }}>
              Empowering Indian families with transparent treatment cost estimates, nearby verified care facilities, and government health scheme navigation.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#E2E8F0', backgroundColor: 'rgba(255,255,255,0.08)', padding: '6px 12px', borderRadius: 'var(--radius-full)' }}>
              <ShieldCheck size={14} color="var(--color-teal-light)" />
              <span>Responsible Healthcare AI Prototype</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 style={{ color: 'white', fontSize: '1rem', marginBottom: '16px' }}>Quick Navigation</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <li>
                <span onClick={() => setActiveTab('landing')} style={{ color: '#94A3B8', cursor: 'pointer' }}>
                  {t('navHome')}
                </span>
              </li>
              <li>
                <span onClick={() => setActiveTab('estimate')} style={{ color: '#94A3B8', cursor: 'pointer' }}>
                  {t('navEstimate')}
                </span>
              </li>
              <li>
                <span onClick={() => setActiveTab('hospitals')} style={{ color: '#94A3B8', cursor: 'pointer' }}>
                  {t('navFindHospitals')}
                </span>
              </li>
              <li>
                <span onClick={() => setActiveTab('schemes')} style={{ color: '#94A3B8', cursor: 'pointer' }}>
                  {t('navFinancialSupport')}
                </span>
              </li>
              <li>
                <span onClick={() => setActiveTab('methodology')} style={{ color: '#94A3B8', cursor: 'pointer' }}>
                  {t('navHowItWorks')} & Methodology
                </span>
              </li>
              {onReplayIntro && (
                <li>
                  <span onClick={onReplayIntro} style={{ color: 'var(--color-teal-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    ✨ Replay Experience Intro
                  </span>
                </li>
              )}
            </ul>
          </div>

          {/* Col 3: Government Health Helplines */}
          <div>
            <h4 style={{ color: 'white', fontSize: '1rem', marginBottom: '16px' }}>Emergency & Helplines</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PhoneCall size={14} color="var(--color-coral)" />
                <span style={{ color: '#E2E8F0', fontWeight: 600 }}>108</span>
                <span style={{ color: '#94A3B8' }}>National Emergency Ambulance</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PhoneCall size={14} color="var(--color-teal-light)" />
                <span style={{ color: '#E2E8F0', fontWeight: 600 }}>104</span>
                <span style={{ color: '#94A3B8' }}>Telangana Health Helpline</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PhoneCall size={14} color="var(--color-teal-light)" />
                <span style={{ color: '#E2E8F0', fontWeight: 600 }}>14555</span>
                <span style={{ color: '#94A3B8' }}>Ayushman Bharat PM-JAY</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PhoneCall size={14} color="var(--color-teal-light)" />
                <span style={{ color: '#E2E8F0', fontWeight: 600 }}>1800-180-8080</span>
                <span style={{ color: '#94A3B8' }}>PM Jan Aushadhi</span>
              </div>
            </div>
          </div>

          {/* Col 4: Important Public Disclaimer */}
          <div>
            <h4 style={{ color: 'white', fontSize: '1rem', marginBottom: '16px' }}>Clinical Disclaimer</h4>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              fontSize: '0.78rem',
              color: '#94A3B8',
              lineHeight: 1.5
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#E2E8F0', fontWeight: 700, marginBottom: '4px' }}>
                <Info size={14} color="var(--color-coral)" />
                <span>Not a Medical Diagnosis System</span>
              </div>
              CareSaathi AI is an informational healthcare directory. Symptom descriptions are not clinical diagnoses. All costs are indicative estimates based on published or reference tariffs. Final quotations and scheme pre-authorizations must be confirmed at the facility.
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.8rem',
          color: '#64748B'
        }}>
          <div>
            &copy; 2026 CareSaathi AI. Built for the VNR Hackathon. Designed for Indian families and healthcare equity.
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Privacy-First Architecture</span>
            <span>•</span>
            <span>Zero Unconsented Health Storage</span>
            <span>•</span>
            <span>OpenStreetMap & NHA Data</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
