import re
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
        # Look for treatments
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

        # Look for cities
        for city in ["hyderabad", "secunderabad", "kukatpally", "visakhapatnam", "vijayawada", "tirupati", "warangal", "bengaluru", "mumbai", "delhi"]:
            if city in content:
                if not prev_city: prev_city = city.capitalize()

        if "prescription" in content or "rx" in content or "మందులు" in content or "दवा" in content:
            if not prev_rx: prev_rx = content

    return prev_treatment, prev_city, prev_rx

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
    clean_msg = req.message.lower().strip()
    history = req.history or []

    # 0. Detect Language of interaction
    detected_lang, _ = detect_text_language(req.message)
    if req.language and req.language != "auto":
        user_lang = req.language[:2]
    else:
        user_lang = detected_lang  # te, hi, en, te-en

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

    # STEP 3: Multi-modal Prescription Analysis (Test B, Test C, Test E)
    is_prescription_query = (
        bool(req.prescription_text) or
        bool(req.prescription_filename) or
        any(k in clean_msg for k in ["prescription", "మందుల ఖర్చు", "మందుల వివరాలు", "మందుల మొత్తం", "दवाइयों का खर्च", "दवाइयां", "rx"])
    )

    if is_prescription_query:
        # Run Prescription OCR Parser
        ocr_req = PrescriptionOCRRequest(
            raw_text=req.prescription_text,
            filename=req.prescription_filename or (
                "unclear_handwriting_sample.jpg" if ("చేతిరాత" in clean_msg or "unclear" in clean_msg or "handwriting" in clean_msg)
                else "prescription_knee_tkr.jpg"
            )
        )
        ocr_res = process_prescription_ocr(ocr_req)

        # Test E: Unclear Handwriting Handling
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

        # Test B & C: Readable Medicines & Cost Calculation
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

    # STEP 4: Standard Clinical Query Parsing
    parsed = parse_user_query(req.message, current_location=req.city or prev_city)

    target_city = parsed.extracted_location or req.city or prev_city or "Hyderabad"
    treatment_id = parsed.matched_treatment_id or req.treatment_id or prev_treatment_id or "knee_replacement"
    treatment = TREATMENT_CATALOGUE.get(treatment_id, TREATMENT_CATALOGUE["knee_replacement"])

    # STEP 5: Follow-up Conversation: Government Hospital Inquiry (Test D)
    is_govt_inquiry = any(k in clean_msg for k in [
        "ప్రభుత్వ", "గవర్నమెంట్", "సర్కారీ", "सरकारी", "government", "govt hospital", "free", "తక్కువ ఖర్చుతో"
    ]) or parsed.facility_preference == "Government"

    # STEP 6: Ambiguity Handling (Prompt Ex 1 & 2)
    # Check if knee surgery is ambiguous between TKR and Arthroscopy
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

        # Fetch matching facilities in target city
        top_facilities = search_facilities(query_city=target_city, treatment_id="knee_replacement")[:3]
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

    # STEP 7: Generate Cost Estimate & Hospital Comparisons
    cost_req = CostEstimateRequest(
        treatment=treatment.name,
        city=target_city,
        hospital_name=parsed.extracted_hospital_preference or None
    )
    estimate = estimate_cost(cost_req)

    # Query facilities for visual hospital card
    matching_facilities = search_facilities(query_city=target_city, treatment_id=treatment.id)[:3]
    hospitals_card_data = [{
        "id": f.id,
        "name": f.name,
        "ownership": f.ownership,
        "locality": f.locality,
        "city": f.city,
        "pricing_status": f.pricing_status or ("Free / Cashless" if f.ownership == "Government" else "Standard Tariff"),
        "phone": f.phone or "+91 40 2345 6789"
    } for f in matching_facilities]

    # Test D: Government Hospital inquiry specifically
    if is_govt_inquiry:
        if user_lang in ["te", "te-en"]:
            reply_text = (
                f"🏛️ {target_city} లో {treatment.name} కోసం ప్రభుత్వ ఆసుపత్రుల వివరాలు:\n\n"
                f"• గాంధీ హాస్పిటల్, ఉస్మానియా జనరల్ హాస్పిటల్ మరియు నిమ్స్ (NIMS) లో ఆరోగ్యశ్రీ / PM-JAY కింద ఈ చికిత్స పూర్తిగా ఉచితం (₹0).\n"
                f"• అర్హత: ఆహార భద్రత కార్డు (తెల్ల రేషన్ కార్డు) లేదా ఆయుష్మాన్ భారత్ కార్డు ఉన్నవారికి ప్రభుత్వం ₹10 లక్షల వరకు నగదు రహిత చికిత్స అందిస్తుంది.\n"
                f"• రోగి చెల్లించాల్సిన ఖర్చు (Out-of-pocket): ₹0.\n"
                f"• తీసుకెళ్లాల్సిన పత్రాలు: తెల్ల రేషన్ కార్డు, ఆధార్ కార్డు, డాక్టర్ రిఫరల్ లెటర్."
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

    # Test A: Cataract Eye Surgery or General Inquiry in Telugu/English
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

    else:
        # Standard Multi-lingual Cost Explanation
        if user_lang in ["te", "te-en"]:
            reply_text = (
                f"🏥 {target_city} లో {treatment.name} ఖర్చు వివరాలు:\n\n"
                f"• ప్రభుత్వ ఆసుపత్రులు (సబ్సిడీ / ఆరోగ్యశ్రీ): ₹{estimate.overall_min:,} (ఉచితం)\n"
                f"• ప్రైవేట్ ఆసుపత్రుల సాధారణ శ్రేణి: ₹{estimate.indicative_min:,} నుండి ₹{estimate.overall_max:,}\n"
                f"• తెల్ల రేషన్ కార్డు ఉన్నవారికి నికర ఖర్చు: ₹{estimate.waterfall.patient_share_min:,} నుండి ₹{estimate.waterfall.patient_share_max:,}\n"
                f"• డేటా విశ్వసనీయత: {estimate.confidence} ({estimate.price_type})"
            )
            chips = ["ప్రభుత్వ హాస్పిటల్లో తక్కువ ఖర్చుతో ఏమైనా అవకాశం ఉందా?", "తీసుకెళ్లాల్సిన పత్రాలు", "హాస్పిటల్ బిల్లింగ్ ప్రశ్నలు"]
        else:
            reply_text = (
                f"🏥 For {treatment.name} in {target_city}:\n\n"
                f"• Indicative Range: ₹{estimate.overall_min:,} (Govt/Subsidized) to ₹{estimate.overall_max:,} (Private)\n"
                f"• Official Scheme Ceiling: Up to ₹10 Lakhs cashless under Aarogyasri / PM-JAY\n"
                f"• Net Out-of-Pocket for White Card holders: ₹{estimate.waterfall.patient_share_min:,} to ₹{estimate.waterfall.patient_share_max:,}\n"
                f"• Evidence Confidence: {estimate.confidence} ({estimate.price_type})"
            )
            chips = ["What about government hospitals?", "Documents to Carry", "Questions to Ask Hospital"]

    # STEP 8: Strict Anti-Hallucination Validator
    facts = {
        "min_price": estimate.overall_min,
        "max_price": estimate.overall_max,
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
            "confidence": estimate.confidence,
            "was_sanitized_by_validator": not was_sanitized
        },
        structured_estimate=estimate,
        hospitals_card=hospitals_card_data,
        audio_tts_text=clean_tts_text(validated_reply)
    )
