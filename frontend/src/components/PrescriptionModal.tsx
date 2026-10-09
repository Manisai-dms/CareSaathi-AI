import React, { useState, useEffect } from 'react';
import {
  Upload, FileText, CheckCircle2, AlertCircle, X, ArrowRight,
  RefreshCw, FileQuestion, AlertTriangle, Pill, Check, Edit3, Image
} from 'lucide-react';
import { api, PrescriptionOCRDTO, DetectedMedicineDetailDTO } from '../services/api';

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmTreatment: (treatmentName: string) => void;
  onOpenChatWithRx?: (rxFilename?: string, rxText?: string) => void;
}

export const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  isOpen,
  onClose,
  onConfirmTreatment,
  onOpenChatWithRx
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<PrescriptionOCRDTO | null>(null);
  const [confirmedProcedure, setConfirmedProcedure] = useState<string>("");
  const [editedMedicines, setEditedMedicines] = useState<DetectedMedicineDetailDTO[]>([]);
  const [activeTab, setActiveTab] = useState<'extracted' | 'medicines' | 'image'>('extracted');

  useEffect(() => {
    return () => {
      if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    setSelectedFile(file);
    setPreviewName(file.name);
    if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    const preview = URL.createObjectURL(file);
    setImagePreviewUrl(preview);
    setIsProcessing(true);
    setOcrResult(null);

    try {
      const res = await api.ocrPrescription(file);
      setOcrResult(res);
      setEditedMedicines(res.detected_medicines_detailed || []);
      if (res.suggested_search_query) {
        setConfirmedProcedure(res.suggested_search_query);
      } else if (res.detected_treatments && res.detected_treatments.length > 0) {
        setConfirmedProcedure(res.detected_treatments[0]);
      } else {
        setConfirmedProcedure("");
      }
    } catch (err) {
      console.error("Prescription OCR error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSampleSelect = async (sampleFilename: string, presetDisplayName: string) => {
    setPreviewName(presetDisplayName);
    setSelectedFile(null);
    setImagePreviewUrl(null);
    setIsProcessing(true);
    setOcrResult(null);

    try {
      const res = await api.ocrPrescription(undefined, undefined);
      // Call endpoint with sample preset filename
      const resSpecific: PrescriptionOCRDTO = await fetch('/api/ocr/prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ filename: sampleFilename })
      }).then(r => r.json());

      setOcrResult(resSpecific);
      setEditedMedicines(resSpecific.detected_medicines_detailed || []);
      if (resSpecific.suggested_search_query) {
        setConfirmedProcedure(resSpecific.suggested_search_query);
      } else if (resSpecific.detected_treatments && resSpecific.detected_treatments.length > 0) {
        setConfirmedProcedure(resSpecific.detected_treatments[0]);
      } else {
        setConfirmedProcedure("");
      }
    } catch (err) {
      console.error("Sample OCR error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMedicineChange = (idx: number, field: keyof DetectedMedicineDetailDTO, value: any) => {
    const updated = [...editedMedicines];
    updated[idx] = { ...updated[idx], [field]: value };
    setEditedMedicines(updated);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '780px', padding: '26px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-mint)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-teal)'
            }}>
              <FileText size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--color-navy)', margin: 0, fontWeight: 700 }}>
                Clinical Prescription OCR & Medical Extraction
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-grey)', margin: '2px 0 0' }}>
                Multi-line printed & clear handwritten verification in Telugu, Hindi & English
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-grey)', padding: '6px' }}
            aria-label="Close modal"
          >
            <X size={22} />
          </button>
        </div>

        {/* Upload Drop Zone */}
        <div
          style={{
            border: '2px dashed var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px 20px',
            textAlign: 'center',
            backgroundColor: 'var(--color-warm-bg)',
            marginBottom: '16px',
            cursor: 'pointer'
          }}
          onClick={() => document.getElementById('rx-upload-input')?.click()}
        >
          <input
            id="rx-upload-input"
            type="file"
            accept="image/*,.pdf"
            style={{ display: 'none' }}
            onChange={e => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-white)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-teal)',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '8px'
          }}>
            <Upload size={22} />
          </div>
          <div style={{ fontWeight: 700, color: 'var(--color-navy)', fontSize: '0.95rem' }}>
            {previewName ? `Loaded: ${previewName}` : "Click or drag doctor's prescription image here"}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-grey)', marginTop: '2px' }}>
            Supports JPG, PNG, Mobile Camera captures (Up to 10MB)
          </div>
        </div>

        {/* Prescription Test Presets */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '8px' }}>
            Or test with verified clinical test cases:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleSampleSelect("prescription_knee_tkr.jpg", "Printed Knee Surgery (TKR) Rx")}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', justifyContent: 'center' }}
            >
              📄 Knee TKR Surgery
            </button>
            <button
              type="button"
              onClick={() => handleSampleSelect("cataract_eye_rx.jpg", "Cataract Phaco Surgery Rx")}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', justifyContent: 'center' }}
            >
              📄 Cataract Eye Rx
            </button>
            <button
              type="button"
              onClick={() => handleSampleSelect("mri_brain_neuro.jpg", "Neurology MRI Referral Rx")}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', justifyContent: 'center' }}
            >
              📄 MRI Brain Referral
            </button>
            <button
              type="button"
              onClick={() => handleSampleSelect("unclear_handwriting_sample.jpg", "Cursive Doctor Handwriting Rx")}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', justifyContent: 'center', borderColor: '#fca5a5', color: '#991b1b', backgroundColor: '#fff5f5' }}
            >
              ⚠️ Unreadable Handwriting
            </button>
          </div>
        </div>

        {/* Processing Spinner */}
        {isProcessing && (
          <div style={{
            padding: '24px',
            textAlign: 'center',
            backgroundColor: 'var(--color-mint-subtle)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px'
          }}>
            <RefreshCw size={24} color="var(--color-teal)" style={{ animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            <div style={{ marginTop: '10px', fontWeight: 700, color: 'var(--color-navy)', fontSize: '0.92rem' }}>
              Optical document preprocessing, line segmenting & clinical entity extraction...
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-grey)', marginTop: '2px' }}>
              Comparing against NPPA drug prices & verified procedure catalogue
            </div>
          </div>
        )}

        {/* OCR Result Presentation */}
        {ocrResult && !isProcessing && (
          <div style={{
            backgroundColor: ocrResult.is_handwritten ? '#FFFBEB' : 'var(--color-mint-subtle)',
            border: `1px solid ${ocrResult.is_handwritten ? '#FCD34D' : '#b8ded4'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
            marginBottom: '16px'
          }}>
            {/* Status Notice */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '14px' }}>
              {ocrResult.is_handwritten ? (
                <AlertTriangle size={20} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
              ) : ocrResult.confidence_score > 0.6 ? (
                <CheckCircle2 size={20} color="var(--color-teal)" style={{ flexShrink: 0, marginTop: '2px' }} />
              ) : (
                <AlertCircle size={20} color="var(--color-coral)" style={{ flexShrink: 0, marginTop: '2px' }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  color: ocrResult.is_handwritten ? '#92400E' : 'var(--color-navy)'
                }}>
                  {ocrResult.notice}
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.76rem', color: 'var(--color-text-grey)', marginTop: '3px' }}>
                  <span>Language: <strong>{ocrResult.detected_language === 'te' ? 'Telugu (తెలుగు)' : ocrResult.detected_language === 'hi' ? 'Hindi (हिंदी)' : 'English'}</strong></span>
                  <span>Confidence: <strong>{Math.round(ocrResult.confidence_score * 100)}%</strong> (Honest evaluation)</span>
                  <span>Document Type: <strong>{ocrResult.is_handwritten ? 'Handwritten' : 'Printed Document'}</strong></span>
                </div>
              </div>
            </div>

            {/* Unreadable Handwriting Caution Banner */}
            {ocrResult.is_handwritten && ocrResult.uncertain_regions && ocrResult.uncertain_regions.length > 0 && (
              <div style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
                marginBottom: '12px',
                fontSize: '0.8rem',
                color: '#991B1B'
              }}>
                <div style={{ fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={15} />
                  <span>Unreadable Cursive Handwriting Detected:</span>
                </div>
                <div style={{ marginBottom: '6px' }}>
                  CareSaathi does NOT make dangerous drug substitutions. The following lines could not be reliably verified:
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px' }}>
                  {ocrResult.uncertain_regions.map((region, i) => (
                    <li key={i}>{region}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* View Tabs */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('extracted')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: activeTab === 'extracted' ? 'var(--color-teal)' : 'transparent',
                  color: activeTab === 'extracted' ? '#ffffff' : 'var(--color-navy)',
                  fontWeight: activeTab === 'extracted' ? 700 : 500,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                1. Visibly Extracted Lines ({ocrResult.visibly_extracted_lines?.length || 0})
              </button>
              {editedMedicines.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('medicines')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    backgroundColor: activeTab === 'medicines' ? 'var(--color-teal)' : 'transparent',
                    color: activeTab === 'medicines' ? '#ffffff' : 'var(--color-navy)',
                    fontWeight: activeTab === 'medicines' ? 700 : 500,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  2. Prescribed Medicines & Jan Aushadhi ({editedMedicines.length})
                </button>
              )}
              {imagePreviewUrl && (
                <button
                  type="button"
                  onClick={() => setActiveTab('image')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    backgroundColor: activeTab === 'image' ? 'var(--color-teal)' : 'transparent',
                    color: activeTab === 'image' ? '#ffffff' : 'var(--color-navy)',
                    fontWeight: activeTab === 'image' ? 700 : 500,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  3. Prescription Image Preview
                </button>
              )}
            </div>

            {/* Tab 1: Extracted Raw Lines */}
            {activeTab === 'extracted' && (
              <div style={{
                backgroundColor: 'var(--color-white)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                fontFamily: 'monospace',
                fontSize: '0.82rem',
                color: 'var(--color-navy)',
                maxHeight: '140px',
                overflowY: 'auto',
                border: '1px solid var(--color-border)',
                marginBottom: '14px',
                lineHeight: '1.5'
              }}>
                {ocrResult.visibly_extracted_lines && ocrResult.visibly_extracted_lines.length > 0 ? (
                  ocrResult.visibly_extracted_lines.map((l, i) => (
                    <div key={i} style={{ borderBottom: '1px dotted #e5e7eb', paddingBottom: '2px', marginBottom: '2px' }}>
                      <span style={{ color: 'var(--color-text-grey)', marginRight: '8px' }}>L{i + 1}:</span>
                      {l}
                    </div>
                  ))
                ) : (
                  <div>{ocrResult.extracted_raw_text}</div>
                )}
              </div>
            )}

            {/* Tab 2: Medicines Extracted & Editable */}
            {activeTab === 'medicines' && editedMedicines.length > 0 && (
              <div style={{ maxHeight: '160px', overflowY: 'auto', marginBottom: '14px' }}>
                {editedMedicines.map((med, idx) => (
                  <div key={idx} style={{
                    backgroundColor: 'var(--color-white)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 12px',
                    marginBottom: '6px',
                    fontSize: '0.82rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--color-navy)' }}>
                        <Pill size={14} color="var(--color-teal)" />
                        <span>{med.name} ({med.strength})</span>
                        <span className="badge badge-teal" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>{med.formulation}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-teal-dark)', fontWeight: 600 }}>
                        {med.generic_name} • Jan Aushadhi: ₹{med.cost_jan_aushadhi}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '0.74rem', color: 'var(--color-text-grey)' }}>
                      <span>Dose: <strong>{med.frequency}</strong></span>
                      <span>Duration: <strong>{med.duration}</strong></span>
                      <span>Qty: <strong>{med.quantity}</strong></span>
                      <span>Source: <strong>{med.source}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: Image Preview */}
            {activeTab === 'image' && imagePreviewUrl && (
              <div style={{ textAlign: 'center', marginBottom: '14px', maxHeight: '180px', overflow: 'hidden', borderRadius: 'var(--radius-md)' }}>
                <img
                  src={imagePreviewUrl}
                  alt="Uploaded prescription preview"
                  style={{ maxWidth: '100%', maxHeight: '180px', objectFit: 'contain', border: '1px solid var(--color-border)' }}
                />
              </div>
            )}

            {/* Detected Procedures */}
            {ocrResult.detected_treatments.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '4px' }}>
                  Identified Procedure / Care Requirement:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {ocrResult.detected_treatments.map(t => (
                    <span key={t} className="badge badge-teal" style={{ fontSize: '0.82rem', padding: '4px 10px' }}>
                      🩺 {t}
                    </span>
                  ))}
                  {ocrResult.detected_diagnostics.map(d => (
                    <span key={d} className="badge" style={{ fontSize: '0.82rem', padding: '4px 10px', backgroundColor: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }}>
                      🔬 {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Mandatory User Confirmation Before Proceeding */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--color-navy)' }}>
                Confirm or Edit Procedure Name Before Hospital & Cost Search:
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter or confirm clinical procedure (e.g., Total Knee Replacement, Cataract Surgery)..."
                value={confirmedProcedure}
                onChange={e => setConfirmedProcedure(e.target.value)}
                style={{ fontSize: '0.92rem' }}
              />
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-grey)', marginTop: '4px' }}>
                Safety rule: CareSaathi requires patient confirmation to prevent misdirected hospital searches.
              </div>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '12px',
          borderTop: '1px solid var(--color-border)'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-grey)' }}>
            Distinguishes visibly extracted text from AI interpretation.
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            {onOpenChatWithRx && ocrResult && (
              <button
                type="button"
                onClick={() => {
                  onOpenChatWithRx(previewName, ocrResult.extracted_raw_text);
                  onClose();
                }}
                className="btn btn-secondary"
                style={{ borderColor: 'var(--color-teal)', color: 'var(--color-teal-dark)', fontWeight: 600 }}
              >
                <span>💬 Ask Voice Assistant</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (confirmedProcedure.trim()) {
                  onConfirmTreatment(confirmedProcedure.trim());
                  onClose();
                }
              }}
              disabled={!confirmedProcedure.trim()}
              className="btn btn-primary"
              style={{ opacity: confirmedProcedure.trim() ? 1 : 0.6 }}
            >
              <span>Confirm & Search Care</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
