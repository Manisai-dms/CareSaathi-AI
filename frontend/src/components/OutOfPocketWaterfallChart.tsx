import React from 'react';
import { ArrowDown, ArrowUp, ShieldCheck, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { OutOfPocketWaterfallDTO } from '../services/api';
import { AnimatedRupeeCounter } from './AnimatedRupeeCounter';

interface OutOfPocketWaterfallProps {
  waterfall: OutOfPocketWaterfallDTO;
  treatmentName: string;
}

export const OutOfPocketWaterfallChart: React.FC<OutOfPocketWaterfallProps> = ({
  waterfall,
  treatmentName
}) => {
  const { total_cost_min, total_cost_max, patient_share_min, patient_share_max, steps, verification_status, scheme_name } = waterfall;

  const getStepColor = (type: string) => {
    switch (type) {
      case 'baseline':
        return '#183247'; // Navy
      case 'deduction':
        return '#438F84'; // Teal
      case 'addition':
        return '#D97962'; // Coral
      case 'final':
        return '#2E7D32'; // Success Green
      default:
        return '#64717D';
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'baseline':
        return <span style={{ fontWeight: 800 }}>Σ</span>;
      case 'deduction':
        return <ArrowDown size={14} color="#438F84" />;
      case 'addition':
        return <ArrowUp size={14} color="#D97962" />;
      case 'final':
        return <CheckCircle2 size={15} color="#2E7D32" />;
      default:
        return null;
    }
  };

  return (
    <div className="card cost-estimator-card-elevation" style={{ backgroundColor: 'var(--color-white)', border: '1px solid var(--color-border)', marginBottom: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
        <div>
          <div className="badge badge-teal" style={{ marginBottom: '6px' }}>
            Out-of-Pocket Waterfall Calculator
          </div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--color-navy)' }}>
            Patient Financial Bridge: Gross Bill ➔ Net Cash Required
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-grey)' }}>
            Estimated breakdown of public scheme deductions, generic medicine subsidies, and out-of-pocket balance.
          </p>
        </div>

        {/* Verification Status Badge */}
        <div style={{
          backgroundColor: '#FFFBEB',
          border: '1px solid #FDE68A',
          borderRadius: 'var(--radius-md)',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.78rem',
          color: '#92400E',
          fontWeight: 600
        }}>
          <AlertCircle size={14} color="#D97706" />
          <span>{verification_status}</span>
        </div>
      </div>

      {/* Waterfall Visual Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        {steps.map((step, idx) => {
          const color = getStepColor(step.type);
          const isFinal = step.type === 'final';
          return (
            <div
              key={idx}
              className="cost-estimator-interactive-row"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: isFinal ? '14px 16px' : '10px 14px',
                backgroundColor: isFinal ? 'var(--color-mint-subtle)' : 'var(--color-warm-bg)',
                borderRadius: 'var(--radius-md)',
                border: isFinal ? '2px solid var(--color-teal)' : '1px solid var(--color-border)',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 300px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  border: `1px solid ${color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {getStepIcon(step.type)}
                </div>
                <div>
                  <div style={{ fontWeight: isFinal ? 800 : 600, fontSize: isFinal ? '1rem' : '0.9rem', color: isFinal ? 'var(--color-navy)' : 'var(--color-navy)' }}>
                    {step.name}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--color-text-grey)', marginTop: '2px' }}>
                    {step.note}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{
                  fontSize: isFinal ? '1.25rem' : '1rem',
                  fontWeight: 800,
                  color: color
                }}>
                  {step.type === 'deduction' && "− "}
                  {step.type === 'addition' && "+ "}
                  <AnimatedRupeeCounter value={step.amount_min} freeSubsidizedText="₹0" />
                  {" "}—{" "}
                  <AnimatedRupeeCounter value={step.amount_max} />
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-grey)' }}>
                  {step.type === 'final' ? 'Net Patient Payable Range' : 'Estimated Value'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Highlight Box */}
      <div style={{
        backgroundColor: 'var(--color-light-blue)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={24} color="var(--color-teal)" />
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-navy)' }}>
              Scheme Applied: {scheme_name}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-grey)' }}>
              Covers approved medical college and network hospital surgical packages.
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-grey)', textTransform: 'uppercase', fontWeight: 600 }}>
            Estimated Net Out-of-Pocket
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-teal-dark)' }}>
            <AnimatedRupeeCounter value={patient_share_min} /> — <AnimatedRupeeCounter value={patient_share_max} />
          </div>
        </div>
      </div>
    </div>
  );
};
