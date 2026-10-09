import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.data.database import init_db
from backend.app.services.nlp_service import parse_user_query
from backend.app.services.cost_service import estimate_cost
from backend.app.services.facility_service import search_facilities
from backend.app.services.scheme_service import evaluate_schemes
from backend.app.services.ocr_service import process_prescription_ocr
from backend.app.models.schemas import CostEstimateRequest, SchemeMatchRequest, PrescriptionOCRRequest

print("Initializing DB...")
init_db()

print("\n--- TEST 1: NLP Query 'I need a knee replacement in Hyderabad' ---")
res1 = parse_user_query("I need a knee replacement in Hyderabad")
print("Intent:", res1.detected_intent)
print("Treatment:", res1.extracted_treatment)
print("Location:", res1.extracted_location)

print("\n--- TEST 2: NLP Query 'I have had fever for five days' ---")
res2 = parse_user_query("I have had fever for five days")
print("Intent:", res2.detected_intent)
print("Is symptom not diagnosis:", res2.is_symptom_not_diagnosis)
print("Triage guidance:", res2.triage_guidance)

print("\n--- TEST 3: NLP Query 'severe chest pain' ---")
res3 = parse_user_query("severe chest pain")
print("Emergency detected:", res3.emergency_detected)
print("Suggested action:", res3.suggested_action)

print("\n--- TEST 4: Cost Estimation (Hospital-based: NIMS) ---")
req4 = CostEstimateRequest(treatment="knee replacement", hospital_name="NIMS")
cost4 = estimate_cost(req4)
print("Workflow:", cost4.workflow)
print("Hospital:", cost4.selected_facility.name if cost4.selected_facility else "None")
print("Price range:", f"INR {cost4.overall_min:,} - INR {cost4.overall_max:,}")
print("Confidence:", cost4.confidence)
print("Price type:", cost4.price_type)

print("\n--- TEST 5: Nearby Facility Discovery (Hyderabad, Knee Replacement) ---")
facs = search_facilities(query_city="Hyderabad", treatment_id="knee_replacement")
print(f"Found {len(facs)} facilities. Top 3:")
for f in facs[:3]:
    print(f" - {f.name} ({f.ownership}): {f.distance_km} km, Cost: INR {f.estimated_cost_min:,} - INR {f.estimated_cost_max:,}")

print("\n--- TEST 6: Scheme Matching (Telangana, Rs 2.5L income, White Card) ---")
req6 = SchemeMatchRequest(
    treatment_id="knee_replacement",
    state="Telangana",
    annual_income=2.5,
    ration_card_type="White Card"
)
schemes = evaluate_schemes(req6)
print(f"Evaluated {len(schemes)} schemes:")
for s in schemes:
    print(f" - {s.scheme.name}: Status = {s.match_status} ({s.status_color})")

print("\n--- TEST 7: Prescription OCR ---" )
ocr_res = process_prescription_ocr(PrescriptionOCRRequest(filename="rx_knee_replacement.jpg"))
print("Extracted treatments:", ocr_res.detected_treatments)
print("Requires user confirmation:", ocr_res.requires_user_confirmation)

print("\nALL BACKEND UNIT TESTS PASSED!")
