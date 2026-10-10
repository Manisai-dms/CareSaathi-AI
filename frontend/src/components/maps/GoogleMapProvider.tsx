import React, { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { MapCommonProps, getFacilityTypeColor, getFacilityTypeLabel } from './types';
import { Navigation, RefreshCw, Layers, Maximize2, Map as MapIcon } from 'lucide-react';

const HEALTHCARE_CLEAN_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: 'all', elementType: 'geometry.fill', stylers: [{ weight: '2.00' }] },
  { featureType: 'all', elementType: 'geometry.stroke', stylers: [{ color: '#e2e8f0' }] },
  { featureType: 'all', elementType: 'labels.text.fill', stylers: [{ color: '#1e293b' }] },
  { featureType: 'landscape', elementType: 'all', stylers: [{ color: '#f8fafc' }] },
  { featureType: 'poi', elementType: 'all', stylers: [{ visibility: 'off' }] }, // Hide unrelated POIs
  { featureType: 'poi.medical', elementType: 'all', stylers: [{ visibility: 'on' }] },
  { featureType: 'poi.medical', elementType: 'geometry.fill', stylers: [{ color: '#ecfdf5' }] },
  { featureType: 'road', elementType: 'all', stylers: [{ saturation: -100 }, { lightness: 45 }] },
  { featureType: 'road.highway', elementType: 'all', stylers: [{ visibility: 'simplified' }] },
  { featureType: 'water', elementType: 'all', stylers: [{ color: '#e0f2fe' }, { visibility: 'on' }] }
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
  height = '100%'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const userMarkerRef = useRef<any>(null);
  const userCircleRef = useRef<google.maps.Circle | null>(null);
  const routePolylineRef = useRef<google.maps.Polyline | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapTypeId, setMapTypeId] = useState<'roadmap' | 'satellite'>('roadmap');
  const [showSearchThisArea, setShowSearchThisArea] = useState(false);
  const [currentCenter, setCurrentCenter] = useState<{ lat: number; lng: number }>({ lat: userLat, lng: userLng });

  const mapId = (import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string) || undefined;

  // 1. Lazy load Google Maps using @googlemaps/js-api-loader
  useEffect(() => {
    let isMounted = true;

    try {
      setOptions({
        key: apiKey,
        v: 'weekly',
        libraries: ['places', 'geometry', 'marker']
      });

      Promise.all([
        importLibrary('maps'),
        importLibrary('marker')
      ]).then(() => {
        if (isMounted) setMapLoaded(true);
      }).catch((err: any) => {
        console.warn('Google Maps API failed to load via Loader:', err);
        if (isMounted) onError();
      });
    } catch (e: any) {
      console.warn('Google Maps loader initialization error:', e);
      if (isMounted) onError();
    }

    return () => {
      isMounted = false;
    };
  }, [apiKey]);

  // 2. Initialize Google Map instance
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current) return;

    try {
      if (!mapInstanceRef.current) {
        const mapOptions: google.maps.MapOptions = {
          center: { lat: userLat, lng: userLng },
          zoom: 12,
          styles: HEALTHCARE_CLEAN_STYLES,
          disableDefaultUI: false,
          zoomControl: true,
          zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_TOP },
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
          fullscreenControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
          mapTypeId: mapTypeId === 'satellite' ? google.maps.MapTypeId.HYBRID : google.maps.MapTypeId.ROADMAP
        };

        if (mapId) {
          mapOptions.mapId = mapId;
        }

        const map = new google.maps.Map(mapContainerRef.current, mapOptions);
        infoWindowRef.current = new google.maps.InfoWindow();

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
      console.error('Error initializing Google Map:', e);
      onError();
    }
  }, [mapLoaded]);

  // 3. User Location Pulsing Dot & Radius Circle
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded || !window.google) return;
    const map = mapInstanceRef.current;

    // Accuracy / search radius circle
    if (userCircleRef.current) {
      userCircleRef.current.setMap(null);
    }

    if (radiusKm && radiusKm < 999) {
      userCircleRef.current = new google.maps.Circle({
        strokeColor: '#0D9488',
        strokeOpacity: 0.75,
        strokeWeight: 1.5,
        fillColor: '#0D9488',
        fillOpacity: 0.05,
        map,
        center: { lat: userLat, lng: userLng },
        radius: radiusKm * 1000
      });
    }

    // User marker
    if (userMarkerRef.current) {
      if (typeof userMarkerRef.current.setMap === 'function') {
        userMarkerRef.current.setMap(null);
      } else {
        userMarkerRef.current.map = null;
      }
    }

    // If Advanced Markers are available and mapId is set
    const canUseAdvanced = Boolean(mapId && (google.maps.marker as any)?.AdvancedMarkerElement);

    if (canUseAdvanced) {
      const dotEl = document.createElement('div');
      dotEl.innerHTML = `
        <div style="position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background: rgba(37, 99, 235, 0.3); animation: pulseDot 2s infinite;"></div>
          <div style="width: 12px; height: 12px; border-radius: 50%; background: #2563EB; border: 2.5px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.3);"></div>
        </div>
      `;
      userMarkerRef.current = new (google.maps.marker as any).AdvancedMarkerElement({
        map,
        position: { lat: userLat, lng: userLng },
        title: 'Your Location',
        content: dotEl
      });
    } else {
      userMarkerRef.current = new google.maps.Marker({
        map,
        position: { lat: userLat, lng: userLng },
        title: 'Your Location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: '#2563EB',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2.5
        }
      });
    }
  }, [mapLoaded, userLat, userLng, radiusKm]);

  // 4. Draw Road Polyline to Selected Facility
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded || !window.google) return;
    const map = mapInstanceRef.current;

    if (routePolylineRef.current) {
      routePolylineRef.current.setMap(null);
      routePolylineRef.current = null;
    }

    if (selectedFacilityId) {
      const selectedFac = facilities.find(f => f.id === selectedFacilityId);
      if (selectedFac && selectedFac.lat && selectedFac.lng) {
        routePolylineRef.current = new google.maps.Polyline({
          path: [
            { lat: userLat, lng: userLng },
            { lat: selectedFac.lat, lng: selectedFac.lng }
          ],
          geodesic: true,
          strokeColor: '#0D9488',
          strokeOpacity: 0.85,
          strokeWeight: 3.5,
          map
        });
      }
    }
  }, [mapLoaded, selectedFacilityId, facilities, userLat, userLng]);

  // 5. Render Markers with Clustering & InfoWindow
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded || !window.google) return;
    const map = mapInstanceRef.current;

    // Clear clusterer and markers
    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
    }
    markersRef.current.forEach(m => {
      if (typeof m.setMap === 'function') m.setMap(null);
      else m.map = null;
    });
    markersRef.current.clear();

    const canUseAdvanced = Boolean(mapId && (google.maps.marker as any)?.AdvancedMarkerElement);
    const classicMarkersForCluster: google.maps.Marker[] = [];

    facilities.forEach(fac => {
      if (!fac.lat || !fac.lng) return;

      const pinColor = getFacilityTypeColor(fac.facility_class === 'Premium' ? 'Premium' : fac.ownership);
      const isSelected = selectedFacilityId === fac.id;
      const isHovered = hoveredFacilityId === fac.id;

      if (canUseAdvanced) {
        // Advanced Marker Element
        const pinEl = document.createElement('div');
        const size = isSelected ? 40 : isHovered ? 36 : 32;
        pinEl.style.width = `${size}px`;
        pinEl.style.height = `${size}px`;
        pinEl.style.borderRadius = '50%';
        pinEl.style.backgroundColor = pinColor;
        pinEl.style.border = '2.5px solid white';
        pinEl.style.boxShadow = isSelected
          ? `0 0 0 4px ${pinColor}55, 0 6px 14px rgba(0,0,0,0.35)`
          : '0 2px 6px rgba(0,0,0,0.25)';
        pinEl.style.display = 'flex';
        pinEl.style.alignItems = 'center';
        pinEl.style.justifyContent = 'center';
        pinEl.style.color = 'white';
        pinEl.style.fontSize = '14px';
        pinEl.style.cursor = 'pointer';
        pinEl.innerHTML = '🏥';

        const advMarker = new (google.maps.marker as any).AdvancedMarkerElement({
          map,
          position: { lat: fac.lat, lng: fac.lng },
          title: fac.name,
          content: pinEl
        });

        advMarker.addListener('click', () => {
          handlePinClick(fac, advMarker);
        });

        markersRef.current.set(fac.id, advMarker);
      } else {
        // Classic Google Marker
        const marker = new google.maps.Marker({
          position: { lat: fac.lat, lng: fac.lng },
          title: fac.name,
          icon: {
            path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 Z',
            fillColor: pinColor,
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
            scale: isSelected ? 1.3 : isHovered ? 1.15 : 1.0,
            labelOrigin: new google.maps.Point(0, -30)
          }
        });

        marker.addListener('click', () => {
          handlePinClick(fac, marker);
        });

        markersRef.current.set(fac.id, marker);
        classicMarkersForCluster.push(marker);
      }
    });

    // Initialize clustering for classic markers
    if (classicMarkersForCluster.length > 0) {
      clustererRef.current = new MarkerClusterer({
        map,
        markers: classicMarkersForCluster
      });
    }

    // Auto-fit bounds on initial load
    if (facilities.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      facilities.forEach(f => {
        if (f.lat && f.lng) bounds.extend({ lat: f.lat, lng: f.lng });
      });
      bounds.extend({ lat: userLat, lng: userLng });
      map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
    }

    function handlePinClick(fac: any, markerInstance: any) {
      onSelectFacility(fac);
      map.panTo({ lat: fac.lat, lng: fac.lng });

      // Construct InfoWindow
      const roadDistanceText = fac.road_distance_km !== undefined
        ? `${fac.road_distance_km} km by road`
        : fac.distance_km !== undefined
          ? `≈ ${fac.distance_km} km straight-line`
          : 'Nearby';

      const durationText = fac.road_duration_mins !== undefined
        ? ` · ${fac.road_duration_mins} min`
        : '';

      const tariffText = fac.tariff_detail?.type === 'published'
        ? `₹${fac.estimated_cost_min?.toLocaleString('en-IN')} - ₹${fac.estimated_cost_max?.toLocaleString('en-IN')}`
        : fac.estimated_cost_min === 0
          ? 'Free / Subsidized Public Care'
          : fac.estimated_cost_min
            ? `₹${fac.estimated_cost_min?.toLocaleString('en-IN')} - ₹${fac.estimated_cost_max?.toLocaleString('en-IN')}`
            : 'Tariff not published, contact hospital';

      const infoHtml = `
        <div style="font-family: Inter, sans-serif; padding: 4px; min-width: 220px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="background-color: ${getFacilityTypeColor(fac.ownership)}22; color: ${getFacilityTypeColor(fac.ownership)}; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">
              ${getFacilityTypeLabel(fac.ownership)}
            </span>
            ${fac.rating ? `<span style="font-size: 11px; font-weight: 700; color: #D97706;">★ ${Number(fac.rating).toFixed(1)}</span>` : ''}
          </div>
          <div style="font-weight: 700; font-size: 13px; color: #12304A; margin-bottom: 3px;">
            ${fac.name}
          </div>
          <div style="font-size: 11px; color: #64717D; margin-bottom: 6px;">
            📍 ${roadDistanceText}${durationText}
          </div>
          <div style="background-color: #F8FAF9; padding: 6px 8px; border-radius: 6px; border: 1px solid #E2E8F0; margin-bottom: 8px;">
            <div style="font-size: 9.5px; color: #0D9488; font-weight: 700; text-transform: uppercase;">
              ${fac.pricing_status || 'Procedure Tariff'}
            </div>
            <div style="font-size: 12px; font-weight: 800; color: #12304A;">
              ${tariffText}
            </div>
          </div>
          <div style="display: flex; gap: 6px;">
            <a href="https://www.google.com/maps/dir/?api=1&destination=${fac.lat},${fac.lng}" target="_blank" rel="noopener noreferrer" style="flex: 1; text-align: center; background-color: #F1F5F9; color: #12304A; text-decoration: none; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; border: 1px solid #CBD5E1;">
              🗺️ Directions
            </a>
            <button id="g-details-${fac.id}" style="flex: 1; background-color: #0D9488; color: white; border: none; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">
              Details
            </button>
          </div>
        </div>
      `;

      if (infoWindowRef.current) {
        infoWindowRef.current.setContent(infoHtml);
        if (canUseAdvanced) {
          infoWindowRef.current.open({ map, anchor: markerInstance });
        } else {
          infoWindowRef.current.open(map, markerInstance);
        }

        // Hook up details click
        setTimeout(() => {
          document.getElementById(`g-details-${fac.id}`)?.addEventListener('click', () => {
            onViewDetails(fac);
            infoWindowRef.current?.close();
          });
        }, 100);
      }
    }
  }, [facilities, selectedFacilityId, hoveredFacilityId, mapLoaded]);

  // 6. Smooth pan when selected from list
  useEffect(() => {
    if (!selectedFacilityId || !mapInstanceRef.current || !mapLoaded) return;
    const fac = facilities.find(f => f.id === selectedFacilityId);
    if (fac && fac.lat && fac.lng) {
      mapInstanceRef.current.panTo({ lat: fac.lat, lng: fac.lng });
    }
  }, [selectedFacilityId, facilities, mapLoaded]);

  // Toggle Map / Satellite view
  const handleToggleMapType = () => {
    if (!mapInstanceRef.current) return;
    const nextType = mapTypeId === 'roadmap' ? 'satellite' : 'roadmap';
    setMapTypeId(nextType);
    mapInstanceRef.current.setMapTypeId(
      nextType === 'satellite' ? google.maps.MapTypeId.HYBRID : google.maps.MapTypeId.ROADMAP
    );
  };

  const handleResetLocation = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat: userLat, lng: userLng });
      mapInstanceRef.current.setZoom(13);
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

      {/* Top-Right: Map / Satellite Toggle */}
      <div style={{ position: 'absolute', top: '14px', left: '14px', zIndex: 1000, display: 'flex', gap: '6px' }}>
        <button
          onClick={handleToggleMapType}
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '6px',
            padding: '5px 10px',
            fontSize: '0.74rem',
            fontWeight: 700,
            color: '#12304A',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          title="Toggle Satellite / Street Map"
        >
          <Layers size={12} color="#0D9488" />
          <span>{mapTypeId === 'roadmap' ? 'Satellite' : 'Map'}</span>
        </button>
      </div>

      {/* Bottom-Right: My Location Button */}
      <button
        onClick={handleResetLocation}
        style={{
          position: 'absolute',
          bottom: '24px',
          right: '54px',
          zIndex: 1000,
          backgroundColor: '#FFFFFF',
          border: '1px solid #CBD5E1',
          borderRadius: '50px',
          padding: '6px 12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          fontSize: '0.78rem',
          fontWeight: 600,
          color: '#12304A'
        }}
        title="Center map on your current location"
      >
        <Navigation size={13} color="#0D9488" />
        <span>My Location</span>
      </button>

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
