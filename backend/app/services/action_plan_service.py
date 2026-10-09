# CareSaathi AI: Patient Action Plan Service
# Generates evidence-based, structured Patient Action Plans with cost estimates,
# verified facilities, scheme eligibility routes, billing questions, and printable checklists.

from typing import Dict, Any, List, Optional
from ..data.catalogue import TREATMENT_CATALOGUE, normalize_treatment_query
from ..data.database import is_database_available
from .facility_service import search_facilities
from ..models.schemas import PatientActionPlanRequest, PatientActionPlanResponse

def generate_patient_action_plan(req: PatientActionPlanRequest) -> PatientActionPlanResponse:
    """
    Constructs an evidence-backed, transparent Patient Action Plan tailored to the user's
    stated concern, location, preferences, and clinical requirements.
    """
    concern = req.user_concern.strip()
    target_city = req.city or "Hyderabad"
    user_lang = (req.language or "en")[:2]
    db_available = is_database_available()

    # Identify treatment if available
    treatment = None
    if req.treatment_id and req.treatment_id in TREATMENT_CATALOGUE:
        treatment = TREATMENT_CATALOGUE[req.treatment_id]
    else:
        treatment = normalize_treatment_query(concern)
        if not treatment and req.treatment_id:
            treatment = TREATMENT_CATALOGUE.get(req.treatment_id)

    # Fallback to general consultation if no specific surgical procedure matched
    treatment_name = treatment.name if treatment else "General Healthcare Consultation & Diagnostics"
    indicative_min = treatment.indicative_min if treatment else 500
    indicative_max = treatment.indicative_max if treatment else 2500

    # 1. Confirmed Details
    confirmed_details = {
        "stated_concern": concern,
        "matched_procedure": treatment_name,
        "target_city": target_city,
        "ownership_preference": req.ownership_preference or "Any (Govt & Private)",
        "language": user_lang,
        "user_budget": f"₹{req.user_budget:,}" if req.user_budget else "Not specified"
    }

    # 2. Cost Estimate & Limitations
    statutory_notes = []
    if treatment:
        if treatment.id == "knee_replacement":
            statutory_notes.append("Knee implant prices are legally capped under NPPA Order S.O. 2668(E) (₹54,000–₹74,000).")
        elif treatment.id == "angioplasty":
            statutory_notes.append("Coronary DES stents are price-capped under NPPA statutory notification (ceiling ₹30,000–₹34,000).")
        elif treatment.id == "cataract_surgery":
            statutory_notes.append("Standard Foldable Monofocal IOL procedures are performed cashless (₹0) in government eye hospitals.")

    cost_summary = {
        "procedure_name": treatment_name,
        "government_cost": "₹0 (100% Cashless under PM-JAY / Aarogyasri for eligible cardholders)",
        "private_indicative_min": indicative_min,
        "private_indicative_max": indicative_max,
        "private_range_display": f"₹{indicative_min:,} - ₹{indicative_max:,}",
        "statutory_price_caps": statutory_notes or ["Regulated under state healthcare tariff norms and clinical establishment acts."]
    }

    limitations = [
        "Final inpatient costs depend heavily on room tier selected (General Ward vs Semi-Private vs Deluxe room).",
        "Pre-operative investigations, high-dependency ICU stays, and post-discharge medicines may be billed outside package rates.",
        "Live bed availability, surgeon honorarium, and operating slot confirmations must be verified directly with the hospital.",
        "Statutory estimates reflect standard clinical pathways without major comorbidities."
    ]

    # 3. Verified Hospitals Matching
    facilities = search_facilities(
        query_city=target_city,
        ownership_filter=req.ownership_preference,
        treatment_id=treatment.id if treatment else None
    )[:3] if db_available else []

    verified_hospitals = [{
        "id": f.id,
        "name": f.name,
        "ownership": f.ownership,
        "locality": f.locality,
        "city": f.city,
        "phone": f.phone or "+91 40 2345 6789",
        "pricing_status": f.pricing_status or ("Free / Cashless" if f.ownership == "Government" else "Standard Tariff"),
        "distance_km": f.distance_km,
        "recommendation_reason": f.recommendation_reason or f"Verified {f.ownership} facility in {target_city}."
    } for f in facilities]

    # 4. Official Lookup Routes
    official_routes = [
        {"name": "National Health Authority PM-JAY", "url": "https://pmjay.gov.in", "purpose": "Check Ayushman Bharat Card & Hospital Empanelment"},
        {"name": "Telangana Aarogyasri Health Care Trust", "url": "https://aarogyasri.telangana.gov.in", "purpose": "State Cashless Package & Aarogyamitra Network"},
        {"name": "NPPA Pharma Sahi Daam", "url": "https://nppaipdms.gov.in", "purpose": "Statutory Medicine Ceiling Prices & Fair Drug Tariffs"},
        {"name": "Pradhan Mantri Jan Aushadhi (PMBJP)", "url": "https://janaushadhi.gov.in", "purpose": "Locate 50-80% Discounted Quality Generic Drug Stores"},
        {"name": "National Health Helpline 104", "url": "tel:104", "purpose": "Official 24/7 Medical Advice & Public Health Centre Referral"},
        {"name": "National Emergency Ambulance 108", "url": "tel:108", "purpose": "Immediate Emergency Triage & Casualty Hospital Transport"}
    ]

    # 5. Applicable Schemes
    applicable_schemes = [
        {
            "name": "Telangana Aarogyasri Scheme",
            "coverage_limit": "Up to ₹10 Lakhs per family per year",
            "eligibility_rule": "White Ration Card (Food Security Card) holders or annual income under ₹2.5 Lakhs.",
            "empanelled_route": "Available at Aarogyamitra desks located in all registered network hospitals."
        },
        {
            "name": "Ayushman Bharat PM-JAY",
            "coverage_limit": "Up to ₹5 Lakhs per family per year",
            "eligibility_rule": "Families listed in SECC 2011 registry or verified PM-JAY beneficiary cardholders.",
            "empanelled_route": "Empanelled nationwide across public and private hospitals."
        }
    ]

    # 6. Questions to Ask the Hospital Billing Desk
    questions_to_ask = [
        "Is this package all-inclusive, or are surgeon fees, OT charges, and anesthetist fees billed separately?",
        "What exact implant/lens brand and model is being used, and does it adhere to the official NPPA price cap?",
        "Does your hospital support direct cashless admission through Aarogyasri / PM-JAY / my TPA insurance?",
        "What are the daily room rent charges and ICU escalation tariffs if additional observation is required?",
        "Can prescribed discharge medications be purchased from Jan Aushadhi or outside generic pharmacy stores?",
        "What pre-admission diagnostic tests are required, and can previous external reports be accepted?"
    ]

    # 7. Documents to Carry
    documents_to_carry = [
        "Aadhaar Card (Original + Photocopies of Patient and Attendant)",
        "White Ration Card / Food Security Card (mandatory for cashless scheme admissions)",
        "Original Doctor's Prescription Slip and OPD Consultation Notes",
        "Recent Diagnostic Reports (Blood CBC, ECG, X-Ray films, MRI / CT scans)",
        "Health Insurance Policy Card and Valid ID Proof (for private corporate / TPA insurance)",
        "Two recent passport-size photographs of the patient"
    ]

    # 8. Concise Next-Step Checklist
    next_step_checklist = [
        {"step": 1, "task": f"Decide between Government Teaching Hospital (₹0 Cashless) and Private Network Hospital.", "done": False},
        {"step": 2, "task": "Contact the hospital reception or Aarogyamitra counter to verify scheme empanelment.", "done": False},
        {"step": 3, "task": "Organize previous medical records and identity cards into a single physical folder.", "done": False},
        {"step": 4, "task": "Request an itemized written financial estimate prior to planned admission.", "done": False},
        {"step": 5, "task": "Inquire with treating doctor regarding Pradhan Mantri Jan Aushadhi generic alternatives for post-op care.", "done": False}
    ]

    # Format Printable Plain Text
    doc_lines = "\n".join([f"  [ ] {d}" for d in documents_to_carry])
    q_lines = "\n".join([f"  {i}. {q}" for i, q in enumerate(questions_to_ask, 1)])
    hosp_lines = "\n".join([f"  • {h['name']} ({h['ownership']}) - {h['locality']}, {h['city']} | Phone: {h['phone']}" for h in verified_hospitals]) if verified_hospitals else "  • Live hospital directory currently offline. Consult National Health Helpline 104."

    if user_lang == "te":
        title_text = f"కేర్‌సాథీ AI: పేషెంట్ యాక్షన్ ప్లాన్ — {treatment_name}"
        printable_text = (
            f"========================================================================\n"
            f"CareSaathi AI: రోగి కార్యాచరణ ప్రణాళిక (Patient Action Plan)\n"
            f"========================================================================\n\n"
            f"విషయం: {concern}\n"
            f"విధానం: {treatment_name}\n"
            f"నగరం: {target_city}\n\n"
            f"1. ఖర్చు అంచనా వివరాలు (Cost Estimate):\n"
            f"   • ప్రభుత్వ ఆసుపత్రులు: {cost_summary['government_cost']}\n"
            f"   • ప్రైవేట్ ఆసుపత్రుల ప్రామాణిక శ్రేణి: {cost_summary['private_range_display']}\n\n"
            f"2. సిఫార్సు చేయబడిన ఆసుపత్రులు:\n{hosp_lines}\n\n"
            f"3. ఆసుపత్రి బిల్లింగ్ డెస్క్‌ను అడగవలసిన ప్రశ్నలు:\n{q_lines}\n\n"
            f"4. వెంట తీసుకెళ్లాల్సిన పత్రాలు:\n{doc_lines}\n\n"
            f"5. అత్యవసర సహాయం: 108 | ఆరోగ్య సమాచారం: 104\n"
            f"========================================================================\n"
        )
    else:
        title_text = f"CareSaathi AI: Patient Action Plan — {treatment_name}"
        printable_text = (
            f"========================================================================\n"
            f"CareSaathi AI: One-Page Patient Financial & Clinical Action Plan\n"
            f"========================================================================\n\n"
            f"Stated Concern: {concern}\n"
            f"Identified Procedure: {treatment_name}\n"
            f"Location: {target_city}\n\n"
            f"1. COST ESTIMATE & BENCHMARKS:\n"
            f"   • Government Teaching Hospitals: {cost_summary['government_cost']}\n"
            f"   • Private Indicative Reference: {cost_summary['private_range_display']}\n\n"
            f"2. VERIFIED HOSPITALS:\n{hosp_lines}\n\n"
            f"3. PRE-ADMISSION QUESTIONS TO ASK THE HOSPITAL:\n{q_lines}\n\n"
            f"4. MANDATORY DOCUMENTS CHECKLIST:\n{doc_lines}\n\n"
            f"5. OFFICIAL HELPLINES: National Emergency Ambulance: 108 | Health Advice: 104\n"
            f"========================================================================\n"
        )

    return PatientActionPlanResponse(
        title=title_text,
        user_stated_concern=concern,
        confirmed_details=confirmed_details,
        cost_estimate_summary=cost_summary,
        estimate_limitations=limitations,
        verified_hospitals=verified_hospitals,
        official_lookup_routes=official_routes,
        applicable_schemes=applicable_schemes,
        questions_to_ask_hospital=questions_to_ask,
        documents_to_carry=documents_to_carry,
        next_step_checklist=next_step_checklist,
        printable_text=printable_text
    )
