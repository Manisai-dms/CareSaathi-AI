import re
from typing import Optional, List, Dict
from ..models.schemas import NLPParseResponse, Treatment
from ..data.catalogue import normalize_treatment_query, TREATMENT_CATALOGUE

# Critical emergency symptoms that require urgent medical attention rather than shopping for costs
EMERGENCY_KEYWORDS = [
    "chest pain", "heart attack", "unconscious", "unresponsive", "severe breathlessness",
    "difficulty breathing", "heavy bleeding", "sudden paralysis", "stroke", "paralysis",
    "severe head trauma", "seizure", "convulsions", "choking", "poisoning"
]

# Non-emergency symptoms (distinct from confirmed diagnoses or procedures)
SYMPTOM_KEYWORDS = {
    "fever": ["fever", "bukhar", "high temperature", "chills", "fever for five days", "shivering"],
    "cough": ["cough", "khansi", "sore throat", "cold"],
    "joint_pain": ["knee pain", "joint pain", "swollen knee", "arthritis ache", "walking pain"],
    "abdominal_pain": ["stomach ache", "abdomen pain", "pitta pain", "severe stomach ache"],
    "headache": ["headache", "migraine", "head dizziness"],
    "vision_blur": ["blurred vision", "cloudy eyes", "eye strain", "cannot see clearly"]
}

# Known locations across India
COMMON_LOCATIONS = [
    "kukatpally", "banjara hills", "jubilee hills", "secunderabad", "hitec city", "gachibowli",
    "somajiguda", "hyderguda", "panjagutta", "musheerabad", "kondapur", "madhapur", "begumpet",
    "hyderabad", "bengaluru", "bangalore", "delhi", "new delhi", "mumbai", "chennai", "kolkata",
    "pune", "ahmedabad", "jaipur", "lucknow", "patna", "visakhapatnam", "kochi", "chandigarh",
    "barabanki", "ahmednagar", "ralegan siddhi", "warangal", "mysuru", "surat", "bhopal", "indore",
    "telangana", "maharashtra", "karnataka", "tamil nadu", "uttar pradesh", "gujarat", "kerala",
    "rajasthan", "west bengal", "bihar", "madhya pradesh", "andhra pradesh"
]

def parse_user_query(text: str, current_location: Optional[str] = None) -> NLPParseResponse:
    clean_text = text.lower().strip()
    
    # 1. Check for Emergency Symptoms
    emergency_detected = False
    for em in EMERGENCY_KEYWORDS:
        if em in clean_text:
            emergency_detected = True
            return NLPParseResponse(
                raw_query=text,
                detected_intent="emergency_triage",
                emergency_detected=True,
                is_symptom_not_diagnosis=True,
                detected_symptoms=[em],
                triage_guidance="POTENTIAL MEDICAL EMERGENCY: This symptom indicates a time-critical condition requiring immediate clinical care. Do not delay for cost estimation or comparison. Please call 108 (National Emergency Ambulance) or proceed to the nearest emergency department immediately.",
                clarification_question=None,
                suggested_action="emergency_call_108"
            )

    # 2. Extract Location
    extracted_loc = None
    for loc in COMMON_LOCATIONS:
        if re.search(r'\b' + re.escape(loc) + r'\b', clean_text):
            extracted_loc = loc.title()
            break
    if not extracted_loc and current_location:
        extracted_loc = current_location

    # 3. Extract Budget if mentioned (e.g., under 50000, budget 2 lakhs, 2.5 lakh, 50k)
    extracted_budget = None
    budget_lakh_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:lakh|lac|l)\b', clean_text)
    if budget_lakh_match:
        extracted_budget = int(float(budget_lakh_match.group(1)) * 100000)
    else:
        budget_num_match = re.search(r'(?:under|below|budget|max|within)\s*(?:rs\.?|₹)?\s*(\d+000)\b', clean_text)
        if budget_num_match:
            extracted_budget = int(budget_num_match.group(1))

    # 4. Check for pure symptoms vs procedure FIRST
    detected_symptoms = []
    for s_name, syns in SYMPTOM_KEYWORDS.items():
        for syn in syns:
            if syn in clean_text:
                detected_symptoms.append(syn)
                break

    # 5. Extract Treatment / Procedure
    matched_treatment = normalize_treatment_query(clean_text)

    # Determine intent & triage
    detected_intent = "general"
    clarification = None
    triage_guidance = None
    is_symptom = False

    if detected_symptoms:
        is_symptom = True
        detected_intent = "symptom_triage"
        
        # Clinical safety boundary: symptom is NOT a diagnosis
        triage_guidance = (
            f"You reported: '{', '.join(detected_symptoms)}'. "
            "Please note: CareSaathi AI is an informational cost directory, NOT a medical diagnosis system. "
            "Symptoms must be clinically evaluated by a qualified doctor. "
            "We have mapped this to standard outpatient physician consultation and relevant indicative diagnostic tests."
        )
        
        if any("fever" in s for s in detected_symptoms):
            matched_treatment = TREATMENT_CATALOGUE["inpatient_fever_management"]
            clarification = "For a fever lasting 5 days, a clinical consultation with complete blood count (CBC/Dengue screen) is standard practice. Would you like to review OPD consultation & fever management costs?"
        elif any("knee" in s or "joint" in s for s in detected_symptoms):
            matched_treatment = TREATMENT_CATALOGUE["mri_knee"]
            clarification = "For persistent knee pain, orthopedic specialists typically recommend digital X-ray or MRI knee joint. Would you like to see MRI and consultation cost ranges?"
        else:
            matched_treatment = TREATMENT_CATALOGUE["doctor_consultation"]
            clarification = "Would you like to search for General Physician OPD consultations and nearby multi-specialty hospitals?"
            
        suggested_action = "confirm_symptom_care"

    elif matched_treatment:
        if "cost" in clean_text or "how much" in clean_text or "price" in clean_text or "estimate" in clean_text or "rate" in clean_text:
            detected_intent = "cost_estimate"
        elif "hospital" in clean_text or "find" in clean_text or "where" in clean_text or "near" in clean_text:
            detected_intent = "hospital_discovery"
        elif "scheme" in clean_text or "insurance" in clean_text or "pmjay" in clean_text or "aarogyasri" in clean_text:
            detected_intent = "scheme_navigator"
        else:
            detected_intent = "cost_estimate"
            
        suggested_action = "run_search"

    else:
        # Ambiguous query
        detected_intent = "general"
        clarification = "We could not find an exact procedure match. Are you looking for a surgical procedure (e.g. Knee Replacement, Cataract), a diagnostic test (MRI, CT Scan), or hospital admission?"
        suggested_action = "show_catalogue"

    return NLPParseResponse(
        raw_query=text,
        detected_intent=detected_intent,
        extracted_treatment=matched_treatment.name if matched_treatment else None,
        matched_treatment_id=matched_treatment.id if matched_treatment else None,
        extracted_location=extracted_loc or current_location or None,
        extracted_budget=extracted_budget,
        extracted_hospital_preference=None,
        detected_symptoms=detected_symptoms,
        is_symptom_not_diagnosis=is_symptom,
        emergency_detected=emergency_detected,
        triage_guidance=triage_guidance,
        clarification_question=clarification,
        suggested_action=suggested_action
    )
