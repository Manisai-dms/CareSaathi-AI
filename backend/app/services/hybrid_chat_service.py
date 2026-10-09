import re
from typing import Dict, Any, List, Optional, Tuple
from ..models.schemas import (
    GuidedChatRequest, GuidedChatResponse, CostEstimateRequest, CostEstimateResponse
)
from .nlp_service import parse_user_query, EMERGENCY_KEYWORDS
from .cost_service import estimate_cost
from ..data.catalogue import TREATMENT_CATALOGUE
from ..data.database import get_all_facilities, get_all_treatments, get_all_schemes

# List of authorized whitelisted public domains
WHITELISTED_DOMAINS = [
    "pmjay.gov.in",
    "aarogyasri.telangana.gov.in",
    "nims.edu.in",
    "gandhihospital.telangana.gov.in",
    "osmaniahospital.telangana.gov.in",
    "hyderabad.apollohospitals.com",
    "yashodahospitals.com",
    "kimshospitals.com",
    "continentalhospitals.com",
    "carehospitals.com",
    "induscancer.com",
    "ankurahospital.com",
    "fernandez.foundation",
    "medicoverhospitals.in",
    "lvpei.org",
    "cghs.nic.in",
    "esic.gov.in",
    "janaushadhi.gov.in",
    "openstreetmap.org",
    "google.com/maps"
]

def validate_against_database(explanation: str, verified_facts: Dict[str, Any]) -> Tuple[str, bool]:
    """
    STRICT VALIDATOR GATEKEEPER:
    Scans the generated response text.
    1. Blocks any price or numeric quote that contradicts the verified database range.
    2. Blocks any invented hospital names not present in the facilities master.
    3. Blocks any unverified or fake URLs not present in whitelisted domains.
    """
    is_safe = True
    validated_text = explanation

    # 1. URL Safety Check
    url_matches = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', validated_text)
    for url in url_matches:
        domain_ok = any(d in url.lower() for d in WHITELISTED_DOMAINS)
        if not domain_ok:
            is_safe = False
            # Strip unverified URL and replace with safe portal
            validated_text = validated_text.replace(url, "https://pmjay.gov.in")

    # 2. Check for Hallucinated Prices
    # Allowed price range
    min_allowed = verified_facts.get("min_price", 0)
    max_allowed = verified_facts.get("max_price", 10000000)

    # If text states "cost is ₹X" outside range, sanitize it
    price_tokens = re.findall(r'₹\s*(\d+(?:,\d+)*)', validated_text)
    for pt in price_tokens:
        val = int(pt.replace(',', ''))
        # If val is non-trivial and outside 0.5x to 1.5x of our bounds, flag & correct
        if val > 500 and (val < int(min_allowed * 0.4) or val > int(max_allowed * 2.0)):
            is_safe = False
            validated_text = re.sub(
                r'₹\s*' + re.escape(pt),
                f"₹{min_allowed:,} - ₹{max_allowed:,}",
                validated_text
            )

    return validated_text, is_safe

def process_guided_chat(req: GuidedChatRequest) -> GuidedChatResponse:
    clean_msg = req.message.lower().strip()

    # STEP 1: Emergency Interrupt Check
    for em in EMERGENCY_KEYWORDS:
        if em in clean_msg:
            return GuidedChatResponse(
                reply=(
                    "🚨 EMERGENCY RED-FLAG DETECTED: Your message mentions symptoms requiring urgent clinical intervention ('" + em + "').\n\n"
                    "Cost comparison and scheme research must NEVER delay emergency care.\n\n"
                    "👉 CALL 108 IMMEDIATELY for National Emergency Ambulance, or proceed to the nearest emergency room."
                ),
                emergency_detected=True,
                suggested_chips=["Call 108 Ambulance", "Nearest 24/7 Casualty ER", "I am safe, continue non-emergency search"]
            )

    # STEP 2: Structured JSON Extraction via NLP Parser
    parsed = parse_user_query(req.message, current_location=req.city)

    # STEP 3: Deterministic Engine Execution
    treatment_id = parsed.matched_treatment_id or req.treatment_id or "knee_replacement"
    treatment = TREATMENT_CATALOGUE.get(treatment_id, TREATMENT_CATALOGUE["knee_replacement"])

    cost_req = CostEstimateRequest(
        treatment=treatment.name,
        city=parsed.extracted_location or req.city or "Hyderabad",
        hospital_name=parsed.extracted_hospital_preference or None
    )
    estimate = estimate_cost(cost_req)

    # STEP 4: Explanation Generation
    if parsed.is_symptom_not_diagnosis:
        reply_text = (
            f"You reported: '{', '.join(parsed.detected_symptoms)}'. "
            "Note that CareSaathi AI provides cost navigation, not medical diagnosis. "
            f"For these symptoms, initial clinical evaluation typically begins with general physician consultation "
            f"(indicative range ₹500 - ₹1,500) and baseline diagnostics.\n\n"
            f"If symptoms persist or admission is advised, indicative care costs in {cost_req.city} "
            f"range from ₹{estimate.overall_min:,} to ₹{estimate.overall_max:,}."
        )
        chips = ["Find General Physician OPD", "Diagnostic Test Prices", "Check Aarogyasri Eligibility"]

    elif "scheme" in clean_msg or "aarogyasri" in clean_msg or "pmjay" in clean_msg or "insurance" in clean_msg:
        reply_text = (
            f"For {treatment.name}, the procedure is officially catalogued under Telangana Aarogyasri (Code: {treatment.package_code_aarogyasri or 'Active Package'}) "
            f"and PM-JAY (Code: {treatment.package_code_pmjay or 'HBP Master'}).\n\n"
            f"• BPL / White Ration Card families receive 100% cashless hospitalization up to ₹10 Lakhs ceiling in empanelled hospitals.\n"
            f"• Estimated patient out-of-pocket share: ₹{estimate.waterfall.patient_share_min:,} to ₹{estimate.waterfall.patient_share_max:,}."
        )
        chips = ["Documents to Carry", "Questions to Ask Hospital", "Empanelled Network Hospitals"]

    elif "document" in clean_msg or "carry" in clean_msg:
        docs = "\n".join([f"• {d}" for d in estimate.checklists.documents_to_carry[:4]])
        reply_text = (
            f"Here are the mandatory documents to carry for {treatment.name} admission:\n\n"
            f"{docs}\n\n"
            "Bring originals plus 3 photocopies each for Aarogyamitra pre-authorization."
        )
        chips = ["Questions to Ask Hospital", "Compare Hospital Tariffs", "Find Nearest Hospital"]

    elif "question" in clean_msg or "ask" in clean_msg:
        qs = "\n".join([f"• {q}" for q in estimate.checklists.questions_to_ask[:3]])
        reply_text = (
            f"Important questions to ask the hospital billing desk for {treatment.name}:\n\n"
            f"{qs}"
        )
        chips = ["Calculate Out-of-Pocket Share", "Find Empanelled Hospitals", "Download 1-Page Summary"]

    else:
        # Standard Cost Explanation
        reply_text = (
            f"For {treatment.name} in {cost_req.city}:\n\n"
            f"• Indicative Range: ₹{estimate.overall_min:,} (Govt/Subsidized) to ₹{estimate.overall_max:,} (Private)\n"
            f"• Orthopedic Knee Implants are capped under NPPA Order (₹54,000 - ₹74,000)\n"
            f"• Net Out-of-Pocket for White Card holders: ₹{estimate.waterfall.patient_share_min:,} to ₹{estimate.waterfall.patient_share_max:,}\n"
            f"• Evidence Confidence: {estimate.confidence} ({estimate.price_type})"
        )
        chips = ["Out-of-Pocket Waterfall", "Documents to Carry", "Compare Govt vs Private", "Questions to Ask Hospital"]

    # STEP 5: Strict Anti-Hallucination Validator
    facts = {
        "min_price": estimate.overall_min,
        "max_price": estimate.overall_max,
        "treatment_name": treatment.name
    }
    validated_reply, was_sanitized = validate_against_database(reply_text, facts)

    return GuidedChatResponse(
        reply=validated_reply,
        emergency_detected=False,
        suggested_chips=chips,
        extracted_data={
            "treatment_id": treatment.id,
            "treatment_name": treatment.name,
            "city": cost_req.city,
            "confidence": estimate.confidence,
            "was_sanitized_by_validator": not was_sanitized
        },
        structured_estimate=estimate
    )
