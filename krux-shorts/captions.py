"""
captions.py — Generate word-level ASS subtitle file from the voiceover.

Uses OpenAI Whisper (whisper-1 via API) with timestamp_granularities=["word"]
to get per-word timing, then writes an ASS file ready for FFmpeg burnin.

Output: out/captions/captions.ass
"""

from pathlib import Path

from openai import OpenAI

from config import OPENAI_API_KEY, OUT_DIR

CAPTIONS_DIR = OUT_DIR / "captions"
OUTPUT_ASS   = CAPTIONS_DIR / "captions.ass"

# Subtitle display: 3 words per line (balances readability and pace)
WORDS_PER_LINE = 3


def _timecode(secs: float) -> str:
    """Convert float seconds to ASS timecode H:MM:SS.CS"""
    cs  = int(round(secs * 100)) % 100
    s   = int(secs) % 60
    m   = int(secs) // 60 % 60
    h   = int(secs) // 3600
    return f"{h}:{m:02d}:{s:02d}.{cs:02d}"


def _ass_header() -> str:
    return """\
[Script Info]
ScriptType: v4.00+
WrapStyle: 0
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,58,&H00FFFFFF,&H000000FF,&H00000000,&HAA000000,1,0,0,0,100,100,0,0,3,0,0,2,20,20,200,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""


def _words_to_ass(words: list[dict]) -> str:
    """Group words into lines and produce ASS Dialogue entries."""
    if not words:
        return ""

    lines: list[str] = []
    i = 0
    while i < len(words):
        chunk = words[i : i + WORDS_PER_LINE]
        start = chunk[0].get("start", 0.0)
        end   = chunk[-1].get("end", start + 1.0)
        text  = " ".join(w["word"].strip() for w in chunk)
        lines.append(
            f"Dialogue: 0,{_timecode(start)},{_timecode(end)},Default,,0,0,0,,{text}"
        )
        i += WORDS_PER_LINE

    return "\n".join(lines)


def generate_captions(audio_path: Path, storyboard: dict) -> Path:
    """
    Transcribe voiceover with Whisper, write ASS subtitle file.

    Args:
        audio_path:  Path to voiceover.mp3
        storyboard:  Storyboard dict (unused directly; kept for interface consistency)

    Returns:
        Path to out/captions/captions.ass
    """
    if OUTPUT_ASS.exists():
        print(f"  [captions] Cached — using existing {OUTPUT_ASS.name}")
        return OUTPUT_ASS

    client = OpenAI(api_key=OPENAI_API_KEY)

    print("  [captions] Transcribing voiceover with whisper-1 (word timestamps)...")
    with audio_path.open("rb") as f:
        transcript = client.audio.transcriptions.create(
            model="whisper-1",
            file=f,
            response_format="verbose_json",
            timestamp_granularities=["word"],
        )

    # transcript.words is a list of WordTimestamp objects
    words = [
        {"word": w.word, "start": w.start, "end": w.end}
        for w in (transcript.words or [])
    ]
    print(f"  [captions] Got {len(words)} word timestamps")

    ass_content = _ass_header() + _words_to_ass(words)
    OUTPUT_ASS.write_text(ass_content, encoding="utf-8")
    print(f"  [captions] Saved {OUTPUT_ASS.name} ({len(words)} words, {WORDS_PER_LINE} per line)")
    return OUTPUT_ASS
