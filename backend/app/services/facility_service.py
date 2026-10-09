import math
import requests
from typing import List, Optional, Dict, Any
from ..models.schemas import Facility
from ..data.database import get_all_facilities, get_facility_by_id
from ..data.catalogue import TREATMENT_CATALOGUE
from ..config import settings
from .photo_service import get_hospital_photo_metadata

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Computes great-circle distance between two GPS coordinates in kilometers.
    """
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

def search_facilities(
    user_lat: Optional[float] = None,
    user_lng: Optional[float] = None,
    query_city: Optional[str] = "Hyderabad",
    query_locality: Optional[str] = None,
    pin_code: Optional[str] = None,
    treatment_id: Optional[str] = None,
    ownership_filter: Optional[str] = None,
    scheme_filter: Optional[str] = None,
    sort_by: str = "nearest"  # nearest, lowest_cost, rating
) -> List[Facility]:
    all_facilities = get_all_facilities()
    results: List[Facility] = []

    # Center coordinates fallback if user_lat/lng not provided
    default_lat = 17.4399
    default_lng = 78.4983  # Central Hyderabad

    # Locality coordinate centroids for Hyderabad
    LOCALITY_COORDS = {
        "kukatpally": (17.4938, 78.3995),
        "banjara hills": (17.4156, 78.4487),
        "jubilee hills": (17.4194, 78.4116),
        "gachibowli": (17.4172, 78.3444),
        "hitec city": (17.4486, 78.3754),
        "secunderabad": (17.4399, 78.4806),
        "somajiguda": (17.4262, 78.4593),
        "hyderguda": (17.3941, 78.4831),
        "panjagutta": (17.4227, 78.4526),
        "musheerabad": (17.4243, 78.5032)
    }

    if user_lat is None or user_lng is None:
        if query_locality and query_locality.lower().strip() in LOCALITY_COORDS:
            user_lat, user_lng = LOCALITY_COORDS[query_locality.lower().strip()]
        else:
            user_lat, user_lng = default_lat, default_lng

    treatment_obj = TREATMENT_CATALOGUE.get(treatment_id) if treatment_id else None

    for fac in all_facilities:
        # Locality / City / PIN match
        if pin_code and fac.pin_code != pin_code:
            continue
            
        if query_locality:
            # If locality specified, boost or check
            pass

        # Ownership filter
        if ownership_filter and ownership_filter != "All" and fac.ownership.lower() != ownership_filter.lower():
            continue

        # Scheme filter
        if scheme_filter and scheme_filter != "All":
            if scheme_filter.lower() not in [s.lower() for s in fac.empanelled_schemes]:
                continue

        # Calculate Distance
        fac.distance_km = haversine_distance(user_lat, user_lng, fac.lat, fac.lng)

        # Estimate cost for this facility if treatment specified
        if treatment_obj:
            if fac.ownership == "Government":
                fac.estimated_cost_min = 0
                fac.estimated_cost_max = int(treatment_obj.indicative_min * 0.15)
                fac.price_confidence = "High"
                fac.pricing_status = "Free (Govt / Aarogyasri)"
            elif fac.ownership == "Charitable/Trust":
                fac.estimated_cost_min = int(treatment_obj.indicative_min * 0.65)
                fac.estimated_cost_max = int(treatment_obj.indicative_max * 0.75)
                fac.price_confidence = "High"
                fac.pricing_status = "Subsidized Trust Rate"
            else:
                fac.estimated_cost_min = int(treatment_obj.indicative_min * 1.0)
                fac.estimated_cost_max = int(treatment_obj.indicative_max * 1.15)
                fac.price_confidence = "Medium"
                fac.pricing_status = "Private Reference Range"

        photo_meta = get_hospital_photo_metadata(fac.id, fac.name)
        fac.image_url = photo_meta.get("image_url")
        fac.image_source = photo_meta.get("source")
        fac.image_attribution = photo_meta.get("attribution")
        fac.image_license = photo_meta.get("license")
        fac.initials = photo_meta.get("initials")

        results.append(fac)

    # Sorting
    if sort_by == "nearest":
        results.sort(key=lambda x: x.distance_km if x.distance_km is not None else 9999)
    elif sort_by == "lowest_cost":
        results.sort(key=lambda x: x.estimated_cost_min if x.estimated_cost_min is not None else 9999999)
    elif sort_by == "rating":
        results.sort(key=lambda x: x.rating if x.rating is not None else 0, reverse=True)

    return results

def get_facility_details(facility_id: str, treatment_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    fac = get_facility_by_id(facility_id)
    if not fac:
        return None

    photo_meta = get_hospital_photo_metadata(fac.id, fac.name)
    fac.image_url = photo_meta.get("image_url")
    fac.image_source = photo_meta.get("source")
    fac.image_attribution = photo_meta.get("attribution")
    fac.image_license = photo_meta.get("license")
    fac.initials = photo_meta.get("initials")

    # Check verified treatments
    treatment_verified = False
    treatment_obj = None
    if treatment_id:
        treatment_obj = TREATMENT_CATALOGUE.get(treatment_id)
        if treatment_id in fac.verified_treatments:
            treatment_verified = True

    return {
        "facility": fac,
        "treatment_verified": treatment_verified,
        "treatment_status_text": "Verified Treatment Facility" if treatment_verified else "Treatment availability not verified — contact the facility",
        "treatment_details": treatment_obj,
        "directions_url": f"https://www.google.com/maps/dir/?api=1&destination={fac.lat},{fac.lng}",
        "osm_url": f"https://www.openstreetmap.org/?mlat={fac.lat}&mlon={fac.lng}#map=16/{fac.lat}/{fac.lng}"
    }
