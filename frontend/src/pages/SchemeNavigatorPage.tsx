import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSearch } from '../context/SearchContext';
import { 
  Shield, 
  HelpCircle, 
  Info, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  RefreshCw,
  Building2,
  Lock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  MapPin,
  Activity
} from 'lucide-react';
import { api, SchemeMatchDTO, TreatmentDTO, FacilityDTO } from '../services/api';
import { SchemeCard } from '../components/SchemeCard';
import { STATES_AND_UTS, IndianState } from '../data/indiaGeography';
import './SchemeNavigatorPage.css';

export const SchemeNavigatorPage: React.FC = () => {
  const { t } = useLanguage();
  const { searchState } = useSearch();

  const [treatmentsList, setTreatmentsList] = useState<TreatmentDTO[]>([]);
  const [facilitiesList, setFacilitiesList] = useState<FacilityDTO[]>([]);

  // Form Fields
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string>(searchState.treatmentId || 'knee_replacement');
  const [selectedState, setSelectedState] = useState<string>(searchState.state || 'Telangana');
  const [annualIncome, setAnnualIncome] = useState<number>(2.5); // Lakhs
  const [rationCard, setRationCard] = useState<string>('White Card (Food Security Card)');
  const [isCentralGovt, setIsCentralGovt] = useState<boolean>(false);
  const [isFormalSector, setIsFormalSector] = useState<boolean>(false);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('');

  // Other states toggle (defaults to false; auto-enabled if state is changed outside Telangana)
  const [showOtherStateSchemes, setShowOtherStateSchemes] = useState<boolean>(false);

  // Group Collapsible State
  const [isGroup1Open, setIsGroup1Open] = useState<boolean>(true); // Likely eligible
  const [isGroup2Open, setIsGroup2Open] = useState<boolean>(true); // Needs more info
  const [isGroup3Open, setIsGroup3Open] = useState<boolean>(false); // Does not match (collapsed by default)

  const [matches, setMatches] = useState<SchemeMatchDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync state from searchState when changed
  useEffect(() => {
    if (searchState.state) {
      setSelectedState(searchState.state);
      if (searchState.state !== 'Telangana') {
        setShowOtherStateSchemes(true);
      }
    }
  }, [searchState.state]);

  useEffect(() => {
    if (searchState.treatmentId) {
      setSelectedTreatmentId(searchState.treatmentId);
    }
  }, [searchState.treatmentId]);

  // Load initial catalogue data
  useEffect(() => {
    api.getTreatments().then(setTreatmentsList).catch(console.error);
    api.getFacilities().then(setFacilitiesList).catch(console.error);
  }, []);

  // Evaluation trigger
  const runEvaluation = useCallback(async () => {
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
  }, [selectedTreatmentId, selectedState, annualIncome, rationCard, isCentralGovt, isFormalSector, selectedFacilityId, treatmentsList]);

  // Re-run evaluation whenever form fields change
  useEffect(() => {
    runEvaluation();
  }, [runEvaluation]);

  // Current procedure object
  const currentTreatment = useMemo(() => {
    return treatmentsList.find(t => t.id === selectedTreatmentId);
  }, [treatmentsList, selectedTreatmentId]);

  // Separate matches into the 3 specified groups
  const likelyEligible = useMemo(() => {
    return matches.filter(m => m.group === 'likely_eligible');
  }, [matches]);

  const needsMoreInfo = useMemo(() => {
    return matches.filter(m => m.group === 'needs_more_info');
  }, [matches]);

  const doesNotMatch = useMemo(() => {
    return matches.filter(m => {
      if (m.group !== 'does_not_match') return false;
      // Filter out other state schemes if toggle is off
      if (!showOtherStateSchemes && m.state_match === false) {
        return false;
      }
      return true;
    });
  }, [matches, showOtherStateSchemes]);

  // Best match scheme
  const bestMatch = useMemo(() => {
    if (likelyEligible.length > 0) return likelyEligible[0];
    if (needsMoreInfo.length > 0) return needsMoreInfo[0];
    return null;
  }, [likelyEligible, needsMoreInfo]);

  const scrollToScheme = (schemeId: string) => {
    const el = document.getElementById(`scheme-card-${schemeId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Temporary highlight pulse
      el.style.outline = '3px solid #0D9488';
      setTimeout(() => {
        el.style.outline = 'none';
      }, 2000);
    }
  };

  return (
    <div className="scheme-navigator-page-root">
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <div className="badge badge-teal" style={{ marginBottom: '8px' }}>
          Step 5 of 5: Financial Support & Public Schemes
        </div>
        <h1 style={{ fontSize: '2.1rem', color: 'var(--color-navy)', marginBottom: '8px', fontWeight: 800 }}>
          Government Scheme & Insurance Navigator
        </h1>
        <p style={{ color: 'var(--color-text-grey)', fontSize: '1rem', maxWidth: '850px', margin: 0 }}>
          Screening for Ayushman Bharat (PM-JAY), State Health Schemes (Telangana Aarogyasri, MJPJAY, AB-ArK, YSR Aarogyasri), CGHS, and ESIC. Verified transparent criteria with direct official government portal links.
        </p>
      </div>

      {/* Main Two-Column Discovery Layout */}
      <div className="scheme-discovery-layout">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Sticky Eligibility Assessment Form + Results at a Glance   */}
        {/* ========================================================================= */}
        <div className="scheme-left-column">
          
          {/* Eligibility Questionnaire Card */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-mint)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-teal)'
                }}>
                  <Shield size={18} />
                </div>
                <h2 style={{ fontSize: '1.15rem', color: 'var(--color-navy)', margin: 0, fontWeight: 700 }}>
                  Patient Eligibility Profile
                </h2>
              </div>
              {isLoading && (
                <RefreshCw size={14} className="spin" color="var(--color-teal)" />
              )}
            </div>

            {/* Privacy Guarantee Notice */}
            <div style={{
              backgroundColor: 'var(--color-warm-bg)',
              borderRadius: '8px',
              padding: '8px 12px',
              border: '1px solid var(--color-border)',
              fontSize: '0.78rem',
              color: 'var(--color-text-grey)',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Lock size={13} color="var(--color-teal)" style={{ flexShrink: 0 }} />
              <span>Evaluated securely against public health rules. No identity numbers stored.</span>
            </div>

            {/* Field: Procedure */}
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                Requested Procedure / Treatment:
              </label>
              <select
                className="form-select"
                value={selectedTreatmentId}
                onChange={e => setSelectedTreatmentId(e.target.value)}
                style={{ fontSize: '0.88rem' }}
              >
                {treatmentsList.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              {currentTreatment && currentTreatment.indicative_min && currentTreatment.indicative_max && (
                <div style={{ fontSize: '0.74rem', color: '#0D9488', marginTop: '4px', fontWeight: 600 }}>
                  Est. Procedure Cost: ₹{currentTreatment.indicative_min.toLocaleString('en-IN')} - ₹{currentTreatment.indicative_max.toLocaleString('en-IN')}
                </div>
              )}
            </div>

            {/* Field: State / UT */}
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                State / Union Territory of Residence:
              </label>
              <select
                className="form-select"
                value={selectedState}
                onChange={e => {
                  setSelectedState(e.target.value);
                  if (e.target.value !== 'Telangana') {
                    setShowOtherStateSchemes(true);
                  }
                }}
                style={{ fontSize: '0.88rem' }}
              >
                {STATES_AND_UTS.map((st: IndianState) => (
                  <option key={st.code} value={st.name}>
                    {st.name} {st.name === 'Telangana' ? '(Aarogyasri)' : st.name === 'Maharashtra' ? '(MJPJAY)' : st.name === 'Karnataka' ? '(AB-ArK)' : st.name === 'Andhra Pradesh' ? '(Dr. YSR Aarogyasri)' : st.name === 'Delhi' ? '(DAK)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Field: Ration Card */}
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, margin: 0 }}>
                  Ration Card Category:
                </label>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-teal)', fontWeight: 600 }}>BPL / Priority</span>
              </div>
              <select
                className="form-select"
                value={rationCard}
                onChange={e => setRationCard(e.target.value)}
                style={{ fontSize: '0.88rem' }}
              >
                <option value="White Card (Food Security Card)">White Card (Food Security Card / BPL)</option>
                <option value="Antyodaya Anna Yojana (AAY)">Antyodaya Anna Yojana (AAY / Indigent)</option>
                <option value="Pink Card (APL)">Pink Card (Above Poverty Line - APL)</option>
                <option value="No Ration Card">No Ration Card</option>
              </select>
            </div>

            {/* Field: Household Income Slider */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, margin: 0 }}>
                  Annual Household Income:
                </label>
                <span style={{ fontWeight: 800, color: 'var(--color-navy)', fontSize: '0.88rem' }}>
                  ₹{annualIncome.toFixed(1)} Lakhs / yr
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
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-text-grey)', marginTop: '4px' }}>
                <span>₹0.5L (BPL)</span>
                <span>₹2.5L (Aarogyasri limit)</span>
                <span>₹5.0L</span>
                <span>₹12.0L+</span>
              </div>
            </div>

            {/* Field: Employment Status Checkboxes */}
            <div style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                Special Employment Category:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.82rem', cursor: 'pointer', color: '#1E293B' }}>
                  <input
                    type="checkbox"
                    checked={isCentralGovt}
                    onChange={e => setIsCentralGovt(e.target.checked)}
                    style={{ accentColor: 'var(--color-teal)', marginTop: '3px' }}
                  />
                  <span>Central Govt Employee / Pensioner (CGHS)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.82rem', cursor: 'pointer', color: '#1E293B' }}>
                  <input
                    type="checkbox"
                    checked={isFormalSector}
                    onChange={e => setIsFormalSector(e.target.checked)}
                    style={{ accentColor: 'var(--color-teal)', marginTop: '3px' }}
                  />
                  <span>Formal sector wage earner ≤ ₹21,000/mo (ESIC)</span>
                </label>
              </div>
            </div>

            {/* Field: Hospital Empanelment Selection */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                Check Specific Hospital Empanelment:
              </label>
              <select
                className="form-select"
                value={selectedFacilityId}
                onChange={e => setSelectedFacilityId(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              >
                <option value="">Any Empanelled Hospital</option>
                {facilitiesList.map(f => (
                  <option key={f.id} value={f.id}>{f.name} ({f.ownership})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sticky "Your Results at a Glance" Card */}
          <div className="scheme-glance-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-navy)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Results at a Glance
              </span>
              <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                {matches.length} Schemes Analyzed
              </span>
            </div>

            <div className="scheme-glance-metrics">
              <div className="scheme-metric-pill green">
                <span className="scheme-metric-number">{likelyEligible.length}</span>
                <span className="scheme-metric-label">Likely Eligible</span>
              </div>
              <div className="scheme-metric-pill amber">
                <span className="scheme-metric-number">{needsMoreInfo.length}</span>
                <span className="scheme-metric-label">Needs Info</span>
              </div>
              <div className="scheme-metric-pill gray">
                <span className="scheme-metric-number">{doesNotMatch.length}</span>
                <span className="scheme-metric-label">Not Matching</span>
              </div>
            </div>

            {/* Best Match Mini-Card */}
            {bestMatch && (
              <div className="scheme-best-match-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <Sparkles size={14} color="#0D9488" />
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0D9488', textTransform: 'uppercase' }}>
                    Top Recommended Match
                  </span>
                </div>
                <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0F172A', marginBottom: '2px' }}>
                  {bestMatch.scheme.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '8px' }}>
                  Coverage Ceiling: <strong>{bestMatch.scheme.coverage_limit_inr}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => scrollToScheme(bestMatch.scheme.id)}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', fontSize: '0.78rem', padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <span>View Details on Card</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: 3 Collapsible Scheme Groups & Equal-Height Cards Grid      */}
        {/* ========================================================================= */}
        <div className="scheme-right-column">
          
          {/* GROUP 1: LIKELY ELIGIBLE FOR YOU */}
          <div>
            <button
              type="button"
              className={`scheme-group-header ${isGroup1Open ? 'open' : ''}`}
              onClick={() => setIsGroup1Open(!isGroup1Open)}
              aria-expanded={isGroup1Open}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#ECFDF5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}>
                  {likelyEligible.length}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-navy)' }}>
                    Likely Eligible for You
                  </span>
                  <div style={{ fontSize: '0.76rem', color: 'var(--color-text-grey)' }}>
                    All core resident and income eligibility criteria satisfied
                  </div>
                </div>
              </div>
              <div>
                {isGroup1Open ? <ChevronUp size={20} color="#64748B" /> : <ChevronDown size={20} color="#64748B" />}
              </div>
            </button>

            {isGroup1Open && (
              <div className="scheme-cards-grid">
                {likelyEligible.length > 0 ? (
                  likelyEligible.map((m) => (
                    <SchemeCard key={m.scheme.id} id={`scheme-card-${m.scheme.id}`} match={m} />
                  ))
                ) : (
                  <div className="card" style={{ padding: '24px', textAlign: 'center', color: '#64748B', gridColumn: '1 / -1' }}>
                    No schemes currently match all criteria for the selected profile. Review required criteria in the "Needs Information" section below.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* GROUP 2: NEEDS MORE INFORMATION */}
          <div>
            <button
              type="button"
              className={`scheme-group-header ${isGroup2Open ? 'open' : ''}`}
              onClick={() => setIsGroup2Open(!isGroup2Open)}
              aria-expanded={isGroup2Open}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFBEB',
                  color: '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}>
                  {needsMoreInfo.length}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-navy)' }}>
                    Needs More Information
                  </span>
                  <div style={{ fontSize: '0.76rem', color: 'var(--color-text-grey)' }}>
                    Potentially applicable, but requires card verification or specific employment confirmation
                  </div>
                </div>
              </div>
              <div>
                {isGroup2Open ? <ChevronUp size={20} color="#64748B" /> : <ChevronDown size={20} color="#64748B" />}
              </div>
            </button>

            {isGroup2Open && (
              <div className="scheme-cards-grid">
                {needsMoreInfo.length > 0 ? (
                  needsMoreInfo.map((m) => (
                    <SchemeCard key={m.scheme.id} id={`scheme-card-${m.scheme.id}`} match={m} />
                  ))
                ) : (
                  <div className="card" style={{ padding: '20px', textAlign: 'center', color: '#64748B', gridColumn: '1 / -1' }}>
                    All applicable schemes have completed assessment.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* GROUP 3: DOES NOT MATCH YOUR PROFILE */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <button
                type="button"
                className={`scheme-group-header ${isGroup3Open ? 'open' : ''}`}
                style={{ marginBottom: 0 }}
                onClick={() => setIsGroup3Open(!isGroup3Open)}
                aria-expanded={isGroup3Open}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#F1F5F9',
                    color: '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}>
                    {doesNotMatch.length}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-navy)' }}>
                      Does Not Match Your Profile
                    </span>
                    <div style={{ fontSize: '0.76rem', color: 'var(--color-text-grey)' }}>
                      Outside resident jurisdiction or ineligible income/employment category
                    </div>
                  </div>
                </div>
                <div>
                  {isGroup3Open ? <ChevronUp size={20} color="#64748B" /> : <ChevronDown size={20} color="#64748B" />}
                </div>
              </button>
            </div>

            {/* Toggle: Show schemes from other states */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '8px',
              padding: '6px 12px',
              fontSize: '0.8rem',
              color: '#64748B'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showOtherStateSchemes}
                  onChange={e => setShowOtherStateSchemes(e.target.checked)}
                  style={{ accentColor: 'var(--color-teal)' }}
                />
                <span>Show schemes from other states</span>
              </label>
            </div>

            {isGroup3Open && (
              <div className="scheme-cards-grid" style={{ marginTop: '10px' }}>
                {doesNotMatch.length > 0 ? (
                  doesNotMatch.map((m) => (
                    <SchemeCard key={m.scheme.id} id={`scheme-card-${m.scheme.id}`} match={m} />
                  ))
                ) : (
                  <div className="card" style={{ padding: '20px', textAlign: 'center', color: '#64748B', gridColumn: '1 / -1' }}>
                    No schemes disqualified under current profile filters.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Statutory Notice Card */}
          <div style={{
            backgroundColor: '#FFFBEB',
            border: '1px solid #FDE68A',
            borderRadius: '12px',
            padding: '16px 20px',
            fontSize: '0.84rem',
            color: '#92400E',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <AlertCircle size={20} color="#D97706" style={{ flexShrink: 0 }} />
            <div>
              <strong>Statutory Guidance:</strong> All outcomes provided by CareSaathi AI are indicative screenings based on verified public authority guidelines. Pre-authorization and claim admission are governed by on-site hospital Aarogyamitra / Ayushman Mitra officials and respective government trusts.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
