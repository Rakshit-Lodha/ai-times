import json
import logging

from .. import store
from ..clients import claude
from ..prompts.summary import SYSTEM_PROMPT, ARTICLE_TOOL
from ..utils.retry import retry

logger = logging.getLogger(__name__)


def fetch_researched_articles(date: str, next_date: str) -> list[dict]:
    """Fetch research briefs from research_assistant, created today."""
    return store.select("research_assistant", store.created_between(date, next_date))


@retry(max_attempts=3, exceptions=(Exception,))
def generate_summary(article: dict) -> dict:
    """Call Claude with tool_use to generate a structured 100-word summary."""
    response = claude.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=800,
        system=SYSTEM_PROMPT,
        tools=[ARTICLE_TOOL],
        tool_choice={"type": "tool", "name": "write_article"},
        messages=[{
            "role": "user",
            "content": f"Research notes:\n{article['output']}\n\nTopic:\n{article['topic']}",
        }],
    )
    # tool_use response — the SDK returns the tool input already deserialized
    return response.content[0].input


def save_article(article_json: dict, dry_run: bool = False) -> None:
    """Save a 100-word article to the hundred_word_articles table."""
    if dry_run:
        logger.info(
            "[DRY RUN] Would save article: %s — %s",
            article_json["event_id"], article_json["headline"],
        )
        return

    if store.exists("hundred_word_articles", lambda r: r.get("event_id") == article_json["event_id"]):
        logger.info("Skipping duplicate article event_id: %s", article_json["event_id"])
        return

    store.insert("hundred_word_articles", {
        "event_id": article_json["event_id"],
        "model_provider": "claude",
        "news_date": article_json["news_date"],
        "sources": json.dumps(article_json["sources"]),
        "output": article_json["output"],
        "headline": article_json["headline"],
        "topic": article_json["topic"],
        "image_url": None,
    })


def run(date: str, next_date: str, dry_run: bool = False) -> int:
    """Generate 100-word summaries for all researched articles. Returns success count."""
    articles = fetch_researched_articles(date, next_date)
    if not articles:
        logger.warning("No researched articles found for %s", date)
        return 0

    logger.info("Generating summaries for %d articles", len(articles))
    success, failed = 0, 0

    for article in articles:
        try:
            # Skip already-summarized events before calling the API
            if store.exists("hundred_word_articles", lambda r: r.get("event_id") == article["event_id"]):
                logger.info("Skipping already-summarized: %s", article["event_id"])
                success += 1
                continue

            summary = generate_summary(article)
            summary["event_id"] = article["event_id"]
            summary["news_date"] = article["news_date"]
            summary["topic"] = article["topic"]

            save_article(summary, dry_run=dry_run)
            success += 1
            logger.info("Summary generated: %s", summary["headline"])
        except Exception as e:
            logger.error(
                "Summary failed for %s: %s", article["event_id"], e, exc_info=True
            )
            failed += 1

    logger.info("Summaries: %d succeeded, %d failed", success, failed)
    return success
