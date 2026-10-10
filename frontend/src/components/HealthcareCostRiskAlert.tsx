import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldCheck, 
  Info, 
  TrendingUp, 
  ArrowDownCircle, 
  CheckCircle2, 
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedRupeeCounter } from './AnimatedRupeeCounter';

export type FinancialRiskLevel = 'Lower' | 'Moderate' | 'High';

export interface HealthcareCostRiskProps {
  minTreatmentCost: number;
  maxTreatmentCost: number;
  estimatedMedicineCost?: number;
  estimatedDiagnosticCost?: number;
  potentialAdditionalExpenses?: number;
  userBudget?: number;
  confidence?: string;
  priceType?: string;
  treatmentName?: string;
  onBudgetChange?: (budget: number) => void;
  onExploreGovtHospitals?: () => void;
  onExploreSchemes?: () => void;
}

export const HealthcareCostRiskAlert: React.FC<HealthcareCostRiskProps> = ({
  minTreatmentCost,
  maxTreatmentCost,
  estimatedMedicineCost = 0,
  estimatedDiagnosticCost = 0,
  potentialAdditionalExpenses = 0,
  userBudget: initialBudget = 0,
  confidence = 'Medium',
  priceType = 'Estimate',
  treatmentName = 'Healthcare Procedure',
  onBudgetChange,
  onExploreGovtHospitals,
  onExploreSchemes
}) => {
  const [budget, setBudget] = useState<number>(initialBudget);
  const [isEditingBudget, setIsEditingBudget] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Total estimated expense calculation
  const totalMin = minTreatmentCost + estimatedMedicineCost + estimatedDiagnosticCost;
  const totalMax = maxTreatmentCost + estimatedMedicineCost + estimatedDiagnosticCost + potentialAdditionalExpenses;

  // Determine Financial Risk Level
  let riskLevel: FinancialRiskLevel = 'Lower';
  let explanation = '';
  let badgeColor = '#059669';
  let badgeBg = '#ECFDF5';
  let borderColor = '#A7F3D0';

  if (budget > 0) {
    if (totalMin > budget) {
      riskLevel = 'High';
      explanation = `Estimated baseline expenses (₹${totalMin.toLocaleString('en-IN')}) exceed your planned budget of ₹${budget.toLocaleString('en-IN')} by ₹${(totalMin - budget).toLocaleString('en-IN')}.`;
      badgeColor = '#DC2626';
      badgeBg = '#FEF2F2';
      borderColor = '#FECACA';
    } else if (totalMax > budget) {
      riskLevel = 'Moderate';
      explanation = `Baseline cost fits within your budget, but upper-tier private estimates or unanticipated expenses (up to ₹${totalMax.toLocaleString('en-IN')}) may exceed your ₹${budget.toLocaleString('en-IN')} budget.`;
      badgeColor = '#D97706';
      badgeBg = '#FFFBEB';
      borderColor = '#FDE68A';
    } else {
      riskLevel = 'Lower';
      explanation = `Your planned budget of ₹${budget.toLocaleString('en-IN')} covers the estimated expense range (₹${totalMin.toLocaleString('en-IN')} – ₹${totalMax.toLocaleString('en-IN')}).`;
      badgeColor = '#059669';
      badgeBg = '#ECFDF5';
      borderColor = '#A7F3D0';
    }
  } else {
    // If no budget is set, assess by pricing spread & evidence confidence
    if (totalMax - totalMin > 80000 || confidence === 'Low') {
      riskLevel = 'Moderate';
      explanation = `Wide pricing variability observed between government and private providers. Setting an optional budget helps assess financial preparedness.`;
      badgeColor = '#D97706';
      badgeBg = '#FFFBEB';
      borderColor = '#FDE68A';
    } else {
      riskLevel = 'Lower';
      explanation = `Predictable statutory tariff band observed. Compare with government or empanelled facilities to minimize personal out-of-pocket spending.`;
      badgeColor = '#059669';
      badgeBg = '#ECFDF5';
      borderColor = '#A7F3D0';
    }
  }

  const handleUpdateBudget = (val: number) => {
    setBudget(val);
    if (onBudgetChange) onBudgetChange(val);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="card cost-estimator-card-elevation"
      id="healthcare-cost-risk-alert"
      style={{
        backgroundColor: '#FFFFFF',
        border: `1.5px solid ${borderColor}`,
        borderRadius: '16px',
        boxShadow: '0 4px 14px rgba(18, 48, 74, 0.06)',
        marginBottom: '20px',
        overflow: 'hidden'
      }}
    >
      {/* Header Bar */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 18px',
          backgroundColor: badgeBg,
          borderBottom: `1px solid ${borderColor}`,
          cursor: 'pointer'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={20} color={badgeColor} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.98rem', color: '#12304A' }}>
                Healthcare Cost Risk Analysis
              </span>
              <motion.span 
                initial={{ scale: 0.88, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: badgeColor,
                  color: '#FFFFFF',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {riskLevel} Financial Risk
              </motion.span>
            </div>
            <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64717D' }}>
              Financial risk indicator based on tariffs, variance & optional patient budget.
            </p>
          </div>
        </div>

        <button 
          type="button"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64717D' }}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Expandable Body */}
      {isExpanded && (
        <div style={{ padding: '18px' }}>
          {/* CRITICAL ETHICAL DISCLAIMER: Financial risk only, never medical risk */}
          <div style={{
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <ShieldCheck size={18} color="#2563EB" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.8rem', color: '#1E40AF', lineHeight: 1.45 }}>
              <strong>Notice:</strong> This indicator represents <strong>financial expense risk only</strong>, never clinical or medical urgency. <em>Never delay or postpone medically necessary treatment because of cost uncertainties.</em>
            </div>
          </div>

          {/* Explanation Text */}
          <div style={{
            backgroundColor: '#F8FAF9',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '12px 14px',
            marginBottom: '16px',
            fontSize: '0.86rem',
            color: '#12304A',
            lineHeight: 1.5
          }}>
            <strong>Why this alert appears: </strong>
            <span>{explanation}</span>
          </div>

          {/* Breakdown Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            marginBottom: '16px'
          }}>
            {/* Treatment Cost Range */}
            <div 
              className="cost-estimator-interactive-row"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                padding: '10px 12px'
              }}
            >
              <div style={{ fontSize: '0.72rem', color: '#64717D', fontWeight: 600, textTransform: 'uppercase' }}>
                Hospital / Procedure
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#12304A', marginTop: '4px' }}>
                <AnimatedRupeeCounter value={minTreatmentCost} /> – <AnimatedRupeeCounter value={maxTreatmentCost} />
              </div>
              <div style={{ fontSize: '0.7rem', color: '#059669', marginTop: '2px' }}>
                Status: {priceType}
              </div>
            </div>

            {/* Medicine Cost */}
            <div 
              className="cost-estimator-interactive-row"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                padding: '10px 12px'
              }}
            >
              <div style={{ fontSize: '0.72rem', color: '#64717D', fontWeight: 600, textTransform: 'uppercase' }}>
                Medicines & Consumables
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#12304A', marginTop: '4px' }}>
                {estimatedMedicineCost > 0 ? (
                  <AnimatedRupeeCounter value={estimatedMedicineCost} />
                ) : (
                  'Included in Package'
                )}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64717D', marginTop: '2px' }}>
                Source: {estimatedMedicineCost > 0 ? 'NPPA / Pharma Sahi Daam' : 'Standard Hospital Tariff'}
              </div>
            </div>

            {/* Diagnostics */}
            <div 
              className="cost-estimator-interactive-row"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                padding: '10px 12px'
              }}
            >
              <div style={{ fontSize: '0.72rem', color: '#64717D', fontWeight: 600, textTransform: 'uppercase' }}>
                Diagnostics & Lab
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#12304A', marginTop: '4px' }}>
                {estimatedDiagnosticCost > 0 ? (
                  <AnimatedRupeeCounter value={estimatedDiagnosticCost} />
                ) : (
                  'Pre-op Included'
                )}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64717D', marginTop: '2px' }}>
                Source: CGHS Diagnostic Gazette
              </div>
            </div>

            {/* Potential Additional Expenses */}
            <div 
              className="cost-estimator-interactive-row"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                padding: '10px 12px'
              }}
            >
              <div style={{ fontSize: '0.72rem', color: '#64717D', fontWeight: 600, textTransform: 'uppercase' }}>
                Potential Extra Buffer
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#B45309', marginTop: '4px' }}>
                <AnimatedRupeeCounter value={potentialAdditionalExpenses || 5000} />
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64717D', marginTop: '2px' }}>
                Post-op rehab & unplanned stay
              </div>
            </div>
          </div>

          {/* Interactive Budget Adjustment */}
          <div style={{
            backgroundColor: '#F1F5F9',
            borderRadius: '10px',
            padding: '12px 14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#12304A' }}>
                Your Target Budget: 
              </span>
              <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#2C8C83', marginLeft: '6px' }}>
                {budget > 0 ? `₹${budget.toLocaleString('en-IN')}` : 'No Budget Set (Open Range)'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isEditingBudget ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input 
                    type="number"
                    step="5000"
                    placeholder="Enter budget (INR)"
                    value={budget || ''}
                    onChange={(e) => handleUpdateBudget(Number(e.target.value))}
                    style={{
                      width: '140px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.82rem'
                    }}
                  />
                  <button 
                    onClick={() => setIsEditingBudget(false)}
                    className="btn btn-primary btn-sm"
                    style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsEditingBudget(true)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                >
                  {budget > 0 ? 'Edit Budget' : '+ Set Your Budget'}
                </button>
              )}
            </div>
          </div>

          {/* Suggested Cost-Saving Actions */}
          <div style={{
            backgroundColor: '#FAFAF9',
            border: '1px solid #E7E5E4',
            borderRadius: '12px',
            padding: '12px 16px'
          }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#12304A', marginBottom: '8px' }}>
              💡 Evidence-Based Cost Saving Options:
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: '#334155', lineHeight: 1.6 }}>
              <li>
                <strong>Compare Government Hospitals:</strong> Autonomous & govt teaching institutes (NIMS, AIIMS, Gandhi, Osmania) provide subsidized or free care under state health quotas.
              </li>
              <li>
                <strong>Verify Government Health Schemes:</strong> Check empanelment for PM-JAY (Ayushman Bharat) or Aarogyasri Trust packages to secure cashless pre-authorization.
              </li>
              <li>
                <strong>Request Jan Aushadhi Generic Equivalents:</strong> NPPA price-capped generics save up to 60–80% on post-discharge medication.
              </li>
              <li>
                <strong>Ask for Written Tariff Quotation:</strong> Request an itemized estimate from the billing desk detailing bed charges, surgeon honorarium, and implant model before admission.
              </li>
            </ul>

            {/* Quick Action Links */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
              {onExploreGovtHospitals && (
                <button 
                  onClick={onExploreGovtHospitals}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                >
                  <ArrowDownCircle size={14} color="#059669" />
                  <span>View Govt Hospitals</span>
                </button>
              )}
              {onExploreSchemes && (
                <button 
                  onClick={onExploreSchemes}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                >
                  <ShieldCheck size={14} color="#2563EB" />
                  <span>Check Scheme Eligibility</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
