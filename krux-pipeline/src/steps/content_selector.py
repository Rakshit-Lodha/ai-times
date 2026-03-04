import json
import logging

from ..clients import supabase, claude
from ..prompts.content_selector import SYSTEM_PROMPT
from ..utils.json_repair import safe_load_llm_json
from ..utils.retry import retry

logger = logging.getLogger(__name__)


def fetch_webhooks(date: str, next_date: str) -> list[dict]:
    """Fetch webhooks for the date range and deduplicate by exact news_output."""
    result = (
        supabase.table("webhooks")
        .select("id", "news_output", "source_urls", "news_date", "monitor_type", "created_at")
        .gte("created_at", date)
        .lt("created_at", next_date)
        .order("created_at", desc=False)
        .execute()
    )

    unique_results = []
    for item in result.data:
        current_news = item["news_output"]
        if not any(existing["news_output"] == current_news for existing in unique_results):
            unique_results.append(item)

    return unique_results


@retry(max_attempts=3, exceptions=(Exception,))
def curate_stories(webhooks_json: str) -> dict:
    """Call Claude to curate stories from raw webhooks."""
    response = claude.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=10000,
        system=SYSTEM_PROMPT,
        messages=[{
            "role": "user",
            "content": f"Here is the JSON file with all the raw news articles collected:\n\n{webhooks_json}",
        }],
    )
    return safe_load_llm_json(response.content[0].text)


def save_curation_audit(content: dict) -> dict | None:
    """Insert summary stats into curation_audit table."""
    mix = content.get("mix_summary", {})
    payload = {
        "total_stories": content.get("selected_total", 0),
        "funding": mix.get("funding", 0),
        "model_announcements_enhancements": mix.get("model_announcements_enhancements", 0),
        "workflow_improvement": mix.get("workflow_improvement", 0),
        "report": mix.get("report", 0),
        "others": mix.get("others", 0),
        "selection_notes": content.get("selection_notes"),
    }
    res = supabase.table("curation_audit").insert(payload).execute()
    return res.data[0] if res.data else None


def save_curated_items(content: dict, dry_run: bool = False) -> list[dict]:
    """Insert each curated item into curation_selected_items."""
    articles = content.get("items", [])
    saved = []

    for item in articles:
        event_id = f"{item.get('id')}_{item.get('news_date')}"
        record = {
            "event_id": event_id,
            "output": item["output"],
            "news_date": item["news_date"],
            "sources": item["sources"],
            "topic": item["topic"],
        }

        if dry_run:
            logger.info("[DRY RUN] Would save curated item: %s", event_id)
            saved.append(record)
            continue

        # Idempotency check
        existing = (
            supabase.table("curation_selected_items")
            .select("event_id")
            .eq("event_id", event_id)
            .execute()
        )
        if existing.data:
            logger.info("Skipping duplicate event_id: %s", event_id)
            continue

        supabase.table("curation_selected_items").insert(record).execute()
        logger.info("Saved curated item: %s", event_id)
        saved.append(record)

    return saved


def run(date: str, next_date: str, dry_run: bool = False) -> int:
    """Run the full content selection step. Returns count of curated items."""
    webhooks = fetch_webhooks(date, next_date)
    logger.info("Fetched %d unique webhooks for %s", len(webhooks), date)

    if not webhooks:
        logger.warning("No webhooks found for %s. Skipping curation.", date)
        return 0

    webhooks_json = json.dumps(webhooks, default=str)
    content = curate_stories(webhooks_json)
    logger.info("Claude curated %d stories", content.get("selected_total", 0))

    if not dry_run:
        save_curation_audit(content)
        logger.info("Saved curation audit")

    saved = save_curated_items(content, dry_run=dry_run)
    return len(saved)
