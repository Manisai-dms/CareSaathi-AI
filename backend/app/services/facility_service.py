import math
import requests
from typing import List, Optional, Dict, Any
from ..models.schemas import Facility
from ..data.database import get_all_facilities, get_facility_by_id
from ..data.catalogue import TREATMENT_CATALOGUE
from ..config import settings
from .photo_service import get_hospital_photo_metadata

from ..data.india_geography import resolve_location, LOCATION_REGISTRY

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
    query_city: Optional[str] = None,
    query_locality: Optional[str] = None,
    pin_code: Optional[str] = None,
    treatment_id: Optional[str] = None,
    ownership_filter: Optional[str] = None,
    scheme_filter: Optional[str] = None,
    radius_km: Optional[float] = None,
    sort_by: str = "nearest",  # nearest, lowest_cost, rating
    treatment_available_only: bool = False
) -> List[Facility]:
    all_facilities = get_all_facilities()
    results: List[Facility] = []

    # Resolve coordinates dynamically across India without forcing Hyderabad
    loc_info = resolve_location(
        city=query_city,
        district=query_locality,
        pin_code=pin_code,
        user_lat=user_lat,
        user_lng=user_lng
    )

    if user_lat is None or user_lng is None:
        user_lat = loc_info["lat"]
        user_lng = loc_info["lng"]

    treatment_obj = TREATMENT_CATALOGUE.get(treatment_id) if treatment_id else None

    # Determine if city/state matching should filter initial list
    city_filter_term = query_city.strip().lower() if query_city and query_city.strip().lower() not in ["all", "any", ""] else None

    for fac in all_facilities:
        # PIN code filter if explicitly requested
        if pin_code and pin_code.strip() and fac.pin_code != pin_code.strip():
            # If PIN doesn't match facility exactly, still allow if city matches
            if city_filter_term and city_filter_term not in fac.city.lower():
                continue

        # City / State filter if city parameter is provided and no GPS radius is set
        if city_filter_term and radius_km is None:
            matches_city = (city_filter_term in fac.city.lower() or 
                            fac.city.lower() in city_filter_term or
                            city_filter_term in fac.state.lower())
            if not matches_city:
                continue

        # Ownership / Classification filter
        if ownership_filter and ownership_filter != "All":
            norm_filter = ownership_filter.lower().strip()
            if norm_filter == "premium":
                if fac.facility_class != "Premium":
                    continue
            elif norm_filter == "government":
                if fac.ownership.lower() != "government":
                    continue
            elif norm_filter == "private":
                if fac.ownership.lower() != "private":
                    continue
            elif norm_filter in ["charitable/trust", "trust", "charitable"]:
                if fac.ownership.lower() not in ["charitable/trust", "trust", "charitable"]:
                    continue

        # Treatment availability filter
        if treatment_available_only and treatment_id:
            if treatment_id not in fac.verified_treatments:
                continue

        # Scheme filter
        if scheme_filter and scheme_filter != "All":
            if scheme_filter.lower() not in [s.lower() for s in fac.empanelled_schemes]:
                continue

        # Calculate Distance
        fac.distance_km = haversine_distance(user_lat, user_lng, fac.lat, fac.lng)

        # Distance radius filter
        if radius_km is not None and radius_km > 0 and fac.distance_km > radius_km:
            continue

        # Estimate cost for this facility if treatment specified
        if treatment_obj:
            if fac.ownership == "Government":
                fac.estimated_cost_min = 0
                fac.estimated_cost_max = int(treatment_obj.indicative_min * 0.15) if treatment_obj.indicative_min > 5000 else 100
                fac.price_confidence = "High"
                fac.pricing_status = "Free (Govt / Aarogyasri)"
            elif fac.ownership == "Charitable/Trust":
                fac.estimated_cost_min = int(treatment_obj.indicative_min * 0.50)
                fac.estimated_cost_max = int(treatment_obj.indicative_max * 0.70)
                fac.price_confidence = "High"
                fac.pricing_status = "Subsidized Trust Rate"
            elif fac.facility_class == "Premium":
                fac.estimated_cost_min = int(treatment_obj.indicative_min * 1.30)
                fac.estimated_cost_max = int(treatment_obj.indicative_max * 1.60)
                fac.price_confidence = "Medium"
                fac.pricing_status = "Premium Quaternary Tariff"
            else:
                fac.estimated_cost_min = int(treatment_obj.indicative_min * 0.90)
                fac.estimated_cost_max = int(treatment_obj.indicative_max * 1.05)
                fac.price_confidence = "Medium"
                fac.pricing_status = "Private Reference Range"

        # Ensure recommendation reason is clear and transparent
        if not fac.recommendation_reason:
            reason_parts = []
            if fac.ownership == "Government":
                reason_parts.append("State teaching hospital with 100% cashless public scheme coverage.")
            elif fac.facility_class == "Premium":
                reason_parts.append("Quaternary JCI/NABH accredited center with advanced robotic surgical suites.")
            elif fac.ownership == "Charitable/Trust":
                reason_parts.append("Subsidized non-profit healthcare trust with compassionate tariff aid.")
            else:
                reason_parts.append("NABH-accredited private multi-specialty hospital with comprehensive inpatient care.")
            if treatment_id and treatment_id in fac.verified_treatments:
                reason_parts.append("Verified clinical department available.")
            if fac.distance_km is not None and fac.distance_km <= 10:
                reason_parts.append(f"Conveniently located {fac.distance_km} km away.")
            fac.recommendation_reason = " ".join(reason_parts)

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
