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

        # 2. EVALUATE AYUSHMAN BHARAT (PM-JAY)
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

        # 3. EVALUATE CGHS
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

        # 4. EVALUATE ESIC
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

        # 5. EVALUATE PM JAN AUSHADHI (PMBJP)
        elif scheme.id == "pmbjp":
            status = "Potentially applicable"
            color = "green"
            reasons.append("Universal Scheme: 100% accessible to any citizen with a doctor's prescription.")
            reasons.append("Saves 50% to 90% on post-procedure take-home antibiotics, painkillers, and surgical consumables.")
            pkg_estimate = "50% - 90% discount on branded medicine costs."

        cautions.append("Official verification required: Final admission pre-authorization is governed solely by hospital Aarogyamitra or Insurance TPA desk.")

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

    return results
