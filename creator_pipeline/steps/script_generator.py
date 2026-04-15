import argparse
import json
import logging
import re
import time

from ..clients import require_openai_client, supabase
from ..prompts.script_writer import SYSTEM_PROMPT
from ..reference_library import load_style_profile, select_reference_examples
from ..utils.json import safe_load_json

logger = logging.getLogger(__name__)


BAD_SCRIPT_PATTERNS = [
    r"\b3[- ]step\b",
    r"\bStep\s*[123]\b",
    r"\bPehla beat\b",
    r"\bDusra beat\b",
    r"\bTeesra beat\b",
    r"\bHook\s*:",
    r"\bContext\s*:",
    r"\bBreakdown\s*:",
    r"\bCaveat\s*:",
    r"\bClose\s*/\s*CTA\s*:",
    r"\bCTA\s*:",
    r"\bPrompt\s*[A-Z]\s*:",
    r"\bCampaign\s*[A-Z]\s*:",
    r"funnel clearly defined",
    r"data trackable",
    r"AI signals se decision",
    r"AB testing se funnel gaps",
    r"claims marketing hain",
    r"results vary",
    r"Example skey",
]


def validate_script_quality(script: dict) -> None:
    final_script = (script.get("final_script") or "").strip()
    if not final_script:
        raise ValueError("Script output is missing final_script.")

    bad_matches = [
        pattern for pattern in BAD_SCRIPT_PATTERNS if re.search(pattern, final_script, re.IGNORECASE)
    ]
    if bad_matches:
        raise ValueError(f"Script failed voice quality check: {bad_matches}")

    if re.search(r"[\u0900-\u097F]", final_script):
        raise ValueError("Script must be Roman Hinglish, not Devanagari Hindi.")

    lines = [line.strip() for line in final_script.splitlines() if line.strip()]
    if len(lines) < 5:
        raise ValueError("Script is too paragraph-like; expected short spoken lines.")

    hinglish_markers = [
        "agar",
        "aap",
        "dekho",
        "samjho",
        "iska",
        "yeh",
        "nahi",
        "mat",
        "karo",
        "maan",
        "par",
        "toh",
        "hai",
    ]
    marker_count = sum(1 for marker in hinglish_markers if re.search(rf"\b{marker}\b", final_script, re.IGNORECASE))
    if marker_count < 4:
        raise ValueError("Script does not sound Hinglish enough.")


def fetch_topic(topic_id: str) -> dict:
    return (
        supabase.table("creator_topic_candidates")
        .select("*")
        .eq("id", topic_id)
        .single()
        .execute()
        .data
    )


def fetch_latest_research(topic_id: str) -> dict:
    result = (
        supabase.table("creator_research_briefs")
        .select("*")
        .eq("topic_id", topic_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    if not result.data:
        raise ValueError(f"No research brief found for topic {topic_id}")
    return result.data[0]


def build_reference_payload(topic: dict, limit: int = 4, transcript_chars: int = 1800) -> list[dict]:
    examples = select_reference_examples(topic, limit=limit)
    payload = []
    for example in examples:
        transcript = (example.get("transcript") or "").strip()
        if not transcript:
            continue
        payload.append(
            {
                "title": example.get("title"),
                "topic_category": example.get("topic_category"),
                "content_format": example.get("content_format"),
                "language": example.get("language"),
                "views": example.get("views"),
                "performance_score": example.get("performance_score"),
                "transcript_excerpt": transcript[:transcript_chars],
            }
        )
    return payload


def _build_generation_payload(
    topic: dict,
    research: dict,
    style_profile: str,
    reference_examples: list[dict],
    validation_feedback: dict | None = None,
) -> dict:
    payload = {
        "topic": topic,
        "research": research,
        "style_profile": style_profile,
        "reference_transcript_examples": reference_examples,
    }
    if validation_feedback:
        payload["validation_feedback_from_previous_attempt"] = validation_feedback
        payload["rewrite_instruction"] = (
            "Rewrite from scratch. Do not preserve the failed wording. Keep the same facts, "
            "but change the structure and voice so it passes the validation feedback."
        )
    return payload


def generate_script(topic: dict, research: dict, style_profile: str, reference_examples: list[dict]) -> dict:
    validation_feedback = None
    last_error = None
    for attempt in range(1, 5):
        payload = _build_generation_payload(
            topic,
            research,
            style_profile,
            reference_examples,
            validation_feedback,
        )
        response = require_openai_client().responses.create(
            model="gpt-5.4",
            instructions=SYSTEM_PROMPT,
            input=json.dumps(payload, default=str, ensure_ascii=False),
        )
        script = safe_load_json(response.output_text)
        try:
            validate_script_quality(script)
            return script
        except ValueError as exc:
            last_error = exc
            failed_script = (script.get("final_script") or "")[:1200]
            validation_feedback = {
                "attempt": attempt,
                "error": str(exc),
                "failed_script_excerpt": failed_script,
                "hard_requirements": [
                    "Write Roman Hinglish only, no Devanagari.",
                    "Use short lines separated by newlines.",
                    "Do not include structural labels like Pehla beat, Dusra beat, Teesra beat, Hook, Context, Caveat, Close/CTA, Prompt A, or Campaign A.",
                    "Do not use 3-step, Step 1/2/3, funnel clearly defined, data trackable, AB testing se funnel gaps, or claims marketing hain.",
                    "Open with a business-owner pain point or contrarian statement.",
                ],
            }
            if attempt == 4:
                break
            wait = 2 ** attempt
            logger.warning("generate_script attempt %d/4 failed: %s. Retrying in %ds", attempt, exc, wait)
            time.sleep(wait)
    raise last_error


def save_script(topic_id: str, research_id: str, script: dict, reference_examples: list[dict]) -> dict:
    record = {
        "topic_id": topic_id,
        "research_brief_id": research_id,
        "model_provider": "openai",
        "model": "gpt-5.4",
        "language": script.get("language"),
        "content_format": script.get("content_format"),
        "hook_options": script.get("hook_options", []),
        "final_script": script["final_script"],
        "caption": script.get("caption", ""),
        "broll": script.get("broll", []),
        "cta": script.get("cta", ""),
        "source_urls": script.get("source_urls", []),
        "reference_transcript_ids": [],
        "metadata": {
            "style_profile_source": "creator_pipeline/data/tej_style_profile.md",
            "reference_examples_used": [
                {
                    "title": example.get("title"),
                    "topic_category": example.get("topic_category"),
                    "content_format": example.get("content_format"),
                    "views": example.get("views"),
                    "performance_score": example.get("performance_score"),
                }
                for example in reference_examples
            ],
        },
    }
    result = supabase.table("creator_scripts").insert(record).execute()
    supabase.table("creator_topic_candidates").update({"status": "scripted"}).eq("id", topic_id).execute()
    return result.data[0]


def run(topic_id: str) -> dict:
    topic = fetch_topic(topic_id)
    research = fetch_latest_research(topic_id)
    style_profile = load_style_profile()
    reference_examples = build_reference_payload(topic)
    script = generate_script(topic, research, style_profile, reference_examples)
    return save_script(topic_id, research["id"], script, reference_examples)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("topic_id")
    args = parser.parse_args()
    print(json.dumps(run(args.topic_id), indent=2, default=str))


if __name__ == "__main__":
    main()
