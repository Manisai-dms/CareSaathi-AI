import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { FacilityDTO } from '../services/api';

interface HospitalMapProps {
  facilities: FacilityDTO[];
  userLat?: number;
  userLng?: number;
  onSelectFacility: (facility: FacilityDTO) => void;
}

export const HospitalMap: React.FC<HospitalMapProps> = ({
  facilities,
  userLat = 17.4399,
  userLng = 78.4806,
  onSelectFacility
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map if not already created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLat, userLng],
        zoom: 12,
        scrollWheelZoom: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    map.setView([userLat, userLng], 12);

    // Clear existing markers & circles
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Circle) {
        map.removeLayer(layer);
      }
    });

    // Add Concentric Distance Rings (5 km, 10 km, 15 km)
    L.circle([userLat, userLng], {
      radius: 5000,
      color: '#438F84',
      weight: 1.5,
      dashArray: '4, 4',
      fillColor: '#438F84',
      fillOpacity: 0.04
    }).addTo(map).bindTooltip("5 km Radius", { permanent: false, direction: 'top' });

    L.circle([userLat, userLng], {
      radius: 10000,
      color: '#183247',
      weight: 1.5,
      dashArray: '5, 5',
      fillColor: '#183247',
      fillOpacity: 0.02
    }).addTo(map).bindTooltip("10 km Radius", { permanent: false, direction: 'top' });

    L.circle([userLat, userLng], {
      radius: 15000,
      color: '#64717D',
      weight: 1,
      dashArray: '6, 6',
      fillColor: '#64717D',
      fillOpacity: 0.01
    }).addTo(map).bindTooltip("15 km Radius", { permanent: false, direction: 'top' });

    // Custom Hospital Pin Icon
    const hospitalIcon = L.divIcon({
      className: 'custom-hosp-pin',
      html: `
        <div style="
          background-color: #438F84;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 16px;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        ">🏥</div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    // Custom User Pin Icon
    const userIcon = L.divIcon({
      className: 'custom-user-pin',
      html: `
        <div style="
          background-color: #D97962;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 0 0 4px rgba(217, 121, 98, 0.35);
        "></div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });

    // Add user marker
    L.marker([userLat, userLng], { icon: userIcon })
      .addTo(map)
      .bindPopup("<strong>Your Selected Search Center</strong><br/><span style='font-size: 12px; color: #64717D;'>Rings show 5km, 10km, 15km radii</span>");

    // Add facility markers
    facilities.forEach(fac => {
      const marker = L.marker([fac.lat, fac.lng], { icon: hospitalIcon }).addTo(map);

      const popupContent = `
        <div style="font-family: sans-serif; min-width: 180px; padding: 4px;">
          <h4 style="margin: 0 0 4px 0; font-size: 14px; color: #183247;">${fac.name}</h4>
          <div style="font-size: 11px; color: #64717D; margin-bottom: 6px;">${fac.locality} • ${fac.ownership}</div>
          ${fac.distance_km ? `<div style="font-size: 12px; font-weight: bold; color: #438F84; margin-bottom: 6px;">📍 ${fac.distance_km} km away</div>` : ''}
          ${fac.estimated_cost_min !== undefined ? `<div style="font-size: 12px; font-weight: bold; margin-bottom: 8px;">₹${fac.estimated_cost_min.toLocaleString('en-IN')} - ₹${fac.estimated_cost_max?.toLocaleString('en-IN')}</div>` : ''}
          <button id="view-fac-${fac.id}" style="
            background: #438F84;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 4px 8px;
            font-size: 11px;
            cursor: pointer;
            width: 100%;
          ">View Details</button>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-fac-${fac.id}`);
        if (btn) {
          btn.onclick = () => onSelectFacility(fac);
        }
      });
    });

    return () => {
      // cleanup on unmount
    };
  }, [facilities, userLat, userLng]);

  return (
    <div style={{ position: 'relative' }}>
      <div ref={mapContainerRef} className="map-container" />
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(4px)',
        padding: '6px 12px',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.75rem',
        color: 'var(--color-navy)',
        border: '1px solid var(--color-border)',
        zIndex: 500,
        boxShadow: 'var(--shadow-sm)'
      }}>
        🗺️ OpenStreetMap Verified Geospatial Coordinates
      </div>
    </div>
  );
};
