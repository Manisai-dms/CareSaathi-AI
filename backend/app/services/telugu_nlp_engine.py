# Advanced Multi-lingual Medical NLP Engine
# Supports Telugu, English, Hindi, and Telugu-English code-switching (e.g. "నాకు knee replacement cost ఎంత అవుతుంది?")
# Implements:
# 1. Script & Language identification
# 2. Unicode normalization & numeral translation
# 3. Medical entity extraction (Condition, Procedure, Diagnostic, Medicine, Location, Facility Pref, Budget)
# 4. Clinical disambiguation & missing information detection (no guessing or inventing data)
# 5. User confirmation prompting for ambiguous clinical needs

import re
import unicodedata
from typing import Dict, Any, List, Optional, Tuple
from ..data.catalogue import TREATMENT_CATALOGUE, Treatment

# Telugu Digits Mapping to Arabic Digits
TELUGU_DIGITS = {
    '౦': '0', '౧': '1', '౨': '2', '౩': '3', '౪': '4',
    '౫': '5', '౬': '6', '౭': '7', '౮': '8', '౯': '9'
}

# Devanagari Digits Mapping
DEVANAGARI_DIGITS = {
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
}

# Critical Emergency Keywords (Multi-lingual)
EMERGENCY_LEXICON = {
    "te": [
        "ఛాతీ నొప్పి", "ఛాతినొప్పి", "గుండెపోటు", "శ్వాస ఆడకపోవడం", "ఊపిరి ఆడట్లేదు",
        "తీవ్ర రక్తస్రావం", "రక్తం కారడం", "పక్షవాతం", "స్పృహ తప్పడం", "స్పృహ కోల్పోవడం",
        "మూర్ఛ", "ఫిట్స్", "తీవ్రమైన తల గాయం", "విషం", "విషప్రయోగం"
    ],
    "hi": [
        "सीने में दर्द", "दिल का दौरा", "हार्ट अटैक", "सांस लेने में तकलीफ", "बेहोश",
        "भारी रक्तस्राव", "लकवा", "दौरा", "गंभीर सिर की चोट", "जहर"
    ],
    "en": [
        "chest pain", "heart attack", "unconscious", "unresponsive", "severe breathlessness",
        "difficulty breathing", "heavy bleeding", "sudden paralysis", "stroke", "paralysis",
        "severe head trauma", "seizure", "convulsions", "choking", "poisoning"
    ]
}

# Multi-lingual Medical Conditions & Symptoms
SYMPTOM_LEXICON = {
    "knee_pain": {
        "te": ["మోకాలి నొప్పి", "కీళ్ల నొప్పి", "మోకాళ్ళ నొప్పులు", "కీళ్లు వాపు", "నడవలేకపోవడం"],
        "hi": ["घुटने का दर्द", "जोड़ों का दर्द", "घुटनों में सूजन"],
        "en": ["knee pain", "joint pain", "swollen knee", "walking difficulty", "arthritis pain"]
    },
    "fever": {
        "te": ["జ్వరం", "చలిజ్వరం", "తీవ్ర జ్వరం", "వణుకు", "డెంగ్యూ జ్వరం"],
        "hi": ["बुखार", "तेज बुखार", "कंपकंपी", "डेंगू"],
        "en": ["fever", "high temperature", "chills", "fever for five days", "shivering", "dengue"]
    },
    "cataract_symptom": {
        "te": ["కంటి మసక", "చూపు మసకబారడం", "కళ్లు సరిగ్గా కనిపించకపోవడం"],
        "hi": ["धुंधला दिखना", "आंखों में धुंधलापन", "कम दिखाई देना"],
        "en": ["blurred vision", "cloudy vision", "diminished eyesight", "poor vision"]
    },
    "abdominal_pain": {
        "te": ["కడుపు నొప్పి", "కడుపులో మంట", "తీవ్ర కడుపు నొప్పి"],
        "hi": ["पेट दर्द", "पेट में मरोड़", "गंभीर पेट दर्द"],
        "en": ["stomach ache", "abdominal pain", "severe stomach pain"]
    },
    "chest_discomfort": {
        "te": ["ఛాతీలో అసౌకర్యం", "గుండె దడ", "ఆయాసం"],
        "hi": ["सीने में भारीपन", "घबराहट"],
        "en": ["chest discomfort", "palpitations", "mild breathlessness"]
    }
}

# Multi-lingual Locations
LOCATION_LEXICON = {
    "Hyderabad": ["హైదరాబాద్", "హైదరాబాదు", "हैदराबाद", "hyderabad"],
    "Secunderabad": ["సికింద్రాబాద్", "సికింద్రాబాదు", "सिकंदराबाद", "secunderabad"],
    "Kukatpally": ["కూకట్‌పల్లి", "కూకట్ పల్లి", "कूकटपल्ली", "kukatpally"],
    "Banjara Hills": ["బంజారా హిల్స్", "బంజారాహిల్స్", "बंजारा हिल्स", "banjara hills"],
    "Gachibowli": ["గచ్చిబౌలి", "गचीबोवली", "gachibowli"],
    "Warangal": ["వరంగల్", "వరంగల్లు", "वारंगल", "warangal"],
    "Visakhapatnam": ["విశాఖపట్నం", "విశాఖ", "వైజాగ్", "विशाखापत्तनम", "visakhapatnam", "vizag"],
    "Vijayawada": ["విజయవాడ", "బెజవాడ", "विजयवाड़ा", "vijayawada"],
    "Tirupati": ["తిరుపతి", "तिरुपति", "tirupati"],
    "Bengaluru": ["బెంగళూరు", "బెంగళూర్", "बेंगलुरु", "बैंगलोर", "bengaluru", "bangalore"],
    "Mumbai": ["ముంబై", "ముంబాయి", "मुंबई", "mumbai", "bombay"],
    "New Delhi": ["ఢిల్లీ", "న్యూఢిల్లీ", "दिल्ली", "नई दिल्ली", "delhi", "new delhi"],
    "Lucknow": ["లక్నో", "लखनऊ", "lucknow"],
    "Barabanki": ["బారాబంకి", "बाराबंकी", "barabanki"],
    "Chennai": ["చెన్నై", "మద్రాస్", "चेन्नई", "chennai"],
    "Kolkata": ["కోల్‌కతా", "కలకత్తా", "कोलकाता", "kolkata"]
}

# Facility Ownership Preference Lexicon
FACILITY_PREFERENCE_LEXICON = {
    "Government": [
        "గవర్నమెంట్", "గవర్నమెంటు", "ప్రభుత్వ", "ప్రభుత్వ ఆసుపత్రి", "సర్కారీ", 
        "सरकारी", "सरकारी अस्पताल", "government", "govt", "public hospital"
    ],
    "Private": [
        "ప్రైవేట్", "ప్రైవేటు", "కార్పొరేట్", "నిజీ", "प्राइवेट", "निजी", "private", "corporate"
    ],
    "Charitable/Trust": [
        "ట్రస్ట్", "చారిటబుల్", "ధర్మశాల", "ట్రస్టు", "ट्रस्ट", "चैरिटेबल", "charitable", "trust", "non-profit"
    ]
}

# Intent Keywords
INTENT_LEXICON = {
    "cost_estimate": {
        "te": ["ఖర్చు", "ధర", "ఎంత", "రేటు", "ఫీజు", "బడ్జెట్", "అవుతుంది", "ఖర్చవుతుంది"],
        "hi": ["खर्च", "कीमत", "कितना", "दाम", "लागत", "फीस"],
        "en": ["cost", "how much", "price", "estimate", "rate", "fee", "budget", "expenses", "charges"]
    },
    "hospital_discovery": {
        "te": ["హాస్పిటల్", "హాస్పిటల్స్", "ఆసుపత్రి", "ఆసుపత్రులు", "దగ్గరలో", "ఎక్కడ", "ఉన్నాయి", "పరిసరాల్లో"],
        "hi": ["अस्पताल", "हॉस्पिटल", "पास में", "कहाँ", "नजदीक"],
        "en": ["hospital", "hospitals", "find", "where", "near", "nearby", "center", "clinic"]
    },
    "scheme_navigator": {
        "te": ["ఆరోగ్యశ్రీ", "ఆయుష్మాన్ భారత్", "పీఎం జేవై", "పథకం", "కార్డు", "ఇన్సూరెన్స్", "ఉచిత చికిత్స"],
        "hi": ["आयुष्मान भारत", "पीएम जेएवाई", "योजना", "बीमा", "कार्ड", "मुफ्त"],
        "en": ["scheme", "insurance", "pmjay", "pm-jay", "aarogyasri", "ayushman bharat", "card", "cashless"]
    },
    "diagnostic_estimate": {
        "te": ["టెస్ట్ ఖర్చు", "స్కాన్ ఖర్చు", "టెస్ట్ రేటు", "ల్యాబ్ ఖర్చు"],
        "hi": ["जांच का खर्च", "टेस्ट का खर्च", "स्कैन का खर्च"],
        "en": ["scan cost", "test price", "lab charges", "mri cost", "xray price"]
    }
}

def detect_text_language(text: str) -> Tuple[str, float]:
    """
    Identifies the predominant language: 'te' (Telugu), 'hi' (Hindi), 'en' (English), or 'te-en' (Code-switched).
    """
    telugu_count = len(re.findall(r'[\u0C00-\u0C7F]', text))
    hindi_count = len(re.findall(r'[\u0900-\u097F]', text))
    latin_count = len(re.findall(r'[a-zA-Z]', text))
    total_alpha = telugu_count + hindi_count + latin_count

    if total_alpha == 0:
        return "en", 0.50

    if telugu_count > 0 and latin_count > 0:
        return "te-en", 0.90
    if telugu_count > 0 and telugu_count >= latin_count:
        return "te", 0.95
    if hindi_count > 0 and hindi_count >= latin_count:
        return "hi", 0.95
    if latin_count > 0:
        return "en", 0.95

    return "en", 0.70

def normalize_multilingual_text(text: str) -> str:
    """
    Performs NFC Unicode normalization, translates Telugu/Devanagari digits to standard digits.
    """
    norm = unicodedata.normalize('NFC', text.strip())
    # Convert Telugu digits
    for t_char, d_char in TELUGU_DIGITS.items():
        norm = norm.replace(t_char, d_char)
    # Convert Devanagari digits
    for h_char, d_char in DEVANAGARI_DIGITS.items():
        norm = norm.replace(h_char, d_char)
    return norm

def extract_multilingual_budget(text: str) -> Optional[int]:
    """
    Extracts budget in Telugu, Hindi, or English numerals and words (e.g., 2 లక్షలు, 50 వేలు, 2.5 lakh, 50000).
    """
    clean = text.lower()

    # Telugu Lakhs: '2 లక్షలు', '1.5 లక్ష'
    te_lakh = re.search(r'(\d+(?:\.\d+)?)\s*(?:లక్ష|లక్షలు|లక్షల|లక్షల్లో)\b', clean)
    if te_lakh:
        return int(float(te_lakh.group(1)) * 100000)

    # Telugu Thousands: '50 వేలు', '20 వేల'
    te_thous = re.search(r'(\d+)\s*(?:వేలు|వేల|వేలలో)\b', clean)
    if te_thous:
        return int(te_thous.group(1)) * 1000

    # Hindi Lakhs: '2 लाख', '1.5 लाख'
    hi_lakh = re.search(r'(\d+(?:\.\d+)?)\s*(?:लाख)\b', clean)
    if hi_lakh:
        return int(float(hi_lakh.group(1)) * 100000)

    # Hindi Thousands: '50 हज़ार', '50 हजार'
    hi_thous = re.search(r'(\d+)\s*(?:हजार|हज़ार)\b', clean)
    if hi_thous:
        return int(hi_thous.group(1)) * 1000

    # English Lakhs
    en_lakh = re.search(r'(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs|l)\b', clean)
    if en_lakh:
        return int(float(en_lakh.group(1)) * 100000)

    # Standard numeric currency figures
    num_match = re.search(r'(?:under|below|budget|within|max|₹|rs\.?)\s*(\d{4,7})\b', clean)
    if num_match:
        return int(num_match.group(1))

    return None

def extract_multilingual_location(text: str) -> Optional[str]:
    """
    Extracts location in Telugu, Hindi, or English script, including Indian 6-digit PIN codes.
    """
    clean = text.lower()

    # 1. Check PIN code
    pin_match = re.search(r'\b([1-9][0-9]{5})\b', clean)
    if pin_match:
        return f"PIN {pin_match.group(1)}"

    # 2. Check Dictionary entries
    for canonical_city, aliases in LOCATION_LEXICON.items():
        for alias in aliases:
            if alias.lower() in clean:
                return canonical_city

    return None

def extract_facility_preference(text: str) -> Optional[str]:
    """
    Extracts facility preference (Government, Private, Charitable/Trust) in Telugu, Hindi, or English.
    """
    clean = text.lower()
    for pref_key, aliases in FACILITY_PREFERENCE_LEXICON.items():
        for alias in aliases:
            if alias.lower() in clean:
                return pref_key
    return None

def parse_medical_query_advanced(text: str, current_location: Optional[str] = None) -> Dict[str, Any]:
    """
    Comprehensive multi-lingual clinical NLP parsing pipeline.
    Identifies language, intent, procedure, diagnostic, condition, medicine, location, budget,
    and flags ambiguities/missing info without guessing.
    """
    normalized_text = normalize_multilingual_text(text)
    clean_lower = normalized_text.lower()
    detected_lang, lang_confidence = detect_text_language(normalized_text)

    # 1. Emergency Detection
    emergency_detected = False
    detected_emergencies = []
    for lang_key, keywords in EMERGENCY_LEXICON.items():
        for kw in keywords:
            if kw.lower() in clean_lower:
                emergency_detected = True
                detected_emergencies.append(kw)

    if emergency_detected:
        triage_msg = (
            "తీవ్రమైన అత్యవసర పరిస్థితి (MEDICAL EMERGENCY): మీరు పేర్కొన్న లక్షణానికి తక్షణ వైద్య సహాయం అవసరం. "
            "ఖర్చు వివరాల కోసం వేచి ఉండకండి. దయచేసి వెంటనే 108 కి కాల్ చేయండి లేదా సమీప ఆసుపత్రి ఎమర్జెన్సీ విభాగానికి వెళ్లండి."
            if detected_lang in ["te", "te-en"] else
            "POTENTIAL MEDICAL EMERGENCY: This symptom indicates a time-critical condition requiring immediate clinical care. "
            "Do not delay for cost estimation or comparison. Please call 108 or proceed to the nearest emergency department immediately."
        )
        return {
            "raw_query": text,
            "detected_language": detected_lang,
            "detected_intent": "emergency_triage",
            "emergency_detected": True,
            "emergency_interrupt_required": True,
            "is_symptom_not_diagnosis": True,
            "detected_symptoms": detected_emergencies,
            "triage_guidance": triage_msg,
            "clarification_question": None,
            "suggested_action": "emergency_call_108",
            "missing_fields": [],
            "ambiguities": [],
            "confidence_by_field": {"intent": 0.99, "emergency": 0.99},
            "requires_user_confirmation": False
        }

    # 2. Extract Location, Budget & Facility Preference
    extracted_loc = extract_multilingual_location(clean_lower) or current_location
    extracted_budget = extract_multilingual_budget(clean_lower)
    extracted_facility_pref = extract_facility_preference(clean_lower)

    # 3. Intent Detection
    matched_intent = "general"
    intent_scores = {}
    for intent_name, lang_dict in INTENT_LEXICON.items():
        matched_kw_count = 0
        for l_key, words in lang_dict.items():
            for w in words:
                if w.lower() in clean_lower:
                    matched_kw_count += 1
        if matched_kw_count > 0:
            intent_scores[intent_name] = matched_kw_count

    if "scheme_navigator" in intent_scores:
        matched_intent = "scheme_navigator"
    elif "diagnostic_estimate" in intent_scores:
        matched_intent = "diagnostic_estimate"
    elif "cost_estimate" in intent_scores and "hospital_discovery" in intent_scores:
        matched_intent = "cost_estimate"  # dual intent, primary cost estimation
    elif "cost_estimate" in intent_scores:
        matched_intent = "cost_estimate"
    elif "hospital_discovery" in intent_scores:
        matched_intent = "hospital_discovery"

    # 4. Extract Condition / Symptoms
    detected_symptoms = []
    for s_key, lang_terms in SYMPTOM_LEXICON.items():
        for l_key, terms in lang_terms.items():
            for term in terms:
                if term.lower() in clean_lower:
                    detected_symptoms.append(term)
                    break

    # 5. Extract Procedure, Diagnostic, & Check Disambiguation
    condition = None
    procedure = None
    diagnostic_test = None
    matched_treatment_id = None
    canonical_treatment_obj = None
    ambiguities = []
    missing_fields = []
    clarification_question = None

    # Check for Specific Procedures in Catalogue
    # Rule 1: Knee surgery ambiguity check
    if any(k in clean_lower for k in ["మోకాలి ఆపరేషన్", "మోకాలు ఆపరేషన్", "knee surgery", "घुटने का ऑपरेशन"]):
        # Check if user specified replacement vs repair
        if any(r in clean_lower for r in ["మార్పిడి", "replacement", "tkr", "ప్రత్యామ్నాయం", "प्रत्यारोपण"]):
            matched_treatment_id = "knee_replacement"
            procedure = "Total Knee Replacement (TKR)"
        else:
            # Ambiguous: could be TKR or Arthroscopic ligament repair
            ambiguities.append(
                "Knee surgery can indicate Total Knee Replacement (TKR ₹1.5L–₹3.2L) or Arthroscopy (₹45k–₹90k)."
            )
            missing_fields.append("specific_knee_procedure_type")
            clarification_question = (
                "మోకాలి శస్త్రచికిత్సలో 'మొత్తం మోకాలి మార్పిడి (TKR)' లేదా 'కీలు మరమ్మత్తు (ఆర్థ్రోస్కోపీ)' - ఏ ప్రక్రియ అవసరమో దయచేసి నిర్ధారించండి."
                if detected_lang in ["te", "te-en"] else
                "Knee surgery may refer to Total Knee Replacement (TKR) or Knee Arthroscopy. Please clarify which procedure is intended."
            )
            matched_treatment_id = "knee_replacement"  # default candidate
            procedure = "Knee Surgery (Clarification Required)"

    # Rule 2: Cataract Surgery
    elif any(k in clean_lower for k in ["కంటిశుక్లం", "కంటి శుక్లం", "కంటి ఆపరేషన్", "cataract", "phaco", "motiyabind", "मोतियाबिंद"]):
        matched_treatment_id = "cataract_surgery"
        procedure = "Cataract Surgery (Phacoemulsification with Foldable IOL)"

    # Rule 3: MRI Scan & Missing Body Region Check
    elif any(k in clean_lower for k in ["ఎంఆర్ఐ", "ఎమ్మార్ఐ", "mri", "mri scan", "एमआरआई"]):
        diagnostic_test = "Magnetic Resonance Imaging (MRI)"
        if any(b in clean_lower for b in ["మెదడు", "తల", "brain", "head", "मस्तिष्क"]):
            matched_treatment_id = "mri_brain"
            diagnostic_test = "MRI Brain"
        elif any(k in clean_lower for k in ["మోకాలు", "మోకాలి", "knee", "घुटने"]):
            matched_treatment_id = "mri_knee"
            diagnostic_test = "MRI Knee Joint"
        elif any(s in clean_lower for s in ["వెన్నెముక", "నడుము", "వీపు", "spine", "back", "रीढ़"]):
            matched_treatment_id = "mri_spine"
            diagnostic_test = "MRI Lumbo-Sacral Spine"
        else:
            missing_fields.append("mri_body_region")
            ambiguities.append("MRI scan pricing varies by anatomical region (Brain, Knee, Spine, Abdomen).")
            clarification_question = (
                "MRI స్కాన్ ఏ శరీర భాగానికి (ఉదాహరణకు: మెదడు, మోకాలు, వెన్నెముక) అవసరమో దయచేసి తెలపండి."
                if detected_lang in ["te", "te-en"] else
                "Please specify which body region (e.g. Brain, Knee, or Spine) requires the MRI scan."
            )
            matched_treatment_id = "mri_brain"  # baseline representative

    # Rule 4: Blood Tests
    elif any(k in clean_lower for k in ["రక్త పరీక్ష", "రక్త పరీక్షలు", "బ్లడ్ టెస్ట్", "blood test", "cbc", "खून की जांच"]):
        matched_treatment_id = "blood_tests"
        diagnostic_test = "Routine Comprehensive Blood Work (CBC / LFT / KFT)"

    # Rule 5: Kidney Stones
    elif any(k in clean_lower for k in ["మూత్రపిండ రాళ్లు", "కిడ్నీ రాళ్లు", "kidney stone", "kidney stones", "గుర్దే కి పథ్రీ"]):
        matched_treatment_id = "kidney_stones"
        procedure = "Kidney Stone Removal (PCNL / URSL Laser)"

    # Rule 6: Angioplasty / Heart Stent
    elif any(k in clean_lower for k in ["గుండె చికిత్స", "స్టెంట్", "యాంజియోప్లాస్టీ", "heart stent", "angioplasty", "ptca"]):
        matched_treatment_id = "angioplasty"
        procedure = "Coronary Angioplasty (PTCA Stent)"

    # Rule 7: Gallbladder
    elif any(k in clean_lower for k in ["పిత్తాశయం", "గాల్ బ్లాడర్", "gallbladder", "gallstone", "lap chole"]):
        matched_treatment_id = "laparoscopic_cholecystectomy"
        procedure = "Laparoscopic Gallbladder Removal (Cholecystectomy)"

    # Rule 8: Appendix
    elif any(k in clean_lower for k in ["అపెండిక్స్", "అపెండిసైటిస్", "appendix", "appendicitis"]):
        matched_treatment_id = "appendectomy"
        procedure = "Appendectomy"

    # Rule 9: Dialysis
    elif any(k in clean_lower for k in ["డయాలసిస్", "కిడ్నీ డయాలసిస్", "dialysis"]):
        matched_treatment_id = "hemodialysis"
        procedure = "Maintenance Hemodialysis"

    # Rule 10: Maternity Delivery
    elif any(k in clean_lower for k in ["ప్రసవం", "డెలివరీ", "delivery", "childbirth"]):
        if any(c in clean_lower for c in ["సిజేరియన్", "సి-సెక్షన్", "ఆపరేషన్", "c-section", "cesarean"]):
            matched_treatment_id = "caesarean_delivery"
            procedure = "Caesarean Section Delivery (LSCS)"
        else:
            matched_treatment_id = "normal_delivery"
            procedure = "Normal Vaginal Delivery"

    # Rule 11: Inpatient Fever Management
    elif any(k in clean_lower for k in ["డెంగ్యూ", "తీవ్ర జ్వరం", "జ్వరం 5 రోజులు", "dengue", "fever 5 days"]):
        matched_treatment_id = "inpatient_fever_management"
        procedure = "Inpatient Acute Febrile Illness / Dengue Care"

    if matched_treatment_id and matched_treatment_id in TREATMENT_CATALOGUE:
        canonical_treatment_obj = TREATMENT_CATALOGUE[matched_treatment_id]
        if not procedure and not diagnostic_test:
            procedure = canonical_treatment_obj.name

    # Check for missing location when location is mandatory for hospital finding
    if not extracted_loc and matched_intent in ["hospital_discovery", "cost_estimate"]:
        missing_fields.append("location")
        if not clarification_question:
            clarification_question = (
                "మీకు సమీపంలోని ఆసుపత్రులు మరియు ఖచ్చితమైన ధరలను కనుగొనడానికి మీ నగరం లేదా ప్రాంతం (ఉదా: హైదరాబాద్, వరంగల్, వైజాగ్) తెలపండి."
                if detected_lang in ["te", "te-en"] else
                "Please provide your city or locality (e.g. Hyderabad, Bengaluru, Visakhapatnam) to find nearby hospitals."
            )

    # Medicine Entities Check
    medicine_entities = []
    for med_token in ["dolo", "dolo 650", "pan 40", "augmentin", "augmentin 625", "telma", "metformin", "paracetamol", "pantoprazole"]:
        if med_token in clean_lower:
            medicine_entities.append(med_token.title())

    # Build Field Confidence Scores
    confidence_by_field = {
        "language": lang_confidence,
        "intent": 0.92 if matched_intent != "general" else 0.50,
        "procedure": 0.95 if (matched_treatment_id and not ambiguities) else (0.65 if ambiguities else 0.0),
        "location": 0.90 if extracted_loc else 0.0
    }

    requires_confirmation = bool(ambiguities or ("location" in missing_fields and not current_location))

    # Suggested Action
    if emergency_detected:
        suggested_action = "emergency_call_108"
    elif detected_symptoms and not matched_treatment_id:
        suggested_action = "confirm_symptom_care"
    elif requires_confirmation:
        suggested_action = "request_clarification"
    elif matched_treatment_id:
        suggested_action = "run_search"
    else:
        suggested_action = "show_catalogue"

    return {
        "raw_query": text,
        "detected_language": detected_lang,
        "detected_intent": matched_intent,
        "condition": condition or (detected_symptoms[0] if detected_symptoms else None),
        "procedure": procedure,
        "diagnostic_test": diagnostic_test,
        "extracted_treatment": canonical_treatment_obj.name if canonical_treatment_obj else procedure,
        "matched_treatment_id": matched_treatment_id,
        "extracted_location": extracted_loc,
        "extracted_budget": extracted_budget,
        "budget": extracted_budget,
        "extracted_hospital_preference": extracted_facility_pref,
        "facility_preference": extracted_facility_pref,
        "medicine_entities": medicine_entities,
        "detected_symptoms": detected_symptoms,
        "is_symptom_not_diagnosis": bool(detected_symptoms and not matched_treatment_id),
        "emergency_detected": emergency_detected,
        "emergency_interrupt_required": emergency_detected,
        "triage_guidance": None,
        "clarification_question": clarification_question,
        "suggested_action": suggested_action,
        "missing_fields": missing_fields,
        "ambiguities": ambiguities,
        "confidence_by_field": confidence_by_field,
        "requires_user_confirmation": requires_confirmation,
        "canonical_translation": (
            f"Cost inquiry for {procedure or diagnostic_test or 'healthcare treatment'} in {extracted_loc or 'unspecified location'}"
            if detected_lang != "en" else None
        )
    }
