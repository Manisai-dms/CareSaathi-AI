import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSearch } from '../context/SearchContext';
import { 
  MapPin, 
  Search, 
  Navigation, 
  Filter, 
  Layers, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  ExternalLink,
  Map as MapIcon,
  List as ListIcon
} from 'lucide-react';
import { api, FacilityDTO, TreatmentDTO } from '../services/api';
import { HospitalCard } from '../components/HospitalCard';
import { HospitalMap } from '../components/HospitalMap';
import { HospitalDetailModal } from '../components/HospitalDetailModal';

export const HospitalDiscoveryPage: React.FC = () => {
  const { t } = useLanguage();
  const { searchState, setLocation, setTreatment } = useSearch();

  const [facilities, setFacilities] = useState<FacilityDTO[]>([]);
  const [treatmentsList, setTreatmentsList] = useState<TreatmentDTO[]>([]);
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string>(searchState.treatmentId || 'knee_replacement');
  const [city, setCity] = useState<string>(searchState.city || 'Hyderabad');
  const [locality, setLocality] = useState<string>(searchState.locality || '');
  const [pinCode, setPinCode] = useState<string>('');
  
  // Geolocation
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Filters & Sorting
  const [ownershipFilter, setOwnershipFilter] = useState<string>('All');
  const [schemeFilter, setSchemeFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('nearest');
  const [viewMode, setViewMode] = useState<'split' | 'list'>('split');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Modal
  const [selectedFacilityForModal, setSelectedFacilityForModal] = useState<FacilityDTO | null>(null);

  useEffect(() => {
    api.getTreatments().then(setTreatmentsList).catch(console.error);
    fetchFacilities();
  }, [selectedTreatmentId, city, locality, pinCode, ownershipFilter, schemeFilter, sortBy, userCoords]);

  const fetchFacilities = async () => {
    setIsLoading(true);
    try {
      const data = await api.getFacilities({
        lat: userCoords?.lat,
        lng: userCoords?.lng,
        city: city,
        locality: locality || undefined,
        pin: pinCode || undefined,
        treatment_id: selectedTreatmentId,
        ownership: ownershipFilter,
        scheme: schemeFilter,
        sort: sortBy
      });
      setFacilities(data);
    } catch (err) {
      console.error("Failed to load facilities", err);
    } finally {
      setIsLoading(false);
    }
  };

  const requestDeviceLocation = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser. Please enter location manually.");
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === 1) {
          setGpsError("Location permission denied. Continuing with manual city / locality coordinates.");
        } else {
          setGpsError("Unable to retrieve device position. Using Hyderabad center.");
        }
        // Fallback to central Hyderabad coordinates
        setUserCoords({ lat: 17.4399, lng: 78.4806 });
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="section" style={{ paddingTop: '30px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <div className="badge badge-teal" style={{ marginBottom: '8px' }}>
              Spatial Facility Discovery & Verification
            </div>
            <h1 style={{ fontSize: '2.2rem', color: 'var(--color-navy)', marginBottom: '8px' }}>
              Nearby Healthcare Discovery
            </h1>
            <p style={{ color: 'var(--color-text-grey)', fontSize: '1.05rem', maxWidth: '780px' }}>
              Locate verified healthcare institutions offering your treatment with spatial distance, ownership classifications, and active scheme empanelments.
            </p>
          </div>

          {/* GPS Button & View Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={requestDeviceLocation}
              className="btn btn-secondary"
              disabled={gpsLoading}
              title="Use current GPS location"
            >
              {gpsLoading ? (
                <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Navigation size={16} color="var(--color-teal)" />
              )}
              <span>{userCoords ? "GPS Active" : "Use My Location"}</span>
            </button>

            {/* View Mode Toggle */}
            <div style={{
              display: 'flex',
              backgroundColor: 'var(--color-white)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              padding: '2px'
            }}>
              <button
                onClick={() => setViewMode('split')}
                style={{
                  padding: '6px 12px',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: viewMode === 'split' ? 'var(--color-mint)' : 'transparent',
                  color: viewMode === 'split' ? 'var(--color-teal-dark)' : 'var(--color-navy)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.85rem'
                }}
              >
                <MapIcon size={14} />
                <span>Map + List</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '6px 12px',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: viewMode === 'list' ? 'var(--color-mint)' : 'transparent',
                  color: viewMode === 'list' ? 'var(--color-teal-dark)' : 'var(--color-navy)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.85rem'
                }}
              >
                <ListIcon size={14} />
                <span>List Only</span>
              </button>
            </div>
          </div>
        </div>

        {/* GPS Error or Manual Fallback Notice */}
        {gpsError && (
          <div style={{
            backgroundColor: '#FEF3C7',
            border: '1px solid #FCD34D',
            borderRadius: 'var(--radius-md)',
            padding: '10px 16px',
            fontSize: '0.85rem',
            color: '#92400E',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertTriangle size={16} />
            <span>{gpsError}</span>
          </div>
        )}

        {/* Filters Bar */}
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: 'var(--radius-lg)',
          padding: '18px 20px',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '28px'
        }}>
          <div className="grid-4" style={{ gap: '14px', alignItems: 'flex-end' }}>
            {/* Treatment Filter */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Procedure / Treatment:</label>
              <select
                className="form-select"
                value={selectedTreatmentId}
                onChange={e => setSelectedTreatmentId(e.target.value)}
              >
                {treatmentsList.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Locality Search */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">City / Locality:</label>
              <select
                className="form-select"
                value={locality}
                onChange={e => setLocality(e.target.value)}
              >
                <option value="">All Hyderabad Localities</option>
                <option value="Kukatpally">Kukatpally</option>
                <option value="Banjara Hills">Banjara Hills</option>
                <option value="Jubilee Hills">Jubilee Hills</option>
                <option value="Secunderabad">Secunderabad</option>
                <option value="HITEC City">HITEC City</option>
                <option value="Gachibowli">Gachibowli</option>
                <option value="Somajiguda">Somajiguda</option>
                <option value="Musheerabad">Musheerabad</option>
                <option value="Hyderguda">Hyderguda</option>
              </select>
            </div>

            {/* Ownership Filter */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Ownership Type:</label>
              <select
                className="form-select"
                value={ownershipFilter}
                onChange={e => setOwnershipFilter(e.target.value)}
              >
                <option value="All">All Facilities</option>
                <option value="Government">Government Hospitals</option>
                <option value="Charitable/Trust">Charitable / Trust</option>
                <option value="Private">Private Hospitals</option>
              </select>
            </div>

            {/* Sorting */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Sort By:</label>
              <select
                className="form-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="nearest">Nearest Distance (km)</option>
                <option value="lowest_cost">Lowest Estimated Cost (₹)</option>
                <option value="rating">Patient Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {viewMode === 'split' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
            <style>{`
              @media (max-width: 992px) {
                div[style*="gridTemplateColumns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
              }
            `}</style>
            {/* Left: Map */}
            <div style={{ position: 'sticky', top: '90px' }}>
              <HospitalMap
                facilities={facilities}
                userLat={userCoords?.lat || 17.4399}
                userLng={userCoords?.lng || 78.4806}
                onSelectFacility={fac => setSelectedFacilityForModal(fac)}
              />
              <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--color-text-grey)' }}>
                Showing {facilities.length} verified hospital locations with spatial Haversine distance calculations.
              </div>
            </div>

            {/* Right: Hospital Cards List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {facilities.map(fac => (
                <HospitalCard
                  key={fac.id}
                  facility={fac}
                  activeTreatmentId={selectedTreatmentId}
                  onViewDetails={f => setSelectedFacilityForModal(f)}
                />
              ))}
            </div>
          </div>
        ) : (
          /* List Only View (Grid 3) */
          <div className="grid-3">
            {facilities.map(fac => (
              <HospitalCard
                key={fac.id}
                facility={fac}
                activeTreatmentId={selectedTreatmentId}
                onViewDetails={f => setSelectedFacilityForModal(f)}
              />
            ))}
          </div>
        )}

        {/* Modal */}
        {selectedFacilityForModal && (
          <HospitalDetailModal
            facility={selectedFacilityForModal}
            onClose={() => setSelectedFacilityForModal(null)}
            onEstimateHere={() => setSelectedFacilityForModal(null)}
          />
        )}
      </div>
    </div>
  );
};
