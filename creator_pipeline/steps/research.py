import argparse
import json
import logging

from ..clients import require_openai_client, supabase
from ..prompts.deep_research import SYSTEM_PROMPT
from ..utils.json import safe_load_json
from ..utils.retry import retry

logger = logging.getLogger(__name__)


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
    response = require_openai_client().responses.create(
        model="gpt-5-nano",
        tools=[{"type": "web_search"}],
        include=["web_search_call.action.sources"],
        instructions=SYSTEM_PROMPT,
        input="Selected topic:\n\n" + json.dumps(topic, default=str, ensure_ascii=False),
    )
    return safe_load_json(response.output_text)


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
