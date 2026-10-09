import React from 'react';
import { 
  Calculator, 
  Building2, 
  FlaskConical, 
  Pill, 
  Calendar, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle,
  Clock,
  Layers
} from 'lucide-react';
import { CostBreakdownDTO } from '../services/api';

export interface CombinedExpenseSummaryProps {
  treatmentName: string;
  hospitalCostMin: number;
  hospitalCostMax: number;
  diagnosticCost?: number;
  medicineCostMin?: number;
  medicineCostMax?: number;
  followUpCost?: number;
  appointmentFee?: number;
  costBreakdown?: CostBreakdownDTO;
  confidence?: string;
  matchedSchemeName?: string;
  estimatedSchemeBenefit?: string;
}

export const CombinedExpenseSummary: React.FC<CombinedExpenseSummaryProps> = ({
  treatmentName,
  hospitalCostMin,
  hospitalCostMax,
  diagnosticCost = 0,
  medicineCostMin = 0,
  medicineCostMax = 0,
  followUpCost = 1500, // standard OPD follow-up & suture removal
  appointmentFee = 500, // initial consultation fee
  costBreakdown,
  confidence = 'High',
  matchedSchemeName,
  estimatedSchemeBenefit
}) => {
  // Aggregate Grand Totals
  const grandTotalMin = hospitalCostMin + diagnosticCost + medicineCostMin + followUpCost + appointmentFee;
  const grandTotalMax = hospitalCostMax + diagnosticCost + medicineCostMax + followUpCost + appointmentFee;

  return (
    <div 
      className="card combined-expense-summary"
      id="combined-expense-summary-panel"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1.5px solid var(--color-teal)',
        borderRadius: '16px',
        padding: '22px',
        boxShadow: '0 4px 16px rgba(44, 140, 131, 0.08)',
        marginBottom: '26px'
      }}
    >
      {/* Title & Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-teal" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calculator size={13} />
              <span>Full Healthcare Episode Aggregate</span>
            </span>
            <span className="badge badge-navy">{confidence} Evidence Rating</span>
          </div>
          <h3 style={{ fontSize: '1.35rem', color: '#12304A', margin: 0, fontWeight: 700 }}>
            Combined Total Healthcare Expense Summary
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#64717D', margin: '4px 0 0' }}>
            Comprehensive overview linking in-patient hospital admission, diagnostics, post-discharge medicines, and OPD follow-ups.
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.74rem', color: '#64717D', textTransform: 'uppercase', fontWeight: 600 }}>
            Estimated Grand Total Range
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#12304A' }}>
            ₹{grandTotalMin.toLocaleString('en-IN')} – ₹{grandTotalMax.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Itemized Waterfall Component Rows */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginBottom: '20px'
      }}>
        {/* Row 1: Hospital & Procedure */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          backgroundColor: '#F8FAF9',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          fontSize: '0.86rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 size={16} color="#2C8C83" />
            <div>
              <div style={{ fontWeight: 600, color: '#12304A' }}>In-Patient Hospital & Procedure Tariff</div>
              <div style={{ fontSize: '0.74rem', color: '#64717D' }}>OT charges, surgeon fee, nursing & bed stay</div>
            </div>
          </div>
          <div style={{ fontWeight: 700, color: '#12304A' }}>
            ₹{hospitalCostMin.toLocaleString('en-IN')} – ₹{hospitalCostMax.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Row 2: Diagnostics & Labs */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          backgroundColor: '#F8FAF9',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          fontSize: '0.86rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FlaskConical size={16} color="#2C8C83" />
            <div>
              <div style={{ fontWeight: 600, color: '#12304A' }}>Pre-Procedure Lab & Imaging Diagnostics</div>
              <div style={{ fontSize: '0.74rem', color: '#64717D' }}>Blood work, X-Ray / MRI / ECG workup</div>
            </div>
          </div>
          <div style={{ fontWeight: 700, color: '#12304A' }}>
            {diagnosticCost > 0 ? `₹${diagnosticCost.toLocaleString('en-IN')}` : 'Included in Package'}
          </div>
        </div>

        {/* Row 3: Prescribed Medicines & Consumables */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          backgroundColor: '#F8FAF9',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          fontSize: '0.86rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Pill size={16} color="#2C8C83" />
            <div>
              <div style={{ fontWeight: 600, color: '#12304A' }}>Estimated Medicine Course (Post-discharge)</div>
              <div style={{ fontSize: '0.74rem', color: '#64717D' }}>
                {medicineCostMin > 0 ? 'Jan Aushadhi generic (min) to Branded MRP (max)' : 'Discharge medication estimates'}
              </div>
            </div>
          </div>
          <div style={{ fontWeight: 700, color: '#12304A' }}>
            {medicineCostMin > 0 || medicineCostMax > 0 
              ? `₹${medicineCostMin.toLocaleString('en-IN')} – ₹${medicineCostMax.toLocaleString('en-IN')}`
              : '₹1,500 – ₹3,500 (Indicative)'}
          </div>
        </div>

        {/* Row 4: OPD Consultations & Registration */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          backgroundColor: '#F8FAF9',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          fontSize: '0.86rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={16} color="#2C8C83" />
            <div>
              <div style={{ fontWeight: 600, color: '#12304A' }}>Initial Consultation & Hospital Registration Fee</div>
              <div style={{ fontSize: '0.74rem', color: '#64717D' }}>OPD specialist consult + statutory registration</div>
            </div>
          </div>
          <div style={{ fontWeight: 700, color: '#12304A' }}>
            ₹{appointmentFee.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Row 5: Follow-up & Rehabilitation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          backgroundColor: '#F8FAF9',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          fontSize: '0.86rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={16} color="#2C8C83" />
            <div>
              <div style={{ fontWeight: 600, color: '#12304A' }}>Post-Discharge Follow-Up & Physical Rehab</div>
              <div style={{ fontSize: '0.74rem', color: '#64717D' }}>Post-operative checkups & dressing changes</div>
            </div>
          </div>
          <div style={{ fontWeight: 700, color: '#12304A' }}>
            ₹{followUpCost.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Honest Missing Information Callout */}
      <div style={{
        backgroundColor: '#F1F5F9',
        border: '1px solid #CBD5E1',
        borderRadius: '10px',
        padding: '10px 14px',
        fontSize: '0.8rem',
        color: '#475569',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px'
      }}>
        <HelpCircle size={16} color="#64748B" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Missing or Variable Information:</strong> Surgeon specific honorarium tier, choice of premium vs standard titanium implant model, and blood transfusion charges (if required) vary per patient. These should be confirmed directly with the billing desk.
        </div>
      </div>

      {/* Potential Government Scheme / Insurance Callout (SHOWN SEPARATELY WITHOUT GUARANTEE) */}
      <div style={{
        backgroundColor: '#ECFDF5',
        border: '1px solid #A7F3D0',
        borderRadius: '12px',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <ShieldCheck size={20} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.82rem', color: '#065F46', lineHeight: 1.5 }}>
          <strong>Potential Government Scheme / Insurance Assistance:</strong>
          <br />
          If you are eligible under <strong>{matchedSchemeName || 'PM-JAY (Ayushman Bharat) / State Health Schemes'}</strong>, this procedure may qualify for cashless hospitalization package up to statutory limits.
          <br />
          <em style={{ fontSize: '0.76rem', color: '#047857', display: 'block', marginTop: '4px' }}>
            *Note: Scheme benefits are subject to mandatory Aarogya Mitra pre-authorization, valid ration card / PM-JAY card, and empanelled bed availability. These figures are NOT deducted from the bill above until formally approved by the empanelled hospital.
          </em>
        </div>
      </div>
    </div>
  );
};
