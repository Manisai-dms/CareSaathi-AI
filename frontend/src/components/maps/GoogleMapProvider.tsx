import React, { useEffect, useRef, useState } from 'react';
import { MapCommonProps, getFacilityCostBand, getCostBandColor } from './types';
import { RefreshCw, Navigation, AlertCircle } from 'lucide-react';

const HEALTHCARE_MAP_STYLES = [
  { featureType: 'all', elementType: 'geometry.fill', stylers: [{ weight: '2.00' }] },
  { featureType: 'all', elementType: 'geometry.stroke', stylers: [{ color: '#9c9c9c' }] },
  { featureType: 'all', elementType: 'labels.text', stylers: [{ visibility: 'on' }] },
  { featureType: 'landscape', elementType: 'all', stylers: [{ color: '#f2f2f2' }] },
  { featureType: 'landscape', elementType: 'geometry.fill', stylers: [{ color: '#F8FAF9' }] },
  { featureType: 'poi', elementType: 'all', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.medical', elementType: 'all', stylers: [{ visibility: 'on' }] },
  { featureType: 'poi.medical', elementType: 'geometry.fill', stylers: [{ color: '#E7F3EF' }] },
  { featureType: 'road', elementType: 'all', stylers: [{ saturation: -100 }, { lightness: 45 }] },
  { featureType: 'road.highway', elementType: 'all', stylers: [{ visibility: 'simplified' }] },
  { featureType: 'water', elementType: 'all', stylers: [{ color: '#dbeafe' }, { visibility: 'on' }] }
];

export const GoogleMapProvider: React.FC<MapCommonProps & { apiKey: string; onError: () => void }> = ({
  facilities,
  userLat = 17.4399,
  userLng = 78.4806,
  radiusKm = 10,
  selectedFacilityId,
  hoveredFacilityId,
  onSelectFacility,
  onHoverFacility,
  onBookAppointment,
  onViewDetails,
  onSearchThisArea,
  apiKey,
  onError,
  height = '480px'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const circleRef = useRef<google.maps.Circle | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [showSearchThisArea, setShowSearchThisArea] = useState(false);
  const [currentCenter, setCurrentCenter] = useState<{ lat: number; lng: number }>({ lat: userLat, lng: userLng });

  // Load Google Maps API script
  useEffect(() => {
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      return;
    }

    const scriptId = 'google-maps-script-caresaathi';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      script.onerror = () => {
        console.warn('Google Maps script failed to load. Falling back to Leaflet.');
        onError();
      };
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', () => setMapLoaded(true));
      script.addEventListener('error', () => onError());
    }
  }, [apiKey]);

  // Initialize Map instance
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current) return;

    try {
      if (!mapInstanceRef.current) {
        const map = new google.maps.Map(mapContainerRef.current, {
          center: { lat: userLat, lng: userLng },
          zoom: 12,
          styles: HEALTHCARE_MAP_STYLES,
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true
        });

        infoWindowRef.current = new google.maps.InfoWindow();

        // Listen for drag to show "Search this area"
        map.addListener('dragend', () => {
          const center = map.getCenter();
          if (center) {
            setCurrentCenter({ lat: center.lat(), lng: center.lng() });
            setShowSearchThisArea(true);
          }
        });

        mapInstanceRef.current = map;
      }
    } catch (e) {
      console.error('Error initializing Google Map', e);
      onError();
    }
  }, [mapLoaded]);

  // Update distance radius circle
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google) return;

    if (circleRef.current) {
      circleRef.current.setMap(null);
    }

    circleRef.current = new google.maps.Circle({
      strokeColor: '#2C8C83',
      strokeOpacity: 0.8,
      strokeWeight: 1.5,
      fillColor: '#2C8C83',
      fillOpacity: 0.05,
      map: mapInstanceRef.current,
      center: { lat: userLat, lng: userLng },
      radius: radiusKm * 1000
    });
  }, [mapLoaded, userLat, userLng, radiusKm]);

  // Render & sync custom markers
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google) return;

    // Clear previous markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current.clear();

    const map = mapInstanceRef.current;

    // User Location Pin
    new google.maps.Marker({
      position: { lat: userLat, lng: userLng },
      map: map,
      title: 'Your Location',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 7,
        fillColor: '#2563EB',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 3
      }
    });

    // Hospital Facility Markers
    facilities.forEach(fac => {
      const isGov = fac.ownership === 'Government';
      const pinColor = isGov ? '#12304A' : '#2C8C83';
      const costBand = getFacilityCostBand(fac);
      const dotColor = getCostBandColor(costBand);

      // SVG Pin with cost dot
      const svgIcon = {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
            <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26s18-12.5 18-26C36 8.06 27.94 0 18 0z" fill="${pinColor}" stroke="#FFFFFF" stroke-width="2"/>
            <circle cx="18" cy="16" r="10" fill="#FFFFFF"/>
            <text x="18" y="21" font-size="12" font-family="Arial" font-weight="bold" text-anchor="middle" fill="${pinColor}">H</text>
            <circle cx="28" cy="8" r="5" fill="${dotColor}" stroke="#FFFFFF" stroke-width="1.5"/>
          </svg>
        `)}`,
        scaledSize: new google.maps.Size(36, 44),
        anchor: new google.maps.Point(18, 44)
      };

      const marker = new google.maps.Marker({
        position: { lat: fac.lat, lng: fac.lng },
        map: map,
        title: fac.name,
        icon: svgIcon,
        zIndex: selectedFacilityId === fac.id ? 100 : 10
      });

      marker.addListener('click', () => {
        onSelectFacility(fac);
        openInfoWindow(fac, marker);
      });

      if (onHoverFacility) {
        marker.addListener('mouseover', () => onHoverFacility(fac.id));
        marker.addListener('mouseout', () => onHoverFacility(null));
      }

      markersRef.current.set(fac.id, marker);
    });

    // Helper: open rich InfoWindow on pin click
    const openInfoWindow = (fac: any, markerInstance: google.maps.Marker) => {
      if (!infoWindowRef.current) return;

      const initials = fac.initials || fac.name.slice(0, 3).toUpperCase();
      const costStr = fac.estimated_cost_min === 0 
        ? 'Free / 100% Scheme Subsidized' 
        : `₹${fac.estimated_cost_min?.toLocaleString('en-IN')} - ₹${fac.estimated_cost_max?.toLocaleString('en-IN')}`;

      const contentString = document.createElement('div');
      contentString.style.maxWidth = '300px';
      contentString.style.fontFamily = 'Inter, sans-serif';
      contentString.style.padding = '4px';

      contentString.innerHTML = `
        <div style="font-weight: 700; font-size: 15px; color: #12304A; margin-bottom: 4px;">
          ${fac.name}
        </div>
        <div style="font-size: 12px; color: #64717D; margin-bottom: 8px;">
          ${fac.locality ? `${fac.locality}, ` : ''}${fac.city} ${fac.distance_km ? `• 📍 ${fac.distance_km} km away` : ''}
        </div>
        <div style="background-color: #E7F3EF; border-radius: 6px; padding: 6px 10px; margin-bottom: 10px;">
          <div style="font-size: 11px; color: #2C8C83; font-weight: 600;">ESTIMATED COST</div>
          <div style="font-size: 13px; font-weight: 700; color: #12304A;">${costStr}</div>
        </div>
        <div style="display: flex; gap: 6px;">
          <button id="iw-book-btn" style="flex: 1; background-color: #2C8C83; color: white; border: none; padding: 7px 10px; border-radius: 6px; font-weight: 600; font-size: 12px; cursor: pointer;">
            📅 Book
          </button>
          <button id="iw-details-btn" style="flex: 1; background-color: #F8FAF9; color: #12304A; border: 1px solid #E2E8F0; padding: 7px 10px; border-radius: 6px; font-weight: 600; font-size: 12px; cursor: pointer;">
            Details
          </button>
          <a href="https://www.google.com/maps/dir/?api=1&destination=${fac.lat},${fac.lng}" target="_blank" rel="noopener noreferrer" style="background-color: #F8FAF9; color: #12304A; border: 1px solid #E2E8F0; padding: 7px 10px; border-radius: 6px; font-weight: 600; font-size: 12px; text-decoration: none; display: flex; align-items: center;">
            🗺️
          </a>
        </div>
      `;

      // Attach button events
      contentString.querySelector('#iw-book-btn')?.addEventListener('click', () => {
        onBookAppointment(fac);
        infoWindowRef.current?.close();
      });

      contentString.querySelector('#iw-details-btn')?.addEventListener('click', () => {
        onViewDetails(fac);
        infoWindowRef.current?.close();
      });

      infoWindowRef.current.setContent(contentString);
      infoWindowRef.current.open(map, markerInstance);
    };

  }, [facilities, mapLoaded, userLat, userLng]);

  // Highlight marker when card is hovered or selected
  useEffect(() => {
    const activeId = hoveredFacilityId || selectedFacilityId;
    if (!activeId || !mapInstanceRef.current) return;

    const marker = markersRef.current.get(activeId);
    if (marker) {
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(() => marker.setAnimation(null), 750);
    }
  }, [hoveredFacilityId, selectedFacilityId]);

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat: userLat, lng: userLng });
      mapInstanceRef.current.setZoom(12);
      setShowSearchThisArea(false);
    }
  };

  const handleTriggerSearchArea = () => {
    if (onSearchThisArea) {
      onSearchThisArea(currentCenter.lat, currentCenter.lng);
    }
    setShowSearchThisArea(false);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating: Search This Area */}
      {showSearchThisArea && (
        <div style={{ position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
          <button
            onClick={handleTriggerSearchArea}
            className="btn btn-primary btn-sm"
            style={{
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              borderRadius: '50px',
              backgroundColor: '#12304A',
              color: 'white',
              fontSize: '0.85rem'
            }}
          >
            <RefreshCw size={14} />
            <span>Search this area</span>
          </button>
        </div>
      )}

      {/* Floating: Reset Location */}
      <button
        onClick={handleResetView}
        style={{
          position: 'absolute',
          bottom: '24px',
          right: '16px',
          zIndex: 10,
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '50px',
          padding: '8px 14px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          fontSize: '0.82rem',
          fontWeight: 600,
          color: '#12304A'
        }}
        title="Center map on your current location"
      >
        <Navigation size={14} color="#2C8C83" />
        <span>My Location</span>
      </button>

      {/* Google Attribution & Badge */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        zIndex: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(4px)',
        border: '1px solid #E2E8F0',
        borderRadius: '6px',
        padding: '3px 8px',
        fontSize: '0.72rem',
        fontWeight: 600,
        color: '#12304A',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <span>🗺️ Google Maps Live View</span>
      </div>
    </div>
  );
};
