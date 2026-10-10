// ==============================================================================
// CareSaathi AI - Supabase Edge Function: route-matrix
// Calculates driving / transit travel time and distance matrix via Routes API
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const memoryCache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    let { origins, destinations, travelMode = "DRIVE" } = await req.json();

    if (!origins || !destinations || !Array.isArray(origins) || !Array.isArray(destinations) || origins.length === 0 || destinations.length === 0) {
      return new Response(JSON.stringify({ error: "origins and destinations arrays required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // Safety and cost control: Cap destinations to at most 25 items per request
    if (destinations.length > 25) {
      destinations = destinations.slice(0, 25);
    }

    // Validate coordinates
    const isValidCoord = (c: any) => typeof c?.lat === 'number' && typeof c?.lng === 'number' && !isNaN(c.lat) && !isNaN(c.lng);
    if (!origins.every(isValidCoord) || !destinations.every(isValidCoord)) {
      return new Response(JSON.stringify({ error: "Invalid numeric coordinates in origins or destinations" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const cacheKey = `${JSON.stringify(origins)}_${JSON.stringify(destinations)}_${travelMode}`;
    const cached = memoryCache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return new Response(JSON.stringify({ ...cached.data, cached: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const apiKey = Deno.env.get("GOOGLE_MAPS_SERVER_KEY");
    if (!apiKey) {
      // Graceful fallback estimation based on haversine distance
      const fallbackElements = destinations.map((dest: any) => {
        const origin = origins[0];
        const distKm = calculateHaversine(origin.lat, origin.lng, dest.lat, dest.lng);
        const estMinutes = Math.round((distKm / 30) * 60) + 5; // assumes 30km/h average city speed
        return {
          distanceKm: parseFloat(distKm.toFixed(1)),
          durationMinutes: estMinutes,
          durationFormatted: `${estMinutes} mins`,
          isEstimate: true,
        };
      });

      return new Response(JSON.stringify({ elements: fallbackElements, mode: "haversine_fallback" }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // Google Routes API (computeRouteMatrix)
    const url = "https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix";
    const body = {
      origins: origins.map((o: any) => ({
        waypoint: { location: { latLng: { latitude: o.lat, longitude: o.lng } } },
      })),
      destinations: destinations.map((d: any) => ({
        waypoint: { location: { latLng: { latitude: d.lat, longitude: d.lng } } },
      })),
      travelMode: travelMode,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "originIndex,destinationIndex,status,distanceMeters,duration,condition",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(JSON.stringify({ error: "Routes API error", details: err }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const data = await response.json();
    const result = { elements: data, source: "routes_api" };
    memoryCache.set(cacheKey, { data: result, expiry: Date.now() + CACHE_TTL_MS });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});

function calculateHaversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
