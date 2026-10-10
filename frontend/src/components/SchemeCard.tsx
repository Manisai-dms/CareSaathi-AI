import React, { useState } from 'react';
import { 
  Shield, 
  PhoneCall, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  FileCheck, 
  Info, 
  Layers, 
  Building2, 
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { SchemeMatchDTO } from '../services/api';
import { isValidOfficialPortalUrl } from '../config/officialDomains';

interface SchemeCardProps {
  match: SchemeMatchDTO;
  id?: string;
}

export const SchemeCard: React.FC<SchemeCardProps> = ({ match, id }) => {
  const { scheme } = match;
  const [showCombineInfo, setShowCombineInfo] = useState(false);

  // Determine official portal URL with strict allowlist validation
  const rawPortalUrl = scheme.official_portal_url || scheme.official_portal;
  const isPortalValid = isValidOfficialPortalUrl(rawPortalUrl);

  // Helpline phone extraction
  const helplineRaw = scheme.helpline ? scheme.helpline.split('/')[0].trim() : '';
  const cleanHelplineNumber = helplineRaw.replace(/[^0-9]/g, '');

  const getStatusBadge = () => {
    switch (match.group) {
      case 'likely_eligible':
        return (
          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <CheckCircle size={13} />
            <span>Likely Eligible</span>
          </span>
        );
      case 'needs_more_info':
        return (
          <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <HelpCircle size={13} />
            <span>Needs Information</span>
          </span>
        );
      case 'does_not_match':
      default:
        return (
          <span className="badge" style={{ backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <AlertCircle size={13} />
            <span>Not Matching</span>
          </span>
        );
    }
  };

  const getCoverageBadge = () => {
    if (!match.coverage_assessment) return null;
    const text = match.coverage_assessment;
    const isFully = text.includes('Fully');
    const isPartly = text.includes('Partly');

    return (
      <div style={{
        backgroundColor: isFully ? '#ECFDF5' : isPartly ? '#FFFBEB' : '#FEF2F2',
        border: `1px solid ${isFully ? '#A7F3D0' : isPartly ? '#FDE68A' : '#FECACA'}`,
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '0.82rem',
        color: isFully ? '#065F46' : isPartly ? '#92400E' : '#991B1B',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px'
      }}>
        {isFully ? (
          <Sparkles size={15} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
        ) : isPartly ? (
          <Info size={15} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
        ) : (
          <AlertCircle size={15} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
        )}
        <div>
          <span style={{ fontWeight: 700 }}>
            {isFully ? 'Covers your estimated cost: Fully' : isPartly ? 'Covers your estimated cost: Partly' : 'Covers your estimated cost: Not covered'}
          </span>
          <div style={{ fontSize: '0.78rem', marginTop: '2px', opacity: 0.9 }}>
            {text.replace(/^Covers your estimated cost:\s*(Fully|Partly|Not covered)\s*/i, '').replace(/^\(|\)$/g, '')}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      id={id}
      className="card scheme-card-root" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '14px',
        border: match.group === 'likely_eligible' ? '1.5px solid #0D9488' : '1px solid var(--color-border)',
        boxShadow: match.group === 'likely_eligible' ? '0 4px 14px rgba(13, 148, 136, 0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
        padding: '20px 22px',
        position: 'relative'
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: match.group === 'likely_eligible' ? '#E6F4F1' : match.group === 'needs_more_info' ? '#FEF3C7' : '#F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: match.group === 'likely_eligible' ? '#0D9488' : match.group === 'needs_more_info' ? '#D97706' : '#64748B',
            flexShrink: 0,
            marginTop: '2px'
          }}>
            <Shield size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--color-navy)', margin: '0 0 3px 0', lineHeight: 1.25, fontWeight: 700 }}>
              {scheme.name}
            </h3>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-grey)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Building2 size={13} />
              <span>{scheme.authority}</span>
            </div>
          </div>
        </div>
        <div>
          {getStatusBadge()}
        </div>
      </div>

      {/* Coverage Limit Banner */}
      <div style={{
        backgroundColor: 'var(--color-warm-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: '10px',
        padding: '12px 14px',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-grey)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
            Maximum Coverage Ceiling
          </span>
          <span style={{ fontSize: '0.75rem', color: '#0D9488', fontWeight: 600 }}>
            {scheme.is_cashless !== false ? '100% Cashless' : 'Subsidy / Discount'}
          </span>
        </div>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-navy)', letterSpacing: '-0.02em' }}>
          {scheme.coverage_limit_inr}
        </div>
        {match.package_reimbursement_estimate && (
          <div style={{ fontSize: '0.82rem', color: 'var(--color-teal-dark)', fontWeight: 600, marginTop: '4px' }}>
            {match.package_reimbursement_estimate}
          </div>
        )}
      </div>

      {/* Cost Coverage Assessment */}
      {getCoverageBadge()}

      {/* Estimated out-of-pocket */}
      {match.estimated_out_of_pocket && (
        <div style={{
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '0.82rem',
          color: '#334155',
          marginBottom: '12px'
        }}>
          <span style={{ fontWeight: 600 }}>Estimated out-of-pocket with this scheme:</span>{' '}
          <span style={{ color: '#0D9488', fontWeight: 700 }}>
            {match.estimated_out_of_pocket.replace(/^Estimated out-of-pocket with this scheme:\s*/i, '')}
          </span>
        </div>
      )}

      {/* Empanelment Notice if checked */}
      {match.empanelment_status && (
        <div style={{
          backgroundColor: match.empanelment_status.includes('Verified') ? '#E6F4F1' : '#FFFBEB',
          border: `1px solid ${match.empanelment_status.includes('Verified') ? '#A7F3D0' : '#FDE68A'}`,
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '0.8rem',
          marginBottom: '12px',
          color: match.empanelment_status.includes('Verified') ? '#065F46' : '#92400E',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          {match.empanelment_status.includes('Verified') ? (
            <CheckCircle size={14} color="#059669" style={{ flexShrink: 0 }} />
          ) : (
            <AlertCircle size={14} color="#D97706" style={{ flexShrink: 0 }} />
          )}
          <span>{match.empanelment_status}</span>
        </div>
      )}

      {/* Body: Reasons / Why this matches */}
      <div style={{ marginBottom: '14px', flex: 1 }}>
        {match.why_matches && match.why_matches.length > 0 ? (
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.03em' }}>
              Why this matches:
            </div>
            <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {match.why_matches.map((wm, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', fontSize: '0.84rem', color: '#1E293B' }}>
                  <span style={{ color: '#0D9488', fontWeight: 800 }}>✓</span>
                  <span>{wm}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Missing criteria if needs more information */}
        {match.missing_criteria && match.missing_criteria.length > 0 && (
          <div style={{ marginBottom: '10px', backgroundColor: '#FEF3C7', padding: '10px 12px', borderRadius: '8px', border: '1px solid #FDE68A' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#92400E', marginBottom: '5px' }}>
              What is missing to confirm eligibility:
            </div>
            <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {match.missing_criteria.map((mc, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.82rem', color: '#78350F' }}>
                  <span>•</span>
                  <span>{mc}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Evaluation Findings & Disqualification reasons if does not match */}
        {match.group === 'does_not_match' && match.matching_reasons.length > 0 && (
          <div style={{ backgroundColor: '#FEE2E2', padding: '10px 12px', borderRadius: '8px', border: '1px solid #FECACA', marginBottom: '10px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#991B1B', marginBottom: '4px' }}>
              Reason for mismatch:
            </div>
            <div style={{ fontSize: '0.82rem', color: '#7F1D1D' }}>
              {match.matching_reasons[0]}
            </div>
          </div>
        )}

        {/* Can I combine these? convergence note */}
        {match.can_combine_note && (
          <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed #E2E8F0' }}>
            <button
              type="button"
              onClick={() => setShowCombineInfo(!showCombineInfo)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                color: '#0D9488',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Layers size={13} />
              <span>Can I combine this with other schemes? {showCombineInfo ? '▲' : '▼'}</span>
            </button>
            {showCombineInfo && (
              <div style={{ marginTop: '6px', fontSize: '0.78rem', color: '#475569', backgroundColor: '#F0FDFA', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CCFBF1' }}>
                {match.can_combine_note}
              </div>
            )}
          </div>
        )}
      </div>

      {/* What you need (Stored Documents) */}
      <div style={{ marginBottom: '14px', paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--color-text-grey)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          <FileCheck size={13} color="var(--color-teal)" />
          <span>What you need (Verification Documents):</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {scheme.required_documents.map((doc, idx) => (
            <span 
              key={idx} 
              className="badge" 
              style={{ 
                fontSize: '0.73rem', 
                backgroundColor: '#F1F5F9', 
                color: '#334155', 
                border: '1px solid #E2E8F0',
                padding: '3px 8px'
              }}
            >
              {doc}
            </span>
          ))}
        </div>
      </div>

      {/* Statutory Authority Note */}
      <div style={{ fontSize: '0.73rem', color: '#64748B', marginBottom: '14px', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Info size={12} color="#94A3B8" />
        <span>Final eligibility is decided by the scheme authority or the hospital's scheme desk.</span>
      </div>

      {/* Pinned Action Buttons: Helpline and Official Portal */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px', 
        paddingTop: '14px', 
        borderTop: '1px solid var(--color-border)',
        marginTop: 'auto'
      }}>
        {cleanHelplineNumber ? (
          <a
            href={`tel:${cleanHelplineNumber}`}
            className="btn btn-secondary btn-sm"
            style={{ 
              flex: 1, 
              padding: '9px 10px', 
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
            title={`Call official scheme helpline: ${scheme.helpline}`}
          >
            <PhoneCall size={14} color="var(--color-teal)" />
            <span>Helpline {helplineRaw}</span>
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="btn btn-secondary btn-sm"
            style={{ 
              flex: 1, 
              padding: '9px 10px', 
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              opacity: 0.6,
              cursor: 'not-allowed'
            }}
            title="Helpline not verified"
          >
            <PhoneCall size={14} color="var(--color-text-grey)" />
            <span>Helpline Not verified</span>
          </button>
        )}

        {isPortalValid && rawPortalUrl ? (
          <a
            href={rawPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
            style={{ 
              flex: 1, 
              padding: '9px 10px', 
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
            title={`Open official government portal: ${rawPortalUrl}`}
          >
            <span>Official Portal</span>
            <ExternalLink size={14} />
            <span className="sr-only">(opens in official government window)</span>
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="btn btn-secondary btn-sm"
            style={{ 
              flex: 1, 
              padding: '9px 10px', 
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              opacity: 0.6,
              cursor: 'not-allowed'
            }}
            title="Official portal URL could not be verified against the official government allowlist"
          >
            <span>Portal Not verified</span>
          </button>
        )}
      </div>

      {/* Authority Source Verification Tag */}
      {scheme.portal_source && (
        <div style={{ fontSize: '0.68rem', color: '#94A3B8', textAlign: 'center', marginTop: '8px' }}>
          Verified with {scheme.portal_source} ({scheme.portal_verified_at || scheme.last_verified_date})
        </div>
      )}
    </div>
  );
};
