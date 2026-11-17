"""
routers/parse.py — Morphological Sentence Parsing & Jisho Dictionary Lookup
"""

import logging
import sys

from fastapi import APIRouter, HTTPException, Query

from config import MAX_PARSE_WORD_LIMIT
from models import (
    DictLookupResponse,
    ParseSentenceRequest,
    ParseSentenceResponse,
    TokenItem,
)
from services.jisho_dict import lookup_word as default_lookup_word
from services.sudachi_parser import parse_sentence

log = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Parsing"])


def _resolve_lookup_word():
    """Resolve lookup_word dynamically to support test mocking via main.lookup_word."""
    main_mod = sys.modules.get("main")
    if main_mod and hasattr(main_mod, "lookup_word"):
        return getattr(main_mod, "lookup_word")
    return default_lookup_word


@router.post("/parse", response_model=ParseSentenceResponse)
def parse_japanese_sentence(req: ParseSentenceRequest) -> ParseSentenceResponse:
    """Parse a raw Japanese sentence using SudachiPy into tokenized words."""
    log.info("Parsing sentence: '%s'", req.sentence)
    parsed_tokens = parse_sentence(req.sentence)
    if len(parsed_tokens) > MAX_PARSE_WORD_LIMIT:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Sentence exceeds maximum limit of {MAX_PARSE_WORD_LIMIT} words "
                f"({len(parsed_tokens)} parsed tokens). Please shorten the text."
            ),
        )
    candidates = [t for t in parsed_tokens if t["is_selectable"]]

    return ParseSentenceResponse(
        sentence=req.sentence,
        tokens=[TokenItem(**t) for t in parsed_tokens],
        candidate_count=len(candidates),
    )


@router.get("/dict/lookup", response_model=DictLookupResponse, tags=["Dictionary"])
def dictionary_lookup(
    keyword: str = Query(..., description="Target lemma or Japanese word"),
) -> DictLookupResponse:
    """Look up dictionary entry, readings, meanings, and JLPT level via Jisho API."""
    lookup_fn = _resolve_lookup_word()
    info = lookup_fn(keyword)
    return DictLookupResponse(**info)
