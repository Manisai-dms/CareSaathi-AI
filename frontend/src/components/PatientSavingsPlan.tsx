import React, { useState } from 'react';
import { 
  PiggyBank, 
  Printer, 
  Share2, 
  HelpCircle, 
  CheckSquare, 
  Square, 
  ShieldCheck, 
  Building2, 
  AlertTriangle, 
  Info,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import { AnimatedRupeeCounter } from './AnimatedRupeeCounter';

export interface PatientSavingsPlanProps {
  treatmentName: string;
  treatmentBudgetMin: number;
  treatmentBudgetMax: number;
  medicineBudgetMin?: number;
  medicineBudgetMax?: number;
  additionalExpensesBuffer?: number;
  userBudget?: number;
  suggestedGovtHospitals?: string[];
  matchedSchemes?: string[];
  city?: string;
}

export const PatientSavingsPlan: React.FC<PatientSavingsPlanProps> = ({
  treatmentName,
  treatmentBudgetMin,
  treatmentBudgetMax,
  medicineBudgetMin = 0,
  medicineBudgetMax = 0,
  additionalExpensesBuffer = 10000,
  userBudget = 0,
  suggestedGovtHospitals = ['Nizam\'s Institute of Medical Sciences (NIMS)', 'Gandhi Hospital', 'Osmania General Hospital'],
  matchedSchemes = ['Ayushman Bharat PM-JAY', 'Telangana Aarogyasri Trust Scheme'],
  city = 'Hyderabad'
}) => {
  // Privacy Toggle: User chooses whether to include specific clinical condition in print/export
  const [includeSensitiveDiagnosis, setIncludeSensitiveDiagnosis] = useState(false);

  // Pre-admission questions checklist state (unchecked by default)
  const [checkedQuestions, setCheckedQuestions] = useState<{ [key: number]: boolean }>({});

  const billingQuestions = [
    "Is this a comprehensive package quote or does it exclude surgeon honorarium, ICU, and OT charges?",
    "What specific implant brand, make, and statutory NPPA price cap applies to this surgery?",
    "Are diagnostic tests (pre-op MRI/CT/blood work) covered in this package or billed separately?",
    "Does this hospital accept cashless claims for PM-JAY / State Aarogyasri / My TPA insurer?",
    "What is the estimated cost per additional day if ICU or high-dependency care is required?",
    "Can generic equivalents from Jan Aushadhi be supplied or used during discharge?"
  ];

  const toggleQuestion = (index: number) => {
    setCheckedQuestions(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handlePrint = () => {
    window.print();
  };

  // Grand Total Estimated
  const planTotalMin = treatmentBudgetMin + medicineBudgetMin;
  const planTotalMax = treatmentBudgetMax + medicineBudgetMax + additionalExpensesBuffer;

  return (
    <div 
      className="card patient-savings-plan cost-estimator-card-elevation"
      id="patient-savings-plan-panel"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1.5px solid #CBD5E1',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 14px rgba(18, 48, 74, 0.06)',
        marginBottom: '28px'
      }}
    >
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-teal" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <PiggyBank size={14} />
              <span>Personal Financial Preparedness</span>
            </span>
            <span className="badge badge-navy">Printable / Exportable</span>
          </div>
          <h3 style={{ fontSize: '1.4rem', color: '#12304A', margin: 0, fontWeight: 700 }}>
            My Patient Savings & Care Plan
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64717D', margin: '4px 0 0' }}>
            A structured budget, potential financial assistance avenues, and essential pre-admission billing checklist.
          </p>
        </div>

        {/* Print / Export Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handlePrint}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem' }}
          >
            <Printer size={15} />
            <span>Print Savings Plan</span>
          </button>
        </div>
      </div>

      {/* Privacy Safeguard Switcher */}
      <div style={{
        backgroundColor: '#F8FAF9',
        border: '1px solid #E2E8F0',
        borderRadius: '10px',
        padding: '10px 14px',
        marginBottom: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {includeSensitiveDiagnosis ? <Eye size={16} color="#2C8C83" /> : <EyeOff size={16} color="#64748B" />}
          <span style={{ fontSize: '0.82rem', color: '#12304A', fontWeight: 500 }}>
            Privacy Safeguard: {includeSensitiveDiagnosis ? 'Specific procedure name included in print' : 'Procedure name generalized to "Healthcare Treatment"'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIncludeSensitiveDiagnosis(!includeSensitiveDiagnosis)}
          style={{
            background: 'none',
            border: 'none',
            color: '#2C8C83',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          {includeSensitiveDiagnosis ? 'Hide Specific Diagnosis' : 'Include Specific Diagnosis'}
        </button>
      </div>

      {/* Plan Summary Grid: Equal-width 4 columns >= 1100px, 2 columns tablet */}
      <div className="patient-savings-summary-grid">
        {/* Treatment Budget */}
        <div 
          className="cost-estimator-interactive-row"
          style={{
            backgroundColor: '#F8FAF9',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '14px'
          }}
        >
          <div style={{ fontSize: '0.74rem', color: '#64717D', textTransform: 'uppercase', fontWeight: 600 }}>
            Procedure / Hospital Budget
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#12304A', marginTop: '4px' }}>
            <AnimatedRupeeCounter value={Math.round(treatmentBudgetMin)} /> – <AnimatedRupeeCounter value={Math.round(treatmentBudgetMax)} />
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64717D', marginTop: '2px' }}>
            Target for in-patient admission
          </div>
        </div>

        {/* Medicine & Generic Plan */}
        <div 
          className="cost-estimator-interactive-row"
          style={{
            backgroundColor: '#F8FAF9',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '14px'
          }}
        >
          <div style={{ fontSize: '0.74rem', color: '#64717D', textTransform: 'uppercase', fontWeight: 600 }}>
            Medicine Budget (Post-Op)
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#059669', marginTop: '4px' }}>
            <AnimatedRupeeCounter value={Math.round(medicineBudgetMin)} /> – <AnimatedRupeeCounter value={Math.round(medicineBudgetMax)} />
          </div>
          <div style={{ fontSize: '0.74rem', color: '#059669', marginTop: '2px' }}>
            Jan Aushadhi generic savings
          </div>
        </div>

        {/* Buffer for Additional Expenses */}
        <div 
          className="cost-estimator-interactive-row"
          style={{
            backgroundColor: '#F8FAF9',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '14px'
          }}
        >
          <div style={{ fontSize: '0.74rem', color: '#64717D', textTransform: 'uppercase', fontWeight: 600 }}>
            Recommended Emergency Buffer
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#B45309', marginTop: '4px' }}>
            <AnimatedRupeeCounter value={Math.round(additionalExpensesBuffer)} />
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64717D', marginTop: '2px' }}>
            Transport, attendant meals & rehab
          </div>
        </div>

        {/* Overall Episode Budget */}
        <div 
          className="cost-estimator-interactive-row"
          style={{
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '12px',
            padding: '14px'
          }}
        >
          <div style={{ fontSize: '0.74rem', color: '#1E40AF', textTransform: 'uppercase', fontWeight: 700 }}>
            Total Financial Requirement
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E3A8A', marginTop: '4px' }}>
            <AnimatedRupeeCounter value={Math.round(planTotalMin)} /> – <AnimatedRupeeCounter value={Math.round(planTotalMax)} />
          </div>
          <div style={{ fontSize: '0.74rem', color: '#2563EB', marginTop: '2px' }}>
            {userBudget > 0 ? `Target Budget: ₹${Math.round(userBudget).toLocaleString('en-IN')}` : 'Full episode scope'}
          </div>
        </div>
      </div>

      {/* Lower-Cost Hospitals to Investigate */}
      <div style={{
        backgroundColor: '#F8FAF9',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '18px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Building2 size={18} color="#2C8C83" />
          <h4 style={{ margin: 0, fontSize: '0.98rem', color: '#12304A', fontWeight: 700 }}>
            Lower-Cost Hospitals to Investigate in {city}:
          </h4>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '10px' }}>
          Government teaching hospitals and non-profit charitable trusts provide subsidized medical packages under statutory rate schedules:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', width: '100%' }}>
          {suggestedGovtHospitals.map((h, i) => (
            <span 
              key={i} 
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '0.8rem',
                color: '#12304A',
                fontWeight: 600,
                flex: '1 1 auto',
                textAlign: 'center'
              }}
            >
              🏥 {h}
            </span>
          ))}
        </div>
      </div>

      {/* Potential Assistance Options that Need Verification */}
      <div style={{
        backgroundColor: '#F0FDF4',
        border: '1px solid #BBF7D0',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '18px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <ShieldCheck size={18} color="#166534" />
          <h4 style={{ margin: 0, fontSize: '0.98rem', color: '#166534', fontWeight: 700 }}>
            Potential Health Assistance Options (Needs Pre-Authorization Verification):
          </h4>
        </div>
        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', color: '#14532D', lineHeight: 1.6 }}>
          {matchedSchemes.map((s, idx) => (
            <li key={idx}>
              <strong>{s}:</strong> Confirm empanelled bed availability with the on-duty hospital Aarogya Mitra kiosk.
            </li>
          ))}
          <li>
            <strong>Hospital Charitable Trust Waiver:</strong> Most major private trusts reserve 10% beds for economically disadvantaged families under high court mandates.
          </li>
        </ul>
      </div>

      {/* Questions to Ask the Hospital Before Treatment */}
      <div style={{
        backgroundColor: '#FAFAF9',
        border: '1px solid #E7E5E4',
        borderRadius: '12px',
        padding: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <HelpCircle size={18} color="#D97706" />
          <h4 style={{ margin: 0, fontSize: '0.98rem', color: '#12304A', fontWeight: 700 }}>
            Smart Questions to Ask the Hospital Billing Desk Before Admission:
          </h4>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {billingQuestions.map((q, idx) => {
            const isChecked = checkedQuestions[idx] || false;
            return (
              <div 
                key={idx}
                onClick={() => toggleQuestion(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  backgroundColor: isChecked ? '#F1F5F9' : 'transparent',
                  transition: 'background-color 0.15s ease'
                }}
              >
                {isChecked ? (
                  <CheckSquare size={17} color="#2C8C83" style={{ flexShrink: 0, marginTop: '2px' }} />
                ) : (
                  <Square size={17} color="#94A3B8" style={{ flexShrink: 0, marginTop: '2px' }} />
                )}
                <span style={{ 
                  fontSize: '0.84rem', 
                  color: isChecked ? '#94A3B8' : '#334155', 
                  lineHeight: 1.45, 
                  textDecoration: isChecked ? 'line-through' : 'none',
                  transition: 'color 0.15s ease'
                }}>
                  {q}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
