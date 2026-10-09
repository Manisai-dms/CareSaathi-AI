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

## 🗺️ Enable Google Maps in 10 Minutes

CareSaathi AI features an enterprise **MapProvider abstraction** that defaults cleanly to OpenStreetMap / Leaflet and branded fallback photography when keys are absent, but seamlessly elevates to Google Maps (Advanced Markers, Places API New, photo lightbox, and travel-time matrix) when keys are configured.

Follow these steps to activate Google Maps in under 10 minutes:

### 1. Create Google Cloud Project & Enable APIs
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named `CareSaathi-AI` (or select an existing one).
3. Navigate to **APIs & Services > Library** and enable the following APIs:
   - **Maps JavaScript API** (Frontend map rendering & Advanced Markers)
   - **Places API (New)** (Hospital details, ratings, opening hours, photos, autocomplete)
   - **Routes API** / **Distance Matrix API** (Driving/Transit travel times & directions)
   - **Geocoding API** (Reverse geocoding and location resolution)

### 2. Create Two Restricted API Keys
Never use an unrestricted API key. Create two distinct keys:

#### Key A: Browser Client Key (`VITE_GOOGLE_MAPS_API_KEY`)
- **API Restrictions**: Restrict strictly to **Maps JavaScript API** and **Places API**.
- **Application Restrictions**: Set **HTTP Referrers (web sites)** to:
  - `http://localhost:5173/*`
  - `http://127.0.0.1:5173/*`
  - `http://127.0.0.1:8000/*`
  - `https://your-production-domain.com/*`
- Add to `frontend/.env`:
  ```bash
  VITE_GOOGLE_MAPS_API_KEY="AIzaSyYourBrowserClientKeyHere"
  ```

#### Key B: Server Secret Key (`GOOGLE_MAPS_SERVER_KEY`)
- **API Restrictions**: Restrict strictly to **Places API (New)**, **Routes API**, and **Geocoding API**.
- **Application Restrictions**: Set **IP addresses** to your Supabase Edge Function outbound IP range or Supabase project.
- **SECURITY RULE**: *NEVER prefix this key with `VITE_` and NEVER expose it in the frontend client.*

### 3. Set Billing Alerts & Cost Guards
To prevent unexpected Google Cloud billing:
1. In Cloud Console, go to **Billing > Budgets & alerts**.
2. Create a monthly budget of **$10 USD** (or ₹800 INR) with alerts at 50%, 80%, and 100%.
3. In **APIs & Services > Quotas**, set daily per-user and per-project request caps (e.g., 500 requests/day for Places API New).
4. CareSaathi AI includes client-side debouncing, memory caching for photo URLs, request de-duplication, and automatic fallback to Leaflet if rate limits or quota errors occur.

### 4. Add Server Secrets to Supabase & Deploy Edge Functions
1. Set the secret in your Supabase project:
   ```bash
   supabase secrets set GOOGLE_MAPS_SERVER_KEY="AIzaSyYourServerSecretKeyHere"
   ```
2. Deploy the 6 CareSaathi Edge Functions:
   ```bash
   supabase functions deploy send-appointment-reminder
   supabase functions deploy places-nearby
   supabase functions deploy place-details
   supabase functions deploy place-photo
   supabase functions deploy route-matrix
   supabase functions deploy geocode
   ```

### 5. Run Database Migration
Apply the atomic appointment and slot schema:
```bash
supabase db push
# or run the SQL in supabase/migrations/20261009_appointments_and_slots.sql in Supabase SQL Editor
```

---

## 🔒 Responsible AI & Honest Booking Principles

1. **Non-Diagnostic:** CareSaathi AI does not provide medical diagnoses or replace consultations with licensed physicians.
2. **Honest Booking Rule:**
   - **Demo Facilities:** Bookings are marked with an amber `Demo Facility` chip.
   - **Real Facilities:** Bookings are submitted as `"Appointment request sent to hospital, awaiting official confirmation"`. We never claim a booking is officially confirmed by a hospital without a verified direct hospital API integration.
   - **No Payments Collected:** No online payments, advance booking fees, or financial transactions are collected.
3. **Transparent Confidence & Data Quality Chips:**
   - `Demo Facility`
   - `Google Maps Verified`
   - `Published Price`
   - `Reference Estimate`
4. **Google Rating Attribution:**
   - Google ratings and review counts are labeled as `"Google rating, not a quality guarantee"` and are display-only. They are **never** used to re-rank hospital recommendation scores.
   - Required `"Powered by Google"` attribution is maintained throughout.
5. **Atomic Double-Booking Guard:**
   - Concurrent bookings against the same slot are guarded at the database level via PostgreSQL row locking (`FOR UPDATE`) and `slot_capacity_check` constraints, preventing over-capacity race conditions.
6. **Zero Health PII Retention:** No personal patient Aadhaar numbers, prescriptions, or private clinical records are retained in database logs.
