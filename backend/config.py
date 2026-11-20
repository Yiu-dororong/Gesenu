"""
config.py — Gesenu Application Configuration & Constants
"""

import os
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent

try:
    from dotenv import load_dotenv

    load_dotenv(BACKEND_DIR / ".env")
except ImportError:
    pass

APP_VERSION = "1.0.0"
MAX_PARSE_WORD_LIMIT = 200
TRIAL_WORD_QUOTA = 1000

SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_KEY = (
    os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    or os.getenv("SUPABASE_ANON_KEY", "").strip()
)

# Session & Cookie Lifetime Configuration
SECONDS_PER_DAY = 86400  # 60 * 60 * 24
try:
    AUTH_COOKIE_MAX_DAYS = int(os.getenv("AUTH_COOKIE_MAX_DAYS", "7"))
except ValueError:
    AUTH_COOKIE_MAX_DAYS = 7
AUTH_COOKIE_MAX_AGE = SECONDS_PER_DAY * AUTH_COOKIE_MAX_DAYS

try:
    REFRESH_COOKIE_MAX_DAYS = int(os.getenv("REFRESH_COOKIE_MAX_DAYS", "30"))
except ValueError:
    REFRESH_COOKIE_MAX_DAYS = 30
REFRESH_COOKIE_MAX_AGE = SECONDS_PER_DAY * REFRESH_COOKIE_MAX_DAYS

# CORS Configuration
DEFAULT_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
env_origin = os.getenv("ALLOWED_ORIGIN", "").strip()
ALLOWED_ORIGINS = list(DEFAULT_ALLOWED_ORIGINS)
if env_origin:
    for o in env_origin.split(","):
        o_clean = o.strip()
        if o_clean and o_clean not in ALLOWED_ORIGINS:
            ALLOWED_ORIGINS.append(o_clean)

# Standard default deck for signed-in users (guest test decks like work/leisure/life are excluded)
DEFAULT_DECKS_SPEC = [
    {
        "name": "unclassified",
        "jp_label": "未分類",
        "color_slug": "var(--ink-surface)",
        "is_unclassified": True,
    },
]
