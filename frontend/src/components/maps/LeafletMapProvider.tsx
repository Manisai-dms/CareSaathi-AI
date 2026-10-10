import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { MapCommonProps, getFacilityCostBand, getCostBandColor } from './types';
import { Navigation, RefreshCw, Layers } from 'lucide-react';

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
  height = '100%'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);

  const [currentZoom, setCurrentZoom] = useState<number>(12);
  const [showSearchThisArea, setShowSearchThisArea] = useState(false);
  const [currentCenter, setCurrentCenter] = useState<{ lat: number; lng: number }>({ lat: userLat, lng: userLng });
  const [usingFallbackTiles, setUsingFallbackTiles] = useState(false);

  // Check prefers-reduced-motion
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Helper for pin color by facility type
  const getPinColor = (fac: any) => {
    if (fac.facility_class === 'Premium') return '#7C3AED'; // Purple
    if (fac.ownership === 'Government') return '#0D9488'; // Teal
    if (fac.ownership === 'Charitable/Trust') return '#D97706'; // Amber
    return '#2563EB'; // Blue
  };

  const getPinLabel = (fac: any) => {
    if (fac.facility_class === 'Premium') return 'Premium';
    if (fac.ownership === 'Government') return 'Govt';
    if (fac.ownership === 'Charitable/Trust') return 'Charitable';
    return 'Private';
  };

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLat, userLng],
        zoom: 12,
        scrollWheelZoom: true,
        zoomControl: false // Custom placement
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      // OpenStreetMap clean basemap fallback
      const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
        maxZoom: 18
      });
      osmLayer.addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      userLayerRef.current = L.layerGroup().addTo(map);

      map.on('zoomend', () => {
        setCurrentZoom(map.getZoom());
      });

      map.on('moveend', () => {
        const center = map.getCenter();
        setCurrentCenter({ lat: center.lat, lng: center.lng });
        setShowSearchThisArea(true);
      });

      mapInstanceRef.current = map;
    }

    // Auto-fit bounds on initial load if facilities exist
    if (facilities.length > 0 && mapInstanceRef.current) {
      const validPoints = facilities
        .filter(f => f.lat && f.lng)
        .map(f => [f.lat, f.lng] as [number, number]);
      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(validPoints);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    }
  }, []);

  // 2. Render User Location (Pulsing Dot + Radius Circle)
  useEffect(() => {
    if (!userLayerRef.current || !mapInstanceRef.current) return;
    userLayerRef.current.clearLayers();

    // Pulsing User Location Marker
    const userPulseHtml = `
      <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
        <div style="
          position: absolute;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(13, 148, 136, 0.35);
          animation: caresaathiPulse 2s infinite ease-out;
        "></div>
        <div style="
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #0D9488;
          border: 2.5px solid #FFFFFF;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
          z-index: 2;
        "></div>
      </div>
      <style>
        @keyframes caresaathiPulse {
          0% { transform: scale(0.6); opacity: 0.9; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      </style>
    `;

    const userDivIcon = L.divIcon({
      className: 'caresaathi-user-pin',
      html: userPulseHtml,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const userMarker = L.marker([userLat, userLng], { icon: userDivIcon })
      .bindTooltip('<b>Your Selected Location</b>', { direction: 'top', offset: [0, -10] });

    userLayerRef.current.addLayer(userMarker);

    // Soft Distance Radius Circle
    if (radiusKm && radiusKm < 999) {
      const radiusCircle = L.circle([userLat, userLng], {
        radius: radiusKm * 1000,
        color: '#0D9488',
        weight: 1.5,
        dashArray: '5, 5',
        fillColor: '#0D9488',
        fillOpacity: 0.04
      }).bindTooltip(`${radiusKm} km search radius`, { permanent: false, direction: 'top' });

      userLayerRef.current.addLayer(radiusCircle);
    }
  }, [userLat, userLng, radiusKm]);

  // 3. Render Route Line to Selected Facility
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (routeLayerRef.current) {
      mapInstanceRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    if (selectedFacilityId) {
      const selectedFac = facilities.find(f => f.id === selectedFacilityId);
      if (selectedFac && selectedFac.lat && selectedFac.lng) {
        routeLayerRef.current = L.polyline(
          [[userLat, userLng], [selectedFac.lat, selectedFac.lng]],
          {
            color: '#0D9488',
            weight: 3,
            dashArray: '6, 6',
            opacity: 0.8
          }
        ).addTo(mapInstanceRef.current);
      }
    }
  }, [selectedFacilityId, facilities, userLat, userLng]);

  // 4. Render Markers with Clustering when Zoomed Out (< 12)
  useEffect(() => {
    if (!markersLayerRef.current || !mapInstanceRef.current) return;
    markersLayerRef.current.clearLayers();

    const isZoomedOut = currentZoom < 11;

    // Simple Grid-Based Clustering when Zoomed Out
    if (isZoomedOut) {
      const clusters: { [key: string]: { latSum: number; lngSum: number; items: any[] } } = {};
      const gridSize = 0.08; // ~8km cluster grid

      facilities.forEach(fac => {
        if (!fac.lat || !fac.lng) return;
        const gridKey = `${Math.floor(fac.lat / gridSize)}_${Math.floor(fac.lng / gridSize)}`;
        if (!clusters[gridKey]) {
          clusters[gridKey] = { latSum: 0, lngSum: 0, items: [] };
        }
        clusters[gridKey].latSum += fac.lat;
        clusters[gridKey].lngSum += fac.lng;
        clusters[gridKey].items.push(fac);
      });

      Object.values(clusters).forEach(cluster => {
        const count = cluster.items.length;
        const centerLat = cluster.latSum / count;
        const centerLng = cluster.lngSum / count;

        if (count === 1) {
          renderIndividualPin(cluster.items[0]);
        } else {
          // Render Cluster Badge
          const clusterHtml = `
            <div style="
              width: 38px;
              height: 38px;
              border-radius: 50%;
              background: linear-gradient(135deg, #12304A 0%, #0D9488 100%);
              border: 2px solid white;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 800;
              font-size: 13px;
              box-shadow: 0 4px 12px rgba(18, 48, 74, 0.35);
              cursor: pointer;
              transition: transform 0.2s ease;
            ">
              ${count}
            </div>
          `;

          const clusterIcon = L.divIcon({
            className: 'caresaathi-cluster-pin',
            html: clusterHtml,
            iconSize: [38, 38],
            iconAnchor: [19, 19]
          });

          const clusterMarker = L.marker([centerLat, centerLng], { icon: clusterIcon });
          clusterMarker.on('click', () => {
            if (mapInstanceRef.current) {
              const bounds = L.latLngBounds(cluster.items.map(i => [i.lat, i.lng]));
              mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
            }
          });

          clusterMarker.bindTooltip(`${count} Hospitals in this area (click to zoom)`, { direction: 'top' });
          markersLayerRef.current?.addLayer(clusterMarker);
        }
      });
    } else {
      // Zoom >= 11: Render all individual pins
      facilities.forEach(fac => {
        renderIndividualPin(fac);
      });
    }

    function renderIndividualPin(fac: any) {
      if (!fac.lat || !fac.lng) return;

      const pinColor = getPinColor(fac);
      const isSelected = selectedFacilityId === fac.id;
      const isHovered = hoveredFacilityId === fac.id;
      const size = isSelected ? 42 : isHovered ? 38 : 32;

      const html = `
        <div style="
          position: relative;
          background-color: ${pinColor};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: ${size > 36 ? '17px' : '14px'};
          border: 2.5px solid white;
          box-shadow: ${isSelected 
            ? `0 0 0 4px ${pinColor}55, 0 6px 16px rgba(0,0,0,0.4)` 
            : isHovered 
              ? `0 0 0 3px ${pinColor}44, 0 4px 12px rgba(0,0,0,0.3)` 
              : '0 2px 8px rgba(0,0,0,0.22)'};
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
        ">
          🏥
          ${fac.verification_status === 'verified' ? `
            <span style="
              position: absolute;
              top: -3px;
              right: -3px;
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background-color: #10B981;
              border: 1.5px solid white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 8px;
              font-weight: 900;
            ">✓</span>
          ` : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'leaflet-custom-hosp-pin',
        html,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
      });

      const marker = L.marker([fac.lat, fac.lng], { icon: customIcon });

      // Driving time approximation
      const driveTime = fac.distance_km ? Math.round(fac.distance_km * 2.2 + 3) : null;
      const tariffText = fac.tariff_detail?.type === 'published'
        ? `₹${fac.estimated_cost_min?.toLocaleString('en-IN')} - ₹${fac.estimated_cost_max?.toLocaleString('en-IN')}`
        : fac.estimated_cost_min === 0
          ? 'Free / 100% Scheme Subsidized'
          : fac.estimated_cost_min
            ? `₹${fac.estimated_cost_min?.toLocaleString('en-IN')} - ₹${fac.estimated_cost_max?.toLocaleString('en-IN')}`
            : 'Tariff not published, contact hospital';

      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${fac.lat},${fac.lng}`;

      // Custom HTML Popup
      const popupDiv = document.createElement('div');
      popupDiv.style.fontFamily = 'Inter, -apple-system, sans-serif';
      popupDiv.style.padding = '4px';
      popupDiv.style.minWidth = '240px';

      popupDiv.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
          <span style="
            background-color: ${pinColor}18;
            color: ${pinColor};
            font-size: 10px;
            font-weight: 700;
            padding: 2px 7px;
            border-radius: 12px;
            border: 1px solid ${pinColor}33;
          ">
            ${getPinLabel(fac)}
          </span>
          ${fac.rating ? `
            <span style="font-size: 11px; font-weight: 700; color: #D97706; display: flex; align-items: center; gap: 2px;">
              ★ ${Number(fac.rating).toFixed(1)}
            </span>
          ` : ''}
        </div>

        <div style="font-weight: 700; font-size: 13.5px; color: #12304A; line-height: 1.3; margin-bottom: 4px;">
          ${fac.name}
        </div>

        <div style="font-size: 11px; color: #64717D; margin-bottom: 8px;">
          📍 ${fac.locality ? `${fac.locality}, ` : ''}${fac.city}
          ${fac.distance_km ? ` • <strong>${fac.distance_km} km</strong>` : ''}
          ${driveTime ? ` (~${driveTime} min drive)` : ''}
        </div>

        <div style="background-color: #F8FAF9; border: 1px solid #E2E8F0; border-radius: 6px; padding: 6px 8px; margin-bottom: 8px;">
          <div style="font-size: 9.5px; color: #0D9488; font-weight: 700; text-transform: uppercase;">
            ${fac.pricing_status || 'Estimated Procedure Tariff'}
          </div>
          <div style="font-size: 12px; font-weight: 800; color: #12304A;">
            ${tariffText}
          </div>
        </div>

        ${fac.empanelled_schemes && fac.empanelled_schemes.length > 0 ? `
          <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 10px;">
            ${fac.empanelled_schemes.slice(0, 3).map((s: string) => `
              <span style="background-color: #12304A; color: white; font-size: 9.5px; font-weight: 600; padding: 2px 6px; border-radius: 4px;">
                ${s === 'aarogyasri' ? 'Aarogyasri' : s === 'pm_jay' ? 'PM-JAY' : s.toUpperCase()}
              </span>
            `).join('')}
          </div>
        ` : ''}

        <div style="display: flex; gap: 6px;">
          <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="
            flex: 1;
            text-align: center;
            background-color: #F1F5F9;
            color: #12304A;
            text-decoration: none;
            padding: 6px 8px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 11px;
            border: 1px solid #CBD5E1;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
          ">
            🗺️ Directions
          </a>
          <button id="l-details-${fac.id}" style="
            flex: 1;
            background-color: #0D9488;
            color: white;
            border: none;
            padding: 6px 8px;
            border-radius: 6px;
            font-weight: 700;
            font-size: 11px;
            cursor: pointer;
          ">
            Details
          </button>
        </div>
      `;

      popupDiv.querySelector(`#l-details-${fac.id}`)?.addEventListener('click', () => {
        onViewDetails(fac);
        mapInstanceRef.current?.closePopup();
      });

      marker.bindPopup(popupDiv, { maxWidth: 280 });

      marker.on('click', () => {
        onSelectFacility(fac);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([fac.lat, fac.lng], 14, {
            animate: !prefersReducedMotion,
            duration: 0.6
          });
        }
      });

      if (onHoverFacility) {
        marker.on('mouseover', () => onHoverFacility(fac.id));
        marker.on('mouseout', () => onHoverFacility(null));
      }

      markersLayerRef.current?.addLayer(marker);
    }
  }, [facilities, selectedFacilityId, hoveredFacilityId, currentZoom, prefersReducedMotion]);

  // 5. Smooth fly-to when selected facility changes from list
  useEffect(() => {
    if (!selectedFacilityId || !mapInstanceRef.current) return;
    const fac = facilities.find(f => f.id === selectedFacilityId);
    if (fac && fac.lat && fac.lng) {
      mapInstanceRef.current.flyTo([fac.lat, fac.lng], 14, {
        animate: !prefersReducedMotion,
        duration: 0.8
      });
    }
  }, [selectedFacilityId, facilities, prefersReducedMotion]);

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userLat, userLng], 12, {
        animate: !prefersReducedMotion,
        duration: 0.6
      });
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
    <div style={{ position: 'relative', width: '100%', height, borderRadius: '16px', overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(18, 48, 74, 0.06)' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating: Search This Area */}
      {showSearchThisArea && (
        <div style={{ position: 'absolute', top: '14px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
          <button
            onClick={handleTriggerSearchArea}
            className="btn btn-primary btn-sm"
            style={{
              boxShadow: '0 4px 14px rgba(18, 48, 74, 0.25)',
              borderRadius: '50px',
              backgroundColor: '#12304A',
              color: 'white',
              fontSize: '0.82rem',
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={13} />
            <span>Search this area</span>
          </button>
        </div>
      )}

      {/* Floating: Reset Location Button */}
      <button
        onClick={handleResetView}
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '14px',
          zIndex: 1000,
          backgroundColor: '#FFFFFF',
          border: '1px solid #CBD5E1',
          borderRadius: '50px',
          padding: '7px 13px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: '#12304A'
        }}
        title="Center map on your current location"
      >
        <Navigation size={13} color="#0D9488" />
        <span>My Location</span>
      </button>

      {/* Showing basic map notice badge */}
      <div style={{
        position: 'absolute',
        top: '14px',
        left: '14px',
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(6px)',
        border: '1px solid #CBD5E1',
        borderRadius: '6px',
        padding: '3px 8px',
        fontSize: '0.68rem',
        fontWeight: 600,
        color: '#475569',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
      }}>
        Showing basic map
      </div>

      {/* Map Legend (Bottom-Left) */}
      <div style={{
        position: 'absolute',
        bottom: '14px',
        left: '14px',
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(8px)',
        border: '1px solid #E2E8F0',
        borderRadius: '10px',
        padding: '6px 10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        fontSize: '0.7rem'
      }}>
        <div style={{ fontWeight: 700, color: '#12304A', fontSize: '0.68rem', textTransform: 'uppercase', marginBottom: '2px' }}>
          Hospital Types
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0D9488' }} />
            <span style={{ color: '#475569' }}>Govt</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#D97706' }} />
            <span style={{ color: '#475569' }}>Charitable</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563EB' }} />
            <span style={{ color: '#475569' }}>Private</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#7C3AED' }} />
            <span style={{ color: '#475569' }}>Premium</span>
          </div>
        </div>
      </div>
    </div>
  );
};
