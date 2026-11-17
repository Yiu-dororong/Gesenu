"""
database.py — Supabase PostgreSQL Connection & Data Access Layer
"""

from __future__ import annotations

import logging
import uuid
from typing import TYPE_CHECKING

from fastapi import HTTPException, status

from auth import make_auth_dependency
from config import DEFAULT_DECKS_SPEC, SUPABASE_KEY, SUPABASE_URL, TRIAL_WORD_QUOTA
from models import WordCard

if TYPE_CHECKING:
    from supabase import Client

log = logging.getLogger(__name__)

# Supabase Client Initialization
try:
    from supabase import Client, create_client

    HAS_SUPABASE = True
except ImportError:
    HAS_SUPABASE = False

supabase_client: Client | None = None
if (
    HAS_SUPABASE
    and SUPABASE_URL
    and SUPABASE_KEY
    and "your_supabase_url" not in SUPABASE_URL
):
    try:
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        log.info("✓ Connected to Supabase client in FastAPI")
    except Exception as e:
        log.warning("⚠️ Failed to initialize Supabase client: %s", e)

# Auth dependency — bound to the client created above
get_current_user = make_auth_dependency(supabase_client)


# Memory fallback storage when Supabase is unconfigured or offline
FALLBACK_WORDS: list[WordCard] = [
    WordCard(
        id="sample-1",
        lemma="解せる",
        reading="かいせる",
        meaning="to be understandable; to make sense of; to comprehend",
        jlpt_level="N1",
        context_sentence="複雑な文法構造を分解すれば、どんな難文でも解せるようになる。",
        status="Learning",
    ),
    WordCard(
        id="sample-2",
        lemma="解せぬ",
        reading="げせぬ",
        meaning="incomprehensible; I don't get it; doesn't make sense",
        jlpt_level="N1",
        context_sentence="なぜ彼が急に辞職したのか、理由がどうしても解せぬ。",
        status="New",
    ),
]


def is_valid_uuid(val: str | None) -> bool:
    """
    Validate if string conforms to standard UUID format
    to prevent Postgres 22P02 errors.
    """
    if not val:
        return False
    try:
        uuid.UUID(str(val))
        return True
    except (ValueError, TypeError, AttributeError):
        return False


def ensure_user_decks(user_id: str) -> list[dict]:
    """Ensure standard default decks exist for the user and return all user decks."""
    if supabase_client is None:
        return []
    try:
        res = (
            supabase_client.table("decks").select("*").eq("user_id", user_id).execute()
        )
        existing_decks = res.data or []
        existing_names = {d.get("name") for d in existing_decks}

        to_insert = [
            {**spec, "user_id": user_id}
            for spec in DEFAULT_DECKS_SPEC
            if spec["name"] not in existing_names
        ]
        if to_insert:
            insert_res = supabase_client.table("decks").insert(to_insert).execute()
            if insert_res.data:
                existing_decks.extend(insert_res.data)

        return existing_decks
    except Exception as e:
        log.warning("ensure_user_decks failed: %s", e)
        return []


def get_or_create_deck(user_id: str, deck_name_or_id: str) -> str | None:
    """Return deck UUID for user_id and deck name (or existing UUID)."""
    if supabase_client is None:
        return None
    try:
        clean_name = deck_name_or_id.strip() if deck_name_or_id else "unclassified"
        # Match by name or existing UUID safely
        query = supabase_client.table("decks").select("id").eq("user_id", user_id)
        if is_valid_uuid(clean_name):
            query = query.or_(f"name.eq.{clean_name},id.eq.{clean_name}")
        else:
            query = query.eq("name", clean_name)
        res = query.limit(1).execute()
        if res.data and len(res.data) > 0:
            return str(res.data[0]["id"])

        # Auto-create standard defaults if needed
        ensure_user_decks(user_id)
        res2 = (
            supabase_client.table("decks")
            .select("id")
            .eq("user_id", user_id)
            .eq("name", clean_name)
            .limit(1)
            .execute()
        )
        if res2.data and len(res2.data) > 0:
            return str(res2.data[0]["id"])

        # Otherwise create custom deck
        ins = (
            supabase_client.table("decks")
            .insert(
                {
                    "user_id": user_id,
                    "name": clean_name,
                    "jp_label": clean_name,
                    "color_slug": "var(--wave)",
                    "is_unclassified": (clean_name == "unclassified"),
                }
            )
            .execute()
        )
        if ins.data and len(ins.data) > 0:
            return str(ins.data[0]["id"])
    except Exception as e:
        log.warning("get_or_create_deck failed (%s); fallback to None", e)

    return None


def get_or_create_sentence(user_id: str, raw_text: str) -> str | None:
    """Return sentence UUID for user_id and raw text."""
    if supabase_client is None:
        return None
    clean_text = raw_text.strip() if raw_text else "例文なし"
    try:
        res = (
            supabase_client.table("sentences")
            .select("id")
            .eq("user_id", user_id)
            .eq("raw_text", clean_text)
            .limit(1)
            .execute()
        )
        if res.data and len(res.data) > 0:
            return str(res.data[0]["id"])

        ins = (
            supabase_client.table("sentences")
            .insert({"user_id": user_id, "raw_text": clean_text})
            .execute()
        )
        if ins.data and len(ins.data) > 0:
            return str(ins.data[0]["id"])
    except Exception as e:
        log.warning("get_or_create_sentence failed: %s", e)

    return None


def check_user_word_quota(user_id: str, lemma_to_save: str) -> None:
    """Enforce at most 1,000 words per user account.

    Updates to an existing card do not count as a new slot.
    """
    if supabase_client is None:
        return
    try:
        existing = (
            supabase_client.table("words")
            .select("id")
            .eq("user_id", user_id)
            .eq("lemma", lemma_to_save)
            .limit(1)
            .execute()
        )
        if existing.data and len(existing.data) > 0:
            return

        count_res = (
            supabase_client.table("words")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .execute()
        )
        total_words = count_res.count or 0
        if total_words >= TRIAL_WORD_QUOTA:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Trial tier limit reached (at most {TRIAL_WORD_QUOTA} words). "
                "Please remove old cards to continue saving new vocabulary.",
            )
    except HTTPException:
        raise
    except Exception as e:
        log.warning("check_user_word_quota encountered warning: %s", e)


def map_row_to_word_card(row: dict) -> WordCard:
    """Map a Supabase words row (with joined sentences & decks) to WordCard."""
    sentence_obj = row.get("sentences") or {}
    deck_obj = row.get("decks") or {}
    raw_sentence = (
        sentence_obj.get("raw_text") if isinstance(sentence_obj, dict) else ""
    )
    deck_name = deck_obj.get("name") if isinstance(deck_obj, dict) else "unclassified"
    raw_status = row.get("status") or "new"

    return WordCard(
        id=str(row.get("id")),
        lemma=row.get("lemma", ""),
        surface_form=row.get("surface_form") or row.get("lemma", ""),
        span_start=row.get("span_start"),
        span_end=row.get("span_end"),
        sentence_id=str(row.get("sentence_id", "")),
        reading=row.get("reading") or "",
        meaning=row.get("meaning") or "",
        jlpt_level=row.get("jlpt_level"),
        context_sentence=raw_sentence or "",
        status=raw_status.capitalize(),
        deck_id=deck_name or "unclassified",
        next_review_at=str(row.get("next_review_at"))
        if row.get("next_review_at")
        else None,
        last_reviewed_at=str(row.get("last_reviewed_at"))
        if row.get("last_reviewed_at")
        else None,
    )
