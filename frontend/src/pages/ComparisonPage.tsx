import React from 'react';
import { useSearch } from '../context/SearchContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Layers, 
  X, 
  MapPin, 
  Phone, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Bed, 
  DollarSign,
  ArrowRight
} from 'lucide-react';

interface ComparisonPageProps {
  onBackToSearch: () => void;
}

export const ComparisonPage: React.FC<ComparisonPageProps> = ({ onBackToSearch }) => {
  const { t } = useLanguage();
  const { searchState, removeFromComparison, clearComparison } = useSearch();
  const { comparisonList, treatmentName } = searchState;

  if (comparisonList.length === 0) {
    return (
      <div className="section">
        <div className="container" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-mint)',
            color: 'var(--color-teal)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <Layers size={32} />
          </div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--color-navy)', marginBottom: '10px' }}>
            No Facilities Selected for Comparison
          </h2>
          <p style={{ color: 'var(--color-text-grey)', fontSize: '1rem', maxWidth: '480px', margin: '0 auto 24px auto' }}>
            Click "+ Compare" on any hospital card in Search or Hospital Discovery to compare tariffs, schemes, and distances side-by-side.
          </p>
          <button onClick={onBackToSearch} className="btn btn-primary">
            <span>Find Hospitals to Compare</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="section" style={{ paddingTop: '30px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
          <div>
            <div className="badge badge-teal" style={{ marginBottom: '8px' }}>
              Multi-Facility Comparison
            </div>
            <h1 style={{ fontSize: '2rem', color: 'var(--color-navy)', marginBottom: '4px' }}>
              Side-by-Side Hospital Comparison
            </h1>
            <p style={{ color: 'var(--color-text-grey)', fontSize: '0.95rem' }}>
              Comparing care options for: <strong>{treatmentName}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={clearComparison} className="btn btn-secondary btn-sm">
              Clear All ({comparisonList.length})
            </button>
            <button onClick={onBackToSearch} className="btn btn-primary btn-sm">
              + Add More Facilities
            </button>
          </div>
        </div>

        {/* Comparison Table Grid */}
        <div style={{ overflowX: 'auto', paddingBottom: '20px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `220px repeat(${comparisonList.length}, minmax(280px, 1fr))`,
            gap: '16px',
            minWidth: `${220 + comparisonList.length * 280}px`
          }}>
            {/* Header Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ height: '140px', display: 'flex', alignItems: 'flex-end', paddingBottom: '12px', fontWeight: 700, color: 'var(--color-navy)', fontSize: '1.1rem' }}>
                Hospital Facility
              </div>
              <div style={{ padding: '14px 0', borderTop: '1px solid var(--color-border)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-navy)' }}>
                Ownership Type
              </div>
              <div style={{ padding: '14px 0', borderTop: '1px solid var(--color-border)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-navy)' }}>
                Distance
              </div>
              <div style={{ padding: '14px 0', borderTop: '1px solid var(--color-border)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-navy)' }}>
                Estimated Cost Range
              </div>
              <div style={{ padding: '14px 0', borderTop: '1px solid var(--color-border)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-navy)' }}>
                Daily Bed / Room Rent
              </div>
              <div style={{ padding: '14px 0', borderTop: '1px solid var(--color-border)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-navy)' }}>
                Empanelled Schemes
              </div>
              <div style={{ padding: '14px 0', borderTop: '1px solid var(--color-border)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-navy)' }}>
                Contact & Address
              </div>
              <div style={{ padding: '14px 0', borderTop: '1px solid var(--color-border)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-navy)' }}>
                Action Links
              </div>
            </div>

            {/* Hospital Columns */}
            {comparisonList.map(fac => (
              <div
                key={fac.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  backgroundColor: 'var(--color-white)',
                  border: '1px solid var(--color-border)'
                }}
              >
                {/* Hospital Header */}
                <div style={{ height: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className="badge badge-teal">{fac.ownership}</span>
                    <button
                      onClick={() => removeFromComparison(fac.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-text-grey)',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                      title="Remove from comparison"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.15rem', color: 'var(--color-navy)', lineHeight: 1.25 }}>
                      {fac.name}
                    </h4>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-grey)', marginTop: '4px' }}>
                      {fac.locality}, {fac.city}
                    </div>
                  </div>
                </div>

                {/* Ownership */}
                <div style={{ padding: '14px 0', borderTop: '1px solid var(--color-border)', fontSize: '0.9rem', color: 'var(--color-navy)', fontWeight: 600 }}>
                  {fac.ownership} Sector
                </div>

                {/* Distance */}
                <div style={{ padding: '14px 0', borderTop: '1px solid var(--color-border)', fontSize: '0.9rem', color: 'var(--color-navy)' }}>
                  📍 {fac.distance_km !== undefined ? `${fac.distance_km} km` : 'Central Hyderabad'}
                </div>

                {/* Cost Range */}
                <div style={{ padding: '14px 0', borderTop: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-navy)' }}>
                    {fac.estimated_cost_min === 0 ? "₹0 (Free / Govt)" : `₹${fac.estimated_cost_min?.toLocaleString('en-IN')}`}
                    {fac.estimated_cost_max ? ` - ₹${fac.estimated_cost_max.toLocaleString('en-IN')}` : ''}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-grey)', marginTop: '2px' }}>
                    {fac.pricing_status || "Standard Reference"}
                  </div>
                </div>

                {/* Daily Bed Charges */}
                <div style={{ padding: '14px 0', borderTop: '1px solid var(--color-border)', fontSize: '0.82rem' }}>
                  {fac.room_types && Object.keys(fac.room_types).length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {Object.entries(fac.room_types).slice(0, 2).map(([r, p]) => (
                        <div key={r}>
                          <span style={{ color: 'var(--color-text-grey)' }}>{r}: </span>
                          <strong style={{ color: 'var(--color-navy)' }}>{p === 0 ? "Free" : `₹${p}`}</strong>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span style={{ color: 'var(--color-text-grey)' }}>Not published</span>
                  )}
                </div>

                {/* Empanelled Schemes */}
                <div style={{ padding: '14px 0', borderTop: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {fac.empanelled_schemes.map(s => (
                      <span key={s} className="badge badge-navy" style={{ fontSize: '0.72rem' }}>
                        {s === 'aarogyasri' ? 'Aarogyasri' : s === 'pm_jay' ? 'PM-JAY' : s.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Address & Phone */}
                <div style={{ padding: '14px 0', borderTop: '1px solid var(--color-border)', fontSize: '0.82rem', color: 'var(--color-text-grey)' }}>
                  <div>{fac.address}</div>
                  {fac.phone && (
                    <div style={{ marginTop: '4px', fontWeight: 600, color: 'var(--color-navy)' }}>
                      📞 {fac.phone}
                    </div>
                  )}
                </div>

                {/* Action Links */}
                <div style={{ padding: '14px 0', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '8px' }}>
                  {fac.phone && (
                    <a href={`tel:${fac.phone}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                      <Phone size={13} color="var(--color-teal)" />
                      <span>Call</span>
                    </a>
                  )}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${fac.lat},${fac.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                  >
                    <ExternalLink size={13} />
                    <span>Map</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
