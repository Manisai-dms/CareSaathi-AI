/**
 * frontend/src/services/googleEnrichmentService.ts
 * 
 * Road Distance calculation via Routes API proxy and
 * Google Places API matching with strict 300m + name similarity checks.
 * Caches in session to minimize API calls and prevent billing leaks.
 */

import { api, FacilityDTO } from './api';

export interface RoadDistanceResult {
  road_distance_km?: number;
  road_duration_mins?: number;
  is_live_traffic?: boolean;
}

export interface GooglePlaceEnrichment {
  placeId: string;
  rating?: number;
  userRatingCount?: number;
  isOpenNow?: boolean;
  photos: Array<{ url: string; attribution: string }>;
  phoneNumber?: string;
  website?: string;
}

// In-memory session caches
const ROAD_MATRIX_CACHE = new Map<string, Record<string, RoadDistanceResult>>();
const PLACE_MATCH_CACHE = new Map<string, GooglePlaceEnrichment | null>();

/**
 * Normalized token-based similarity score (0.0 to 1.0)
 */
export function computeNameSimilarity(name1: string, name2: string): number {
  if (!name1 || !name2) return 0;

  const clean = (s: string) => {
    return s.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\b(hospital|hospitals|super|speciality|specialty|institute|research|centre|center|health|city|clinic|pvt|ltd)\b/g, '')
      .trim()
      .split(/\s+/)
      .filter(w => w.length > 1);
  };

  const tokens1 = clean(name1);
  const tokens2 = clean(name2);

  if (tokens1.length === 0 || tokens2.length === 0) return 0;

  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);

  let intersectionCount = 0;
  for (const t of set1) {
    if (set2.has(t)) intersectionCount++;
  }

  const unionCount = new Set([...tokens1, ...tokens2]).size;
  const jaccard = unionCount > 0 ? intersectionCount / unionCount : 0;

  // Distinctive brand matching (e.g. Yashoda, Apollo, KIMS, AIG, Continental, Star)
  const brandKeywords = ['yashoda', 'apollo', 'kims', 'aig', 'fernandez', 'osmania', 'gandhi', 'nims', 'continental', 'care', 'star', 'medicover', 'rainbow', 'lvpei', 'basavatarakam'];
  for (const brand of brandKeywords) {
    if (tokens1.includes(brand) && tokens2.includes(brand)) {
      return Math.max(jaccard, 0.75);
    }
  }

  return jaccard;
}

/**
 * Haversine straight-line distance in km
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const googleEnrichmentService = {
  /**
   * Request road distance only for the top 25 results closest to origin
   */
  async enrichRoadDistances(
    origin: { lat: number; lng: number },
    facilities: FacilityDTO[]
  ): Promise<FacilityDTO[]> {
    if (!origin || !facilities || facilities.length === 0) return facilities;

    const originKey = `${origin.lat.toFixed(3)}_${origin.lng.toFixed(3)}`;
    const cachedMap = ROAD_MATRIX_CACHE.get(originKey);

    // Filter valid facilities
    const validFacilities = facilities.filter(f => typeof f.lat === 'number' && typeof f.lng === 'number');
    if (validFacilities.length === 0) return facilities;

    // Rank first by straight-line distance
    const sorted = [...validFacilities].sort((a, b) => {
      const distA = haversineDistance(origin.lat, origin.lng, a.lat, a.lng);
      const distB = haversineDistance(origin.lat, origin.lng, b.lat, b.lng);
      return distA - distB;
    });

    // Top 25 batch cap for cost control
    const top25 = sorted.slice(0, 25);
    const top25Ids = new Set(top25.map(f => f.id));

    let distanceMap: Record<string, RoadDistanceResult> = cachedMap ? { ...cachedMap } : {};

    // Check which top 25 facilities need a route matrix call
    const needed = top25.filter(f => !distanceMap[f.id]);

    if (needed.length > 0) {
      try {
        const destCoords = needed.map(f => ({ lat: f.lat, lng: f.lng }));
        const res = await api.getRouteMatrix([origin], destCoords);

        if (res && res.elements && Array.isArray(res.elements)) {
          res.elements.forEach((elem: any, idx: number) => {
            const fac = needed[idx];
            if (!fac) return;

            let roadKm: number | undefined;
            let durationMins: number | undefined;

            if (elem.distanceMeters !== undefined) {
              roadKm = Math.round((elem.distanceMeters / 1000) * 10) / 10;
            } else if (elem.distanceKm !== undefined) {
              roadKm = elem.distanceKm;
            }

            if (elem.duration) {
              const seconds = parseInt(String(elem.duration).replace('s', ''), 10);
              if (!isNaN(seconds)) durationMins = Math.round(seconds / 60);
            } else if (elem.durationMinutes !== undefined) {
              durationMins = elem.durationMinutes;
            }

            distanceMap[fac.id] = {
              road_distance_km: roadKm,
              road_duration_mins: durationMins,
              is_live_traffic: Boolean(res.source === 'routes_api' && !elem.is_fallback)
            };
          });

          // Store in session cache
          ROAD_MATRIX_CACHE.set(originKey, distanceMap);
        }
      } catch (e) {
        console.warn('Road distance matrix failed; falling back gracefully to straight-line.', e);
      }
    }

    // Merge road distance data onto facilities
    return facilities.map(f => {
      const info = distanceMap[f.id];
      if (info) {
        return {
          ...f,
          road_distance_km: info.road_distance_km,
          road_duration_mins: info.road_duration_mins,
          is_live_traffic: info.is_live_traffic
        };
      }
      return f;
    });
  },

  /**
   * Match a single facility to a verified Google Place (within ~300m and name similarity >= 0.55)
   */
  async matchGooglePlace(facility: FacilityDTO): Promise<GooglePlaceEnrichment | null> {
    if (!facility || !facility.lat || !facility.lng) return null;

    if (PLACE_MATCH_CACHE.has(facility.id)) {
      return PLACE_MATCH_CACHE.get(facility.id) || null;
    }

    try {
      const res = await api.getPlacesNearby(facility.lat, facility.lng, 400, facility.name);
      if (!res || !res.places || !Array.isArray(res.places) || res.places.length === 0) {
        PLACE_MATCH_CACHE.set(facility.id, null);
        return null;
      }

      let bestMatch: any = null;
      let highestSimilarity = 0;

      for (const place of res.places) {
        const placeLat = place.location?.latitude;
        const placeLng = place.location?.longitude;
        if (typeof placeLat !== 'number' || typeof placeLng !== 'number') continue;

        // Check geographical distance <= 350 meters
        const distKm = haversineDistance(facility.lat, facility.lng, placeLat, placeLng);
        if (distKm > 0.35) continue;

        const displayName = place.displayName?.text || '';
        const sim = computeNameSimilarity(facility.name, displayName);

        if (sim >= 0.55 && sim > highestSimilarity) {
          highestSimilarity = sim;
          bestMatch = place;
        }
      }

      if (bestMatch) {
        const photos = (bestMatch.photos || []).slice(0, 3).map((p: any) => ({
          url: api.getPlacePhotoUrl(p.name, 600, 800),
          attribution: p.authorAttributions?.[0]?.displayName || 'Google Maps Contributor'
        }));

        const enrichment: GooglePlaceEnrichment = {
          placeId: bestMatch.id,
          rating: bestMatch.rating ? Math.round(bestMatch.rating * 10) / 10 : undefined,
          userRatingCount: bestMatch.userRatingCount,
          isOpenNow: bestMatch.currentOpeningHours?.openNow,
          photos,
          phoneNumber: bestMatch.nationalPhoneNumber,
          website: bestMatch.websiteUri
        };

        PLACE_MATCH_CACHE.set(facility.id, enrichment);
        return enrichment;
      }

      PLACE_MATCH_CACHE.set(facility.id, null);
      return null;
    } catch (e) {
      console.warn(`Place matching failed for ${facility.name}:`, e);
      PLACE_MATCH_CACHE.set(facility.id, null);
      return null;
    }
  }
};
