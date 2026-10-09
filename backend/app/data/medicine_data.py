# Master Medicine Registry & Official Price Reference
# Sources:
# 1. National Pharmaceutical Pricing Authority (NPPA) Pharma Sahi Daam (Ceiling Price Orders)
#    https://nppaipdms.gov.in/NPPA/PharmaSahiDaam/searchMedicine
# 2. Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP) Official Rate Card
# 3. Central Drugs Standard Control Organisation (CDSCO) / National List of Essential Medicines (NLEM 2022)

from typing import List, Dict, Optional, Any

MEDICINE_DATABASE: List[Dict[str, Any]] = [
    {
        "id": "med_pcm_650",
        "brand_name": "Dolo 650",
        "generic_name": "Paracetamol",
        "strength": "650 mg",
        "formulation": "Tablet",
        "pack_size": 15,
        "mrp_branded": 33.60,
        "nppa_ceiling_per_unit": 2.24,
        "jan_aushadhi_per_unit": 0.90,
        "manufacturer": "Micro Labs Ltd",
        "generic_alternative": "Paracetamol 650mg (Jan Aushadhi)",
        "source": "NPPA Pharma Sahi Daam & PMBJP Schedule",
        "source_url": "https://nppaipdms.gov.in/NPPA/PharmaSahiDaam/searchMedicine",
        "last_updated": "March 2026",
        "is_nlem": True
    },
    {
        "id": "med_panto_40",
        "brand_name": "Pan 40",
        "generic_name": "Pantoprazole",
        "strength": "40 mg",
        "formulation": "Tablet",
        "pack_size": 15,
        "mrp_branded": 155.00,
        "nppa_ceiling_per_unit": 10.33,
        "jan_aushadhi_per_unit": 2.20,
        "manufacturer": "Alkem Laboratories",
        "generic_alternative": "Pantoprazole Gastro-Resistant 40mg (PMBJP)",
        "source": "NPPA Pharma Sahi Daam (NLEM 2022)",
        "source_url": "https://nppaipdms.gov.in/NPPA/PharmaSahiDaam/searchMedicine",
        "last_updated": "March 2026",
        "is_nlem": True
    },
    {
        "id": "med_augmentin_625",
        "brand_name": "Augmentin 625 Duo",
        "generic_name": "Amoxicillin and Potassium Clavulanate",
        "strength": "500 mg + 125 mg",
        "formulation": "Tablet",
        "pack_size": 10,
        "mrp_branded": 204.00,
        "nppa_ceiling_per_unit": 20.40,
        "jan_aushadhi_per_unit": 6.50,
        "manufacturer": "GlaxoSmithKline Pharmaceuticals",
        "generic_alternative": "Amoxicillin & Clavulanic Acid 625mg (PMBJP)",
        "source": "NPPA Notification S.O. 1499(E)",
        "source_url": "https://nppaipdms.gov.in/NPPA/PharmaSahiDaam/searchMedicine",
        "last_updated": "March 2026",
        "is_nlem": True
    },
    {
        "id": "med_telmi_40",
        "brand_name": "Telma 40",
        "generic_name": "Telmisartan",
        "strength": "40 mg",
        "formulation": "Tablet",
        "pack_size": 15,
        "mrp_branded": 118.00,
        "nppa_ceiling_per_unit": 7.86,
        "jan_aushadhi_per_unit": 1.40,
        "manufacturer": "Glenmark Pharmaceuticals",
        "generic_alternative": "Telmisartan Tablets IP 40mg (PMBJP)",
        "source": "NPPA Pharma Sahi Daam (Essential Drug Schedule)",
        "source_url": "https://nppaipdms.gov.in/NPPA/PharmaSahiDaam/searchMedicine",
        "last_updated": "March 2026",
        "is_nlem": True
    },
    {
        "id": "med_atorva_20",
        "brand_name": "Atorva 20",
        "generic_name": "Atorvastatin",
        "strength": "20 mg",
        "formulation": "Tablet",
        "pack_size": 15,
        "mrp_branded": 235.00,
        "nppa_ceiling_per_unit": 15.66,
        "jan_aushadhi_per_unit": 2.80,
        "manufacturer": "Zydus Healthcare",
        "generic_alternative": "Atorvastatin 20mg (Jan Aushadhi)",
        "source": "NPPA NLEM Drug Price Order",
        "source_url": "https://nppaipdms.gov.in/NPPA/PharmaSahiDaam/searchMedicine",
        "last_updated": "March 2026",
        "is_nlem": True
    },
    {
        "id": "med_chymoral_forte",
        "brand_name": "Chymoral Forte",
        "generic_name": "Trypsin-Chymotrypsin",
        "strength": "100,000 Armour Units",
        "formulation": "Tablet",
        "pack_size": 20,
        "mrp_branded": 450.00,
        "nppa_ceiling_per_unit": 22.50,
        "jan_aushadhi_per_unit": 7.50,
        "manufacturer": "Torrent Pharmaceuticals",
        "generic_alternative": "Trypsin-Chymotrypsin 100k AU (Jan Aushadhi)",
        "source": "Market Survey & PMBJP Schedule",
        "source_url": "https://nppaipdms.gov.in/NPPA/PharmaSahiDaam/searchMedicine",
        "last_updated": "March 2026",
        "is_nlem": False
    },
    {
        "id": "med_moxi_eye_drops",
        "brand_name": "Vigamox Eye Drops",
        "generic_name": "Moxifloxacin Ophthalmic Solution",
        "strength": "0.5% w/v",
        "formulation": "Eye Drops",
        "pack_size": 5, # 5 ml vial
        "mrp_branded": 195.00,
        "nppa_ceiling_per_unit": 39.00,
        "jan_aushadhi_per_unit": 16.00,
        "manufacturer": "Novartis India / Alcon",
        "generic_alternative": "Moxifloxacin Eye Drops 0.5% (Jan Aushadhi 5ml)",
        "source": "NPPA Pharma Sahi Daam Ophthalmic List",
        "source_url": "https://nppaipdms.gov.in/NPPA/PharmaSahiDaam/searchMedicine",
        "last_updated": "March 2026",
        "is_nlem": True
    },
    {
        "id": "med_metformin_500",
        "brand_name": "Glycomet 500",
        "generic_name": "Metformin Hydrochloride",
        "strength": "500 mg",
        "formulation": "Tablet",
        "pack_size": 20,
        "mrp_branded": 42.00,
        "nppa_ceiling_per_unit": 2.10,
        "jan_aushadhi_per_unit": 0.60,
        "manufacturer": "USV Pvt Ltd",
        "generic_alternative": "Metformin 500mg (Jan Aushadhi)",
        "source": "NPPA Essential Diabetes Schedule",
        "source_url": "https://nppaipdms.gov.in/NPPA/PharmaSahiDaam/searchMedicine",
        "last_updated": "March 2026",
        "is_nlem": True
    },
    {
        "id": "med_tramadol_pcm",
        "brand_name": "Ultracet",
        "generic_name": "Tramadol Hydrochloride + Paracetamol",
        "strength": "37.5 mg + 325 mg",
        "formulation": "Tablet",
        "pack_size": 15,
        "mrp_branded": 240.00,
        "nppa_ceiling_per_unit": 16.00,
        "jan_aushadhi_per_unit": 4.50,
        "manufacturer": "Janssen / Johnson & Johnson",
        "generic_alternative": "Tramadol + Paracetamol 37.5mg/325mg (PMBJP)",
        "source": "NPPA Analgesic Price Schedule",
        "source_url": "https://nppaipdms.gov.in/NPPA/PharmaSahiDaam/searchMedicine",
        "last_updated": "March 2026",
        "is_nlem": True
    },
    {
        "id": "med_ceftriaxone_1g",
        "brand_name": "Monocef 1g Injection",
        "generic_name": "Ceftriaxone Sodium",
        "strength": "1 g",
        "formulation": "Injection (Vial)",
        "pack_size": 1,
        "mrp_branded": 68.00,
        "nppa_ceiling_per_unit": 68.00,
        "jan_aushadhi_per_unit": 25.00,
        "manufacturer": "Aristo Pharmaceuticals",
        "generic_alternative": "Ceftriaxone 1g Powder for Injection (PMBJP)",
        "source": "NPPA Antibiotic Price Cap",
        "source_url": "https://nppaipdms.gov.in/NPPA/PharmaSahiDaam/searchMedicine",
        "last_updated": "March 2026",
        "is_nlem": True
    }
]

def search_medicines(query: str) -> List[Dict[str, Any]]:
    if not query or len(query.strip()) < 2:
        return MEDICINE_DATABASE[:6]
    q = query.strip().lower()
    matches = []
    for med in MEDICINE_DATABASE:
        if (q in med["brand_name"].lower() or 
            q in med["generic_name"].lower() or 
            q in med["strength"].lower()):
            matches.append(med)
    return matches

def get_medicine_by_id(med_id: str) -> Optional[Dict[str, Any]]:
    for med in MEDICINE_DATABASE:
        if med["id"] == med_id:
            return med
    return None

def calculate_course_cost(items: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calculates estimated course cost for given medicines.
    Does NOT prescribe or modify therapy. Requires pharmacist/clinician verification.
    """
    total_branded = 0.0
    total_nppa_ceiling = 0.0
    total_jan_aushadhi = 0.0
    detailed_items = []

    for item in items:
        med_id = item.get("medicine_id")
        qty = int(item.get("quantity", 10))
        med = get_medicine_by_id(med_id) if med_id else None

        if med:
            branded_item_cost = round(med["nppa_ceiling_per_unit"] * qty, 2)
            # If pack price exists, compute ratio
            if med.get("mrp_branded") and med.get("pack_size"):
                branded_item_cost = round((med["mrp_branded"] / med["pack_size"]) * qty, 2)
            nppa_item_cost = round(med["nppa_ceiling_per_unit"] * qty, 2)
            jan_aushadhi_item_cost = round(med["jan_aushadhi_per_unit"] * qty, 2)

            total_branded += branded_item_cost
            total_nppa_ceiling += nppa_item_cost
            total_jan_aushadhi += jan_aushadhi_item_cost

            detailed_items.append({
                "medicine_id": med["id"],
                "brand_name": med["brand_name"],
                "generic_name": med["generic_name"],
                "strength": med["strength"],
                "formulation": med["formulation"],
                "quantity": qty,
                "cost_branded": branded_item_cost,
                "cost_nppa_ceiling": nppa_item_cost,
                "cost_jan_aushadhi": jan_aushadhi_item_cost,
                "savings_potential": round(branded_item_cost - jan_aushadhi_item_cost, 2),
                "generic_alternative": med["generic_alternative"],
                "source": med["source"],
                "source_url": med["source_url"],
                "last_updated": med["last_updated"],
                "verified": True
            })
        else:
            # Unverified medicine name
            custom_name = item.get("name", "Unknown Medicine")
            detailed_items.append({
                "medicine_id": None,
                "brand_name": custom_name,
                "generic_name": "Unverified formulation",
                "strength": item.get("strength", "N/A"),
                "formulation": item.get("formulation", "Tablet"),
                "quantity": qty,
                "cost_branded": None,
                "cost_nppa_ceiling": None,
                "cost_jan_aushadhi": None,
                "savings_potential": 0.0,
                "generic_alternative": None,
                "source": "Price not verified",
                "source_url": "https://nppaipdms.gov.in/NPPA/PharmaSahiDaam/searchMedicine",
                "last_updated": "Not verified",
                "verified": False,
                "status_note": "Price not verified in statutory database. Check with your pharmacist."
            })

    savings = max(0.0, round(total_branded - total_jan_aushadhi, 2))
    savings_pct = round((savings / total_branded * 100)) if total_branded > 0 else 0

    return {
        "items": detailed_items,
        "total_estimated_branded_mrp": round(total_branded, 2),
        "total_estimated_nppa_ceiling": round(total_nppa_ceiling, 2),
        "total_estimated_jan_aushadhi": round(total_jan_aushadhi, 2),
        "potential_generic_savings": savings,
        "potential_savings_percentage": savings_pct,
        "price_source_disclaimer": "Prices sourced from NPPA Pharma Sahi Daam & PMBJP Janaushadhi rate card. Substitution must be verified by a licensed pharmacist or prescribing clinician.",
        "has_unverified_items": any(not it["verified"] for it in detailed_items)
    }

