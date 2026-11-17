"""
models.py — Pydantic Request & Response Models (OpenAPI Contracts)
"""

from __future__ import annotations

from pydantic import BaseModel, Field


class HealthCheckStatus(BaseModel):
    status: str = Field(..., examples=["ok"])
    app: str = Field(..., examples=["Gesenu API"])
    version: str = Field(..., examples=["1.0.0"])
    supabase_connected: bool = Field(..., examples=[True])


class SessionPayload(BaseModel):
    access_token: str
    refresh_token: str | None = None


class TokenItem(BaseModel):
    surface: str = Field(..., examples=["走った"])
    lemma: str = Field(..., examples=["走る"])
    reading: str = Field(..., examples=["はしる"])
    pos: str = Field(..., examples=["動詞"])
    pos_detail: str = Field(..., examples=["動詞-一般"])
    span_start: int | None = Field(None, examples=[0])
    span_end: int | None = Field(None, examples=[3])
    is_selectable: bool = Field(..., examples=[True])


class ParseSentenceRequest(BaseModel):
    sentence: str = Field(
        ...,
        examples=["複雑な文法構造を分解すれば、どんな難文でも解せるようになる。"],
    )


class ParseSentenceResponse(BaseModel):
    sentence: str
    tokens: list[TokenItem]
    candidate_count: int


class DictLookupResponse(BaseModel):
    lemma: str = Field(..., examples=["解せる"])
    reading: str = Field(..., examples=["かいせる"])
    meaning: str = Field(..., examples=["to understand; to comprehend"])
    jlpt_level: str | None = Field(None, examples=["N1"])
    found: bool = Field(..., examples=[True])


class WordCard(BaseModel):
    id: str | None = Field(None, examples=["123e4567-e89b-12d3-a456-426614174000"])
    lemma: str = Field(..., examples=["解せる"])
    surface_form: str | None = Field(None, examples=["解せる"])
    span_start: int | None = Field(None, examples=[17])
    span_end: int | None = Field(None, examples=[20])
    sentence_id: str | None = Field(None, examples=["sent-1"])
    reading: str = Field(..., examples=["かいせる"])
    meaning: str = Field(..., examples=["to make sense of; comprehend"])
    jlpt_level: str | None = Field(None, examples=["N1"])
    context_sentence: str = Field(
        ...,
        examples=["複雑な文法構造を分解すれば、どんな難文でも解せるようになる。"],
    )
    status: str = Field("New", examples=["Learning"])
    deck_id: str | None = Field(None, examples=["work"])
    next_review_at: str | None = Field(None, examples=["2026-11-18T10:00:00Z"])
    last_reviewed_at: str | None = Field(None, examples=["2026-11-17T10:00:00Z"])


class WordCardResponse(BaseModel):
    words: list[WordCard]
    source: str = Field(..., examples=["supabase"])
    message: str = Field(..., examples=["Fetched successfully"])


class ReviewSubmission(BaseModel):
    feedback: str = Field(..., examples=["good"])  # 'forgot' | 'hard' | 'good' | 'easy'
    prev_status: str | None = Field(None, examples=["New"])


class ReviewResultResponse(BaseModel):
    success: bool = True
    wordId: str = Field(..., examples=["解せる"])
    previousStatus: str = Field(..., examples=["New"])
    newStatus: str = Field(..., examples=["Learning"])
    nextReviewAt: str | None = Field(None, examples=["2026-11-18T10:00:00Z"])
    message: str = Field(
        "Review recorded successfully", examples=["Review recorded successfully"]
    )


class DeckModel(BaseModel):
    id: str = Field(..., examples=["work"])
    name: str = Field(..., examples=["work"])
    jp_label: str | None = Field(None, examples=["仕事"])
    color_slug: str | None = Field(None, examples=["var(--pine)"])
    is_unclassified: bool = Field(False, examples=[False])


class DecksResponse(BaseModel):
    decks: list[DeckModel]
