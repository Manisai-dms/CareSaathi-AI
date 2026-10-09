import React from 'react';
import { AlertTriangle, PhoneCall, ShieldAlert, X, ArrowRight, Activity } from 'lucide-react';

interface EmergencyInterruptModalProps {
  isOpen: boolean;
  message: string;
  onDismiss: () => void;
  onProceedAnyway: () => void;
}

export const EmergencyInterruptModal: React.FC<EmergencyInterruptModalProps> = ({
  isOpen,
  message,
  onDismiss,
  onProceedAnyway
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        maxWidth: '560px',
        width: '100%',
        padding: '36px 30px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '3px solid #DC2626',
        animation: 'emergencyPop 0.25s ease-out',
        textAlign: 'center'
      }}>
        <style>{`
          @keyframes emergencyPop {
            0% { transform: scale(0.92); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>

        {/* Pulsing Alert Icon */}
        <div style={{
          width: '74px',
          height: '74px',
          borderRadius: '50%',
          backgroundColor: '#FEE2E2',
          color: '#DC2626',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          boxShadow: '0 0 0 10px rgba(220, 38, 38, 0.15)'
        }}>
          <AlertTriangle size={42} />
        </div>

        <div style={{
          fontSize: '0.82rem',
          fontWeight: 800,
          color: '#DC2626',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '8px'
        }}>
          Critical Healthcare Safety Protocol
        </div>

        <h2 style={{
          fontSize: '1.65rem',
          color: '#991B1B',
          lineHeight: 1.25,
          marginBottom: '16px'
        }}>
          Medical Emergency Interruption
        </h2>

        <p style={{
          fontSize: '0.95rem',
          color: '#334155',
          lineHeight: 1.6,
          marginBottom: '24px'
        }}>
          {message || "Your input mentions symptoms that could indicate a life-threatening or time-critical medical condition. Cost comparison and scheme research must never delay acute clinical assessment."}
        </p>

        {/* Big Call 108 Button */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          <a
            href="tel:108"
            style={{
              backgroundColor: '#DC2626',
              color: 'white',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 24px',
              fontSize: '1.25rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              textDecoration: 'none',
              boxShadow: '0 6px 20px rgba(220, 38, 38, 0.4)'
            }}
          >
            <PhoneCall size={24} />
            <span>Call 108 (National Ambulance)</span>
          </a>

          <a
            href="https://www.google.com/maps/search/emergency+hospital+casualty+near+me"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ padding: '12px', fontSize: '0.95rem', borderColor: '#CBD5E1' }}
          >
            <Activity size={18} color="#DC2626" />
            <span>Find Nearest 24/7 Casualty / ER on Map</span>
          </a>
        </div>

        {/* Non-Urgent Dismissal Acknowledgement */}
        <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
          <button
            onClick={onProceedAnyway}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748B',
              fontSize: '0.82rem',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            I am in a safe clinical situation. Acknowledge warning and continue to cost estimate ➔
          </button>
        </div>
      </div>
    </div>
  );
};
