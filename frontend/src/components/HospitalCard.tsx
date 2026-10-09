import React, { useState } from 'react';
import { 
  MapPin, 
  Layers, 
  ShieldCheck, 
  Calendar, 
  Star,
  Navigation,
  Info
} from 'lucide-react';
import { FacilityDTO } from '../services/api';
import { useSearch } from '../context/SearchContext';
import { getDataQualityBadge, googlePlacesService } from '../services/googlePlacesService';

interface HospitalCardProps {
  facility: FacilityDTO;
  activeTreatmentId?: string;
  userLat?: number;
  userLng?: number;
  onViewDetails: (facility: FacilityDTO) => void;
  onBookAppointment?: (facility: FacilityDTO) => void;
}

export const HospitalCard: React.FC<HospitalCardProps> = ({
  facility,
  activeTreatmentId,
  userLat = 17.4399,
  userLng = 78.4806,
  onViewDetails,
  onBookAppointment
}) => {
  const { searchState, addToComparison, removeFromComparison } = useSearch();

  // Resolved Authentic Hospital Exterior Photo
  const initialPhoto = facility.image_url || `/images/hospitals/${facility.id}.jpg`;
  const [imgSrc, setImgSrc] = useState<string>(initialPhoto);

  const isCompared = searchState.comparisonList.some(f => f.id === facility.id);
  
  // Google Places Enrichment
  const enrichment = googlePlacesService.getEnrichment(facility.id);
  const dataQuality = getDataQualityBadge(facility);

  // Driving time calculation
  const travelMinutes = facility.distance_km 
    ? Math.round((facility.distance_km / 28) * 60) + 4
    : googlePlacesService.estimateDrivingTimeMinutes(userLat, userLng, facility.lat, facility.lng);

  const getOwnershipBadgeClass = (ownership: string) => {
    switch (ownership) {
      case 'Government':
        return 'badge-navy';
      case 'Charitable/Trust':
        return 'badge-teal';
      default:
        return 'badge-secondary';
    }
  };

  const hasCost = facility.estimated_cost_min !== undefined && facility.estimated_cost_min !== null;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lng}`;

  return (
    <div 
      id={`hospital-card-${facility.id}`}
      className="card hospital-card" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        padding: '16px',
        borderRadius: '16px',
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--color-border)',
        boxShadow: '0 2px 8px rgba(18, 48, 74, 0.05)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
    >
      {/* 1. Authentic Hospital Exterior Photograph (16:9 ratio, rounded 12px) */}
      <div 
        onClick={() => onViewDetails(facility)}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '14px',
          backgroundColor: '#F1F5F9',
          cursor: 'pointer'
        }}
      >
        <img
          src={imgSrc}
          alt={facility.name}
          loading="lazy"
          onError={() => setImgSrc('/images/hospitals/hospital_image_unavailable.svg')}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            display: 'block'
          }}
        />

        {/* Top Badges overlay: Verified Data Quality & Open Now */}
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          display: 'flex',
          gap: '6px',
          flexWrap: 'wrap'
        }}>
          <span 
            className={`badge ${dataQuality.badgeClass}`} 
            style={{ fontSize: '0.68rem', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
            title={dataQuality.tooltip}
          >
            {dataQuality.label}
          </span>
          {enrichment?.isOpenNow && (
            <span style={{
              backgroundColor: '#10B981',
              color: 'white',
              fontSize: '0.66rem',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              Open Now
            </span>
          )}
        </div>

        {/* Source Attribution Label */}
        <div style={{
          position: 'absolute',
          bottom: '6px',
          right: '8px',
          backgroundColor: 'rgba(15, 23, 42, 0.82)',
          color: '#F8FAF9',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '0.62rem',
          fontWeight: 500,
          backdropFilter: 'blur(4px)'
        }}>
          {facility.image_source ? `📷 ${facility.image_source}` : '📷 Hospital Exterior'}
        </div>
      </div>

      {/* 2. Header: Ownership + Premium Badge + Calculated Distance & Travel Time */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span className={`badge ${getOwnershipBadgeClass(facility.ownership)}`} style={{ fontSize: '0.72rem' }}>
            {facility.ownership} Facility
          </span>
          {facility.facility_class === 'Premium' && (
            <span style={{
              backgroundColor: '#FEF3C7',
              color: '#92400E',
              padding: '2px 8px',
              borderRadius: '10px',
              fontSize: '0.68rem',
              fontWeight: 700,
              border: '1px solid #FDE68A'
            }}>
              ★ Premium Quaternary
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#64717D' }}>
          <span>📍 {facility.distance_km !== undefined ? `${facility.distance_km} km` : 'Nearby'}</span>
          <span>•</span>
          <span style={{ color: '#2C8C83', fontWeight: 600 }}>🚗 {travelMinutes} min</span>
        </div>
      </div>

      {/* 3. Hospital Name */}
      <h3 
        onClick={() => onViewDetails(facility)}
        style={{ 
          fontSize: '1.12rem', 
          color: 'var(--color-navy)', 
          lineHeight: 1.35, 
          marginBottom: '6px',
          cursor: 'pointer',
          fontWeight: 700
        }}
        title={facility.name}
      >
        {facility.name}
      </h3>

      {/* Locality & Verified Rating */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--color-text-grey)', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={13} color="var(--color-teal)" />
          <span>{facility.locality ? `${facility.locality}, ${facility.city}` : facility.city}</span>
        </div>

        {(enrichment?.rating || facility.rating) && (
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#D97706', fontWeight: 700, fontSize: '0.8rem' }}
            title="Google rating (display-only, not a quality guarantee)"
          >
            <Star size={13} fill="#D97706" color="#D97706" />
            <span>{enrichment?.rating || facility.rating}</span>
            {enrichment?.userRatingCount && (
              <span style={{ color: '#94A3B8', fontWeight: 400, fontSize: '0.72rem' }}>
                ({(enrichment.userRatingCount / 1000).toFixed(1)}k)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Treatment Verification Status */}
      {activeTreatmentId && (
        <div style={{ marginBottom: '8px', fontSize: '0.74rem' }}>
          {facility.verified_treatments.includes(activeTreatmentId) ? (
            <span style={{ color: '#166534', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#166534' }} />
              Verified Treatment Department Available
            </span>
          ) : (
            <span style={{ color: '#64717D', fontStyle: 'italic' }}>
              Department availability unverified — contact hospital
            </span>
          )}
        </div>
      )}

      {/* Why This Hospital is Recommended */}
      {facility.recommendation_reason && (
        <div style={{
          fontSize: '0.74rem',
          color: '#12304A',
          backgroundColor: '#F0FDF4',
          border: '1px solid #BBF7D0',
          borderRadius: '8px',
          padding: '6px 10px',
          marginBottom: '10px',
          lineHeight: 1.4
        }}>
          <strong style={{ color: '#166534' }}>Why Recommended: </strong>
          <span>{facility.recommendation_reason}</span>
        </div>
      )}

      {/* 4. Honest Treatment Cost Information */}
      <div style={{
        backgroundColor: '#F8FAF9',
        border: '1px solid #E2E8F0',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        marginBottom: '12px'
      }}>
        {hasCost ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.72rem', color: '#64717D', fontWeight: 600, textTransform: 'uppercase' }}>
                {facility.pricing_status || "Estimated Procedure Tariff"}
              </span>
              <span className="badge badge-teal" style={{ fontSize: '0.66rem' }}>
                {facility.price_confidence || 'Medium'} Confidence
              </span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-navy)', marginTop: '2px' }}>
              {facility.estimated_cost_min === 0 
                ? "₹0 (Free / Subsidized)" 
                : `₹${facility.estimated_cost_min?.toLocaleString('en-IN')}`}
              {facility.estimated_cost_max ? ` - ₹${facility.estimated_cost_max.toLocaleString('en-IN')}` : ''}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64717D', marginTop: '2px' }}>
              Indicative reference range • Final quote issued by hospital
            </div>
          </>
        ) : (
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64717D' }}>
              Cost information unavailable
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '2px' }}>
              Contact facility directly for verified admission billing
            </div>
          </div>
        )}
      </div>

      {/* 5. Empanelled Schemes Badges */}
      {facility.empanelled_schemes && facility.empanelled_schemes.length > 0 && (
        <div style={{ marginTop: 'auto', marginBottom: '14px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-grey)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={13} color="var(--color-teal)" />
            <span>Empanelled Schemes:</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {facility.empanelled_schemes.map(s => {
              const label = s === 'aarogyasri' ? 'Aarogyasri' : s === 'pm_jay' ? 'PM-JAY' : s.toUpperCase();
              return (
                <span key={s} className="badge badge-navy" style={{ fontSize: '0.68rem' }}>
                  {label}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Action Buttons Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '10px', borderTop: '1px solid var(--color-border)', flexWrap: 'wrap' }}>
        {/* Book Appointment (Primary Button) */}
        {onBookAppointment && (
          <button
            onClick={() => onBookAppointment(facility)}
            className="btn btn-primary btn-sm"
            style={{ flex: '1.2', minWidth: '130px', padding: '8px 10px', fontSize: '0.82rem', fontWeight: 700 }}
          >
            <Calendar size={14} />
            <span>Book Appointment</span>
          </button>
        )}

        {/* View Details */}
        <button
          onClick={() => onViewDetails(facility)}
          className="btn btn-secondary btn-sm"
          style={{ padding: '8px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          title="View full facility credentials and gallery"
        >
          <Info size={13} />
          <span>Details</span>
        </button>

        {/* Get Directions (opens Google Maps) */}
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary btn-sm"
          style={{ 
            padding: '8px 10px', 
            fontSize: '0.8rem', 
            textDecoration: 'none', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '4px',
            color: '#12304A'
          }}
          title="Open directions in Google Maps"
        >
          <Navigation size={13} color="#2C8C83" />
          <span>Directions</span>
        </a>

        {/* Compare Toggle */}
        <button
          onClick={() => {
            if (isCompared) removeFromComparison(facility.id);
            else addToComparison(facility as any);
          }}
          className="btn btn-secondary btn-sm"
          style={{ 
            padding: '8px 8px', 
            fontSize: '0.8rem',
            backgroundColor: isCompared ? '#E7F3EF' : '#FFFFFF',
            borderColor: isCompared ? '#2C8C83' : '#E2E8F0',
            color: isCompared ? '#2C8C83' : '#12304A'
          }}
          title={isCompared ? "Remove from comparison" : "Add to side-by-side comparison"}
        >
          <Layers size={13} />
          <span>{isCompared ? 'Added' : '+ Compare'}</span>
        </button>
      </div>
    </div>
  );
};
