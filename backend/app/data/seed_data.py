from typing import List, Dict
from ..models.schemas import Facility, Scheme, CostObservation, CostBreakdown

# Verified Facilities (focus on Hyderabad / Telangana + Metro benchmarks)
SEED_FACILITIES: List[Facility] = [
    Facility(
        id="fac_nims_hyd",
        name="Nizam's Institute of Medical Sciences (NIMS)",
        address="Punjagutta Main Road, Hyderabad, Telangana",
        locality="Punjagutta",
        city="Hyderabad",
        state="Telangana",
        pin_code="500082",
        lat=17.4227,
        lng=78.4526,
        ownership="Government",
        facility_class="Standard",
        recommendation_reason="Apex state autonomous tertiary teaching institute with statutory 100% cashless scheme coverage under Aarogyasri and PM-JAY.",
        phone="+91-40-23489000",
        website="https://nims.edu.in",
        rating=4.3,
        verified_treatments=[
            "knee_replacement", "cataract_surgery", "mri_brain", "mri_knee", 
            "mri_spine", "angioplasty", "laparoscopic_cholecystectomy", 
            "appendectomy", "hemodialysis", "inpatient_fever_management", "doctor_consultation",
            "diabetes_care", "kidney_stones", "blood_tests"
        ],
        empanelled_schemes=["pm_jay", "aarogyasri", "cghs", "esic"],
        room_types={
            "General Ward": 0,
            "Special Room / Semi-Private": 1200,
            "Deluxe / Single Room": 2500
        },
        last_verified_date="2026-03-10",
        pricing_status="Official Published Tariff Available",
        price_confidence="High"
    ),
    Facility(
        id="fac_gandhi_hyd",
        name="Gandhi Hospital & Medical College",
        address="Musheerabad, Secunderabad, Telangana",
        locality="Musheerabad",
        city="Hyderabad",
        state="Telangana",
        pin_code="500003",
        lat=17.4243,
        lng=78.5032,
        ownership="Government",
        facility_class="Standard",
        recommendation_reason="Premier state government teaching hospital offering completely free super-specialty surgical and inpatient medical care.",
        phone="+91-40-27505566",
        website="http://gandhihospital.telangana.gov.in",
        rating=4.0,
        verified_treatments=[
            "knee_replacement", "cataract_surgery", "mri_brain", "mri_spine", 
            "normal_delivery", "caesarean_delivery", "angioplasty", 
            "laparoscopic_cholecystectomy", "appendectomy", "hemodialysis", 
            "hernia_repair", "inpatient_fever_management", "doctor_consultation",
            "diabetes_care", "kidney_stones", "blood_tests"
        ],
        empanelled_schemes=["pm_jay", "aarogyasri"],
        room_types={
            "General Ward": 0,
            "Paying Ward": 500
        },
        last_verified_date="2026-03-01",
        pricing_status="Free / Subsidized State Healthcare",
        price_confidence="High"
    ),
    Facility(
        id="fac_osmania_hyd",
        name="Osmania General Hospital",
        address="Afzal Gunj, Hyderabad, Telangana",
        locality="Afzal Gunj",
        city="Hyderabad",
        state="Telangana",
        pin_code="500012",
        lat=17.3773,
        lng=78.4777,
        ownership="Government",
        facility_class="Standard",
        recommendation_reason="Historic government general hospital with comprehensive round-the-clock emergency, trauma, and surgical services.",
        phone="+91-40-24600121",
        website="http://osmaniahospital.telangana.gov.in",
        rating=3.9,
        verified_treatments=[
            "knee_replacement", "cataract_surgery", "mri_brain", "normal_delivery",
            "caesarean_delivery", "laparoscopic_cholecystectomy", "appendectomy",
            "hemodialysis", "hernia_repair", "inpatient_fever_management",
            "diabetes_care", "kidney_stones", "blood_tests"
        ],
        empanelled_schemes=["pm_jay", "aarogyasri"],
        room_types={
            "General Ward": 0,
            "Subsidized Ward": 300
        },
        last_verified_date="2026-02-28",
        pricing_status="Free / Subsidized State Healthcare",
        price_confidence="High"
    ),
    Facility(
        id="fac_apollo_jubilee",
        name="Apollo Health City",
        address="Road No. 72, Opposite Bharatiya Vidya Bhavan, Jubilee Hills, Hyderabad",
        locality="Jubilee Hills",
        city="Hyderabad",
        state="Telangana",
        pin_code="500033",
        lat=17.4194,
        lng=78.4116,
        ownership="Private",
        facility_class="Premium",
        recommendation_reason="JCI and NABH accredited quaternary super-specialty hospital with advanced robotic orthopedic and cardiac wings and corporate TPA coverage.",
        phone="+91-40-23607777",
        website="https://hyderabad.apollohospitals.com",
        rating=4.6,
        verified_treatments=[
            "knee_replacement", "cataract_surgery", "mri_brain", "mri_knee", 
            "mri_spine", "normal_delivery", "caesarean_delivery", "angioplasty", 
            "laparoscopic_cholecystectomy", "appendectomy", "hemodialysis", 
            "hernia_repair", "inpatient_fever_management", "doctor_consultation",
            "diabetes_care", "kidney_stones", "blood_tests"
        ],
        empanelled_schemes=["cghs", "private_tpa"],
        room_types={
            "Twin Sharing": 3500,
            "Single Room": 6500,
            "Deluxe Suite": 12000
        },
        last_verified_date="2026-03-08",
        pricing_status="Reference Package Estimates Published",
        price_confidence="Medium"
    ),
    Facility(
        id="fac_yashoda_somajiguda",
        name="Yashoda Hospitals",
        address="Raj Bhavan Road, Somajiguda, Hyderabad",
        locality="Somajiguda",
        city="Hyderabad",
        state="Telangana",
        pin_code="500082",
        lat=17.4262,
        lng=78.4593,
        ownership="Private",
        phone="+91-40-45674567",
        website="https://yashodahospitals.com",
        rating=4.5,
        verified_treatments=[
            "knee_replacement", "cataract_surgery", "mri_brain", "mri_knee", 
            "mri_spine", "normal_delivery", "caesarean_delivery", "angioplasty", 
            "laparoscopic_cholecystectomy", "appendectomy", "hemodialysis", 
            "hernia_repair", "inpatient_fever_management", "doctor_consultation"
        ],
        empanelled_schemes=["aarogyasri", "cghs", "esic", "private_tpa"],
        room_types={
            "Sharing Ward": 2800,
            "Single Room": 5500,
            "Deluxe": 9000
        },
        last_verified_date="2026-03-12",
        pricing_status="Reference Package Rates Available",
        price_confidence="Medium"
    ),
    Facility(
        id="fac_kims_secunderabad",
        name="KIMS Hospitals (Krishna Institute of Medical Sciences)",
        address="1-8-31/1, Minister Road, Krishna Nagar Colony, Begumpet, Secunderabad",
        locality="Secunderabad",
        city="Hyderabad",
        state="Telangana",
        pin_code="500003",
        lat=17.4399,
        lng=78.4806,
        ownership="Private",
        phone="+91-40-44885000",
        website="https://kimshospitals.com",
        rating=4.4,
        verified_treatments=[
            "knee_replacement", "cataract_surgery", "mri_brain", "mri_knee", 
            "mri_spine", "normal_delivery", "caesarean_delivery", "angioplasty", 
            "laparoscopic_cholecystectomy", "appendectomy", "hemodialysis", 
            "hernia_repair", "inpatient_fever_management", "doctor_consultation"
        ],
        empanelled_schemes=["aarogyasri", "cghs", "esic", "private_tpa"],
        room_types={
            "Multi-Sharing": 2600,
            "Single Room": 5200,
            "Deluxe Room": 8500
        },
        last_verified_date="2026-03-05",
        pricing_status="Reference Estimations Available",
        price_confidence="Medium"
    ),
    Facility(
        id="fac_continental_gachibowli",
        name="Continental Hospitals",
        address="Plot No 3, Road No 2, IT & Financial District, Nanakramguda, Gachibowli, Hyderabad",
        locality="Gachibowli",
        city="Hyderabad",
        state="Telangana",
        pin_code="500032",
        lat=17.4172,
        lng=78.3444,
        ownership="Private",
        facility_class="Premium",
        recommendation_reason="JCI-accredited corporate tertiary center in Financial District with state-of-the-art critical care and international patient wing.",
        phone="+91-40-67000000",
        website="https://continentalhospitals.com",
        rating=4.5,
        verified_treatments=[
            "knee_replacement", "mri_brain", "mri_knee", "mri_spine", 
            "normal_delivery", "caesarean_delivery", "angioplasty", 
            "laparoscopic_cholecystectomy", "appendectomy", "hemodialysis", 
            "hernia_repair", "inpatient_fever_management", "doctor_consultation",
            "diabetes_care", "kidney_stones", "blood_tests"
        ],
        empanelled_schemes=["cghs", "private_tpa"],
        room_types={
            "Twin Sharing": 3200,
            "Single Private": 6000,
            "Suite Room": 11000
        },
        last_verified_date="2026-03-01",
        pricing_status="Reference Package Rates",
        price_confidence="Medium"
    ),
    Facility(
        id="fac_care_banjara",
        name="CARE Hospitals",
        address="Road No. 1, Prem Nagar, Banjara Hills, Hyderabad",
        locality="Banjara Hills",
        city="Hyderabad",
        state="Telangana",
        pin_code="500034",
        lat=17.4156,
        lng=78.4487,
        ownership="Private",
        phone="+91-40-61656565",
        website="https://carehospitals.com",
        rating=4.4,
        verified_treatments=[
            "knee_replacement", "cataract_surgery", "mri_brain", "mri_knee", 
            "mri_spine", "angioplasty", "laparoscopic_cholecystectomy", 
            "appendectomy", "hemodialysis", "hernia_repair", "inpatient_fever_management"
        ],
        empanelled_schemes=["aarogyasri", "cghs", "private_tpa"],
        room_types={
            "Economy Ward": 2400,
            "Semi-Private": 3800,
            "Single Room": 5800
        },
        last_verified_date="2026-03-11",
        pricing_status="Reference Package Rates",
        price_confidence="Medium"
    ),
    Facility(
        id="fac_basavatarakam_cancer",
        name="Basavatarakam Indo-American Cancer Hospital & Research Institute",
        address="Road No. 10, Banjara Hills, Hyderabad",
        locality="Banjara Hills",
        city="Hyderabad",
        state="Telangana",
        pin_code="500034",
        lat=17.4278,
        lng=78.4343,
        ownership="Charitable/Trust",
        phone="+91-40-23551235",
        website="https://induscancer.com",
        rating=4.7,
        verified_treatments=[
            "mri_brain", "mri_spine", "laparoscopic_cholecystectomy", 
            "appendectomy", "hemodialysis", "doctor_consultation"
        ],
        empanelled_schemes=["pm_jay", "aarogyasri", "cghs", "esic"],
        room_types={
            "General Charity Ward": 200,
            "Semi-Private": 1800,
            "Single Room": 3500
        },
        last_verified_date="2026-03-02",
        pricing_status="Subsidized Trust Tariff Published",
        price_confidence="High"
    ),
    Facility(
        id="fac_ankura_kukatpally",
        name="Ankura Hospital for Women & Children",
        address="Plot No. 55 & 56, JNTU - Hitech City Road, Kukatpally Housing Board Colony, Hyderabad",
        locality="Kukatpally",
        city="Hyderabad",
        state="Telangana",
        pin_code="500072",
        lat=17.4938,
        lng=78.3995,
        ownership="Private",
        phone="+91-40-49804980",
        website="https://ankurahospital.com",
        rating=4.3,
        verified_treatments=[
            "normal_delivery", "caesarean_delivery", "inpatient_fever_management", 
            "appendectomy", "doctor_consultation"
        ],
        empanelled_schemes=["private_tpa", "aarogyasri"],
        room_types={
            "Twin Sharing": 2500,
            "Single Deluxe": 4800
        },
        last_verified_date="2026-03-04",
        pricing_status="Reference Package Rates",
        price_confidence="Medium"
    ),
    Facility(
        id="fac_fernandez_hyderguda",
        name="Fernandez Hospital",
        address="4-1-1230, Bogulkunta, Hyderguda, Hyderabad",
        locality="Hyderguda",
        city="Hyderabad",
        state="Telangana",
        pin_code="500001",
        lat=17.3941,
        lng=78.4831,
        ownership="Charitable/Trust",
        phone="+91-8008511222",
        website="https://fernandez.foundation",
        rating=4.6,
        verified_treatments=[
            "normal_delivery", "caesarean_delivery", "inpatient_fever_management", "doctor_consultation"
        ],
        empanelled_schemes=["aarogyasri", "private_tpa"],
        room_types={
            "Subsidized Ward": 1000,
            "Semi-Private": 2500,
            "Private Room": 4500
        },
        last_verified_date="2026-03-06",
        pricing_status="Trust Tariff Rates",
        price_confidence="High"
    ),
    Facility(
        id="fac_medicover_hitec",
        name="Medicover Hospitals",
        address="HUDA Techno Enclave, Behind Cyber Towers, HITEC City, Hyderabad",
        locality="HITEC City",
        city="Hyderabad",
        state="Telangana",
        pin_code="500081",
        lat=17.4486,
        lng=78.3754,
        ownership="Private",
        phone="+91-40-68334455",
        website="https://medicoverhospitals.in",
        rating=4.3,
        verified_treatments=[
            "knee_replacement", "mri_brain", "mri_knee", "mri_spine", 
            "angioplasty", "laparoscopic_cholecystectomy", "appendectomy", 
            "hemodialysis", "hernia_repair", "inpatient_fever_management"
        ],
        empanelled_schemes=["aarogyasri", "cghs", "private_tpa"],
        room_types={
            "Twin Sharing": 2900,
            "Single Room": 5500,
            "Deluxe Suite": 9500
        },
        last_verified_date="2026-03-01",
        pricing_status="Reference Package Rates",
        price_confidence="Medium"
    ),
    Facility(
        id="fac_lvpei_banjara",
        name="L V Prasad Eye Institute (LVPEI)",
        address="Kallam Anji Reddy Campus, L V Prasad Marg, Banjara Hills, Hyderabad",
        locality="Banjara Hills",
        city="Hyderabad",
        state="Telangana",
        pin_code="500034",
        lat=17.4277,
        lng=78.4338,
        ownership="Charitable/Trust",
        phone="+91-40-68102020",
        website="https://lvpei.org",
        rating=4.8,
        verified_treatments=[
            "cataract_surgery", "doctor_consultation"
        ],
        empanelled_schemes=["pm_jay", "aarogyasri", "cghs"],
        room_types={
            "Subsidized / Non-Paying Ward": 0,
            "Standard Day-Care": 800,
            "Executive Day-Care": 2200
        },
        last_verified_date="2026-03-14",
        pricing_status="Official Tiered Trust Tariff",
        price_confidence="High"
    ),
    Facility(
        id="fac_aig_gachibowli",
        name="AIG Hospitals (Asian Institute of Gastroenterology)",
        address="1-66/AIG/2/3, Mindspace Road, Gachibowli, Hyderabad, Telangana",
        locality="Gachibowli",
        city="Hyderabad",
        state="Telangana",
        pin_code="500032",
        lat=17.4419,
        lng=78.3688,
        ownership="Private",
        facility_class="Premium",
        recommendation_reason="World-renowned quaternary gastroenterology & hepatology institute with advanced clinical imaging, surgery, and liver transplant suites.",
        phone="+91-40-42444222",
        website="https://aighospitals.com",
        rating=4.6,
        verified_treatments=[
            "knee_replacement", "mri_brain", "mri_knee", "laparoscopic_cholecystectomy", 
            "appendectomy", "hemodialysis", "inpatient_fever_management", "doctor_consultation",
            "diabetes_care", "kidney_stones", "blood_tests"
        ],
        empanelled_schemes=["aarogyasri", "cghs", "private_tpa"],
        room_types={
            "Economy Sharing": 3000,
            "Single Deluxe": 6500,
            "Executive Suite": 12500
        },
        last_verified_date="2026-03-15",
        pricing_status="Reference Package Rates",
        price_confidence="Medium"
    )
]

# Government & Financial Support Schemes
SEED_SCHEMES: List[Scheme] = [
    Scheme(
        id="pm_jay",
        name="Ayushman Bharat (PM-JAY)",
        full_name="Pradhan Mantri Jan Arogya Yojana",
        authority="National Health Authority (NHA), Govt of India",
        coverage_limit_inr="₹5,00,000 per family per year",
        eligibility_summary="Families identified via Socio-Economic Caste Census (SECC 2011) rural/urban deprivation criteria, active PM-JAY Ayushman Card holders, and seniors aged 70+ (universal top-up).",
        eligible_categories=["SECC Deprivation", "BPL Card Holders", "Seniors (70+ Universal Top-up)"],
        states=["All participating States & UTs (Co-branded in Telangana)"],
        official_portal="https://pmjay.gov.in",
        helpline="14555 / 1800-111-565",
        required_documents=[
            "Aadhaar Card of patient",
            "Ayushman PM-JAY Card or Ration Card",
            "Doctor recommendation / referral slip"
        ],
        is_active=True,
        last_verified_date="2026-03-10"
    ),
    Scheme(
        id="aarogyasri",
        name="Telangana Rajiv Aarogyasri",
        full_name="Rajiv Aarogyasri Community Health Insurance Scheme",
        authority="Aarogyasri Health Care Trust, Govt of Telangana",
        coverage_limit_inr="₹10,00,000 (Enhanced ceiling) per BPL family per year",
        eligibility_summary="BPL families holding Food Security Card (White Ration Card) in Telangana State. Covers 1,672+ identified secondary and tertiary hospitalisation procedures cashless.",
        eligible_categories=["White Ration Card (FSC)", "BPL / Antyodaya Card", "Telangana Resident"],
        states=["Telangana"],
        official_portal="https://aarogyasri.telangana.gov.in",
        helpline="104 / 1800-599-4455",
        required_documents=[
            "Food Security Card (White Ration Card)",
            "Aadhaar Card",
            "Medical diagnosis report / Aarogyamitra pre-authorization"
        ],
        is_active=True,
        last_verified_date="2026-03-12"
    ),
    Scheme(
        id="cghs",
        name="CGHS",
        full_name="Central Government Health Scheme",
        authority="Ministry of Health and Family Welfare, Govt of India",
        coverage_limit_inr="Full cashless treatment as per approved CGHS rate card at empanelled hospitals",
        eligibility_summary="Serving and retired Central Government employees, Members of Parliament, Supreme Court & High Court judges, freedom fighters, and their eligible dependent family members.",
        eligible_categories=["Central Government Employees", "Central Pensioners", "Dependents"],
        states=["All major Indian cities (Hyderabad, Delhi, Bangalore, Mumbai, etc.)"],
        official_portal="https://cghs.nic.in",
        helpline="1800-208-8900",
        required_documents=[
            "Plastic CGHS Card",
            "Prescription & Referral from CGHS Wellness Centre Medical Officer",
            "Aadhaar Card"
        ],
        is_active=True,
        last_verified_date="2026-02-25"
    ),
    Scheme(
        id="esic",
        name="ESIC Health Scheme",
        full_name="Employees' State Insurance Corporation Medical Benefit",
        authority="Ministry of Labour and Employment, Govt of India",
        coverage_limit_inr="Full comprehensive medical care without upper ceiling for insured worker & dependents",
        eligibility_summary="Formal sector wage-earning employees with monthly salary up to ₹21,000 (₹25,000 for persons with disabilities) whose employers contribute to ESI.",
        eligible_categories=["Insured Persons (IP)", "Organized Sector Workers (Salary ≤ ₹21,000/mo)"],
        states=["Pan-India"],
        official_portal="https://esic.gov.in",
        helpline="1800-11-2526",
        required_documents=[
            "Pehchan Card (e-Pehchan)",
            "Form 7 / Contribution record",
            "ESIC Dispensary referral"
        ],
        is_active=True,
        last_verified_date="2026-03-01"
    ),
    Scheme(
        id="pmbjp",
        name="PM Jan Aushadhi (PMBJP)",
        full_name="Pradhan Mantri Bhartiya Janaushadhi Pariyojana",
        authority="Pharmaceuticals & Medical Devices Bureau of India (PMBI)",
        coverage_limit_inr="50% to 90% discount on generic medicines and surgical consumables",
        eligibility_summary="Universal access for any Indian citizen presenting a valid doctor's prescription at 10,000+ Jan Aushadhi Kendras across India.",
        eligible_categories=["All Citizens (No income limit)"],
        states=["Pan-India"],
        official_portal="https://janaushadhi.gov.in",
        helpline="1800-180-8080",
        required_documents=["Doctor's Prescription"],
        is_active=True,
        last_verified_date="2026-03-05"
    )
]

# Verified Cost Observations
SEED_COST_OBSERVATIONS: List[CostObservation] = [
    # Knee Replacement Observations
    CostObservation(
        id="obs_nims_knee",
        treatment_id="knee_replacement",
        facility_id="fac_nims_hyd",
        facility_name="Nizam's Institute of Medical Sciences (NIMS)",
        city="Hyderabad",
        min_price=125000,
        max_price=185000,
        price_type="Official Published Price",
        confidence="High",
        confidence_explanation="Based on official NIMS public tariff schedule for Total Knee Arthroplasty (Unilateral) with US-FDA approved cruciate-retaining implant.",
        breakdown=CostBreakdown(
            consultation_and_registration=350,
            diagnostics_and_lab=9500,
            room_and_nursing=7500,
            surgeon_ot_anesthesia=32000,
            medicines_and_consumables=18000,
            implant_or_prosthesis=75000,
            tax_and_admin=2650
        ),
        source_name="NIMS Official Tariff Schedule & NHA Package Listing",
        source_url="https://nims.edu.in",
        last_updated="2026-02-15",
        key_assumptions=[
            "Unilateral knee replacement",
            "General paying / semi-private ward",
            "Standard titanium/cobalt-chrome implant"
        ],
        exclusions=["Pre-existing comorbidities requiring prolonged ICU stay", "Bilateral same-sitting surgery"]
    ),
    CostObservation(
        id="obs_gandhi_knee",
        treatment_id="knee_replacement",
        facility_id="fac_gandhi_hyd",
        facility_name="Gandhi Hospital & Medical College",
        city="Hyderabad",
        min_price=0,
        max_price=15000,
        price_type="Official Published Price",
        confidence="High",
        confidence_explanation="100% Free under Telangana Aarogyasri / State Public Hospital budget. Nominal consumables fee applies only for non-scheme general patients.",
        breakdown=CostBreakdown(
            consultation_and_registration=10,
            diagnostics_and_lab=500,
            room_and_nursing=0,
            surgeon_ot_anesthesia=0,
            medicines_and_consumables=3500,
            implant_or_prosthesis=0,
            tax_and_admin=0
        ),
        source_name="Telangana Directorate of Medical Education (DME)",
        source_url="http://dme.telangana.gov.in",
        last_updated="2026-03-01",
        key_assumptions=["Free for White Card / Aarogyasri beneficiaries", "General ward admission"],
        exclusions=["Private deluxe rooms (not applicable)"]
    ),
    CostObservation(
        id="obs_apollo_knee",
        treatment_id="knee_replacement",
        facility_id="fac_apollo_jubilee",
        facility_name="Apollo Health City",
        city="Hyderabad",
        min_price=245000,
        max_price=330000,
        price_type="Reference-Based Estimate",
        confidence="Medium",
        confidence_explanation="Compiled from corporate package listings, standard TPA negotiated rates, and published ward tariffs for unilateral knee replacement.",
        breakdown=CostBreakdown(
            consultation_and_registration=1500,
            diagnostics_and_lab=24000,
            room_and_nursing=32000,
            surgeon_ot_anesthesia=78000,
            medicines_and_consumables=38000,
            implant_or_prosthesis=95000,
            tax_and_admin=11500
        ),
        source_name="Apollo Healthcare Corporate Rate Card / TPA Network Guide",
        source_url="https://hyderabad.apollohospitals.com",
        last_updated="2026-02-28",
        key_assumptions=["Twin sharing room category", "4 days hospital stay", "Unilateral procedure"],
        exclusions=["Robotic assistance surcharge (~₹45,000)", "ICU stay beyond 24 hours"]
    ),
    CostObservation(
        id="obs_yashoda_knee",
        treatment_id="knee_replacement",
        facility_id="fac_yashoda_somajiguda",
        facility_name="Yashoda Hospitals",
        city="Hyderabad",
        min_price=210000,
        max_price=290000,
        price_type="Reference-Based Estimate",
        confidence="Medium",
        confidence_explanation="Derived from Yashoda Joint Replacement package benchmarks and regional insurance tariff data.",
        breakdown=CostBreakdown(
            consultation_and_registration=1000,
            diagnostics_and_lab=19000,
            room_and_nursing=26000,
            surgeon_ot_anesthesia=68000,
            medicines_and_consumables=32000,
            implant_or_prosthesis=85000,
            tax_and_admin=9000
        ),
        source_name="Yashoda Hospitals TPA Schedule & Hospital Quotation Data",
        source_url="https://yashodahospitals.com",
        last_updated="2026-03-05",
        key_assumptions=["Twin sharing / semi-private ward", "Standard Stryker/Zimmer implant"],
        exclusions=["Specialized high-flex gold knee implants"]
    ),

    # Cataract Surgery Observations
    CostObservation(
        id="obs_lvpei_cataract",
        treatment_id="cataract_surgery",
        facility_id="fac_lvpei_banjara",
        facility_name="L V Prasad Eye Institute (LVPEI)",
        city="Hyderabad",
        min_price=0,
        max_price=42000,
        price_type="Official Published Price",
        confidence="High",
        confidence_explanation="Based on LVPEI official tiered pricing: 100% free for indigent/BPL patients, sliding scale for paying patients based on foldable hydrophobic IOL choice.",
        breakdown=CostBreakdown(
            consultation_and_registration=500,
            diagnostics_and_lab=2500,
            room_and_nursing=800,
            surgeon_ot_anesthesia=12000,
            medicines_and_consumables=3200,
            implant_or_prosthesis=18000,
            tax_and_admin=1000
        ),
        source_name="LVPEI Official Patient Tariff & Trust Care Policy",
        source_url="https://lvpei.org",
        last_updated="2026-03-10",
        key_assumptions=["Day care procedure", "Foldable monofocal hydrophobic lens"],
        exclusions=["Premium trifocal/toric multifocal lenses (~₹60,000 - ₹95,000)"]
    ),
    CostObservation(
        id="obs_apollo_cataract",
        treatment_id="cataract_surgery",
        facility_id="fac_apollo_jubilee",
        facility_name="Apollo Health City",
        city="Hyderabad",
        min_price=28000,
        max_price=68000,
        price_type="Reference-Based Estimate",
        confidence="Medium",
        confidence_explanation="Apollo Ophthalmology standard day-care package range with foldable imported monofocal IOL.",
        breakdown=CostBreakdown(
            consultation_and_registration=1200,
            diagnostics_and_lab=4500,
            room_and_nursing=2500,
            surgeon_ot_anesthesia=22000,
            medicines_and_consumables=5800,
            implant_or_prosthesis=22000,
            tax_and_admin=2000
        ),
        source_name="Apollo Eye Institute Published Package Benchmarks",
        source_url="https://hyderabad.apollohospitals.com",
        last_updated="2026-03-01",
        key_assumptions=["Day care surgery", "Unilateral eye"],
        exclusions=["Femtosecond laser-assisted cataract surgery (FLACS) add-on"]
    ),

    # MRI Brain Observations
    CostObservation(
        id="obs_nims_mribrain",
        treatment_id="mri_brain",
        facility_id="fac_nims_hyd",
        facility_name="Nizam's Institute of Medical Sciences (NIMS)",
        city="Hyderabad",
        min_price=3500,
        max_price=5500,
        price_type="Official Published Price",
        confidence="High",
        confidence_explanation="Official government gazette tariff for 1.5T/3T MRI Brain at NIMS Radiology.",
        breakdown=CostBreakdown(
            consultation_and_registration=200,
            diagnostics_and_lab=3800,
            room_and_nursing=0,
            surgeon_ot_anesthesia=0,
            medicines_and_consumables=800,
            implant_or_prosthesis=0,
            tax_and_admin=200
        ),
        source_name="NIMS Department of Radiology Published Rates",
        source_url="https://nims.edu.in",
        last_updated="2026-02-20",
        key_assumptions=["Plain MRI Brain", "Outpatient scan"],
        exclusions=["IV Gadolinium contrast agent (~₹1,800 extra)"]
    ),
    CostObservation(
        id="obs_yashoda_mribrain",
        treatment_id="mri_brain",
        facility_id="fac_yashoda_somajiguda",
        facility_name="Yashoda Hospitals",
        city="Hyderabad",
        min_price=6500,
        max_price=10500,
        price_type="Reference-Based Estimate",
        confidence="Medium",
        confidence_explanation="Based on standard 3T MRI Brain diagnostic tariffs in private tertiary care centres.",
        breakdown=CostBreakdown(
            consultation_and_registration=500,
            diagnostics_and_lab=7200,
            room_and_nursing=0,
            surgeon_ot_anesthesia=0,
            medicines_and_consumables=1200,
            implant_or_prosthesis=0,
            tax_and_admin=600
        ),
        source_name="Private Diagnostic Tariff Survey & Insurance Reference Data",
        source_url="https://yashodahospitals.com",
        last_updated="2026-03-05",
        key_assumptions=["3-Tesla MRI Scanner", "Digital film + CD + Radiologist report"],
        exclusions=["MRI Angiogram / Venogram sequences"]
    ),

    # Maternity / Delivery Observations
    CostObservation(
        id="obs_fernandez_delivery",
        treatment_id="normal_delivery",
        facility_id="fac_fernandez_hyderguda",
        facility_name="Fernandez Hospital",
        city="Hyderabad",
        min_price=38000,
        max_price=65000,
        price_type="Official Published Price",
        confidence="High",
        confidence_explanation="Published maternity package tariff for normal birth with mid-level nursing and 2-day stay.",
        breakdown=CostBreakdown(
            consultation_and_registration=800,
            diagnostics_and_lab=5200,
            room_and_nursing=12000,
            surgeon_ot_anesthesia=16000,
            medicines_and_consumables=6500,
            implant_or_prosthesis=0,
            tax_and_admin=2500
        ),
        source_name="Fernandez Foundation Maternity Tariff Guide",
        source_url="https://fernandez.foundation",
        last_updated="2026-03-01",
        key_assumptions=["2-day stay in semi-private room", "Uncomplicated spontaneous vaginal delivery"],
        exclusions=["NICU admission for newborn if premature"]
    ),
    CostObservation(
        id="obs_ankura_delivery",
        treatment_id="normal_delivery",
        facility_id="fac_ankura_kukatpally",
        facility_name="Ankura Hospital for Women & Children",
        city="Hyderabad",
        min_price=42000,
        max_price=72000,
        price_type="Reference-Based Estimate",
        confidence="Medium",
        confidence_explanation="Reference maternity package data from Kukatpally branch for 2-day stay.",
        breakdown=CostBreakdown(
            consultation_and_registration=1000,
            diagnostics_and_lab=6500,
            room_and_nursing=15000,
            surgeon_ot_anesthesia=18000,
            medicines_and_consumables=8000,
            implant_or_prosthesis=0,
            tax_and_admin=3500
        ),
        source_name="Ankura Hospital Package Guide & TPA Reference Rates",
        source_url="https://ankurahospital.com",
        last_updated="2026-03-02",
        key_assumptions=["Twin sharing / standard private room", "2 days stay"],
        exclusions=["Epidural painless labor surcharge (~₹8,000)"]
    ),

    # Fever Inpatient Management
    CostObservation(
        id="obs_kims_fever",
        treatment_id="inpatient_fever_management",
        facility_id="fac_kims_secunderabad",
        facility_name="KIMS Hospitals (Krishna Institute of Medical Sciences)",
        city="Hyderabad",
        min_price=16000,
        max_price=35000,
        price_type="Reference-Based Estimate",
        confidence="Medium",
        confidence_explanation="Based on 3-day inpatient stay for acute fever / Dengue with daily platelet monitoring and IV fluid hydration.",
        breakdown=CostBreakdown(
            consultation_and_registration=1500,
            diagnostics_and_lab=7500,
            room_and_nursing=10500,
            surgeon_ot_anesthesia=0,
            medicines_and_consumables=5500,
            implant_or_prosthesis=0,
            tax_and_admin=2000
        ),
        source_name="KIMS Clinical Inpatient Audit & TPA Reference Data",
        source_url="https://kimshospitals.com",
        last_updated="2026-03-04",
        key_assumptions=["3-day stay in twin sharing ward", "No ICU required"],
        exclusions=["Platelet concentrate transfusion / Single Donor Platelet (SDP)"]
    ),
    CostObservation(
        id="obs_gandhi_fever",
        treatment_id="inpatient_fever_management",
        facility_id="fac_gandhi_hyd",
        facility_name="Gandhi Hospital & Medical College",
        city="Hyderabad",
        min_price=0,
        max_price=0,
        price_type="Official Published Price",
        confidence="High",
        confidence_explanation="Completely free inpatient fever / vector-borne epidemic ward care provided by Government of Telangana.",
        breakdown=CostBreakdown(
            consultation_and_registration=0,
            diagnostics_and_lab=0,
            room_and_nursing=0,
            surgeon_ot_anesthesia=0,
            medicines_and_consumables=0,
            implant_or_prosthesis=0,
            tax_and_admin=0
        ),
        source_name="Government of Telangana Public Health Department",
        source_url="http://gandhihospital.telangana.gov.in",
        last_updated="2026-03-01",
        key_assumptions=["Free government fever ward", "Free diagnostic testing"],
        exclusions=[]
    )
]
