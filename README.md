# CareSaathi AI (केयरसाथी / కేర్ సాథీ)

> **AI-Powered Healthcare Cost & Care Navigation Platform for India**  
> *Know the Cost. Find the Care. Discover the Support.*

Built for the **VNR Hackathon**. CareSaathi AI is an integrated, human-centered healthcare navigation platform that assists Indian families in answering three fundamental questions:

1. **How much might my treatment or diagnostic procedure cost?**
2. **Where can I find a nearby facility that offers the required service?**
3. **What government schemes (Ayushman Bharat PM-JAY, Telangana Rajiv Aarogyasri, CGHS) or insurance coverage might help reduce my expenses?**

---

## 🏆 Hackathon Quick Start — "Judge Demo" in 10 Seconds

If you are a hackathon judge evaluating this project:
1. Open the platform in your browser: **`http://127.0.0.1:8000/`**
2. Click the **`🎯 Judge Demo`** button in the top navigation bar.
3. This instantly loads the rehearsed scenario:
   - **Procedure:** Total Knee Replacement (TKR)
   - **Location:** Hyderabad (Telangana)
   - **Family Profile:** Annual Income ₹2.5 Lakh, White Ration Card (Aarogyasri / PM-JAY eligible)
4. View the **Out-of-Pocket Waterfall Chart**, **Statutory NPPA & CGHS Price Breakdown**, **Govt vs Private Tier Comparison**, **Pre-Admission Checklists**, and click **`Print 1-Page Summary`** to test the clean PDF export!
5. Click **`CareSaathi Chat`** or **`Trust Ledger`** in the navigation header to inspect the WhatsApp-style conversational assistant and data verification audit metrics.

---

## 🌟 Comprehensive Features (Phase 1 & Phase 2 Upgrades)

### 1. Itemized Procedure Cost Breakdown with Public Reference Rates
- **Statutory Source Mapping**:
  - **Surgeon, OT & Anesthesia Charges**: Sourced from the **PM-JAY Health Benefit Package (HBP 2.2)** surgical package schedule.
  - **Orthopedic Knee Implants**: Capped under the **National Pharmaceutical Pricing Authority (NPPA)** Ceiling Price Order *S.O. 2668(E)*.
  - **Inpatient Room & Nursing**: Referenced against **CGHS Hyderabad** empanelled semi-private ward gazette rates.
  - **Generic Take-Home Medications**: Modeled on **Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP)** retail rates.
- **Transparent Status Badges**: Every cost row includes its exact statutory source name, official gazette URL, effective date, and status badge (`Official Published Rate`, `Public Reference Rate`, or `Illustrative`).

### 2. Out-of-Pocket Waterfall Bridge Calculator
- **Visual Waterfall Flow**: Gross Hospital Bill ➔ Public Scheme Deduction (Aarogyasri / PM-JAY) ➔ Jan Aushadhi Generic Savings ➔ Mandatory Co-pay / Non-medical Items ➔ Net Patient Out-of-Pocket Cash Requirement.
- **Verification-Required Badge**: Displays an explicit alert stating that final out-of-pocket expense requires hospital Aarogyamitra pre-authorization before admission.

### 3. Admission Readiness & Billing Checklists
- **Questions to Ask the Hospital**: Procedure-tailored billing questions (e.g., asking if implant serial numbers are provided on the tax invoice, asking if physiotherapy sessions are bundled into the package).
- **Documents to Carry**: Mandatory paperwork checklist for smooth admission (Aadhaar cards, White Ration Card / PM-JAY Golden Card, doctor referral slips, diagnostic MRI/X-ray films).

### 4. Government vs Trust vs Private Hospital Tier Comparison
- Side-by-side sector comparison matrix for the navigated procedure:
  - **Government Medical College Hospitals** (Free/Subsidized, standard wards, high patient volume)
  - **Charitable / Non-Profit Trust Facilities** (Subsidized packages, NABH accredited care)
  - **Private Multi-Specialty Centers** (Full market tariffs, deluxe private suites, zero wait times)

### 5. Emergency Red-Flag Interruption Protocol
- **Safety First**: Detects critical emergency symptoms (e.g., severe acute chest pain, trauma, loss of consciousness, difficulty breathing).
- **Immediate Interruption**: Halts non-emergency cost estimations and presents a full-screen, high-contrast modal guiding the user to dial the **National Ambulance Service (108)** and immediate emergency departments.

### 6. Conversational Guided-Chat Assistant (WhatsApp-Style UI)
- **Familiar Chat Interface**: A clean drawer UI with WhatsApp-style visual aesthetics and message bubbles.
- **Strict Non-Affiliation Disclaimer**: Prominently notes that it is an educational navigation assistant and does not claim official WhatsApp or government endorsement.
- **Interactive Quick-Action Chips**: One-tap queries for cost waterfalls, hospital questions, document checklists, and scheme eligibility.

### 7. Hybrid AI Architecture & Strict Database Validator
- **NLP / Entity Parsing**: Accepts natural multi-lingual user input in English, Telugu, and Hindi.
- **Deterministic Calculation Engine**: Prevents generative hallucination by computing prices strictly from verified database records and public schedules.
- **Strict Gatekeeper Validator**: Automatically checks any extracted procedure, facility, or tariff against the validated relational catalog before presenting results.

### 8. Trust & Transparency Dashboard
- **Live Verification Metrics**: Displays counts of Official Gazette Rates, Public Reference Schedules, and Illustrative Estimates.
- **Freshness Audit**: Displays data audit timestamps, gazette citation links, and regional city coverage across India.

### 9. One-Page Printable Patient Summary (Zero PII Retention)
- Click **`Print / Save PDF`** from either the Cost Estimator or Dashboard to produce a clean, publication-grade single-page A4 summary.
- Includes procedure details, indicative cost ranges, NPPA implant caps, out-of-pocket bridge, hospital checklists, and emergency helplines.
- **Privacy-First Guarantee**: No personal patient identifiers or health data are recorded, stored, or transferred.

---

## 🎨 Phase 3 — Experience Layer & Hackathon Delivery

### 1. Framer Motion Animated Entry Flow
- **First Visit Experience**: Elegant 6-second onboarding sequence that runs once on initial visit (stored in `localStorage` with a persistent **Replay** option in the footer).
- **Visual Concepts**:
  - Heartbeat ECG pulse seamlessly morphing into the Indian Rupee (`₹`) symbol.
  - Dynamic count-up counter simulating procedure cost range build-up (`₹0` ➔ `₹1,80,000`).
  - Animated map pin pulse across key Hyderabad zones (Kukatpally, Banjara Hills, Jubilee Hills, Secunderabad).
  - Key impact counters (1,400+ Empanelled Beds, 4 Gazette Schedules, 100% Verified Benchmarks).
- **User Agency**: Features a top-right **Skip Intro** button and automatically detects `prefers-reduced-motion` for accessibility.

### 2. Full Authentication & Judge Demo Access
- **Cryptographic Security**: Implements FastAPI PBKDF2-HMAC password hashing with salt and PyJWT bearer token authorization.
- **Zero Frontend Hardcoding**: No plaintext credentials in client code.
- **Four Authentication Paths**:
  - **Create Account**: Validated registration with name, email, password, and preferred language (`te`, `en`, `hi`).
  - **Sign In**: Standard email/password login with explicit error banners for invalid credentials.
  - **🎯 Judge Demo Login**: One-click instant authentication using pre-seeded reviewer credentials (`judge.demo@caresaathi.in`).
  - **Continue as Guest**: Non-blocking guest mode requiring zero signup to explore full functionality.
- **Consented Data Retention**: Strictly stores only user name, email, language preference, and explicitly consented saved facility comparisons. Zero patient clinical data or health identifiers are retained.

### 3. One-Tap WhatsApp Sharing (Zero PII Leakage)
- Generates compliant `https://wa.me/?text=` share links with preformatted treatment name, estimated range, hospital name, and non-affiliation disclaimer.
- **Strict Privacy Guarantee**: Automatically excludes all personal income, ration card tier, Aadhaar, or private financial details from the share payload.
- **Fallback Support**: Includes one-tap **Copy Summary** and native `navigator.share` on supported mobile devices.
- **Honest Labeling**: Explicitly states standard web link sharing and makes no false claims of WhatsApp Business API integration.

### 4. Interactive Data Graphics & Concentric Distance Rings
- **Interactive SVG Cost Donut**: Custom SVG breakdown chart displaying proportion of Surgeon Fees, Implants, Ward Charges, Diagnostics, and Medicines with hover tooltips and real calculation engine labels.
- **Concentric Distance Rings**: Leaflet GIS map with 5km, 10km, and 15km distance circles centered over Hyderabad to visualize hospital accessibility and emergency proximity.

### 5. Hospital Photography & Wikimedia Commons Attribution
- **Three-Tier Photo Hierarchy**:
  1. *Google Places Photos API*: Server-side proxy lookup (only activated when `GOOGLE_PLACES_API_KEY` is present; server key is never exposed to the browser).
  2. *Wikimedia Commons Open Data*: High-resolution campus photography under verified open licenses (CC BY-SA 4.0 / CC BY-SA 3.0 / Public Domain) with explicit photographer and license attribution badges.
  3. *Branded Placeholder Fallback*: Clean geometric placeholder with institutional initials (e.g., `AHF` for Ankura Hospital, `NIMS` for Nizam's Institute) if no verified photo exists or if network loading fails.
- Never scrapes Google Images or unverified sources.

---

## 🏗️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Vanilla CSS Design System, Lucide Icons, Leaflet GIS Maps |
| **Backend** | Python 3.12, FastAPI, Pydantic v2, Uvicorn, Python-Multipart |
| **Database** | SQLite Relational Database with verified seed records, canonical procedures & schemes |
| **Mapping & GIS** | OpenStreetMap, Leaflet JS, Haversine spatial geodesic calculations |
| **Speech & OCR** | Web Speech API (in-browser) + Server-side Clinical Entity Extractor |
| **Print Engine** | Scoped `@media print` CSS engine for publication-grade single-page PDF generation |

### Design System Color Tokens
- **Deep Navy**: `#183247` (Headings, primary branding)
- **Primary Healthcare Teal**: `#438F84` (Interactive buttons, verified badges)
- **Soft Mint**: `#E7F3EF` (Card backgrounds, success highlights)
- **Warm Off-White**: `#FAFAF7` (Page background)
- **Light Blue**: `#EAF2F8` (Informational containers)
- **Muted Coral**: `#D97962` (Emergency alerts, urgent callouts)
- **Neutral Text Grey**: `#64717D` (Subtitles, body metadata)

---

## 🚀 Setup & Running Locally

### Prerequisites
- Python 3.10+ (Python 3.12 verified)
- Node.js 20+ and npm (Optional — pre-built production bundle is already included in `frontend/dist/`)

### Quick Start (Single Server Mode)
The FastAPI server automatically serves the built frontend SPA and all REST API endpoints simultaneously on `http://127.0.0.1:8000`.

1. **Install Python backend requirements:**
   ```bash
   pip install -r backend/requirements.txt
   ```

2. **Start the CareSaathi AI Platform:**
   ```bash
   uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
   ```

3. **Open in your browser:**
   ```
   http://127.0.0.1:8000/
   ```

### Development Mode (Frontend Hot-Reloading)
If you wish to edit frontend components with live HMR:
```bash
# Terminal 1: Backend
uvicorn backend.app.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
# Open http://localhost:5173/ (Vite proxies /api to port 8000)
```

---

## 🧪 Automated Testing & Verification

Run the **Phase 3 Experience Layer Audit & Tests**:
```bash
python test_phase3_full.py
```
*Validates:*
- One-click Judge Demo login & JWT verification
- Authentication failure on invalid credentials
- Protected endpoint authorization gatekeeping
- Consented saved facility comparisons CRUD
- Safe handling of absent Google Places API key (server key kept secret)
- Verified Wikimedia Commons hospital photography and CC BY-SA licenses
- Branded initials fallback generator for unverified facilities
- One-tap WhatsApp share link formatting & zero leakage of sensitive patient data
- Print CSS (`@media print`) stylesheet verification

Run the **Phase 2 Automated Verification Suite**:
```bash
python test_phase2_api.py
```
*Validates:*
- Guided Chat conversational response and chip generation
- Emergency red-flag interruption triggering
- Trust Dashboard metrics and database verification counts
- NPPA S.O. 2668(E) and CGHS itemized cost component generation
- Out-of-pocket waterfall step calculations and verification status
- Pre-admission questions and documents checklists
- Government vs Trust vs Private institutional tier comparisons

Run the **Comprehensive HTTP Integration Suite**:
```bash
python test_integration.py
```
*Verifies all frontend static assets and REST API endpoints return HTTP 200.*

---

## 🔒 Responsible AI Principles

1. **Non-Diagnostic:** CareSaathi AI does not provide medical diagnoses or replace consultations with licensed physicians.
2. **Transparent Confidence:** Confidence ratings are strictly tied to whether tariffs are officially published or reference-derived.
3. **No Hallucinated Pricing:** Costs are strictly bounded by official government benefit schedules (PM-JAY HBP 2.2, Aarogyasri) and statutory price orders (NPPA).
4. **Emergency First:** When emergency symptoms appear, cost comparisons are superseded by immediate emergency medical instructions (Call 108).
5. **Zero Data Retention:** No personal patient data, prescriptions, or identity credentials are saved or tracked.
