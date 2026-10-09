# CareSaathi AI: Voice Recording to Answer Workflow & Database Resilience Test Suite
# Tests:
# Test A: Speak a general question in Telugu ("నాకు జ్వరం ఉంది, నేను ఏమి చేయాలి?").
#         Application transcribes and displays useful Telugu guidance without database crash.
# Test B: Ask for a treatment cost ("నాకు knee replacement cost ఎంత అవుతుంది?").
#         Assistant explains factors, asks for missing details, or returns properly labelled estimates.
# Test C: Ask for nearby hospitals while database is unavailable.
#         Assistant explains live-data limitation honestly without crashing or inventing results.
# Test D: Restore database connectivity and confirm hospital search & database features work again.
# Test E: Simulate AI-service failure and ensure app shows correct error rather than database problem.
# Test F: Confirm existing login, dashboard, OCR, and other working features remain intact.

import os
import sys
import json
import re
from unittest.mock import patch

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app.services.hybrid_chat_service import process_guided_chat
from backend.app.services.speech_service import transcribe_audio
from backend.app.models.schemas import (
    GuidedChatRequest, SpeechTranscribeRequest, PrescriptionOCRRequest,
    CostEstimateRequest
)
from backend.app.services.ocr_service import process_prescription_ocr
from backend.app.services.cost_service import estimate_cost
from backend.app.services.auth_service import register_user, login_user
from backend.app.data.database import (
    is_database_available, get_all_treatments, get_all_facilities, init_db
)

def run_tests():
    print("\n" + "="*80)
    print("CARESAATHI AI: DATABASE RESILIENCE & VOICE-TO-ANSWER VERIFICATION SUITE")
    print("="*80)

    # Make sure DB is initialized
    init_db()

    # --------------------------------------------------------------------------
    # TEST A: Speak a general question in Telugu ("నాకు జ్వరం ఉంది, నేను ఏమి చేయాలి?")
    # --------------------------------------------------------------------------
    print("\n[TEST A] General Health Question in Telugu (Voice -> Transcript -> Safe Answer)")
    telugu_voice_query = "నాకు జ్వరం ఉంది, నేను ఏమి చేయాలి?"

    # 1. Speech Transcription
    stt_res = transcribe_audio(SpeechTranscribeRequest(
        transcript_hint=telugu_voice_query,
        language="te-IN"
    ))
    assert stt_res.detected_language in ["te", "te-en"], f"Language should be Telugu, got {stt_res.detected_language}"
    assert bool(re.search(r'[\u0C00-\u0C7F]', stt_res.transcript)), "Transcript must contain Telugu script"
    print(f" -> Transcribed Spoken Text: {stt_res.transcript}")

    # 2. Even if database is simulated as offline, general health guidance must respond!
    with patch("backend.app.services.hybrid_chat_service.is_database_available", return_value=False):
        chat_req_a = GuidedChatRequest(
            message=stt_res.transcript,
            city="Hyderabad",
            language="te-IN"
        )
        chat_res_a = process_guided_chat(chat_req_a)

    assert chat_res_a.reply_language in ["te", "te-en"], f"Reply must be in Telugu, got {chat_res_a.reply_language}"
    assert "జ్వరం" in chat_res_a.reply or "విశ్రాంతి" in chat_res_a.reply, "Must provide fever care guidance"
    assert "వ్యాధి నిర్ధారణ" in chat_res_a.reply or "102°F" in chat_res_a.reply or "డాక్టర్" in chat_res_a.reply, "Must include red flags / safety guidance"
    assert "knee_replacement" not in chat_res_a.reply.lower(), "Must NOT default to knee surgery for fever!"
    assert chat_res_a.audio_tts_text is not None and len(chat_res_a.audio_tts_text) > 0, "Must provide TTS audio text"
    print(f" -> Generated Answer Language: {chat_res_a.reply_language}")
    print(f" -> Guidance Snippet: {chat_res_a.reply[:120]}...")
    print(" -> TEST A PASSED: General health question transcribed and responded in Telugu with safe medical advice.")

    # --------------------------------------------------------------------------
    # TEST B: Ask for a treatment cost ("నాకు knee replacement cost ఎంత అవుతుంది?")
    # --------------------------------------------------------------------------
    print("\n[TEST B] Treatment Cost Inquiry: Missing detail handling and reference benchmarks")
    cost_voice_query = "నాకు knee replacement cost ఎంత అవుతుంది?"

    chat_req_b = GuidedChatRequest(
        message=cost_voice_query,
        city="Hyderabad",
        language="te-IN"
    )
    chat_res_b = process_guided_chat(chat_req_b)

    assert "knee" in chat_res_b.reply.lower() or "మోకాలి" in chat_res_b.reply, "Must address knee replacement"
    assert ("ప్రభుత్వ" in chat_res_b.reply or "government" in chat_res_b.reply.lower()), "Must explain government vs private options"
    assert ("₹0" in chat_res_b.reply or "ఉచితం" in chat_res_b.reply), "Must state government cashless option"
    assert chat_res_b.suggested_chips is not None and len(chat_res_b.suggested_chips) > 0, "Must prompt with next steps"
    print(f" -> Reply Snippet: {chat_res_b.reply[:120]}...")
    print(f" -> Suggested Options: {chat_res_b.suggested_chips}")
    print(" -> TEST B PASSED: Explains cost drivers, government vs private differences, and prompts for missing info.")

    # --------------------------------------------------------------------------
    # TEST C: Ask for nearby hospitals while the database is unavailable
    # --------------------------------------------------------------------------
    print("\n[TEST C] Nearby Hospitals Inquiry with Database Unavailable (Safe limitation message)")
    hosp_query = "హైదరాబాద్లో దగ్గరలో హాస్పిటల్స్ చూపించు"

    with patch("backend.app.services.hybrid_chat_service.is_database_available", return_value=False):
        chat_req_c = GuidedChatRequest(
            message=hosp_query,
            city="Hyderabad",
            language="te-IN"
        )
        chat_res_c = process_guided_chat(chat_req_c)

    assert "డేటాబేస్ ప్రస్తుతం అందుబాటులో లేదు" in chat_res_c.reply or "అందుబాటులో లేదు" in chat_res_c.reply or "temporarily unavailable" in chat_res_c.reply.lower(), "Must explain live database is unavailable"
    assert "104" in chat_res_c.reply or "108" in chat_res_c.reply, "Must offer safe health helpline guidance"
    assert len(chat_res_c.hospitals_card or []) == 0, "Must NOT fabricate fake hospital cards when DB is down"
    print(f" -> Offline DB Message: {chat_res_c.reply[:130]}...")
    print(" -> TEST C PASSED: Honest live-data limitation explanation without crashing or inventing fake clinics.")

    # --------------------------------------------------------------------------
    # TEST D: Restore database connectivity and confirm hospital search works
    # --------------------------------------------------------------------------
    print("\n[TEST D] Restored Database Connectivity: Full hospital discovery and cost estimation")
    assert is_database_available() is True, "Database must be healthy"

    chat_req_d = GuidedChatRequest(
        message="హైదరాబాద్లో దగ్గరలో హాస్పిటల్స్ చూపించు",
        city="Hyderabad",
        language="te-IN"
    )
    chat_res_d = process_guided_chat(chat_req_d)

    assert chat_res_d.hospitals_card is not None and len(chat_res_d.hospitals_card) > 0, "Must return genuine hospitals from DB"
    hosp_names = [h.get("name") if isinstance(h, dict) else h.name for h in chat_res_d.hospitals_card]
    print(f" -> Retrieved Live Facilities: {hosp_names}")
    print(" -> TEST D PASSED: Database features fully functional when connected.")

    # --------------------------------------------------------------------------
    # TEST E: Simulate AI / Guided Chat unexpected error (Handled gracefully)
    # --------------------------------------------------------------------------
    print("\n[TEST E] Simulate AI service unexpected exception: Graceful fallback without 500 crash")
    
    with patch("backend.app.services.hybrid_chat_service.parse_user_query", side_effect=RuntimeError("Simulated AI Model Service Timeout")):
        chat_req_e = GuidedChatRequest(
            message="నాకు డాక్టర్ సలహా కావాలి",
            city="Hyderabad",
            language="te-IN"
        )
        chat_res_e = process_guided_chat(chat_req_e)

    assert chat_res_e is not None, "Must return valid GuidedChatResponse object"
    assert "తాత్కాలిక" in chat_res_e.reply or "సమస్య" in chat_res_e.reply or "technical issue" in chat_res_e.reply.lower(), "Must return safe message"
    assert "డేటాబేస్ అందుబాటులో లేదు" not in chat_res_e.reply, "Must NOT falsely blame database for AI provider failure"
    print(f" -> Safe Fallback Reply: {chat_res_e.reply[:100]}...")
    print(" -> TEST E PASSED: Handled unexpected AI exception without crashing or misattributing to database.")

    # --------------------------------------------------------------------------
    # TEST F: Regression Check: Existing Login, Dashboard, OCR, and Treatments
    # --------------------------------------------------------------------------
    print("\n[TEST F] Regression Verification: Login, Treatments, OCR, and Cost Estimation")
    
    # 1. Treatments Catalogue & Facilities
    all_treatments = get_all_treatments()
    all_facilities = get_all_facilities()
    assert len(all_treatments) >= 10, f"Expected treatments catalogue, got {len(all_treatments)}"
    assert len(all_facilities) >= 10, f"Expected facilities catalogue, got {len(all_facilities)}"
    print(f" -> Total Treatments: {len(all_treatments)} | Total Facilities: {len(all_facilities)}")

    # 2. Cost estimation service
    est = estimate_cost(CostEstimateRequest(treatment="Knee Replacement", city="Hyderabad"))
    assert est.overall_min > 0 or est.overall_min == 0
    assert est.overall_max > 100000
    print(f" -> Cost Engine Knee Replacement: ₹{est.overall_min:,} - ₹{est.overall_max:,}")

    # 3. Prescription OCR & Generic Savings
    ocr_res = process_prescription_ocr(PrescriptionOCRRequest(
        filename="prescription_knee_tkr.jpg"
    ))
    assert len(ocr_res.detected_medicines_detailed or []) > 0, "OCR medicines extraction must work"
    print(f" -> Prescription OCR detected {len(ocr_res.detected_medicines_detailed)} medicines")

    # 4. Auth Service Demo Login
    demo_auth = login_user("judge.demo@caresaathi.in", "JudgeDemo2026!")
    assert "access_token" in demo_auth, "Demo login must succeed"
    print(f" -> Demo Authentication Token: {demo_auth['access_token'][:25]}...")

    print(" -> TEST F PASSED: All existing core features (treatments, facilities, cost engine, OCR, auth) 100% intact.")

    print("\n" + "="*80)
    print("ALL 6 TESTS (A, B, C, D, E, F) PASSED WITH ZERO FAILURES!")
    print("="*80 + "\n")

if __name__ == "__main__":
    run_tests()
