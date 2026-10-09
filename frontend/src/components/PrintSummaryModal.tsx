import React from 'react';
import { X, Printer, ShieldCheck, Heart, AlertTriangle, Phone, FileText } from 'lucide-react';
import { CostEstimateDTO } from '../services/api';

interface PrintSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  costEstimate: CostEstimateDTO | null;
  facilityName?: string;
  city?: string;
}

export const PrintSummaryModal: React.FC<PrintSummaryModalProps> = ({
  isOpen,
  onClose,
  costEstimate,
  facilityName,
  city = 'Hyderabad'
}) => {
  if (!isOpen || !costEstimate) return null;

  const treatmentName = costEstimate.canonical_treatment?.name || costEstimate.query_treatment;
  const waterfall = costEstimate.waterfall;
  const components = costEstimate.detailed_components || [];
  const checklists = costEstimate.checklists || { questions_to_ask: [], documents_to_carry: [] };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      {/* Embedded Print CSS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #caresaathi-printable-summary,
          #caresaathi-printable-summary * {
            visibility: visible !important;
          }
          #caresaathi-printable-summary {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 16px !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: #111827 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '820px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden'
        }}
      >
        {/* Modal Top Bar (Screen Only) */}
        <div className="no-print" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          backgroundColor: 'var(--color-navy)',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={20} color="var(--color-teal)" />
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'white' }}>
              One-Page Patient Financial Care Summary
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handlePrint}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Printer size={16} />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Container */}
        <div style={{ overflowY: 'auto', padding: '24px', backgroundColor: '#F8FAFC' }}>
          <div
            id="caresaathi-printable-summary"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '28px',
              color: '#1E293B',
              fontFamily: 'Inter, system-ui, sans-serif',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0F172A', paddingBottom: '16px', marginBottom: '18px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Heart size={22} color="#0D9488" fill="#0D9488" />
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                    CareSaathi AI <span style={{ color: '#0D9488', fontSize: '0.95rem', fontWeight: 600 }}>| Patient Financial Navigator</span>
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  Independent Healthcare Cost & Care Navigation Platform • Non-commercial Public Interest Tool
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A' }}>
                  Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                  Region: {city} (Telangana)
                </div>
                <div style={{ fontSize: '0.72rem', color: '#0D9488', fontWeight: 600 }}>
                  Statutory Reference Schedule
                </div>
              </div>
            </div>

            {/* Procedure Banner */}
            <div style={{
              backgroundColor: '#F0FDFA',
              border: '1px solid #99F6E4',
              borderRadius: '6px',
              padding: '14px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '18px'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F766E', textTransform: 'uppercase' }}>
                  Navigated Procedure
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A' }}>
                  {treatmentName}
                </div>
                {facilityName && (
                  <div style={{ fontSize: '0.82rem', color: '#0F766E', marginTop: '2px' }}>
                    Facility: <strong>{facilityName}</strong>
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F766E', textTransform: 'uppercase' }}>
                  Indicative Tariff Range
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>
                  {costEstimate.overall_min === 0 ? "₹0 (Subsidized)" : `₹${costEstimate.overall_min.toLocaleString('en-IN')}`} — ₹{costEstimate.overall_max.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                  Status: {costEstimate.price_type}
                </div>
              </div>
            </div>

            {/* Two-Column Grid: Itemized Costs & Waterfall */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
              {/* Itemized Public Reference Caps */}
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '6px', padding: '12px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px' }}>
                  Public Reference Rates & NPPA Price Caps
                </div>
                <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
                  <tbody>
                    {components.slice(0, 5).map((c, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '4px 0', color: '#334155', fontWeight: 500 }}>{c.component_name}</td>
                        <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 700, color: '#0F172A' }}>
                          ₹{c.min_cost.toLocaleString('en-IN')} — ₹{c.max_cost.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '6px' }}>
                  Sources: NPPA S.O. 2668(E), CGHS Gazette & PM-JAY HBP 2.2
                </div>
              </div>

              {/* Out-of-Pocket Waterfall Summary */}
              {waterfall ? (
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '6px', padding: '12px', backgroundColor: '#F8FAFC' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px' }}>
                    Out-of-Pocket Bridge: {waterfall.scheme_name}
                  </div>
                  <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '4px 0', color: '#475569' }}>Gross Estimated Bill:</td>
                        <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600 }}>
                          ₹{waterfall.total_cost_min.toLocaleString('en-IN')} — ₹{waterfall.total_cost_max.toLocaleString('en-IN')}
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#0D9488' }}>
                        <td style={{ padding: '4px 0' }}>Scheme Coverage:</td>
                        <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600 }}>
                          - ₹{waterfall.scheme_coverage_min.toLocaleString('en-IN')} — ₹{waterfall.scheme_coverage_max.toLocaleString('en-IN')}
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #0F172A', color: '#0F172A', fontWeight: 800 }}>
                        <td style={{ padding: '6px 0', fontSize: '0.82rem' }}>Net Patient Share:</td>
                        <td style={{ padding: '6px 0', textAlign: 'right', fontSize: '0.82rem', color: '#0F766E' }}>
                          ₹{waterfall.patient_share_min.toLocaleString('en-IN')} — ₹{waterfall.patient_share_max.toLocaleString('en-IN')}*
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '6px' }}>
                    *Verification-required estimate. Subject to hospital pre-authorization.
                  </div>
                </div>
              ) : null}
            </div>

            {/* Checklists Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
              {/* Questions to Ask */}
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '6px', padding: '12px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                  Questions to Ask Hospital Billing Desk:
                </div>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.72rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {(checklists.questions_to_ask || []).slice(0, 3).map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>

              {/* Documents to Carry */}
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '6px', padding: '12px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                  Documents to Carry for Admission:
                </div>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.72rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {(checklists.documents_to_carry || []).slice(0, 3).map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Helplines and Legal Disclaimers */}
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '6px',
              padding: '10px 14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.72rem',
              color: '#991B1B'
            }}>
              <div>
                <strong>Emergency Helplines:</strong> National Ambulance: <strong>108</strong> | Health Advice: <strong>104</strong> | PM-JAY / Aarogyasri: <strong>14555</strong>
              </div>
              <div style={{ fontWeight: 600 }}>
                24x7 Toll-Free
              </div>
            </div>

            {/* Footer Disclaimer */}
            <div style={{ marginTop: '14px', borderTop: '1px solid #E2E8F0', paddingTop: '10px', fontSize: '0.68rem', color: '#64748B', lineHeight: 1.4 }}>
              <strong>LEGAL NOTICE:</strong> CareSaathi AI is an educational navigation system and not a hospital, licensed provider, insurer, or government portal. Estimates are calculated from public schedules and do not constitute a quotation. No patient identity or health data is stored or logged.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
