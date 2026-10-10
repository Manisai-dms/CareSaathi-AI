from urllib.parse import urlparse
from typing import Optional

OFFICIAL_SCHEME_DOMAINS_ALLOWLIST = [
    "gov.in",
    "nic.in",
    "cmchistn.com",
    "www.cmchistn.com"
]

def is_valid_official_portal_url(url: Optional[str]) -> bool:
    if not url or not isinstance(url, str):
        return False
    try:
        parsed = urlparse(url)
        if parsed.scheme.lower() != "https":
            return False
        hostname = (parsed.hostname or "").lower()
        for domain in OFFICIAL_SCHEME_DOMAINS_ALLOWLIST:
            if domain == "gov.in":
                if hostname == "gov.in" or hostname.endswith(".gov.in"):
                    return True
            elif domain == "nic.in":
                if hostname == "nic.in" or hostname.endswith(".nic.in"):
                    return True
            elif hostname == domain or hostname.endswith("." + domain):
                return True
        return False
    except Exception:
        return False
