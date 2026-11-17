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
    sentence = "これは123本のペンです。"
    tokens = parse_sentence(sentence)

    # Numbers like '123' must not be selectable
    for t in tokens:
        if t["surface"].isnumeric():
            assert not t["is_selectable"]
