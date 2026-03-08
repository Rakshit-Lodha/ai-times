import logging
from datetime import datetime, timedelta
from html.parser import HTMLParser

import feedparser

from ..clients import supabase
from ..feeds import FEEDS, FeedSource
from ..utils.retry import retry

logger = logging.getLogger(__name__)

_MAX_AGE_DAYS = 7


def _entry_guid(entry) -> str:
    return entry.get("id") or entry.get("link") or ""


def _entry_published_date(entry) -> str | None:
    for field in ("published_parsed", "updated_parsed"):
        parsed = entry.get(field)
        if parsed:
            return datetime(*parsed[:3]).strftime("%Y-%m-%d")
    return None


def _is_too_old(entry) -> bool:
    for field in ("published_parsed", "updated_parsed"):
        parsed = entry.get(field)
        if parsed:
            pub_dt = datetime(*parsed[:3])
            cutoff = datetime.now() - timedelta(days=_MAX_AGE_DAYS)
            return pub_dt < cutoff
    return False


def _strip_html(text: str) -> str:
    class _Strip(HTMLParser):
        def __init__(self):
            super().__init__()
            self.parts: list[str] = []

        def handle_data(self, d):
            self.parts.append(d)

    s = _Strip()
    s.feed(text)
    return " ".join(" ".join(s.parts).split())


def _format_news_output(entry, feed: FeedSource) -> str:
    title = entry.get("title", "").strip()
    summary = entry.get("summary", "").strip()
    if summary and "<" in summary:
        summary = _strip_html(summary)
    if len(summary) > 500:
        summary = summary[:497] + "..."
    return f"{feed.company}: {title}. {summary}" if summary else f"{feed.company}: {title}"


def _extract_source_urls(entry, feed: FeedSource) -> list[dict]:
    link = entry.get("link", "")
    return [{"name": feed.name, "url": link}] if link else []


def _is_already_seen(feed: FeedSource, guid: str) -> bool:
    result = (
        supabase.table("webhooks")
        .select("id")
        .eq("monitor_type", "rss")
        .eq("event_group_id", feed.feed_id)
        .eq("monitor_id", guid)
        .limit(1)
        .execute()
    )
    return bool(result.data)


@retry(max_attempts=2, exceptions=(Exception,))
def _fetch_feed(feed: FeedSource) -> list:
    parsed = feedparser.parse(feed.url)
    if parsed.bozo and not parsed.entries:
        raise ValueError(f"Feed parse error for {feed.feed_id}: {parsed.bozo_exception}")
    return parsed.entries


def _process_feed(feed: FeedSource, dry_run: bool = False) -> int:
    try:
        entries = _fetch_feed(feed)
    except Exception as e:
        logger.error("Failed to fetch feed %s: %s", feed.feed_id, e)
        return 0

    new_count = 0
    for entry in entries:
        guid = _entry_guid(entry)
        if not guid:
            continue
        if _is_too_old(entry):
            continue
        if _is_already_seen(feed, guid):
            continue

        record = {
            "event_type": "rss_entry",
            "event_group_id": feed.feed_id,
            "monitor_id": guid,
            "monitor_type": "rss",
            "news_output": _format_news_output(entry, feed),
            "news_date": _entry_published_date(entry) or datetime.now().strftime("%Y-%m-%d"),
            "source_urls": _extract_source_urls(entry, feed),
            "full_data": {
                "title": entry.get("title"),
                "link": entry.get("link"),
                "summary": entry.get("summary"),
                "published": entry.get("published"),
                "feed_id": feed.feed_id,
            },
        }

        if dry_run:
            logger.info("[DRY RUN] Would insert: %s — %s", feed.feed_id, entry.get("title", ""))
            new_count += 1
            continue

        supabase.table("webhooks").insert(record).execute()
        logger.info("Inserted RSS entry: %s — %s", feed.feed_id, entry.get("title", ""))
        new_count += 1

    return new_count


def run(dry_run: bool = False) -> int:
    total = 0
    for feed in FEEDS:
        count = _process_feed(feed, dry_run=dry_run)
        logger.info("Feed %s: %d new entries", feed.feed_id, count)
        total += count
    logger.info("RSS monitor complete: %d total new entries across %d feeds", total, len(FEEDS))
    return total
