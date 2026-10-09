import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Database, Calendar, MapPin, Award, CheckCircle2, AlertCircle } from 'lucide-react';
import { api, TrustDashboardDataDTO } from '../services/api';

interface TrustDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrustDashboardModal: React.FC<TrustDashboardModalProps> = ({ isOpen, onClose }) => {
  const [metrics, setMetrics] = useState<TrustDashboardDataDTO | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.getTrustMetrics().then(setMetrics).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '720px', padding: '28px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div className="badge badge-teal" style={{ marginBottom: '6px' }}>
              Transparency & Verification Ledger
            </div>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-navy)' }}>
              CareSaathi Trust Dashboard
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-grey)' }}>
              Live metrics quantifying data authenticity, public statutory sources, and regional coverage.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-grey)' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* 3 Metrics Cards */}
        {metrics && (
          <>
            <div className="grid-3" style={{ gap: '14px', marginBottom: '24px' }}>
              <div style={{
                backgroundColor: 'var(--color-mint-subtle)',
                border: '1px solid #b8ded4',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-teal-dark)', textTransform: 'uppercase' }}>
                  Official Published Tariffs
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-navy)', marginTop: '4px' }}>
                  {metrics.official_count}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--color-teal-dark)', marginTop: '2px' }}>
                  NIMS, NPPA & DME Gazettes
                </div>
              </div>

              <div style={{
                backgroundColor: 'var(--color-light-blue)',
                border: '1px solid #d2e4f3',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-navy)', textTransform: 'uppercase' }}>
                  Verified Reference Tariffs
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-navy)', marginTop: '4px' }}>
                  {metrics.reference_count}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--color-text-grey)', marginTop: '2px' }}>
                  CGHS & Corporate TPA Schedules
                </div>
              </div>

              <div style={{
                backgroundColor: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400E', textTransform: 'uppercase' }}>
                  Illustrative Estimates
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-navy)', marginTop: '4px' }}>
                  {metrics.illustrative_count}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#92400E', marginTop: '2px' }}>
                  Clearly Tagged Unverified Rows
                </div>
              </div>
            </div>

            {/* Freshness Audit Records */}
            <div style={{ marginBottom: '22px' }}>
              <h4 style={{ fontSize: '0.98rem', color: 'var(--color-navy)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={16} color="var(--color-teal)" />
                <span>Statutory Master Freshness & Verification Dates:</span>
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {metrics.data_freshness_records.map((rec, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      backgroundColor: 'var(--color-warm-bg)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.82rem'
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 700, color: 'var(--color-navy)' }}>{rec.source}</span>
                      <span style={{ color: 'var(--color-text-grey)', marginLeft: '8px' }}>({rec.authority})</span>
                    </div>
                    <span className="badge badge-teal" style={{ fontSize: '0.72rem' }}>
                      Audit Date: {rec.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* City Coverage */}
            <div style={{ marginBottom: '22px' }}>
              <h4 style={{ fontSize: '0.98rem', color: 'var(--color-navy)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} color="var(--color-teal)" />
                <span>Geographic Coverage & Facility Master Breakdown:</span>
              </h4>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {Object.entries(metrics.city_coverage).map(([c, count]) => (
                  <div
                    key={c}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-light-blue)',
                      border: '1px solid #d2e4f3',
                      fontSize: '0.85rem'
                    }}
                  >
                    <span style={{ color: 'var(--color-text-grey)' }}>{c}: </span>
                    <strong style={{ color: 'var(--color-navy)' }}>{count} Verified Hospitals</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Completeness Score */}
            <div style={{
              backgroundColor: 'var(--color-mint-subtle)',
              border: '1px solid #b8ded4',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="var(--color-teal)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-navy)' }}>
                  Overall Database Integrity & Audit Verification Index:
                </span>
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-teal-dark)' }}>
                {metrics.audit_completeness_pct}% Verified
              </span>
            </div>
          </>
        )}

        {/* Close Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button onClick={onClose} className="btn btn-primary">
            Close Trust Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
