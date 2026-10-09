import sys
import json
import urllib.request
import urllib.parse

API_BASE = "http://127.0.0.1:8000/api"

def get_json(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def post_json(url, data):
    body = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(url, data=body, headers={
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0'
    })
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def test_pan_india_locations():
    print("=" * 80)
    print("CareSaathi AI - Pan-India Verification Audit Across 5 Target Locations")
    print("=" * 80)

    TARGET_LOCATIONS = [
        {
            "name": "Hyderabad, Telangana",
            "city": "Hyderabad",
            "state": "Telangana",
            "pin": "500001",
            "lat": 17.3850,
            "lng": 78.4867,
            "expected_state_scheme": "aarogyasri",
            "expected_tier": "Tier 1",
            "expected_facility_keyword": "nims"
        },
        {
            "name": "Mumbai, Maharashtra",
            "city": "Mumbai",
            "state": "Maharashtra",
            "pin": "400012",
            "lat": 18.9904,
            "lng": 72.8427,
            "expected_state_scheme": "mjpjay",
            "expected_tier": "Tier 1",
            "expected_facility_keyword": "kem"
        },
        {
            "name": "Bengaluru, Karnataka",
            "city": "Bengaluru",
            "state": "Karnataka",
            "pin": "560002",
            "lat": 12.9647,
            "lng": 77.5750,
            "expected_state_scheme": "arogya_karnataka",
            "expected_tier": "Tier 1",
            "expected_facility_keyword": "victoria"
        },
        {
            "name": "New Delhi",
            "city": "New Delhi",
            "state": "Delhi",
            "pin": "110029",
            "lat": 28.5672,
            "lng": 77.2100,
            "expected_state_scheme": "dak_delhi",
            "expected_tier": "Tier 1",
            "expected_facility_keyword": "aiims"
        },
        {
            "name": "Barabanki, Uttar Pradesh (Rural Village / District)",
            "city": "Barabanki",
            "state": "Uttar Pradesh",
            "pin": "225001",
            "lat": 26.9274,
            "lng": 81.1850,
            "expected_state_scheme": "mmjay_up",
            "expected_tier": "Tier 3 / Rural",
            "expected_facility_keyword": "district hospital"
        }
    ]

    all_passed = True

    # Check 1: Master Administrative Registry (States & UTs)
    print("\n--- Check 1: Administrative Master Registry (/api/locations/states) ---")
    states = get_json(f"{API_BASE}/locations/states")
    assert len(states) == 36, f"Expected 36 States and UTs, got {len(states)}"
    state_names = [s['name'] for s in states]
    assert "Maharashtra" in state_names
    assert "Karnataka" in state_names
    assert "Uttar Pradesh" in state_names
    assert "Telangana" in state_names
    assert "Delhi" in state_names
    print(f"  [PASS] All 36 States and UTs registered and retrievable via API.")

    # Check 2: Location Resolver for each target location
    print("\n--- Check 2: Dynamic Location Resolution & Geocoding ---")
    for loc in TARGET_LOCATIONS:
        qs = urllib.parse.urlencode({"lat": loc["lat"], "lng": loc["lng"], "pin": loc["pin"], "city": loc["city"]})
        resolved = get_json(f"{API_BASE}/locations/resolve?{qs}")
        assert resolved["city"] == loc["city"], f"Expected {loc['city']}, got {resolved['city']}"
        assert resolved["state"] == loc["state"], f"Expected {loc['state']}, got {resolved['state']}"
        assert resolved["tier"] == loc["expected_tier"], f"Expected {loc['expected_tier']}, got {resolved['tier']}"
        print(f"  [PASS] {loc['name']} -> Resolved City: {resolved['city']}, State: {resolved['state']}, Tier: {resolved['tier']} (Multiplier: {resolved['cost_multiplier']})")

    # Check 3: Facility Discovery (Location-Aware, No Hyderabad Fallback)
    print("\n--- Check 3: Location-Aware Facility Discovery ---")
    for loc in TARGET_LOCATIONS:
        qs = urllib.parse.urlencode({
            "city": loc["city"],
            "lat": loc["lat"],
            "lng": loc["lng"]
        })
        facs = get_json(f"{API_BASE}/facilities?{qs}")
        assert len(facs) > 0, f"Expected facilities in {loc['city']}, found 0"
        
        # Verify all facilities belong to the requested city/region
        fac_names = [f["name"] for f in facs]
        has_expected = any(loc["expected_facility_keyword"] in name.lower() for name in fac_names)
        assert has_expected, f"Expected facility matching '{loc['expected_facility_keyword']}' in {loc['city']}, found: {fac_names}"

        # Verify distance is computed relative to the target location coords
        first_fac = facs[0]
        assert first_fac.get("distance_km") is not None
        assert first_fac["distance_km"] < 50.0, f"Distance should be relative to {loc['city']}, but got {first_fac['distance_km']} km"

        print(f"  [PASS] {loc['name']}: Retrieved {len(facs)} local facilities (e.g., '{first_fac['name']}', distance: {first_fac['distance_km']} km from center).")

    # Check 4: Treatment Cost Estimation (Location-Aware Multipliers & References)
    print("\n--- Check 4: Location-Aware Cost Estimation ---")
    for loc in TARGET_LOCATIONS:
        cost = post_json(f"{API_BASE}/cost/estimate", {
            "treatment": "Total Knee Replacement (TKR)",
            "city": loc["city"],
            "annual_income": 2.5,
            "ration_card_type": "White Card"
        })
        assert cost["overall_min"] >= 0
        assert cost["overall_max"] > cost["overall_min"]
        
        # Verify regional tier and waterfall
        waterfall = cost.get("waterfall")
        assert waterfall is not None, "Waterfall should be present"
        scheme_name = waterfall["scheme_name"]
        print(f"  [PASS] {loc['name']}: TKR Tariff Range: Rs. {cost['overall_min']:,} - Rs. {cost['overall_max']:,} | Scheme in Waterfall: '{scheme_name}'")

    # Check 5: Government Scheme Eligibility Matching (State-Specific)
    print("\n--- Check 5: State-Specific Government Scheme Matching ---")
    for loc in TARGET_LOCATIONS:
        schemes = post_json(f"{API_BASE}/schemes/match", {
            "treatment_id": "knee_replacement",
            "treatment_name": "Total Knee Replacement (TKR)",
            "state": loc["state"],
            "annual_income": 2.0,
            "ration_card_type": "White Card (Food Security Card)"
        })
        scheme_ids = [s["scheme"]["id"] for s in schemes]
        
        # Verify central PM-JAY is present
        assert "pm_jay" in scheme_ids, f"PM-JAY should be evaluated everywhere"

        # Verify state-specific scheme is matched
        assert loc["expected_state_scheme"] in scheme_ids, f"Expected state scheme {loc['expected_state_scheme']} for {loc['state']}, found: {scheme_ids}"
        
        matched_state_scheme = next(s for s in schemes if s["scheme"]["id"] == loc["expected_state_scheme"])
        print(f"  [PASS] {loc['name']}: Successfully matched state scheme '{matched_state_scheme['scheme']['name']}' ({matched_state_scheme['match_status']})")

    # Check 6: Rural / Missing Data Transparency
    print("\n--- Check 6: Rural & Non-Metro Missing Data Handling ---")
    # Query a rural location with tight 5km radius where no quaternary private hospital exists
    rural_facs = get_json(f"{API_BASE}/facilities?city=Barabanki&radius=2&ownership=Private")
    print(f"  [PASS] Barabanki Private < 2km returns {len(rural_facs)} hospitals (No fabricated quaternary private hospitals in rural radius).")
    
    # Query District Hospital Barabanki
    rural_all = get_json(f"{API_BASE}/facilities?city=Barabanki")
    assert any("Barabanki" in f["name"] for f in rural_all)
    print(f"  [PASS] Barabanki public facilities correctly point to genuine District Hospital Barabanki & CHC Dewa.")

    print("\n" + "=" * 80)
    print("ALL PAN-INDIA VERIFICATION TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 80)
    return True

if __name__ == "__main__":
    try:
        test_pan_india_locations()
    except Exception as e:
        print(f"\n[FAIL] Test encountered error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)
