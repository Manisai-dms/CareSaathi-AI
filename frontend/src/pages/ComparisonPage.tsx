import React, { useState } from 'react';
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
  ArrowRight,
  Calendar
} from 'lucide-react';
import { FacilityDTO } from '../services/api';
import { BookingModal } from '../components/BookingModal';

interface ComparisonPageProps {
  onBackToSearch: () => void;
}

export const ComparisonPage: React.FC<ComparisonPageProps> = ({ onBackToSearch }) => {
  const { t } = useLanguage();
  const { searchState, removeFromComparison, clearComparison } = useSearch();
  const { comparisonList, treatmentName } = searchState;

  const [bookingFacility, setBookingFacility] = useState<FacilityDTO | null>(null);

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
                Ownership & Classification
              </div>
              <div style={{ padding: '14px 0', borderTop: '1px solid var(--color-border)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-navy)' }}>
                Why Recommended
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

            {/* Facility Columns */}
            {comparisonList.map(fac => (
              <div key={fac.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '18px', position: 'relative' }}>
                
                {/* Remove button */}
                <button
                  onClick={() => removeFromComparison(fac.id)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-text-grey)',
                    cursor: 'pointer'
                  }}
                  title="Remove from comparison"
                >
                  <X size={18} />
                </button>

                {/* Facility Name & Header */}
                <div style={{ height: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: '12px' }}>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--color-navy)', lineHeight: 1.3, marginBottom: '6px' }}>
                    {fac.name}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-grey)' }}>
                    {fac.locality}, {fac.city}
                  </div>
                </div>

                {/* Ownership & Classification */}
                <div style={{ padding: '14px 0', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span className={`badge ${fac.ownership === 'Government' ? 'badge-teal' : fac.ownership === 'Charitable/Trust' ? 'badge-navy' : 'badge-secondary'}`}>
                    {fac.ownership}
                  </span>
                  {fac.facility_class === 'Premium' && (
                    <span className="badge" style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #F59E0B' }}>
                      ⭐ Premium
                    </span>
                  )}
                </div>

                {/* Why Recommended */}
                <div style={{ padding: '14px 0', borderTop: '1px solid var(--color-border)', fontSize: '0.8rem', color: 'var(--color-navy)', lineHeight: 1.4 }}>
                  {fac.recommendation_reason || `${fac.ownership} hospital with verified departments and established clinical capabilities.`}
                </div>

                {/* Distance */}
                <div style={{ padding: '14px 0', borderTop: '1px solid var(--color-border)', fontSize: '0.9rem', color: 'var(--color-navy)', fontWeight: 600 }}>
                  {fac.distance_km ? `📍 ${fac.distance_km} km away` : 'Within City'}
                </div>

                {/* Estimated Cost Range */}
                <div style={{ padding: '14px 0', borderTop: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-navy)' }}>
                    {fac.estimated_cost_min === 0 ? "₹0 (Free / Subsidized)" : `₹${fac.estimated_cost_min?.toLocaleString('en-IN')}`}
                    {fac.estimated_cost_max ? ` - ₹${fac.estimated_cost_max.toLocaleString('en-IN')}` : ''}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-teal-dark)', marginTop: '2px' }}>
                    {fac.price_confidence || 'Medium'} Confidence
                  </div>
                </div>

                {/* Daily Bed / Room Rent */}
                <div style={{ padding: '14px 0', borderTop: '1px solid var(--color-border)', fontSize: '0.82rem' }}>
                  {Object.entries(fac.room_types).map(([type, price]) => (
                    <div key={type} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ color: 'var(--color-text-grey)' }}>{type}:</span>
                      <strong style={{ color: 'var(--color-navy)' }}>₹{price}/day</strong>
                    </div>
                  ))}
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
                <div style={{ padding: '14px 0', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Book Appointment Action */}
                  <button
                    onClick={() => setBookingFacility(fac as any)}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', fontWeight: 700 }}
                  >
                    <Calendar size={13} />
                    <span>Book Appointment</span>
                  </button>

                  <div style={{ display: 'flex', gap: '8px' }}>
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
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1 }}
                    >
                      <ExternalLink size={13} />
                      <span>Map</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Modal */}
        {bookingFacility && (
          <BookingModal
            isOpen={Boolean(bookingFacility)}
            facility={bookingFacility}
            onClose={() => setBookingFacility(null)}
            treatmentName={treatmentName}
            matchedSchemeName="Aarogyasri / PM-JAY"
          />
        )}

      </div>
    </div>
  );
};
