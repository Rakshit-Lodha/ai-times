"""
storyboard.py — Two-step Claude pipeline:
  1. Metaphor pass (Opus): finds the visual/emotional world of the story.
  2. Storyboard pass (Opus): writes the full scene-by-scene script.

Returns a storyboard dict with `scenes` list ready for the rest of the pipeline.
"""

import json
import time

import anthropic

from config import ANTHROPIC_API_KEY, CLAUDE_OPUS
from prompts import METAPHOR_SYSTEM, STORYBOARD_SYSTEM


def _call_claude(system: str, user_msg: str, max_tokens: int = 2048) -> dict:
    """Single Claude Opus call; strips markdown fences; retries 3×."""
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    for attempt in range(1, 4):
        try:
            resp = client.messages.create(
                model=CLAUDE_OPUS,
                max_tokens=max_tokens,
                system=system,
                messages=[{"role": "user", "content": user_msg}],
            )
            raw = resp.content[0].text.strip()
            if raw.startswith("```"):
                raw = raw.split("```")[1].lstrip("json").strip()
            return json.loads(raw)
        except Exception as exc:
            print(f"  [storyboard] Claude attempt {attempt} failed: {exc}")
            if attempt < 3:
                time.sleep(2 ** attempt)
            else:
                raise


def generate_storyboard(story: dict) -> dict:
    """
    Args:
        story: dict from story_selector.select_story()

    Returns:
        {
          "title": "...",
          "total_duration": int,
          "scenes": [...],
          "metaphor": {...}   # metaphor pass output, attached for reference
        }
    """
    # ── Step 1: Metaphor ──────────────────────────────────────────────────────
    print("  Step 2a — generating visual metaphor...")
    metaphor_user = (
        f"Headline: {story['headline']}\n\n"
        f"Summary: {story['summary']}\n\n"
        f"Research: {story['research'][:1200] if story['research'] else 'N/A'}\n\n"
        f"Narrative angle: {story['narrative_angle']}\n"
        f"Tone: {story['tone']}"
    )
    metaphor = _call_claude(METAPHOR_SYSTEM, metaphor_user, max_tokens=512)
    print(f"  Metaphor: {metaphor.get('metaphor', '')}")
    print(f"  Core drama: {metaphor.get('core_drama', '')}")
    print(f"  Color palette: {metaphor.get('color_palette', '')}")

    # ── Step 2: Storyboard ────────────────────────────────────────────────────
    print("  Step 2b — writing full storyboard...")
    storyboard_user = (
        f"STORY:\n"
        f"Headline: {story['headline']}\n"
        f"Summary: {story['summary']}\n"
        f"Research: {story['research'][:1500] if story['research'] else 'N/A'}\n"
        f"Source: {story['source_url']}\n\n"
        f"METAPHOR DIRECTION:\n"
        f"{json.dumps(metaphor, indent=2)}\n\n"
        f"ICP reason: {story['icp_reason']}\n"
        f"Tone: {story['tone']}"
    )
    board = _call_claude(STORYBOARD_SYSTEM, storyboard_user, max_tokens=3000)

    # Attach metaphor for downstream reference
    board["metaphor"] = metaphor
    return board
