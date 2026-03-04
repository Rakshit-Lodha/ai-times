import pytest

from src.utils.json_repair import extract_json_block, safe_load_llm_json


class TestExtractJsonBlock:
    def test_plain_json_passthrough(self):
        raw = '{"key": "value"}'
        assert extract_json_block(raw) == '{"key": "value"}'

    def test_strips_markdown_fences(self):
        raw = '```json\n{"key": "value"}\n```'
        assert extract_json_block(raw) == '{"key": "value"}'

    def test_strips_fences_without_language(self):
        raw = '```\n{"key": "value"}\n```'
        assert extract_json_block(raw) == '{"key": "value"}'

    def test_strips_surrounding_whitespace(self):
        raw = '  \n  {"key": "value"}  \n  '
        assert extract_json_block(raw) == '{"key": "value"}'


class TestSafeLoadLlmJson:
    def test_valid_json(self):
        result = safe_load_llm_json('{"selected_total": 15, "items": []}')
        assert result["selected_total"] == 15
        assert result["items"] == []

    def test_json_with_markdown_fences(self):
        raw = '```json\n{"headline": "Test"}\n```'
        result = safe_load_llm_json(raw)
        assert result["headline"] == "Test"

    def test_unescaped_quotes_in_output(self):
        raw = '{"output": "He said "hello" to me", "headline": "Test"}'
        result = safe_load_llm_json(raw)
        assert "hello" in result["output"]
        assert result["headline"] == "Test"

    def test_truncated_response_raises(self):
        raw = '{"items": [{"id": 1, "output": "incomplete'
        with pytest.raises(ValueError, match="truncated"):
            safe_load_llm_json(raw)

    def test_unbalanced_braces_raises(self):
        raw = '{"items": [{"id": 1}'
        with pytest.raises(ValueError, match="truncated"):
            safe_load_llm_json(raw)

    def test_nested_valid_json(self):
        raw = '{"items": [{"id": 1, "output": "clean text", "sources": []}]}'
        result = safe_load_llm_json(raw)
        assert result["items"][0]["id"] == 1
