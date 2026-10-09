import React, { useState, useEffect, useRef } from 'react';
import { 
  Pill, 
  Search, 
  Upload, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  ExternalLink, 
  ShieldCheck, 
  RefreshCw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { 
  api, 
  MedicineDTO, 
  MedicineCourseEstimateDTO, 
  MedicineCourseItemDTO 
} from '../services/api';

interface MedicineCostEstimatorProps {
  onTotalMedicineCostChange?: (minCost: number, maxCost: number, data: MedicineCourseEstimateDTO) => void;
  isOpenDefault?: boolean;
}

interface SelectedMedicineInput {
  medicine_id?: string;
  name: string;
  generic_name?: string;
  strength?: string;
  formulation?: string;
  quantity: number;
}

export const MedicineCostEstimator: React.FC<MedicineCostEstimatorProps> = ({
  onTotalMedicineCostChange,
  isOpenDefault = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<MedicineDTO[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Selected list of medicines for the prescription course
  const [selectedItems, setSelectedItems] = useState<SelectedMedicineInput[]>([
    {
      medicine_id: 'med_pcm_650',
      name: 'Dolo 650',
      generic_name: 'Paracetamol',
      strength: '650 mg',
      formulation: 'Tablet',
      quantity: 15
    },
    {
      medicine_id: 'med_panto_40',
      name: 'Pan 40',
      generic_name: 'Pantoprazole',
      strength: '40 mg',
      formulation: 'Tablet',
      quantity: 15
    }
  ]);

  // Estimate response from backend
  const [estimateData, setEstimateData] = useState<MedicineCourseEstimateDTO | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);

  // Prescription OCR Upload states
  const [isUploadingOcr, setIsUploadingOcr] = useState(false);
  const [ocrSuccessMsg, setOcrSuccessMsg] = useState<string | null>(null);
  const [ocrErrorMsg, setOcrErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Search autocomplete debounced
  useEffect(() => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await api.searchMedicines(searchTerm.trim());
        setSearchResults(results);
        setShowDropdown(true);
      } catch (err) {
        console.error('Failed to search medicines', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Recalculate estimate whenever selectedItems change
  useEffect(() => {
    recalculateEstimate();
  }, [selectedItems]);

  const recalculateEstimate = async () => {
    if (selectedItems.length === 0) {
      setEstimateData(null);
      if (onTotalMedicineCostChange) {
        onTotalMedicineCostChange(0, 0, {
          items: [],
          total_estimated_branded_mrp: 0,
          total_estimated_nppa_ceiling: 0,
          total_estimated_jan_aushadhi: 0,
          potential_generic_savings: 0,
          potential_savings_percentage: 0,
          price_source_disclaimer: '',
          has_unverified_items: false
        });
      }
      return;
    }

    setIsEstimating(true);
    try {
      const payload = selectedItems.map(item => ({
        medicine_id: item.medicine_id,
        name: item.name,
        quantity: item.quantity,
        strength: item.strength,
        formulation: item.formulation
      }));

      const res = await api.estimateMedicineCourse(payload);
      setEstimateData(res);

      if (onTotalMedicineCostChange) {
        // min is Jan Aushadhi generic, max is branded MRP
        onTotalMedicineCostChange(res.total_estimated_jan_aushadhi, res.total_estimated_branded_mrp, res);
      }
    } catch (err) {
      console.error('Failed to calculate medicine course estimate', err);
    } finally {
      setIsEstimating(false);
    }
  };

  const handleSelectMedicine = (med: MedicineDTO) => {
    // Avoid duplicate additions
    const existing = selectedItems.find(i => i.medicine_id === med.id);
    if (existing) {
      setSelectedItems(prev => prev.map(i => i.medicine_id === med.id ? { ...i, quantity: i.quantity + (med.pack_size || 10) } : i));
    } else {
      setSelectedItems(prev => [
        ...prev,
        {
          medicine_id: med.id,
          name: med.brand_name,
          generic_name: med.generic_name,
          strength: med.strength,
          formulation: med.formulation,
          quantity: med.pack_size || 10
        }
      ]);
    }
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleAddCustomMedicine = () => {
    if (!searchTerm.trim()) return;
    setSelectedItems(prev => [
      ...prev,
      {
        name: searchTerm.trim(),
        generic_name: 'Unverified salt',
        strength: 'Standard dose',
        formulation: 'Tablet',
        quantity: 10
      }
    ]);
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index: number, newQty: number) => {
    const qty = Math.max(1, newQty);
    setSelectedItems(prev => prev.map((item, i) => i === index ? { ...item, quantity: qty } : item));
  };

  // Prescription OCR Handler
  const handleOcrFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingOcr(true);
    setOcrSuccessMsg(null);
    setOcrErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/ocr/prescription', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('OCR parsing failed');
      const data = await res.json();

      if (data.medicines && data.medicines.length > 0) {
        const extracted: SelectedMedicineInput[] = data.medicines.map((m: any) => ({
          name: m.name || 'Extracted Medicine',
          generic_name: m.generic_name || m.name,
          strength: m.dosage || 'Standard dose',
          formulation: 'Tablet',
          quantity: 10
        }));

        setSelectedItems(prev => [...prev, ...extracted]);
        setOcrSuccessMsg(`Extracted ${extracted.length} medicine(s) from prescription. Please review and verify quantities below.`);
      } else {
        setOcrErrorMsg('No identifiable medicine names detected. You can add them manually using the search box.');
      }
    } catch (err: any) {
      setOcrErrorMsg(err.message || 'Error uploading prescription document');
    } finally {
      setIsUploadingOcr(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div 
      className="card medicine-cost-estimator"
      id="medicine-cost-estimator-panel"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 2px 10px rgba(18, 48, 74, 0.05)',
        marginBottom: '24px'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-teal" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Pill size={13} />
              <span>NPPA Pharma Sahi Daam & Jan Aushadhi Reference</span>
            </span>
            <span className="badge badge-navy">Statutory Rate Master</span>
          </div>
          <h3 style={{ fontSize: '1.25rem', color: '#12304A', margin: 0, fontWeight: 700 }}>
            Medicine Cost Estimator & Generic Alternatives
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#64717D', margin: '4px 0 0' }}>
            Compare branded MRP against official ceiling caps and PMBJP Janaushadhi generic prices.
          </p>
        </div>

        {/* Prescription OCR Action */}
        <div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleOcrFileUpload} 
            accept="image/*,.pdf" 
            style={{ display: 'none' }} 
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingOcr}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
          >
            {isUploadingOcr ? (
              <>
                <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Reading Prescription OCR...</span>
              </>
            ) : (
              <>
                <Upload size={14} color="#2C8C83" />
                <span>Upload Prescription (OCR)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* OCR Status Alerts */}
      {ocrSuccessMsg && (
        <div style={{
          backgroundColor: '#ECFDF5',
          border: '1px solid #A7F3D0',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '0.8rem',
          color: '#065F46',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} color="#059669" />
          <span>{ocrSuccessMsg}</span>
        </div>
      )}

      {ocrErrorMsg && (
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '0.8rem',
          color: '#991B1B',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={16} color="#DC2626" />
          <span>{ocrErrorMsg}</span>
        </div>
      )}

      {/* Search Input with Autocomplete */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search 
              size={16} 
              color="#64717D" 
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} 
            />
            <input
              type="text"
              className="form-input"
              placeholder="Search prescribed medicine (e.g., Dolo, Pan 40, Augmentin, Telma, Metformin...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
              style={{ paddingLeft: '36px', fontSize: '0.88rem' }}
            />
          </div>

          <button
            type="button"
            onClick={handleAddCustomMedicine}
            disabled={!searchTerm.trim()}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0 14px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
          >
            <Plus size={14} />
            <span>Add Custom</span>
          </button>
        </div>

        {/* Autocomplete Dropdown */}
        {showDropdown && searchResults.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            zIndex: 100,
            maxHeight: '260px',
            overflowY: 'auto'
          }}>
            {searchResults.map(med => (
              <div
                key={med.id}
                onClick={() => handleSelectMedicine(med)}
                style={{
                  padding: '10px 14px',
                  borderBottom: '1px solid #F1F5F9',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#12304A' }}>
                    {med.brand_name} <span style={{ fontWeight: 400, color: '#64717D', fontSize: '0.8rem' }}>({med.strength})</span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#2C8C83' }}>
                    Generic Salt: {med.generic_name} • {med.formulation}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#12304A' }}>
                    ₹{med.mrp_branded.toFixed(2)} (Pack of {med.pack_size})
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
                    Jan Aushadhi: ₹{(med.jan_aushadhi_per_unit * med.pack_size).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Medicines Table / List */}
      <div style={{ marginBottom: '18px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAF9', borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#64717D' }}>
              <th style={{ padding: '8px 10px' }}>Prescribed Medicine</th>
              <th style={{ padding: '8px 10px' }}>Active Formulation</th>
              <th style={{ padding: '8px 10px', width: '90px' }}>Quantity</th>
              <th style={{ padding: '8px 10px', textAlign: 'right' }}>Branded MRP</th>
              <th style={{ padding: '8px 10px', textAlign: 'right' }}>Jan Aushadhi Generic</th>
              <th style={{ padding: '8px 10px', textAlign: 'center', width: '40px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {selectedItems.map((item, idx) => {
              const estItem = estimateData?.items[idx];
              const isVerified = estItem ? estItem.verified : true;

              return (
                <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '10px 10px', fontWeight: 600, color: '#12304A' }}>
                    {item.name}
                    {!isVerified && (
                      <span style={{ display: 'block', fontSize: '0.7rem', color: '#D97706', fontWeight: 500 }}>
                        Price not verified
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '10px 10px', color: '#475569' }}>
                    {item.generic_name || item.name} ({item.strength || 'Tablet'})
                  </td>
                  <td style={{ padding: '10px 10px' }}>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(idx, parseInt(e.target.value) || 1)}
                      style={{
                        width: '65px',
                        padding: '4px 6px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.82rem'
                      }}
                    />
                  </td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 600, color: '#12304A' }}>
                    {estItem?.cost_branded !== null && estItem?.cost_branded !== undefined ? (
                      `₹${estItem.cost_branded.toFixed(2)}`
                    ) : (
                      <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Unverified</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                    {estItem?.cost_jan_aushadhi !== null && estItem?.cost_jan_aushadhi !== undefined ? (
                      `₹${estItem.cost_jan_aushadhi.toFixed(2)}`
                    ) : (
                      <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Unverified</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 10px', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '2px' }}
                      title="Remove medicine"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Cost & Savings Card */}
      {estimateData && (
        <div style={{
          backgroundColor: '#F8FAF9',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '14px 16px',
          marginBottom: '16px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '12px',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64717D', textTransform: 'uppercase', fontWeight: 600 }}>
                Total Branded MRP
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#12304A' }}>
                ₹{estimateData.total_estimated_branded_mrp.toFixed(2)}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#059669', textTransform: 'uppercase', fontWeight: 600 }}>
                Jan Aushadhi Generic Course
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>
                ₹{estimateData.total_estimated_jan_aushadhi.toFixed(2)}
              </div>
            </div>

            <div style={{
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: '8px',
              padding: '8px 12px'
            }}>
              <div style={{ fontSize: '0.72rem', color: '#065F46', fontWeight: 700, textTransform: 'uppercase' }}>
                Potential Generic Savings
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#047857' }}>
                ₹{estimateData.potential_generic_savings.toFixed(2)} ({estimateData.potential_savings_percentage}%)
              </div>
            </div>
          </div>

          {/* Official Source Reference Link */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.74rem',
            color: '#64717D',
            marginTop: '12px',
            paddingTop: '8px',
            borderTop: '1px solid #E2E8F0',
            flexWrap: 'wrap',
            gap: '6px'
          }}>
            <span>
              Official Reference: <strong>NPPA Pharma Sahi Daam & PMBJP</strong> (Jan Aushadhi Rate Master)
            </span>
            <a 
              href="https://nppaipdms.gov.in/NPPA/PharmaSahiDaam/searchMedicine" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#2C8C83', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: 600 }}
            >
              Verify on NPPA Portal <ExternalLink size={12} />
            </a>
          </div>
        </div>
      )}

      {/* Safety & Clinician Advisory Notice */}
      <div style={{
        backgroundColor: '#FFFBEB',
        border: '1px solid #FDE68A',
        borderRadius: '10px',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px'
      }}>
        <Info size={17} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.78rem', color: '#92400E', lineHeight: 1.45 }}>
          <strong>Important Medical Notice:</strong> CareSaathi AI provides pricing transparency and statutory ceiling information only. We do not prescribe medicines, modify dosages, or recommend altering your doctor's prescribed therapy. <em>Always consult your prescribing physician or a licensed pharmacist before substituting any branded medication with a generic alternative.</em>
        </div>
      </div>
    </div>
  );
};
