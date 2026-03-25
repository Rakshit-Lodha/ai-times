"""
voiceover.py — Generate one voiceover MP3 for the entire Short.

Concatenates all scene narrations (in order) with a short pause between
each scene, then calls OpenAI TTS (model: tts-1-hd, voice: onyx).
Saves to out/audio/voiceover.mp3.
"""

from pathlib import Path

from openai import OpenAI

from config import OPENAI_API_KEY, OUT_DIR

AUDIO_DIR  = OUT_DIR / "audio"
OUTPUT_MP3 = AUDIO_DIR / "voiceover.mp3"

# Silence between scenes — represented as a pause character TTS naturally respects
SCENE_SEPARATOR = "  "   # double-space gives a brief natural pause in TTS


def _build_script(storyboard: dict) -> str:
    """Concatenate narrations in scene order."""
    parts = [scene["narration"].strip() for scene in storyboard["scenes"]]
    return SCENE_SEPARATOR.join(parts)


def generate_voiceover(storyboard: dict) -> Path:
    """
    Generate the full voiceover MP3.

    Returns:
        Path to out/audio/voiceover.mp3
    """
    if OUTPUT_MP3.exists():
        print(f"  [voiceover] Cached — using existing {OUTPUT_MP3.name}")
        return OUTPUT_MP3

    script = _build_script(storyboard)
    word_count = len(script.split())
    estimated_secs = word_count / 2.5   # ~2.5 words/second
    print(f"  [voiceover] Script: {word_count} words (~{estimated_secs:.0f}s)")
    print(f"  [voiceover] Preview: \"{script[:120]}...\"")

    client = OpenAI(api_key=OPENAI_API_KEY)
    print("  [voiceover] Calling OpenAI TTS (tts-1-hd / onyx)...")

    response = client.audio.speech.create(
        model="tts-1-hd",
        voice="onyx",
        input=script,
        response_format="mp3",
    )

    OUTPUT_MP3.write_bytes(response.content)
    size_kb = OUTPUT_MP3.stat().st_size // 1024
    print(f"  [voiceover] Saved {OUTPUT_MP3.name} ({size_kb} KB, ~{estimated_secs:.0f}s)")
    return OUTPUT_MP3
