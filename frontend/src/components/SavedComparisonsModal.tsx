import React from 'react';
import { X, Layers, Trash2, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';

interface SavedComparisonsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenComparisonPage: () => void;
}

export const SavedComparisonsModal: React.FC<SavedComparisonsModalProps> = ({
  isOpen,
  onClose,
  onOpenComparisonPage
}) => {
  const { savedComparisons, removeSavedComparison } = useAuth();
  const { addToComparison, clearComparison } = useSearch();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '580px',
          padding: '28px',
          borderRadius: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div className="badge badge-teal" style={{ marginBottom: '6px' }}>
              Consented User Records
            </div>
            <h3 style={{ fontSize: '1.35rem', color: '#183247', margin: 0 }}>
              Your Saved Facility Comparisons
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64717D', margin: '4px 0 0' }}>
              Comparisons explicitly saved by you. No sensitive diagnostic or income data is stored.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#94A3B8'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {savedComparisons.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '36px 20px',
            backgroundColor: '#F8FAFC',
            borderRadius: '10px',
            border: '1px dashed #CBD5E1'
          }}>
            <Layers size={32} color="#94A3B8" style={{ marginBottom: '10px' }} />
            <h4 style={{ margin: '0 0 6px', color: '#183247' }}>No saved comparisons yet</h4>
            <p style={{ fontSize: '0.84rem', color: '#64717D', margin: 0 }}>
              Select 2 or more hospitals in search results and click "Save Comparison" to bookmark them here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '380px', overflowY: 'auto' }}>
            {savedComparisons.map(item => (
              <div
                key={item.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#183247' }}>
                    {item.treatment_name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64717D', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={13} />
                    <span>Saved on {new Date(item.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    <span>• {item.facility_ids.length} Facilities</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => {
                      onOpenComparisonPage();
                      onClose();
                    }}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                  >
                    <span>View</span>
                    <ArrowRight size={13} />
                  </button>

                  <button
                    onClick={() => removeSavedComparison(item.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#EF4444',
                      cursor: 'pointer',
                      padding: '6px'
                    }}
                    title="Remove from saved"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '20px', borderTop: '1px solid #E2E8F0', paddingTop: '12px', fontSize: '0.72rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={14} color="#438F84" />
          <span>CareSaathi stores only consented hospital identifiers and timestamp.</span>
        </div>
      </div>
    </div>
  );
};
