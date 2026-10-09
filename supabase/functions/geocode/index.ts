// ==============================================================================
// CareSaathi AI - Supabase Edge Function: geocode
// Reverse & Forward Geocoding using Geocoding API with caching and debounce
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const memoryCache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

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
    const { address, lat, lng, language = "en" } = await req.json();

    const cacheKey = address ? `addr_${address}_${language}` : `rev_${lat}_${lng}_${language}`;
    const cached = memoryCache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return new Response(JSON.stringify({ ...cached.data, cached: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const apiKey = Deno.env.get("GOOGLE_MAPS_SERVER_KEY");
    if (!apiKey) {
      // Fallback
      return new Response(
        JSON.stringify({
          error: "GOOGLE_MAPS_SERVER_KEY not configured",
          results: address ? [{ formatted_address: address, geometry: { location: { lat: 17.4399, lng: 78.4806 } } }] : [],
          fallback_mode: true,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    let url = "https://maps.googleapis.com/maps/api/geocode/json?";
    if (address) {
      url += `address=${encodeURIComponent(address)}&components=country:IN&language=${language}&key=${apiKey}`;
    } else if (lat && lng) {
      url += `latlng=${lat},${lng}&language=${language}&key=${apiKey}`;
    } else {
      return new Response(JSON.stringify({ error: "address or lat/lng required" }), { status: 400 });
    }

    const response = await fetch(url);
    const data = await response.json();

    memoryCache.set(cacheKey, { data, expiry: Date.now() + CACHE_TTL_MS });

    return new Response(JSON.stringify(data), {
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
