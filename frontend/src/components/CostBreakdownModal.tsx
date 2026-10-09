import React from 'react';
import { X, DollarSign, Layers, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { CostBreakdownDTO } from '../services/api';

interface CostBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  breakdown: CostBreakdownDTO;
  treatmentName: string;
  minPrice: number;
  maxPrice: number;
  priceType: string;
  facilityName?: string;
}

export const CostBreakdownModal: React.FC<CostBreakdownModalProps> = ({
  isOpen,
  onClose,
  breakdown,
  treatmentName,
  minPrice,
  maxPrice,
  priceType,
  facilityName
}) => {
  if (!isOpen) return null;

  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

  const items = [
    { label: "Surgeon, OT & Anesthesia", value: breakdown.surgeon_ot_anesthesia, color: "#438F84", desc: "Surgical team fee, operating theatre booking, anesthetist fee, monitoring equipment." },
    { label: "Implants & Prosthetics", value: breakdown.implant_or_prosthesis, color: "#2E7D32", desc: "US-FDA or DCGI approved knee joint prosthesis, cardiac drug-eluting stent, or foldable intraocular lens." },
    { label: "Room & Nursing Charges", value: breakdown.room_and_nursing, color: "#183247", desc: "Inpatient bed tariff, 24/7 nursing care, routine vitals monitoring, room sanitation." },
    { label: "Diagnostics & Pre-Op Labs", value: breakdown.diagnostics_and_lab, color: "#64717D", desc: "Pre-procedure imaging (X-Ray, MRI, Echo), blood cross-match, pathology tests." },
    { label: "Medicines & Consumables", value: breakdown.medicines_and_consumables, color: "#D97962", desc: "IV fluids, antibiotics, surgical sutures, drapes, post-operative analgesic medication." },
    { label: "Consultation & Registration", value: breakdown.consultation_and_registration, color: "#8E9AA5", desc: "Initial clinical evaluation, hospital admission documentation, IP registration fee." },
    { label: "Hospital Administration & Tax", value: breakdown.tax_and_admin, color: "#B0BEC5", desc: "Hospital administrative processing, biomedical waste handling, applicable GST on room rent." }
  ].filter(item => item.value > 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px', padding: '28px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div className="badge badge-teal" style={{ marginBottom: '6px' }}>
              Detailed Cost Breakdown
            </div>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--color-navy)' }}>
              {treatmentName}
            </h3>
            {facilityName && (
              <p style={{ fontSize: '0.88rem', color: 'var(--color-text-grey)' }}>
                Facility: <strong>{facilityName}</strong>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-grey)' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Cost Summary Box */}
        <div style={{
          backgroundColor: 'var(--color-light-blue)',
          borderRadius: 'var(--radius-lg)',
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-grey)', textTransform: 'uppercase', fontWeight: 600 }}>
              Estimated Tariff Range
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-navy)' }}>
              ₹{minPrice.toLocaleString('en-IN')} - ₹{maxPrice.toLocaleString('en-IN')}
            </div>
          </div>
          <div>
            <span className="badge badge-navy" style={{ fontSize: '0.85rem' }}>
              {priceType}
            </span>
          </div>
        </div>

        {/* Stacked Progress Bar */}
        {total > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '8px' }}>
              Component Share of Total Hospital Bill:
            </div>
            <div style={{
              height: '14px',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              overflow: 'hidden',
              backgroundColor: '#e2e8f0'
            }}>
              {items.map(item => {
                const pct = (item.value / total) * 100;
                return (
                  <div
                    key={item.label}
                    style={{
                      width: `${pct}%`,
                      backgroundColor: item.color,
                      height: '100%'
                    }}
                    title={`${item.label}: ${Math.round(pct)}%`}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* List of Component Charges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {items.map(item => {
            const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
            return (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  backgroundColor: 'var(--color-warm-bg)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: item.color,
                    marginTop: '5px',
                    flexShrink: 0
                  }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--color-navy)' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-grey)', marginTop: '2px' }}>
                      {item.desc}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-navy)' }}>
                    ₹{item.value.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-grey)' }}>
                    ~{pct}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Important Factors Note */}
        <div style={{
          backgroundColor: '#FFFBEB',
          border: '1px solid #FDE68A',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          fontSize: '0.82rem',
          color: '#92400E',
          marginBottom: '20px'
        }}>
          <strong>Factors that may alter this quotation:</strong> Room category upgrade (Single/Deluxe adds 40-70% to nursing & surgical charges), specific implant grade (e.g. robotic knee assistance, toric lenses), pre-existing diabetes/cardiac comorbidities, or prolonged ICU requirement.
        </div>

        {/* Close Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-primary">
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};
