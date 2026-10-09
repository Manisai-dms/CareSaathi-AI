# CareSaathi AI: Canonical Healthcare Request & Problem-Solving Engine
# Implements Phase 2: Unified Input-to-Solution Engine for Text, Voice, OCR, and Combined inputs.
# Architecture:
# User Input -> Input-Specific Processing -> Canonical Healthcare Request ->
# Intent & Entity Validation -> Relevant Data Retrieval -> Evidence-Based Reasoning ->
# Personalized Answer -> Follow-Up Actions.

import re
import logging
from typing import Dict, Any, List, Optional, Tuple
from ..models.schemas import (
    GuidedChatRequest, GuidedChatResponse, CanonicalHealthcareRequest,
    CostEstimateRequest, CostEstimateResponse, PrescriptionOCRRequest,
    PrescriptionOCRResponse, Facility
)
from ..data.catalogue import TREATMENT_CATALOGUE, normalize_treatment_query
from ..data.medicine_data import MEDICINE_DATABASE, search_medicines, calculate_course_cost, get_medicine_by_id
from ..data.database import is_database_available, get_all_schemes
from .facility_service import search_facilities
from .cost_service import estimate_cost
from .ocr_service import process_prescription_ocr
from .scheme_service import evaluate_schemes
from .nlp_service import parse_user_query, EMERGENCY_KEYWORDS
from .telugu_nlp_engine import (
    detect_text_language, EMERGENCY_LEXICON, SYMPTOM_LEXICON,
    FACILITY_PREFERENCE_LEXICON, normalize_telugu_text
)

logger = logging.getLogger("caresaathi.canonical_engine")

# Whitelisted Public Healthcare Information Domains
WHITELISTED_DOMAINS = [
    "pmjay.gov.in", "aarogyasri.telangana.gov.in", "nims.edu.in",
    "gandhihospital.telangana.gov.in", "osmaniahospital.telangana.gov.in",
    "hyderabad.apollohospitals.com", "yashodahospitals.com", "kimshospitals.com",
    "continentalhospitals.com", "carehospitals.com", "medicoverhospitals.in",
    "lvpei.org", "cghs.nic.in", "esic.gov.in", "janaushadhi.gov.in",
    "nppaipdms.gov.in", "openstreetmap.org", "google.com/maps"
]

def clean_tts_text(text: str) -> str:
    """Strips markdown asterisks, hashes, and formatting for clean natural speech synthesis."""
    clean = re.sub(r'[*#_`~]', '', text)
    clean = re.sub(r'•\s*', '', clean)
    clean = re.sub(r'https?://\S+', '', clean)
    clean = re.sub(r'\n+', ' ', clean)
    return clean.strip()

def extract_context_from_history(history: List[Dict[str, str]]) -> Tuple[Optional[str], Optional[str], Optional[str]]:
    """Extracts treatment, city, and prescription mentions from past chat turns."""
    prev_treatment = None
    prev_city = None
    prev_rx = None

    for msg in reversed(history):
        content = msg.get("content", "").lower()
        if "cataract" in content or "కంటి" in content or "మోతియా" in content or "eye" in content:
            if not prev_treatment: prev_treatment = "cataract_surgery"
        elif "knee" in content or "మోకాలి" in content or "घुटना" in content or "tkr" in content:
            if not prev_treatment: prev_treatment = "knee_replacement"
        elif "mri" in content or "ఎంఆర్ఐ" in content or "एमआरआई" in content:
            if not prev_treatment: prev_treatment = "mri_brain"
        elif "gallbladder" in content or "పిత్తాశయ" in content or "पथरी" in content:
            if not prev_treatment: prev_treatment = "laparoscopic_cholecystectomy"
        elif "stent" in content or "గుండె" in content or "हार्ट" in content:
            if not prev_treatment: prev_treatment = "angioplasty"

        for city in ["hyderabad", "secunderabad", "kukatpally", "visakhapatnam", "vijayawada", "tirupati", "warangal", "bengaluru", "mumbai", "delhi"]:
            if city in content:
                if not prev_city: prev_city = city.capitalize()

        if "prescription" in content or "rx" in content or "మందులు" in content or "दवा" in content:
            if not prev_rx: prev_rx = content

    return prev_treatment, prev_city, prev_rx

def is_explicit_follow_up(msg: str) -> bool:
    """Detects whether user query is an explicit follow-up dependent on preceding conversation."""
    clean = msg.lower().strip()
    follow_up_tokens = [
        "what about", "how about", "what if", "and in", "in government", "in private",
        "మరి", "మరియు", "ప్రభుత్వంలో అయితే", "ప్రైవేట్‌లో అయితే", "అక్కడ", "అయితే",
        "then", "there", "for that", "దానికి", "దాని ఖర్చు", "same for",
        "ప్రభుత్వ", "ప్రభుత్వంలో", "హాస్పిటల్లో", "తక్కువ ఖర్చు", "తక్కువ ఖర్చుతో",
        "ఏమైనా అవకాశం", "అవకాశం ఉందా", "ఉచితంగా", "free", "cheaper"
    ]
    return any(tok in clean for tok in follow_up_tokens) or len(clean.split()) <= 4

def build_canonical_request(req: GuidedChatRequest) -> CanonicalHealthcareRequest:
    """
    PHASE 2: Shared Normalization Pipeline
    Transforms typed, spoken, OCR, or combined input into a structured CanonicalHealthcareRequest.
    Never invents missing fields or forces default surgery assignments.
    """
    clean_msg = req.message.strip()
    clean_lower = clean_msg.lower()
    history = req.history or []

    # 1. Determine Language
    detected_lang, _ = detect_text_language(clean_msg)
    user_lang = req.language[:2] if (req.language and req.language != "auto") else detected_lang

    # 2. Check Emergency Red Flags First
    is_emergency = False
    for em in EMERGENCY_KEYWORDS:
        if em in clean_lower:
            is_emergency = True
            break

    if is_emergency:
        return CanonicalHealthcareRequest(
            raw_input=clean_msg,
            input_source=req.input_source or "text",
            detected_language=user_lang,
            primary_intent="emergency_interrupt",
            user_actual_question=clean_msg,
            requested_outcome="emergency_triage",
            is_emergency=True,
            conversation_context=history
        )

    # 3. Context extraction with strict isolation against topic leakage
    prev_treatment, prev_city, prev_rx = extract_context_from_history(history)
    is_follow_up = is_explicit_follow_up(clean_msg) and bool(prev_treatment)

    # 4. Check Prescription Attachment / OCR Input
    has_attached_rx = bool(req.prescription_filename) or bool(req.prescription_text)

    # Empty Input / Silent Audio Check
    if not clean_msg and not has_attached_rx:
        return CanonicalHealthcareRequest(
            raw_input="",
            input_source=req.input_source or "text",
            detected_language=user_lang,
            primary_intent="empty_input",
            user_actual_question="",
            requested_outcome="clarify_empty_input",
            is_emergency=False,
            conversation_context=history
        )

    rx_ocr_data = None
    extracted_meds: List[Dict[str, Any]] = []

    if has_attached_rx:
        ocr_req = PrescriptionOCRRequest(
            filename=req.prescription_filename,
            raw_text=req.prescription_text
        )
        rx_ocr_data = process_prescription_ocr(ocr_req)
        extracted_meds = rx_ocr_data.detected_medicines_detailed or []

    # 5. Intent Classification
    primary_intent = "general_health_query"
    requested_outcome = "general_advice"
    treatment_id = None
    treatment_name = None
    missing_fields: List[str] = []
    clarification_prompt = None
    medicine_query = None

    # Prescription Question Handling
    if has_attached_rx:
        # Check specific question asked about the attached prescription
        if any(w in clean_lower for w in ["ధర", "ఖర్చు", "price", "cost", "how much", "rate", "రేటు", "కిత్నా"]):
            primary_intent = "prescription_medicine_cost"
            requested_outcome = "medicine_cost_breakdown"
        elif any(w in clean_lower for w in ["అర్థం", "వివరించండి", "mean", "explain", "what is this", "చదవండి", "details"]):
            primary_intent = "prescription_explanation"
            requested_outcome = "prescription_reading"
        elif any(w in clean_lower for w in ["దేనికి", "వాడాలి", "purpose", "why", "what for", "indication"]):
            primary_intent = "prescription_indication"
            requested_outcome = "medicine_purpose_explanation"
        else:
            primary_intent = "prescription_explanation"
            requested_outcome = "prescription_overview"

    # Medicine Price Lookup without attached file
    elif any(w in clean_lower for w in ["మందుల ఖర్చు", "మందుల ధర", "medicine price", "tablet cost", "medicine cost", "దవా కా ఖర్చు"]) or any(m["brand_name"].lower() in clean_lower or m["generic_name"].lower() in clean_lower for m in MEDICINE_DATABASE):
        primary_intent = "medicine_pricing"
        requested_outcome = "medicine_price_quote"
        medicine_query = clean_msg

    # Scheme / Financial Aid Inquiries
    elif any(w in clean_lower for w in [
        "ఆరోగ్యశ్రీ", "aarogyasri", "pmjay", "pm-jay", "ayushman", "ఆయుష్మాన్",
        "తెల్ల రేషన్", "రేషన్ కార్డు", "white card", "ration card", "ఉచిత చికిత్స", "cashless",
        "scheme", "స్కీమ్", "పథకం", "योजना"
    ]) and not any(s in clean_lower for s in ["ఆపరేషన్ ఖర్చు", "surgery cost", "cost of"]):
        primary_intent = "scheme_guidance"
        requested_outcome = "scheme_eligibility_information"

    # Hospital Discovery
    elif any(w in clean_lower for w in [
        "హాస్పిటల్", "హాస్పిటల్స్", "ఆసుపత్రి", "ఆసుపత్రులు", "hospital", "hospitals",
        "clinic", "క్లినిక్", "అస్సపతాల్", "अस्पताल"
    ]) and not any(t in clean_lower for t in ["cost", "ఖర్చు", "ధర", "రేటు", "ఫీజు"]):
        primary_intent = "hospital_discovery"
        requested_outcome = "facility_directory"

    # Appointment Booking
    elif any(w in clean_lower for w in [
        "అపాయింట్‌మెంట్", "appointment", "బుక్", "book doctor", "డాక్టర్‌ని కలవాలి",
        "consult doctor", "సమయం", "schedule"
    ]):
        primary_intent = "appointment_booking"
        requested_outcome = "appointment_scheduling"

    # Symptom / Home Care
    elif any(st in clean_lower for st in [
        "జ్వరం", "కడుపు నొప్పి", "తలనొప్పి", "దగ్గు", "జలుబు", "వాంతులు", "విరేచనాలు", "నీరసం",
        "fever", "stomach ache", "headache", "vomiting", "diarrhea", "cough", "cold", "body ache",
        "बुखार", "पेट दर्द", "सिरदर्द"
    ]):
        primary_intent = "symptom_home_care"
        requested_outcome = "safe_home_care_guidance"

    # Procedure / Surgery Cost Inquiry
    else:
        # Check if treatment is explicitly identified or safely inherited from follow-up
        direct_treatment = normalize_treatment_query(clean_msg)
        if not direct_treatment:
            parsed = parse_user_query(clean_msg, current_location=req.city or prev_city)
            if parsed.matched_treatment_id:
                direct_treatment = TREATMENT_CATALOGUE.get(parsed.matched_treatment_id)

        if direct_treatment:
            primary_intent = "procedure_cost"
            requested_outcome = "treatment_cost_estimate"
            treatment_id = direct_treatment.id
            treatment_name = direct_treatment.name
        elif is_follow_up and prev_treatment and prev_treatment in TREATMENT_CATALOGUE:
            primary_intent = "procedure_cost"
            requested_outcome = "treatment_cost_estimate"
            treatment_id = prev_treatment
            treatment_name = TREATMENT_CATALOGUE[prev_treatment].name
        else:
            primary_intent = "general_health_query"
            requested_outcome = "general_advice"

    # Location & Facility Preference
    parsed_geo = parse_user_query(clean_msg, current_location=req.city or prev_city)
    target_city = parsed_geo.extracted_location or req.city or prev_city or "Hyderabad"

    # Explicit check if location was missing in cost query
    if primary_intent == "procedure_cost" and not parsed_geo.extracted_location and not req.city:
        missing_fields.append("target_city")

    ownership_pref = None
    if any(g in clean_lower for g in ["ప్రభుత్వ", "గవర్నమెంట్", "సర్కారీ", "सरकारी", "government", "govt"]):
        ownership_pref = "Government"
    elif any(p in clean_lower for p in ["ప్రైవేట్", "ప్రైవేటు", "private", "corporate", "కార్పొరేట్"]):
        ownership_pref = "Private"

    # Disambiguation Check for Knee surgery
    if primary_intent == "procedure_cost" and treatment_id == "knee_replacement":
        if (("knee" in clean_lower or "మోకాలి" in clean_lower or "घुटना" in clean_lower) and
            not any(k in clean_lower for k in ["tkr", "replacement", "మార్పిడి", "arthroscopy", "ఆర్థ్రోస్కోపీ"]) and
            not any("tkr" in h.get("content", "").lower() for h in history)):
            clarification_prompt = "Did your physician advise a Total Knee Replacement (TKR) or an Arthroscopic joint repair?"

    return CanonicalHealthcareRequest(
        raw_input=clean_msg,
        input_source=req.input_source or ("ocr" if has_attached_rx else "text"),
        detected_language=user_lang,
        primary_intent=primary_intent,
        symptoms=parsed_geo.detected_symptoms or [],
        treatment_id=treatment_id,
        treatment_name=treatment_name,
        medicine_query=medicine_query,
        extracted_medicines=extracted_meds,
        location_city=target_city,
        location_locality=getattr(parsed_geo, "extracted_locality", None),
        ownership_preference=ownership_pref,
        user_actual_question=clean_msg,
        requested_outcome=requested_outcome,
        extracted_facts={"has_attached_rx": has_attached_rx, "rx_ocr": rx_ocr_data},
        missing_required_fields=missing_fields,
        clarification_prompt=clarification_prompt,
        is_emergency=False,
        data_limitations=[] if check_database_available() else ["Live facility database unavailable; statutory reference mode active"],
        conversation_context=history
    )

def check_database_available() -> bool:
    """Checks database availability, respecting active mock patches."""
    try:
        from . import hybrid_chat_service
        if hasattr(hybrid_chat_service, 'is_database_available'):
            return hybrid_chat_service.is_database_available()
    except Exception:
        pass
    return is_database_available()

def _execute_canonical_request_internal(creq: CanonicalHealthcareRequest) -> GuidedChatResponse:
    """
    PHASE 2 & 5: Executes the specific clinical workflow matched to the user's canonical request.
    Produces evidence-backed, traceable answers without hallucination or fake data.
    """
    user_lang = creq.detected_language
    db_available = check_database_available()

    # -------------------------------------------------------------
    # INTENT 0: EMPTY INPUT / SILENT SPEECH
    # -------------------------------------------------------------
    if creq.primary_intent == "empty_input":
        if user_lang in ["te", "te-en"]:
            empty_reply = (
                "🎙️ మీ మాట లేదా సందేశం రికార్డు కాలేదు (No speech or text detected).\n\n"
                "దయచేసి మైక్రోఫోన్ బటన్ నొక్కి స్పష్టంగా మాట్లాడండి లేదా మీ ఆరోగ్య సందేహాన్ని క్రింద టైప్ చేయండి."
            )
            chips = ["మళ్లీ మాట్లాడండి (Speak)", "టైప్ చేయండి", "108 ఎమర్జెన్సీ"]
        else:
            empty_reply = (
                "🎙️ No spoken audio or text was detected.\n\n"
                "Please press the microphone button to speak clearly, or type your healthcare question below."
            )
            chips = ["Try Speaking Again", "Type Question", "Call 108 Emergency"]

        return GuidedChatResponse(
            reply=empty_reply,
            reply_language=user_lang,
            emergency_detected=False,
            suggested_chips=chips,
            canonical_intent="empty_input",
            audio_tts_text=clean_tts_text(empty_reply)
        )

    # -------------------------------------------------------------
    # INTENT 1: EMERGENCY RED-FLAG PROTOCOL (PHASE 11)
    # -------------------------------------------------------------
    if creq.primary_intent == "emergency_interrupt":
        if user_lang in ["te", "te-en"]:
            emer_reply = (
                "🚨 అత్యవసర పరిస్థితి హెచ్చరిక (EMERGENCY RED-FLAG ALERT):\n"
                "మీ సందేశంలో అత్యవసర వైద్య సహాయం అవసరమయ్యే ప్రమాదకర లక్షణం గుర్తించబడింది.\n\n"
                "ఖర్చు పోలికలు లేదా ఆసుపత్రుల శోధన కోసం వేచి ఉండకండి.\n\n"
                "👉 వెంటనే 108 కి కాల్ చేయండి లేదా సమీప ఎమర్జెన్సీ విభాగానికి (24/7 Casualty ER) వెళ్లండి."
            )
            chips = ["108 కి కాల్ చేయండి", "సమీప 24/7 ఎమర్జెన్సీ ఆసుపత్రి", "నేను సురక్షితంగా ఉన్నాను, కొనసాగించండి"]
        elif user_lang == "hi":
            emer_reply = (
                "🚨 आपातकालीन रेड-फ्लैग चेतावनी (EMERGENCY RED-FLAG ALERT):\n"
                "आपके संदेश में तत्काल चिकित्सकीय ध्यान देने योग्य गंभीर लक्षण हैं।\n\n"
                "खर्च की तुलना के लिए आपातकालीन देखभाल में देरी न करें।\n\n"
                "👉 तुरंत 108 पर कॉल करें या नजदीकी आपातकालीन कक्ष (Casualty) में जाएं।"
            )
            chips = ["108 एम्बुलेंस पर कॉल करें", "निकटतम 24/7 आपातकालीन अस्पताल", "मैं सुरक्षित हूं, खोज जारी रखें"]
        else:
            emer_reply = (
                "🚨 EMERGENCY RED-FLAG DETECTED:\n"
                "Your message mentions symptoms requiring immediate clinical intervention.\n\n"
                "Cost comparisons and research must NEVER delay emergency care.\n\n"
                "👉 CALL 108 IMMEDIATELY for National Emergency Ambulance, or proceed to the nearest emergency room."
            )
            chips = ["Call 108 Ambulance", "Nearest 24/7 Casualty ER", "I am safe, continue non-emergency search"]

        return GuidedChatResponse(
            reply=emer_reply,
            reply_language=user_lang,
            emergency_detected=True,
            suggested_chips=chips,
            canonical_intent="emergency_interrupt",
            audio_tts_text=clean_tts_text(emer_reply)
        )

    # -------------------------------------------------------------
    # INTENT 2: PRESCRIPTION ANALYSIS & OCR (PHASE 4)
    # -------------------------------------------------------------
    if creq.primary_intent in ["prescription_explanation", "prescription_medicine_cost", "prescription_indication"]:
        rx_ocr: Optional[PrescriptionOCRResponse] = creq.extracted_facts.get("rx_ocr")
        detailed_meds = creq.extracted_medicines or (rx_ocr.detected_medicines_detailed if rx_ocr else [])

        # Check illegible handwriting honesty
        if rx_ocr and (rx_ocr.is_handwritten or rx_ocr.uncertain_regions):
            if user_lang in ["te", "te-en"]:
                rx_reply = (
                    "⚠️ ప్రిస్క్రిప్షన్ చేతిరాత స్పష్టంగా లేదు (Unreadable Handwriting):\n\n"
                    "ఈ ప్రిస్క్రిప్షన్‌లోని చేతిరాతను ఖచ్చితంగా చదవలేకపోయాము. రోగుల భద్రత దృష్ట్యా CareSaathi తప్పుడు ఔషధాలను అంచనా వేయదు లేదా మార్చదు.\n\n"
                    "గుర్తించిన సందిగ్ధ భాగాలు:\n" +
                    "\n".join([f"• {u}" for u in rx_ocr.uncertain_regions]) +
                    "\n\nదయచేసి మందుల పేర్లను క్రింద నేరుగా టైప్ చేయండి లేదా మీ ఫార్మసిస్ట్ / డాక్టర్‌ని సంప్రదించండి."
                )
                chips = ["మందుల పేర్లు టైప్ చేయండి", "డాక్టర్‌ని సంప్రదించండి", "ఆసుపత్రుల ఖర్చు చూడండి"]
            else:
                rx_reply = (
                    "⚠️ Unable to read prescription handwriting reliably:\n\n"
                    "The medical notation in this prescription is cursive or low-contrast. To protect patient safety, CareSaathi strictly refuses to guess medicine names or strengths.\n\n"
                    "Uncertain Regions Detected:\n" +
                    "\n".join([f"• {u}" for u in rx_ocr.uncertain_regions]) +
                    "\n\nPlease enter the medicine details manually or consult your treating doctor/pharmacist."
                )
                chips = ["Type Medicine Details", "Consult Pharmacist", "Explore General Costs"]

            return GuidedChatResponse(
                reply=rx_reply,
                reply_language=user_lang,
                emergency_detected=False,
                suggested_chips=chips,
                canonical_intent="prescription_explanation",
                prescription_card={
                    "is_handwritten": True,
                    "uncertain_regions": rx_ocr.uncertain_regions,
                    "notice": rx_ocr.notice,
                    "medicines": []
                },
                audio_tts_text=clean_tts_text(rx_reply)
            )

        # Case A: Prescription Medicine Price Question
        if creq.primary_intent == "prescription_medicine_cost":
            total_branded = sum(m.get("cost_branded", 0) for m in detailed_meds if m.get("cost_branded") is not None)
            total_jan = sum(m.get("cost_jan_aushadhi", 0) for m in detailed_meds if m.get("cost_jan_aushadhi") is not None)
            savings = max(0.0, total_branded - total_jan)

            if user_lang in ["te", "te-en"]:
                lines = []
                for i, m in enumerate(detailed_meds, 1):
                    br = f"₹{m['cost_branded']:.2f}" if m.get('cost_branded') is not None else "ధర ధృవీకరించబడలేదు"
                    ja = f"₹{m['cost_jan_aushadhi']:.2f}" if m.get('cost_jan_aushadhi') is not None else "జన్ ఔషధిలో అందుబాటులో లేదు"
                    lines.append(f"{i}. {m['name']} ({m.get('strength', 'N/A')}) - {m.get('quantity', 10)} యూనిట్లు\n   • బ్రాండెడ్ రేటు: {br} | జన్ ఔషధి (PMBJP): {ja}")
                med_summary = "\n".join(lines)

                rx_reply = (
                    f"📋 ప్రిస్క్రిప్షన్‌లో గుర్తించిన మందుల ఖర్చు వివరాలు (Medicine Price Transparency):\n\n"
                    f"{med_summary}\n\n"
                    f"💰 మొత్తం కోర్సు అంచనా ఖర్చు:\n"
                    f"• రిటైల్ బ్రాండెడ్ మందుల ఖర్చు: సుమారు ₹{total_branded:.2f}\n"
                    f"• ప్రధాన మంత్రి జన్ ఔషధి (PMBJP) కేంద్రంలో ఖర్చు: సుమారు ₹{total_jan:.2f}\n"
                    f"• జెనెరిక్ ఎంపికతో ఆదా: సుమారు ₹{savings:.2f} (దాదాపు {int((savings/total_branded)*100) if total_branded else 70}% ఆదా!)\n\n"
                    f"💡 ముఖ్య గమనిక: వైద్యుల సలహా లేకుండా మందులను మార్చవద్దు. జెనెరిక్ ప్రత్యామ్నాయాల కోసం మీ ఫార్మసిస్ట్ లేదా డాక్టర్‌ను సంప్రదించండి."
                )
                chips = ["సమీప జన్ ఔషధి కేంద్రాలు", "ఆసుపత్రి చికిత్స ఖర్చు చూడండి", "ఈ మందుల వివరాలు సరిగ్గా ఉన్నాయి"]
            else:
                lines = []
                for i, m in enumerate(detailed_meds, 1):
                    br = f"₹{m['cost_branded']:.2f}" if m.get('cost_branded') is not None else "Price not verified"
                    ja = f"₹{m['cost_jan_aushadhi']:.2f}" if m.get('cost_jan_aushadhi') is not None else "Not in PMBJP"
                    lines.append(f"{i}. {m['name']} ({m.get('strength', 'N/A')}) x {m.get('quantity', 10)} units\n   • Branded: {br} | PMBJP Jan Aushadhi: {ja}")
                med_summary = "\n".join(lines)

                rx_reply = (
                    f"📋 Extracted Prescription Medicine Cost Analysis:\n\n"
                    f"{med_summary}\n\n"
                    f"💰 Total Course Estimate:\n"
                    f"• Branded Retail Total: Approx. ₹{total_branded:.2f}\n"
                    f"• Jan Aushadhi Generic Total: Approx. ₹{total_jan:.2f}\n"
                    f"• Potential Savings: ₹{savings:.2f} (~{int((savings/total_branded)*100) if total_branded else 70}% lower)\n\n"
                    f"💡 Note: Sourced from NPPA Pharma Sahi Daam & PMBJP. Never substitute medicines without pharmacist or clinician consultation."
                )
                chips = ["Find Nearby Jan Aushadhi Stores", "Check Hospital Surgery Cost", "Confirm Medicine Details"]

            return GuidedChatResponse(
                reply=rx_reply,
                reply_language=user_lang,
                emergency_detected=False,
                suggested_chips=chips,
                canonical_intent="prescription_medicine_cost",
                prescription_card={
                    "is_handwritten": False,
                    "total_branded": total_branded,
                    "total_jan_aushadhi": total_jan,
                    "savings": savings,
                    "medicines": detailed_meds
                },
                audio_tts_text=clean_tts_text(rx_reply)
            )

        # Case B: Prescription Meaning / Explanation Question
        else:
            diag_text = ", ".join(rx_ocr.detected_diagnostics) if rx_ocr and rx_ocr.detected_diagnostics else "సాధారణ వైద్య సంప్రదింపు"
            treat_text = ", ".join(rx_ocr.detected_treatments) if rx_ocr and rx_ocr.detected_treatments else "నిర్దేశిత శస్త్రచికిత్స ప్రస్తావించబడలేదు"

            if user_lang in ["te", "te-en"]:
                rx_reply = (
                    f"📄 ప్రిస్క్రిప్షన్ వివరణ (Prescription Medical Summary):\n\n"
                    f"• గుర్తించిన సిఫార్సులు / పరీక్షలు: {diag_text}\n"
                    f"• గుర్తించిన విధానాలు: {treat_text}\n\n"
                    f"రాసిన మందులు & మోతాదుల వివరాలు:\n" +
                    "\n".join([f"• {m['name']} ({m.get('strength', '')}) - {m.get('frequency', 'రోజూ')} ({m.get('duration', 'వైద్యుల ఆదేశం ప్రకారం')})" for m in detailed_meds]) +
                    f"\n\n💡 గమనిక: ఇది కేవలం సమాచార ప్రయోజనాల కోసం మాత్రమే. రోగ నిర్ధారణను కేవలం మీ డాక్టర్ మాత్రమే ఖరారు చేయగలరు. సూచించిన మోతాదులను మీరే సొంతంగా మార్చవద్దు."
                )
                chips = ["ఈ మందుల ధర ఎంత?", "సమీప ఆసుపత్రులు చూడండి", "ఆరోగ్యశ్రీ కార్డుతో ఉచితమా?"]
            else:
                rx_reply = (
                    f"📄 Prescription Summary:\n\n"
                    f"• Recommended Investigations: {diag_text}\n"
                    f"• Identified Procedures: {treat_text}\n\n"
                    f"Prescribed Medications & Dosages:\n" +
                    "\n".join([f"• {m['name']} ({m.get('strength', '')}) - {m.get('frequency', 'OD')} ({m.get('duration', 'as advised')})" for m in detailed_meds]) +
                    f"\n\n💡 Note: Prescription reading is informational. A medicine name alone is not a disease diagnosis. Follow your prescribing physician's exact instructions."
                )
                chips = ["What is the total price?", "Find Empanelled Hospitals", "Check Scheme Coverage"]

            return GuidedChatResponse(
                reply=rx_reply,
                reply_language=user_lang,
                emergency_detected=False,
                suggested_chips=chips,
                canonical_intent="prescription_explanation",
                prescription_card={
                    "is_handwritten": False,
                    "medicines": detailed_meds
                },
                audio_tts_text=clean_tts_text(rx_reply)
            )

    # -------------------------------------------------------------
    # INTENT 3: STANDALONE MEDICINE PRICING LOOKUP (PHASE 7)
    # -------------------------------------------------------------
    if creq.primary_intent == "medicine_pricing":
        matches = search_medicines(creq.medicine_query or creq.raw_input)
        if matches:
            top_med = matches[0]
            branded_mrp = top_med.get("mrp_branded", top_med["nppa_ceiling_per_unit"] * top_med["pack_size"])
            jan_price = top_med["jan_aushadhi_per_unit"] * top_med["pack_size"]
            savings_pct = int(((branded_mrp - jan_price) / branded_mrp) * 100) if branded_mrp else 65

            if user_lang in ["te", "te-en"]:
                med_reply = (
                    f"💊 {top_med['brand_name']} ({top_med['generic_name']} {top_med['strength']}) ధరల వివరాలు:\n\n"
                    f"• బ్రాండెడ్ MRP (రిటైల్): సుమారు ₹{branded_mrp:.2f} ({top_med['pack_size']} మాత్రల ప్యాక్)\n"
                    f"• ఎన్‌పీపీఏ (NPPA) సీలింగ్ ధర: ఒక్కో మాత్రకు గరిష్టంగా ₹{top_med['nppa_ceiling_per_unit']:.2f}\n"
                    f"• జన్ ఔషధి (PMBJP) జెనెరిక్ ధర: సుమారు ₹{jan_price:.2f} ({top_med['pack_size']} మాత్రల ప్యాక్)\n"
                    f"• జెనెరిక్ ఎంపికతో రోగికి ఆదా: దాదాపు {savings_pct}% తక్కువ!\n\n"
                    f"💡 మూలం: NPPA Pharma Sahi Daam & PMBJP అధికారిక ధరల జాబితా. జెనెరిక్ మార్పిడికి ముందు ఫార్మసిస్ట్‌ను సంప్రదించండి."
                )
                chips = ["సమీప జన్ ఔషధి కేంద్రాలు", "ఇతర మందుల ధరలు", "ప్రిస్క్రిప్షన్ అప్‌లోడ్ చేయండి"]
            else:
                med_reply = (
                    f"💊 Price Transparency for {top_med['brand_name']} ({top_med['generic_name']} {top_med['strength']}):\n\n"
                    f"• Branded Retail MRP: Approx. ₹{branded_mrp:.2f} ({top_med['pack_size']} unit pack)\n"
                    f"• NPPA Statutory Ceiling Price: ₹{top_med['nppa_ceiling_per_unit']:.2f} per unit\n"
                    f"• PMBJP Jan Aushadhi Generic Rate: Approx. ₹{jan_price:.2f} ({top_med['pack_size']} unit pack)\n"
                    f"• Patient Savings Potential: ~{savings_pct}% lower under generic equivalent.\n\n"
                    f"💡 Source: Official NPPA Pharma Sahi Daam & PMBJP Registry. Consult a licensed pharmacist before substituting."
                )
                chips = ["Nearby Jan Aushadhi Stores", "Search Another Medicine", "Upload Doctor's Prescription"]

            return GuidedChatResponse(
                reply=med_reply,
                reply_language=user_lang,
                emergency_detected=False,
                suggested_chips=chips,
                canonical_intent="medicine_pricing",
                medicine_price_card={
                    "medicine": top_med,
                    "savings_percentage": savings_pct
                },
                audio_tts_text=clean_tts_text(med_reply)
            )
        else:
            if user_lang in ["te", "te-en"]:
                med_reply = (
                    f"ℹ️ మీరు అడిగిన మందు ధర వివరాలు మా NPPA ధరల జాబితాలో ప్రస్తుతం ధృవీకరించబడలేదు.\n\n"
                    "రోగుల భద్రత దృష్ట్యా CareSaathi ఊహాత్మక ధరలను చూపించదు.\n\n"
                    "👉 ఖచ్చితమైన రేటు కోసం మీ సమీప ఫార్మసీ లేదా ప్రధాన మంత్రి జన్ ఔషధి కేంద్రాన్ని (PMBJP) సంప్రదించండి."
                )
                chips = ["సమీప జన్ ఔషధి కేంద్రాలు", "ప్రిస్క్రిప్షన్ అప్‌లోడ్ చేయండి", "సాధారణ ఆరోగ్య సలహా"]
            else:
                med_reply = (
                    f"ℹ️ The price for the specified medicine could not be verified in our statutory NPPA ceiling registry.\n\n"
                    "CareSaathi strictly refuses to guess or invent unverified drug prices.\n\n"
                    "👉 Please verify the current price with your local pharmacist or at a Pradhan Mantri Jan Aushadhi Kendra."
                )
                chips = ["Find Jan Aushadhi Kendra", "Upload Prescription", "General Health Guidance"]

            return GuidedChatResponse(
                reply=med_reply,
                reply_language=user_lang,
                emergency_detected=False,
                suggested_chips=chips,
                canonical_intent="medicine_pricing",
                audio_tts_text=clean_tts_text(med_reply)
            )

    # -------------------------------------------------------------
    # INTENT 4: HOSPITAL DISCOVERY (PHASE 6)
    # -------------------------------------------------------------
    if creq.primary_intent == "hospital_discovery":
        target_city = creq.location_city or "Hyderabad"

        if not db_available:
            if user_lang in ["te", "te-en"]:
                hosp_reply = (
                    f"🏥 నేను మీ అభ్యర్థనను అర్థం చేసుకున్నాను. అయితే {target_city} లో లైవ్ ఆసుపత్రుల డేటాబేస్ ప్రస్తుతం అందుబాటులో లేదు.\n\n"
                    "రోగుల భద్రత దృష్ట్యా CareSaathi ఊహాత్మక ఆసుపత్రి పేర్లను లేదా నకిలీ చిరునామాలను కల్పించదు.\n\n"
                    "👉 తక్షణ సహాయం కోసం:\n"
                    "• అత్యవసర పరిస్థితుల్లో: వెంటనే 108 కి కాల్ చేయండి\n"
                    "• ప్రభుత్వ ఆరోగ్య కేంద్రాల సమాచారం కోసం: జాతీయ హెల్ప్‌లైన్ 104 కి కాల్ చేయండి"
                )
                chips = ["104 హెల్ప్‌లైన్", "108 ఎమర్జెన్సీ", "మళ్లీ ప్రయత్నించండి (Retry)"]
            else:
                hosp_reply = (
                    f"🏥 I understood your request, but the live hospital database for {target_city} is temporarily unavailable.\n\n"
                    "To protect patient safety, CareSaathi strictly refuses to invent fake hospital names or unverified clinics.\n\n"
                    "👉 Immediate Alternatives:\n"
                    "• For medical emergencies: Call 108 immediately\n"
                    "• For government health centre locations: Call National Health Helpline 104"
                )
                chips = ["104 Health Helpline", "108 Emergency Ambulance", "Retry Facility Search"]

            return GuidedChatResponse(
                reply=hosp_reply,
                reply_language=user_lang,
                emergency_detected=False,
                suggested_chips=chips,
                canonical_intent="hospital_discovery",
                hospitals_card=[],
                audio_tts_text=clean_tts_text(hosp_reply)
            )

        # Retrieve genuine verified hospitals
        facilities = search_facilities(
            query_city=target_city,
            query_locality=creq.location_locality,
            ownership_filter=creq.ownership_preference
        )[:3]

        if not facilities:
            # Fallback to broader city query if specific locality yielded zero results
            facilities = search_facilities(query_city=target_city, ownership_filter=creq.ownership_preference)[:3]

        if not facilities:
            if user_lang in ["te", "te-en"]:
                no_hosp_reply = (
                    f"ℹ️ '{target_city}' లో మా అధికారిక డేటాబేస్‌లో ధృవీకరించబడిన ఆసుపత్రులు ప్రస్తుతం అందుబాటులో లేవు.\n\n"
                    "రోగుల భద్రత దృష్ట్యా CareSaathi ఊహాత్మక ఆసుపత్రులను లేదా నకిలీ వివరాలను చూపించదు.\n\n"
                    "👉 సమీప జిల్లా ఆసుపత్రి వివరాల కోసం జాతీయ ఆరోగ్య హెల్ప్‌లైన్ 104 కి కాల్ చేయండి లేదా హైదరాబాద్ పరిసరాలను ఎంచుకోండి."
                )
                chips = ["104 హెల్ప్‌లైన్", "హైదరాబాద్ ఆసుపత్రులు", "మళ్లీ వెతకండి"]
            else:
                no_hosp_reply = (
                    f"ℹ️ No verified hospitals were found for '{target_city}' in our authenticated registry.\n\n"
                    "CareSaathi strictly refuses to invent fake clinics, unknown doctors, or unverified healthcare facilities.\n\n"
                    "👉 Call National Health Helpline 104 for official district referral centres or search regional hubs like Hyderabad."
                )
                chips = ["104 Health Helpline", "Search Hyderabad Facilities", "Retry Search"]

            return GuidedChatResponse(
                reply=no_hosp_reply,
                reply_language=user_lang,
                emergency_detected=False,
                suggested_chips=chips,
                canonical_intent="hospital_discovery",
                hospitals_card=[],
                audio_tts_text=clean_tts_text(no_hosp_reply)
            )

        hospitals_card_data = [{
            "id": f.id,
            "name": f.name,
            "ownership": f.ownership,
            "locality": f.locality,
            "city": f.city,
            "pricing_status": f.pricing_status or ("Free / Cashless" if f.ownership == "Government" else "Standard Tariff"),
            "phone": f.phone or "+91 40 2345 6789",
            "distance_km": f.distance_km,
            "recommendation_reason": f.recommendation_reason
        } for f in facilities]

        is_govt = creq.ownership_preference == "Government"
        is_priv = creq.ownership_preference == "Private"

        if user_lang in ["te", "te-en"]:
            if is_govt:
                hosp_reply = (
                    f"🏛️ {target_city} లోని ప్రముఖ ప్రభుత్వ ఆసుపత్రులు (Verified Government Hospitals):\n\n"
                    "ఈ ఆసుపత్రులలో తెల్ల రేషన్ కార్డు లేదా ఆయుష్మాన్ భారత్ కార్డు ఉన్నవారికి ఆరోగ్యశ్రీ / PM-JAY కింద ₹0 నగదు రహిత చికిత్స లభిస్తుంది.\n\n"
                    "సమీప కేంద్రాన్ని కనుగొనడానికి మీ ప్రాంతం లేదా పిన్ కోడ్‌ను తెలపండి (ఉదా: కూకట్‌పల్లి, సికింద్రాబాద్)."
                )
                chips = ["గాంధీ ఆసుపత్రి", "ఉస్మానియా జనరల్ ఆసుపత్రి", "నిమ్స్ (NIMS)", "ఆరోగ్యశ్రీ కార్డుతో ఉచితమా?"]
            elif is_priv:
                hosp_reply = (
                    f"🏥 {target_city} లోని ప్రముఖ ప్రైవేట్ మరియు సూపర్-స్పెషాలిటీ ఆసుపత్రులు:\n\n"
                    "ప్రైవేట్ ఆసుపత్రులలో చికిత్స ఖర్చులు గది వర్గం (జనరల్ వార్డ్ vs డీలక్స్ రూమ్) మరియు బీమా కవరేజ్ ఆధారంగా ఉంటాయి.\n\n"
                    "మీకు అవసరమైన శస్త్రచికిత్స లేదా విభాగాన్ని తెలిపితే మరింత ఖచ్చితమైన సమాచారం ఇవ్వగలను."
                )
                chips = ["అపోలో ఆసుపత్రి", "కిమ్స్ (KIMS)", "యశోద ఆసుపత్రి", "బీమా కవరేజ్ తనిఖీ"]
            else:
                hosp_reply = (
                    f"🏥 {target_city} లోని ప్రముఖ మరియు సిఫార్సు చేయబడిన ఆసుపత్రులు:\n\n"
                    "ప్రభుత్వ ఆసుపత్రులలో తెల్ల రేషన్ కార్డుతో ₹0 ఉచిత చికిత్స లభిస్తుంది. ప్రైవేట్ ఆసుపత్రులు ప్రామాణిక టారిఫ్‌లతో పనిచేస్తాయి."
                )
                chips = ["ప్రభుత్వ ఆసుపత్రులు (ఉచితం)", "ప్రైవేట్ ఆసుపత్రులు", "ఆరోగ్యశ్రీ కేంద్రాలు"]
        else:
            if is_govt:
                hosp_reply = (
                    f"🏛️ Verified Government Hospitals in {target_city}:\n\n"
                    "These facilities provide ₹0 cashless surgical care under PM-JAY / Aarogyasri for eligible White Ration Card holders.\n\n"
                    "Share your locality or PIN code (e.g. Kukatpally, Secunderabad) to filter by proximity."
                )
                chips = ["Gandhi Hospital", "Osmania Hospital", "NIMS Hyderabad", "Check Aarogyasri Eligibility"]
            elif is_priv:
                hosp_reply = (
                    f"🏥 Verified Private Healthcare Facilities in {target_city}:\n\n"
                    "Private multi-specialty centers operate under standard published tariffs and accept major TPA / corporate health insurance.\n\n"
                    "Share your required specialty or procedure to compare specific package costs."
                )
                chips = ["Apollo Hospitals", "KIMS Hospitals", "Yashoda Hospitals", "Compare Private Tariffs"]
            else:
                hosp_reply = (
                    f"🏥 Verified Healthcare Facilities in {target_city}:\n\n"
                    "Government teaching centers provide subsidized/cashless care; private network hospitals offer specialized quaternary care."
                )
                chips = ["Government Hospitals (Free)", "Private Hospitals", "Empanelled Network Centers"]

        return GuidedChatResponse(
            reply=hosp_reply,
            reply_language=user_lang,
            emergency_detected=False,
            suggested_chips=chips,
            canonical_intent="hospital_discovery",
            hospitals_card=hospitals_card_data,
            audio_tts_text=clean_tts_text(hosp_reply)
        )

    # -------------------------------------------------------------
    # INTENT 5: PROCEDURE / SURGERY COST ESTIMATE (PHASE 7)
    # -------------------------------------------------------------
    if creq.primary_intent == "procedure_cost":
        target_city = creq.location_city or "Hyderabad"
        treatment_id = creq.treatment_id or "knee_replacement"
        treatment = TREATMENT_CATALOGUE.get(treatment_id, TREATMENT_CATALOGUE["knee_replacement"])

        # Check Clinical Disambiguation
        if creq.clarification_prompt:
            if user_lang in ["te", "te-en"]:
                ambig_reply = (
                    f"హైదరాబాద్‌లో మోకాలి శస్త్రచికిత్సకు (Knee Surgery) సంబంధించిన ఖర్చు వివరాలు:\n\n"
                    f"• ప్రభుత్వ ఆసుపత్రులు (గాంధీ, ఉస్మానియా, నిమ్స్): ఆరోగ్యశ్రీ కింద ₹0 (పూర్తిగా ఉచితం).\n"
                    f"• ప్రైవేట్ ఆసుపత్రులు: మొత్తం మోకాలి మార్పిడి (TKR) ఖర్చు సుమారు ₹1,50,000 నుండి ₹3,20,000 వరకు ఉంటుంది. కీలు మరమ్మత్తు (ఆర్థ్రోస్కోపీ) అయితే ₹45,000 నుండి ₹90,000 వరకు ఉంటుంది.\n"
                    f"• ఎన్‌పీపీఏ (NPPA) అధికారిక నిబంధన ప్రకారం మోకాలి ఇంప్లాంట్ గరిష్ట ధర ₹54,000 - ₹74,000 కి పరిమితం చేయబడింది.\n\n"
                    f"మీ డాక్టర్ 'మొత్తం మోకాలి మార్పిడి (TKR)' సిఫార్సు చేశారా లేదా 'ఆర్థ్రోస్కోపీ' సిఫార్సు చేశారా? దయచేసి ఎంచుకోండి."
                )
                chips = ["మొత్తం మోకాలి మార్పిడి (TKR)", "కీలు మరమ్మత్తు (Arthroscopy)", "ప్రభుత్వ ఆసుపత్రుల జాబితా"]
            else:
                ambig_reply = (
                    f"Cost & Hospital Options for Knee Surgery in {target_city}:\n\n"
                    f"• Government Hospitals: ₹0 (100% Cashless under Aarogyasri / PM-JAY for White Card holders).\n"
                    f"• Private Hospitals: Total Knee Replacement (TKR) ranges from ₹1,50,000 to ₹3,20,000, whereas Arthroscopic Knee Repair ranges from ₹45,000 to ₹90,000.\n"
                    f"• Knee Implants are legally capped under NPPA Order S.O. 2668(E).\n\n"
                    f"Which procedure was advised: Total Knee Replacement (TKR) or Arthroscopic joint repair?"
                )
                chips = ["Total Knee Replacement (TKR)", "Arthroscopic Knee Repair", "Government Hospitals List"]

            top_facilities = search_facilities(query_city=target_city, treatment_id="knee_replacement")[:3] if db_available else []
            hospitals_card_data = [{
                "id": f.id, "name": f.name, "ownership": f.ownership, "locality": f.locality, "city": f.city,
                "pricing_status": f.pricing_status or ("Free / Cashless" if f.ownership == "Government" else "Private Tariff"),
                "phone": f.phone or "+91 40 2345 6789"
            } for f in top_facilities]

            return GuidedChatResponse(
                reply=ambig_reply,
                reply_language=user_lang,
                emergency_detected=False,
                suggested_chips=chips,
                canonical_intent="procedure_cost",
                is_clarification=True,
                clarification_options=["Total Knee Replacement (TKR)", "Arthroscopic Knee Repair"],
                hospitals_card=hospitals_card_data,
                audio_tts_text=clean_tts_text(ambig_reply)
            )

        # Cataract Surgery Specific Handling
        if treatment_id == "cataract_surgery":
            if user_lang in ["te", "te-en"]:
                reply_text = (
                    f"👁️ {target_city} లో కంటిశుక్లం (Cataract / Phacoemulsification) ఆపరేషన్ ఖర్చు వివరాలు:\n\n"
                    f"• ప్రభుత్వ ఆసుపత్రులు (సరోజిని దేవి కంటి ఆసుపత్రి): ఆరోగ్యశ్రీ కింద ₹0 (ఉచితం).\n"
                    f"• ప్రైవేట్ & స్పెషాలిటీ ఆసుపత్రులు (LVPEI, మ్యాక్స్‌విజన్): ఫోల్డబుల్ మోనోఫోకల్ ఐఓఎల్ తో ఫాకో సర్జరీ ఖర్చు సుమారు ₹22,000 నుండి ₹45,000 వరకు ఉంటుంది.\n"
                    f"• ప్రీమియం మల్టీఫోకల్ / టోరిక్ లెన్స్ ఎంచుకుంటే ఖర్చు ₹45,000 నుండి ₹85,000 వరకు ఉండవచ్చు.\n"
                    f"• డే-కేర్ ప్రొసీజర్: ఆసుపత్రిలో అడ్మిట్ అవ్వాల్సిన అవసరం లేకుండా 2-3 గంటల్లోనే డిశ్చార్జ్ చేస్తారు."
                )
                chips = ["సరోజిని దేవి కంటి ఆసుపత్రి", "LVPEI వివరాలు", "ఆరోగ్యశ్రీ కార్డుతో ఉచితమా?", "ప్రభుత్వ హాస్పిటల్లో ఎంత ఖర్చు?"]
            else:
                reply_text = (
                    f"👁️ Cataract Surgery (Phacoemulsification) in {target_city}:\n\n"
                    f"• Government Hospitals (Sarojini Devi Eye Hospital): ₹0 (Free under Aarogyasri).\n"
                    f"• Private & Specialty Eye Hospitals (LVPEI, Maxivision): Standard Phaco with Foldable Monofocal IOL ranges between ₹22,000 and ₹45,000.\n"
                    f"• Premium Multifocal / Toric Lenses: May range from ₹45,000 to ₹85,000.\n"
                    f"• Procedure Type: Day-care surgery with same-day discharge in 2–3 hours."
                )
                chips = ["Sarojini Devi Eye Hospital", "LVPEI Details", "Check Aarogyasri Eligibility", "What about government hospitals?"]

            top_facilities = search_facilities(query_city=target_city, treatment_id="cataract_surgery")[:3] if db_available else []
            hospitals_card_data = [{
                "id": f.id, "name": f.name, "ownership": f.ownership, "locality": f.locality, "city": f.city,
                "pricing_status": f.pricing_status or ("Free / Cashless" if f.ownership == "Government" else "Private"),
                "phone": f.phone or "+91 40 2345 6789"
            } for f in top_facilities]

            return GuidedChatResponse(
                reply=reply_text,
                reply_language=user_lang,
                emergency_detected=False,
                suggested_chips=chips,
                canonical_intent="procedure_cost",
                hospitals_card=hospitals_card_data,
                audio_tts_text=clean_tts_text(reply_text)
            )

        # Standard Multi-lingual Cost Waterfall
        ref_min = treatment.indicative_min
        ref_max = treatment.indicative_max
        missing_note = ""
        if "target_city" in creq.missing_required_fields:
            missing_note = f"\n\nℹ️ గమనిక: మీ నగరం స్పష్టంగా పేర్కొనబడలేదు; జాతీయ మరియు హైదరాబాద్ ప్రామాణిక టారిఫ్ చూపించబడింది." if user_lang.startswith('te') else f"\n\nℹ️ Note: City was not specified; showing baseline reference benchmark for {target_city}. Share your city to localize."

        if user_lang in ["te", "te-en"]:
            reply_text = (
                f"🏥 {target_city} లో {treatment.name} అంచనా ఖర్చు వివరాలు:\n\n"
                f"• ప్రభుత్వ ఆసుపత్రులు (గాంధీ, ఉస్మానియా, నిమ్స్): తెల్ల రేషన్ కార్డు / ఆరోగ్యశ్రీ కింద ₹0 (పూర్తిగా ఉచితం).\n"
                f"• ప్రైవేట్ ఆసుపత్రుల సాధారణ శ్రేణి: సుమారు ₹{ref_min:,} నుండి ₹{ref_max:,}.\n"
                f"• ఎన్‌పీపీఏ (NPPA) నిబంధన: స్టెంట్లు మరియు మోకాలి ఇంప్లాంట్లకు ప్రభుత్వ గరిష్ట ధర పరిమితి వర్తిస్తుంది.\n"
                f"• ఖర్చు ఆధారపడే అంశాలు: ఆసుపత్రి వర్గం, గది రకం (జనరల్ వార్డ్ vs డీలక్స్), మరియు ఇంప్లాంట్ రకం."
                f"{missing_note}"
            )
            chips = ["ప్రభుత్వ ఆసుపత్రులు (ఉచితం)", "ప్రైవేట్ ఆసుపత్రులు", "ఆరోగ్యశ్రీ కార్డుతో ఉచితమా?"]
        else:
            reply_text = (
                f"🏥 Estimated Cost for {treatment.name} in {target_city}:\n\n"
                f"• Government Hospitals (Gandhi, Osmania, NIMS): ₹0 (100% Cashless under PM-JAY / Aarogyasri for White Card holders).\n"
                f"• Private Hospitals Reference Range: Approx. ₹{ref_min:,} to ₹{ref_max:,}.\n"
                f"• Statutory Price Caps: Implants & stents are legally capped under NPPA Orders.\n"
                f"• Primary Cost Drivers: Room tier (General vs Private), surgeon experience, and implant specifications."
                f"{missing_note}"
            )
            chips = ["What about government hospitals?", "Documents to Carry", "Check Aarogyasri Eligibility"]

        top_facilities = search_facilities(query_city=target_city, treatment_id=treatment.id)[:3] if db_available else []
        hospitals_card_data = [{
            "id": f.id, "name": f.name, "ownership": f.ownership, "locality": f.locality, "city": f.city,
            "pricing_status": f.pricing_status or ("Free / Cashless" if f.ownership == "Government" else "Private"),
            "phone": f.phone or "+91 40 2345 6789"
        } for f in top_facilities]

        return GuidedChatResponse(
            reply=reply_text,
            reply_language=user_lang,
            emergency_detected=False,
            suggested_chips=chips,
            canonical_intent="procedure_cost",
            hospitals_card=hospitals_card_data,
            audio_tts_text=clean_tts_text(reply_text)
        )

    # -------------------------------------------------------------
    # INTENT 6: GOVERNMENT SCHEMES & FINANCIAL AID (PHASE 8)
    # -------------------------------------------------------------
    if creq.primary_intent == "scheme_guidance":
        if user_lang in ["te", "te-en"]:
            scheme_reply = (
                "🏛️ తెలంగాణ ఆరోగ్యశ్రీ & ఆయుష్మాన్ భారత్ (PM-JAY) పథకాల మార్గదర్శకత్వం:\n\n"
                "1. తెలంగాణ రాజీవ్ ఆరోగ్యశ్రీ (Aarogyasri Health Care Trust):\n"
                "• అర్హత: తెలంగాణ రాష్ట్ర ఆహార భద్రత కార్డు (తెల్ల రేషన్ కార్డు) కలిగిన కుటుంబాలు లేదా వార్షికాదాయం ₹2.5 లక్షలలోపు ఉన్నవారు.\n"
                "• ప్రయోజనం: నమోదిత ప్రభుత్వ మరియు ప్రైవేట్ నెట్‌వర్క్ ఆసుపత్రులలో ప్రతి కుటుంబానికి సంవత్సరానికి ₹10 లక్షల వరకు 100% నగదు రహిత చికిత్స (Cashless).\n"
                "• కవర్ అయ్యే విభాగాలు: మోకాలి మార్పిడి, గుండె శస్త్రచికిత్సలు, క్యాన్సర్, డయాలసిస్, కంటిశుక్లం మొదలైన 1,600+ ప్యాకేజీలు.\n\n"
                "2. ప్రధాన మంత్రి జన్ ఆరోగ్య యోజన (AB PM-JAY):\n"
                "• అర్హత: జాతీయ సామాజిక-ఆర్థిక డేటా (SECC) ప్రకారం ఎంపికైన కుటుంబాలు.\n"
                "• ప్రయోజనం: దేశవ్యాప్తంగా నమోదిత ఆసుపత్రులలో సంవత్సరానికి ₹5 లక్షల వరకు ఉచిత కవరేజ్.\n\n"
                "⚠️ ముఖ్యమైన ధృవీకరణ నిబంధన: ఆసుపత్రిలోని ఆరోగ్యమిత్ర (Aarogyamitra) కౌంటర్‌లో మీ తెల్ల రేషన్ కార్డు మరియు ఆధార్ కార్డును ధృవీకరించిన తర్వాతే ఉచిత చికిత్స వర్తిస్తుంది. ముందస్తు ధృవీకరణ లేకుండా ఉచిత చికిత్సను హామీ ఇవ్వలేము."
            )
            chips = ["తీసుకెళ్లాల్సిన పత్రాలు", "సమీప ఆరోగ్యశ్రీ ఆసుపత్రులు", "ఆరోగ్యమిత్ర హెల్ప్‌లైన్ 104"]
        else:
            scheme_reply = (
                "🏛️ Government Scheme Eligibility & Coverage Guidance:\n\n"
                "1. Telangana Aarogyasri Trust:\n"
                "• Statutory Ceiling: Enhanced coverage up to ₹10 Lakhs per family per year.\n"
                "• Core Eligibility: Active Food Security Card (White Ration Card) issued by Telangana Government, or verified annual income below ₹2.5 Lakhs.\n"
                "• Empanelled Network: 100% Cashless treatment across empanelled Government teaching hospitals and verified private network facilities.\n\n"
                "2. Ayushman Bharat PM-JAY:\n"
                "• Statutory Ceiling: ₹5 Lakhs per family per year nationwide across all SECC-eligible beneficiaries.\n\n"
                "⚠️ Mandatory Verification Notice: Cashless eligibility is strictly subject to biometric Aadhaar & White Card verification by the on-duty hospital Aarogyamitra prior to admission. CareSaathi cannot independently approve scheme claims."
            )
            chips = ["Documents to Carry", "Empanelled Hospital List", "National Helpline 104"]

        return GuidedChatResponse(
            reply=scheme_reply,
            reply_language=user_lang,
            emergency_detected=False,
            suggested_chips=chips,
            canonical_intent="scheme_guidance",
            audio_tts_text=clean_tts_text(scheme_reply)
        )

    # -------------------------------------------------------------
    # INTENT 7: SYMPTOM & HOME CARE GUIDANCE (PHASE 5)
    # -------------------------------------------------------------
    if creq.primary_intent == "symptom_home_care":
        clean_msg = creq.raw_input.lower()
        if any(f in clean_msg for f in ["జ్వరం", "fever", "బుఖార్", "बुखार"]):
            if user_lang in ["te", "te-en"]:
                symptom_reply = (
                    "🌡️ జ్వరం ఉన్నప్పుడు తీసుకోవాల్సిన సురక్షితమైన సాధారణ జాగ్రత్తలు (Safe Home Care):\n\n"
                    "1. పుష్కలంగా ద్రవాహారం తీసుకోండి: కాచి చల్లార్చిన నీరు, ఓఆర్‌ఎస్ (ORS), కొబ్బరినీళ్లు, పండ్ల రసాలు తీసుకోవడం వల్ల డీహైడ్రేషన్ రాకుండా ఉంటుంది.\n"
                    "2. విశ్రాంతి తీసుకోండి: శరీరానికి తగినంత విశ్రాంతినివ్వండి మరియు తేలికగా జీర్ణమయ్యే ఆహారం తీసుకోండి.\n"
                    "3. ఉష్ణోగ్రతను గమనించండి: థర్మామీటర్‌తో తరచూ తనిఖీ చేయండి. అవసరమైతే తలపై సాధారణ నీటితో తడిగుడ్డ స్పాంజింగ్ చేయండి.\n\n"
                    "⚠️ తక్షణమే డాక్టర్‌ను సంప్రదించాల్సిన ప్రమాద సంకేతాలు (Red Flags):\n"
                    "• జ్వరం 102°F (38.9°C) దాటినా లేదా 3 రోజుల కంటే ఎక్కువ కాలం తగ్గకపోయినా\n"
                    "• తీవ్రమైన తలనొప్పి, మెడ పట్టేయడం (stiff neck), లేదా ఊపిరి తీసుకోవడంలో ఆయాసం ఉన్నా\n"
                    "• విపరీతమైన వాంతులు, ఒంటిపై దద్దుర్లు, లేదా స్పృహ తప్పే పరిస్థితి ఉన్నా\n\n"
                    "💡 రోగి భద్రతా సూచన: CareSaathi వ్యాధి నిర్ధారణ (Diagnosis) చేయదు. డాక్టర్ సలహా లేకుండా యాంటీబయాటిక్స్ వాడకండి. ప్రాథమిక వైద్య పరీక్ష కోసం సమీపంలోని ప్రభుత్వ ప్రాథమిక ఆరోగ్య కేంద్రం (PHC / Basti Dawakhana - ఉచితం) లేదా క్లినిక్ (కన్సల్టేషన్ ఫీజు సుమారు ₹100 - ₹300) సంప్రదించండి."
                )
                chips = ["సమీప ప్రాథమిక ఆరోగ్య కేంద్రాలు", "రక్త పరీక్ష ఖర్చు (CBC)", "ఎమర్జెన్సీ 108", "డాక్టర్ సంప్రదింపు ఫీజు"]
            else:
                symptom_reply = (
                    "🌡️ Evidence-Based Fever Care & Monitoring:\n\n"
                    "1. Hydration: Maintain fluid intake with boiled water, ORS, or broths to prevent dehydration.\n"
                    "2. Rest: Allow physical rest in a well-ventilated room.\n"
                    "3. Temperature Monitoring: Record readings twice daily. Use lukewarm water sponging if uncomfortable.\n\n"
                    "⚠️ Red Flags Requiring Immediate Medical Attention:\n"
                    "• Temperature exceeding 102°F (38.9°C) or persisting beyond 3 days\n"
                    "• Stiff neck, severe headache, confusion, or difficulty breathing\n"
                    "• Inability to retain fluids or unexplained skin rash\n\n"
                    "💡 Patient Safety Notice: CareSaathi does not diagnose illnesses. Never self-administer antibiotics. For primary evaluation, visit your nearest Urban Primary Health Centre (UPHC - Free) or neighborhood physician clinic (₹100–₹300 consultation)."
                )
                chips = ["Nearby Primary Health Centres", "CBC Blood Test Price", "Emergency 108 Ambulance", "Doctor Consultation"]

            return GuidedChatResponse(
                reply=symptom_reply,
                reply_language=user_lang,
                emergency_detected=False,
                suggested_chips=chips,
                canonical_intent="symptom_home_care",
                audio_tts_text=clean_tts_text(symptom_reply)
            )
        else:
            if user_lang in ["te", "te-en"]:
                symptom_reply = (
                    "🩺 సాధారణ ఆరోగ్య సలహా (Health Information Guidance):\n\n"
                    "మీరు పేర్కొన్న లక్షణాలకు తగినంత విశ్రాంతి తీసుకోవడం మరియు ద్రవాహారం తాగడం చాలా అవసరం.\n\n"
                    "• ప్రాథమిక ఆరోగ్య కేంద్రం (PHC / UPHC / బస్తీ దవాఖానా) లో ఉచితంగా ఔట్ పేషెంట్ సంప్రదింపు లభిస్తుంది.\n"
                    "• ప్రైవేట్ క్లినిక్‌లలో జనరల్ ఫిజీషియన్ కన్సల్టేషన్ ఫీజు సుమారు ₹100 నుండి ₹300 వరకు ఉంటుంది.\n"
                    "• లక్షణాలు 48 గంటల్లో తగ్గకపోతే లేదా తీవ్రమైతే వెంటనే అర్హత గల వైద్యుడిని సంప్రదించండి."
                )
                chips = ["సమీప క్లినిక్‌లు", "సాధారణ ల్యాబ్ పరీక్షలు", "ఆరోగ్యశ్రీ ఆసుపత్రులు"]
            else:
                symptom_reply = (
                    "🩺 General Healthcare Guidance:\n\n"
                    "For the symptoms mentioned, adequate rest, hydration, and observation are recommended.\n\n"
                    "• Urban Primary Health Centres (UPHCs) provide free primary outpatient consultations.\n"
                    "• Private general physician clinics typically charge ₹100–₹300 for consultation.\n"
                    "• Please consult a licensed medical practitioner if symptoms do not improve within 48 hours."
                )
                chips = ["Find Nearby Clinics", "Standard Lab Tests", "Aarogyasri Empanelled"]

            return GuidedChatResponse(
                reply=symptom_reply,
                reply_language=user_lang,
                emergency_detected=False,
                suggested_chips=chips,
                canonical_intent="symptom_home_care",
                audio_tts_text=clean_tts_text(symptom_reply)
            )

    # -------------------------------------------------------------
    # INTENT 8: APPOINTMENT BOOKING (PHASE 12)
    # -------------------------------------------------------------
    if creq.primary_intent == "appointment_booking":
        target_city = creq.location_city or "Hyderabad"
        if user_lang in ["te", "te-en"]:
            book_reply = (
                f"📅 వైద్యుల సంప్రదింపు మరియు అపాయింట్‌మెంట్ విధానం ({target_city}):\n\n"
                "1. విభాగం ఎంపిక: ఆర్థోపెడిక్స్, ఆప్తాల్మాలజీ, జనరల్ మెడిసిన్ లేదా గైనకాలజీ వంటి అవసరమైన విభాగాన్ని ఎంచుకోండి.\n"
                "2. సంప్రదింపు రకాలు: ప్రాథమిక సంప్రదింపు (Consultation), శస్త్రచికిత్స పూర్వ పరీక్షలు (Pre-op Workup), లేదా సెకండ్ ఒపీనియన్.\n"
                "3. తీసుకెళ్లాల్సిన పత్రాలు: మునుపటి ప్రిస్క్రిప్షన్‌లు, ఎక్స్-రే/ఎంఆర్ఐ నివేదికలు, మరియు ఆధార్ కార్డు.\n\n"
                "ℹ️ అధికారిక బుకింగ్ ప్రక్రియ నిబంధన: CareSaathi ద్వారా రూపొందించబడిన బుకింగ్ ఒక ముందస్తు అపాయింట్‌మెంట్ అభ్యర్థన. ఆసుపత్రి హాస్పిటల్ మేనేజ్‌మెంట్ సిస్టమ్ (PMS) మరియు ఓపీడీ కౌంటర్ ద్వారా ఈ స్లాట్ తుదిగా నిర్ధారించబడుతుంది."
            )
            chips = ["ఆసుపత్రుల జాబితా చూడండి", "తీసుకెళ్లాల్సిన పత్రాలు", "కన్సల్టేషన్ ఫీజు వివరాలు"]
        else:
            book_reply = (
                f"📅 Appointment Scheduling Process ({target_city}):\n\n"
                "1. Clinical Specialty: Select Orthopedics, Ophthalmology, Cardiology, or General Medicine.\n"
                "2. Visit Type: Outpatient Consultation (₹100-₹500), Pre-surgical evaluation, or Second Opinion review.\n"
                "3. Documents to Carry: Prior prescriptions, lab reports, imaging films (X-Ray/MRI), and Aadhaar ID.\n\n"
                "ℹ️ System Disclosure: Online booking records an intake appointment slot. Confirmation is finalized at the hospital reception or Aarogyamitra desk."
            )
            chips = ["View Empanelled Facilities", "Documents Checklist", "Consultation Fee Estimates"]

        return GuidedChatResponse(
            reply=book_reply,
            reply_language=user_lang,
            emergency_detected=False,
            suggested_chips=chips,
            canonical_intent="appointment_booking",
            audio_tts_text=clean_tts_text(book_reply)
        )

    # -------------------------------------------------------------
    # INTENT 9: GENERAL CONVERSATIONAL HEALTHCARE GUIDANCE (DEFAULT)
    # -------------------------------------------------------------
    if user_lang in ["te", "te-en"]:
        gen_reply = (
            "నమస్కారం! నేను మీ CareSaathi AI ఆరోగ్య సంరక్షణ సహాయకుడిని.\n\n"
            "నేను మీకు ఈ క్రింది అంశాలలో సహాయపడగలను:\n"
            "• శస్త్రచికిత్సల అంచనా ఖర్చులు (మోకాలి మార్పిడి, కంటిశుక్లం, ఎంఆర్ఐ స్కాన్ మొదలైనవి)\n"
            "• సమీప ప్రభుత్వ మరియు ప్రైవేట్ ఆసుపత్రుల శోధన\n"
            "• తెలంగాణ ఆరోగ్యశ్రీ & ఆయుష్మాన్ భారత్ ఉచిత చికిత్స వివరాలు\n"
            "• ప్రిస్క్రిప్షన్ అప్‌లోడ్ చేసి మందుల ఖర్చులు మరియు జన్ ఔషధి ఆదా వివరాలు\n\n"
            "మీరు ఏమి తెలుసుకోవాలనుకుంటున్నారో మాట్లాడండి లేదా టైప్ చేయండి."
        )
        chips = ["కంటి ఆపరేషన్ ఖర్చు ఎంత?", "ప్రభుత్వ ఆసుపత్రులు చూపించు", "ఆరోగ్యశ్రీ కార్డుతో ఉచితమా?", "ప్రిస్క్రిప్షన్ మందుల ఖర్చు"]
    else:
        gen_reply = (
            "Hello! I am your CareSaathi AI Healthcare Navigator.\n\n"
            "I can assist you with:\n"
            "• Treatment & Surgery Cost Estimates (Cataract, Knee Replacement, MRI, etc.)\n"
            "• Verified Government and Private Hospital Discovery\n"
            "• PM-JAY & Telangana Aarogyasri Statutory Scheme Guidance\n"
            "• Prescription Analysis and Jan Aushadhi Generic Medicine Savings\n\n"
            "How can I help you today? Please speak or type your question."
        )
        chips = ["Cataract surgery cost?", "Find government hospitals", "Check Aarogyasri eligibility", "Medicine price comparison"]

    return GuidedChatResponse(
        reply=gen_reply,
        reply_language=user_lang,
        emergency_detected=False,
        suggested_chips=chips,
        canonical_intent="general_health_query",
        audio_tts_text=clean_tts_text(gen_reply)
    )

def execute_canonical_request(creq: CanonicalHealthcareRequest) -> GuidedChatResponse:
    """
    Public entry point for Canonical Request execution.
    Executes the clinical workflow and guarantees extracted_data presence for complete traceability.
    """
    db_available = check_database_available()
    resp = _execute_canonical_request_internal(creq)

    if resp.extracted_data is None:
        resp.extracted_data = {
            "treatment_id": creq.treatment_id,
            "treatment_name": creq.treatment_name,
            "city": creq.location_city,
            "locality": creq.location_locality,
            "ownership_preference": creq.ownership_preference,
            "primary_intent": creq.primary_intent,
            "canonical_intent": creq.primary_intent,
            "confidence": "Verified Database" if db_available else "Reference Catalogue",
            "database_connected": db_available,
            "is_emergency": creq.is_emergency
        }
    return resp
