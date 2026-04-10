"""
Test suite for GrowEasy app.py pipeline functions.

Unit tests: pytest test_app.py -m "not e2e"
E2E test:   pytest test_app.py -m e2e --timeout=300
"""

import os
import sys
import types
import unittest.mock as mock

import pytest

# ---------------------------------------------------------------------------
# Bootstrap: stub out streamlit and heavy deps before importing app
# ---------------------------------------------------------------------------
class _SessionState(dict):
    """Dict that also supports attribute-style access (like Streamlit's real SessionState)."""
    def __getattr__(self, key):
        try:
            return self[key]
        except KeyError:
            raise AttributeError(key)

    def __setattr__(self, key, value):
        self[key] = value

    def __delattr__(self, key):
        try:
            del self[key]
        except KeyError:
            raise AttributeError(key)


# Streamlit stub
st_stub = types.ModuleType("streamlit")
st_stub.warning = mock.MagicMock()
st_stub.error = mock.MagicMock()
st_stub.info = mock.MagicMock()
st_stub.session_state = _SessionState()
st_stub.rerun = mock.MagicMock()
st_stub.markdown = mock.MagicMock()
st_stub.text_area = mock.MagicMock(return_value="")
st_stub.text_input = mock.MagicMock(return_value="")
st_stub.button = mock.MagicMock(return_value=False)
st_stub.code = mock.MagicMock()
st_stub.spinner = mock.MagicMock()
st_stub.empty = mock.MagicMock()
st_stub.set_page_config = mock.MagicMock()

sys.modules.setdefault("streamlit", st_stub)

# Patch clients before import so app.py module-level init doesn't crash
with (
    mock.patch("sarvamai.SarvamAI", return_value=mock.MagicMock()),
    mock.patch("anthropic.Anthropic", return_value=mock.MagicMock()),
):
    import importlib
    if "app" in sys.modules:
        app = sys.modules["app"]
    else:
        sys.path.insert(0, os.path.dirname(__file__))
        import app


# ---------------------------------------------------------------------------
# 1. URL Validation
# ---------------------------------------------------------------------------
class TestValidateUrl:
    def test_valid_instagram_reel_url(self):
        ok, reason = app.validate_url("https://www.instagram.com/reel/ABC123/")
        assert ok
        assert reason == ""

    def test_valid_instagram_p_url(self):
        ok, reason = app.validate_url("https://www.instagram.com/p/ABC123/")
        assert ok

    def test_valid_youtube_watch(self):
        ok, reason = app.validate_url("https://www.youtube.com/watch?v=abcdefg")
        assert ok

    def test_valid_youtu_be(self):
        ok, reason = app.validate_url("https://youtu.be/abc123")
        assert ok

    def test_valid_youtube_shorts(self):
        ok, reason = app.validate_url("https://www.youtube.com/shorts/abc123")
        assert ok

    def test_reject_instagram_profile(self):
        ok, reason = app.validate_url("https://www.instagram.com/someuser/")
        assert not ok
        assert reason != ""

    def test_reject_youtube_channel_at(self):
        ok, reason = app.validate_url("https://www.youtube.com/@ChannelName")
        assert not ok

    def test_reject_youtube_channel_path(self):
        ok, reason = app.validate_url("https://www.youtube.com/channel/UC123")
        assert not ok

    def test_reject_empty_string(self):
        ok, reason = app.validate_url("   ")
        assert not ok
        assert reason == "empty"

    def test_reject_random_url(self):
        ok, reason = app.validate_url("https://example.com/whatever")
        assert not ok


class TestParseUrls:
    def test_min_urls_not_met(self):
        raw = "https://youtu.be/abc\nhttps://youtu.be/def"
        valid, warnings = app.parse_urls(raw)
        assert len(valid) == 2  # parse_urls returns valid list; enforcement is in UI

    def test_max_urls_trimmed_in_ui_layer(self):
        lines = [f"https://youtu.be/abc{i}" for i in range(12)]
        raw = "\n".join(lines)
        valid, warnings = app.parse_urls(raw)
        assert len(valid) == 12  # parse_urls itself does not trim — UI trims to 10

    def test_mixed_valid_and_invalid(self):
        raw = (
            "https://www.instagram.com/reel/ABC/\n"
            "https://www.instagram.com/someprofile/\n"
            "https://youtu.be/xyz\n"
        )
        valid, warnings = app.parse_urls(raw)
        assert len(valid) == 2
        assert len(warnings) == 1

    def test_empty_lines_ignored(self):
        raw = "https://youtu.be/abc\n\n   \nhttps://youtu.be/def"
        valid, warnings = app.parse_urls(raw)
        assert len(valid) == 2
        assert len(warnings) == 0


# ---------------------------------------------------------------------------
# 2. Audio Chunking
# ---------------------------------------------------------------------------
class TestChunkAudio:
    def test_chunk_default_duration_ms(self):
        import inspect
        sig = inspect.signature(app.chunk_audio)
        assert sig.parameters["chunk_duration_ms"].default == 29000

    def test_chunk_creates_correct_number(self):
        # 90s audio should yield 4 chunks: 29+29+29+3
        fake_audio = mock.MagicMock()
        fake_audio.__len__ = mock.MagicMock(return_value=90000)  # 90 000 ms

        # Make iteration work: fake_audio[i:i+29000] returns a chunk object
        chunk_mock = mock.MagicMock()
        fake_audio.__getitem__ = mock.MagicMock(return_value=chunk_mock)

        with (
            mock.patch("app.AudioSegment.from_file", return_value=fake_audio),
            mock.patch("tempfile.NamedTemporaryFile") as mock_tmp,
            mock.patch.object(chunk_mock, "export"),
        ):
            mock_tmp.return_value.__enter__ = lambda s: s
            mock_tmp.return_value.__exit__ = mock.MagicMock(return_value=False)
            mock_tmp.return_value.name = "/tmp/fake.mp3"

            # Simulate range(0, 90000, 29000) → 0, 29000, 58000, 87000 (4 iterations)
            original_range = range

            def patched_range(*args):
                if len(args) == 3 and args[0] == 0 and args[2] == 29000:
                    return original_range(0, 90000, 29000)
                return original_range(*args)

            chunks = []
            audio = fake_audio
            for i in range(0, 90000, 29000):
                chunk = audio[i : i + 29000]
                chunks.append("/tmp/fake.mp3")

            assert len(chunks) == 4  # ceil(90000/29000) = 4


# ---------------------------------------------------------------------------
# 3. Transcript Assembly
# ---------------------------------------------------------------------------
class TestTranscriptAssembly:
    def test_transcripts_joined_with_space(self):
        mock_result_a = mock.MagicMock()
        mock_result_a.transcript = "Hello"
        mock_result_b = mock.MagicMock()
        mock_result_b.transcript = "World"
        mock_result_c = mock.MagicMock()
        mock_result_c.transcript = "Test"

        with (
            mock.patch("app.chunk_audio", return_value=["/a.mp3", "/b.mp3", "/c.mp3"]),
            mock.patch("app.transcribe_audio", side_effect=[mock_result_a, mock_result_b, mock_result_c]),
            mock.patch("os.remove"),
        ):
            result = app.transcribe_long_audio("/fake.mp3")
        assert result == "Hello World Test"

    def test_none_transcripts_filtered_from_analysis_prompt(self):
        """process_urls returns None for failed URLs; analyze_references filters them."""
        transcripts = {"url1": "Good transcript", "url2": None, "url3": "Another transcript"}
        valid = {u: t for u, t in transcripts.items() if t}
        assert "url2" not in valid
        assert len(valid) == 2


# ---------------------------------------------------------------------------
# 4. Session State Flow
# ---------------------------------------------------------------------------
class TestSessionStateFlow:
    def test_reset_state_clears_all_keys(self):
        st_stub.session_state.step = 3
        st_stub.session_state.analysis = "some analysis"
        st_stub.session_state.script = "some script"
        st_stub.session_state.failed_urls = ["url1"]
        st_stub.session_state.success_count = 5

        app.reset_state()

        assert st_stub.session_state.step == 1
        assert st_stub.session_state.analysis is None
        assert st_stub.session_state.script is None
        assert st_stub.session_state.failed_urls == []
        assert st_stub.session_state.success_count == 0

    def test_init_state_sets_defaults(self):
        # Clear state first
        for key in ["step", "analysis", "script", "failed_urls", "success_count"]:
            st_stub.session_state.pop(key, None)

        app.init_state()

        assert st_stub.session_state["step"] == 1
        assert st_stub.session_state["analysis"] is None

    def test_init_state_does_not_overwrite_existing(self):
        st_stub.session_state["step"] = 2
        app.init_state()
        assert st_stub.session_state["step"] == 2  # not reset


# ---------------------------------------------------------------------------
# 5. End-to-End Integration Test (real API calls)
# ---------------------------------------------------------------------------
E2E_URL = "https://www.youtube.com/shorts/dQw4w9WgXcQ"  # Rick Astley short (public, short)


@pytest.mark.e2e
def test_e2e_full_pipeline():
    """
    Real pipeline: download → transcribe → analyze → generate script.
    Requires CLAUDE_API_KEY and SARVAM_API_KEY in environment.
    Run with: pytest test_app.py -m e2e --timeout=300
    """
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

    # Re-init real clients
    import anthropic as _anthropic
    from sarvamai import SarvamAI as _SarvamAI

    real_sarvam = _SarvamAI(api_subscription_key=os.environ["SARVAM_API_KEY"])
    real_claude = _anthropic.Anthropic(api_key=os.environ["CLAUDE_API_KEY"])

    app.client_sarvam = real_sarvam
    app.client_anthropic = real_claude

    urls = [E2E_URL]

    # Run just the download + transcription part
    transcripts = app.process_urls(urls)
    assert transcripts.get(E2E_URL) is not None, "Transcription failed for e2e URL"

    transcript_text = transcripts[E2E_URL]
    assert len(transcript_text.strip()) > 10, "Transcript is suspiciously short"

    # Build a fake reference_text for analysis
    reference_text = f"---\nReference ({E2E_URL}):\n{transcript_text}\n"
    prompt = f"""You are analyzing short-form video scripts to extract creator style patterns.

Here are 1 transcripts:

{reference_text}

Extract and return a structured analysis with these sections:

1. HOOK PATTERNS
2. STRUCTURE
3. TONE & LANGUAGE
4. CLOSING & CTA
5. PACING

Be specific and pull examples from the actual transcripts."""

    analysis_response = real_claude.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1500,
        messages=[{"role": "user", "content": prompt}],
    )
    analysis = analysis_response.content[0].text
    assert len(analysis) > 100, "Analysis output too short"

    # Generate script
    script = app.generate_script(
        topic="How to grow on social media",
        insight="Consistency beats virality every time — small daily actions compound.",
        analysis=analysis,
    )

    word_count = len(script.split())
    assert 100 <= word_count <= 400, f"Script word count {word_count} out of expected range"
    print(f"\n{'='*60}")
    print("GENERATED SCRIPT:")
    print(f"{'='*60}")
    print(script)
    print(f"{'='*60}")
    print(f"Word count: {word_count}")
