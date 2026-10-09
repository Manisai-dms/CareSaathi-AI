import re
from typing import Optional, List, Dict
from ..models.schemas import NLPParseResponse, Treatment
from ..data.catalogue import normalize_treatment_query, TREATMENT_CATALOGUE
from .telugu_nlp_engine import parse_medical_query_advanced

def parse_user_query(text: str, current_location: Optional[str] = None) -> NLPParseResponse:
    """
    Parses user health query using the advanced multilingual medical NLP engine.
    Supports Telugu, Hindi, English, and code-switching with medical entity extraction,
    clinical disambiguation, and honest uncertainty detection.
    """
    result = parse_medical_query_advanced(text, current_location=current_location)
    return NLPParseResponse(**result)
