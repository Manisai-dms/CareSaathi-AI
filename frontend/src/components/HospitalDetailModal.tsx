import React, { useState } from 'react';
import { X, MapPin, Phone, Globe, ExternalLink, ShieldCheck, CheckCircle2, Bed, Calendar, Layers } from 'lucide-react';
import { FacilityDTO } from '../services/api';
import { useSearch } from '../context/SearchContext';

interface HospitalDetailModalProps {
  facility: FacilityDTO | null;
  onClose: () => void;
  onEstimateHere: (facility: FacilityDTO) => void;
}

export const HospitalDetailModal: React.FC<HospitalDetailModalProps> = ({
  facility,
  onClose,
  onEstimateHere
}) => {
  if (!facility) return null;
  const { searchState, addToComparison, removeFromComparison } = useSearch();
  const [imageError, setImageError] = useState(false);

  const isCompared = searchState.comparisonList.some(f => f.id === facility.id);
  const initials = facility.initials || facility.name.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase();
  const showImage = facility.image_url && !imageError;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px', padding: '24px', overflow: 'hidden' }}>
        {/* Visual Banner */}
        <div style={{
          position: 'relative',
          height: '160px',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          marginBottom: '18px',
          backgroundColor: '#183247'
        }}>
          {showImage ? (
            <img
              src={facility.image_url!}
              alt={facility.name}
              onError={() => setImageError(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #183247 0%, #438F84 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '0.05em' }}>
                {initials}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#E7F3EF', marginTop: '4px' }}>
                {facility.ownership} Healthcare Facility • {facility.city}
              </div>
            </div>
          )}

          {/* Photo Attribution Badge */}
          <div style={{
            position: 'absolute',
            bottom: '8px',
            right: '10px',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            color: '#E2E8F0',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '0.7rem',
            backdropFilter: 'blur(4px)'
          }}>
            {facility.image_attribution ? `📷 ${facility.image_attribution}` : (showImage ? `📷 ${facility.image_source}` : 'Institutional Placeholder')}
          </div>
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-teal">{facility.ownership} Facility</span>
              {facility.distance_km !== undefined && (
                <span className="badge badge-navy">📍 {facility.distance_km} km away</span>
              )}
              {facility.rating && (
                <span className="badge badge-warning">★ {facility.rating} / 5.0</span>
              )}
            </div>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-navy)', lineHeight: 1.25 }}>
              {facility.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-grey)' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Address and Contact Details */}
        <div style={{
          backgroundColor: 'var(--color-warm-bg)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 16px',
          border: '1px solid var(--color-border)',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          fontSize: '0.88rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--color-navy)' }}>
            <MapPin size={16} color="var(--color-teal)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{facility.address}, PIN: {facility.pin_code}</span>
          </div>
          {facility.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={16} color="var(--color-teal)" />
              <a href={`tel:${facility.phone}`} style={{ fontWeight: 600 }}>{facility.phone}</a>
            </div>
          )}
          {facility.website && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={16} color="var(--color-teal)" />
              <a href={facility.website} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span>Official Hospital Portal</span>
                <ExternalLink size={13} />
              </a>
            </div>
          )}
        </div>

        {/* Published Room Rent Rates */}
        {facility.room_types && Object.keys(facility.room_types).length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--color-navy)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bed size={16} color="var(--color-teal)" />
              <span>Published Daily Inpatient Ward / Bed Charges:</span>
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              {Object.entries(facility.room_types).map(([room, price]) => (
                <div
                  key={room}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-light-blue)',
                    border: '1px solid #d2e4f3'
                  }}
                >
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-grey)' }}>{room}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-navy)', marginTop: '2px' }}>
                    {price === 0 ? "Free (Subsidized)" : `₹${price.toLocaleString('en-IN')} / day`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empanelled Schemes */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.95rem', color: 'var(--color-navy)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="var(--color-teal)" />
            <span>Verified Empanelled Schemes & Tie-ups:</span>
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {facility.empanelled_schemes.map(s => (
              <span key={s} className="badge badge-navy" style={{ fontSize: '0.82rem', padding: '5px 12px' }}>
                {s === 'aarogyasri' ? 'Telangana Aarogyasri' : s === 'pm_jay' ? 'Ayushman Bharat (PM-JAY)' : s.toUpperCase()}
              </span>
            ))}
          </div>
        </div>

        {/* Verified Departments & Treatments */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '0.95rem', color: 'var(--color-navy)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} color="var(--color-teal)" />
            <span>Verified Clinical Capabilities in Master Record:</span>
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {facility.verified_treatments.map(t => (
              <span key={t} className="badge badge-teal" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
                {t.replace(/_/g, ' ').toUpperCase()}
              </span>
            ))}
          </div>
        </div>

        {/* Verification Metadata */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.78rem',
          color: 'var(--color-text-grey)',
          borderTop: '1px solid var(--color-border)',
          paddingTop: '14px',
          marginBottom: '20px'
        }}>
          <span>Last audit check: {facility.last_verified_date}</span>
          <span>{facility.pricing_status || "Standard Reference Rate"}</span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <button
            onClick={() => {
              if (isCompared) removeFromComparison(facility.id);
              else addToComparison(facility as any);
            }}
            className="btn btn-secondary"
          >
            <Layers size={16} />
            <span>{isCompared ? "Remove from Compare" : "+ Add to Compare"}</span>
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              <ExternalLink size={16} />
              <span>Directions</span>
            </a>
            <button
              onClick={() => {
                onEstimateHere(facility);
                onClose();
              }}
              className="btn btn-primary"
            >
              <span>Estimate Procedure Here</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
