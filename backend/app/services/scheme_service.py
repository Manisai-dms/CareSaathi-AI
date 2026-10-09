from typing import List, Optional, Dict, Any
from ..models.schemas import SchemeMatchRequest, SchemeMatchResult, Scheme, Treatment
from ..data.database import get_all_schemes, get_facility_by_id
from ..data.catalogue import normalize_treatment_query, TREATMENT_CATALOGUE

def evaluate_schemes(req: SchemeMatchRequest) -> List[SchemeMatchResult]:
    all_schemes = get_all_schemes()
    results: List[SchemeMatchResult] = []

    # Identify treatment
    treatment: Optional[Treatment] = None
    if req.treatment_id and req.treatment_id in TREATMENT_CATALOGUE:
        treatment = TREATMENT_CATALOGUE[req.treatment_id]
    elif req.treatment_name:
        treatment = normalize_treatment_query(req.treatment_name)

    # Check facility empanelment if selected
    selected_facility = None
    if req.selected_facility_id:
        selected_facility = get_facility_by_id(req.selected_facility_id)

    for scheme in all_schemes:
        status = "More information required"
        color = "amber"
        reasons: List[str] = []
        cautions: List[str] = []
        pkg_estimate = None
        empanel_status = None

        if selected_facility:
            is_empanelled = scheme.id in [s.lower() for s in selected_facility.empanelled_schemes]
            if is_empanelled:
                empanel_status = f"Verified: {selected_facility.name} is empanelled under {scheme.name}"
            else:
                empanel_status = f"Notice: {selected_facility.name} is NOT currently listed as an empanelled provider for {scheme.name}."
                cautions.append("Cashless benefit requires admission at an officially empanelled network hospital.")

        # 1. EVALUATE TELANGANA AAROGYASRI
        if scheme.id == "aarogyasri":
            is_telangana = (req.state.lower() in ["telangana", "ts", "hyderabad"])
            is_white_card = (req.ration_card_type and "white" in req.ration_card_type.lower())
            low_income = (req.annual_income is not None and req.annual_income <= 2.5)

            if not is_telangana:
                status = "Appears not to match the available criteria"
                color = "red"
                reasons.append("Aarogyasri is restricted to permanent residents of Telangana holding a State Food Security Card.")
            elif is_white_card or low_income:
                if treatment and treatment.package_code_aarogyasri:
                    status = "Potentially applicable"
                    color = "green"
                    reasons.append(f"Beneficiary criteria match: Telangana resident with BPL/White Card profile.")
                    reasons.append(f"Treatment is pre-listed under Aarogyasri Trust Code: {treatment.package_code_aarogyasri}.")
                    pkg_estimate = f"100% Cashless up to ₹10,00,000 ceiling per family per year."
                    reasons.append("Covered across pre-op investigations, surgery, bed charges, medicines, and 10 days post-discharge.")
                elif treatment and not treatment.package_code_aarogyasri:
                    status = "Treatment coverage not verified"
                    color = "amber"
                    reasons.append(f"Beneficiary profile matches, but {treatment.name} is not confirmed in the secondary/tertiary surgical package list.")
                else:
                    status = "More information required"
                    color = "blue"
                    reasons.append("Beneficiary criteria match. Please select a specific surgical or inpatient procedure to verify package coverage.")
            elif req.ration_card_type and "pink" in req.ration_card_type.lower():
                status = "Appears not to match the available criteria"
                color = "red"
                reasons.append("Pink Ration Card represents Above Poverty Line (APL) non-eligible category under Aarogyasri rules.")
            else:
                status = "More information required"
                color = "blue"
                reasons.append("Eligibility in Telangana requires an active Food Security Card (White Ration Card) or verified annual household income below ₹2.0 - ₹2.5 Lakhs.")

        # 2. EVALUATE MAHARASHTRA MJPJAY
        elif scheme.id == "mjpjay":
            is_mh = req.state.lower() in ["maharashtra", "mh", "mumbai", "pune", "nagpur", "ahmednagar", "nashik"]
            has_ration_card = req.ration_card_type and any(k in req.ration_card_type.lower() for k in ["yellow", "orange", "white", "antyodaya", "food security", "bpl", "apl"])
            low_income = (req.annual_income is None or req.annual_income <= 5.0)

            if not is_mh:
                status = "Appears not to match the available criteria"
                color = "red"
                reasons.append("MJPJAY is restricted to residents and ration card holders in Maharashtra State.")
            elif has_ration_card or low_income:
                status = "Potentially applicable"
                color = "green"
                reasons.append("Beneficiary criteria match: Maharashtra resident holding valid Ration Card (Yellow, Orange, or White Card).")
                reasons.append("Covers 1,356 medical & surgical procedures across empanelled government and private hospitals.")
                pkg_estimate = "100% Cashless coverage up to ₹5,00,000 per family per year."
            else:
                status = "More information required"
                color = "blue"
                reasons.append("Requires valid Maharashtra Ration Card (Yellow / Orange / White) and Aadhaar identification.")

        # 3. EVALUATE AYUSHMAN BHARAT - AROGYA KARNATAKA (AB-ArK)
        elif scheme.id == "arogya_karnataka":
            is_ka = req.state.lower() in ["karnataka", "ka", "bengaluru", "bangalore", "mysuru", "mangalore"]
            is_bpl = req.ration_card_type and any(k in req.ration_card_type.lower() for k in ["white", "bpl", "antyodaya", "priority"])
            low_income = (req.annual_income is not None and req.annual_income <= 2.5)

            if not is_ka:
                status = "Appears not to match the available criteria"
                color = "red"
                reasons.append("Arogya Karnataka is restricted to permanent residents of Karnataka State.")
            elif is_bpl or low_income:
                status = "Potentially applicable"
                color = "green"
                reasons.append("Priority Household (BPL) criteria match: Eligible for 100% cashless tertiary care under Suvarna Arogya Suraksha Trust.")
                pkg_estimate = "100% Cashless up to ₹5,00,000 per family per year."
            else:
                status = "Potentially applicable (Co-pay tier)"
                color = "green"
                reasons.append("General Household (APL) criteria: Eligible for 30% government institutional co-financing package.")
                pkg_estimate = "30% Government Subsidy (up to ₹1,50,000/year ceiling)."

        # 4. EVALUATE ANDHRA PRADESH DR. YSR AAROGYASRI
        elif scheme.id == "ysr_aarogyasri":
            is_ap = req.state.lower() in ["andhra pradesh", "ap", "visakhapatnam", "vijayawada", "guntur", "tirupati"]
            is_bpl = req.ration_card_type and any(k in req.ration_card_type.lower() for k in ["white", "rice", "bpl", "antyodaya"])
            income_ok = (req.annual_income is None or req.annual_income <= 5.0)

            if not is_ap:
                status = "Appears not to match the available criteria"
                color = "red"
                reasons.append("Dr. YSR Aarogyasri is restricted to residents of Andhra Pradesh State.")
            elif is_bpl or income_ok:
                status = "Potentially applicable"
                color = "green"
                reasons.append("Beneficiary criteria match: Andhra Pradesh resident with active Rice Card or annual income below ₹5 Lakhs.")
                reasons.append("Covers 3,257 secondary and tertiary surgical packages.")
                pkg_estimate = "100% Cashless up to ₹25,00,000 enhanced ceiling per family per year."
            else:
                status = "More information required"
                color = "blue"
                reasons.append("Eligibility in Andhra Pradesh requires a valid Rice Card or annual family income below ₹5.0 Lakhs.")

        # 5. EVALUATE DELHI AROGYA KOSH (DAK)
        elif scheme.id == "dak_delhi":
            is_dl = req.state.lower() in ["delhi", "new delhi", "nct"]
            income_ok = (req.annual_income is None or req.annual_income <= 3.0)

            if not is_dl:
                status = "Appears not to match the available criteria"
                color = "red"
                reasons.append("Delhi Arogya Kosh is restricted to bona fide residents of Delhi with a valid Delhi Voter ID Card.")
            elif income_ok:
                status = "Potentially applicable"
                color = "green"
                reasons.append("Delhi resident criteria match: Annual household income within ₹3.0 Lakhs limit.")
                reasons.append("Cashless high-end diagnostic imaging (MRI, PET, CT) and surgeries at empanelled private centers upon Delhi Govt hospital referral.")
                pkg_estimate = "Financial assistance up to ₹5,00,000 for specialized interventions."
            else:
                status = "Appears not to match the available criteria"
                color = "red"
                reasons.append("Income exceeds Delhi Arogya Kosh ceiling of ₹3.0 Lakhs per annum.")

        # 6. EVALUATE UTTAR PRADESH MMJAY
        elif scheme.id == "mmjay_up":
            is_up = req.state.lower() in ["uttar pradesh", "up", "lucknow", "barabanki", "kanpur", "varanasi", "agra"]
            is_bpl = req.ration_card_type and any(k in req.ration_card_type.lower() for k in ["white", "antyodaya", "bpl", "shramik"])

            if not is_up:
                status = "Appears not to match the available criteria"
                color = "red"
                reasons.append("MMJAY is restricted to vulnerable residents of Uttar Pradesh.")
            elif is_bpl or (req.annual_income is not None and req.annual_income <= 2.5):
                status = "Potentially applicable"
                color = "green"
                reasons.append("Beneficiary criteria match: UP Antyodaya card holder or registered BOCW construction worker not covered under SECC PM-JAY.")
                pkg_estimate = "100% Cashless up to ₹5,00,000 per family per year."
            else:
                status = "More information required"
                color = "blue"
                reasons.append("Covers vulnerable families in Uttar Pradesh not registered in national SECC 2011.")

        # 7. EVALUATE OTHER STATE SCHEMES (Gujarat, West Bengal, Kerala, Tamil Nadu, Rajasthan)
        elif scheme.id == "mukhyamantri_amrutum":
            is_gj = req.state.lower() in ["gujarat", "gj", "ahmedabad", "surat", "vadodara"]
            if not is_gj:
                status = "Appears not to match the available criteria"
                color = "red"
                reasons.append("Mukhyamantri Amrutum is restricted to Gujarat residents.")
            elif req.annual_income is None or req.annual_income <= 4.0:
                status = "Potentially applicable"
                color = "green"
                reasons.append("Eligible: Gujarat resident with annual family income up to ₹4 Lakhs (MA Vatsalya).")
                pkg_estimate = "Cashless up to ₹5,00,000 per family/year."
            else:
                status = "Appears not to match"
                color = "red"
                reasons.append("Income exceeds Gujarat MA ceiling of ₹4 Lakhs/year.")

        elif scheme.id == "swasthya_sathi":
            is_wb = req.state.lower() in ["west bengal", "wb", "kolkata", "howrah"]
            if not is_wb:
                status = "Appears not to match the available criteria"
                color = "red"
                reasons.append("Swasthya Sathi is restricted to residents of West Bengal.")
            else:
                status = "Potentially applicable"
                color = "green"
                reasons.append("Universal scheme: Covers all permanent residents of West Bengal under female head smart card.")
                pkg_estimate = "100% Cashless up to ₹5,00,000 per family per year."

        elif scheme.id == "kasp_kerala":
            is_kl = req.state.lower() in ["kerala", "kl", "kochi", "thiruvananthapuram", "kozhikode"]
            if not is_kl:
                status = "Appears not to match the available criteria"
                color = "red"
                reasons.append("KASP is restricted to residents of Kerala State.")
            else:
                status = "Potentially applicable"
                color = "green"
                reasons.append("Beneficiary criteria match: Deprived/BPL household enrolled under State Health Agency Kerala.")
                pkg_estimate = "Cashless up to ₹5,00,000 per family/year."

        elif scheme.id == "cmchis_tn":
            is_tn = req.state.lower() in ["tamil nadu", "tn", "chennai", "coimbatore", "madurai"]
            if not is_tn:
                status = "Appears not to match the available criteria"
                color = "red"
                reasons.append("CMCHIS is restricted to residents of Tamil Nadu.")
            elif req.annual_income is None or req.annual_income <= 1.2:
                status = "Potentially applicable"
                color = "green"
                reasons.append("Eligible: Tamil Nadu resident with annual family income below ₹1,20,000.")
                pkg_estimate = "Cashless up to ₹5,00,000 per family/year."
            else:
                status = "Appears not to match"
                color = "red"
                reasons.append("Income exceeds Tamil Nadu CMCHIS cutoff of ₹1.2 Lakhs/year.")

        elif scheme.id == "chiranjeevi_raj":
            is_rj = req.state.lower() in ["rajasthan", "rj", "jaipur", "jodhpur", "udaipur"]
            if not is_rj:
                status = "Appears not to match the available criteria"
                color = "red"
                reasons.append("Mukhyamantri Ayushman Arogya Yojana is restricted to residents of Rajasthan.")
            else:
                status = "Potentially applicable"
                color = "green"
                reasons.append("Eligible: Rajasthan resident holding Jan Aadhaar card.")
                pkg_estimate = "Cashless coverage up to ₹25,00,000 per family per year."

        # 8. EVALUATE AYUSHMAN BHARAT (PM-JAY)
        elif scheme.id == "pm_jay":
            low_income = (req.annual_income is not None and req.annual_income <= 2.5)
            is_bpl = (req.ration_card_type and any(k in req.ration_card_type.lower() for k in ["white", "bpl", "antyodaya"]))

            if treatment and treatment.package_code_pmjay:
                pkg_estimate = f"Cashless coverage up to ₹5,00,000 per family/year under NHA package {treatment.package_code_pmjay}."

            if is_bpl or low_income:
                if treatment and treatment.package_code_pmjay:
                    status = "Potentially applicable"
                    color = "green"
                    reasons.append("Family profile matches national SECC / BPL socioeconomic criteria.")
                    reasons.append(f"Treatment package code ({treatment.package_code_pmjay}) is active in Health Benefit Package (HBP) master.")
                else:
                    status = "More information required"
                    color = "blue"
                    reasons.append("Household profile likely eligible. Verify specific procedure authorization on the PM-JAY portal.")
            else:
                status = "Official verification required"
                color = "blue"
                reasons.append("PM-JAY eligibility is pre-determined by SECC 2011 deprivation criteria and Ayushman Golden Card generation.")
                reasons.append("Universal ₹5 Lakh top-up is active for senior citizens aged 70+ regardless of family income.")

        # 9. EVALUATE CGHS
        elif scheme.id == "cghs":
            if req.is_central_govt_employee:
                status = "Potentially applicable"
                color = "green"
                reasons.append("Eligible category: Central Government Serving / Pensioner beneficiary with valid CGHS plastic card.")
                reasons.append("Cashless treatment permitted at empanelled private hospitals with official CGHS dispensary referral.")
                pkg_estimate = "Covered at government-approved CGHS fixed tariff schedule."
            else:
                status = "Appears not to match the available criteria"
                color = "red"
                reasons.append("CGHS is strictly limited to Central Government employees, pensioners, and eligible dependents.")

        # 10. EVALUATE ESIC
        elif scheme.id == "esic":
            if req.is_formal_sector_employed:
                status = "Potentially applicable"
                color = "green"
                reasons.append("Applicable for organized sector employees covered under ESI Act (monthly wage up to ₹21,000).")
                pkg_estimate = "100% Comprehensive medical care in ESI Hospitals or tie-up super-specialty institutions."
            else:
                status = "More information required"
                color = "blue"
                reasons.append("Requires employee formal sector registration and monthly ESI contribution deduction.")

        # 11. EVALUATE PM JAN AUSHADHI (PMBJP)
        elif scheme.id == "pmbjp":
            status = "Potentially applicable"
            color = "green"
            reasons.append("Universal Scheme: 100% accessible to any citizen with a doctor's prescription.")
            reasons.append("Saves 50% to 90% on post-procedure take-home antibiotics, painkillers, and surgical consumables.")
            pkg_estimate = "50% - 90% discount on branded medicine costs."

        cautions.append("Official verification required: Final admission pre-authorization is governed solely by hospital Aarogyamitra / Ayushman Mitra or Insurance TPA desk.")

        results.append(SchemeMatchResult(
            scheme=scheme,
            match_status=status,
            status_color=color,
            matching_reasons=reasons,
            caution_notes=cautions,
            package_reimbursement_estimate=pkg_estimate,
            empanelment_status=empanel_status,
            official_verification_url=scheme.official_portal,
            helpline=scheme.helpline
        ))

    # Prioritize potentially applicable and national schemes first
    results.sort(key=lambda x: (
        0 if x.status_color == "green" else (1 if x.status_color == "blue" else (2 if x.status_color == "amber" else 3))
    ))

    return results
