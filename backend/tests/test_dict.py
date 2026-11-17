from unittest.mock import MagicMock, patch

from services.jisho_dict import lookup_word


def test_lookup_word_empty():
    res = lookup_word("")
    assert res["found"] is False
    assert res["meaning"] == "No keyword provided"

    res_ws = lookup_word("   ")
    assert res_ws["found"] is False


@patch("httpx.Client.get")
def test_lookup_word_success(mock_get):
    mock_resp = MagicMock()
    mock_resp.json.return_value = {
        "data": [
            {
                "japanese": [{"word": "解せる", "reading": "げせる"}],
                "senses": [
                    {
                        "english_definitions": ["to understand", "to comprehend"],
                        "parts_of_speech": ["Ichidan verb"],
                    }
                ],
                "jlpt": ["jlpt-n1"],
            }
        ]
    }
    mock_resp.raise_for_status.return_value = None
    mock_get.return_value = mock_resp

    res = lookup_word("解せる")
    assert res["found"] is True
    assert res["lemma"] == "解せる"
    assert res["reading"] == "げせる"
    assert "understand" in res["meaning"]
    assert res["jlpt_level"] == "N1"


@patch("httpx.Client.get")
def test_lookup_word_not_found(mock_get):
    mock_resp = MagicMock()
    mock_resp.json.return_value = {"data": []}
    mock_resp.raise_for_status.return_value = None
    mock_get.return_value = mock_resp

    res = lookup_word("存在しない単語xyz")
    assert res["found"] is False
    assert res["lemma"] == "存在しない単語xyz"
    assert "Contextual entry" in res["meaning"]
