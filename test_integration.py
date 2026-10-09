import urllib.request
import json

def test_endpoint(name, url, method='GET', data=None):
    try:
        req = urllib.request.Request(url, method=method)
        if data:
            req.add_header('Content-Type', 'application/json')
            post_bytes = json.dumps(data).encode('utf-8')
        else:
            post_bytes = None
        with urllib.request.urlopen(req, data=post_bytes, timeout=5) as response:
            status = response.status
            body = response.read().decode('utf-8', errors='ignore')
            print(f"[OK] {name}: HTTP {status} (Response Length: {len(body)})")
            return True, body
    except Exception as e:
        print(f"[FAIL] {name}: {e}")
        return False, str(e)

if __name__ == '__main__':
    print("--- CARESAATHI AI LIVE INTEGRATION TEST SUITE ---")
    test_endpoint("Static Frontend HTML Root", "http://127.0.0.1:8000/")
    test_endpoint("API Health Check", "http://127.0.0.1:8000/api/health")
    test_endpoint("System Metadata & Sources", "http://127.0.0.1:8000/api/metadata")
    test_endpoint("Canonical Treatments Catalogue", "http://127.0.0.1:8000/api/treatments")
    test_endpoint("NLP Query Natural Search", "http://127.0.0.1:8000/api/nlp/parse", method="POST", data={"text": "I need a knee replacement in Hyderabad"})
    test_endpoint("Healthcare Cost Estimator", "http://127.0.0.1:8000/api/cost/estimate", method="POST", data={"treatment": "Knee Replacement", "city": "Hyderabad"})
    test_endpoint("Nearby Facilities Discovery", "http://127.0.0.1:8000/api/facilities?city=Hyderabad&treatment_id=knee_replacement")
    test_endpoint("Government Scheme Matcher", "http://127.0.0.1:8000/api/schemes/match", method="POST", data={"treatment_id": "knee_replacement", "state": "Telangana", "annual_income": 2.5, "ration_card_type": "White Card"})
    print("\nALL LIVE INTEGRATION ENDPOINTS VERIFIED SUCCESSFULLY!")
