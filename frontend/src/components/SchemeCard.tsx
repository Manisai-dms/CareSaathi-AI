import React from 'react';
import { Shield, PhoneCall, ExternalLink, CheckCircle, AlertCircle, FileCheck, Info } from 'lucide-react';
import { SchemeMatchDTO } from '../services/api';

interface SchemeCardProps {
  match: SchemeMatchDTO;
}

export const SchemeCard: React.FC<SchemeCardProps> = ({ match }) => {
  const { scheme } = match;

  const getStatusBadge = () => {
    switch (match.status_color) {
      case 'green':
        return <span className="badge badge-success">✓ {match.match_status}</span>;
      case 'red':
        return <span className="badge badge-coral">✕ {match.match_status}</span>;
      case 'amber':
        return <span className="badge badge-warning">⚠ {match.match_status}</span>;
      default:
        return <span className="badge badge-navy">ℹ {match.match_status}</span>;
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: match.status_color === 'green' ? 'var(--color-mint)' : 'var(--color-light-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: match.status_color === 'green' ? 'var(--color-teal)' : 'var(--color-navy)',
            flexShrink: 0
          }}>
            <Shield size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.15rem', color: 'var(--color-navy)', lineHeight: 1.2 }}>
              {scheme.name}
            </h4>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-grey)' }}>
              {scheme.authority}
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
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        marginBottom: '14px'
      }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-grey)', textTransform: 'uppercase', fontWeight: 600 }}>
          Maximum Coverage Ceiling
        </div>
        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-navy)', marginTop: '2px' }}>
          {scheme.coverage_limit_inr}
        </div>
        {match.package_reimbursement_estimate && (
          <div style={{ fontSize: '0.8rem', color: 'var(--color-teal-dark)', fontWeight: 600, marginTop: '4px' }}>
            {match.package_reimbursement_estimate}
          </div>
        )}
      </div>

      {/* Empanelment Notice if checked */}
      {match.empanelment_status && (
        <div style={{
          backgroundColor: match.empanelment_status.includes('Verified') ? 'var(--color-mint-subtle)' : '#FFFBEB',
          border: `1px solid ${match.empanelment_status.includes('Verified') ? '#b8ded4' : '#FDE68A'}`,
          borderRadius: 'var(--radius-md)',
          padding: '8px 12px',
          fontSize: '0.8rem',
          marginBottom: '14px',
          color: match.empanelment_status.includes('Verified') ? 'var(--color-teal-dark)' : '#92400E'
        }}>
          {match.empanelment_status}
        </div>
      )}

      {/* Reasons & Evaluation Evidence */}
      <div style={{ marginBottom: '14px', flex: 1 }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '6px' }}>
          Eligibility & Evaluation Findings:
        </div>
        <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {match.matching_reasons.map((r, idx) => (
            <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.82rem', color: 'var(--color-navy)' }}>
              <span style={{ color: match.status_color === 'green' ? 'var(--color-teal)' : 'var(--color-text-grey)', marginTop: '2px' }}>•</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Required Documentation */}
      <div style={{ marginBottom: '16px', paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-grey)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <FileCheck size={14} color="var(--color-teal)" />
          <span>Required Verification Documents:</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {scheme.required_documents.map((doc, idx) => (
            <span key={idx} className="badge badge-navy" style={{ fontSize: '0.72rem' }}>
              {doc}
            </span>
          ))}
        </div>
      </div>

      {/* Actions: Helpline and Official Portal */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
        <a
          href={`tel:${scheme.helpline.split('/')[0].trim()}`}
          className="btn btn-secondary btn-sm"
          style={{ flex: 1, padding: '7px 8px' }}
          title="Call official scheme helpline"
        >
          <PhoneCall size={14} color="var(--color-teal)" />
          <span>Helpline {scheme.helpline.split('/')[0].trim()}</span>
        </a>
        <a
          href={scheme.official_portal}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-sm"
          style={{ flex: 1, padding: '7px 8px' }}
          title="Visit official government scheme website"
        >
          <span>Official Portal</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
};
