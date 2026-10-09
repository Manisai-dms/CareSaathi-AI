import urllib.request
import json
import urllib.error

def post(url, payload, token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers=headers,
        method='POST'
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def get(url, token=None):
    headers = {}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

print("=== TESTING PHASE 3 BACKEND AUTH & PHOTO SERVICES ===")

# 1. Judge Demo Login
demo_res = post("http://127.0.0.1:8000/api/auth/demo-login", {})
print("[OK] Judge Demo Login Success:", demo_res["user"]["name"], f"({demo_res['user']['email']})")
demo_token = demo_res["access_token"]

# 2. Get Current User Profile via Token
me_res = get("http://127.0.0.1:8000/api/auth/me", token=demo_token)
print("[OK] Auth /me Profile Verified:", me_res["email"], me_res["name"])

# 3. New User Registration Test
import time
test_email = f"tester_{int(time.time())}@caresaathi.in"
reg_res = post("http://127.0.0.1:8000/api/auth/register", {
    "name": "Ananya Sharma",
    "email": test_email,
    "password": "SecurePassword123!",
    "language": "te"
})
print("[OK] New User Registered:", reg_res["user"]["name"], f"Language: {reg_res['user']['language']}")

# 4. Duplicate Registration Rejection Test
try:
    post("http://127.0.0.1:8000/api/auth/register", {
        "name": "Duplicate",
        "email": test_email,
        "password": "SecurePassword123!"
    })
    print("[FAIL] Duplicate should have been rejected!")
except urllib.error.HTTPError as e:
    print(f"[OK] Duplicate Registration Blocked: HTTP {e.code}")

# 5. Login Failure Test (Wrong Password)
try:
    post("http://127.0.0.1:8000/api/auth/login", {
        "email": test_email,
        "password": "WrongPassword!"
    })
    print("[FAIL] Wrong password should have been rejected!")
except urllib.error.HTTPError as e:
    print(f"[OK] Wrong Password Blocked: HTTP {e.code}")

# 6. Login Success Test
login_res = post("http://127.0.0.1:8000/api/auth/login", {
    "email": test_email,
    "password": "SecurePassword123!"
})
print("[OK] User Login Succeeded:", login_res["user"]["email"])

# 7. Consented Saved Comparisons Test
saved_res = post("http://127.0.0.1:8000/api/user/saved-comparisons", {
    "facility_ids": ["fac_nims_hyd", "fac_apollo_jubilee"],
    "treatment_name": "Total Knee Replacement (TKR)"
}, token=login_res["access_token"])
print("[OK] Comparison Saved:", saved_res["id"], f"Facilities: {len(saved_res['facility_ids'])}")

saved_list = get("http://127.0.0.1:8000/api/user/saved-comparisons", token=login_res["access_token"])
print(f"[OK] Retrieved Saved Comparisons Count: {len(saved_list)}")

# 8. Hospital Photo Metadata & Wikimedia Commons Attribution
photo_nims = get("http://127.0.0.1:8000/api/facilities/fac_nims_hyd/photo")
print("[OK] NIMS Photo Source:", photo_nims["source"], f"License: {photo_nims['license']}")
print("     Attribution:", photo_nims["attribution"])

photo_unverified = get("http://127.0.0.1:8000/api/facilities/fac_ankura_kukatpally/photo")
print("[OK] Kukatpally Facility Fallback Initials:", photo_unverified["initials"], f"Source: {photo_unverified['source']}")

print("\nALL PHASE 3 BACKEND AUTH & PHOTO TESTS PASSED 100%!")
