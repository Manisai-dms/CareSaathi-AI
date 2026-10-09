import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapCommonProps, getFacilityCostBand, getCostBandColor } from './types';
import { Navigation, RefreshCw, Info } from 'lucide-react';

export const LeafletMapProvider: React.FC<MapCommonProps> = ({
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
  height = '480px'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const circlesLayerRef = useRef<L.LayerGroup | null>(null);

  const [showSearchThisArea, setShowSearchThisArea] = useState(false);
  const [currentCenter, setCurrentCenter] = useState<{ lat: number; lng: number }>({ lat: userLat, lng: userLng });

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLat, userLng],
        zoom: 12,
        scrollWheelZoom: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      circlesLayerRef.current = L.layerGroup().addTo(map);

      map.on('moveend', () => {
        const center = map.getCenter();
        setCurrentCenter({ lat: center.lat, lng: center.lng });
        setShowSearchThisArea(true);
      });

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([userLat, userLng], 12);
    }
  }, [userLat, userLng]);

  // Radius Circles
  useEffect(() => {
    if (!circlesLayerRef.current) return;
    circlesLayerRef.current.clearLayers();

    // User center marker
    const userMarker = L.circleMarker([userLat, userLng], {
      radius: 7,
      color: '#FFFFFF',
      weight: 2,
      fillColor: '#2563EB',
      fillOpacity: 1
    }).bindTooltip('Your Location', { direction: 'top' });

    circlesLayerRef.current.addLayer(userMarker);

    // Distance Radius Circle
    const radiusCircle = L.circle([userLat, userLng], {
      radius: radiusKm * 1000,
      color: '#2C8C83',
      weight: 1.5,
      dashArray: '5, 5',
      fillColor: '#2C8C83',
      fillOpacity: 0.05
    }).bindTooltip(`${radiusKm} km radius filter`, { permanent: false, direction: 'top' });

    circlesLayerRef.current.addLayer(radiusCircle);
  }, [userLat, userLng, radiusKm]);

  // Render Hospital Markers
  useEffect(() => {
    if (!markersLayerRef.current || !mapInstanceRef.current) return;
    markersLayerRef.current.clearLayers();

    facilities.forEach(fac => {
      const isGov = fac.ownership === 'Government';
      const pinColor = isGov ? '#12304A' : '#2C8C83';
      const costBand = getFacilityCostBand(fac);
      const dotColor = getCostBandColor(costBand);
      const isSelected = selectedFacilityId === fac.id || hoveredFacilityId === fac.id;

      const html = `
        <div style="
          position: relative;
          background-color: ${pinColor};
          width: ${isSelected ? '38px' : '32px'};
          height: ${isSelected ? '38px' : '32px'};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: 14px;
          border: 2px solid white;
          box-shadow: ${isSelected ? '0 0 0 4px #2C8C83, 0 4px 12px rgba(0,0,0,0.35)' : '0 2px 6px rgba(0,0,0,0.25)'};
          transition: transform 0.2s ease;
          cursor: pointer;
        ">
          🏥
          <span style="
            position: absolute;
            top: -2px;
            right: -2px;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background-color: ${dotColor};
            border: 1.5px solid white;
          "></span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'leaflet-custom-hosp-pin',
        html,
        iconSize: isSelected ? [38, 38] : [32, 32],
        iconAnchor: isSelected ? [19, 19] : [16, 16]
      });

      const marker = L.marker([fac.lat, fac.lng], { icon: customIcon });

      const costStr = fac.estimated_cost_min === 0 
        ? 'Free / 100% Scheme Subsidized' 
        : `₹${fac.estimated_cost_min?.toLocaleString('en-IN')} - ₹${fac.estimated_cost_max?.toLocaleString('en-IN')}`;

      // Custom HTML Popup
      const popupDiv = document.createElement('div');
      popupDiv.style.fontFamily = 'Inter, sans-serif';
      popupDiv.style.padding = '4px';
      popupDiv.style.minWidth = '220px';

      popupDiv.innerHTML = `
        <div style="font-weight: 700; font-size: 14px; color: #12304A; margin-bottom: 2px;">
          ${fac.name}
        </div>
        <div style="font-size: 12px; color: #64717D; margin-bottom: 8px;">
          ${fac.locality ? `${fac.locality}, ` : ''}${fac.city} ${fac.distance_km ? `• 📍 ${fac.distance_km} km` : ''}
        </div>
        <div style="background-color: #E7F3EF; border-radius: 6px; padding: 6px 8px; margin-bottom: 10px;">
          <div style="font-size: 10px; color: #2C8C83; font-weight: 600;">ESTIMATED TARIFF</div>
          <div style="font-size: 12px; font-weight: 700; color: #12304A;">${costStr}</div>
        </div>
        <div style="display: flex; gap: 6px;">
          <button id="l-book-${fac.id}" style="flex: 1; background-color: #2C8C83; color: white; border: none; padding: 6px 8px; border-radius: 6px; font-weight: 600; font-size: 11px; cursor: pointer;">
            📅 Book
          </button>
          <button id="l-details-${fac.id}" style="flex: 1; background-color: #F8FAF9; color: #12304A; border: 1px solid #E2E8F0; padding: 6px 8px; border-radius: 6px; font-weight: 600; font-size: 11px; cursor: pointer;">
            Details
          </button>
        </div>
      `;

      popupDiv.querySelector(`#l-book-${fac.id}`)?.addEventListener('click', () => {
        onBookAppointment(fac);
        mapInstanceRef.current?.closePopup();
      });

      popupDiv.querySelector(`#l-details-${fac.id}`)?.addEventListener('click', () => {
        onViewDetails(fac);
        mapInstanceRef.current?.closePopup();
      });

      marker.bindPopup(popupDiv);

      marker.on('click', () => {
        onSelectFacility(fac);
      });

      if (onHoverFacility) {
        marker.on('mouseover', () => onHoverFacility(fac.id));
        marker.on('mouseout', () => onHoverFacility(null));
      }

      markersLayerRef.current?.addLayer(marker);
    });
  }, [facilities, selectedFacilityId, hoveredFacilityId]);

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([userLat, userLng], 12);
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
        <div style={{ position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
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
          zIndex: 1000,
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

      {/* Leaflet Attribution & Fallback Badge */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(4px)',
        border: '1px solid #E2E8F0',
        borderRadius: '6px',
        padding: '4px 10px',
        fontSize: '0.74rem',
        fontWeight: 600,
        color: '#12304A',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <Info size={13} color="#2C8C83" />
        <span>OpenStreetMap View (Fallback mode)</span>
      </div>
    </div>
  );
};
