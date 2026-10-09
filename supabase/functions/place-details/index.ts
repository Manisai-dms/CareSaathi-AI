// ==============================================================================
// CareSaathi AI - Supabase Edge Function: place-details
// Proxies Google Places Details API (New) with field mask and caching
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const memoryCache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

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
    const { place_id } = await req.json();

    if (!place_id) {
      return new Response(JSON.stringify({ error: "place_id is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const cached = memoryCache.get(place_id);
    if (cached && cached.expiry > Date.now()) {
      return new Response(JSON.stringify({ ...cached.data, cached: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const apiKey = Deno.env.get("GOOGLE_MAPS_SERVER_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "GOOGLE_MAPS_SERVER_KEY not configured",
          details: null,
          fallback_mode: true,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(place_id)}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "id,displayName,formattedAddress,location,rating,userRatingCount,nationalPhoneNumber,websiteUri,currentOpeningHours,regularOpeningHours,photos,accessibilityOptions,editorialSummary",
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(JSON.stringify({ error: "Failed to fetch place details", details: errText }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const data = await response.json();
    const result = {
      place: data,
      attribution: "Data provided by Google Maps",
    };

    memoryCache.set(place_id, { data: result, expiry: Date.now() + CACHE_TTL_MS });

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
