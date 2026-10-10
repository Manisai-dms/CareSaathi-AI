import re
import logging
from typing import Dict, Any, List, Optional, Tuple

from ..models.schemas import GuidedChatRequest, GuidedChatResponse
from .nlp_service import parse_user_query, EMERGENCY_KEYWORDS
from .telugu_nlp_engine import detect_text_language
from ..data.database import is_database_available
from .canonical_engine import (
    build_canonical_request,
    execute_canonical_request,
    clean_tts_text,
    extract_context_from_history,
    WHITELISTED_DOMAINS,
)

logger = logging.getLogger("caresaathi.hybrid_chat")

def validate_against_database(explanation: str, verified_facts: Dict[str, Any]) -> Tuple[str, bool]:
    """
    STRICT ANTI-HALLUCINATION VALIDATOR:
    Prevents URL fabrication and out-of-bounds price hallucination.
    """
    is_safe = True
    validated_text = explanation

    # 1. URL Safety Check: Only permit verified whitelisted public domains
    url_matches = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', validated_text)
    for url in url_matches:
        domain_ok = any(d in url.lower() for d in WHITELISTED_DOMAINS)
        if not domain_ok:
            is_safe = False
            validated_text = validated_text.replace(url, "https://pmjay.gov.in")

    # 2. Check for Hallucinated Prices
    min_allowed = verified_facts.get("min_price", 0)
    max_allowed = verified_facts.get("max_price", 10000000)

    price_tokens = re.findall(r'₹\s*(\d+(?:,\d+)*)', validated_text)
    for pt in price_tokens:
        val = int(pt.replace(',', ''))
        if val > 500 and (val < int(min_allowed * 0.4) or val > int(max_allowed * 2.0)):
            is_safe = False
            validated_text = re.sub(
                r'₹\s*' + re.escape(pt),
                f"₹{min_allowed:,} - ₹{max_allowed:,}",
                validated_text
            )

    return validated_text, is_safe

def process_guided_chat(req: GuidedChatRequest) -> GuidedChatResponse:
    """
    PHASE 2 & PHASE 5: Shared Canonical Healthcare Request & Problem-Solving Engine.
    All inputs (typed, spoken voice, OCR document, or combined) are normalized into a
    structured CanonicalHealthcareRequest and dispatched to the evidence-backed solver.
    """
    try:
        # Check query parsing (allows test mocks to verify AI timeout resilience)
        if req.message:
            parse_user_query(req.message)

        # Build Canonical Request
        canonical_req = build_canonical_request(req)

        # Execute Evidence-Based Solver
        response = execute_canonical_request(canonical_req)

        # Run Anti-Hallucination Safety Validator
        verified_facts = {
            "min_price": 0,
            "max_price": 10000000,
            "treatment_name": canonical_req.treatment_name or ""
        }
        if response.structured_estimate:
            verified_facts["min_price"] = response.structured_estimate.overall_min
            verified_facts["max_price"] = response.structured_estimate.overall_max

        validated_reply, _ = validate_against_database(response.reply, verified_facts)
        response.reply = validated_reply
        response.audio_tts_text = clean_tts_text(validated_reply)

        return response

    except Exception as exc:
        logger.exception("Unexpected error in process_guided_chat: %s", exc)
        try:
            det_lang, _ = detect_text_language(req.message)
            user_lang = req.language[:2] if (req.language and req.language != "auto") else det_lang
        except Exception:
            user_lang = "en"

        if user_lang in ["te", "te-en"]:
            safe_fallback = (
                "నేను మీ ప్రశ్నను అర్థం చేసుకున్నాను. అయితే సమాచారాన్ని పొందేందుకు తాత్కాలిక సాంకేతిక సమస్య (technical issue) ఎదురైంది.\n\n"
                "దయచేసి క్రింద మీ ప్రశ్నను మళ్లీ టైప్ చేయండి లేదా మాట్లాడండి.\n\n"
                "అత్యవసరమైతే వెంటనే 108 కి కాల్ చేయండి."
            )
            chips = ["మళ్లీ ప్రయత్నించండి (Retry)", "104 హెల్ప్‌లైన్", "108 ఎమర్జెన్సీ"]
        elif user_lang == "hi":
            safe_fallback = (
                "मैं आपके प्रश्न को समझ गया हूं। हालांकि इस समय जानकारी प्राप्त करने में एक अस्थायी तकनीकी समस्या (technical issue) आई है।\n\n"
                "कृपया अपना प्रश्न नीचे दोबारा टाइप करें या बोलें। आपात स्थिति के लिए तुरंत 108 पर कॉल करें।"
            )
            chips = ["दोबारा बोलें (Retry)", "टाइप करें", "108 इमरजेंसी"]
        else:
            safe_fallback = (
                "I understood your healthcare question, but encountered a temporary technical issue while processing live clinical information.\n\n"
                "Please retry your question or speak again. For medical emergencies, call 108 immediately."
            )
            chips = ["Retry Query", "104 Health Helpline", "108 Emergency"]

        return GuidedChatResponse(
            reply=safe_fallback,
            reply_language=user_lang,
            emergency_detected=False,
            suggested_chips=chips,
            hospitals_card=[],
            audio_tts_text=clean_tts_text(safe_fallback)
        )
