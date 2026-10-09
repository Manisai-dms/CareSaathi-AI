import sqlite3
import json
import os
from typing import List, Dict, Optional, Any
from ..config import settings
from .catalogue import TREATMENT_CATALOGUE
from .seed_data import SEED_FACILITIES, SEED_SCHEMES, SEED_COST_OBSERVATIONS
from ..models.schemas import Facility, Treatment, Scheme, CostObservation, CostBreakdown

DB_FILE = settings.DATABASE_PATH

def get_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # Create tables
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS treatments (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        aliases TEXT,
        description TEXT,
        indicative_min INTEGER,
        indicative_max INTEGER,
        package_code_pmjay TEXT,
        package_code_aarogyasri TEXT,
        standard_stay_duration TEXT,
        common_diagnostics_required TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS facilities (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        locality TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        pin_code TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        ownership TEXT NOT NULL,
        phone TEXT,
        website TEXT,
        rating REAL,
        verified_treatments TEXT,
        empanelled_schemes TEXT,
        room_types TEXT,
        last_verified_date TEXT,
        pricing_status TEXT,
        price_confidence TEXT,
        facility_class TEXT DEFAULT 'Standard',
        recommendation_reason TEXT
    )
    """)

    # Ensure schema migrations for existing database
    cursor.execute("PRAGMA table_info(facilities)")
    columns = [row[1] for row in cursor.fetchall()]
    if "facility_class" not in columns:
        cursor.execute("ALTER TABLE facilities ADD COLUMN facility_class TEXT DEFAULT 'Standard'")
    if "recommendation_reason" not in columns:
        cursor.execute("ALTER TABLE facilities ADD COLUMN recommendation_reason TEXT")

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS schemes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        full_name TEXT NOT NULL,
        authority TEXT NOT NULL,
        coverage_limit_inr TEXT NOT NULL,
        eligibility_summary TEXT NOT NULL,
        eligible_categories TEXT,
        states TEXT,
        official_portal TEXT NOT NULL,
        helpline TEXT NOT NULL,
        required_documents TEXT,
        is_active INTEGER DEFAULT 1,
        last_verified_date TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cost_observations (
        id TEXT PRIMARY KEY,
        treatment_id TEXT NOT NULL,
        facility_id TEXT,
        facility_name TEXT,
        city TEXT NOT NULL,
        min_price INTEGER NOT NULL,
        max_price INTEGER NOT NULL,
        currency TEXT DEFAULT 'INR',
        price_type TEXT NOT NULL,
        confidence TEXT NOT NULL,
        confidence_explanation TEXT NOT NULL,
        breakdown TEXT NOT NULL,
        source_name TEXT NOT NULL,
        source_url TEXT,
        last_updated TEXT NOT NULL,
        key_assumptions TEXT,
        exclusions TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_preferences (
        user_key TEXT PRIMARY KEY,
        language TEXT DEFAULT 'en',
        preferred_locality TEXT,
        preferred_ownership TEXT,
        saved_facilities TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        hashed_password TEXT NOT NULL,
        name TEXT NOT NULL,
        language TEXT DEFAULT 'en',
        created_at TEXT NOT NULL
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS saved_comparisons (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        facility_ids TEXT NOT NULL,
        treatment_name TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    """)

    conn.commit()

    # Seed Judge Demo User if not present
    cursor.execute("SELECT id FROM users WHERE email = 'judge.demo@caresaathi.in'")
    if not cursor.fetchone():
        import secrets, hashlib
        demo_salt = secrets.token_hex(16)
        demo_hash = hashlib.pbkdf2_hmac('sha256', b'JudgeDemo2026!', demo_salt.encode('utf-8'), 100000).hex()
        cursor.execute("""
        INSERT INTO users (id, email, hashed_password, name, language, created_at)
        VALUES ('usr_judge_demo', 'judge.demo@caresaathi.in', ?, 'Judge Reviewer', 'en', '2026-03-01T00:00:00Z')
        """, (f"{demo_salt}${demo_hash}",))
        conn.commit()

    # Populate Treatments (Upsert to ensure newly added procedures like diabetes_care, kidney_stones, blood_tests are populated)
    for t in TREATMENT_CATALOGUE.values():
        cursor.execute("""
        INSERT OR REPLACE INTO treatments VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            t.id, t.name, t.category, json.dumps(t.aliases), t.description,
            t.indicative_min, t.indicative_max, t.package_code_pmjay,
            t.package_code_aarogyasri, t.standard_stay_duration,
            json.dumps(t.common_diagnostics_required)
        ))

    # Populate Facilities (Upsert to ensure all genuine facilities are populated)
    for f in SEED_FACILITIES:
        cursor.execute("""
        INSERT OR REPLACE INTO facilities VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f.id, f.name, f.address, f.locality, f.city, f.state, f.pin_code,
            f.lat, f.lng, f.ownership, f.phone, f.website, f.rating,
            json.dumps(f.verified_treatments), json.dumps(f.empanelled_schemes),
            json.dumps(f.room_types), f.last_verified_date, f.pricing_status, f.price_confidence,
            getattr(f, 'facility_class', 'Standard'), getattr(f, 'recommendation_reason', None)
        ))

    # Populate Schemes
    cursor.execute("SELECT COUNT(*) FROM schemes")
    if cursor.fetchone()[0] == 0:
        for s in SEED_SCHEMES:
            cursor.execute("""
            INSERT INTO schemes VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                s.id, s.name, s.full_name, s.authority, s.coverage_limit_inr,
                s.eligibility_summary, json.dumps(s.eligible_categories),
                json.dumps(s.states), s.official_portal, s.helpline,
                json.dumps(s.required_documents), 1 if s.is_active else 0, s.last_verified_date
            ))

    # Populate Cost Observations
    cursor.execute("SELECT COUNT(*) FROM cost_observations")
    if cursor.fetchone()[0] == 0:
        for c in SEED_COST_OBSERVATIONS:
            cursor.execute("""
            INSERT INTO cost_observations VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                c.id, c.treatment_id, c.facility_id, c.facility_name, c.city,
                c.min_price, c.max_price, c.currency, c.price_type, c.confidence,
                c.confidence_explanation, json.dumps(c.breakdown.model_dump()),
                c.source_name, c.source_url, c.last_updated,
                json.dumps(c.key_assumptions), json.dumps(c.exclusions)
            ))

    conn.commit()
    conn.close()

# Database Query Functions
def get_all_treatments() -> List[Treatment]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM treatments ORDER BY name ASC")
    rows = cursor.fetchall()
    treatments = []
    for r in rows:
        treatments.append(Treatment(
            id=r["id"],
            name=r["name"],
            category=r["category"],
            aliases=json.loads(r["aliases"] or "[]"),
            description=r["description"],
            indicative_min=r["indicative_min"],
            indicative_max=r["indicative_max"],
            package_code_pmjay=r["package_code_pmjay"],
            package_code_aarogyasri=r["package_code_aarogyasri"],
            standard_stay_duration=r["standard_stay_duration"],
            common_diagnostics_required=json.loads(r["common_diagnostics_required"] or "[]")
        ))
    conn.close()
    return treatments

def get_treatment_by_id(treatment_id: str) -> Optional[Treatment]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM treatments WHERE id = ?", (treatment_id,))
    r = cursor.fetchone()
    conn.close()
    if not r:
        return None
    return Treatment(
        id=r["id"],
        name=r["name"],
        category=r["category"],
        aliases=json.loads(r["aliases"] or "[]"),
        description=r["description"],
        indicative_min=r["indicative_min"],
        indicative_max=r["indicative_max"],
        package_code_pmjay=r["package_code_pmjay"],
        package_code_aarogyasri=r["package_code_aarogyasri"],
        standard_stay_duration=r["standard_stay_duration"],
        common_diagnostics_required=json.loads(r["common_diagnostics_required"] or "[]")
    )

def get_all_facilities() -> List[Facility]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM facilities ORDER BY name ASC")
    rows = cursor.fetchall()
    facilities = []
    for r in rows:
        col_names = r.keys()
        facilities.append(Facility(
            id=r["id"],
            name=r["name"],
            address=r["address"],
            locality=r["locality"],
            city=r["city"],
            state=r["state"],
            pin_code=r["pin_code"],
            lat=r["lat"],
            lng=r["lng"],
            ownership=r["ownership"],
            facility_class=r["facility_class"] if "facility_class" in col_names and r["facility_class"] else "Standard",
            recommendation_reason=r["recommendation_reason"] if "recommendation_reason" in col_names else None,
            phone=r["phone"],
            website=r["website"],
            rating=r["rating"],
            verified_treatments=json.loads(r["verified_treatments"] or "[]"),
            empanelled_schemes=json.loads(r["empanelled_schemes"] or "[]"),
            room_types=json.loads(r["room_types"] or "{}"),
            last_verified_date=r["last_verified_date"],
            pricing_status=r["pricing_status"],
            price_confidence=r["price_confidence"]
        ))
    conn.close()
    return facilities

def get_facility_by_id(facility_id: str) -> Optional[Facility]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM facilities WHERE id = ?", (facility_id,))
    r = cursor.fetchone()
    conn.close()
    if not r:
        return None
    col_names = r.keys()
    return Facility(
        id=r["id"],
        name=r["name"],
        address=r["address"],
        locality=r["locality"],
        city=r["city"],
        state=r["state"],
        pin_code=r["pin_code"],
        lat=r["lat"],
        lng=r["lng"],
        ownership=r["ownership"],
        facility_class=r["facility_class"] if "facility_class" in col_names and r["facility_class"] else "Standard",
        recommendation_reason=r["recommendation_reason"] if "recommendation_reason" in col_names else None,
        phone=r["phone"],
        website=r["website"],
        rating=r["rating"],
        verified_treatments=json.loads(r["verified_treatments"] or "[]"),
        empanelled_schemes=json.loads(r["empanelled_schemes"] or "[]"),
        room_types=json.loads(r["room_types"] or "{}"),
        last_verified_date=r["last_verified_date"],
        pricing_status=r["pricing_status"],
        price_confidence=r["price_confidence"]
    )

def get_all_schemes() -> List[Scheme]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM schemes WHERE is_active = 1")
    rows = cursor.fetchall()
    schemes = []
    for r in rows:
        schemes.append(Scheme(
            id=r["id"],
            name=r["name"],
            full_name=r["full_name"],
            authority=r["authority"],
            coverage_limit_inr=r["coverage_limit_inr"],
            eligibility_summary=r["eligibility_summary"],
            eligible_categories=json.loads(r["eligible_categories"] or "[]"),
            states=json.loads(r["states"] or "[]"),
            official_portal=r["official_portal"],
            helpline=r["helpline"],
            required_documents=json.loads(r["required_documents"] or "[]"),
            is_active=bool(r["is_active"]),
            last_verified_date=r["last_verified_date"]
        ))
    conn.close()
    return schemes

def get_cost_observations(treatment_id: str, facility_id: Optional[str] = None) -> List[CostObservation]:
    conn = get_connection()
    cursor = conn.cursor()
    if facility_id:
        cursor.execute("SELECT * FROM cost_observations WHERE treatment_id = ? AND facility_id = ?", (treatment_id, facility_id))
    else:
        cursor.execute("SELECT * FROM cost_observations WHERE treatment_id = ?", (treatment_id,))
    rows = cursor.fetchall()
    obs = []
    for r in rows:
        b_dict = json.loads(r["breakdown"])
        obs.append(CostObservation(
            id=r["id"],
            treatment_id=r["treatment_id"],
            facility_id=r["facility_id"],
            facility_name=r["facility_name"],
            city=r["city"],
            min_price=r["min_price"],
            max_price=r["max_price"],
            currency=r["currency"],
            price_type=r["price_type"],
            confidence=r["confidence"],
            confidence_explanation=r["confidence_explanation"],
            breakdown=CostBreakdown(**b_dict),
            source_name=r["source_name"],
            source_url=r["source_url"],
            last_updated=r["last_updated"],
            key_assumptions=json.loads(r["key_assumptions"] or "[]"),
            exclusions=json.loads(r["exclusions"] or "[]")
        ))
    conn.close()
    return obs
