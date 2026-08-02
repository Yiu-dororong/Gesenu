"""
sudachi_parser.py — SudachiPy Japanese Morphological Parser v1.0
=================================================================

Architecture:
  - Initializes SudachiPy dictionary & tokenizer (Mode C)
  - Parses Japanese sentences into tokens with surface form, dictionary lemma,
    hiragana reading, and POS classification
  - Filters and flags selectable vocabulary candidate words

Usage:
  from services.sudachi_parser import parse_sentence
  tokens = parse_sentence("複雑な文法構造を分解すれば、解せる。")
"""

from __future__ import annotations

import logging
from typing import Any

from sudachipy import dictionary, tokenizer

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S"
)
log = logging.getLogger(__name__)

# Initialize Sudachi dictionary & tokenizer singleton
try:
    _SUDACHI_DICT = dictionary.Dictionary()
    _TOKENIZER = _SUDACHI_DICT.create()
    _SUDACHI_AVAILABLE = True
    log.info("✓ SudachiPy dictionary initialized successfully.")
except Exception as e:
    _SUDACHI_AVAILABLE = False
    log.warning("⚠️ Failed to initialize SudachiPy: %s", e)

# Parts of speech considered meaningful vocabulary candidates
SELECTABLE_POS_HEADS = {
    "名詞",      # Noun
    "動詞",      # Verb
    "形容詞",    # Adjective (i-adj)
    "形状詞",    # Adjectival Noun (na-adj)
    "副詞",      # Adverb
    "連体詞",    # Pre-noun adjectival
    "感動詞",    # Interjection
}

# Non-content words to exclude even if noun (e.g. formal nouns, symbols)
EXCLUDED_POS_SUBDETAILS = {"非自立可能", "接尾", "数詞"}


def katakana_to_hiragana(katakana_str: str) -> str:
    """Convert Katakana string to Hiragana."""
    if not katakana_str:
        return ""
    result = []
    for char in katakana_str:
        code = ord(char)
        if 0x30A1 <= code <= 0x30F6:
            result.append(chr(code - 0x60))
        else:
            result.append(char)
    return "".join(result)


def parse_sentence(sentence: str) -> list[dict[str, Any]]:
    """Parse a raw Japanese sentence into structured token candidates.

    Args:
        sentence: Raw Japanese text sentence.

    Returns:
        List of dicts representing parsed tokens.
    """
    if not sentence or not sentence.strip():
        return []

    if not _SUDACHI_AVAILABLE:
        log.warning("SudachiPy is unavailable; performing fallback whitespace split.")
        return [
            {
                "surface": word,
                "lemma": word,
                "reading": word,
                "pos": "未知語",
                "pos_detail": "Fallback",
                "is_selectable": True,
            }
            for word in sentence.split()
        ]

    # Tokenize using Mode C (best for phrase/word boundary extraction)
    tokens = _TOKENIZER.tokenize(sentence, tokenizer.Tokenizer.SplitMode.C)
    parsed_result: list[dict[str, Any]] = []

    for token in tokens:
        surface = token.surface()
        lemma = token.normalized_form() or token.dictionary_form() or surface
        reading_kata = token.reading_form()
        reading_hira = katakana_to_hiragana(reading_kata)

        pos_tuple: tuple[str, ...] = token.part_of_speech()
        pos_primary = pos_tuple[0] if len(pos_tuple) > 0 else "その他"
        pos_secondary = pos_tuple[1] if len(pos_tuple) > 1 else "*"

        # Determine if token is a meaningful vocabulary candidate
        is_selectable = (
            pos_primary in SELECTABLE_POS_HEADS
            and pos_secondary not in EXCLUDED_POS_SUBDETAILS
            and len(lemma.strip()) > 0
            and not surface.isnumeric()
        )

        parsed_result.append({
            "surface": surface,
            "lemma": lemma,
            "reading": reading_hira or surface,
            "pos": pos_primary,
            "pos_detail": f"{pos_primary}-{pos_secondary}",
            "is_selectable": is_selectable,
        })

    return parsed_result
