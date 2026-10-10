import { FacilityDTO } from '../../services/api';

export interface MapCommonProps {
  facilities: FacilityDTO[];
  userLat?: number;
  userLng?: number;
  radiusKm?: number;
  selectedFacilityId?: string | null;
  hoveredFacilityId?: string | null;
  onSelectFacility: (facility: FacilityDTO) => void;
  onHoverFacility?: (facilityId: string | null) => void;
  onBookAppointment: (facility: FacilityDTO) => void;
  onViewDetails: (facility: FacilityDTO) => void;
  onSearchThisArea?: (lat: number, lng: number) => void;
  activeTreatmentId?: string;
  height?: string;
}

export type CostBand = 'low' | 'mid' | 'high' | 'free';

export function getFacilityCostBand(facility: FacilityDTO): CostBand {
  const min = facility.estimated_cost_min ?? 0;
  if (min === 0 || facility.ownership === 'Government') return 'free';
  if (min < 100000) return 'low';
  if (min < 250000) return 'mid';
  return 'high';
}

export function getCostBandColor(band: CostBand): string {
  switch (band) {
    case 'free':
      return '#10B981'; // Green
    case 'low':
      return '#34D399'; // Mint green
    case 'mid':
      return '#F59E0B'; // Amber
    case 'high':
      return '#EF4444'; // Coral red
  }
}

export function getFacilityTypeColor(ownership: string, facility_class?: string): string {
  if (facility_class === 'Premium') return '#7C3AED'; // Purple
  switch (ownership) {
    case 'Government':
      return '#0D9488'; // Teal
    case 'Charitable/Trust':
      return '#D97706'; // Amber
    case 'Private':
    default:
      return '#2563EB'; // Blue
  }
}

export function getFacilityTypeLabel(ownership: string, facility_class?: string): string {
  if (facility_class === 'Premium') return 'Premium Quaternary';
  if (ownership === 'Government') return 'Government Hospital';
  if (ownership === 'Charitable/Trust') return 'Charitable / Trust';
  return 'Private Multi-Specialty';
}
