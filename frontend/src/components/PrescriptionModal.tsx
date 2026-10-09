import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, ArrowRight, RefreshCw, FileQuestion } from 'lucide-react';
import { api, PrescriptionOCRDTO } from '../services/api';

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmTreatment: (treatmentName: string) => void;
}

export const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  isOpen,
  onClose,
  onConfirmTreatment
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewName, setPreviewName] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<PrescriptionOCRDTO | null>(null);
  const [manualConfirmedName, setManualConfirmedName] = useState<string>("");

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    setSelectedFile(file);
    setPreviewName(file.name);
    setIsProcessing(true);
    setOcrResult(null);

    try {
      const res = await api.ocrPrescription(file);
      setOcrResult(res);
      if (res.suggested_search_query) {
        setManualConfirmedName(res.suggested_search_query);
      }
    } catch (err) {
      console.error("OCR error", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSampleSelect = async (sampleFilename: string) => {
    setPreviewName(sampleFilename);
    setSelectedFile(null);
    setIsProcessing(true);
    setOcrResult(null);

    try {
      // Pass simulated filename to OCR endpoint
      const res = await api.ocrPrescription(undefined, undefined);
      // Call with sample query simulation
      const resSpecific = await fetch('/api/ocr/prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ filename: sampleFilename })
      }).then(r => r.json());
      setOcrResult(resSpecific);
      if (resSpecific.suggested_search_query) {
        setManualConfirmedName(resSpecific.suggested_search_query);
      } else {
        setManualConfirmedName("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px', padding: '28px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
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
              <h3 style={{ fontSize: '1.25rem', color: 'var(--color-navy)' }}>Upload Doctor's Prescription</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-grey)' }}>
                Optical Character Recognition (OCR) with transparent verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-grey)' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Drop Zone */}
        <div
          style={{
            border: '2px dashed var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '30px 20px',
            textAlign: 'center',
            backgroundColor: 'var(--color-warm-bg)',
            marginBottom: '20px',
            cursor: 'pointer'
          }}
          onClick={() => document.getElementById('rx-file-input')?.click()}
        >
          <input
            id="rx-file-input"
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
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-white)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-teal)',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '10px'
          }}>
            <Upload size={22} />
          </div>
          <div style={{ fontWeight: 600, color: 'var(--color-navy)', fontSize: '0.95rem' }}>
            {previewName ? `Uploaded: ${previewName}` : "Click to upload prescription or drag and drop"}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-grey)', marginTop: '4px' }}>
            Supports JPG, PNG, PDF (Up to 10MB)
          </div>
        </div>

        {/* Sample Prescription Presets for Testing */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-grey)', marginBottom: '8px' }}>
            Or test with verified clinical sample presets:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            <button
              onClick={() => handleSampleSelect("prescription_knee_tkr.jpg")}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start', fontSize: '0.82rem' }}
            >
              📄 Knee TKR Surgery Rx
            </button>
            <button
              onClick={() => handleSampleSelect("cataract_eye_rx.jpg")}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start', fontSize: '0.82rem' }}
            >
              📄 Cataract Phaco Rx
            </button>
            <button
              onClick={() => handleSampleSelect("mri_brain_neuro.jpg")}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start', fontSize: '0.82rem' }}
            >
              📄 MRI Brain Referral Rx
            </button>
            <button
              onClick={() => handleSampleSelect("unclear_handwriting_sample.jpg")}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start', fontSize: '0.82rem', borderColor: '#fca5a5', color: '#991b1b' }}
            >
              ⚠️ Unclear Handwriting Test
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isProcessing && (
          <div style={{
            padding: '24px',
            textAlign: 'center',
            backgroundColor: 'var(--color-mint-subtle)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px'
          }}>
            <RefreshCw size={24} color="var(--color-teal)" style={{ animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            <div style={{ marginTop: '10px', fontWeight: 600, color: 'var(--color-navy)' }}>
              Extracting prescription text & cross-referencing treatment master...
            </div>
          </div>
        )}

        {/* OCR Result View */}
        {ocrResult && !isProcessing && (
          <div style={{
            backgroundColor: ocrResult.confidence_score > 0.5 ? 'var(--color-mint-subtle)' : '#FEF2F2',
            border: `1px solid ${ocrResult.confidence_score > 0.5 ? '#b8ded4' : '#fecaca'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
            marginBottom: '20px'
          }}>
            {/* Status Notice */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '12px' }}>
              {ocrResult.confidence_score > 0.5 ? (
                <CheckCircle2 size={18} color="var(--color-teal)" style={{ flexShrink: 0, marginTop: '2px' }} />
              ) : (
                <AlertCircle size={18} color="var(--color-coral)" style={{ flexShrink: 0, marginTop: '2px' }} />
              )}
              <div>
                <div style={{
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  color: ocrResult.confidence_score > 0.5 ? 'var(--color-teal-dark)' : 'var(--color-coral)'
                }}>
                  {ocrResult.notice}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-grey)', marginTop: '2px' }}>
                  OCR Confidence: {Math.round(ocrResult.confidence_score * 100)}% (Requires mandatory patient verification)
                </div>
              </div>
            </div>

            {/* Extracted Text Box */}
            <div style={{
              backgroundColor: 'var(--color-white)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 12px',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              color: 'var(--color-navy)',
              maxHeight: '120px',
              overflowY: 'auto',
              border: '1px solid var(--color-border)',
              marginBottom: '12px',
              whiteSpace: 'pre-line'
            }}>
              {ocrResult.extracted_raw_text}
            </div>

            {/* Identified entities */}
            {ocrResult.detected_treatments.length > 0 && (
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '4px' }}>
                  Detected Treatment:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {ocrResult.detected_treatments.map(t => (
                    <span key={t} className="badge badge-teal" style={{ fontSize: '0.82rem', padding: '4px 10px' }}>
                      🩺 {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* User Confirmation Input */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>
                Confirm or Edit Procedure Name Before Search:
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Confirm treatment name (e.g. Total Knee Replacement)..."
                value={manualConfirmedName}
                onChange={e => setManualConfirmedName(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button
            onClick={() => {
              if (manualConfirmedName.trim()) {
                onConfirmTreatment(manualConfirmedName.trim());
                onClose();
              }
            }}
            disabled={!manualConfirmedName.trim()}
            className="btn btn-primary"
            style={{ opacity: manualConfirmedName.trim() ? 1 : 0.6 }}
          >
            <span>Confirm & Search Care</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
