import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSearch } from '../context/SearchContext';
import { 
  MapPin, 
  Search, 
  Navigation, 
  Building2, 
  AlertTriangle, 
  RefreshCw,
  Map as MapIcon,
  List as ListIcon
} from 'lucide-react';
import { api, FacilityDTO, TreatmentDTO } from '../services/api';
import { HospitalCard } from '../components/HospitalCard';
import { HospitalDetailModal } from '../components/HospitalDetailModal';
import { HospitalMapContainer } from '../components/maps/HospitalMapContainer';
import { BookingModal } from '../components/BookingModal';

export const HospitalDiscoveryPage: React.FC = () => {
  const { t } = useLanguage();
  const { searchState } = useSearch();

  const [facilities, setFacilities] = useState<FacilityDTO[]>([]);
  const [treatmentsList, setTreatmentsList] = useState<TreatmentDTO[]>([]);
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string>(searchState.treatmentId || 'knee_replacement');
  const [city, setCity] = useState<string>(searchState.city || 'Hyderabad');
  const [locality, setLocality] = useState<string>(searchState.locality || '');
  const [pinCode, setPinCode] = useState<string>('');
  
  // Geolocation (Default to central Hyderabad)
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({ lat: 17.4399, lng: 78.4806 });
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsNotice, setGpsNotice] = useState<string | null>(null);

  // Filters & Sorting
  const [ownershipFilter, setOwnershipFilter] = useState<string>('All');
  const [schemeFilter, setSchemeFilter] = useState<string>('All');
  const [radiusKm, setRadiusKm] = useState<number>(15);
  const [sortBy, setSortBy] = useState<string>('nearest');
  const [viewMode, setViewMode] = useState<'split' | 'list' | 'map'>('split');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Interactive Map Sync
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
  const [hoveredFacilityId, setHoveredFacilityId] = useState<string | null>(null);

  // Modals
  const [selectedFacilityForModal, setSelectedFacilityForModal] = useState<FacilityDTO | null>(null);
  const [bookingFacility, setBookingFacility] = useState<FacilityDTO | null>(null);

  const cardListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getTreatments().then(setTreatmentsList).catch(console.error);
    fetchFacilities();
  }, [selectedTreatmentId, city, locality, pinCode, ownershipFilter, schemeFilter, sortBy, userCoords, radiusKm]);

  const fetchFacilities = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await api.getFacilities({
        lat: userCoords.lat,
        lng: userCoords.lng,
        city: city,
        locality: locality || undefined,
        pin: pinCode || undefined,
        treatment_id: selectedTreatmentId,
        ownership: ownershipFilter,
        scheme: schemeFilter,
        radius: radiusKm === 999 ? undefined : radiusKm,
        sort: sortBy
      });

      setFacilities(data);
    } catch (err: any) {
      console.error("Failed to load facilities", err);
      setLoadError("Unable to load hospitals right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const requestDeviceLocation = () => {
    if (!navigator.geolocation) {
      setGpsNotice("Geolocation is not supported by your browser. Please enter your locality or PIN code manually.");
      return;
    }

    setGpsLoading(true);
    setGpsNotice(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        setGpsLoading(false);
        setGpsNotice("Location updated from your GPS device.");
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === 1) {
          setGpsNotice("Location permission was denied. You can manually enter your locality or PIN code in the search field above.");
        } else {
          setGpsNotice("Unable to retrieve GPS coordinates. Defaulting to central Hyderabad.");
        }
      },
      { timeout: 8000 }
    );
  };

  const handleSelectFacilityFromMap = (fac: FacilityDTO) => {
    setSelectedFacilityId(fac.id);
    const cardEl = document.getElementById(`hospital-card-${fac.id}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSearchThisArea = (newLat: number, newLng: number) => {
    setUserCoords({ lat: newLat, lng: newLng });
  };

  return (
    <div className="section" style={{ paddingTop: '24px' }}>
      <div className="container">
        
        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '22px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-teal">Verified Healthcare Facilities</span>
              <span className="badge badge-navy">
                📍 Radius: {radiusKm === 999 ? 'All Distances' : `${radiusKm} km`}
              </span>
            </div>
            <h1 style={{ fontSize: '2.1rem', color: 'var(--color-navy)', marginBottom: '4px' }}>
              Find Nearby Hospitals & Care
            </h1>
            <p style={{ color: 'var(--color-text-grey)', fontSize: '0.96rem' }}>
              Discover verified hospitals in Hyderabad with authentic facility photographs, calculated distance, and empanelled scheme support.
            </p>
          </div>

          {/* View mode toggle */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ display: 'flex', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <button
                onClick={() => setViewMode('split')}
                style={{
                  padding: '7px 14px',
                  border: 'none',
                  backgroundColor: viewMode === 'split' ? '#2C8C83' : '#FFFFFF',
                  color: viewMode === 'split' ? 'white' : '#12304A',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600
                }}
              >
                <MapIcon size={14} />
                <span>Split View</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '7px 14px',
                  border: 'none',
                  backgroundColor: viewMode === 'list' ? '#2C8C83' : '#FFFFFF',
                  color: viewMode === 'list' ? 'white' : '#12304A',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600
                }}
              >
                <ListIcon size={14} />
                <span>List Only</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="card" style={{ padding: '16px', marginBottom: '22px', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
            
            {/* Procedure Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#12304A', marginBottom: '4px' }}>
                PROCEDURE / CARE
              </label>
              <select
                value={selectedTreatmentId}
                onChange={e => setSelectedTreatmentId(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
              >
                {treatmentsList.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Locality / Area / PIN Code */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#12304A', marginBottom: '4px' }}>
                LOCALITY OR PIN CODE
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={locality}
                  onChange={e => {
                    const val = e.target.value;
                    setLocality(val);
                    if (/^\d{6}$/.test(val.trim())) {
                      setPinCode(val.trim());
                    } else {
                      setPinCode('');
                    }
                  }}
                  placeholder="e.g. Gachibowli, Secunderabad, 500082"
                  style={{ width: '100%', padding: '8px 10px 8px 30px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
                <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '11px' }} />
              </div>
            </div>

            {/* Hospital Category */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#12304A', marginBottom: '4px' }}>
                HOSPITAL CATEGORY
              </label>
              <select
                value={ownershipFilter}
                onChange={e => setOwnershipFilter(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
              >
                <option value="All">All Hospital Types</option>
                <option value="Government">Government Hospitals</option>
                <option value="Private">Private Hospitals</option>
                <option value="Charitable/Trust">Charitable / Trust</option>
              </select>
            </div>

            {/* Distance Radius */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#12304A', marginBottom: '4px' }}>
                DISTANCE RADIUS
              </label>
              <select
                value={radiusKm}
                onChange={e => setRadiusKm(Number(e.target.value))}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
              >
                <option value={5}>Within 5 km</option>
                <option value={10}>Within 10 km</option>
                <option value={20}>Within 20 km</option>
                <option value={50}>Within 50 km</option>
                <option value={999}>All Hospitals (No Limit)</option>
              </select>
            </div>

            {/* Device GPS Location Button */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#12304A', marginBottom: '4px' }}>
                GPS LOCATION
              </label>
              <button
                onClick={requestDeviceLocation}
                disabled={gpsLoading}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', padding: '8px 10px', fontSize: '0.82rem', height: '37px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Navigation size={14} color="#2C8C83" />
                <span>{gpsLoading ? 'Locating...' : 'Use My GPS'}</span>
              </button>
            </div>
          </div>

          {gpsNotice && (
            <div style={{ marginTop: '10px', color: '#12304A', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#F8FAF9', padding: '6px 10px', borderRadius: '4px' }}>
              <MapPin size={13} color="#2C8C83" />
              <span>{gpsNotice}</span>
            </div>
          )}
        </div>

        {/* Layout: Interactive Split Map + Cards List */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: viewMode === 'split' ? 'minmax(0, 1.15fr) minmax(0, 0.85fr)' : '1fr',
          gap: '24px',
          alignItems: 'start'
        }}>
          
          {/* Left Column: Hospital Cards Grid */}
          <div ref={cardListRef} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.9rem', color: '#64717D' }}>
                Showing <strong>{facilities.length}</strong> matching verified hospitals
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: '#64717D' }}>Sort:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  style={{ border: '1px solid #CBD5E1', borderRadius: '4px', padding: '4px 8px', fontSize: '0.8rem' }}
                >
                  <option value="nearest">Nearest Distance</option>
                  <option value="lowest_cost">Lowest Estimated Tariff</option>
                  <option value="rating">Highest Verified Rating</option>
                </select>
              </div>
            </div>

            {/* Error State with Retry Button */}
            {loadError ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '48px 24px', 
                backgroundColor: '#FFFFFF', 
                borderRadius: '16px', 
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(18, 48, 74, 0.05)'
              }}>
                <AlertTriangle size={36} color="#D97706" style={{ marginBottom: '12px' }} />
                <h3 style={{ fontSize: '1.2rem', color: '#12304A', marginBottom: '8px' }}>
                  {loadError}
                </h3>
                <p style={{ color: '#64717D', fontSize: '0.88rem', marginBottom: '18px' }}>
                  Unable to connect to the hospital directory. Please check your network and retry.
                </p>
                <button 
                  onClick={fetchFacilities} 
                  className="btn btn-primary btn-sm" 
                  style={{ padding: '8px 22px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <RefreshCw size={14} />
                  <span>Retry</span>
                </button>
              </div>
            ) : isLoading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#64717D' }}>
                <RefreshCw size={24} className="spin" style={{ margin: '0 auto 10px', display: 'block', color: '#2C8C83' }} />
                <span>Loading verified hospitals...</span>
              </div>
            ) : facilities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                <Building2 size={40} color="#94A3B8" style={{ marginBottom: '10px' }} />
                <h3 style={{ fontSize: '1.2rem', color: '#12304A', marginBottom: '6px' }}>No Facilities Found in Selected Radius</h3>
                <p style={{ color: '#64717D', fontSize: '0.88rem' }}>Try expanding your distance radius filter or selecting "All Hospital Types".</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'split' ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '18px' }}>
                {facilities.map(fac => (
                  <div
                    key={fac.id}
                    onMouseEnter={() => setHoveredFacilityId(fac.id)}
                    onMouseLeave={() => setHoveredFacilityId(null)}
                    style={{
                      transform: hoveredFacilityId === fac.id ? 'translateY(-2px)' : 'none',
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    <HospitalCard
                      facility={fac}
                      activeTreatmentId={selectedTreatmentId}
                      userLat={userCoords.lat}
                      userLng={userCoords.lng}
                      onViewDetails={setSelectedFacilityForModal}
                      onBookAppointment={setBookingFacility}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Interactive Map */}
          {viewMode === 'split' && (
            <div style={{
              position: 'sticky',
              top: '90px',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid var(--color-border)',
              padding: '12px',
              boxShadow: '0 2px 12px rgba(18, 48, 74, 0.08)'
            }}>
              <HospitalMapContainer
                facilities={facilities}
                userLat={userCoords.lat}
                userLng={userCoords.lng}
                radiusKm={radiusKm === 999 ? 30 : radiusKm}
                selectedFacilityId={selectedFacilityId}
                hoveredFacilityId={hoveredFacilityId}
                onSelectFacility={handleSelectFacilityFromMap}
                onHoverFacility={setHoveredFacilityId}
                onBookAppointment={setBookingFacility}
                onViewDetails={setSelectedFacilityForModal}
                onSearchThisArea={handleSearchThisArea}
                height="620px"
              />
            </div>
          )}

        </div>
      </div>

      {/* Hospital Detail Modal */}
      {selectedFacilityForModal && (
        <HospitalDetailModal
          facility={selectedFacilityForModal}
          onClose={() => setSelectedFacilityForModal(null)}
          onEstimateHere={(fac) => {
            window.location.hash = `#estimate?treatment=${selectedTreatmentId}&hospital=${fac.id}`;
          }}
          onBookAppointment={(fac) => {
            setSelectedFacilityForModal(null);
            setBookingFacility(fac);
          }}
        />
      )}

      {/* Appointment Booking Modal */}
      {bookingFacility && (
        <BookingModal
          isOpen={Boolean(bookingFacility)}
          facility={bookingFacility}
          treatmentName={treatmentsList.find(t => t.id === selectedTreatmentId)?.name}
          onClose={() => setBookingFacility(null)}
        />
      )}
    </div>
  );
};
