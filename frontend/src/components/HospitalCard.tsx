import React, { useState } from 'react';
import { 
  MapPin, 
  Layers, 
  ShieldCheck, 
  Calendar, 
  Star, 
  Navigation, 
  Info, 
  Phone, 
  ExternalLink, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react';
import { FacilityDTO } from '../services/api';
import { useSearch } from '../context/SearchContext';
import { getDataQualityBadge } from '../services/googlePlacesService';

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

  // Photo carousel state
  const photosList = React.useMemo(() => {
    const list: Array<{ url: string; attribution: string }> = [];

    // 1. Google Place Photos (Top priority when matched)
    if (facility.google_photos && facility.google_photos.length > 0) {
      facility.google_photos.forEach(p => list.push(p));
    }

    // 2. Verified Photograph (Wikimedia Commons / Hospital)
    if (facility.image_url) {
      list.push({
        url: facility.image_url,
        attribution: facility.image_source || 'Hospital Exterior'
      });
    }

    // 3. Fallback illustrated facade
    if (list.length === 0) {
      const fallbackUrl = facility.ownership === 'Government'
        ? '/images/hospitals/govt_hospital_facade.svg'
        : facility.ownership === 'Charitable/Trust'
          ? '/images/hospitals/charitable_hospital_facade.svg'
          : facility.facility_class === 'Premium'
            ? '/images/hospitals/premium_hospital_facade.svg'
            : '/images/hospitals/private_hospital_facade.svg';
      list.push({
        url: fallbackUrl,
        attribution: `CareSaathi Verified Illustration (${facility.ownership})`
      });
    }

    return list;
  }, [facility.google_photos, facility.image_url, facility.ownership, facility.facility_class]);

  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);
  const currentPhoto = photosList[activePhotoIdx] || photosList[0];

  const isCompared = searchState.comparisonList.some(f => f.id === facility.id);
  const dataQuality = getDataQualityBadge(facility);

  // Haversine fallback distance calculation
  const calcKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  };

  const effectiveDistanceKm = (facility.distance_km !== undefined && facility.distance_km !== null)
    ? facility.distance_km
    : (facility.lat && facility.lng && userLat && userLng)
      ? calcKm(userLat, userLng, facility.lat, facility.lng)
      : null;

  // Straight-line driving approximation fallback
  const travelMinutes = effectiveDistanceKm !== null
    ? Math.round(effectiveDistanceKm * 2.2 + 3)
    : 15;

  const getOwnershipBadgeClass = (ownership: string, facilityClass?: string) => {
    if (facilityClass === 'Premium') return 'badge-purple';
    switch (ownership) {
      case 'Government':
        return 'badge-teal';
      case 'Charitable/Trust':
        return 'badge-amber';
      default:
        return 'badge-navy';
    }
  };

  const hasCost = facility.estimated_cost_min !== undefined && facility.estimated_cost_min !== null;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lng}`;

  // Format verification date
  const formattedVerifiedDate = facility.verified_at
    ? new Date(facility.verified_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Oct 2026';

  const primarySourceUrl = facility.source_urls && facility.source_urls.length > 0
    ? facility.source_urls[0]
    : facility.website_url;

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
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(18, 48, 74, 0.05)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        boxSizing: 'border-box'
      }}
    >
      {/* 1. Photo Container with Multi-Image Carousel (16:9 ratio) */}
      <div 
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '12px',
          backgroundColor: '#F1F5F9'
        }}
      >
        <img
          src={currentPhoto.url}
          alt={facility.name}
          loading="lazy"
          onClick={() => onViewDetails(facility)}
          onError={(e) => {
            // Safe fallback to illustrated facade
            const target = e.currentTarget;
            const fallback = facility.ownership === 'Government' 
              ? '/images/hospitals/govt_hospital_facade.svg'
              : facility.ownership === 'Charitable/Trust'
                ? '/images/hospitals/charitable_hospital_facade.svg'
                : facility.facility_class === 'Premium'
                  ? '/images/hospitals/premium_hospital_facade.svg'
                  : '/images/hospitals/private_hospital_facade.svg';
            if (target.src !== fallback) {
              target.src = fallback;
            }
          }}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            display: 'block',
            cursor: 'pointer'
          }}
        />

        {/* Carousel controls if >1 photos */}
        {photosList.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActivePhotoIdx(prev => (prev === 0 ? photosList.length - 1 : prev - 1));
              }}
              style={{
                position: 'absolute',
                left: '6px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(15, 23, 42, 0.65)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 4
              }}
              title="Previous photo"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActivePhotoIdx(prev => (prev === photosList.length - 1 ? 0 : prev + 1));
              }}
              style={{
                position: 'absolute',
                right: '6px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(15, 23, 42, 0.65)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 4
              }}
              title="Next photo"
            >
              <ChevronRight size={14} />
            </button>
            {/* Dots */}
            <div style={{
              position: 'absolute',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '4px',
              zIndex: 4
            }}>
              {photosList.map((_, idx) => (
                <div
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setActivePhotoIdx(idx); }}
                  style={{
                    width: activePhotoIdx === idx ? '12px' : '6px',
                    height: '6px',
                    borderRadius: '4px',
                    backgroundColor: activePhotoIdx === idx ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                />
              ))}
            </div>
          </>
        )}

        {/* Top Badges overlay: Verified Data Quality & Verified status */}
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          display: 'flex',
          gap: '6px',
          flexWrap: 'wrap',
          zIndex: 3
        }}>
          <span 
            className={`badge ${dataQuality.badgeClass}`} 
            style={{ fontSize: '0.68rem', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
            title={dataQuality.tooltip}
          >
            {dataQuality.label}
          </span>
          {facility.verification_status === 'verified' && (
            <span style={{
              backgroundColor: '#10B981',
              color: 'white',
              fontSize: '0.66rem',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              ✓ Verified
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
          backdropFilter: 'blur(4px)',
          maxWidth: '80%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          zIndex: 3
        }}>
          📷 {currentPhoto.attribution}
        </div>
      </div>

      {/* 2. Header: Ownership + Distance & Road Travel Time */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span 
            className={`badge ${getOwnershipBadgeClass(facility.ownership, facility.facility_class)}`} 
            style={{ 
              fontSize: '0.72rem',
              backgroundColor: facility.facility_class === 'Premium' ? '#F5F3FF' : undefined,
              color: facility.facility_class === 'Premium' ? '#7C3AED' : undefined,
              border: facility.facility_class === 'Premium' ? '1px solid #DDD6FE' : undefined
            }}
          >
            {facility.facility_class === 'Premium' ? '★ Premium Quaternary' : `${facility.ownership} Facility`}
          </span>
        </div>

        {/* Road Distance vs Straight-line indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.76rem', color: '#475569', flexWrap: 'wrap' }}>
          {facility.road_distance_km !== undefined ? (
            <>
              <span style={{ fontWeight: 600, color: '#12304A' }}>
                🚗 {facility.road_distance_km} km by road
              </span>
              <span>·</span>
              <span style={{ color: '#0D9488', fontWeight: 700 }}>
                {facility.road_duration_mins} min
              </span>
              {facility.is_live_traffic && (
                <span style={{
                  backgroundColor: '#DCFCE7',
                  color: '#166534',
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  padding: '1px 5px',
                  borderRadius: '10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2px'
                }}>
                  <Zap size={9} fill="#166534" />
                  live traffic
                </span>
              )}
            </>
          ) : (
            <>
              <span>📍 {effectiveDistanceKm !== null ? `≈ ${effectiveDistanceKm} km straight-line` : 'Nearby'}</span>
              <span>·</span>
              <span style={{ color: '#64717D', fontWeight: 600 }}>~{travelMinutes} min</span>
            </>
          )}
        </div>
      </div>

      {/* 3. Hospital Name */}
      <h3 
        onClick={() => onViewDetails(facility)}
        style={{ 
          fontSize: '1.08rem', 
          color: '#12304A', 
          lineHeight: 1.35, 
          marginBottom: '6px',
          cursor: 'pointer',
          fontWeight: 700
        }}
        title={facility.name}
      >
        {facility.name}
      </h3>

      {/* Locality & Ratings (Verified Rating + Google Listing Rating) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64717D', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={13} color="#0D9488" />
          <span>{facility.locality ? `${facility.locality}, ${facility.city}` : facility.city}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Official Registry / Stored Rating */}
          {facility.rating !== null && facility.rating !== undefined && (
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#D97706', fontWeight: 700, fontSize: '0.78rem' }}
              title="Verified hospital rating"
            >
              <Star size={12} fill="#D97706" color="#D97706" />
              <span>{Number(facility.rating).toFixed(1)}</span>
            </div>
          )}

          {/* Google Listing Rating (sourced from Google Places) */}
          {facility.google_rating && (
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#475569', fontSize: '0.72rem', backgroundColor: '#F8FAFC', padding: '2px 5px', borderRadius: '4px', border: '1px solid #E2E8F0' }}
              title="Google Maps listing rating (source labeled)"
            >
              <Star size={11} fill="#D97706" color="#D97706" />
              <span style={{ fontWeight: 700, color: '#1E293B' }}>{facility.google_rating.toFixed(1)}</span>
              {facility.google_user_rating_count && (
                <span style={{ color: '#64717D' }}>({facility.google_user_rating_count.toLocaleString()} Google reviews)</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Specialty Verification Badge */}
      {activeTreatmentId && (
        <div style={{ marginBottom: '8px' }}>
          {facility.specialty_match || (facility.verified_treatments && facility.verified_treatments.includes(activeTreatmentId)) ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              backgroundColor: '#F0FDF4', 
              border: '1px solid #BBF7D0', 
              padding: '4px 8px', 
              borderRadius: '6px', 
              fontSize: '0.72rem' 
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#166534' }} />
              <span style={{ color: '#166534', fontWeight: 600 }}>Verified Department Available</span>
            </div>
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              backgroundColor: '#F8FAFC', 
              border: '1px solid #E2E8F0', 
              padding: '4px 8px', 
              borderRadius: '6px', 
              fontSize: '0.72rem' 
            }}>
              <span style={{ color: '#64717D', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={12} color="#94A3B8" />
                Department availability unverified
              </span>
              <span 
                onClick={() => onViewDetails(facility)} 
                style={{ color: '#0D9488', fontWeight: 600, cursor: 'pointer', fontSize: '0.7rem' }}
              >
                Contact hospital →
              </span>
            </div>
          )}
        </div>
      )}

      {/* Sourced "Why this hospital" Box */}
      <div style={{
        fontSize: '0.73rem',
        color: '#12304A',
        backgroundColor: '#F8FAF9',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        padding: '8px 10px',
        marginBottom: '10px',
        lineHeight: 1.45
      }}>
        <div style={{ fontWeight: 700, color: '#0D9488', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ShieldCheck size={13} color="#0D9488" />
          <span>Why this hospital:</span>
        </div>
        <div style={{ color: '#334155', fontSize: '0.72rem' }}>
          {facility.why_this_hospital ? (
            facility.why_this_hospital
          ) : (
            <div>
              • {facility.ownership === 'Government' 
                  ? 'Government facility providing free/subsidized public care.' 
                  : facility.facility_class === 'Premium' 
                    ? 'Premium multi-specialty tertiary care center.' 
                    : 'Recognized regional hospital with active clinical facilities.'}
              {facility.empanelled_schemes && facility.empanelled_schemes.length > 0 && (
                <span> Supported under {facility.empanelled_schemes.map(s => s === 'pm_jay' ? 'PM-JAY' : s === 'aarogyasri' ? 'Aarogyasri' : s.toUpperCase()).join(', ')}.</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4. Honest Treatment Cost Information (Wrapped Price Bug Fixed) */}
      <div style={{
        backgroundColor: '#F8FAF9',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        padding: '8px 12px',
        marginBottom: '10px'
      }}>
        {facility.tariff_detail?.type === 'not available' || (!hasCost && facility.ownership !== 'Government') ? (
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64717D' }}>
              Tariff not published, contact hospital
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '2px' }}>
              Final pricing issued directly by hospital admission desk
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.68rem', color: '#64717D', fontWeight: 600, textTransform: 'uppercase' }}>
                {facility.pricing_status || "Estimated Procedure Tariff"}
              </span>
              <span className="badge badge-teal" style={{ fontSize: '0.64rem' }}>
                {facility.tariff_detail?.type === 'published' ? 'Published Tariff' : 'Reference Estimate'}
              </span>
            </div>
            {/* Price values kept together using white-space: nowrap */}
            <div style={{ 
              fontSize: 'clamp(0.95rem, 1.25vw, 1.25rem)', 
              fontWeight: 800, 
              color: '#12304A', 
              marginTop: '3px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              flexWrap: 'wrap'
            }}>
              {facility.estimated_cost_min === 0 ? (
                <span style={{ whiteSpace: 'nowrap' }}>₹0 (Free / Subsidized)</span>
              ) : (
                <span style={{ whiteSpace: 'nowrap' }}>₹{facility.estimated_cost_min?.toLocaleString('en-IN')}</span>
              )}
              {facility.estimated_cost_max ? (
                <>
                  <span>-</span>
                  <span style={{ whiteSpace: 'nowrap' }}>₹{facility.estimated_cost_max?.toLocaleString('en-IN')}</span>
                </>
              ) : null}
            </div>
            <div style={{ fontSize: '0.66rem', color: '#64717D', marginTop: '2px' }}>
              Indicative reference range • Subject to clinical severity
            </div>
          </>
        )}
      </div>

      {/* 5. Empanelled Schemes Badges */}
      {facility.empanelled_schemes && facility.empanelled_schemes.length > 0 && (
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64717D', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={12} color="#0D9488" />
            <span>Empanelled Schemes:</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {facility.empanelled_schemes.map(s => {
              const label = s === 'aarogyasri' ? 'Aarogyasri' : s === 'pm_jay' ? 'PM-JAY' : s.toUpperCase();
              return (
                <span key={s} className="badge badge-navy" style={{ fontSize: '0.66rem', padding: '2px 6px' }}>
                  {label}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Verification & Source Line */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        fontSize: '0.7rem', 
        color: '#64717D', 
        paddingTop: '6px', 
        borderTop: '1px dashed #E2E8F0', 
        marginBottom: '10px',
        flexWrap: 'wrap', 
        gap: '4px' 
      }}>
        <span>
          {facility.verification_status === 'verified' ? (
            <span style={{ color: '#166534', fontWeight: 600 }}>✓ Verified on {formattedVerifiedDate}</span>
          ) : facility.verification_status === 'partial' ? (
            <span style={{ color: '#B45309', fontWeight: 600 }}>⚠️ Partial Verification</span>
          ) : (
            <span style={{ color: '#64717D', fontStyle: 'italic' }}>Unverified Registry Record</span>
          )}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {primarySourceUrl && (
            <a 
              href={primarySourceUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ color: '#0D9488', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}
              title="Official registry or hospital source"
            >
              <span>Source</span>
              <ExternalLink size={10} />
            </a>
          )}
          {facility.website_url && (
            <a 
              href={facility.website_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ color: '#12304A', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '2px', fontWeight: 500 }}
              title="Official hospital website"
            >
              <span>Website</span>
              <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>

      {/* 6. Pinned Action Buttons Bar */}
      <div style={{ 
        marginTop: 'auto', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '6px', 
        paddingTop: '10px', 
        borderTop: '1px solid #E2E8F0', 
        flexWrap: 'wrap' 
      }}>
        {/* Book Appointment (Primary Button) */}
        {onBookAppointment && (
          <button
            onClick={() => onBookAppointment(facility)}
            className="btn btn-primary btn-sm"
            style={{ 
              flex: '1.2', 
              minWidth: '120px', 
              padding: '7px 10px', 
              fontSize: '0.8rem', 
              fontWeight: 700,
              backgroundColor: '#0D9488',
              color: 'white'
            }}
          >
            <Calendar size={13} />
            <span>Book</span>
          </button>
        )}

        {/* View Details */}
        <button
          onClick={() => onViewDetails(facility)}
          className="btn btn-secondary btn-sm"
          style={{ padding: '7px 9px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          title="View full facility credentials and details"
        >
          <Info size={13} />
          <span>Details</span>
        </button>

        {/* Call Hospital (if phone exists) */}
        {facility.phone && (
          <a
            href={`tel:${facility.phone}`}
            className="btn btn-secondary btn-sm"
            style={{ 
              padding: '7px 9px', 
              fontSize: '0.78rem', 
              textDecoration: 'none', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '4px',
              color: '#12304A'
            }}
            title={`Call ${facility.phone}`}
          >
            <Phone size={13} color="#0D9488" />
            <span>Call</span>
          </a>
        )}

        {/* Directions */}
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary btn-sm"
          style={{ 
            padding: '7px 9px', 
            fontSize: '0.78rem', 
            textDecoration: 'none', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '4px',
            color: '#12304A'
          }}
          title="Open directions in Google Maps"
        >
          <Navigation size={13} color="#0D9488" />
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
            padding: '7px 9px', 
            fontSize: '0.78rem',
            backgroundColor: isCompared ? '#E7F3EF' : '#FFFFFF',
            borderColor: isCompared ? '#0D9488' : '#CBD5E1',
            color: isCompared ? '#0D9488' : '#12304A'
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
