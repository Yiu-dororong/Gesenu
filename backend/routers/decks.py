"""
routers/decks.py — Deck Management & Retrieval Endpoints
"""

import logging

from fastapi import APIRouter, Depends

from database import ensure_user_decks, get_current_user, supabase_client
from models import DeckModel, DecksResponse

log = logging.getLogger(__name__)

router = APIRouter(prefix="/api/decks", tags=["Decks"])


@router.get("", response_model=DecksResponse)
def get_user_decks(
    current_user: dict = Depends(get_current_user),
) -> DecksResponse:
    """Fetch user decks from Supabase PostgreSQL (creates standard default if missing)."""
    user_id = current_user["user_id"]
    if supabase_client is not None:
        try:
            raw_decks = ensure_user_decks(user_id)
            if raw_decks:
                return DecksResponse(
                    decks=[
                        DeckModel(
                            id=str(d.get("id") or d.get("name")),
                            name=str(d.get("name") or "unclassified"),
                            jp_label=d.get("jp_label"),
                            color_slug=d.get("color_slug"),
                            is_unclassified=bool(d.get("is_unclassified", False)),
                        )
                        for d in raw_decks
                    ]
                )
        except Exception as e:
            log.error("Failed to fetch decks: %s", e)

    # Fallback to standard unclassified deck only (guest test decks are excluded)
    return DecksResponse(
        decks=[
            DeckModel(
                id="unclassified",
                name="unclassified",
                jp_label="未分類",
                color_slug="var(--ink-surface)",
                is_unclassified=True,
            ),
        ]
    )
