"""
main.py — Gesenu FastAPI Backend Application v1.0.0
===================================================

Architecture:
  - config.py: Configuration, environment variables, cookie & CORS settings
  - models.py: Pydantic request/response schemas (OpenAPI contracts)
  - database.py: Supabase client, SQL data access layer, user decks & sentences
  - services/: NLP morphological analysis (SudachiPy), dictionary (Jisho), Leitner SRS
  - routers/: Modular FastAPI APIRouters (auth, parse, decks, words/reviews)

Usage:
  uvicorn main:app --reload --port 8000
"""

from __future__ import annotations

import logging
import sys
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import ALLOWED_ORIGINS, APP_VERSION
from database import (
    check_user_word_quota,
    get_current_user,
    supabase_client,
)
from models import (
    DeckModel,
    DecksResponse,
    DictLookupResponse,
    HealthCheckStatus,
    ParseSentenceRequest,
    ParseSentenceResponse,
    ReviewResultResponse,
    ReviewSubmission,
    SessionPayload,
    TokenItem,
    WordCard,
    WordCardResponse,
)
from routers import auth, decks, parse, words
from services.jisho_dict import lookup_word
from services.srs import calculate_srs_transition
from services.sudachi_parser import parse_sentence

# Ensure backend directory is in python search path
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# FastAPI Application & Middleware
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Gesenu API",
    description=(
        "Context-First Japanese Vocabulary Learning API with Sudachi & Jisho Engine"
    ),
    version=APP_VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Router Inclusions
# ---------------------------------------------------------------------------
app.include_router(auth.router)
app.include_router(parse.router)
app.include_router(decks.router)
app.include_router(words.router)


# ---------------------------------------------------------------------------
# Health Check Endpoint
# ---------------------------------------------------------------------------
@app.get("/api/health", response_model=HealthCheckStatus, tags=["Health"])
def health_check() -> HealthCheckStatus:
    """Return backend health and Supabase connection status."""
    return HealthCheckStatus(
        status="ok",
        app="Gesenu API",
        version=APP_VERSION,
        supabase_connected=supabase_client is not None,
    )


# ---------------------------------------------------------------------------
# Backward-compatibility re-exports for existing tests & scripts
# ---------------------------------------------------------------------------
__all__ = [
    "app",
    "get_current_user",
    "lookup_word",
    "parse_sentence",
    "check_user_word_quota",
    "calculate_srs_transition",
    "supabase_client",
    "HealthCheckStatus",
    "SessionPayload",
    "TokenItem",
    "ParseSentenceRequest",
    "ParseSentenceResponse",
    "DictLookupResponse",
    "WordCard",
    "WordCardResponse",
    "ReviewSubmission",
    "ReviewResultResponse",
    "DeckModel",
    "DecksResponse",
]

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
