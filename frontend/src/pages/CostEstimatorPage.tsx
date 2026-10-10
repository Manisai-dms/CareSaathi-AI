import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSearch } from '../context/SearchContext';
import { 
  DollarSign, 
  Building2, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  HelpCircle, 
  Layers, 
  RefreshCw, 
  ArrowRight,
  ShieldAlert,
  Sliders,
  Bed,
  Printer,
  Share2,
  MessageSquare
} from 'lucide-react';
import { api, CostEstimateDTO, TreatmentDTO, FacilityDTO } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import './CostEstimatorPage.css';
import { AnimatedRupeeCounter } from '../components/AnimatedRupeeCounter';
import { FloatingRupeeBackground } from '../components/FloatingRupeeBackground';
import { CostBreakdownModal } from '../components/CostBreakdownModal';
import { OutOfPocketWaterfallChart } from '../components/OutOfPocketWaterfallChart';
import { ItemizedComponentsTable } from '../components/ItemizedComponentsTable';
import { ChecklistsCard } from '../components/ChecklistsCard';
import { TierComparisonView } from '../components/TierComparisonView';
import { PrintSummaryModal } from '../components/PrintSummaryModal';
import { CostBreakdownDonut } from '../components/CostBreakdownDonut';
import { ShareModal } from '../components/ShareModal';
import { PanIndiaLocationPicker } from '../components/PanIndiaLocationPicker';
import { HealthcareCostRiskAlert } from '../components/HealthcareCostRiskAlert';
import { MedicineCostEstimator } from '../components/MedicineCostEstimator';
import { CombinedExpenseSummary } from '../components/CombinedExpenseSummary';
import { PatientSavingsPlan } from '../components/PatientSavingsPlan';
import { MedicineCourseEstimateDTO } from '../services/api';

export const CostEstimatorPage: React.FC = () => {
  const { t } = useLanguage();
  const { searchState, setTreatment, setLocation } = useSearch();

  // Mode: 'location' or 'hospital'
  const [workflowMode, setWorkflowMode] = useState<'location' | 'hospital'>('location');
  const [treatmentsList, setTreatmentsList] = useState<TreatmentDTO[]>([]);
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string>(searchState.treatmentId || 'knee_replacement');
  const [city, setCity] = useState<string>(searchState.city || 'Hyderabad');
  const [stateName, setStateName] = useState<string>(searchState.state || 'Telangana');
  const [locality, setLocality] = useState<string>(searchState.locality || '');

  useEffect(() => {
    if (searchState.city) setCity(searchState.city);
    if (searchState.state) setStateName(searchState.state);
    if (searchState.locality) setLocality(searchState.locality);
  }, [searchState.city, searchState.state, searchState.locality]);
  const [hospitalName, setHospitalName] = useState<string>(searchState.hospitalName || 'NIMS');
  const [ownershipPref, setOwnershipPref] = useState<string>('All');
  const [roomCategory, setRoomCategory] = useState<string>('Twin Sharing / Semi-Private');
  const [budgetLimit, setBudgetLimit] = useState<number>(0);

  // Medicine Cost Estimator State
  const [medicineCostMin, setMedicineCostMin] = useState<number>(0);
  const [medicineCostMax, setMedicineCostMax] = useState<number>(0);
  const [medicineData, setMedicineData] = useState<MedicineCourseEstimateDTO | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [estimateResult, setEstimateResult] = useState<CostEstimateDTO | null>(null);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState<boolean>(false);
  const [isPrintOpen, setIsPrintOpen] = useState<boolean>(false);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);

  useEffect(() => {
    // Load catalogue
    api.getTreatments().then(data => {
      setTreatmentsList(data);
    }).catch(console.error);

    // Initial estimate
    runEstimate();
  }, [workflowMode]);

  const runEstimate = async () => {
    setIsLoading(true);
    try {
      const selectedT = treatmentsList.find(t => t.id === selectedTreatmentId);
      const treatmentName = selectedT ? selectedT.name : "Total Knee Replacement (TKR)";

      const res = await api.estimateCost({
        treatment: treatmentName,
        city: city,
        locality: locality || undefined,
        hospital_name: workflowMode === 'hospital' ? hospitalName : undefined,
        ownership_preference: ownershipPref !== 'All' ? ownershipPref : undefined,
        room_category_preference: roomCategory,
        budget_limit: budgetLimit > 0 ? budgetLimit : undefined
      });

      setEstimateResult(res);
      setTreatment(selectedTreatmentId, treatmentName);
    } catch (err) {
      console.error("Cost estimate failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTreatmentChange = (tId: string) => {
    setSelectedTreatmentId(tId);
  };

  return (
    <div className="section" style={{ paddingTop: '30px' }}>
      <div className="container">
        {/* Page Title with Floating Rupee Particles */}
        <motion.div 
          className="cost-estimator-hero-banner"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <FloatingRupeeBackground count={6} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="badge badge-teal" style={{ marginBottom: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#D6A64F', fontWeight: 800 }}>₹</span>
              <span>Evidence-Based Healthcare Pricing Engine</span>
            </div>
            <h1 style={{ fontSize: '2.2rem', color: 'var(--color-navy)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
              Healthcare Cost Estimator
            </h1>
            <p style={{ color: 'var(--color-text-grey)', fontSize: '1.02rem', maxWidth: '780px', margin: 0, lineHeight: 1.5 }}>
              Transparent indicative price ranges calculated from published hospital tariffs, CGHS gazettes, and private reference schedules in Indian cities.
            </p>
          </div>
        </motion.div>

        {/* Workflow Switcher Tabs with Micro-Animations */}
        <div style={{
          display: 'flex',
          gap: '8px',
          backgroundColor: 'var(--color-white)',
          padding: '6px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          width: 'fit-content',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(23, 107, 91, 0.04)'
        }}>
          <motion.button
            onClick={() => setWorkflowMode('location')}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            className={`cost-estimator-workflow-tab ${workflowMode === 'location' ? 'active' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: workflowMode === 'location' ? 'var(--color-teal)' : 'transparent',
              color: workflowMode === 'location' ? 'white' : 'var(--color-navy)',
              fontWeight: 600,
              fontSize: '0.92rem',
              cursor: 'pointer'
            }}
          >
            <MapPin size={16} />
            <span>Workflow B: Location-Based Estimation</span>
          </motion.button>
          <motion.button
            onClick={() => setWorkflowMode('hospital')}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            className={`cost-estimator-workflow-tab ${workflowMode === 'hospital' ? 'active' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: workflowMode === 'hospital' ? 'var(--color-teal)' : 'transparent',
              color: workflowMode === 'hospital' ? 'white' : 'var(--color-navy)',
              fontWeight: 600,
              fontSize: '0.92rem',
              cursor: 'pointer'
            }}
          >
            <Building2 size={16} />
            <span>Workflow A: Hospital-Specific Tariff</span>
          </motion.button>
        </div>

        {/* Main Content Grid: Form (Left) & Estimate Result (Right) */}
        <div className="grid-2" style={{ alignItems: 'flex-start', gap: '30px' }}>
          {/* Controls Form Card */}
          <div className="card cost-estimator-card-elevation">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--color-navy)' }}>
              {workflowMode === 'location' ? "Select Procedure & Location Parameters" : "Select Procedure & Hospital Name"}
            </h3>

            {/* Treatment Selector */}
            <div className="form-group">
              <label className="form-label">Treatment or Diagnostic Procedure:</label>
              <select
                className="form-select cost-estimator-select"
                value={selectedTreatmentId}
                onChange={e => handleTreatmentChange(e.target.value)}
              >
                {treatmentsList.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Workflow A: Hospital Name Input */}
            {workflowMode === 'hospital' && (
              <div className="form-group">
                <label className="form-label">Hospital Name:</label>
                <input
                  type="text"
                  className="form-input cost-estimator-input"
                  placeholder="e.g. NIMS, Apollo Health City, Gandhi Hospital, Yashoda..."
                  value={hospitalName}
                  onChange={e => setHospitalName(e.target.value)}
                />
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-grey)' }}>Quick select:</span>
                  {['NIMS', 'Apollo Health City', 'Gandhi Hospital', 'Yashoda Hospitals', 'LVPEI'].map(h => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHospitalName(h)}
                      className="cost-estimator-quick-chip"
                      style={{
                        background: 'var(--color-light-blue)',
                        border: '1px solid transparent',
                        borderRadius: 'var(--radius-sm)',
                        padding: '2px 8px',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Location Selection (Pan-India) */}
            <div style={{ marginBottom: '16px' }}>
              <label className="form-label">Location (Pan-India):</label>
              <PanIndiaLocationPicker
                compact={true}
                showPresets={true}
                onLocationSelect={(loc) => {
                  setCity(loc.city);
                  setStateName(loc.state);
                  setLocality(loc.district && loc.district !== loc.city ? loc.district : '');
                  setTimeout(runEstimate, 100);
                }}
              />
            </div>

            {/* Ownership Preference (Location Workflow) */}
            {workflowMode === 'location' && (
              <div className="form-group">
                <label className="form-label">Healthcare Facility Ownership:</label>
                <select className="form-select cost-estimator-select" value={ownershipPref} onChange={e => setOwnershipPref(e.target.value)}>
                  <option value="All">All Categories (Govt, Charitable & Private)</option>
                  <option value="Government">Government Hospitals (Free / Subsidized)</option>
                  <option value="Charitable/Trust">Charitable / Trust Hospitals (Non-profit)</option>
                  <option value="Private">Private Multi-Specialty</option>
                </select>
              </div>
            )}

            {/* Ward / Room Category Preference */}
            <div className="form-group">
              <label className="form-label">Room / Ward Category:</label>
              <select className="form-select cost-estimator-select" value={roomCategory} onChange={e => setRoomCategory(e.target.value)}>
                <option value="General Ward">General Ward (Standard Economy)</option>
                <option value="Twin Sharing / Semi-Private">Twin Sharing / Semi-Private (2 Beds)</option>
                <option value="Single Deluxe Room">Single Deluxe Private Room</option>
              </select>
            </div>

            {/* Submit Button with Animated Micro-interactions */}
            <motion.button
              onClick={runEstimate}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              className="btn btn-primary cost-estimator-calc-btn"
              style={{ width: '100%', marginTop: '8px' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Computing Transparent Estimate...</span>
                </>
              ) : (
                <>
                  <DollarSign size={18} />
                  <span>Calculate Indicative Estimate</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Result Card (Right) */}
          {estimateResult && (
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              {/* 1. Healthcare Cost Risk Alert Component */}
              <HealthcareCostRiskAlert
                minTreatmentCost={estimateResult.overall_min}
                maxTreatmentCost={estimateResult.overall_max}
                estimatedMedicineCost={medicineCostMin || (estimateResult.cost_breakdown?.medicines_and_consumables)}
                estimatedDiagnosticCost={estimateResult.cost_breakdown?.diagnostics_and_lab}
                potentialAdditionalExpenses={5000}
                userBudget={budgetLimit}
                confidence={estimateResult.confidence}
                priceType={estimateResult.price_type}
                treatmentName={estimateResult.canonical_treatment?.name || estimateResult.query_treatment}
                onBudgetChange={(b) => setBudgetLimit(b)}
              />

              <div className="card cost-estimator-card-elevation" style={{
                background: 'var(--color-white)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-md)'
              }}>
                {/* Result Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span className="badge badge-teal">{estimateResult.workflow}</span>
                      <span className="badge badge-navy">{estimateResult.confidence} Confidence</span>
                    </div>
                    <h3 style={{ fontSize: '1.4rem', color: 'var(--color-navy)' }}>
                      {estimateResult.canonical_treatment?.name || estimateResult.query_treatment}
                    </h3>
                    {estimateResult.selected_facility && (
                      <p style={{ fontSize: '0.88rem', color: 'var(--color-teal-dark)', fontWeight: 600 }}>
                        Facility: {estimateResult.selected_facility.name} ({estimateResult.selected_facility.ownership})
                      </p>
                    )}
                  </div>
                </div>

                {/* Main Estimated Range Box with Floating Rupee Accent and Animated Counter */}
                <div className="cost-estimator-range-box" style={{ marginBottom: '18px' }}>
                  <FloatingRupeeBackground count={4} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-grey)', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>Estimated Indicative Cost (INR)</span>
                      <span style={{ color: '#D6A64F', fontSize: '0.9rem' }}>✦</span>
                    </div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-navy)', marginTop: '4px' }}>
                      <AnimatedRupeeCounter 
                        value={estimateResult.overall_min} 
                        freeSubsidizedText="₹0 (Free / Subsidized)"
                      />
                      {" "}—{" "}
                      <AnimatedRupeeCounter 
                        value={estimateResult.overall_max} 
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--color-teal-dark)', fontWeight: 600, marginTop: '6px' }}>
                      <CheckCircle2 size={16} />
                      <span>Price Type: {estimateResult.price_type}</span>
                    </div>
                  </div>
                </div>

                {/* Evidence & Confidence Reason */}
                <div style={{
                  backgroundColor: 'var(--color-light-blue)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  border: '1px solid #d2e4f3',
                  marginBottom: '18px',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-navy)', marginBottom: '4px' }}>
                    Methodology & Evidence Source:
                  </div>
                  <p style={{ color: 'var(--color-navy)', margin: 0 }}>
                    {estimateResult.confidence_explanation}
                  </p>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-grey)', marginTop: '6px' }}>
                    Data audit freshness: {estimateResult.data_freshness_date}
                  </div>
                </div>

                {/* Assumptions and Exclusions Checklist */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '8px' }}>
                    Standard Inclusions & Key Assumptions:
                  </div>
                  <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {estimateResult.assumptions_and_exclusions.slice(0, 4).map((item, idx) => (
                      <li key={idx} style={{ fontSize: '0.82rem', color: 'var(--color-navy)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <span style={{ color: 'var(--color-teal)', fontWeight: 'bold' }}>✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions: Breakdown, Share & Print Summary */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setIsBreakdownOpen(true)}
                      className="btn btn-secondary btn-sm"
                    >
                      <DollarSign size={15} color="var(--color-teal)" />
                      <span>Inspect Components</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setIsShareOpen(true)}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#075E54', borderColor: '#86EFAC' }}
                    >
                      <MessageSquare size={15} color="#25D366" />
                      <span>Share via WhatsApp</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setIsPrintOpen(true)}
                      className="btn btn-primary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Printer size={15} />
                      <span>Print / Save PDF</span>
                    </motion.button>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-grey)' }}>
                    Currency: INR (₹)
                  </div>
                </div>
              </div>

              {/* Mandatory Honest Disclaimer Callout */}
              <div style={{
                backgroundColor: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: 'var(--radius-md)',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <Info size={20} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.82rem', color: '#92400E', lineHeight: 1.5 }}>
                  <strong>Illustrative demo estimate — not a verified hospital quotation.</strong>
                  <br />
                  Individual medical bills depend on surgeon discretion, exact implant model selected, days in ICU/ventilator care, and patient clinical stability. Always obtain a binding formal estimate at the hospital billing desk before admission.
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* PHASE 2 & 3: Deep Dive Analysis Sections */}
        {estimateResult && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
            style={{ marginTop: '36px', display: 'flex', flexDirection: 'column', gap: '24px' }}
          >
            {/* 1. Interactive Cost Breakdown Donut Chart */}
            {estimateResult.cost_breakdown && (
              <CostBreakdownDonut
                breakdown={estimateResult.cost_breakdown}
                minPrice={estimateResult.overall_min}
                maxPrice={estimateResult.overall_max}
                treatmentName={estimateResult.canonical_treatment?.name || estimateResult.query_treatment}
              />
            )}

            {/* 2. Out-of-Pocket Waterfall Bridge */}
            {estimateResult.waterfall && (
              <OutOfPocketWaterfallChart
                waterfall={estimateResult.waterfall}
                treatmentName={estimateResult.canonical_treatment?.name || estimateResult.query_treatment}
              />
            )}

            {/* 3. Statutory Itemized Reference Table */}
            {estimateResult.detailed_components && estimateResult.detailed_components.length > 0 && (
              <ItemizedComponentsTable
                components={estimateResult.detailed_components}
                treatmentName={estimateResult.canonical_treatment?.name || estimateResult.query_treatment}
              />
            )}

            {/* 4. Government vs Trust vs Private Tier Comparison */}
            {estimateResult.tier_comparisons && estimateResult.tier_comparisons.length > 0 && (
              <TierComparisonView
                tierComparisons={estimateResult.tier_comparisons}
                treatmentName={estimateResult.canonical_treatment?.name || estimateResult.query_treatment}
              />
            )}

            {/* 5. Medicine Cost Estimator (NPPA Pharma Sahi Daam & Jan Aushadhi) */}
            <MedicineCostEstimator
              onTotalMedicineCostChange={(min, max, data) => {
                setMedicineCostMin(min);
                setMedicineCostMax(max);
                setMedicineData(data);
              }}
            />

            {/* 6. Combined Expense Summary (Grand Total Overview) */}
            <CombinedExpenseSummary
              treatmentName={estimateResult.canonical_treatment?.name || estimateResult.query_treatment}
              hospitalCostMin={estimateResult.overall_min}
              hospitalCostMax={estimateResult.overall_max}
              diagnosticCost={estimateResult.cost_breakdown?.diagnostics_and_lab}
              medicineCostMin={medicineCostMin}
              medicineCostMax={medicineCostMax}
              costBreakdown={estimateResult.cost_breakdown}
              confidence={estimateResult.confidence}
              matchedSchemeName="PM-JAY (Ayushman Bharat) / Aarogyasri Trust"
            />

            {/* 7. Billing & Admission Checklists */}
            {estimateResult.checklists && (
              <ChecklistsCard
                checklists={estimateResult.checklists}
                treatmentName={estimateResult.canonical_treatment?.name || estimateResult.query_treatment}
              />
            )}

            {/* 8. Patient Savings Plan (Printable Budget & Checklist) */}
            <PatientSavingsPlan
              treatmentName={estimateResult.canonical_treatment?.name || estimateResult.query_treatment}
              treatmentBudgetMin={estimateResult.overall_min}
              treatmentBudgetMax={estimateResult.overall_max}
              medicineBudgetMin={medicineCostMin}
              medicineBudgetMax={medicineCostMax}
              userBudget={budgetLimit}
              city={city}
            />
          </div>
        )}

        {/* Modal for Breakdown */}
        {estimateResult && (
          <CostBreakdownModal
            isOpen={isBreakdownOpen}
            onClose={() => setIsBreakdownOpen(false)}
            breakdown={estimateResult.cost_breakdown}
            treatmentName={estimateResult.canonical_treatment?.name || estimateResult.query_treatment}
            minPrice={estimateResult.overall_min}
            maxPrice={estimateResult.overall_max}
            priceType={estimateResult.price_type}
            facilityName={estimateResult.selected_facility?.name}
          />
        )}

        {/* Modal for Printable One-Page Summary */}
        {estimateResult && (
          <PrintSummaryModal
            isOpen={isPrintOpen}
            onClose={() => setIsPrintOpen(false)}
            costEstimate={estimateResult}
            facilityName={estimateResult.selected_facility?.name}
            city={city}
            state={stateName}
          />
        )}

        {/* Modal for WhatsApp Sharing */}
        {estimateResult && (
          <ShareModal
            isOpen={isShareOpen}
            onClose={() => setIsShareOpen(false)}
            treatmentName={estimateResult.canonical_treatment?.name || estimateResult.query_treatment}
            minPrice={estimateResult.overall_min}
            maxPrice={estimateResult.overall_max}
            facilityName={estimateResult.selected_facility?.name}
            city={city}
            state={stateName}
            priceType={estimateResult.price_type}
          />
        )}
      </div>
    </div>
  );
};
