"""
CareSaathi AI - Master Pan-India Geographic and Administrative Registry
Supports all 28 States, 8 Union Territories, major districts, PIN code validation,
and healthcare pricing tier classifications (Tier 1 Metros, Tier 2 Cities, Tier 3 Rural).
"""

from typing import Dict, List, Optional, Tuple, Any

# All 28 States and 8 Union Territories
INDIAN_STATES_AND_UTS: List[Dict[str, str]] = [
    # 28 States
    {"code": "AP", "name": "Andhra Pradesh", "type": "State", "capital": "Amaravati"},
    {"code": "AR", "name": "Arunachal Pradesh", "type": "State", "capital": "Itanagar"},
    {"code": "AS", "name": "Assam", "type": "State", "capital": "Dispur"},
    {"code": "BR", "name": "Bihar", "type": "State", "capital": "Patna"},
    {"code": "CG", "name": "Chhattisgarh", "type": "State", "capital": "Raipur"},
    {"code": "GA", "name": "Goa", "type": "State", "capital": "Panaji"},
    {"code": "GJ", "name": "Gujarat", "type": "State", "capital": "Gandhinagar"},
    {"code": "HR", "name": "Haryana", "type": "State", "capital": "Chandigarh"},
    {"code": "HP", "name": "Himachal Pradesh", "type": "State", "capital": "Shimla"},
    {"code": "JH", "name": "Jharkhand", "type": "State", "capital": "Ranchi"},
    {"code": "KA", "name": "Karnataka", "type": "State", "capital": "Bengaluru"},
    {"code": "KL", "name": "Kerala", "type": "State", "capital": "Thiruvananthapuram"},
    {"code": "MP", "name": "Madhya Pradesh", "type": "State", "capital": "Bhopal"},
    {"code": "MH", "name": "Maharashtra", "type": "State", "capital": "Mumbai"},
    {"code": "MN", "name": "Manipur", "type": "State", "capital": "Imphal"},
    {"code": "ML", "name": "Meghalaya", "type": "State", "capital": "Shillong"},
    {"code": "MZ", "name": "Mizoram", "type": "State", "capital": "Aizawl"},
    {"code": "NL", "name": "Nagaland", "type": "State", "capital": "Kohima"},
    {"code": "OD", "name": "Odisha", "type": "State", "capital": "Bhubaneswar"},
    {"code": "PB", "name": "Punjab", "type": "State", "capital": "Chandigarh"},
    {"code": "RJ", "name": "Rajasthan", "type": "State", "capital": "Jaipur"},
    {"code": "SK", "name": "Sikkim", "type": "State", "capital": "Gangtok"},
    {"code": "TN", "name": "Tamil Nadu", "type": "State", "capital": "Chennai"},
    {"code": "TS", "name": "Telangana", "type": "State", "capital": "Hyderabad"},
    {"code": "TR", "name": "Tripura", "type": "State", "capital": "Agartala"},
    {"code": "UP", "name": "Uttar Pradesh", "type": "State", "capital": "Lucknow"},
    {"code": "UK", "name": "Uttarakhand", "type": "State", "capital": "Dehradun"},
    {"code": "WB", "name": "West Bengal", "type": "State", "capital": "Kolkata"},
    # 8 Union Territories
    {"code": "AN", "name": "Andaman and Nicobar Islands", "type": "UT", "capital": "Port Blair"},
    {"code": "CH", "name": "Chandigarh", "type": "UT", "capital": "Chandigarh"},
    {"code": "DH", "name": "Dadra and Nagar Haveli and Daman and Diu", "type": "UT", "capital": "Daman"},
    {"code": "DL", "name": "Delhi", "type": "UT", "capital": "New Delhi"},
    {"code": "JK", "name": "Jammu and Kashmir", "type": "UT", "capital": "Srinagar"},
    {"code": "LA", "name": "Ladakh", "type": "UT", "capital": "Leh"},
    {"code": "LD", "name": "Lakshadweep", "type": "UT", "capital": "Kavaratti"},
    {"code": "PY", "name": "Puducherry", "type": "UT", "capital": "Puducherry"},
]

# Canonical Major Location Centroids & Healthcare Tiers
# Tier 1 = Metros (Cost factor 1.0)
# Tier 2 = Major Urban Centers (Cost factor ~0.85)
# Tier 3 = Semi-Urban / Rural Districts (Cost factor ~0.70)
LOCATION_REGISTRY: Dict[str, Dict[str, Any]] = {
    # Tier 1 Metros
    "hyderabad": {
        "city": "Hyderabad",
        "district": "Hyderabad",
        "state": "Telangana",
        "lat": 17.3850,
        "lng": 78.4867,
        "tier": "Tier 1",
        "cost_multiplier": 1.0,
        "pin_prefixes": ["500", "501"],
        "cghs_zone": "Hyderabad"
    },
    "mumbai": {
        "city": "Mumbai",
        "district": "Mumbai City",
        "state": "Maharashtra",
        "lat": 18.9220,
        "lng": 72.8346,
        "tier": "Tier 1",
        "cost_multiplier": 1.08,
        "pin_prefixes": ["400"],
        "cghs_zone": "Mumbai"
    },
    "bengaluru": {
        "city": "Bengaluru",
        "district": "Bengaluru Urban",
        "state": "Karnataka",
        "lat": 12.9716,
        "lng": 77.5946,
        "tier": "Tier 1",
        "cost_multiplier": 1.02,
        "pin_prefixes": ["560"],
        "cghs_zone": "Bengaluru"
    },
    "delhi": {
        "city": "New Delhi",
        "district": "New Delhi",
        "state": "Delhi",
        "lat": 28.6139,
        "lng": 77.2090,
        "tier": "Tier 1",
        "cost_multiplier": 1.05,
        "pin_prefixes": ["110"],
        "cghs_zone": "Delhi"
    },
    "new delhi": {
        "city": "New Delhi",
        "district": "New Delhi",
        "state": "Delhi",
        "lat": 28.6139,
        "lng": 77.2090,
        "tier": "Tier 1",
        "cost_multiplier": 1.05,
        "pin_prefixes": ["110"],
        "cghs_zone": "Delhi"
    },
    "chennai": {
        "city": "Chennai",
        "district": "Chennai",
        "state": "Tamil Nadu",
        "lat": 13.0827,
        "lng": 80.2707,
        "tier": "Tier 1",
        "cost_multiplier": 0.98,
        "pin_prefixes": ["600"],
        "cghs_zone": "Chennai"
    },
    "kolkata": {
        "city": "Kolkata",
        "district": "Kolkata",
        "state": "West Bengal",
        "lat": 22.5726,
        "lng": 88.3639,
        "tier": "Tier 1",
        "cost_multiplier": 0.95,
        "pin_prefixes": ["700"],
        "cghs_zone": "Kolkata"
    },

    # Tier 2 Major Cities
    "pune": {
        "city": "Pune",
        "district": "Pune",
        "state": "Maharashtra",
        "lat": 18.5204,
        "lng": 73.8567,
        "tier": "Tier 2",
        "cost_multiplier": 0.88,
        "pin_prefixes": ["411", "412"],
        "cghs_zone": "Pune"
    },
    "ahmedabad": {
        "city": "Ahmedabad",
        "district": "Ahmedabad",
        "state": "Gujarat",
        "lat": 23.0225,
        "lng": 72.5714,
        "tier": "Tier 2",
        "cost_multiplier": 0.85,
        "pin_prefixes": ["380"],
        "cghs_zone": "Ahmedabad"
    },
    "jaipur": {
        "city": "Jaipur",
        "district": "Jaipur",
        "state": "Rajasthan",
        "lat": 26.9124,
        "lng": 75.7873,
        "tier": "Tier 2",
        "cost_multiplier": 0.82,
        "pin_prefixes": ["302"],
        "cghs_zone": "Jaipur"
    },
    "lucknow": {
        "city": "Lucknow",
        "district": "Lucknow",
        "state": "Uttar Pradesh",
        "lat": 26.8467,
        "lng": 80.9462,
        "tier": "Tier 2",
        "cost_multiplier": 0.82,
        "pin_prefixes": ["226"],
        "cghs_zone": "Lucknow"
    },
    "patna": {
        "city": "Patna",
        "district": "Patna",
        "state": "Bihar",
        "lat": 25.5941,
        "lng": 85.1376,
        "tier": "Tier 2",
        "cost_multiplier": 0.80,
        "pin_prefixes": ["800"],
        "cghs_zone": "Patna"
    },
    "visakhapatnam": {
        "city": "Visakhapatnam",
        "district": "Visakhapatnam",
        "state": "Andhra Pradesh",
        "lat": 17.6868,
        "lng": 83.2185,
        "tier": "Tier 2",
        "cost_multiplier": 0.84,
        "pin_prefixes": ["530"],
        "cghs_zone": "Visakhapatnam"
    },
    "kochi": {
        "city": "Kochi",
        "district": "Ernakulam",
        "state": "Kerala",
        "lat": 9.9312,
        "lng": 76.2673,
        "tier": "Tier 2",
        "cost_multiplier": 0.87,
        "pin_prefixes": ["682"],
        "cghs_zone": "Thiruvananthapuram"
    },
    "chandigarh": {
        "city": "Chandigarh",
        "district": "Chandigarh",
        "state": "Chandigarh",
        "lat": 30.7333,
        "lng": 76.7794,
        "tier": "Tier 2",
        "cost_multiplier": 0.90,
        "pin_prefixes": ["160"],
        "cghs_zone": "Chandigarh"
    },

    # Tier 3 Semi-Urban / Rural Districts & Village Benchmarks
    "barabanki": {
        "city": "Barabanki",
        "district": "Barabanki",
        "state": "Uttar Pradesh",
        "lat": 26.9274,
        "lng": 81.1850,
        "tier": "Tier 3 / Rural",
        "cost_multiplier": 0.68,
        "pin_prefixes": ["225"],
        "cghs_zone": "Lucknow"
    },
    "ralegan siddhi": {
        "city": "Ralegan Siddhi",
        "district": "Ahmednagar",
        "state": "Maharashtra",
        "lat": 18.9189,
        "lng": 74.4094,
        "tier": "Tier 3 / Rural",
        "cost_multiplier": 0.65,
        "pin_prefixes": ["414"],
        "cghs_zone": "Pune"
    },
    "ahmednagar": {
        "city": "Ahmednagar",
        "district": "Ahmednagar",
        "state": "Maharashtra",
        "lat": 19.0952,
        "lng": 74.7496,
        "tier": "Tier 3 / Rural",
        "cost_multiplier": 0.72,
        "pin_prefixes": ["414"],
        "cghs_zone": "Pune"
    },
    "warangal": {
        "city": "Warangal",
        "district": "Warangal",
        "state": "Telangana",
        "lat": 17.9689,
        "lng": 79.5941,
        "tier": "Tier 2",
        "cost_multiplier": 0.78,
        "pin_prefixes": ["506"],
        "cghs_zone": "Hyderabad"
    },
    "mysuru": {
        "city": "Mysuru",
        "district": "Mysuru",
        "state": "Karnataka",
        "lat": 12.2958,
        "lng": 76.6394,
        "tier": "Tier 2",
        "cost_multiplier": 0.82,
        "pin_prefixes": ["570"],
        "cghs_zone": "Bengaluru"
    }
}

# State Centroid Fallbacks
STATE_CENTROIDS: Dict[str, Tuple[float, float]] = {
    "andhra pradesh": (15.9129, 79.7400),
    "arunachal pradesh": (28.2180, 94.7278),
    "assam": (26.2006, 92.9376),
    "bihar": (25.0961, 85.3131),
    "chhattisgarh": (21.2787, 81.8661),
    "goa": (15.2993, 74.1240),
    "gujarat": (22.2587, 71.1924),
    "haryana": (29.0588, 76.0856),
    "himachal pradesh": (31.1048, 77.1734),
    "jharkhand": (23.6102, 85.2799),
    "karnataka": (15.3173, 75.7139),
    "kerala": (10.8505, 76.2711),
    "madhya pradesh": (22.9734, 78.6569),
    "maharashtra": (19.7515, 75.7139),
    "manipur": (24.6637, 93.9063),
    "meghalaya": (25.4670, 91.3662),
    "mizoram": (23.1645, 92.9376),
    "nagaland": (26.1584, 94.5624),
    "odisha": (20.9517, 85.0985),
    "punjab": (31.1471, 75.3412),
    "rajasthan": (27.0238, 74.2179),
    "sikkim": (27.5330, 88.5122),
    "tamil nadu": (11.1271, 78.6569),
    "telangana": (18.1124, 79.0193),
    "tripura": (23.9408, 91.9882),
    "uttar pradesh": (26.8467, 80.9462),
    "uttarakhand": (30.0668, 79.0193),
    "west bengal": (22.9868, 87.8550),
    "delhi": (28.6139, 77.2090),
    "chandigarh": (30.7333, 76.7794),
    "jammu and kashmir": (33.7782, 76.5762),
    "ladakh": (34.1526, 77.5771),
    "puducherry": (11.9416, 79.8083),
}

# PIN Code Prefix to State Mapping (First 2 digits of Indian 6-digit PIN)
PIN_PREFIX_MAP: Dict[str, Tuple[str, str, float, float]] = {
    # Prefix: (State, Primary City, Lat, Lng)
    "11": ("Delhi", "New Delhi", 28.6139, 77.2090),
    "12": ("Haryana", "Gurugram / Faridabad", 28.4595, 77.0266),
    "13": ("Haryana", "Ambala / Karnal", 30.3782, 76.7767),
    "14": ("Punjab", "Ludhiana / Jalandhar", 30.9010, 75.8573),
    "15": ("Punjab", "Bathinda / Firozpur", 30.2110, 74.9455),
    "16": ("Chandigarh", "Chandigarh", 30.7333, 76.7794),
    "17": ("Himachal Pradesh", "Shimla", 31.1048, 77.1734),
    "18": ("Jammu and Kashmir", "Jammu", 32.7266, 74.8570),
    "19": ("Jammu and Kashmir", "Srinagar", 34.0837, 74.7973),
    "20": ("Uttar Pradesh", "Ghaziabad / Aligarh", 28.6692, 77.4538),
    "21": ("Uttar Pradesh", "Prayagraj", 25.4358, 81.8463),
    "22": ("Uttar Pradesh", "Barabanki / Lucknow", 26.9274, 81.1850),
    "24": ("Uttarakhand", "Dehradun", 30.3165, 78.0322),
    "25": ("Uttar Pradesh", "Meerut", 28.9845, 77.7064),
    "26": ("Uttarakhand", "Haldwani / Nainital", 29.2183, 79.5130),
    "27": ("Uttar Pradesh", "Gorakhpur", 26.7606, 83.3732),
    "28": ("Uttar Pradesh", "Agra / Jhansi", 27.1767, 78.0081),
    "30": ("Rajasthan", "Jaipur", 26.9124, 75.7873),
    "31": ("Rajasthan", "Udaipur / Kota", 24.5854, 73.7125),
    "32": ("Rajasthan", "Bharatpur / Sawai Madhopur", 27.2152, 77.5030),
    "34": ("Rajasthan", "Jodhpur", 26.2389, 73.0243),
    "36": ("Gujarat", "Rajkot / Jamnagar", 22.3039, 70.8022),
    "38": ("Gujarat", "Ahmedabad", 23.0225, 72.5714),
    "39": ("Gujarat", "Surat / Vadodara", 21.1702, 72.8311),
    "40": ("Maharashtra", "Mumbai / Goa", 18.9220, 72.8346),
    "41": ("Maharashtra", "Pune / Ahmednagar", 18.5204, 73.8567),
    "42": ("Maharashtra", "Nashik / Jalgaon", 19.9975, 73.7898),
    "43": ("Maharashtra", "Chhatrapati Sambhajinagar", 19.8762, 75.3433),
    "44": ("Maharashtra", "Nagpur / Amravati", 21.1458, 79.0882),
    "45": ("Madhya Pradesh", "Indore", 22.7196, 75.8577),
    "46": ("Madhya Pradesh", "Bhopal", 23.2599, 77.4126),
    "47": ("Madhya Pradesh", "Gwalior", 26.2183, 78.1828),
    "48": ("Madhya Pradesh", "Jabalpur", 23.1815, 79.9864),
    "49": ("Chhattisgarh", "Raipur", 21.2514, 81.6296),
    "50": ("Telangana", "Hyderabad", 17.3850, 78.4867),
    "51": ("Andhra Pradesh", "Tirupati / Kadapa", 13.6288, 79.4192),
    "52": ("Andhra Pradesh", "Vijayawada / Guntur", 16.5062, 80.6480),
    "53": ("Andhra Pradesh", "Visakhapatnam", 17.6868, 83.2185),
    "56": ("Karnataka", "Bengaluru", 12.9716, 77.5946),
    "57": ("Karnataka", "Mysuru / Mangaluru", 12.2958, 76.6394),
    "58": ("Karnataka", "Hubballi / Belagavi", 15.3647, 75.1240),
    "60": ("Tamil Nadu", "Chennai", 13.0827, 80.2707),
    "62": ("Tamil Nadu", "Madurai / Tiruchirappalli", 9.9252, 78.1198),
    "64": ("Tamil Nadu", "Coimbatore", 11.0168, 76.9558),
    "67": ("Kerala", "Kozhikode / Kannur", 11.2588, 75.7804),
    "68": ("Kerala", "Kochi / Ernakulam", 9.9312, 76.2673),
    "69": ("Kerala", "Thiruvananthapuram", 8.5241, 76.9366),
    "70": ("West Bengal", "Kolkata", 22.5726, 88.3639),
    "71": ("West Bengal", "Howrah / Hooghly", 22.5958, 88.2636),
    "72": ("West Bengal", "Medinipur", 22.4257, 87.3199),
    "73": ("West Bengal", "Siliguri / Darjeeling", 26.7271, 88.3953),
    "75": ("Odisha", "Bhubaneswar / Cuttack", 20.2961, 85.8245),
    "78": ("Assam", "Guwahati", 26.1445, 91.7362),
    "80": ("Bihar", "Patna", 25.5941, 85.1376),
    "81": ("Bihar", "Gaya / Bhagalpur", 24.7914, 85.0002),
    "82": ("Jharkhand", "Dhanbad / Bokaro", 23.7957, 86.4304),
    "83": ("Jharkhand", "Ranchi / Jamshedpur", 23.3441, 85.3096),
}

def resolve_location(
    city: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    pin_code: Optional[str] = None,
    user_lat: Optional[float] = None,
    user_lng: Optional[float] = None
) -> Dict[str, Any]:
    """
    Resolves input location criteria to structured Pan-India coordinates,
    district, state, and healthcare pricing tier. Never forces Hyderabad.
    """
    # 1. Exact GPS coordinates passed
    if user_lat is not None and user_lng is not None:
        closest_loc = None
        min_dist = float("inf")
        for key, info in LOCATION_REGISTRY.items():
            dist = (info["lat"] - user_lat)**2 + (info["lng"] - user_lng)**2
            if dist < min_dist:
                min_dist = dist
                closest_loc = info

        return {
            "lat": user_lat,
            "lng": user_lng,
            "city": city or (closest_loc["city"] if closest_loc else "Custom Location"),
            "district": district or (closest_loc["district"] if closest_loc else ""),
            "state": state or (closest_loc["state"] if closest_loc else ""),
            "tier": closest_loc["tier"] if closest_loc else "Tier 2",
            "cost_multiplier": closest_loc["cost_multiplier"] if closest_loc else 0.85,
            "cghs_zone": closest_loc["cghs_zone"] if closest_loc else "Pan-India",
            "source": "gps_coordinates"
        }

    # 2. Check PIN Code prefix (6-digit Indian PIN)
    if pin_code and pin_code.strip():
        pin_clean = pin_code.strip()
        if len(pin_clean) == 6 and pin_clean.isdigit():
            prefix = pin_clean[:2]
            if prefix in PIN_PREFIX_MAP:
                st, ct, lat, lng = PIN_PREFIX_MAP[prefix]
                
                # Check if matches specific known registry entry (e.g. 225001 -> Barabanki)
                tier = "Tier 2"
                cost_mult = 0.85
                cghs_zone = "Pan-India"
                resolved_city = ct
                resolved_district = ct

                # Check Barabanki specifically (225xxx)
                if pin_clean.startswith("225"):
                    resolved_city = "Barabanki"
                    resolved_district = "Barabanki"
                    lat, lng = 26.9274, 81.1850
                    tier = "Tier 3 / Rural"
                    cost_mult = 0.68
                    cghs_zone = "Lucknow"
                elif pin_clean.startswith("414"):
                    resolved_city = "Ralegan Siddhi / Ahmednagar"
                    resolved_district = "Ahmednagar"
                    lat, lng = 18.9189, 74.4094
                    tier = "Tier 3 / Rural"
                    cost_mult = 0.65
                    cghs_zone = "Pune"

                return {
                    "lat": lat,
                    "lng": lng,
                    "city": city or resolved_city,
                    "district": district or resolved_district,
                    "state": state or st,
                    "pin_code": pin_clean,
                    "tier": tier,
                    "cost_multiplier": cost_mult,
                    "cghs_zone": cghs_zone,
                    "source": "pin_code_lookup"
                }

    # 3. Check City against LOCATION_REGISTRY
    if city and city.strip():
        city_lower = city.strip().lower()
        if city_lower in LOCATION_REGISTRY:
            reg = LOCATION_REGISTRY[city_lower]
            return {
                "lat": reg["lat"],
                "lng": reg["lng"],
                "city": reg["city"],
                "district": reg["district"],
                "state": reg["state"],
                "tier": reg["tier"],
                "cost_multiplier": reg["cost_multiplier"],
                "cghs_zone": reg["cghs_zone"],
                "source": "city_registry"
            }

        # Partial match
        for key, reg in LOCATION_REGISTRY.items():
            if key in city_lower or city_lower in key:
                return {
                    "lat": reg["lat"],
                    "lng": reg["lng"],
                    "city": reg["city"],
                    "district": reg["district"],
                    "state": reg["state"],
                    "tier": reg["tier"],
                    "cost_multiplier": reg["cost_multiplier"],
                    "cghs_zone": reg["cghs_zone"],
                    "source": "city_partial_match"
                }

    # 4. Check State against STATE_CENTROIDS
    if state and state.strip():
        st_lower = state.strip().lower()
        if st_lower in STATE_CENTROIDS:
            lat, lng = STATE_CENTROIDS[st_lower]
            # Match state name casing from list
            canonical_state = next((s["name"] for s in INDIAN_STATES_AND_UTS if s["name"].lower() == st_lower), state)
            capital = next((s["capital"] for s in INDIAN_STATES_AND_UTS if s["name"].lower() == st_lower), city or "")
            return {
                "lat": lat,
                "lng": lng,
                "city": city or capital,
                "district": district or "",
                "state": canonical_state,
                "tier": "Tier 2",
                "cost_multiplier": 0.85,
                "cghs_zone": capital,
                "source": "state_centroid"
            }

    # 5. Default fallback: Neutral Pan-India default (Delhi / National Center)
    # Never unconditionally force Hyderabad!
    return {
        "lat": 28.6139,
        "lng": 77.2090,
        "city": "New Delhi",
        "district": "New Delhi",
        "state": "Delhi",
        "tier": "Tier 1",
        "cost_multiplier": 1.05,
        "cghs_zone": "Delhi",
        "source": "national_capital_fallback"
    }
