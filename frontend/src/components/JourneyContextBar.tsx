import React from 'react';
import { useSearch } from '../context/SearchContext';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Activity, ShieldCheck, CheckCircle2, ChevronRight, Eye, Sparkles } from 'lucide-react';

interface JourneyContextBarProps {
  currentStage: 1 | 2 | 3 | 4 | 5;
  onNavigateTab: (tab: string) => void;
  isSimpleMode: boolean;
  onToggleSimpleMode: () => void;
}

export const JourneyContextBar: React.FC<JourneyContextBarProps> = ({
  currentStage,
  onNavigateTab,
  isSimpleMode,
  onToggleSimpleMode
}) => {
  const { searchState } = useSearch();
  const { t } = useLanguage();

  const STAGES = [
    { num: 1, id: 'dashboard', label: '1. Condition' },
    { num: 2, id: 'dashboard', label: '2. Location' },
    { num: 3, id: 'estimate', label: '3. Cost Tiers' },
    { num: 4, id: 'hospitals', label: '4. Hospitals' },
    { num: 5, id: 'schemes', label: '5. Schemes & Compare' }
  ];

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid var(--color-border)',
      padding: '10px 0',
      position: 'sticky',
      top: 0,
      zIndex: 80,
      boxShadow: '0 1px 3px rgba(18, 48, 74, 0.04)'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        
        {/* Left: Journey Context Summary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={15} color="#2C8C83" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#12304A' }}>
              {searchState.treatmentName || 'Total Knee Replacement (TKR)'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <MapPin size={14} color="#64717D" />
            <span style={{ fontSize: '0.82rem', color: '#64717D' }}>
              {searchState.city || 'Hyderabad'}
            </span>
          </div>

          <span style={{
            fontSize: '0.74rem',
            backgroundColor: '#E7F3EF',
            color: '#2C8C83',
            padding: '2px 8px',
            borderRadius: '12px',
            fontWeight: 600
          }}>
            PM-JAY / Aarogyasri Empanelled
          </span>
        </div>

        {/* Center / Right: Progress Rail */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="journey-stages" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {STAGES.map(s => {
              const isActive = currentStage === s.num;
              const isPast = currentStage > s.num;
              return (
                <button
                  key={s.num}
                  onClick={() => onNavigateTab(s.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: isActive ? '#E7F3EF' : 'transparent',
                    color: isActive ? '#12304A' : isPast ? '#2C8C83' : '#94A3B8',
                    fontSize: '0.78rem',
                    fontWeight: isActive ? 700 : 500
                  }}
                >
                  <span style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: isActive ? '#2C8C83' : isPast ? '#12304A' : '#E2E8F0',
                    color: 'white',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    fontWeight: 700
                  }}>
                    {isPast ? '✓' : s.num}
                  </span>
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>

          {/* Simple Mode Toggle */}
          <button
            onClick={onToggleSimpleMode}
            className="btn btn-secondary btn-sm"
            style={{
              padding: '4px 10px',
              fontSize: '0.75rem',
              backgroundColor: isSimpleMode ? '#FEF3C7' : '#FFFFFF',
              borderColor: isSimpleMode ? '#F59E0B' : '#E2E8F0',
              color: isSimpleMode ? '#92400E' : '#12304A',
              fontWeight: 600
            }}
            title="Toggle Simple Mode (Larger fonts, icon-first, high contrast)"
          >
            <Eye size={13} color={isSimpleMode ? '#D97706' : '#2C8C83'} />
            <span>{isSimpleMode ? 'Simple Mode ON' : 'Simple Mode'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
