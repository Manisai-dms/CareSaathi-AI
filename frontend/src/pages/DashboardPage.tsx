import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSearch } from '../context/SearchContext';
import { 
  Search, 
  Mic, 
  Upload, 
  MapPin, 
  ArrowRight, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  DollarSign, 
  Building2,
  RefreshCw,
  Info,
  Printer
} from 'lucide-react';
import { api, CostEstimateDTO, FacilityDTO, SchemeMatchDTO, NLPParseDTO } from '../services/api';
import { HospitalCard } from '../components/HospitalCard';
import { SchemeCard } from '../components/SchemeCard';
import { CostBreakdownModal } from '../components/CostBreakdownModal';
import { HospitalDetailModal } from '../components/HospitalDetailModal';
import { OutOfPocketWaterfallChart } from '../components/OutOfPocketWaterfallChart';
import { ItemizedComponentsTable } from '../components/ItemizedComponentsTable';
import { ChecklistsCard } from '../components/ChecklistsCard';
import { TierComparisonView } from '../components/TierComparisonView';
import { EmergencyInterruptModal } from '../components/EmergencyInterruptModal';
import { PrintSummaryModal } from '../components/PrintSummaryModal';
import { CostBreakdownDonut } from '../components/CostBreakdownDonut';
import { ShareModal } from '../components/ShareModal';
import { MessageSquare, Share2 } from 'lucide-react';

interface DashboardPageProps {
  onOpenVoice: () => void;
  onOpenRx: () => void;
  onNavigateTab: (tab: string) => void;
  onTriggerEmergency: (message: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenVoice,
  onOpenRx,
  onNavigateTab,
  onTriggerEmergency
}) => {
  const { t } = useLanguage();
  const { searchState, setSearchQuery, setTreatment, setLocation, addRecentSearch } = useSearch();

  const [inputQuery, setInputQuery] = useState(searchState.query || "I need a knee replacement in Hyderabad");
  const [selectedCity, setSelectedCity] = useState("Hyderabad");
  const [selectedLocality, setSelectedLocality] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [nlpResult, setNlpResult] = useState<NLPParseDTO | null>(null);
  const [costResult, setCostResult] = useState<CostEstimateDTO | null>(null);
  const [facilities, setFacilities] = useState<FacilityDTO[]>([]);
  const [schemes, setSchemes] = useState<SchemeMatchDTO[]>([]);
  
  // Phase 2 & 3 State
  const [analysisTab, setAnalysisTab] = useState<'donut' | 'waterfall' | 'components' | 'tiers' | 'checklists'>('donut');
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [emergencyGuidance, setEmergencyGuidance] = useState("");
  const [selectedFacilityForModal, setSelectedFacilityForModal] = useState<FacilityDTO | null>(null);

  // Initial Load with default search
  useEffect(() => {
    executeSearch(inputQuery);
  }, []);

  const executeSearch = async (textToSearch: string) => {
    if (!textToSearch.trim()) return;
    setIsLoading(true);
    addRecentSearch(textToSearch);

    try {
      // 1. NLP Parse
      const nlp = await api.parseNLP(textToSearch, selectedLocality || selectedCity);
      setNlpResult(nlp);

      // Emergency Check
      if (nlp.emergency_detected) {
        const msg = nlp.triage_guidance || "Emergency medical condition identified. Please call 108 immediately.";
        setEmergencyGuidance(msg);
        setIsEmergencyModalOpen(true);
        onTriggerEmergency(msg);
      }

      const treatmentId = nlp.matched_treatment_id || searchState.treatmentId || "knee_replacement";
      const treatmentName = nlp.extracted_treatment || searchState.treatmentName || "Total Knee Replacement (TKR)";
      const cityLoc = nlp.extracted_location || selectedCity;

      setTreatment(treatmentId, treatmentName);
      setLocation(cityLoc, selectedLocality);

      // 2. Fetch Cost Estimation
      const cost = await api.estimateCost({
        treatment: treatmentName,
        city: cityLoc,
        locality: selectedLocality,
        hospital_name: nlp.extracted_hospital_preference || undefined
      });
      setCostResult(cost);

      // 3. Fetch Nearby Facilities
      const facs = await api.getFacilities({
        city: cityLoc,
        locality: selectedLocality,
        treatment_id: treatmentId,
        sort: "nearest"
      });
      setFacilities(facs);

      // 4. Fetch Matching Schemes
      const matched = await api.matchSchemes({
        treatment_id: treatmentId,
        treatment_name: treatmentName,
        state: "Telangana",
        annual_income: 2.5,
        ration_card_type: "White Card"
      });
      setSchemes(matched);

    } catch (err) {
      console.error("Dashboard search failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(inputQuery);
  };

  const handleQuickSample = (sample: string) => {
    setInputQuery(sample);
    executeSearch(sample);
  };

  return (
    <div className="section" style={{ paddingTop: '30px' }}>
      <div className="container">
        {/* Search Bar Centerpiece */}
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--color-border)',
          marginBottom: '28px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-teal">
                <Sparkles size={14} />
                <span>Accessible Multi-Modal Search</span>
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-text-grey)' }}>
                Type naturally, speak, or upload prescription
              </span>
            </div>

            {/* City & Locality Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={15} color="var(--color-teal)" />
              <select
                value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '4px 8px',
                  fontSize: '0.85rem',
                  color: 'var(--color-navy)',
                  background: 'var(--color-warm-bg)'
                }}
              >
                <option value="Hyderabad">Hyderabad</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Delhi">Delhi NCR</option>
              </select>
              <select
                value={selectedLocality}
                onChange={e => {
                  setSelectedLocality(e.target.value);
                  if (inputQuery) executeSearch(inputQuery);
                }}
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '4px 8px',
                  fontSize: '0.85rem',
                  color: 'var(--color-navy)',
                  background: 'var(--color-warm-bg)'
                }}
              >
                <option value="">All Localities</option>
                <option value="Kukatpally">Kukatpally</option>
                <option value="Banjara Hills">Banjara Hills</option>
                <option value="Jubilee Hills">Jubilee Hills</option>
                <option value="Secunderabad">Secunderabad</option>
                <option value="HITEC City">HITEC City</option>
                <option value="Gachibowli">Gachibowli</option>
                <option value="Somajiguda">Somajiguda</option>
                <option value="Musheerabad">Musheerabad</option>
              </select>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 340px' }}>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '40px', paddingRight: '80px', height: '48px', fontSize: '1rem' }}
                placeholder={t('searchPlaceholder')}
                value={inputQuery}
                onChange={e => setInputQuery(e.target.value)}
              />
              <Search
                size={18}
                color="var(--color-text-grey)"
                style={{ position: 'absolute', left: '14px', top: '15px' }}
              />
              {/* Mic & Rx Buttons Inside Input Box */}
              <div style={{ position: 'absolute', right: '8px', top: '7px', display: 'flex', gap: '4px' }}>
                <button
                  type="button"
                  onClick={onOpenVoice}
                  style={{
                    backgroundColor: 'var(--color-mint)',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-teal)',
                    cursor: 'pointer'
                  }}
                  title={t('voiceBtn')}
                >
                  <Mic size={17} />
                </button>
                <button
                  type="button"
                  onClick={onOpenRx}
                  style={{
                    backgroundColor: 'var(--color-light-blue)',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-navy)',
                    cursor: 'pointer'
                  }}
                  title={t('rxBtn')}
                >
                  <Upload size={17} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ height: '48px', padding: '0 26px', fontSize: '1rem' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>{t('searching')}</span>
                </>
              ) : (
                <>
                  <Search size={18} />
                  <span>{t('searchBtn')}</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Query Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-grey)' }}>
              Try sample:
            </span>
            {[
              "I need a knee replacement in Hyderabad",
              "How much does an MRI cost in Kukatpally?",
              "Find hospitals for cataract surgery near me",
              "I have had a fever for five days"
            ].map(q => (
              <button
                key={q}
                type="button"
                onClick={() => handleQuickSample(q)}
                style={{
                  background: 'var(--color-warm-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-full)',
                  padding: '4px 12px',
                  fontSize: '0.78rem',
                  color: 'var(--color-navy)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* SYMPTOM TRIAGE NOTICE (When query contains a symptom, e.g. 'fever for five days') */}
        {nlpResult?.is_symptom_not_diagnosis && (
          <div style={{
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 22px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px'
          }}>
            <Info size={22} color="#1D4ED8" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#1E40AF', marginBottom: '4px' }}>
                Clinical Safety Note: Symptom Description vs Medical Diagnosis
              </div>
              <p style={{ fontSize: '0.88rem', color: '#1E3A8A', lineHeight: 1.5, marginBottom: '8px' }}>
                {nlpResult.triage_guidance}
              </p>
              {nlpResult.clarification_question && (
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 12px',
                  fontSize: '0.84rem',
                  color: 'var(--color-navy)',
                  border: '1px solid #DBEAFE',
                  fontWeight: 600
                }}>
                  💡 Recommendation: {nlpResult.clarification_question}
                </div>
              )}
            </div>
          </div>
        )}

        {/* RESULTS OVERVIEW GRID */}
        {costResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* Section 1: Cost Overview Result Card */}
            <div className="card" style={{
              background: 'linear-gradient(to right, #FFFFFF 0%, var(--color-mint-subtle) 100%)',
              border: '1px solid var(--color-border)',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span className="badge badge-teal">
                      {costResult.workflow}
                    </span>
                    <span className="badge badge-navy">
                      {costResult.confidence} Confidence
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.6rem', color: 'var(--color-navy)' }}>
                    {costResult.canonical_treatment?.name || costResult.query_treatment}
                  </h2>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-grey)' }}>
                    Category: {costResult.canonical_treatment?.category} • Standard Duration: {costResult.canonical_treatment?.standard_stay_duration}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-grey)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Indicative Cost Range
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-navy)' }}>
                    {costResult.overall_min === 0 ? "₹0 (Free / Subsidized)" : `₹${costResult.overall_min.toLocaleString('en-IN')}`}
                    {" "}— ₹{costResult.overall_max.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-grey)' }}>
                    {costResult.price_type}
                  </div>
                </div>
              </div>

              {/* Confidence & Evidence Explanation */}
              <div style={{
                backgroundColor: 'var(--color-white)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                border: '1px solid var(--color-border)',
                marginBottom: '18px',
                fontSize: '0.85rem',
                color: 'var(--color-navy)'
              }}>
                <strong>Evidence & Methodology:</strong> {costResult.confidence_explanation}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setIsBreakdownOpen(true)}
                    className="btn btn-secondary btn-sm"
                  >
                    <DollarSign size={15} color="var(--color-teal)" />
                    <span>{t('viewBreakdown')}</span>
                  </button>
                  <button
                    onClick={() => setIsShareOpen(true)}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#075E54', borderColor: '#86EFAC' }}
                  >
                    <MessageSquare size={14} color="#25D366" />
                    <span>Share via WhatsApp</span>
                  </button>
                  <button
                    onClick={() => setIsPrintOpen(true)}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Printer size={15} />
                    <span>Print 1-Page Summary</span>
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => onNavigateTab('estimate')}
                    className="btn btn-secondary btn-sm"
                  >
                    <span>Detailed Estimator</span>
                    <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => onNavigateTab('hospitals')}
                    className="btn btn-primary btn-sm"
                  >
                    <span>View All {facilities.length} Hospitals</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Phase 2 & 3: In-Depth Financial & Regulatory Intelligence */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div>
                  <h3 style={{ fontSize: '1.35rem', color: 'var(--color-navy)', margin: 0 }}>
                    In-Depth Financial & Statutory Analysis
                  </h3>
                  <p style={{ fontSize: '0.84rem', color: 'var(--color-text-grey)', margin: '4px 0 0' }}>
                    Interactive cost donut, government price caps, out-of-pocket bridge, and admission checklists
                  </p>
                </div>

                {/* Sub-tabs */}
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  backgroundColor: 'var(--color-white)',
                  padding: '4px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  overflowX: 'auto'
                }}>
                  {[
                    { id: 'donut', label: 'Cost Donut' },
                    { id: 'waterfall', label: 'Waterfall Calculator' },
                    { id: 'components', label: 'NPPA / CGHS Rates' },
                    { id: 'tiers', label: 'Govt vs Private' },
                    { id: 'checklists', label: 'Checklists' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setAnalysisTab(tab.id as any)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        background: analysisTab === tab.id ? 'var(--color-teal)' : 'transparent',
                        color: analysisTab === tab.id ? 'white' : 'var(--color-navy)',
                        fontWeight: 600,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Tab Body */}
              {analysisTab === 'donut' && costResult.cost_breakdown && (
                <CostBreakdownDonut
                  breakdown={costResult.cost_breakdown}
                  minPrice={costResult.overall_min}
                  maxPrice={costResult.overall_max}
                  treatmentName={costResult.canonical_treatment?.name || costResult.query_treatment}
                />
              )}

              {analysisTab === 'waterfall' && costResult.waterfall && (
                <OutOfPocketWaterfallChart
                  waterfall={costResult.waterfall}
                  treatmentName={costResult.canonical_treatment?.name || costResult.query_treatment}
                />
              )}

              {analysisTab === 'components' && costResult.detailed_components && (
                <ItemizedComponentsTable
                  components={costResult.detailed_components}
                  treatmentName={costResult.canonical_treatment?.name || costResult.query_treatment}
                />
              )}

              {analysisTab === 'tiers' && costResult.tier_comparisons && (
                <TierComparisonView
                  tierComparisons={costResult.tier_comparisons}
                  treatmentName={costResult.canonical_treatment?.name || costResult.query_treatment}
                />
              )}

              {analysisTab === 'checklists' && costResult.checklists && (
                <ChecklistsCard
                  checklists={costResult.checklists}
                  treatmentName={costResult.canonical_treatment?.name || costResult.query_treatment}
                />
              )}
            </div>

            {/* Section 2: Nearby Hospital Discovery Preview */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.35rem', color: 'var(--color-navy)' }}>
                    Nearby Healthcare Facilities Offering This Care
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-grey)' }}>
                    Sorted by proximity with verified capabilities & estimated costs
                  </p>
                </div>
                <button
                  onClick={() => onNavigateTab('hospitals')}
                  className="btn btn-secondary btn-sm"
                >
                  <span>Explore Map View</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div className="grid-3">
                {facilities.slice(0, 3).map(fac => (
                  <HospitalCard
                    key={fac.id}
                    facility={fac}
                    activeTreatmentId={searchState.treatmentId}
                    onViewDetails={f => setSelectedFacilityForModal(f)}
                  />
                ))}
              </div>
            </div>

            {/* Section 3: Financial Support & Schemes Preview */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.35rem', color: 'var(--color-navy)' }}>
                    Applicable Government Schemes & Insurance
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-grey)' }}>
                    Potential coverage under PM-JAY, Aarogyasri, and CGHS
                  </p>
                </div>
                <button
                  onClick={() => onNavigateTab('schemes')}
                  className="btn btn-secondary btn-sm"
                >
                  <span>Eligibility Assessment</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div className="grid-3">
                {schemes.slice(0, 3).map((match, idx) => (
                  <SchemeCard key={idx} match={match} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        {costResult && (
          <CostBreakdownModal
            isOpen={isBreakdownOpen}
            onClose={() => setIsBreakdownOpen(false)}
            breakdown={costResult.cost_breakdown}
            treatmentName={costResult.canonical_treatment?.name || costResult.query_treatment}
            minPrice={costResult.overall_min}
            maxPrice={costResult.overall_max}
            priceType={costResult.price_type}
            facilityName={costResult.selected_facility?.name}
          />
        )}

        {selectedFacilityForModal && (
          <HospitalDetailModal
            facility={selectedFacilityForModal}
            onClose={() => setSelectedFacilityForModal(null)}
            onEstimateHere={fac => {
              setInputQuery(`${searchState.treatmentName} at ${fac.name}`);
              executeSearch(`${searchState.treatmentName} at ${fac.name}`);
            }}
          />
        )}
        {/* Emergency Interrupt Modal */}
        <EmergencyInterruptModal
          isOpen={isEmergencyModalOpen}
          message={emergencyGuidance}
          onDismiss={() => setIsEmergencyModalOpen(false)}
          onProceedAnyway={() => setIsEmergencyModalOpen(false)}
        />

        {/* Printable One-Page Patient Summary Modal */}
        {costResult && (
          <PrintSummaryModal
            isOpen={isPrintOpen}
            onClose={() => setIsPrintOpen(false)}
            costEstimate={costResult}
            facilityName={costResult.selected_facility?.name}
            city={selectedCity}
          />
        )}

        {/* Privacy-Preserving WhatsApp Share Modal */}
        {costResult && (
          <ShareModal
            isOpen={isShareOpen}
            onClose={() => setIsShareOpen(false)}
            treatmentName={costResult.canonical_treatment?.name || costResult.query_treatment}
            minPrice={costResult.overall_min}
            maxPrice={costResult.overall_max}
            facilityName={costResult.selected_facility?.name}
            city={selectedCity}
            priceType={costResult.price_type}
          />
        )}
      </div>
    </div>
  );
};
