import React from 'react';
import { AlertTriangle, PhoneCall, X } from 'lucide-react';

interface EmergencyBannerProps {
  message?: string;
  onDismiss?: () => void;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({ message, onDismiss }) => {
  return (
    <div style={{
      backgroundColor: '#FEF2F2',
      borderBottom: '2px solid var(--color-coral)',
      color: '#991B1B',
      padding: '12px 20px',
      fontSize: '0.92rem',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 300px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#FEE2E2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-coral)',
            flexShrink: 0
          }}>
            <AlertTriangle size={18} />
          </div>
          <div>
            <span style={{ fontWeight: 700, marginRight: '6px' }}>POTENTIAL MEDICAL EMERGENCY:</span>
            <span>
              {message || "If you or your family member are experiencing chest pain, severe breathlessness, or trauma, do not delay for cost comparison."}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <a
            href="tel:108"
            className="btn btn-coral btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
          >
            <PhoneCall size={15} />
            <span>Call 108 (Ambulance)</span>
          </a>
          {onDismiss && (
            <button
              onClick={onDismiss}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#991B1B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px'
              }}
              title="Dismiss warning"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
