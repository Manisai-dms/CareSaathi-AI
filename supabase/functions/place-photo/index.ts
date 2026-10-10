// ==============================================================================
// CareSaathi AI - Supabase Edge Function: place-photo
// Proxies photo requests from Places API (New) to keep server key secure
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req: Request) => {
  const urlObj = new URL(req.url);
  const photoName = urlObj.searchParams.get("photo_name");
  let maxHeight = parseInt(urlObj.searchParams.get("max_height") || "600", 10);
  let maxWidth = parseInt(urlObj.searchParams.get("max_width") || "800", 10);

  if (!photoName || typeof photoName !== "string" || !photoName.startsWith("places/")) {
    return new Response(JSON.stringify({ error: "Valid places/ photo_name parameter required" }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  // Clamp dimensions for safety and cost control
  maxHeight = Math.max(50, Math.min(1600, isNaN(maxHeight) ? 600 : maxHeight));
  maxWidth = Math.max(50, Math.min(1600, isNaN(maxWidth) ? 800 : maxWidth));

  const apiKey = Deno.env.get("GOOGLE_MAPS_SERVER_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "GOOGLE_MAPS_SERVER_KEY not configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Places API (New) Photo Media endpoint
    const googleUrl = `https://places.googleapis.com/v1/${encodeURIComponent(photoName)}/media?maxHeightPx=${maxHeight}&maxWidthPx=${maxWidth}&key=${apiKey}`;

    const googleRes = await fetch(googleUrl);
    if (!googleRes.ok) {
      return new Response(await googleRes.text(), { status: googleRes.status });
    }

    const contentType = googleRes.headers.get("content-type") || "image/jpeg";
    const imageBytes = await googleRes.arrayBuffer();

    return new Response(imageBytes, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, immutable", // Cache for 24 hours per Google Terms
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
