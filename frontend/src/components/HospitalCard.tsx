import React, { useState } from 'react';
import { MapPin, Phone, ExternalLink, CheckCircle2, AlertTriangle, Layers, ShieldCheck, Building2 } from 'lucide-react';
import { FacilityDTO } from '../services/api';
import { useSearch } from '../context/SearchContext';

interface HospitalCardProps {
  facility: FacilityDTO;
  activeTreatmentId?: string;
  onViewDetails: (facility: FacilityDTO) => void;
}

export const HospitalCard: React.FC<HospitalCardProps> = ({
  facility,
  activeTreatmentId,
  onViewDetails
}) => {
  const { searchState, addToComparison, removeFromComparison } = useSearch();
  const [imageError, setImageError] = useState(false);

  const isCompared = searchState.comparisonList.some(f => f.id === facility.id);
  const isTreatmentVerified = activeTreatmentId ? facility.verified_treatments.includes(activeTreatmentId) : true;
  const initials = facility.initials || facility.name.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase();
  const showImage = facility.image_url && !imageError;

  const getOwnershipBadgeClass = (ownership: string) => {
    switch (ownership) {
      case 'Government':
        return 'badge-teal';
      case 'Charitable/Trust':
        return 'badge-navy';
      default:
        return 'badge-secondary';
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px' }}>
      {/* Hospital Visual Banner (Verified Photo or Branded Initials Placeholder) */}
      <div 
        onClick={() => onViewDetails(facility)}
        style={{
          position: 'relative',
          height: '130px',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          marginBottom: '14px',
          backgroundColor: '#183247',
          cursor: 'pointer'
        }}
      >
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
            color: 'white',
            padding: '12px'
          }}>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '0.05em' }}>
              {initials}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#E7F3EF', marginTop: '2px', textAlign: 'center' }}>
              {facility.ownership} Healthcare Facility
            </div>
          </div>
        )}

        {/* Source Attribution Label */}
        <div style={{
          position: 'absolute',
          bottom: '6px',
          right: '8px',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          color: '#E2E8F0',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '0.64rem',
          fontWeight: 500,
          backdropFilter: 'blur(4px)'
        }}>
          {showImage ? `📷 ${facility.image_source || 'Verified Photo'}` : 'Directory Initial'}
        </div>
      </div>

      {/* Top Meta Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`badge ${getOwnershipBadgeClass(facility.ownership)}`}>
            {facility.ownership} Facility
          </span>
          {facility.distance_km !== undefined && (
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-grey)' }}>
              📍 {facility.distance_km} km away
            </span>
          )}
        </div>

        {/* Compare Checkbox Button */}
        <button
          onClick={() => {
            if (isCompared) {
              removeFromComparison(facility.id);
            } else {
              addToComparison(facility as any);
            }
          }}
          style={{
            background: isCompared ? 'var(--color-mint)' : 'transparent',
            border: `1px solid ${isCompared ? 'var(--color-teal)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-sm)',
            padding: '4px 8px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: isCompared ? 'var(--color-teal-dark)' : 'var(--color-text-grey)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Layers size={13} color={isCompared ? 'var(--color-teal)' : 'var(--color-text-grey)'} />
          <span>{isCompared ? "In Comparison" : "+ Compare"}</span>
        </button>
      </div>

      {/* Hospital Name & Address */}
      <h4 style={{
        fontSize: '1.15rem',
        color: 'var(--color-navy)',
        marginBottom: '6px',
        lineHeight: 1.3,
        cursor: 'pointer'
      }} onClick={() => onViewDetails(facility)}>
        {facility.name}
      </h4>

      <p style={{
        fontSize: '0.82rem',
        color: 'var(--color-text-grey)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '4px',
        marginBottom: '14px'
      }}>
        <MapPin size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
        <span>{facility.address} ({facility.locality})</span>
      </p>

      {/* Treatment Verification Status */}
      <div style={{ marginBottom: '14px' }}>
        {isTreatmentVerified ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            color: 'var(--color-teal-dark)',
            fontWeight: 600
          }}>
            <CheckCircle2 size={15} color="var(--color-teal)" />
            <span>Treatment availability verified</span>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            color: '#B45309',
            fontWeight: 600
          }}>
            <AlertTriangle size={15} color="#D97706" />
            <span>Treatment availability not verified — contact facility</span>
          </div>
        )}
      </div>

      {/* Indicative Cost Box (if available) */}
      {(facility.estimated_cost_min !== undefined || facility.estimated_cost_max !== undefined) && (
        <div style={{
          backgroundColor: 'var(--color-warm-bg)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          border: '1px solid var(--color-border)',
          marginBottom: '14px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-grey)', textTransform: 'uppercase', fontWeight: 600 }}>
              Estimated Procedure Range
            </span>
            <span className="badge badge-teal" style={{ fontSize: '0.72rem' }}>
              {facility.price_confidence || 'Medium'} Confidence
            </span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-navy)', marginTop: '2px' }}>
            {facility.estimated_cost_min === 0 ? "₹0 (Free / Subsidized)" : `₹${facility.estimated_cost_min?.toLocaleString('en-IN')}`}
            {facility.estimated_cost_max ? ` - ₹${facility.estimated_cost_max.toLocaleString('en-IN')}` : ''}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-grey)', marginTop: '2px' }}>
            {facility.pricing_status || "Standard Reference Tariff"}
          </div>
        </div>
      )}

      {/* Empanelled Schemes Badges */}
      <div style={{ marginTop: 'auto', marginBottom: '14px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-grey)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ShieldCheck size={13} color="var(--color-teal)" />
          <span>Empanelled Schemes:</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {facility.empanelled_schemes.map(s => {
            const label = s === 'aarogyasri' ? 'Aarogyasri' : s === 'pm_jay' ? 'PM-JAY' : s.toUpperCase();
            return (
              <span key={s} className="badge badge-navy" style={{ fontSize: '0.72rem' }}>
                {label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Card Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
        {facility.phone && (
          <a
            href={`tel:${facility.phone}`}
            className="btn btn-secondary btn-sm"
            style={{ flex: 1, padding: '7px 8px' }}
            title="Call hospital reception"
          >
            <Phone size={14} color="var(--color-teal)" />
            <span>Call</span>
          </a>
        )}
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary btn-sm"
          style={{ flex: 1, padding: '7px 8px' }}
          title="Open Google Maps directions"
        >
          <ExternalLink size={14} />
          <span>Directions</span>
        </a>
        <button
          onClick={() => onViewDetails(facility)}
          className="btn btn-primary btn-sm"
          style={{ flex: 1, padding: '7px 8px' }}
        >
          <span>Details</span>
        </button>
      </div>
    </div>
  );
};
