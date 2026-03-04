import logging

from ..clients import supabase, openai_client
from ..prompts import (
    research_funding,
    research_model,
    research_report,
    research_workflow,
    research_others,
)
from ..utils.retry import retry

logger = logging.getLogger(__name__)

# Sequential order — each topic's events are processed sequentially to maximize
# prompt caching (same system prompt reused across all events in a topic).
TOPIC_PIPELINE = [
    ("Funding", research_funding.SYSTEM_PROMPT),
    ("Model announcements/enhancements", research_model.SYSTEM_PROMPT),
    ("Report", research_report.SYSTEM_PROMPT),
    ("Workflow improvement", research_workflow.SYSTEM_PROMPT),
    ("Others", research_others.SYSTEM_PROMPT),
]

# Topics where the notebook passes sources in the event input
_TOPICS_WITH_SOURCES = {"Funding", "Model announcements/enhancements", "Others", "Report"}


def fetch_curated_by_topic(date: str, next_date: str, topic: str) -> list[dict]:
    """Fetch curated items for a specific topic, created today."""
    result = (
        supabase.table("curation_selected_items")
        .select("event_id, output, sources, news_date, topic")
        .gte("created_at", date)
        .lt("created_at", next_date)
        .eq("topic", topic)
        .order("created_at", desc=False)
        .execute()
    )
    return result.data


@retry(max_attempts=3, exceptions=(Exception,))
def research_single_event(event: dict, system_prompt: str, topic: str) -> str:
    """Call OpenAI GPT-5-nano with web_search for a single event."""
    # Build event input — some topics include sources, workflow does not
    if topic in _TOPICS_WITH_SOURCES:
        event_input = f"Event to research:\nEvent: {event['output']}\nSources: {event['sources']}"
    else:
        # Workflow enhancement notebook just passes the output directly
        event_input = f"Report/event to research:\n{event['output']}"

    response = openai_client.responses.create(
        model="gpt-5-nano",
        tools=[{"type": "web_search"}],
        include=["web_search_call.action.sources"],
        instructions=system_prompt,
        input=event_input,
    )
    return response.output_text


def save_research(record: dict, dry_run: bool = False) -> None:
    """Save a research result to the research_assistant table."""
    if dry_run:
        logger.info("[DRY RUN] Would save research for: %s", record["event_id"])
        return

    existing = (
        supabase.table("research_assistant")
        .select("event_id")
        .eq("event_id", record["event_id"])
        .execute()
    )
    if existing.data:
        logger.info("Skipping duplicate research event_id: %s", record["event_id"])
        return

    supabase.table("research_assistant").insert({
        "event_id": record["event_id"],
        "model_provider": "openai",
        "news_date": record["news_date"],
        "output": record["output"],
        "topic": record["topic"],
    }).execute()


def research_topic(
    date: str, next_date: str, topic: str, system_prompt: str, dry_run: bool = False
) -> int:
    """Research all events for a single topic. Returns success count."""
    events = fetch_curated_by_topic(date, next_date, topic)
    if not events:
        logger.info("%s: no curated items found", topic)
        return 0

    logger.info("%s: researching %d events", topic, len(events))
    success, failed = 0, 0

    for event in events:
        try:
            # Skip already-researched events before calling the API
            existing = (
                supabase.table("research_assistant")
                .select("event_id")
                .eq("event_id", event["event_id"])
                .execute()
            )
            if existing.data:
                logger.info("%s: skipping already-researched %s", topic, event["event_id"])
                success += 1
                continue

            output = research_single_event(event, system_prompt, topic)
            record = {
                "event_id": event["event_id"],
                "news_date": event["news_date"],
                "output": output,
                "topic": event["topic"],
            }
            save_research(record, dry_run=dry_run)
            success += 1
            logger.info("%s: researched %s", topic, event["event_id"])
        except Exception as e:
            logger.error("%s: event %s failed: %s", topic, event["event_id"], e)
            failed += 1

    logger.info("%s: %d succeeded, %d failed", topic, success, failed)
    return success


def run(date: str, next_date: str, dry_run: bool = False) -> dict[str, int | str]:
    """Run research for all topics sequentially. Returns per-topic results."""
    results = {}
    for topic, system_prompt in TOPIC_PIPELINE:
        try:
            count = research_topic(date, next_date, topic, system_prompt, dry_run=dry_run)
            results[topic] = count
        except Exception as e:
            logger.error("Research pipeline failed for %s: %s", topic, e, exc_info=True)
            results[topic] = f"FAILED: {e}"
    return results
