import argparse
import json

from ..clients import require_openai_client, supabase
from ..prompts.script_writer import SYSTEM_PROMPT
from ..reference_library import load_style_profile
from ..utils.json import safe_load_json
from ..utils.retry import retry


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


@retry(max_attempts=4)
def generate_script(topic: dict, research: dict, style_profile: str) -> dict:
    payload = {
        "topic": topic,
        "research": research,
        "style_profile": style_profile,
    }
    response = require_openai_client().responses.create(
        model="gpt-5-nano",
        instructions=SYSTEM_PROMPT,
        input=json.dumps(payload, default=str, ensure_ascii=False),
    )
    return safe_load_json(response.output_text)


def save_script(topic_id: str, research_id: str, script: dict) -> dict:
    record = {
        "topic_id": topic_id,
        "research_brief_id": research_id,
        "model_provider": "openai",
        "model": "gpt-5-nano",
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
        },
    }
    result = supabase.table("creator_scripts").insert(record).execute()
    supabase.table("creator_topic_candidates").update({"status": "scripted"}).eq("id", topic_id).execute()
    return result.data[0]


def run(topic_id: str) -> dict:
    topic = fetch_topic(topic_id)
    research = fetch_latest_research(topic_id)
    style_profile = load_style_profile()
    script = generate_script(topic, research, style_profile)
    return save_script(topic_id, research["id"], script)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("topic_id")
    args = parser.parse_args()
    print(json.dumps(run(args.topic_id), indent=2, default=str))


if __name__ == "__main__":
    main()
