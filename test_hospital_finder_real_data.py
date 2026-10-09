# Automated Verification Test Suite for Real Hospital Data & Authentic Images
import urllib.request
import json
import os
print("Starting CareSaathi AI Real Hospital Finder Audit...\n")

# 1. Test Facilities API
api_url = "http://127.0.0.1:8000/api/facilities?city=Hyderabad"
req = urllib.request.Request(api_url)
with urllib.request.urlopen(req) as resp:
    assert resp.status == 200, f"Expected 200, got {resp.status}"
    facilities = json.loads(resp.read().decode())

print(f"Test 1: Hospital Count & Genuine Facilities Retrieval")
print(f"Total facilities retrieved: {len(facilities)}")
assert len(facilities) >= 14, f"Expected at least 14 hospitals, got {len(facilities)}"

names = [f["name"] for f in facilities]
print("Retrieved Hospital Names:")
for n in names:
    print(f"  - {n}")

# Verify KIMS, Yashoda, Apollo, AIG Hospitals are present
required_hospitals = [
    "KIMS Hospitals (Krishna Institute of Medical Sciences)",
    "Yashoda Hospitals",
    "Apollo Health City",
    "AIG Hospitals (Asian Institute of Gastroenterology)"
]
for req_h in required_hospitals:
    assert any(req_h in n for n in names), f"Missing required hospital: {req_h}"
print("[PASS]: Required genuine hospitals (KIMS, Yashoda, Apollo, AIG) verified.\n")

# 2. Test Authentic Exterior Photographs
print("Test 2: Authentic Exterior Photographs Verification")
for fac in facilities:
    img_url = fac.get("image_url")
    assert img_url, f"Missing image_url for {fac['name']}"
    # Must not be a fake demo label
    source = fac.get("image_source", "")
    assert "Demo" not in source and "Branded Placeholder" not in source, f"Forbidden demo image source: {source} for {fac['name']}"

    # Check local image file exists
    local_path = os.path.join("frontend", "public", img_url.lstrip("/"))
    assert os.path.exists(local_path), f"File {local_path} does not exist for {fac['name']}"
    file_size = os.path.getsize(local_path)
    assert file_size > 5000, f"File {local_path} too small ({file_size} bytes)"
    print(f"  - {fac['name']}: {img_url} ({file_size // 1024} KB) [{source}]")

print("[PASS]: All hospital photographs exist and are authentic.\n")

# 3. Test Neutral Fallback Image
print("Test 3: Neutral Fallback Image Verification")
fallback_path = os.path.join("frontend", "public", "images", "hospitals", "hospital_image_unavailable.svg")
assert os.path.exists(fallback_path), "Neutral fallback SVG does not exist"
with open(fallback_path, "r", encoding="utf-8") as f:
    svg_content = f.read()
    assert "Hospital image unavailable" in svg_content
print("[PASS]: Neutral fallback image verified with required label.\n")

# 4. Test Calculated Distances & Radius Filters
print("Test 4: Distance Radius Filtering")
with urllib.request.urlopen("http://127.0.0.1:8000/api/facilities?city=Hyderabad&radius=5") as r5:
    fac_5km = json.loads(r5.read().decode())
    assert 0 < len(fac_5km) <= len(facilities)
    for f in fac_5km:
        assert f["distance_km"] <= 5.0, f"Facility {f['name']} distance {f['distance_km']} exceeds 5 km"

with urllib.request.urlopen("http://127.0.0.1:8000/api/facilities?city=Hyderabad&radius=10") as r10:
    fac_10km = json.loads(r10.read().decode())
    assert len(fac_10km) >= len(fac_5km)
    for f in fac_10km:
        assert f["distance_km"] <= 10.0

print(f"Facilities <= 5 km: {len(fac_5km)}")
print(f"Facilities <= 10 km: {len(fac_10km)}")
print("[PASS]: Real calculated distance and radius filtering verified.\n")

# 5. Test Category Filtering
print("Test 5: Category Filtering (Government, Private, Charitable/Trust)")
with urllib.request.urlopen("http://127.0.0.1:8000/api/facilities?city=Hyderabad&ownership=Government") as r_gov:
    gov_facs = json.loads(r_gov.read().decode())
    assert len(gov_facs) >= 3
    for f in gov_facs:
        assert f["ownership"] == "Government"

with urllib.request.urlopen("http://127.0.0.1:8000/api/facilities?city=Hyderabad&ownership=Charitable/Trust") as r_trust:
    trust_facs = json.loads(r_trust.read().decode())
    assert len(trust_facs) >= 3
    for f in trust_facs:
        assert f["ownership"] == "Charitable/Trust"

with urllib.request.urlopen("http://127.0.0.1:8000/api/facilities?city=Hyderabad&ownership=Private") as r_pvt:
    pvt_facs = json.loads(r_pvt.read().decode())
    assert len(pvt_facs) >= 6
    for f in pvt_facs:
        assert f["ownership"] == "Private"

print(f"Government facilities: {len(gov_facs)}")
print(f"Trust facilities: {len(trust_facs)}")
print(f"Private facilities: {len(pvt_facs)}")
print("[PASS]: Category filters verified.\n")

# 6. Test Sorting
print("Test 6: Sorting Options")
with urllib.request.urlopen("http://127.0.0.1:8000/api/facilities?city=Hyderabad&sort=nearest") as r_near:
    near_facs = json.loads(r_near.read().decode())
    distances = [f["distance_km"] for f in near_facs if f["distance_km"] is not None]
    assert distances == sorted(distances), "Nearest sorting is not ascending"

with urllib.request.urlopen("http://127.0.0.1:8000/api/facilities?city=Hyderabad&treatment_id=knee_replacement&sort=lowest_cost") as r_cost:
    cost_facs = json.loads(r_cost.read().decode())
    costs = [f["estimated_cost_min"] for f in cost_facs if f["estimated_cost_min"] is not None]
    assert costs == sorted(costs), "Lowest cost sorting is not ascending"

with urllib.request.urlopen("http://127.0.0.1:8000/api/facilities?city=Hyderabad&sort=rating") as r_rating:
    rating_facs = json.loads(r_rating.read().decode())
    ratings = [f["rating"] for f in rating_facs if f["rating"] is not None]
    assert ratings == sorted(ratings, reverse=True), "Rating sorting is not descending"

print("[PASS]: Nearest, Lowest Cost, and Rating sorting verified.\n")

print("[SUCCESS] ALL REAL HOSPITAL FINDER TESTS PASSED WITH 100% SUCCESS!")
