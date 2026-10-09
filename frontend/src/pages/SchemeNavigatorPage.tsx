import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSearch } from '../context/SearchContext';
import { 
  Shield, 
  HelpCircle, 
  Info, 
  CheckCircle2, 
  AlertCircle, 
  PhoneCall, 
  ExternalLink, 
  FileText, 
  RefreshCw,
  Building2,
  Lock
} from 'lucide-react';
import { api, SchemeMatchDTO, TreatmentDTO, FacilityDTO } from '../services/api';
import { SchemeCard } from '../components/SchemeCard';

export const SchemeNavigatorPage: React.FC = () => {
  const { t } = useLanguage();
  const { searchState } = useSearch();

  const [treatmentsList, setTreatmentsList] = useState<TreatmentDTO[]>([]);
  const [facilitiesList, setFacilitiesList] = useState<FacilityDTO[]>([]);

  // Form Fields
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string>(searchState.treatmentId || 'knee_replacement');
  const [selectedState, setSelectedState] = useState<string>('Telangana');
  const [annualIncome, setAnnualIncome] = useState<number>(2.5); // Lakhs
  const [rationCard, setRationCard] = useState<string>('White Card (Food Security Card)');
  const [isCentralGovt, setIsCentralGovt] = useState<boolean>(false);
  const [isFormalSector, setIsFormalSector] = useState<boolean>(false);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('');

  const [matches, setMatches] = useState<SchemeMatchDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    api.getTreatments().then(setTreatmentsList).catch(console.error);
    api.getFacilities().then(setFacilitiesList).catch(console.error);
    runEvaluation();
  }, [selectedTreatmentId, selectedState, annualIncome, rationCard, isCentralGovt, isFormalSector, selectedFacilityId]);

  const runEvaluation = async () => {
    setIsLoading(true);
    try {
      const selectedT = treatmentsList.find(t => t.id === selectedTreatmentId);
      const res = await api.matchSchemes({
        treatment_id: selectedTreatmentId,
        treatment_name: selectedT?.name,
        state: selectedState,
        annual_income: annualIncome,
        ration_card_type: rationCard,
        is_central_govt_employee: isCentralGovt,
        is_formal_sector_employed: isFormalSector,
        selected_facility_id: selectedFacilityId || undefined
      });
      setMatches(res);
    } catch (err) {
      console.error("Scheme match failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="section" style={{ paddingTop: '30px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <div className="badge badge-teal" style={{ marginBottom: '8px' }}>
            Public Healthcare Financing & Insurance
          </div>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--color-navy)', marginBottom: '8px' }}>
            Government Scheme & Insurance Navigator
          </h1>
          <p style={{ color: 'var(--color-text-grey)', fontSize: '1.05rem', maxWidth: '780px' }}>
            Determine whether your treatment is eligible for cashless treatment under Ayushman Bharat (PM-JAY), Telangana Rajiv Aarogyasri, CGHS, or ESIC.
          </p>
        </div>

        {/* Layout: Interactive Assessment Questionnaire (Left) + Scheme Match Results (Right) */}
        <div className="grid-2" style={{ alignItems: 'flex-start', gap: '30px' }}>
          {/* Questionnaire Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-mint)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-teal)'
              }}>
                <Shield size={18} />
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--color-navy)' }}>
                Eligibility Questionnaire
              </h3>
            </div>

            {/* Privacy Guarantee Notice */}
            <div style={{
              backgroundColor: 'var(--color-warm-bg)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              border: '1px solid var(--color-border)',
              fontSize: '0.8rem',
              color: 'var(--color-text-grey)',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Lock size={14} color="var(--color-teal)" />
              <span>We never store personal income or identity data. Information is evaluated client-side only.</span>
            </div>

            {/* Field: Procedure */}
            <div className="form-group">
              <label className="form-label">Requested Procedure or Treatment:</label>
              <select
                className="form-select"
                value={selectedTreatmentId}
                onChange={e => setSelectedTreatmentId(e.target.value)}
              >
                {treatmentsList.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Field: State */}
            <div className="form-group">
              <label className="form-label">State of Residence:</label>
              <select
                className="form-select"
                value={selectedState}
                onChange={e => setSelectedState(e.target.value)}
              >
                <option value="Telangana">Telangana (Aarogyasri Active)</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Delhi">Delhi</option>
                <option value="Maharashtra">Maharashtra</option>
              </select>
            </div>

            {/* Field: Ration Card */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Ration Card Category:</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-grey)' }}>Key for Aarogyasri / PMJAY</span>
              </label>
              <select
                className="form-select"
                value={rationCard}
                onChange={e => setRationCard(e.target.value)}
              >
                <option value="White Card (Food Security Card)">White Card (Food Security Card / BPL)</option>
                <option value="Antyodaya Anna Yojana (AAY)">Antyodaya Anna Yojana (AAY / Indigent)</option>
                <option value="Pink Card (APL)">Pink Card (Above Poverty Line - APL)</option>
                <option value="No Ration Card">No Ration Card</option>
              </select>
            </div>

            {/* Field: Household Income Slider */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label className="form-label" style={{ margin: 0 }}>
                  Annual Household Income:
                </label>
                <span style={{ fontWeight: 700, color: 'var(--color-navy)', fontSize: '0.9rem' }}>
                  ₹{annualIncome.toFixed(1)} Lakhs / year
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="12.0"
                step="0.5"
                value={annualIncome}
                onChange={e => setAnnualIncome(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-teal)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-grey)', marginTop: '4px' }}>
                <span>₹0.5L (BPL)</span>
                <span>₹2.5L (Aarogyasri Cutoff)</span>
                <span>₹5.0L</span>
                <span>₹12.0L+</span>
              </div>
            </div>

            {/* Field: Employment Type Checkboxes */}
            <div style={{ marginBottom: '18px' }}>
              <label className="form-label">Employment Status (Check if applicable):</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isCentralGovt}
                    onChange={e => setIsCentralGovt(e.target.checked)}
                    style={{ accentColor: 'var(--color-teal)' }}
                  />
                  <span>Central Government Employee or Pensioner (CGHS Eligible)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isFormalSector}
                    onChange={e => setIsFormalSector(e.target.checked)}
                    style={{ accentColor: 'var(--color-teal)' }}
                  />
                  <span>Formal Sector Worker with salary ≤ ₹21,000/mo (ESIC Eligible)</span>
                </label>
              </div>
            </div>

            {/* Field: Selected Hospital for Empanelment Check */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Check Empanelment at Specific Hospital (Optional):</label>
              <select
                className="form-select"
                value={selectedFacilityId}
                onChange={e => setSelectedFacilityId(e.target.value)}
              >
                <option value="">Any Empanelled Hospital</option>
                {facilitiesList.map(f => (
                  <option key={f.id} value={f.id}>{f.name} ({f.ownership})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Scheme Matching Results (Right) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {matches.map((m, idx) => (
              <SchemeCard key={idx} match={m} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
