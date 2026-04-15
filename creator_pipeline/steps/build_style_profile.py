import argparse
import json
from pathlib import Path

from ..clients import require_openai_client
from ..reference_library import DEFAULT_REFERENCE_FILE, DEFAULT_TAGS_FILE, load_reference_examples

DEFAULT_OUTPUT_FILE = Path(__file__).resolve().parent.parent / "data" / "tej_style_profile.md"

SYSTEM_PROMPT = """You are analyzing a short-form creator's winning video transcripts.

Create a reusable script-writing style profile from the provided reference transcripts.
This profile will be used as prompt context for future short-form video scripts.

This must be a SCRIPT VOICE PROFILE, not a LinkedIn writing profile and not generic
content strategy advice.

Analyze the transcripts and extract:
- exact hook mechanics used in the first 3-8 seconds
- sentence rhythm and line length for spoken delivery
- Hinglish/Hindi/English mix, including common spoken phrases
- how the creator explains business/news/finance ideas without sounding formal
- how examples are introduced ("maan lo", "suppose", roleplay, customer scene, etc.)
- how claims, caveats, and numbers are spoken naturally
- common transitions and close/CTA patterns
- category-specific delivery patterns for sales, business strategy, marketing,
  ecommerce, investing/finance, personal development, paid ads, government schemes,
  and startup ideas
- strict bans: phrases and structures that would sound like translated explainer copy

Output markdown only.

Make it operational for a script generator:
- include "DO" and "DO NOT" rules
- include 5-8 reusable spoken templates
- include 3 examples of bad formal English/marketing-copy lines rewritten into the
  creator's Hinglish style
- include a final self-check rubric that a generated script must pass

Do not include generic advice like "be engaging" or "use concrete examples" unless you
describe exactly how this creator does it.
"""


def build_payload(limit_transcript_chars: int = 2500) -> list[dict]:
    refs = load_reference_examples(DEFAULT_REFERENCE_FILE, DEFAULT_TAGS_FILE)
    payload = []
    for ref in refs:
        payload.append(
            {
                "creator": ref.get("creator"),
                "title": ref.get("title"),
                "views": ref.get("views"),
                "likes": ref.get("likes"),
                "comments": ref.get("comments"),
                "duration_secs": ref.get("duration_secs"),
                "primary_topic": ref.get("primary_topic"),
                "topic_category": ref.get("topic_category"),
                "content_format": ref.get("content_format"),
                "language": ref.get("language"),
                "performance_score": ref.get("performance_score"),
                "transcript": (ref.get("transcript") or "")[:limit_transcript_chars],
            }
        )
    return payload


def build_style_profile(output_file: Path = DEFAULT_OUTPUT_FILE) -> str:
    response = require_openai_client().responses.create(
        model="gpt-5-nano",
        instructions=SYSTEM_PROMPT,
        input="Reference transcripts and metadata:\n\n"
        + json.dumps(build_payload(), ensure_ascii=False, default=str),
    )
    output_file.parent.mkdir(parents=True, exist_ok=True)
    output_file.write_text(response.output_text, encoding="utf-8")
    return str(output_file)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-file", default=str(DEFAULT_OUTPUT_FILE))
    args = parser.parse_args()
    print(build_style_profile(Path(args.output_file)))


if __name__ == "__main__":
    main()
