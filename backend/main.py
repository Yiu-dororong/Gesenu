"""
main.py — Gesenu FastAPI Backend Application v0.2.0
===================================================

Architecture:
  - Sentence parsing via SudachiPy morphological analysis
  - Live dictionary enrichment via Jisho API
  - Supabase PostgreSQL storage for saved vocabulary cards
  - OpenAPI contract exporter for TypeScript client generation

Usage:
  uvicorn main:app --reload --port 8000
"""

from __future__ import annotations

import logging
import os
import sys
from typing import List, Optional
from pathlib import Path

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Ensure backend directory is in python search path
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

try:
    from dotenv import load_dotenv
    load_dotenv(BACKEND_DIR / ".env")
except ImportError:
    pass

# Import NLP & Dictionary services
from services.sudachi_parser import parse_sentence
from services.jisho_dict import lookup_word

# Supabase imports
try:
    from supabase import Client, create_client
    HAS_SUPABASE = True
except ImportError:
    HAS_SUPABASE = False

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S"
)
log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# SECTION 0 — Config & Constants
# ---------------------------------------------------------------------------
APP_VERSION = "0.2.0"
SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip() or os.getenv("SUPABASE_ANON_KEY", "").strip()

supabase_client: Optional[Client] = None
if HAS_SUPABASE and SUPABASE_URL and SUPABASE_KEY and "your_supabase_url" not in SUPABASE_URL:
    try:
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        log.info("✓ Connected to Supabase client in FastAPI")
    except Exception as e:
        log.warning("⚠️ Failed to initialize Supabase client: %s", e)

# ---------------------------------------------------------------------------
# SECTION 1 — Data Models (OpenAPI Contracts)
# ---------------------------------------------------------------------------
class HealthCheckStatus(BaseModel):
    status: str = Field(..., example="ok")
    app: str = Field(..., example="Gesenu API")
    version: str = Field(..., example="0.2.0")
    supabase_connected: bool = Field(..., example=True)


class TokenItem(BaseModel):
    surface: str = Field(..., example="走った")
    lemma: str = Field(..., example="走る")
    reading: str = Field(..., example="はしる")
    pos: str = Field(..., example="動詞")
    pos_detail: str = Field(..., example="動詞-一般")
    is_selectable: bool = Field(..., example=True)


class ParseSentenceRequest(BaseModel):
    sentence: str = Field(..., example="複雑な文法構造を分解すれば、どんな難文でも解せるようになる。")


class ParseSentenceResponse(BaseModel):
    sentence: str
    tokens: List[TokenItem]
    candidate_count: int


class DictLookupResponse(BaseModel):
    lemma: str = Field(..., example="解せる")
    reading: str = Field(..., example="かいせる")
    meaning: str = Field(..., example="to understand; to comprehend")
    jlpt_level: Optional[str] = Field(None, example="N1")
    found: bool = Field(..., example=True)


class WordCard(BaseModel):
    id: Optional[str] = Field(None, example="123e4567-e89b-12d3-a456-426614174000")
    lemma: str = Field(..., example="解せる")
    reading: str = Field(..., example="かいせる")
    meaning: str = Field(..., example="to make sense of; comprehend")
    jlpt_level: Optional[str] = Field(None, example="N1")
    context_sentence: str = Field(..., example="複雑な文法構造を分解すれば、どんな難文でも解せるようになる。")
    status: str = Field("New", example="Learning")


class WordCardResponse(BaseModel):
    words: List[WordCard]
    source: str = Field(..., example="supabase")
    message: str = Field(..., example="Fetched successfully")


# Memory fallback storage
FALLBACK_WORDS: List[WordCard] = [
    WordCard(
        id="sample-1",
        lemma="解せる",
        reading="かいせる",
        meaning="to be understandable; to make sense of; to comprehend",
        jlpt_level="N1",
        context_sentence="複雑な文法構造を分解すれば、どんな難文でも解せるようになる。",
        status="Learning"
    ),
    WordCard(
        id="sample-2",
        lemma="解せぬ",
        reading="げせぬ",
        meaning="incomprehensible; I don't get it; doesn't make sense",
        jlpt_level="N1",
        context_sentence="なぜ彼が急に辞職したのか、理由がどうしても解せぬ。",
        status="New"
    )
]

# ---------------------------------------------------------------------------
# SECTION 2 — FastAPI App & Routes
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Gesenu API",
    description="Context-First Japanese Vocabulary Learning API with Sudachi & Jisho Engine",
    version=APP_VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthCheckStatus, tags=["Health"])
def health_check() -> HealthCheckStatus:
    """Return backend health and Supabase connection status."""
    return HealthCheckStatus(
        status="ok",
        app="Gesenu API",
        version=APP_VERSION,
        supabase_connected=supabase_client is not None,
    )


@app.post("/api/parse", response_model=ParseSentenceResponse, tags=["Parsing"])
def parse_japanese_sentence(req: ParseSentenceRequest) -> ParseSentenceResponse:
    """Parse a raw Japanese sentence using SudachiPy into tokenized words."""
    log.info("Parsing sentence: '%s'", req.sentence)
    parsed_tokens = parse_sentence(req.sentence)
    candidates = [t for t in parsed_tokens if t["is_selectable"]]
    
    return ParseSentenceResponse(
        sentence=req.sentence,
        tokens=[TokenItem(**t) for t in parsed_tokens],
        candidate_count=len(candidates)
    )


@app.get("/api/dict/lookup", response_model=DictLookupResponse, tags=["Dictionary"])
def dictionary_lookup(keyword: str = Query(..., description="Target lemma or Japanese word")) -> DictLookupResponse:
    """Look up dictionary entry, readings, meanings, and JLPT level via Jisho API."""
    info = lookup_word(keyword)
    return DictLookupResponse(**info)


@app.get("/api/test-words", response_model=WordCardResponse, tags=["Vocabulary"])
@app.get("/api/words", response_model=WordCardResponse, tags=["Vocabulary"])
def get_words() -> WordCardResponse:
    """Fetch Japanese vocabulary cards from Supabase PostgreSQL. Only falls back when server fails."""
    if supabase_client is not None:
        try:
            res = supabase_client.table("test_words").select("*").execute()
            words = [WordCard(**row) for row in res.data]
            return WordCardResponse(
                words=words,
                source="supabase",
                message=f"Successfully fetched {len(words)} cards live from Supabase PostgreSQL!"
            )
        except Exception as e:
            log.error("❌ Supabase query failed (%s). Using fallback dataset.", e)
            return WordCardResponse(
                words=FALLBACK_WORDS,
                source="fallback_on_server_failure",
                message=f"Server/Database Query Failed ({type(e).__name__}). Using fallback sample words."
            )

    log.error("❌ Supabase client is not initialized. Using fallback dataset.")
    return WordCardResponse(
        words=FALLBACK_WORDS,
        source="fallback_on_server_failure",
        message="Supabase client uninitialized. Using fallback sample words."
    )


@app.post("/api/test-words", response_model=WordCard, tags=["Vocabulary"])
@app.post("/api/words", response_model=WordCard, tags=["Vocabulary"])
def create_word(word: WordCard) -> WordCard:
    """Create and save a new word card in Supabase PostgreSQL."""
    if supabase_client is not None:
        try:
            payload = word.dict(exclude={"id"})
            res = supabase_client.table("test_words").insert(payload).execute()
            if res.data and len(res.data) > 0:
                log.info("✓ Inserted word '%s' into Supabase PostgreSQL", word.lemma)
                return WordCard(**res.data[0])
        except Exception as e:
            log.error("Failed to insert word into Supabase: %s", e)

    word.id = f"local-{len(FALLBACK_WORDS) + 1}"
    FALLBACK_WORDS.append(word)
    return word


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
