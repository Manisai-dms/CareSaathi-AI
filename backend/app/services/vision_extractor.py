import os
import re
import json
import base64
import logging
from typing import Dict, Any, List, Optional
import httpx
from ..config import settings

logger = logging.getLogger("caresaathi.vision")

VISION_PROMPT = """You are an expert clinical pharmacologist and prescription OCR specialist for the Indian healthcare system.
Analyze this medical prescription image and extract all visible prescribed medications, doctor details, and date.

You MUST output STRICT JSON only, conforming exactly to this schema:
{
  "medicines": [
    {
      "name_as_written": "Exact medicine name text as written on the paper",
      "brand_name": "Commercial brand name or null if generic only",
      "generic_name": "Active pharmacological chemical / salt name or null if unknown",
      "strength": "Dose strength e.g. '650 mg', '40 mg', '500 mcg', or null",
      "form": "Dosage form e.g. 'tablet', 'capsule', 'syrup', 'injection', 'eye drops', or null",
      "dosage_pattern": "Dosage frequency e.g. '1-0-1', 'BD', 'TDS', 'OD', 'SOS', 'HS', or null",
      "duration_days": 5, // Number of days course, or null
      "quantity": 10,     // Total unit quantity. If not explicitly written, calculate from pattern x duration_days (e.g. 1-0-1 for 5 days = 10, TDS for 5 days = 15, OD for 10 days = 10)
      "confidence": 0.95  // Floating point 0.0 to 1.0 indicating legibility confidence
    }
  ],
  "doctor_name": "Doctor name or null",
  "date": "Prescription date or null",
  "unreadable_parts": ["List any illegible words or doubtful lines here"]
}

STRICT CLINICAL RULES:
1. ONLY extract medicines that are ACTUALLY VISIBLE on the prescription. NEVER invent, hallucinate, or guess medicines.
2. If handwriting is unclear or ambiguous, set confidence low (< 0.6) and add the word to "unreadable_parts".
3. IGNORE non-medicine text such as patient name, patient age, address, clinic letterhead, or disease diagnoses.
4. Calculate quantity accurately:
   - "OD" or "1-0-0" or "0-0-1" = 1 per day
   - "BD" or "1-0-1" = 2 per day
   - "TDS" or "1-1-1" = 3 per day
   - "QID" = 4 per day
   - "SOS" = 5 (default emergency buffer)
5. Do NOT include markdown code blocks (e.g. no ```json). Output raw valid JSON only.
"""

def clean_json_text(text: str) -> str:
    """Strips markdown code fences and cleans text for JSON parsing."""
    t = text.strip()
    if t.startswith("```json"):
        t = t[7:]
    elif t.startswith("```"):
        t = t[3:]
    if t.endswith("```"):
        t = t[:-3]
    return t.strip()

def extract_medicines_with_gemini(jpeg_bytes: bytes) -> Optional[Dict[str, Any]]:
    """
    Sends preprocessed JPEG image bytes to Gemini Multimodal Vision API.
    Uses GEMINI_API_KEY or GOOGLE_API_KEY from server environment.
    Returns parsed JSON dict or None on failure.
    """
    api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        logger.warning("No GEMINI_API_KEY configured on server.")
        return None

    base64_data = base64.b64encode(jpeg_bytes).decode("utf-8")
    
    # Try models in order of capability: gemini-2.5-flash, then gemini-1.5-flash
    models_to_try = ["gemini-2.5-flash", "gemini-1.5-flash"]
    
    for model_name in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        
        request_body = {
            "contents": [
                {
                    "parts": [
                        {
                            "inline_data": {
                                "mime_type": "image/jpeg",
                                "data": base64_data
                            }
                        },
                        {
                            "text": VISION_PROMPT
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "response_mime_type": "application/json"
            }
        }

        try:
            with httpx.Client(timeout=25.0) as client:
                res = client.post(url, json=request_body)
                
            if res.status_code == 200:
                data = res.json()
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        raw_text = parts[0].get("text", "")
                        cleaned = clean_json_text(raw_text)
                        try:
                            parsed = json.loads(cleaned)
                            if isinstance(parsed, dict) and "medicines" in parsed:
                                return parsed
                        except json.JSONDecodeError:
                            # Retry once with regex extraction
                            json_match = re.search(r'\{[\s\S]*\}', cleaned)
                            if json_match:
                                parsed = json.loads(json_match.group(0))
                                if isinstance(parsed, dict) and "medicines" in parsed:
                                    return parsed
            else:
                logger.warning(f"Gemini API returned status {res.status_code} for model {model_name}: {res.text[:200]}")
        except Exception as e:
            logger.error(f"Error querying Gemini Vision with {model_name}: {e}")
            
    return None
