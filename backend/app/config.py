import os

class Settings:
    APP_NAME: str = "CareSaathi AI"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DATABASE_PATH: str = os.getenv("DATABASE_PATH", "caresaathi.db")
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes")
    OVERPASS_API_URL: str = os.getenv("OVERPASS_API_URL", "https://overpass-api.de/api/interpreter")
    NOMINATIM_URL: str = os.getenv("NOMINATIM_URL", "https://nominatim.openstreetmap.org")
    USER_AGENT: str = os.getenv("USER_AGENT", "CareSaathiAI/1.0 (healthcare-navigation-hackathon)")
    CORS_ORIGINS: list[str] = ["*"]

settings = Settings()
