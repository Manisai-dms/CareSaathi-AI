from typing import List, Optional, Dict, Any
from ..models.schemas import SchemeMatchRequest, SchemeMatchResult, Scheme, Treatment
from ..data.database import get_all_schemes, get_facility_by_id
from ..data.catalogue import normalize_treatment_query, TREATMENT_CATALOGUE
from ..config import validate_official_portal_url

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

    req_state_clean = (req.state or "Telangana").strip().lower()

    for scheme in all_schemes:
        status = "More information required"
        color = "amber"
        group = "needs_more_info"
        reasons: List[str] = []
        cautions: List[str] = []
        why_matches: List[str] = []
        missing_criteria: List[str] = []
        pkg_estimate: Optional[str] = None
        empanel_status: Optional[str] = None
        coverage_assessment: Optional[str] = None
        estimated_out_of_pocket: Optional[str] = None
        can_combine_note: Optional[str] = None
        state_match: bool = True

        is_empanelled = False
        if selected_facility:
            is_empanelled = scheme.id in [s.lower() for s in selected_facility.empanelled_schemes]
            if is_empanelled:
                empanel_status = f"Verified: {selected_facility.name} is empanelled under {scheme.name}"
            else:
                empanel_status = f"Notice: {selected_facility.name} is NOT currently listed as an empanelled provider for {scheme.name}."
                cautions.append("Cashless benefit requires admission at an officially empanelled network hospital.")

        # Helper to compute coverage assessment against selected procedure
        def compute_procedure_coverage(ceiling_amount: Optional[int], is_cashless: bool) -> tuple[Optional[str], Optional[str]]:
            if not treatment or treatment.indicative_min is None or treatment.indicative_max is None:
                return None, None
            
            t_min = treatment.indicative_min
            t_max = treatment.indicative_max

            if ceiling_amount is None:
                # Statutory uncapped tariff (e.g. CGHS/ESIC)
                cov = f"Covers your estimated cost: Fully (Statutory package tariff | Estimated cost: ₹{t_min:,} - ₹{t_max:,})"
                oop = "Estimated out-of-pocket with this scheme: ₹0 at empanelled hospital upon referral"
                return cov, oop

            if ceiling_amount >= t_max:
                cov = f"Covers your estimated cost: Fully (Scheme ceiling: ₹{ceiling_amount:,} | Estimated cost: ₹{t_min:,} - ₹{t_max:,})"
                if is_cashless:
                    oop = "Estimated out-of-pocket with this scheme: ₹0 (100% cashless package at empanelled hospital)"
                else:
                    oop = None
            elif ceiling_amount >= t_min:
                diff = t_max - ceiling_amount
                cov = f"Covers your estimated cost: Partly (Scheme ceiling: ₹{ceiling_amount:,} | Estimated cost: ₹{t_min:,} - ₹{t_max:,})"
                oop = f"Estimated out-of-pocket with this scheme: ₹0 up to ₹{diff:,} (if procedure reaches upper estimate)"
            else:
                diff = t_min - ceiling_amount
                cov = f"Covers your estimated cost: Not covered (Estimated min cost ₹{t_min:,} exceeds scheme ceiling of ₹{ceiling_amount:,})"
                oop = f"Estimated out-of-pocket with this scheme: Minimum ₹{diff:,} patient share"
            return cov, oop

        # -------------------------------------------------------------
        # 1. EVALUATE TELANGANA RAJIV AAROGYASRI
        # -------------------------------------------------------------
        if scheme.id == "aarogyasri":
            is_telangana = req_state_clean in ["telangana", "ts", "hyderabad"]
            state_match = is_telangana
            is_white_card = bool(req.ration_card_type and "white" in req.ration_card_type.lower())
            is_aay_card = bool(req.ration_card_type and "antyodaya" in req.ration_card_type.lower())
            is_bpl_card = is_white_card or is_aay_card
            low_income = (req.annual_income is not None and req.annual_income <= 2.5)

            if not is_telangana:
                status = "Appears not to match the available criteria"
                color = "red"
                group = "does_not_match"
                reasons.append("Restricted to permanent residents of Telangana holding a State Food Security Card.")
            elif is_bpl_card or low_income:
                if treatment and treatment.package_code_aarogyasri:
                    status = "Likely eligible for you"
                    color = "green"
                    group = "likely_eligible"
                    why_matches.append("Telangana resident with verified BPL / Food Security Card profile")
                    why_matches.append(f"Income within the stated ceiling (≤ ₹2.5 Lakhs/year)")
                    why_matches.append(f"Procedure is pre-listed under Aarogyasri Trust Code: {treatment.package_code_aarogyasri}")
                    reasons.extend(why_matches)
                    pkg_estimate = "100% Cashless up to ₹10,00,000 ceiling per family per year."
                    reasons.append("Covered across pre-op investigations, surgery, bed charges, medicines, and 10 days post-discharge.")
                    cov, oop = compute_procedure_coverage(1000000, True)
                    coverage_assessment = cov
                    estimated_out_of_pocket = oop
                    can_combine_note = (
                        "Can I combine these? In Telangana, PM-JAY and Aarogyasri operate under an integrated convergence model "
                        "(Ayushman Bharat - Rajiv Aarogyasri). White Card holders receive up to ₹10 Lakhs cashless coverage per family per year "
                        "with Aarogyasri acting as the primary state payer (Source: TS Aarogyasri Health Care Trust & NHA)."
                    )
                elif treatment and not treatment.package_code_aarogyasri:
                    status = "Needs more information"
                    color = "amber"
                    group = "needs_more_info"
                    why_matches.append("Telangana resident with eligible Food Security Card profile")
                    missing_criteria.append(f"Verify whether {treatment.name} has a pre-authorization code in the secondary surgical package list at the hospital Aarogyasri desk.")
                    reasons.extend(why_matches)
                    reasons.append(f"Beneficiary profile matches, but {treatment.name} is not confirmed in the pre-listed surgical package catalogue.")
                    cov, _ = compute_procedure_coverage(1000000, True)
                    coverage_assessment = cov
                else:
                    status = "Needs more information"
                    color = "blue"
                    group = "needs_more_info"
                    why_matches.append("Telangana resident with Food Security Card profile")
                    missing_criteria.append("Select a specific surgical or inpatient procedure to verify package coverage.")
                    reasons.extend(why_matches)
            elif req.ration_card_type and "pink" in req.ration_card_type.lower():
                status = "Appears not to match the available criteria"
                color = "red"
                group = "does_not_match"
                reasons.append("Pink Ration Card indicates Above Poverty Line (APL) non-eligible category under Telangana Aarogyasri rules.")
            else:
                status = "Needs more information"
                color = "blue"
                group = "needs_more_info"
                missing_criteria.append("Confirm active Food Security Card (White Ration Card) number in Telangana")
                missing_criteria.append("Verify annual household income is below ₹2.0 - ₹2.5 Lakhs")
                reasons.append("Eligibility in Telangana requires an active Food Security Card (White Ration Card) or verified annual household income below ₹2.5 Lakhs.")

        # -------------------------------------------------------------
        # 2. EVALUATE AYUSHMAN BHARAT (PM-JAY)
        # -------------------------------------------------------------
        elif scheme.id == "pm_jay":
            state_match = True  # Pan-India national scheme
            low_income = (req.annual_income is not None and req.annual_income <= 2.5)
            is_bpl = bool(req.ration_card_type and any(k in req.ration_card_type.lower() for k in ["white", "bpl", "antyodaya"]))

            if is_bpl or low_income:
                if treatment and treatment.package_code_pmjay:
                    status = "Likely eligible for you"
                    color = "green"
                    group = "likely_eligible"
                    why_matches.append("Household profile matches national SECC 2011 / BPL deprivation criteria")
                    why_matches.append(f"Annual household income within ₹2.5 Lakhs socioeconomic benchmark")
                    why_matches.append(f"Treatment active under NHA Health Benefit Package code: {treatment.package_code_pmjay}")
                    reasons.extend(why_matches)
                    pkg_estimate = f"Cashless coverage up to ₹5,00,000 per family/year under NHA package {treatment.package_code_pmjay}."
                    cov, oop = compute_procedure_coverage(500000, True)
                    coverage_assessment = cov
                    estimated_out_of_pocket = oop
                    can_combine_note = (
                        "Can I combine these? PM-JAY provides national portability (up to ₹5L across India). In Telangana, "
                        "it integrates seamlessly with Aarogyasri for an enhanced ₹10 Lakhs ceiling (Source: National Health Authority)."
                    )
                else:
                    status = "Needs more information"
                    color = "amber"
                    group = "needs_more_info"
                    why_matches.append("Household profile likely eligible based on socioeconomic criteria")
                    missing_criteria.append("Verify procedure authorization under PM-JAY Health Benefit Package master (HBP 2.2)")
                    reasons.extend(why_matches)
                    cov, oop = compute_procedure_coverage(500000, True)
                    coverage_assessment = cov
            else:
                status = "Needs more information"
                color = "blue"
                group = "needs_more_info"
                missing_criteria.append("Check active Ayushman Golden Card status on beneficiary.nha.gov.in using Aadhaar")
                missing_criteria.append("Confirm if any family member is 70+ years old (eligible for universal ₹5L top-up regardless of income)")
                reasons.append("PM-JAY eligibility is pre-determined by SECC 2011 deprivation criteria or Ayushman Golden Card generation.")
                reasons.append("Universal ₹5 Lakh top-up is active for senior citizens aged 70+ regardless of family income.")

        # -------------------------------------------------------------
        # 3. EVALUATE CGHS
        # -------------------------------------------------------------
        elif scheme.id == "cghs":
            state_match = True
            if req.is_central_govt_employee:
                status = "Likely eligible for you"
                color = "green"
                group = "likely_eligible"
                why_matches.append("Central Government Serving Employee or Pensioner beneficiary")
                why_matches.append("Plastic CGHS card holder eligible for empanelled private hospital referral")
                reasons.extend(why_matches)
                pkg_estimate = "Covered at government-approved CGHS fixed tariff schedule."
                cov, oop = compute_procedure_coverage(None, True)
                coverage_assessment = cov
                estimated_out_of_pocket = oop
            else:
                status = "Appears not to match the available criteria"
                color = "red"
                group = "does_not_match"
                reasons.append("CGHS is strictly limited to Central Government employees, pensioners, and eligible dependents.")

        # -------------------------------------------------------------
        # 4. EVALUATE ESIC
        # -------------------------------------------------------------
        elif scheme.id == "esic":
            state_match = True
            if req.is_formal_sector_employed:
                status = "Likely eligible for you"
                color = "green"
                group = "likely_eligible"
                why_matches.append("Organized formal sector worker covered under ESI Act, 1948")
                why_matches.append("Eligible for cashless secondary & super-specialty medical care")
                reasons.extend(why_matches)
                pkg_estimate = "100% Comprehensive medical care in ESI Hospitals or tie-up super-specialty institutions."
                cov, oop = compute_procedure_coverage(None, True)
                coverage_assessment = cov
                estimated_out_of_pocket = oop
            else:
                status = "Needs more information"
                color = "blue"
                group = "needs_more_info"
                missing_criteria.append("Add your formal sector employment status")
                missing_criteria.append("Confirm if monthly gross wage is ≤ ₹21,000 (with monthly ESI contribution deduction)")
                reasons.append("Requires employee formal sector registration (Pehchan card) and monthly ESI contribution deduction.")

        # -------------------------------------------------------------
        # 5. EVALUATE PM JAN AUSHADHI (PMBJP)
        # -------------------------------------------------------------
        elif scheme.id == "pmbjp":
            state_match = True
            status = "Likely eligible for you"
            color = "green"
            group = "likely_eligible"
            why_matches.append("Universal access: 100% accessible to any citizen with a doctor's prescription")
            why_matches.append("Provides 50% to 90% savings on generic medicines, surgical consumables, and post-op care")
            reasons.extend(why_matches)
            pkg_estimate = "50% - 90% discount on branded medicine costs."
            coverage_assessment = "Covers post-procedure medicines & consumables at 50% - 90% generic subsidy (Hospital inpatient admission not covered)"
            # Out-of-pocket is left None as it cannot be computed from surgical admission data

        # -------------------------------------------------------------
        # 6. EVALUATE MAHARASHTRA MJPJAY
        # -------------------------------------------------------------
        elif scheme.id == "mjpjay":
            is_mh = req_state_clean in ["maharashtra", "mh", "mumbai", "pune", "nagpur", "ahmednagar", "nashik"]
            state_match = is_mh
            has_ration_card = bool(req.ration_card_type and any(k in req.ration_card_type.lower() for k in ["yellow", "orange", "white", "antyodaya", "food security", "bpl", "apl"]))
            low_income = (req.annual_income is None or req.annual_income <= 5.0)

            if not is_mh:
                status = "Appears not to match the available criteria"
                color = "red"
                group = "does_not_match"
                reasons.append("MJPJAY is restricted to residents and ration card holders in Maharashtra State.")
            elif has_ration_card or low_income:
                status = "Likely eligible for you"
                color = "green"
                group = "likely_eligible"
                why_matches.append("Maharashtra resident holding valid Ration Card (Yellow, Orange, or White Card)")
                why_matches.append("Covers 1,356 medical & surgical procedures across empanelled hospitals")
                reasons.extend(why_matches)
                pkg_estimate = "100% Cashless coverage up to ₹5,00,000 per family per year."
                cov, oop = compute_procedure_coverage(500000, True)
                coverage_assessment = cov
                estimated_out_of_pocket = oop
            else:
                status = "Needs more information"
                color = "blue"
                group = "needs_more_info"
                missing_criteria.append("Confirm valid Maharashtra Ration Card (Yellow / Orange / White)")
                missing_criteria.append("Provide Aadhaar card linked to Maharashtra household")
                reasons.append("Requires valid Maharashtra Ration Card (Yellow / Orange / White) and Aadhaar identification.")

        # -------------------------------------------------------------
        # 7. EVALUATE AYUSHMAN BHARAT - AROGYA KARNATAKA (AB-ArK)
        # -------------------------------------------------------------
        elif scheme.id == "arogya_karnataka":
            is_ka = req_state_clean in ["karnataka", "ka", "bengaluru", "bangalore", "mysuru", "mangalore"]
            state_match = is_ka
            is_bpl = bool(req.ration_card_type and any(k in req.ration_card_type.lower() for k in ["white", "bpl", "antyodaya", "priority"]))
            low_income = (req.annual_income is not None and req.annual_income <= 2.5)

            if not is_ka:
                status = "Appears not to match the available criteria"
                color = "red"
                group = "does_not_match"
                reasons.append("Arogya Karnataka is restricted to permanent residents of Karnataka State.")
            elif is_bpl or low_income:
                status = "Likely eligible for you"
                color = "green"
                group = "likely_eligible"
                why_matches.append("Karnataka Priority Household (BPL) criteria match")
                why_matches.append("Eligible for 100% cashless tertiary care under Suvarna Arogya Suraksha Trust")
                reasons.extend(why_matches)
                pkg_estimate = "100% Cashless up to ₹5,00,000 per family per year."
                cov, oop = compute_procedure_coverage(500000, True)
                coverage_assessment = cov
                estimated_out_of_pocket = oop
            else:
                status = "Likely eligible for you"
                color = "green"
                group = "likely_eligible"
                why_matches.append("Karnataka General Household (APL) criteria: Eligible for 30% government institutional co-financing")
                reasons.extend(why_matches)
                pkg_estimate = "30% Government Subsidy (up to ₹1,50,000/year ceiling)."
                cov, _ = compute_procedure_coverage(150000, False)
                coverage_assessment = cov

        # -------------------------------------------------------------
        # 8. EVALUATE ANDHRA PRADESH DR. YSR AAROGYASRI
        # -------------------------------------------------------------
        elif scheme.id == "ysr_aarogyasri":
            is_ap = req_state_clean in ["andhra pradesh", "ap", "visakhapatnam", "vijayawada", "guntur", "tirupati"]
            state_match = is_ap
            is_bpl = bool(req.ration_card_type and any(k in req.ration_card_type.lower() for k in ["white", "rice", "bpl", "antyodaya"]))
            income_ok = (req.annual_income is None or req.annual_income <= 5.0)

            if not is_ap:
                status = "Appears not to match the available criteria"
                color = "red"
                group = "does_not_match"
                reasons.append("Dr. YSR Aarogyasri is restricted to residents of Andhra Pradesh State.")
            elif is_bpl or income_ok:
                status = "Likely eligible for you"
                color = "green"
                group = "likely_eligible"
                why_matches.append("Andhra Pradesh resident with active Rice Card or annual family income below ₹5 Lakhs")
                why_matches.append("Covers 3,257 secondary and tertiary surgical packages cashless")
                reasons.extend(why_matches)
                pkg_estimate = "100% Cashless up to ₹25,00,000 enhanced ceiling per family per year."
                cov, oop = compute_procedure_coverage(2500000, True)
                coverage_assessment = cov
                estimated_out_of_pocket = oop
            else:
                status = "Needs more information"
                color = "blue"
                group = "needs_more_info"
                missing_criteria.append("Confirm active Andhra Pradesh Rice Card number")
                missing_criteria.append("Verify annual family income certificate is below ₹5.0 Lakhs")
                reasons.append("Eligibility in Andhra Pradesh requires a valid Rice Card or annual family income below ₹5.0 Lakhs.")

        # -------------------------------------------------------------
        # 9. EVALUATE DELHI AROGYA KOSH (DAK)
        # -------------------------------------------------------------
        elif scheme.id == "dak_delhi":
            is_dl = req_state_clean in ["delhi", "new delhi", "nct"]
            state_match = is_dl
            income_ok = (req.annual_income is None or req.annual_income <= 3.0)

            if not is_dl:
                status = "Appears not to match the available criteria"
                color = "red"
                group = "does_not_match"
                reasons.append("Delhi Arogya Kosh is restricted to bona fide residents of Delhi with a valid Delhi Voter ID Card.")
            elif income_ok:
                status = "Likely eligible for you"
                color = "green"
                group = "likely_eligible"
                why_matches.append("Delhi resident profile with annual household income within ₹3.0 Lakhs limit")
                why_matches.append("Provides cashless high-end diagnostic imaging (MRI, PET, CT) and surgeries upon Delhi Govt hospital referral")
                reasons.extend(why_matches)
                pkg_estimate = "Financial assistance up to ₹5,00,000 for specialized interventions."
                cov, oop = compute_procedure_coverage(500000, True)
                coverage_assessment = cov
                estimated_out_of_pocket = oop
            else:
                status = "Appears not to match the available criteria"
                color = "red"
                group = "does_not_match"
                reasons.append("Income exceeds Delhi Arogya Kosh statutory ceiling of ₹3.0 Lakhs per annum.")

        # -------------------------------------------------------------
        # 10. EVALUATE UTTAR PRADESH MMJAY
        # -------------------------------------------------------------
        elif scheme.id == "mmjay_up":
            is_up = req_state_clean in ["uttar pradesh", "up", "lucknow", "barabanki", "kanpur", "varanasi", "agra"]
            state_match = is_up
            is_bpl = bool(req.ration_card_type and any(k in req.ration_card_type.lower() for k in ["white", "antyodaya", "bpl", "shramik"]))

            if not is_up:
                status = "Appears not to match the available criteria"
                color = "red"
                group = "does_not_match"
                reasons.append("MMJAY is restricted to vulnerable residents of Uttar Pradesh.")
            elif is_bpl or (req.annual_income is not None and req.annual_income <= 2.5):
                status = "Likely eligible for you"
                color = "green"
                group = "likely_eligible"
                why_matches.append("UP Antyodaya card holder or registered BOCW construction worker not covered under SECC PM-JAY")
                reasons.extend(why_matches)
                pkg_estimate = "100% Cashless up to ₹5,00,000 per family per year."
                cov, oop = compute_procedure_coverage(500000, True)
                coverage_assessment = cov
                estimated_out_of_pocket = oop
            else:
                status = "Needs more information"
                color = "blue"
                group = "needs_more_info"
                missing_criteria.append("Confirm Uttar Pradesh Antyodaya Ration Card or BOCW Shramik registration")
                reasons.append("Covers vulnerable families in Uttar Pradesh not registered in national SECC 2011.")

        # -------------------------------------------------------------
        # 11. EVALUATE GUJARAT MUKHYAMANTRI AMRUTUM
        # -------------------------------------------------------------
        elif scheme.id == "mukhyamantri_amrutum":
            is_gj = req_state_clean in ["gujarat", "gj", "ahmedabad", "surat", "vadodara"]
            state_match = is_gj
            income_ok = (req.annual_income is None or req.annual_income <= 4.0)

            if not is_gj:
                status = "Appears not to match the available criteria"
                color = "red"
                group = "does_not_match"
                reasons.append("Mukhyamantri Amrutum is restricted to Gujarat residents.")
            elif income_ok:
                status = "Likely eligible for you"
                color = "green"
                group = "likely_eligible"
                why_matches.append("Gujarat resident with annual family income up to ₹4 Lakhs (MA Vatsalya)")
                reasons.extend(why_matches)
                pkg_estimate = "Cashless up to ₹5,00,000 per family/year."
                cov, oop = compute_procedure_coverage(500000, True)
                coverage_assessment = cov
                estimated_out_of_pocket = oop
            else:
                status = "Appears not to match the available criteria"
                color = "red"
                group = "does_not_match"
                reasons.append("Income exceeds Gujarat MA Vatsalya ceiling of ₹4 Lakhs/year.")

        # -------------------------------------------------------------
        # 12. EVALUATE WEST BENGAL SWASTHYA SATHI
        # -------------------------------------------------------------
        elif scheme.id == "swasthya_sathi":
            is_wb = req_state_clean in ["west bengal", "wb", "kolkata", "howrah"]
            state_match = is_wb
            if not is_wb:
                status = "Appears not to match the available criteria"
                color = "red"
                group = "does_not_match"
                reasons.append("Swasthya Sathi is restricted to residents of West Bengal.")
            else:
                status = "Likely eligible for you"
                color = "green"
                group = "likely_eligible"
                why_matches.append("Universal coverage: All permanent residents of West Bengal under female head smart card")
                reasons.extend(why_matches)
                pkg_estimate = "100% Cashless up to ₹5,00,000 per family per year."
                cov, oop = compute_procedure_coverage(500000, True)
                coverage_assessment = cov
                estimated_out_of_pocket = oop

        # -------------------------------------------------------------
        # 13. EVALUATE KERALA KASP
        # -------------------------------------------------------------
        elif scheme.id == "kasp_kerala":
            is_kl = req_state_clean in ["kerala", "kl", "kochi", "thiruvananthapuram", "kozhikode"]
            state_match = is_kl
            if not is_kl:
                status = "Appears not to match the available criteria"
                color = "red"
                group = "does_not_match"
                reasons.append("KASP is restricted to residents of Kerala State.")
            else:
                status = "Likely eligible for you"
                color = "green"
                group = "likely_eligible"
                why_matches.append("Kerala resident household enrolled under State Health Agency Kerala")
                reasons.extend(why_matches)
                pkg_estimate = "Cashless up to ₹5,00,000 per family/year."
                cov, oop = compute_procedure_coverage(500000, True)
                coverage_assessment = cov
                estimated_out_of_pocket = oop

        # -------------------------------------------------------------
        # 14. EVALUATE TAMIL NADU CMCHIS
        # -------------------------------------------------------------
        elif scheme.id == "cmchis_tn":
            is_tn = req_state_clean in ["tamil nadu", "tn", "chennai", "coimbatore", "madurai"]
            state_match = is_tn
            income_ok = (req.annual_income is None or req.annual_income <= 1.2)

            if not is_tn:
                status = "Appears not to match the available criteria"
                color = "red"
                group = "does_not_match"
                reasons.append("CMCHIS is restricted to residents of Tamil Nadu.")
            elif income_ok:
                status = "Likely eligible for you"
                color = "green"
                group = "likely_eligible"
                why_matches.append("Tamil Nadu resident with annual family income below ₹1,20,000 (VAO certificate)")
                reasons.extend(why_matches)
                pkg_estimate = "Cashless up to ₹5,00,000 per family/year."
                cov, oop = compute_procedure_coverage(500000, True)
                coverage_assessment = cov
                estimated_out_of_pocket = oop
            else:
                status = "Appears not to match the available criteria"
                color = "red"
                group = "does_not_match"
                reasons.append("Income exceeds Tamil Nadu CMCHIS cutoff of ₹1.2 Lakhs/year.")

        # -------------------------------------------------------------
        # 15. EVALUATE RAJASTHAN CHIRANJEEVI / MAAY
        # -------------------------------------------------------------
        elif scheme.id == "chiranjeevi_raj":
            is_rj = req_state_clean in ["rajasthan", "rj", "jaipur", "jodhpur", "udaipur"]
            state_match = is_rj
            if not is_rj:
                status = "Appears not to match the available criteria"
                color = "red"
                group = "does_not_match"
                reasons.append("Mukhyamantri Ayushman Arogya Yojana is restricted to residents of Rajasthan.")
            else:
                status = "Likely eligible for you"
                color = "green"
                group = "likely_eligible"
                why_matches.append("Rajasthan resident holding Jan Aadhaar card")
                reasons.extend(why_matches)
                pkg_estimate = "Cashless coverage up to ₹25,00,000 per family per year."
                cov, oop = compute_procedure_coverage(2500000, True)
                coverage_assessment = cov
                estimated_out_of_pocket = oop

        cautions.append("Final eligibility is decided by the scheme authority or the hospital's scheme desk.")

        portal_url = scheme.official_portal_url or scheme.official_portal
        is_portal_valid, _ = validate_official_portal_url(portal_url)
        if not is_portal_valid:
            cautions.append("Official portal domain could not be verified against the official government allowlist.")

        results.append(SchemeMatchResult(
            scheme=scheme,
            match_status=status,
            status_color=color,
            matching_reasons=reasons if reasons else ["Criteria evaluation complete"],
            caution_notes=cautions,
            package_reimbursement_estimate=pkg_estimate,
            empanelment_status=empanel_status,
            official_verification_url=portal_url,
            helpline=scheme.helpline,
            group=group,
            missing_criteria=missing_criteria,
            coverage_assessment=coverage_assessment,
            estimated_out_of_pocket=estimated_out_of_pocket,
            can_combine_note=can_combine_note,
            why_matches=why_matches,
            state_match=state_match
        ))

    # Sorting logic:
    # 1. Primary sorting by group:
    #    "likely_eligible" (0) -> "needs_more_info" (1) -> "does_not_match" (2)
    # 2. Inside "likely_eligible", sort by:
    #    (a) whether ceiling covers estimated procedure cost (Fully covers = 0, Partly covers = 1, Other = 2)
    #    (b) cashless availability (is_cashless: True = 0, False = 1)
    #    (c) whether selected hospital is empanelled (empanelled = 0, else 1)
    #    (d) lower expected out-of-pocket (₹0 first)
    def sort_key(item: SchemeMatchResult):
        group_priority = 0 if item.group == "likely_eligible" else (1 if item.group == "needs_more_info" else 2)
        
        # (a) procedure cost coverage
        cov_priority = 2
        if item.coverage_assessment:
            if "Fully" in item.coverage_assessment:
                cov_priority = 0
            elif "Partly" in item.coverage_assessment:
                cov_priority = 1
        
        # (b) cashless availability
        cashless_priority = 0 if item.scheme.is_cashless else 1
        
        # (c) hospital empanelment
        empanel_priority = 1
        if item.empanelment_status and "Verified" in item.empanelment_status:
            empanel_priority = 0

        # (d) out of pocket
        oop_priority = 1
        if item.estimated_out_of_pocket and "₹0" in item.estimated_out_of_pocket:
            oop_priority = 0

        # (e) State match for current state comes before out-of-state
        state_priority = 0 if item.state_match else 1

        return (group_priority, state_priority, cov_priority, cashless_priority, empanel_priority, oop_priority)

    results.sort(key=sort_key)
    return results
