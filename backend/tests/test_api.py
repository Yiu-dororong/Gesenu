import time
from unittest.mock import patch

from fastapi import HTTPException


def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["app"] == "Gesenu API"
    assert data["version"] == "1.0.0"


def test_parse_endpoint(client):
    payload = {"sentence": "日本語の勉強は楽しい。"}
    response = client.post("/api/parse", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["sentence"] == "日本語の勉強は楽しい。"
    assert "tokens" in data
    assert len(data["tokens"]) > 0
    # At least one token should be selectable (e.g. 日本語 or 勉強 or 楽しい)
    assert any(t["is_selectable"] for t in data["tokens"])


def test_parse_endpoint_exceeds_200_words(client):
    # Repeat words to exceed 200 tokens
    long_sentence = "毎日日本語を楽しく勉強しています。" * 30
    payload = {"sentence": long_sentence}
    response = client.post("/api/parse", json=payload)
    assert response.status_code == 400
    assert "Sentence exceeds maximum limit of 200 words" in response.json()["detail"]


def test_dict_lookup_endpoint(client):
    with patch("main.lookup_word") as mock_lookup:
        mock_lookup.return_value = {
            "lemma": "猫",
            "reading": "ねこ",
            "meaning": "cat",
            "jlpt_level": "N5",
            "found": True,
        }
        response = client.get("/api/dict/lookup?keyword=猫")
        assert response.status_code == 200
        data = response.json()
        assert data["lemma"] == "猫"
        assert data["reading"] == "ねこ"
        assert data["meaning"] == "cat"
        assert data["found"] is True


def test_protected_routes_unauthorized(client):
    # Without cookie or bearer token, protected routes must return 401
    assert client.get("/api/decks").status_code == 401
    assert client.get("/api/words").status_code == 401
    assert client.get("/api/study/due").status_code == 401
    assert client.post("/api/words", json={}).status_code == 401


def test_decks_endpoint_authenticated(auth_client):
    response = auth_client.get("/api/decks")
    assert response.status_code == 200
    data = response.json()
    assert "decks" in data
    assert isinstance(data["decks"], list)
    assert len(data["decks"]) >= 1
    first_deck = data["decks"][0]
    assert "id" in first_deck
    assert "name" in first_deck


def test_words_endpoint_authenticated(auth_client):
    response = auth_client.get("/api/words")
    assert response.status_code == 200
    data = response.json()
    assert "words" in data
    assert isinstance(data["words"], list)


def test_save_and_review_word_flow(auth_client):
    test_lemma = f"単語テスト_{int(time.time())}"
    # 1. Save a new card
    card_data = {
        "lemma": test_lemma,
        "surface_form": test_lemma,
        "span_start": 0,
        "span_end": len(test_lemma),
        "sentence_id": "sent-1",
        "reading": "たんごてすと",
        "meaning": "automated test word",
        "jlpt_level": "N5",
        "context_sentence": "テスト用の例文です。",
        "status": "New",
        "deck_id": "work",
    }

    save_resp = auth_client.post("/api/words", json=card_data)
    assert save_resp.status_code == 200
    saved_card = save_resp.json()
    assert saved_card["lemma"] == test_lemma

    # 2. Submit review feedback
    review_resp = auth_client.post(
        f"/api/words/{test_lemma}/review", json={"feedback": "good"}
    )
    assert review_resp.status_code == 200
    review_data = review_resp.json()
    assert review_data["success"] is True
    assert review_data["newStatus"] in ("Learning", "Known", "Mastered")
    assert "nextReviewAt" in review_data


def test_quota_exceeded_error(auth_client):
    with patch("main.check_user_word_quota") as mock_quota:
        mock_quota.side_effect = HTTPException(
            status_code=403,
            detail="""
            Trial tier limit reached (at most 1000 words).
            Please remove old cards to continue saving new vocabulary.
            """,
        )
        resp = auth_client.post(
            "/api/words",
            json={
                "lemma": "超過単語",
                "sentence_id": "sent-quota",
                "reading": "ちょうかたんご",
                "meaning": "over quota word",
                "context_sentence": "テスト例文です。",
            },
        )
        assert resp.status_code == 403
        assert "Trial tier limit reached" in resp.json()["detail"]


def test_duplicate_word_save_preserves_status_and_appends_context(auth_client):
    test_lemma = f"重複テスト_{int(time.time())}"
    card_data = {
        "lemma": test_lemma,
        "surface_form": test_lemma,
        "reading": "じゅうふく",
        "meaning": "duplicate test",
        "context_sentence": "最初の文です。",
        "status": "New",
        "deck_id": "life",
    }
    r1 = auth_client.post("/api/words", json=card_data)
    assert r1.status_code == 200

    # Advance status to Learning via review
    rev = auth_client.post(f"/api/words/{test_lemma}/review", json={"feedback": "good"})
    assert rev.status_code == 200
    assert rev.json()["newStatus"] == "Learning"

    # Save again with appended context sentence
    # backend should preserve 'Learning' status
    card_data["context_sentence"] = "最初の文です。\n追加された二つ目の文です。"
    r2 = auth_client.post("/api/words", json=card_data)
    assert r2.status_code == 200
    updated_card = r2.json()
    assert updated_card["lemma"] == test_lemma
    assert updated_card["status"] == "Learning"
