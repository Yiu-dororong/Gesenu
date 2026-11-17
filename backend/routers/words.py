"""
routers/words.py — Vocabulary Card CRUD, Leitner Review, & Study Session Endpoints
"""

import logging
import sys
from datetime import datetime, timezone

try:
    from datetime import UTC
except ImportError:
    UTC = timezone.utc

from fastapi import APIRouter, Depends, HTTPException, Query, status

from database import (
    FALLBACK_WORDS,
    get_current_user,
    get_or_create_deck,
    get_or_create_sentence,
    is_valid_uuid,
    map_row_to_word_card,
    supabase_client,
)
from database import (
    check_user_word_quota as default_check_quota,
)
from models import (
    ReviewResultResponse,
    ReviewSubmission,
    WordCard,
    WordCardResponse,
)
from services.srs import calculate_srs_transition

log = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Vocabulary"])


def _resolve_check_quota():
    """Resolve check_user_word_quota dynamically to support test mocking via main."""
    main_mod = sys.modules.get("main")
    if main_mod and hasattr(main_mod, "check_user_word_quota"):
        return getattr(main_mod, "check_user_word_quota")
    return default_check_quota


@router.get("/test-words", response_model=WordCardResponse)
@router.get("/words", response_model=WordCardResponse)
def get_words(
    deck_id: str | None = Query(None, description="Optional deck filter"),
    current_user: dict = Depends(get_current_user),
) -> WordCardResponse:
    """Fetch Japanese vocabulary cards for the current user from Supabase PostgreSQL."""
    user_id = current_user["user_id"]
    if supabase_client is not None:
        try:
            query = (
                supabase_client.table("words")
                .select("*, sentences(raw_text), decks(name, jp_label)")
                .eq("user_id", user_id)
                .order("created_at", desc=True)
            )
            if deck_id and deck_id != "all":
                query = query.eq("decks.name", deck_id)

            res = query.execute()
            words = [map_row_to_word_card(row) for row in (res.data or [])]
            return WordCardResponse(
                words=words,
                source="supabase",
                message=(
                    f"Successfully fetched {len(words)} cards live "
                    "from Supabase PostgreSQL!"
                ),
            )
        except Exception as e:
            log.error("Supabase query failed (%s). Using fallback dataset.", e)
            return WordCardResponse(
                words=FALLBACK_WORDS,
                source="fallback_on_server_failure",
                message=(
                    f"Server/Database Query Failed ({type(e).__name__}). "
                    "Using fallback sample words."
                ),
            )

    log.error("Supabase client is not initialized. Using fallback dataset.")
    return WordCardResponse(
        words=FALLBACK_WORDS,
        source="fallback_on_server_failure",
        message="Supabase client uninitialized. Using fallback sample words.",
    )


@router.post("/test-words", response_model=WordCard)
@router.post("/words", response_model=WordCard)
def create_word(
    word: WordCard, current_user: dict = Depends(get_current_user)
) -> WordCard:
    """Create and save a new word card in Supabase PostgreSQL scoped by user_id."""
    user_id = current_user["user_id"]
    if supabase_client is not None:
        try:
            # 1. Enforce 1,000 word trial quota
            quota_fn = _resolve_check_quota()
            quota_fn(user_id, word.lemma)

            # 2. Ensure sentence exists
            context_sent = (word.context_sentence or "").strip()
            sentence_id = get_or_create_sentence(user_id, context_sent)

            # 3. Ensure deck exists
            target_deck = word.deck_id or "unclassified"
            deck_id = get_or_create_deck(user_id, target_deck)

            # 4. Prepare row payload (preserve existing schedule if updating)
            surface = word.surface_form or word.lemma
            status_clean = (word.status or "new").lower()
            if status_clean not in {"new", "learning", "known", "mastered"}:
                status_clean = "new"

            now_iso = datetime.now(UTC).isoformat()
            existing_rec = (
                supabase_client.table("words")
                .select("id, status, next_review_at")
                .eq("user_id", user_id)
                .eq("lemma", word.lemma)
                .limit(1)
                .execute()
            )
            if existing_rec.data and len(existing_rec.data) > 0:
                old_row = existing_rec.data[0]
                if old_row.get("status") and status_clean == "new":
                    status_clean = old_row["status"].lower()
                next_review_val = old_row.get("next_review_at") or now_iso
            else:
                next_review_val = now_iso

            payload = {
                "user_id": user_id,
                "deck_id": deck_id,
                "sentence_id": sentence_id,
                "lemma": word.lemma,
                "surface_form": surface,
                "span_start": word.span_start if word.span_start is not None else 0,
                "span_end": word.span_end
                if word.span_end is not None
                else len(surface),
                "reading": word.reading,
                "meaning": word.meaning,
                "jlpt_level": word.jlpt_level,
                "status": status_clean,
                "next_review_at": next_review_val,
                "updated_at": now_iso,
            }

            res = (
                supabase_client.table("words")
                .upsert(payload, on_conflict="user_id,lemma")
                .execute()
            )

            if res.data and len(res.data) > 0:
                inserted_id = str(res.data[0]["id"])
                log.info(
                    "✓ Saved word '%s' in Supabase (id=%s)", word.lemma, inserted_id
                )
                word.id = inserted_id
                word.sentence_id = sentence_id
                word.deck_id = target_deck
                word.status = status_clean.capitalize()
                return word
        except HTTPException:
            raise
        except Exception as e:
            log.error("Failed to insert word into Supabase: %s", e)

    word.id = f"local-{len(FALLBACK_WORDS) + 1}"
    FALLBACK_WORDS.append(word)
    return word


@router.post("/words/{word_id}/review", response_model=ReviewResultResponse)
@router.post("/reviews", response_model=ReviewResultResponse)
def submit_word_review(
    word_id: str,
    payload: ReviewSubmission,
    current_user: dict = Depends(get_current_user),
) -> ReviewResultResponse:
    """Submit a review feedback, advance Leitner SRS schedule, and log telemetry."""
    user_id = current_user["user_id"]
    if supabase_client is not None:
        try:
            # Query word by UUID or lemma safely
            query = (
                supabase_client.table("words")
                .select("id, lemma, status")
                .eq("user_id", user_id)
            )
            if is_valid_uuid(word_id):
                query = query.or_(f"id.eq.{word_id},lemma.eq.{word_id}")
            else:
                query = query.eq("lemma", word_id)
            res = query.limit(1).execute()
            if not res.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Word '{word_id}' not found for current user.",
                )

            word_record = res.data[0]
            curr_status = word_record.get("status") or "new"
            new_status, next_review_at = calculate_srs_transition(
                curr_status, payload.feedback
            )
            now = datetime.now(UTC)

            # Insert telemetry log in public.reviews
            supabase_client.table("reviews").insert(
                {
                    "word_id": word_record["id"],
                    "user_id": user_id,
                    "feedback": payload.feedback.lower(),
                    "prev_status": curr_status,
                    "new_status": new_status,
                    "rolled_back": False,
                }
            ).execute()

            # Update word status & schedule
            supabase_client.table("words").update(
                {
                    "status": new_status,
                    "next_review_at": next_review_at.isoformat(),
                    "last_reviewed_at": now.isoformat(),
                    "updated_at": now.isoformat(),
                }
            ).eq("id", word_record["id"]).execute()

            return ReviewResultResponse(
                success=True,
                wordId=word_record["lemma"],
                previousStatus=curr_status.capitalize(),
                newStatus=new_status.capitalize(),
                nextReviewAt=next_review_at.isoformat(),
            )
        except HTTPException:
            raise
        except Exception as e:
            log.error("Review update failed: %s", e)
            raise HTTPException(status_code=500, detail=f"Review sync failed: {e}")

    # Fallback in-memory
    status_map = {
        "forgot": "New",
        "hard": "Learning",
        "good": "Known",
        "easy": "Mastered",
    }
    next_st = status_map.get(payload.feedback.lower(), "Learning")
    return ReviewResultResponse(
        success=True,
        wordId=word_id,
        previousStatus=payload.prev_status or "New",
        newStatus=next_st,
    )


@router.get("/study/session", response_model=WordCardResponse)
@router.get("/study/due", response_model=WordCardResponse)
def get_due_study_cards(
    deck_id: str | None = Query(None, description="Optional deck filter"),
    current_user: dict = Depends(get_current_user),
) -> WordCardResponse:
    """Fetch up to 20 cards due for review (next_review_at <= now OR status = 'new')."""
    user_id = current_user["user_id"]
    if supabase_client is not None:
        try:
            now_iso = datetime.now(UTC).isoformat()
            query = (
                supabase_client.table("words")
                .select("*, sentences(raw_text), decks(name, jp_label)")
                .eq("user_id", user_id)
                .or_(
                    f"next_review_at.lte.{now_iso},status.eq.new,next_review_at.is.null"
                )
                .order("next_review_at", desc=False)
                .limit(20)
            )
            if deck_id and deck_id != "all":
                query = query.eq("decks.name", deck_id)
            res = query.execute()

            cards = [map_row_to_word_card(row) for row in (res.data or [])]
            return WordCardResponse(
                words=cards,
                source="supabase",
                message=f"Fetched {len(cards)} due cards for study session.",
            )
        except Exception as e:
            log.error("Failed to query due cards: %s", e)

    return WordCardResponse(
        words=FALLBACK_WORDS,
        source="fallback",
        message="Using fallback cards for study session.",
    )
