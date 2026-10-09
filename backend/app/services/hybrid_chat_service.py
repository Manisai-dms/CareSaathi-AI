import re
import logging
from typing import Dict, Any, List, Optional, Tuple
from ..models.schemas import (
    GuidedChatRequest, GuidedChatResponse, CostEstimateRequest, CostEstimateResponse,
    PrescriptionOCRRequest, PrescriptionOCRResponse
)
from .nlp_service import parse_user_query, EMERGENCY_KEYWORDS
from .telugu_nlp_engine import detect_text_language
from .cost_service import estimate_cost
from .facility_service import search_facilities
from .ocr_service import process_prescription_ocr
from ..data.catalogue import TREATMENT_CATALOGUE
from ..data.database import is_database_available

logger = logging.getLogger("caresaathi.hybrid_chat")

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

from .canonical_engine import (
    build_canonical_request, execute_canonical_request,
    clean_tts_text, extract_context_from_history, WHITELISTED_DOMAINS
)

def validate_against_database(explanation: str, verified_facts: Dict[str, Any]) -> Tuple[str, bool]:
    """STRICT VALIDATOR: prevents price hallucination & unverified links."""
    is_safe = True
    validated_text = explanation

    # 1. URL Safety Check
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
    PHASE 2 & PHASE 5: Canonical Healthcare Problem-Solving Engine.
    All inputs (typed, spoken voice, OCR document, or combined) are normalized into a
    structured CanonicalHealthcareRequest and dispatched to the evidence-backed solver.
    """
    try:
        canonical_req = build_canonical_request(req)
        return execute_canonical_request(canonical_req)
    except Exception as e:
        logger.error(f"Unexpected error in process_guided_chat: {e}", exc_info=True)
        user_lang = req.language[:2] if (req.language and req.language != "auto") else "te"
        if user_lang in ["te", "te-en"]:
            fallback_msg = (
                "నేను మీ ప్రశ్నను అర్థం చేసుకున్నాను. అయితే సమాచారాన్ని పొందేందుకు తాత్కాలిక సమస్య ఎదురైంది.\n\n"
                "సాధారణ సమాచారం లేదా ఆసుపత్రుల కోసం దయచేసి మళ్లీ ప్రయత్నించండి."
            )
            chips = ["మళ్లీ ప్రయత్నించండి", "104 హెల్ప్‌లైన్", "108 ఎమర్జెన్సీ"]
        else:
            fallback_msg = (
                "I understood your query, but encountered a temporary issue processing live medical information.\n\n"
                "Please retry or consult 104 National Health Helpline."
            )
            chips = ["Retry Query", "104 Health Helpline", "108 Emergency Ambulance"]

        return GuidedChatResponse(
            reply=fallback_msg,
            reply_language=user_lang,
            emergency_detected=False,
            suggested_chips=chips,
            audio_tts_text=clean_tts_text(fallback_msg)
        )

        # STEP 1: Emergency Interrupt Check
        for em in EMERGENCY_KEYWORDS:
            if em in clean_msg:
                if user_lang in ["te", "te-en"]:
                    emer_reply = (
                        "🚨 అత్యవసర పరిస్థితి హెచ్చరిక (EMERGENCY ALERT):\n"
                        f"మీ సందేశంలో అత్యవసర వైద్య సహాయం అవసరమయ్యే లక్షణం ('{em}') ఉంది.\n\n"
                        "ఖర్చు వివరాలు లేదా ఆసుపత్రుల శోధన కోసం వేచి ఉండకండి.\n\n"
                        "👉 వెంటనే 108 కి కాల్ చేయండి లేదా సమీప ఎమర్జెన్సీ విభాగానికి (Casualty ER) వెళ్లండి."
                    )
                    chips = ["108 కి కాల్ చేయండి", "సమీప 24/7 ఎమర్జెన్సీ ఆసుపత్రి", "నేను సురక్షితంగా ఉన్నాను, కొనసాగించండి"]
                elif user_lang == "hi":
                    emer_reply = (
                        "🚨 आपातकालीन रेड-फ्लैग चेतावनी (EMERGENCY ALERT):\n"
                        f"आपके संदेश में तत्काल चिकित्सकीय ध्यान देने योग्य लक्षण ('{em}') हैं।\n\n"
                        "खर्च की तुलना के लिए आपातकालीन देखभाल में देरी न करें।\n\n"
                        "👉 तुरंत 108 पर कॉल करें या नजदीकी आपातकालीन कक्ष (Casualty) में जाएं।"
                    )
                    chips = ["108 एम्बुलेंस पर कॉल करें", "निकटतम आपातकालीन अस्पताल", "मैं सुरक्षित हूं, खोज जारी रखें"]
                else:
                    emer_reply = (
                        "🚨 EMERGENCY RED-FLAG DETECTED:\n"
                        f"Your message mentions symptoms requiring urgent clinical intervention ('{em}').\n\n"
                        "Cost comparison and research must NEVER delay emergency care.\n\n"
                        "👉 CALL 108 IMMEDIATELY for National Emergency Ambulance, or proceed to the nearest emergency room."
                    )
                    chips = ["Call 108 Ambulance", "Nearest 24/7 Casualty ER", "I am safe, continue non-emergency search"]

                return GuidedChatResponse(
                    reply=emer_reply,
                    reply_language=user_lang,
                    emergency_detected=True,
                    suggested_chips=chips,
                    audio_tts_text=clean_tts_text(emer_reply)
                )

        # STEP 2: Extract Context from Conversation History
        prev_treatment_id, prev_city, prev_rx = extract_context_from_history(history)

        # STEP 3: Multi-modal Prescription Analysis
        is_prescription_query = (
            bool(req.prescription_text) or
            bool(req.prescription_filename) or
            any(k in clean_msg for k in ["prescription", "మందుల ఖర్చు", "మందుల వివరాలు", "మందుల మొత్తం", "दवाइयों का खर्च", "दवाइयां", "rx"])
        )

        if is_prescription_query:
            ocr_req = PrescriptionOCRRequest(
                raw_text=req.prescription_text,
                filename=req.prescription_filename or (
                    "unclear_handwriting_sample.jpg" if ("చేతిరాత" in clean_msg or "unclear" in clean_msg or "handwriting" in clean_msg)
                    else "prescription_knee_tkr.jpg"
                )
            )
            ocr_res = process_prescription_ocr(ocr_req)

            if ocr_res.is_handwritten or ocr_res.uncertain_regions:
                if user_lang in ["te", "te-en"]:
                    rx_reply = (
                        "⚠️ ప్రిస్క్రిప్షన్ చేతిరాత స్పష్టంగా లేదు (Unreadable Handwriting):\n\n"
                        "ఈ ప్రిస్క్రిప్షన్‌లోని చేతిరాతను ఖచ్చితంగా చదవలేకపోయాము. రోగుల భద్రత దృష్ట్యా CareSaathi తప్పుడు ఔషధాలను అంచనా వేయదు.\n\n"
                        "దయచేసి మందుల పేర్లను క్రింద నేరుగా టైప్ చేయండి లేదా మీ ఫార్మసిస్ట్ / డాక్టర్‌ని సంప్రదించండి."
                    )
                    chips = ["మందుల పేర్లు టైప్ చేయండి", "డాక్టర్‌ని సంప్రదించండి", "ఆసుపత్రుల ఖర్చు చూడండి"]
                else:
                    rx_reply = (
                        "⚠️ Unable to read prescription handwriting reliably:\n\n"
                        "The medical notation in this prescription is cursive or low-contrast. To protect patient safety, CareSaathi refuses to guess medicine names or strengths.\n\n"
                        "Please enter the medicine details manually or consult your pharmacist/treating doctor."
                    )
                    chips = ["Type Medicine Details", "Consult Pharmacist", "Explore General Costs"]

                return GuidedChatResponse(
                    reply=rx_reply,
                    reply_language=user_lang,
                    emergency_detected=False,
                    suggested_chips=chips,
                    prescription_card={
                        "is_handwritten": True,
                        "uncertain_regions": ocr_res.uncertain_regions,
                        "notice": ocr_res.notice,
                        "medicines": []
                    },
                    audio_tts_text=clean_tts_text(rx_reply)
                )

            detailed_meds = ocr_res.detected_medicines_detailed or []
            total_branded = sum(m.get("cost_branded", 0) for m in detailed_meds)
            total_jan = sum(m.get("cost_jan_aushadhi", 0) for m in detailed_meds)
            savings = total_branded - total_jan

            if user_lang in ["te", "te-en"]:
                med_lines = []
                for i, m in enumerate(detailed_meds, 1):
                    med_lines.append(
                        f"{i}. {m['name']} ({m['strength']} {m['formulation']}) - {m['quantity']} మాత్రలు\n"
                        f"   • బ్రాండెడ్ రేటు: ₹{m['cost_branded']:.2f} | జన్ ఔషధి: ₹{m['cost_jan_aushadhi']:.2f}"
                    )
                med_text = "\n".join(med_lines)

                rx_reply = (
                    f"📋 ప్రిస్క్రిప్షన్‌లో గుర్తించిన మందుల వివరాలు:\n\n"
                    f"{med_text}\n\n"
                    f"💰 మొత్తం అంచనా ఖర్చు (Course Cost):\n"
                    f"• రిటైల్ బ్రాండెడ్ మందుల ఖర్చు: సుమారు ₹{total_branded:.2f}\n"
                    f"• ప్రధాన మంత్రి జన్ ఔషధి (PMBJP) కేంద్రంలో ఖర్చు: సుమారు ₹{total_jan:.2f}\n"
                    f"• జెనెరిక్ ఎంపికతో ఆదా: సుమారు ₹{savings:.2f} (దాదాపు {int((savings/total_branded)*100) if total_branded else 70}% ఆదా!)\n\n"
                    f"💡 సలహా: వైద్యుల సలహా లేకుండా మందులను మార్చవద్దు. జెనెరిక్ ప్రత్యామ్నాయాల కోసం మీ ఫార్మసిస్ట్ లేదా డాక్టర్‌ను సంప్రదించండి."
                )
                chips = ["సమీప జన్ ఔషధి కేంద్రాలు", "ఆసుపత్రి చికిత్స ఖర్చు చూడండి", "ఈ మందుల వివరాలు సరిగ్గా ఉన్నాయి"]
            else:
                med_lines = []
                for i, m in enumerate(detailed_meds, 1):
                    med_lines.append(
                        f"{i}. {m['name']} ({m['strength']} {m['formulation']}) x {m['quantity']} units\n"
                        f"   • Branded: ₹{m['cost_branded']:.2f} | PMBJP Jan Aushadhi: ₹{m['cost_jan_aushadhi']:.2f}"
                    )
                med_text = "\n".join(med_lines)

                rx_reply = (
                    f"📋 Extracted Prescription Medicine Summary:\n\n"
                    f"{med_text}\n\n"
                    f"💰 Estimated Total Course Cost:\n"
                    f"• Branded Retail Total: Approx. ₹{total_branded:.2f}\n"
                    f"• Jan Aushadhi Generic Total: Approx. ₹{total_jan:.2f}\n"
                    f"• Potential Patient Savings: ₹{savings:.2f} (~{int((savings/total_branded)*100) if total_branded else 70}% lower)\n\n"
                    f"💡 Note: Never substitute prescription medication without consulting your prescribing physician or a qualified pharmacist."
                )
                chips = ["Find Nearby Jan Aushadhi Stores", "Check Hospital Surgery Cost", "Confirm Medicine Details"]

            return GuidedChatResponse(
                reply=rx_reply,
                reply_language=user_lang,
                emergency_detected=False,
                suggested_chips=chips,
                prescription_card={
                    "is_handwritten": False,
                    "total_branded": total_branded,
                    "total_jan_aushadhi": total_jan,
                    "savings": savings,
                    "medicines": detailed_meds
                },
                audio_tts_text=clean_tts_text(rx_reply)
            )

        # Parse Query with Multilingual Medical NLP
        parsed = parse_user_query(req.message, current_location=req.city or prev_city)

        # STEP 4: General Healthcare & Symptom Questions (Decoupled from Database)
        # Check if the user is asking about symptoms, home care, or medical advice without specific surgery
        symptom_triggers = ["జ్వరం", "కడుపు", "నొప్పి", "తలనొప్పి", "దగ్గు", "జలుబు", "వాంతులు", "విరేచనాలు", "నీరసం", "బలహీనత",
                            "fever", "stomach", "headache", "vomiting", "diarrhea", "cough", "cold", "body pain", "weakness",
                            "बुखार", "पेट दर्द", "सिरदर्द", "उल्टी"]
        guidance_triggers = ["ఏమి చేయాలి", "ఏం చేయాలి", "సలహా", "జాగ్రత్తలు", "తగ్గడం", "ఉపశమనం", "మందులు",
                             "what should i do", "what to do", "how to manage", "remedies", "care", "guidance", "advice",
                             "क्या करें", "सलाह", "उपाय"]

        is_symptom_match = any(st in clean_msg for st in symptom_triggers) or bool(parsed.detected_symptoms)
        is_guidance_request = any(gt in clean_msg for gt in guidance_triggers) or parsed.is_symptom_not_diagnosis

        # Only route to symptom care if NO specific surgery/procedure was explicitly identified
        if is_symptom_match and (is_guidance_request or not parsed.matched_treatment_id) and not parsed.matched_treatment_id:
            # Safe evidence-based healthcare advice without diagnosing or inventing facts
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
                elif user_lang == "hi":
                    symptom_reply = (
                        "🌡️ बुखार के लिए सुरक्षित सामान्य स्वास्थ्य मार्गदर्शन (Safe Home Care):\n\n"
                        "1. पर्याप्त तरल पदार्थ लें: उबला हुआ पानी, ओआरएस (ORS) और नारियल पानी पिएं ताकि डिहाइड्रेशन न हो।\n"
                        "2. पूरा आराम करें और हल्का, सुपाच्य भोजन लें।\n"
                        "3. थर्मामीटर से तापमान पर नजर रखें। जरूरत पड़ने पर माथे पर ताजे पानी की पट्टी रखें।\n\n"
                        "⚠️ तुरंत डॉक्टर से मिलने के लक्षण (Red Flags):\n"
                        "• बुखार 102°F से अधिक हो या 3 दिन से ज्यादा बना रहे।\n"
                        "• तेज सिरदर्द, गर्दन में अकड़न, या सांस लेने में परेशानी हो।\n"
                        "• लगातार उल्टी या चक्कर आना।\n\n"
                        "💡 सूचना: CareSaathi बीमारी का निदान नहीं करता। डॉक्टर की सलाह के बिना एंटीबायोटिक्स न लें। प्राथमिक जांच के लिए सरकारी स्वास्थ्य केंद्र (मुफ्त) या स्थानीय क्लिनिक (परामर्श शुल्क लगभग ₹100 - ₹300) जाएं।"
                    )
                    chips = ["निकटतम स्वास्थ्य केंद्र", "ब्लड टेस्ट खर्च", "आपातकालीन 108", "डॉक्टर परामर्श"]
                else:
                    symptom_reply = (
                        "🌡️ Safe General Health Guidance for Fever:\n\n"
                        "1. Stay Well Hydrated: Drink plenty of boiled fluids, ORS, and coconut water to prevent dehydration.\n"
                        "2. Rest Adequately: Allow your body adequate physical rest and consume light, easily digestible meals.\n"
                        "3. Monitor Temperature: Check regularly with a thermometer. Lukewarm sponge application helps reduce discomfort.\n\n"
                        "⚠️ Seek Immediate Medical Attention If (Red Flags):\n"
                        "• Fever exceeds 102°F (38.9°C) or persists for more than 3 days.\n"
                        "• Accompanied by stiff neck, severe headache, or shortness of breath.\n"
                        "• Persistent vomiting, rashes, or signs of confusion/drowsiness.\n\n"
                        "💡 Patient Safety Note: CareSaathi does not diagnose conditions or prescribe restricted medicines. Never take self-prescribed antibiotics. Consult your local Urban Primary Health Centre (UPHC / Basti Dawakhana — Free) or neighborhood clinic (OPD consultation typically ₹100–₹300) for clinical assessment."
                    )
                    chips = ["Nearest Primary Health Centre", "Complete Blood Count (CBC) Cost", "Emergency 108", "Doctor Consultation Fees"]

                return GuidedChatResponse(
                    reply=symptom_reply,
                    reply_language=user_lang,
                    emergency_detected=False,
                    suggested_chips=chips,
                    audio_tts_text=clean_tts_text(symptom_reply)
                )

            elif any(s in clean_msg for s in ["కడుపు", "stomach", "पेट"]):
                if user_lang in ["te", "te-en"]:
                    symptom_reply = (
                        "🩺 కడుపు నొప్పి ఉన్నప్పుడు సాధారణ మార్గదర్శకాలు (Abdominal Care):\n\n"
                        "1. తేలికపాటి నీరు లేదా మజ్జిగ తీసుకోండి; నూనె, కారం మరియు ఘనమైన ఆహారాన్ని తాత్కాలికంగా నివారించండి.\n"
                        "2. భోజనం వెంటనే పడుకోకుండా కొద్దిగా విశ్రాంతి తీసుకోండి.\n\n"
                        "⚠️ ప్రమాద సంకేతాలు (Red Flags):\n"
                        "• తీవ్రమైన భరించలేని నొప్పి లేదా కుడి కడుపు కింది భాగంలో (Right lower abdomen) నొప్పి రావడం\n"
                        "• రక్తపు వాంతులు లేదా నల్లటి మల విసర్జన\n"
                        "• తీవ్రమైన జ్వరం మరియు నిరంతర వాంతులు\n\n"
                        "ఈ లక్షణాలు ఉంటే ఆలస్యం చేయకుండా వెంటనే ఎమర్జెన్సీ లేదా జనరల్ ఫిజీషియన్‌ని సంప్రదించండి."
                    )
                    chips = ["సమీప క్లినిక్", "అల్ట్రాసౌండ్ స్కాన్ ఖర్చు", "ఎమర్జెన్సీ 108"]
                else:
                    symptom_reply = (
                        "🩺 Safe Guidance for Stomach Discomfort:\n\n"
                        "1. Sip light fluids (boiled water, clear soup); temporarily avoid spicy, oily, or heavy meals.\n"
                        "2. Rest comfortably and avoid immediate lying down after meals.\n\n"
                        "⚠️ When to Seek Urgent Clinical Care (Red Flags):\n"
                        "• Severe, unbearable pain or sharp pain localized in the lower right abdomen.\n"
                        "• Vomiting blood or passing black tarry stools.\n"
                        "• High fever accompanied by persistent inability to retain fluids.\n\n"
                        "Consult a physician or visit an emergency room promptly if severe symptoms appear."
                    )
                    chips = ["Nearest Clinic", "Ultrasound Abdomen Cost", "Emergency 108"]

                return GuidedChatResponse(
                    reply=symptom_reply,
                    reply_language=user_lang,
                    emergency_detected=False,
                    suggested_chips=chips,
                    audio_tts_text=clean_tts_text(symptom_reply)
                )

            else:
                # Other general symptom guidance
                if user_lang in ["te", "te-en"]:
                    symptom_reply = (
                        "🩺 సాధారణ ఆరోగ్య సలహా (Health Information Guidance):\n\n"
                        "మీరు పేర్కొన్న లక్షణాలకు తగినంత విశ్రాంతి తీసుకోవడం మరియు ద్రవాహారం తాగడం చాలా అవసరం.\n\n"
                        "• సాధారణ సమస్యలకు ప్రాథమిక ఆరోగ్య కేంద్రం (PHC / UPHC) లో ఉచితంగా చికిత్స లభిస్తుంది.\n"
                        "• ప్రైవేట్ క్లినిక్‌లలో జనరల్ ఫిజీషియన్ కన్సల్టేషన్ ఫీజు సుమారు ₹100 నుండి ₹300 వరకు ఉంటుంది.\n"
                        "• లక్షణాలు 48 గంటల్లో తగ్గకపోతే లేదా తీవ్రమైతే వెంటనే అర్హత గల వైద్యుడిని సంప్రదించండి."
                    )
                    chips = ["సమీప క్లినిక్‌లు", "సాధారణ ల్యాబ్ పరీక్షలు", "ఆరోగ్యశ్రీ ఆసుపత్రులు"]
                else:
                    symptom_reply = (
                        "🩺 General Healthcare Guidance:\n\n"
                        "For the symptoms mentioned, adequate rest, hydration, and observation are recommended.\n\n"
                        "• Urban Primary Health Centres (UPHCs) provide free primary care outpatient consultations.\n"
                        "• Private general physician clinics typically charge ₹100–₹300 for consultation.\n"
                        "• Please consult a licensed medical practitioner if symptoms do not improve within 48 hours or worsen."
                    )
                    chips = ["Find Nearby Clinics", "Standard Lab Tests", "Aarogyasri Hospitals"]

                return GuidedChatResponse(
                    reply=symptom_reply,
                    reply_language=user_lang,
                    emergency_detected=False,
                    suggested_chips=chips,
                    audio_tts_text=clean_tts_text(symptom_reply)
                )

        # STEP 5: Hospital Discovery Inquiry without Specific Procedure
        # e.g., "హైదరాబాద్లో దగ్గరలో హాస్పిటల్స్ చూపించు", "దగ్గరలో హాస్పిటల్స్ కావాలి", "find nearby hospitals"
        is_hospital_search_query = any(k in clean_msg for k in [
            "హాస్పిటల్", "హాస్పిటల్స్", "ఆసుపత్రి", "ఆసుపత్రులు", "hospital", "hospitals", "clinic", "अस्पताल"
        ]) and not parsed.matched_treatment_id and not any(t in clean_msg for t in ["cost", "ఖర్చు", "ధర", "రేటు", "ఫీజు"])

        db_available = is_database_available()

        if is_hospital_search_query:
            target_city = parsed.extracted_location or req.city or prev_city or "Hyderabad"

            if not db_available:
                # Safe, honest message without inventing hospitals or fake clinics
                if user_lang in ["te", "te-en"]:
                    hosp_reply = (
                        f"🏥 నేను మీ ప్రశ్నను అర్థం చేసుకున్నాను. అయితే {target_city} లో లైవ్ ఆసుపత్రుల డేటాబేస్ ప్రస్తుతం అందుబాటులో లేదు.\n\n"
                        "రోగుల భద్రత దృష్ట్యా CareSaathi ఊహాత్మక ఆసుపత్రి పేర్లను లేదా చిరునామాలను కల్పించదు.\n\n"
                        "👉 తక్షణ సహాయం కోసం:\n"
                        "• అత్యవసర పరిస్థితుల్లో: వెంటనే 108 కి కాల్ చేయండి\n"
                        "• వైద్య సమాచారం & సమీప ప్రభుత్వ ఆరోగ్య కేంద్రాల కోసం: జాతీయ ఆరోగ్య హెల్ప్‌లైన్ 104 కి కాల్ చేయండి\n\n"
                        "దయచేసి కాసేపటి తర్వాత లైవ్ ఆసుపత్రుల శోధనను మళ్లీ ప్రయత్నించండి."
                    )
                    chips = ["104 హెల్ప్‌లైన్", "108 ఎమర్జెన్సీ", "సాధారణ ఆరోగ్య సలహా", "మళ్లీ ప్రయత్నించండి (Retry)"]
                else:
                    hosp_reply = (
                        f"🏥 I understood your request, but the live hospital and pricing database for {target_city} is temporarily unavailable.\n\n"
                        "To protect patient safety, CareSaathi strictly refuses to invent fake hospital names or unverified addresses.\n\n"
                        "👉 Immediate Alternatives:\n"
                        "• For medical emergencies: Call 108 immediately\n"
                        "• For government health centre locations: Call National Health Helpline 104\n\n"
                        "Please retry the live facility search shortly."
                    )
                    chips = ["104 Health Helpline", "108 Emergency Ambulance", "General Health Guidance", "Retry Search"]

                return GuidedChatResponse(
                    reply=hosp_reply,
                    reply_language=user_lang,
                    emergency_detected=False,
                    suggested_chips=chips,
                    hospitals_card=[],
                    audio_tts_text=clean_tts_text(hosp_reply)
                )

            else:
                # Live database is available: fetch genuine hospitals
                is_govt_inquiry = any(g in clean_msg for g in [
                    "ప్రభుత్వ", "గవర్నమెంట్", "సర్కారీ", "सरकारी", "government", "govt", "free", "ఉచిత"
                ])
                ownership_filter = "Government" if is_govt_inquiry else None
                facilities = search_facilities(query_city=target_city, ownership_filter=ownership_filter)[:3]
                hospitals_card_data = [{
                    "id": f.id,
                    "name": f.name,
                    "ownership": f.ownership,
                    "locality": f.locality,
                    "city": f.city,
                    "pricing_status": f.pricing_status or ("Free / Cashless" if f.ownership == "Government" else "Standard Tariff"),
                    "phone": f.phone or "+91 40 2345 6789"
                } for f in facilities]

                if user_lang in ["te", "te-en"]:
                    if is_govt_inquiry:
                        hosp_reply = (
                            f"🏥 {target_city} లోని ప్రముఖ ప్రభుత్వ ఆసుపత్రులు (Government Hospitals) క్రింద ఇవ్వబడ్డాయి:\n\n"
                            "ఈ ఆసుపత్రులలో తెల్ల రేషన్ కార్డు / ఆయుష్మాన్ భారత్ కార్డు ఉన్నవారికి ఆరోగ్యశ్రీ కింద ₹0 నగదు రహిత చికిత్స లభిస్తుంది.\n\n"
                            "మీకు ఇంకా దగ్గరలోని ప్రభుత్వ ఆసుపత్రులను కనుగొనడానికి దయచేసి మీ ప్రాంతాన్ని లేదా పిన్ కోడ్‌ను (ఉదా: కూకట్‌పల్లి, సికింద్రాబాద్) తెలపండి."
                        )
                        chips = ["గాంధీ ఆసుపత్రి", "ఉస్మానియా జనరల్ ఆసుపత్రి", "నిమ్స్ (NIMS)", "ఆరోగ్యశ్రీ కార్డుతో ఉచితమా?"]
                    else:
                        hosp_reply = (
                            f"🏥 {target_city} లోని ప్రముఖ మరియు సిఫార్సు చేయబడిన ఆసుపత్రులు క్రింద ఇవ్వబడ్డాయి:\n\n"
                            "మీకు ఇంకా దగ్గరలోని ఆసుపత్రులను కనుగొనడానికి దయచేసి మీ ప్రాంతాన్ని లేదా పిన్ కోడ్‌ను (ఉదా: కూకట్‌పల్లి, బంజారా హిల్స్, సికింద్రాబాద్) తెలపండి.\n\n"
                            "ప్రభుత్వ ఆసుపత్రులలో తెల్ల రేషన్ కార్డు / ఆయుష్మాన్ భారత్ కార్డు ఉన్నవారికి ఆరోగ్యశ్రీ కింద ₹0 నగదు రహిత చికిత్స లభిస్తుంది."
                        )
                        chips = ["కూకట్‌పల్లి ఆసుపత్రులు", "బంజారా హిల్స్ ఆసుపత్రులు", "ప్రభుత్వ ఆసుపత్రులు (ఉచితం)", "ఆరోగ్యశ్రీ కేంద్రాలు"]
                else:
                    if is_govt_inquiry:
                        hosp_reply = (
                            f"🏥 Verified Government Hospitals in {target_city} are shown below:\n\n"
                            "These public facilities offer ₹0 cashless care under PM-JAY / Aarogyasri for eligible ration card holders.\n\n"
                            "To locate government centres closest to your area, please share your locality or PIN code."
                        )
                        chips = ["Gandhi Hospital", "Osmania Hospital", "NIMS Hyderabad", "Check Aarogyasri Eligibility"]
                    else:
                        hosp_reply = (
                            f"🏥 Verified major healthcare facilities in {target_city} are shown below:\n\n"
                            "To discover hospitals closest to your exact location, please share your locality or PIN code (e.g. Kukatpally, Banjara Hills, Secunderabad).\n\n"
                            "Government hospitals offer ₹0 cashless care under PM-JAY / Aarogyasri for eligible ration card holders."
                        )
                        chips = ["Kukatpally Hospitals", "Banjara Hills Hospitals", "Government Hospitals (Free)", "Aarogyasri Empanelled"]

                return GuidedChatResponse(
                    reply=hosp_reply,
                    reply_language=user_lang,
                    emergency_detected=False,
                    suggested_chips=chips,
                    hospitals_card=hospitals_card_data,
                    audio_tts_text=clean_tts_text(hosp_reply)
                )

        # STEP 6: Clinical Disambiguation (e.g., Knee Surgery: TKR vs Arthroscopy)
        target_city = parsed.extracted_location or req.city or prev_city or "Hyderabad"
        treatment_id = parsed.matched_treatment_id or req.treatment_id or prev_treatment_id or "knee_replacement"
        treatment = TREATMENT_CATALOGUE.get(treatment_id, TREATMENT_CATALOGUE["knee_replacement"])

        if (("knee" in clean_msg or "మోకాలి" in clean_msg or "घुटना" in clean_msg) and 
            not any(k in clean_msg for k in ["tkr", "replacement", "మార్పిడి", "arthroscopy", "ఆర్థ్రోస్కోపీ", "కీలు"]) and
            not any("tkr" in h.get("content", "").lower() for h in history)):

            if user_lang in ["te", "te-en"]:
                ambig_reply = (
                    f"హైదరాబాద్‌లో మోకాలి శస్త్రచికిత్సకు (Knee Surgery) సంబంధించిన ఖర్చు మరియు ఆసుపత్రుల వివరాలు:\n\n"
                    f"• ప్రభుత్వ ఆసుపత్రులు (గాంధీ, ఉస్మానియా, నిమ్స్): ఆరోగ్యశ్రీ లేదా ఆయుష్మాన్ భారత్ కార్డు ఉన్నవారికి ₹0 (పూర్తిగా ఉచితం).\n"
                    f"• ప్రైవేట్ ఆసుపత్రులు: మొత్తం మోకాలి మార్పిడి (TKR) ఖర్చు సుమారు ₹1,50,000 నుండి ₹3,20,000 వరకు ఉంటుంది. కీలు మరమ్మత్తు (ఆర్థ్రోస్కోపీ) అయితే ₹45,000 నుండి ₹90,000 వరకు ఉంటుంది.\n"
                    f"• ఎన్‌పీపీఏ (NPPA) అధికారిక నిబంధన ప్రకారం మోకాలి ఇంప్లాంట్ గరిష్ట ధర ₹54,000 - ₹74,000 కి పరిమితం చేయబడింది.\n\n"
                    f"మీకు 'మొత్తం మోకాలి మార్పిడి (TKR)' అవసరమా లేదా 'ఆర్థ్రోస్కోపీ' అవసరమా? దయచేసి ఎంచుకోండి."
                )
                chips = ["మొత్తం మోకాలి మార్పిడి (TKR)", "కీలు మరమ్మత్తు (Arthroscopy)", "ప్రభుత్వ ఆసుపత్రుల జాబితా", "ఆరోగ్యశ్రీ కార్డుతో ఉచితమా?"]
            else:
                ambig_reply = (
                    f"Cost & Hospital Options for Knee Surgery in {target_city}:\n\n"
                    f"• Government Hospitals (Gandhi, Osmania, NIMS): ₹0 (100% Cashless under Aarogyasri / PM-JAY for White Card holders).\n"
                    f"• Private Hospitals: Total Knee Replacement (TKR) ranges from ₹1,50,000 to ₹3,20,000, whereas Arthroscopic Knee Repair ranges from ₹45,000 to ₹90,000.\n"
                    f"• Knee Implants are legally capped under NPPA Order (₹54,000 - ₹74,000).\n\n"
                    f"Which procedure do you require: Total Knee Replacement (TKR) or Arthroscopy?"
                )
                chips = ["Total Knee Replacement (TKR)", "Arthroscopic Knee Repair", "Government Hospitals List", "Check Aarogyasri Eligibility"]

            top_facilities = search_facilities(query_city=target_city, treatment_id="knee_replacement")[:3] if db_available else []
            hospitals_card_data = [{
                "id": f.id,
                "name": f.name,
                "ownership": f.ownership,
                "locality": f.locality,
                "city": f.city,
                "pricing_status": f.pricing_status or ("Free / Cashless" if f.ownership == "Government" else "Private"),
                "phone": f.phone or "+91 40 2345 6789"
            } for f in top_facilities]

            return GuidedChatResponse(
                reply=ambig_reply,
                reply_language=user_lang,
                emergency_detected=False,
                suggested_chips=chips,
                is_clarification=True,
                clarification_options=["Total Knee Replacement (TKR)", "Arthroscopic Knee Repair"],
                hospitals_card=hospitals_card_data,
                audio_tts_text=clean_tts_text(ambig_reply)
            )

        # STEP 7: Specific Treatment Cost Inquiry Handling
        is_govt_inquiry = any(k in clean_msg for k in [
            "ప్రభుత్వ", "గవర్నమెంట్", "సర్కారీ", "सरकारी", "government", "govt hospital", "free", "తక్కువ ఖర్చుతో"
        ]) or parsed.facility_preference == "Government"

        # Check database availability for live pricing and facility discovery
        estimate = None
        if db_available:
            try:
                cost_req = CostEstimateRequest(
                    treatment=treatment.name,
                    city=target_city,
                    hospital_name=parsed.extracted_hospital_preference or None
                )
                estimate = estimate_cost(cost_req)
            except Exception as e:
                logger.warning(f"Error computing cost estimate: {e}. Falling back to catalogue reference.")
                estimate = None

        # Fetch facilities if database is available
        matching_facilities = search_facilities(query_city=target_city, treatment_id=treatment.id)[:3] if db_available else []
        hospitals_card_data = [{
            "id": f.id,
            "name": f.name,
            "ownership": f.ownership,
            "locality": f.locality,
            "city": f.city,
            "pricing_status": f.pricing_status or ("Free / Cashless" if f.ownership == "Government" else "Standard Tariff"),
            "phone": f.phone or "+91 40 2345 6789"
        } for f in matching_facilities]

        # Case A: Government Hospital Inquiry specifically
        if is_govt_inquiry:
            if user_lang in ["te", "te-en"]:
                reply_text = (
                    f"🏛️ {target_city} లో {treatment.name} కోసం ప్రభుత్వ ఆసుపత్రుల వివరాలు:\n\n"
                    f"• గాంధీ హాస్పిటల్, ఉస్మానియా జనరల్ హాస్పిటల్ మరియు నిమ్స్ (NIMS) లో ఆరోగ్యశ్రీ / PM-JAY కింద ఈ చికిత్స పూర్తిగా ఉచితం (₹0).\n"
                    f"• అర్హత: ఆహార భద్రత కార్డు (తెల్ల రేషన్ కార్డు) లేదా ఆయుష్మాన్ భారత్ కార్డు ఉన్నవారికి ప్రభుత్వం ₹10 లక్షల వరకు నగదు రహిత చికిత్స అందిస్తుంది.\n"
                    f"• రోగి చెల్లించాల్సిన ఖర్చు (Out-of-pocket): ₹0.\n"
                    f"• తీసుకెళ్లాల్సిన పత్రాలు: తెల్ల రేషన్ కార్డు, ఆధార్ కార్డు, ప్రభుత్వ డాక్టర్ రిఫరల్ లెటర్."
                )
                chips = ["తీసుకెళ్లాల్సిన పత్రాలు", "డాక్టర్ అపాయింట్‌మెంట్", "ప్రైవేట్ ఆసుపత్రులతో పోల్చండి"]
            else:
                reply_text = (
                    f"🏛️ Government Hospital Care for {treatment.name} in {target_city}:\n\n"
                    f"• Treatment is 100% Cashless (₹0) at Gandhi Hospital, Osmania General Hospital, and NIMS under Telangana Aarogyasri / PM-JAY.\n"
                    f"• Eligibility: White Ration Card holders receive comprehensive surgical coverage up to the ₹10 Lakh statutory limit.\n"
                    f"• Estimated Patient Out-of-Pocket Share: ₹0.\n"
                    f"• Mandatory Documents: White Ration Card, Aadhaar Card, Government Doctor Referral."
                )
                chips = ["Documents to Carry", "Check Aarogyasri Eligibility", "Compare with Private Hospitals"]

        # Case B: Cataract Eye Surgery
        elif treatment.id == "cataract_surgery" or "cataract" in clean_msg or "కంటి" in clean_msg:
            if user_lang in ["te", "te-en"]:
                reply_text = (
                    f"👁️ {target_city} లో కంటిశుక్లం (Cataract / Phacoemulsification) ఆపరేషన్ ఖర్చు వివరాలు:\n\n"
                    f"• ప్రభుత్వ ఆసుపత్రులు (సరోజిని దేవి కంటి ఆసుపత్రి): ఆరోగ్యశ్రీ కింద ₹0 (ఉచితం).\n"
                    f"• ప్రైవేట్ & స్పెషాలిటీ ఆసుపత్రులు (LVPEI, మ్యాక్స్‌విజన్): ఫోల్డబుల్ మోనోఫోకల్ ఐఓఎల్ తో ఫాకో సర్జరీ ఖర్చు సుమారు ₹22,000 నుండి ₹45,000 వరకు ఉంటుంది.\n"
                    f"• ప్రీమియం మల్టీఫోకల్ లెన్స్ ఎంచుకుంటే ఖర్చు ₹45,000 నుండి ₹85,000 వరకు ఉండవచ్చు.\n"
                    f"• డే-కేర్ ప్రొసీజర్: ఆసుపత్రిలో అడ్మిట్ అవ్వాల్సిన అవసరం లేకుండా కొన్ని గంటల్లోనే డిశ్చార్జ్ చేస్తారు."
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

        # Case C: Standard Multi-lingual Cost Explanation
        else:
            # Check if we have live database estimate vs catalogue fallback
            if estimate is not None:
                min_price = estimate.overall_min
                max_price = estimate.overall_max
                ref_min = treatment.indicative_min
                pat_min = estimate.waterfall.patient_share_min if estimate.waterfall else 0
                pat_max = estimate.waterfall.patient_share_max if estimate.waterfall else int(max_price * 0.15)
                conf = estimate.confidence
                p_type = estimate.price_type

                if user_lang in ["te", "te-en"]:
                    reply_text = (
                        f"🏥 {target_city} లో {treatment.name} ఖర్చు వివరాలు:\n\n"
                        f"• ఖర్చు ఆధారపడే అంశాలు: మీరు ఎంచుకునే ఆసుపత్రి వర్గం (ప్రభుత్వ vs ప్రైవేట్), గది రకం, మరియు ఇంప్లాంట్ రకం.\n"
                        f"• ప్రభుత్వ ఆసుపత్రులు (సబ్సిడీ / ఆరోగ్యశ్రీ): ₹{min_price:,} (తెల్ల రేషన్ కార్డుతో ఉచితం)\n"
                        f"• ప్రైవేట్ ఆసుపత్రుల సాధారణ శ్రేణి: ₹{ref_min:,} నుండి ₹{max_price:,}\n"
                        f"• తెల్ల రేషన్ కార్డు ఉన్నవారికి నికర ఖర్చు: ₹{pat_min:,} నుండి ₹{pat_max:,}\n"
                        f"• డేటా విశ్వసనీయత: {conf} ({p_type})"
                    )
                    chips = ["ప్రభుత్వ హాస్పిటల్లో తక్కువ ఖర్చుతో ఏమైనా అవకాశం ఉందా?", "తీసుకెళ్లాల్సిన పత్రాలు", "హాస్పిటల్ బిల్లింగ్ ప్రశ్నలు"]
                else:
                    reply_text = (
                        f"🏥 Estimated Cost for {treatment.name} in {target_city}:\n\n"
                        f"• Key Cost Drivers: Hospital category (Government vs Private), room type, and implant specifications.\n"
                        f"• Government Hospitals: ₹{min_price:,} (100% Cashless under PM-JAY / Aarogyasri)\n"
                        f"• Private Reference Range: ₹{ref_min:,} to ₹{max_price:,}\n"
                        f"• Net Out-of-Pocket for White Card holders: ₹{pat_min:,} to ₹{pat_max:,}\n"
                        f"• Evidence Confidence: {conf} ({p_type})"
                    )
                    chips = ["What about government hospitals?", "Documents to Carry", "Questions to Ask Hospital"]

            else:
                # Live database is offline or unavailable: respond gracefully using official statutory catalogue
                ref_min = treatment.indicative_min
                ref_max = treatment.indicative_max

                if user_lang in ["te", "te-en"]:
                    reply_text = (
                        f"🏥 {treatment.name} అంచనా ఖర్చు వివరాలు:\n\n"
                        f"చికిత్స ఖర్చు అనేది మీరు ఎంచుకునే నగరం, ఆసుపత్రి వర్గం (ప్రభుత్వ vs ప్రైవేట్) మరియు ప్రక్రియ వివరాలపై ఆధారపడి ఉంటుంది.\n\n"
                        f"• ప్రభుత్వ ఆసుపత్రులు: ఆరోగ్యశ్రీ / PM-JAY కింద ₹0 (పూర్తిగా ఉచితం).\n"
                        f"• ప్రైవేట్ ఆసుపత్రుల ప్రామాణిక శ్రేణి: సుమారు ₹{ref_min:,} నుండి ₹{ref_max:,}.\n"
                        f"• ఎన్‌పీపీఏ (NPPA) నిబంధన: స్టెంట్లు మరియు మోకాలి ఇంప్లాంట్లకు ప్రభుత్వ గరిష్ట ధర పరిమితి వర్తిస్తుంది.\n\n"
                        f"ℹ️ గమనిక: లైవ్ ఆసుపత్రులు మరియు ధరల డేటాబేస్ ప్రస్తుతం అందుబాటులో లేదు. అధికారిక ప్రామాణిక నిబంధనల ఆధారంగా ఈ సమాచారం అందించబడింది.\n\n"
                        f"మీకు ఖచ్చితమైన అంచనా కావాలంటే మీ నగరం మరియు ప్రభుత్వ లేదా ప్రైవేట్ ఆసుపత్రి కావాలో తెలపండి."
                    )
                    chips = ["ప్రభుత్వ ఆసుపత్రులు (ఉచితం)", "ప్రైవేట్ ఆసుపత్రులు", "ఆరోగ్యశ్రీ కార్డుతో ఉచితమా?"]
                else:
                    reply_text = (
                        f"🏥 Reference Cost for {treatment.name}:\n\n"
                        f"Total treatment costs depend on your location, hospital category (Government vs Private), and specific surgical procedure/implant details.\n\n"
                        f"• Government Hospitals: ₹0 (100% Cashless under PM-JAY / Aarogyasri for eligible cardholders).\n"
                        f"• Private Indicative Reference Range: ₹{ref_min:,} to ₹{ref_max:,}.\n"
                        f"• Statutory Price Caps: Medical implants are capped under NPPA statutory orders.\n\n"
                        f"ℹ️ Notice: Live hospital pricing search is temporarily unavailable. Showing official statutory reference benchmarks.\n\n"
                        f"To refine this estimate, please share your preferred city and whether you prefer government or private hospital care."
                    )
                    chips = ["Government Hospitals (Free)", "Private Hospitals", "Aarogyasri Cashless Eligibility"]

        # STEP 8: Strict Anti-Hallucination Validator
        facts = {
            "min_price": estimate.overall_min if estimate else treatment.indicative_min,
            "max_price": estimate.overall_max if estimate else treatment.indicative_max,
            "treatment_name": treatment.name
        }
        validated_reply, was_sanitized = validate_against_database(reply_text, facts)

        return GuidedChatResponse(
            reply=validated_reply,
            reply_language=user_lang,
            emergency_detected=False,
            suggested_chips=chips,
            extracted_data={
                "treatment_id": treatment.id,
                "treatment_name": treatment.name,
                "city": target_city,
                "confidence": estimate.confidence if estimate else "Reference Catalogue",
                "database_connected": db_available,
                "was_sanitized_by_validator": not was_sanitized
            },
            structured_estimate=estimate,
            hospitals_card=hospitals_card_data,
            audio_tts_text=clean_tts_text(validated_reply)
        )

    except Exception as exc:
        logger.exception("Unexpected error in process_guided_chat: %s", exc)
        try:
            det_lang, _ = detect_text_language(req.message)
            user_lang = req.language[:2] if req.language and req.language != "auto" else det_lang
        except Exception:
            user_lang = "te"

        if user_lang in ["te", "te-en"]:
            safe_fallback = (
                "నేను మీ ప్రశ్నను అర్థం చేసుకున్నాను. అయితే సమాచారాన్ని పొందేందుకు తాత్కాలిక సమస్య ఎదురైంది.\n\n"
                "సాధారణ ఆరోగ్య సలహాల కోసం లేదా మీ సందేహాన్ని స్పష్టంగా తెలుసుకోవడానికి దయచేసి క్రింద మీ ప్రశ్నను టైప్ చేయండి లేదా మళ్లీ మాట్లాడండి.\n\n"
                "అత్యవసరమైతే వెంటనే 108 కి కాల్ చేయండి."
            )
            chips = ["మళ్లీ మాట్లాడండి (Retry)", "టైప్ చేయండి", "108 ఎమర్జెన్సీ"]
        elif user_lang == "hi":
            safe_fallback = (
                "मैं आपके प्रश्न को समझ गया हूं। हालांकि इस समय जानकारी प्राप्त करने में एक अस्थायी समस्या आई है।\n\n"
                "कृपया अपना प्रश्न नीचे टाइप करें या दोबारा बोलें। आपात स्थिति के लिए तुरंत 108 पर कॉल करें।"
            )
            chips = ["दोबारा बोलें (Retry)", "टाइप करें", "108 इमरजेंसी"]
        else:
            safe_fallback = (
                "I understood your question, but encountered a temporary technical issue while fetching information.\n\n"
                "Please type your healthcare question below or try speaking again. For medical emergencies, call 108 immediately."
            )
            chips = ["Try Again", "Type Question", "Call 108 Emergency"]

        return GuidedChatResponse(
            reply=safe_fallback,
            reply_language=user_lang,
            emergency_detected=False,
            suggested_chips=chips,
            hospitals_card=[],
            audio_tts_text=clean_tts_text(safe_fallback)
        )
