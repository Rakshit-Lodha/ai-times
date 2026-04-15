import argparse
import json
import logging
import re

from ..clients import require_openai_client, supabase
from ..prompts.deep_research import SYSTEM_PROMPT
from ..utils.json import safe_load_json
from ..utils.retry import retry

logger = logging.getLogger(__name__)

HINGLISH_RESEARCH_PATTERNS = [
    r"\bke baad\b",
    r"\bsamjho\b",
    r"\bagar\b",
    r"\baap\b",
    r"\bnahi\b",
    r"\bchahiye\b",
    r"\bkarein\b",
    r"\bye(h)?\b",
    r"\btoh\b",
]


def validate_research_language(research: dict) -> None:
    text_parts = [research.get("brief", "")]
    for key in ("key_facts", "examples", "caveats", "audience_takeaways"):
        text_parts.extend(str(item) for item in research.get(key, []) if item)
    text = "\n".join(text_parts)
    matches = [pattern for pattern in HINGLISH_RESEARCH_PATTERNS if re.search(pattern, text, re.IGNORECASE)]
    if len(matches) >= 3:
        raise ValueError(f"Research output appears to be Hinglish/Hindi: {matches}")


def fetch_topic(topic_id: str) -> dict:
    result = (
        supabase.table("creator_topic_candidates")
        .select("*")
        .eq("id", topic_id)
        .single()
        .execute()
    )
    return result.data


@retry(max_attempts=4)
def research_topic(topic: dict) -> dict:
    research_topic_payload = dict(topic)
    research_topic_payload.pop("language", None)
    research_topic_payload.pop("recommended_format", None)

    response = require_openai_client().responses.create(
        model="gpt-5-nano",
        tools=[{"type": "web_search"}],
        include=["web_search_call.action.sources"],
        instructions=SYSTEM_PROMPT,
        input="Selected topic for English research notes:\n\n"
        + json.dumps(research_topic_payload, default=str, ensure_ascii=False),
    )
    research = safe_load_json(response.output_text)
    validate_research_language(research)
    return research


def save_research(topic_id: str, research: dict) -> dict:
    record = {
        "topic_id": topic_id,
        "model_provider": "openai",
        "model": "gpt-5-nano",
        "brief": research["brief"],
        "key_facts": research.get("key_facts", []),
        "examples": research.get("examples", []),
        "caveats": research.get("caveats", []),
        "source_urls": research.get("source_urls", []),
        "metadata": {"audience_takeaways": research.get("audience_takeaways", [])},
    }
    result = supabase.table("creator_research_briefs").insert(record).execute()
    supabase.table("creator_topic_candidates").update({"status": "researched"}).eq("id", topic_id).execute()
    return result.data[0]


def run(topic_id: str) -> dict:
    topic = fetch_topic(topic_id)
    research = research_topic(topic)
    return save_research(topic_id, research)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("topic_id")
    args = parser.parse_args()
    logging.basicConfig(level=logging.INFO)
    print(json.dumps(run(args.topic_id), indent=2, default=str))


if __name__ == "__main__":
    main()
