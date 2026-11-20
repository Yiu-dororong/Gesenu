from services.sudachi_parser import (
    katakana_to_hiragana,
    parse_sentence,
)


def test_katakana_to_hiragana():
    assert katakana_to_hiragana("トウキョウ") == "とうきょう"
    assert katakana_to_hiragana("タベル") == "たべる"
    assert katakana_to_hiragana("漢字") == "漢字"
    assert katakana_to_hiragana("") == ""


def test_parse_sentence_basic():
    sentence = "複雑な文法構造を分解すれば、解せる。"
    tokens = parse_sentence(sentence)

    assert isinstance(tokens, list)
    assert len(tokens) > 0

    # Ensure all token keys are present
    required_keys = {
        "surface",
        "lemma",
        "reading",
        "pos",
        "span_start",
        "span_end",
        "is_selectable",
    }
    for t in tokens:
        assert required_keys.issubset(t.keys())
        assert 0 <= t["span_start"] <= t["span_end"] <= len(sentence)
        # Check slice matches surface
        assert sentence[t["span_start"] : t["span_end"]] == t["surface"]

    # Check known vocabulary candidates are selectable
    nouns_and_verbs = [t for t in tokens if t["pos"] in ("名詞", "動詞", "形状詞")]
    assert any(t["lemma"] == "文法" or t["surface"] == "文法" for t in tokens)
    assert any(t["is_selectable"] for t in nouns_and_verbs)


def test_parse_sentence_empty():
    assert parse_sentence("") == []
    assert parse_sentence("   \n\t  ") == []


def test_parse_sentence_selectability_filter():
    sentence = "これは123本のペンです。静かで綺麗だ。"
    tokens = parse_sentence(sentence)

    token_map = {t["surface"]: t for t in tokens}

    # Numbers like '123' must not be selectable
    for t in tokens:
        if t["surface"].isnumeric():
            assert not t["is_selectable"]

    # Pronouns (代名詞) should be selectable
    assert token_map["これ"]["pos"] == "代名詞"
    assert token_map["これ"]["is_selectable"] is True

    # Nouns and na-adjectives (形状詞) should be selectable
    assert token_map["ペン"]["is_selectable"] is True
    assert token_map["静か"]["pos"] == "形状詞"
    assert token_map["静か"]["is_selectable"] is True
    assert token_map["綺麗"]["pos"] == "形状詞"
    assert token_map["綺麗"]["is_selectable"] is True

    # Particles and auxiliaries must not be selectable
    assert token_map["は"]["is_selectable"] is False
    assert token_map["の"]["is_selectable"] is False
    assert token_map["です"]["is_selectable"] is False
    assert token_map["だ"]["is_selectable"] is False
