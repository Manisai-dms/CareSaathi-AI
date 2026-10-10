import json
import urllib.request
import sys
import io

if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from backend.app.services.scheme_service import evaluate_schemes
from backend.app.models.schemas import SchemeMatchRequest
from backend.app.config import validate_official_portal_url, ALLOWED_OFFICIAL_DOMAINS
from backend.app.data.database import get_all_schemes

def run_tests():
    print("=================================================================")
    print("TEST SUITE: SCHEMES & COMPARE PAGE VERIFICATION")
    print("=================================================================")

    # 1. Test All Schemes Data Integrity
    schemes = get_all_schemes()
    print(f"\n1. Loaded {len(schemes)} total schemes:")
    portal_urls = set()
    for s in schemes:
        url = s.official_portal_url or s.official_portal
        is_valid, reason = validate_official_portal_url(url)
        assert is_valid, f"Scheme {s.id} failed portal validation: {url} ({reason})"
        assert url.startswith("https://"), f"Scheme {s.id} is not HTTPS: {url}"
        assert s.helpline, f"Scheme {s.id} is missing helpline"
        assert s.authority, f"Scheme {s.id} is missing authority"
        assert s.coverage_limit_inr, f"Scheme {s.id} is missing coverage ceiling"
        assert s.portal_source, f"Scheme {s.id} is missing portal source"
        assert s.portal_verified_at, f"Scheme {s.id} is missing portal verified date"
        
        # Verify URL uniqueness across schemes (no two distinct schemes share generic or wrong URLs)
        assert url not in portal_urls, f"Duplicate portal URL detected: {url} on scheme {s.id}"
        portal_urls.add(url)
        print(f"  [OK] {s.name:<40} -> {url} (Verified: {s.portal_verified_at})")

    # 2. Test Invalid URL rejection
    print("\n2. Testing URL validator rejection on third-party / invalid URLs:")
    invalid_test_urls = [
        "http://pmjay.gov.in",               # Non-HTTPS
        "https://randomblog.com/schemes",    # Blog
        "https://policybazaar.com/health",   # Aggregator
        "ftp://gov.in",                      # Invalid protocol
        "",                                  # Empty
    ]
    for inv in invalid_test_urls:
        valid, reason = validate_official_portal_url(inv)
        assert not valid, f"Should have rejected invalid URL: {inv}"
        print(f"  [OK] Successfully rejected: '{inv}' -> {reason}")

    # 3. Test Evaluation Logic: Case 1 - Default Telangana White Card Holder (Knee Replacement)
    print("\n3. Test Case 1: Telangana resident, White Card, 2.5L income (Knee Replacement):")
    req1 = SchemeMatchRequest(
        treatment_id="knee_replacement",
        state="Telangana",
        annual_income=2.5,
        ration_card_type="White Card (Food Security Card)",
        is_central_govt_employee=False,
        is_formal_sector_employed=False
    )
    res1 = evaluate_schemes(req1)
    
    likely1 = [r for r in res1 if r.group == "likely_eligible"]
    needs_info1 = [r for r in res1 if r.group == "needs_more_info"]
    not_match1 = [r for r in res1 if r.group == "does_not_match"]
    
    print(f"  Counts: Likely Eligible={len(likely1)}, Needs Info={len(needs_info1)}, Not Matching={len(not_match1)}")
    likely_ids = [r.scheme.id for r in likely1]
    assert "aarogyasri" in likely_ids, "Aarogyasri must be likely eligible for Telangana White card holder"
    assert "pm_jay" in likely_ids, "PM-JAY must be likely eligible for BPL/White card holder"
    assert "pmbjp" in likely_ids, "PMBJP universal scheme must be likely eligible"
    
    # Check Aarogyasri details
    aarogyasri_res = next(r for r in res1 if r.scheme.id == "aarogyasri")
    assert aarogyasri_res.why_matches, "Aarogyasri must have why_matches reasons"
    assert "Telangana resident" in aarogyasri_res.why_matches[0]
    assert aarogyasri_res.coverage_assessment and "Fully" in aarogyasri_res.coverage_assessment
    assert aarogyasri_res.estimated_out_of_pocket and "₹0" in aarogyasri_res.estimated_out_of_pocket
    assert aarogyasri_res.can_combine_note, "Aarogyasri must show combination note with PM-JAY"
    print(f"  [OK] Aarogyasri why_matches: {aarogyasri_res.why_matches}")
    print(f"  [OK] Aarogyasri coverage assessment: {aarogyasri_res.coverage_assessment}")
    print(f"  [OK] Aarogyasri out-of-pocket: {aarogyasri_res.estimated_out_of_pocket}")
    print(f"  [OK] Aarogyasri convergence note: {aarogyasri_res.can_combine_note[:60]}...")

    # 4. Test Evaluation Logic: Case 2 - Pink Card (APL) Disqualification
    print("\n4. Test Case 2: Pink Card (APL) resident:")
    req2 = SchemeMatchRequest(
        treatment_id="knee_replacement",
        state="Telangana",
        annual_income=4.0,
        ration_card_type="Pink Card (APL)"
    )
    res2 = evaluate_schemes(req2)
    aarogyasri_res2 = next(r for r in res2 if r.scheme.id == "aarogyasri")
    assert aarogyasri_res2.group == "does_not_match", "Aarogyasri must be disqualified for Pink Card"
    assert "Pink Ration Card" in aarogyasri_res2.matching_reasons[0]
    print(f"  [OK] Aarogyasri disqualified with reason: {aarogyasri_res2.matching_reasons[0]}")

    # 5. Test Evaluation Logic: Case 3 - Central Government Employee (CGHS)
    print("\n5. Test Case 3: Central Government Employee:")
    req3 = SchemeMatchRequest(
        treatment_id="knee_replacement",
        state="Telangana",
        annual_income=8.0,
        ration_card_type="No Ration Card",
        is_central_govt_employee=True
    )
    res3 = evaluate_schemes(req3)
    cghs_res3 = next(r for r in res3 if r.scheme.id == "cghs")
    assert cghs_res3.group == "likely_eligible", "CGHS must be likely eligible when central govt employee is checked"
    assert cghs_res3.why_matches, "CGHS must list why matches"
    print(f"  [OK] CGHS eligible: {cghs_res3.why_matches}")

    # 6. Test Evaluation Logic: Case 4 - Formal Sector Worker (ESIC)
    print("\n6. Test Case 4: Formal Sector Worker:")
    req4 = SchemeMatchRequest(
        treatment_id="knee_replacement",
        state="Telangana",
        annual_income=2.0,
        ration_card_type="No Ration Card",
        is_formal_sector_employed=True
    )
    res4 = evaluate_schemes(req4)
    esic_res4 = next(r for r in res4 if r.scheme.id == "esic")
    assert esic_res4.group == "likely_eligible", "ESIC must be likely eligible for formal sector worker"
    print(f"  [OK] ESIC eligible: {esic_res4.why_matches}")

    # 7. Test Evaluation Logic: Case 5 - Other State Filtering (Maharashtra resident)
    print("\n7. Test Case 5: Maharashtra resident:")
    req5 = SchemeMatchRequest(
        treatment_id="knee_replacement",
        state="Maharashtra",
        annual_income=3.0,
        ration_card_type="Yellow Card"
    )
    res5 = evaluate_schemes(req5)
    mjpjay_res5 = next(r for r in res5 if r.scheme.id == "mjpjay")
    assert mjpjay_res5.group == "likely_eligible", "MJPJAY must be eligible in Maharashtra"
    assert mjpjay_res5.state_match == True, "MJPJAY must have state_match=True in Maharashtra"
    
    aarogyasri_res5 = next(r for r in res5 if r.scheme.id == "aarogyasri")
    assert aarogyasri_res5.group == "does_not_match", "Aarogyasri must be disqualified outside Telangana"
    assert aarogyasri_res5.state_match == False, "Aarogyasri must have state_match=False outside Telangana"
    print(f"  [OK] MJPJAY in Maharashtra: {mjpjay_res5.group} (state_match={mjpjay_res5.state_match})")
    print(f"  [OK] Aarogyasri in Maharashtra: {aarogyasri_res5.group} (state_match={aarogyasri_res5.state_match})")

    # 8. Test Facility Empanelment Checking
    print("\n8. Test Case 6: Empanelment Check at Nizam's Institute of Medical Sciences (NIMS):")
    req6 = SchemeMatchRequest(
        treatment_id="knee_replacement",
        state="Telangana",
        annual_income=2.5,
        ration_card_type="White Card (Food Security Card)",
        selected_facility_id="fac_nims_hyd"
    )
    res6 = evaluate_schemes(req6)
    aarogyasri_res6 = next(r for r in res6 if r.scheme.id == "aarogyasri")
    assert "Verified" in aarogyasri_res6.empanelment_status, "NIMS must be verified empanelled under Aarogyasri"
    print(f"  [OK] NIMS Empanelment: {aarogyasri_res6.empanelment_status}")

    print("\n=================================================================")
    print("ALL TESTS PASSED WITH 100% SUCCESS!")
    print("=================================================================")

if __name__ == "__main__":
    run_tests()
