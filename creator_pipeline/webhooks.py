from datetime import datetime

from .clients import supabase
from .utils.hash import stable_hash
from .utils.retry import retry


def _parse_date(value: str | None):
    if not value:
        return None
    try:
        return datetime.fromisoformat(value[:10]).date().isoformat()
    except ValueError:
        return None


def build_creator_webhook_record(
    *,
    webhook_data: dict,
    event: dict,
    event_group_id: str,
    monitor_id: str,
    monitor_type: str,
) -> dict:
    source_urls = event.get("source_urls") or []
    first_source = source_urls[0] if source_urls and isinstance(source_urls[0], dict) else {}
    news_output = event.get("output")
    dedupe_hash = stable_hash(
        {
            "monitor_id": monitor_id,
            "event_group_id": event_group_id,
            "output": news_output,
            "source_urls": source_urls,
        }
    )

    return {
        "timestamp": webhook_data.get("timestamp"),
        "event_type": webhook_data.get("type"),
        "event_group_id": event_group_id,
        "monitor_id": monitor_id,
        "monitor_type": monitor_type,
        "source_type": "parallel",
        "source_name": first_source.get("name"),
        "source_url": first_source.get("url"),
        "news_output": news_output,
        "news_date": _parse_date(event.get("event_date")),
        "source_urls": source_urls,
        "full_data": {"webhook": webhook_data, "event": event},
        "dedupe_hash": dedupe_hash,
    }


@retry(max_attempts=4)
def save_creator_webhook(record: dict) -> dict | None:
    result = (
        supabase.table("creator_raw_webhooks")
        .upsert(record, on_conflict="dedupe_hash")
        .execute()
    )
    return result.data[0] if result.data else None

