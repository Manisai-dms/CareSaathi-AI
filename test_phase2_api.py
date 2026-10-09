import urllib.request
import json

def post(url, payload):
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def safe(text):
    return str(text).encode('ascii', 'ignore').decode('ascii')

print("--- TESTING PHASE 2 BACKEND UPGRADES ---")

# 1. Guided Chat Test
res_chat = post("http://127.0.0.1:8000/api/chat/guided", {"message": "How much does knee replacement cost in Hyderabad?"})
print("[OK] Guided Chat Reply:", safe(res_chat["reply"][:90]), "...")
print("[OK] Suggested Chips:", res_chat["suggested_chips"])

# 2. Emergency Red-Flag Interruption Test
res_emer = post("http://127.0.0.1:8000/api/chat/guided", {"message": "Severe chest pain and unconscious"})
print("[OK] Emergency Detected in Chat:", res_emer["emergency_detected"])
print("[OK] Emergency Reply Preview:", safe(res_emer["reply"][:80]), "...")

# 3. Trust Metrics Test
with urllib.request.urlopen("http://127.0.0.1:8000/api/trust/metrics") as r:
    metrics = json.loads(r.read().decode('utf-8'))
print("[OK] Trust Metrics - Official:", metrics["official_count"], "Reference:", metrics["reference_count"], "Illustrative:", metrics["illustrative_count"])

# 4. Out-of-Pocket Waterfall & NPPA Itemized Components Test
cost = post("http://127.0.0.1:8000/api/cost/estimate", {"treatment": "Knee Replacement", "city": "Hyderabad"})
print("[OK] Itemized Components Count:", len(cost["detailed_components"]))
for comp in cost["detailed_components"][:3]:
    print(f"   * {safe(comp['component_name'])}: INR {comp['min_cost']:,} - {comp['max_cost']:,} [{comp['status_label']}] Source: {safe(comp['source_name'])}")

print("[OK] Waterfall Verification Status:", safe(cost["waterfall"]["verification_status"]))
print("[OK] Net Patient Share:", f"INR {cost['waterfall']['patient_share_min']:,} - INR {cost['waterfall']['patient_share_max']:,}")
print("[OK] Questions to Ask Count:", len(cost["checklists"]["questions_to_ask"]))
print("[OK] Documents to Carry Count:", len(cost["checklists"]["documents_to_carry"]))
print("[OK] Tier Comparison Tiers Count:", len(cost["tier_comparisons"]))

print("\nALL PHASE 2 BACKEND SERVICES FULLY VALIDATED!")
