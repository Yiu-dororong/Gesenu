"""
jisho_dict.py — Jisho API Dictionary Lookup Service v1.0
=========================================================

Architecture:
  - Queries Jisho.org REST API for vocabulary definitions, readings, JLPT levels,
    and parts of speech
  - Parses structured dictionary data with graceful fallback if offline/rate-limited

Usage:
  from services.jisho_dict import lookup_word
  info = lookup_word("解せる")
"""

from __future__ import annotations

import logging
from typing import Any

import httpx

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S"
)
log = logging.getLogger(__name__)

JISHO_API_URL = "https://jisho.org/api/v1/search/words"
USER_AGENT = "GesenuVocabularyApp/1.0 (Japanese Context Learning Tool)"


def lookup_word(keyword: str) -> dict[str, Any]:
    """Look up dictionary entry for a keyword via Jisho API.

    Args:
        keyword: Japanese target word or lemma.

    Returns:
        Dict containing lemma, reading, meaning, jlpt_level, and pos.
    """
    if not keyword or not keyword.strip():
        return {
            "lemma": keyword,
            "reading": "",
            "meaning": "No keyword provided",
            "jlpt_level": None,
            "found": False,
        }

    try:
        log.info("Fetching dictionary data from Jisho API for '%s'...", keyword)
        with httpx.Client(timeout=6, headers={"User-Agent": USER_AGENT}) as client:
            response = client.get(JISHO_API_URL, params={"keyword": keyword.strip()})
            response.raise_for_status()
            data = response.json()
            items = data.get("data", [])

            if items and len(items) > 0:
                first_match = items[0]
                japanese_list = first_match.get("japanese", [])
                senses = first_match.get("senses", [])
                jlpt_tags = first_match.get("jlpt", [])

                # Extract primary reading & lemma
                primary_word = keyword
                primary_reading = ""
                if japanese_list:
                    primary_word = japanese_list[0].get("word") or keyword
                    primary_reading = japanese_list[0].get("reading") or ""

                # Extract English definitions
                definitions = []
                pos_tags = []
                for sense in senses[:3]:  # Top 3 senses
                    defs = sense.get("english_definitions", [])
                    pos = sense.get("parts_of_speech", [])
                    if defs:
                        definitions.append("; ".join(defs))
                    if pos:
                        pos_tags.extend(pos)

                meaning_str = (" | ".join(definitions) if definitions
                               else "No definition found")

                # Format JLPT level (e.g. ['jlpt-n1'] -> "N1")
                jlpt_level: str | None = None
                if jlpt_tags:
                    tag = jlpt_tags[0].lower()
                    if "n1" in tag:
                        jlpt_level = "N1"
                    elif "n2" in tag:
                        jlpt_level = "N2"
                    elif "n3" in tag:
                        jlpt_level = "N3"
                    elif "n4" in tag:
                        jlpt_level = "N4"
                    elif "n5" in tag:
                        jlpt_level = "N5"

                log.info("✓ Jisho API returned entry for '%s' (%s)",
                         primary_word, jlpt_level or "No JLPT")
                return {
                    "lemma": primary_word or keyword,
                    "reading": primary_reading,
                    "meaning": meaning_str,
                    "jlpt_level": jlpt_level,
                    "found": True,
                }

    except Exception as e:
        log.warning("⚠️ Jisho API lookup failed for '%s': %s", keyword, e)

    # Fallback response if API fails or word not found in Jisho
    return {
        "lemma": keyword,
        "reading": keyword,
        "meaning": f"Contextual entry for {keyword}",
        "jlpt_level": None,
        "found": False,
    }
