import argparse
import json
from datetime import datetime

from ..clients import supabase
from ..parallel_monitors import load_map
from ..utils.hash import stable_hash


def _parse_date(value: str | None):
    if not value:
        return None
    try:
        return datetime.fromisoformat(value[:10]).date().isoformat()
    except ValueError:
        return None


def fetch_creator_rows(limit: int = 500) -> list[dict]:
    monitor_map = load_map()
    monitor_ids = list(monitor_map.keys())
    if not monitor_ids:
        return []
    result = (
        supabase.table("webhooks")
        .select("*")
        .in_("monitor_id", monitor_ids)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    return result.data


def to_creator_record(row: dict) -> dict:
    source_urls = row.get("source_urls") or []
    first_source = source_urls[0] if source_urls and isinstance(source_urls[0], dict) else {}
    dedupe_hash = stable_hash(
        {
            "source_webhook_id": row.get("id"),
            "monitor_id": row.get("monitor_id"),
            "event_group_id": row.get("event_group_id"),
            "news_output": row.get("news_output"),
            "source_urls": source_urls,
        }
    )
    return {
        "timestamp": row.get("timestamp"),
        "event_type": row.get("event_type"),
        "event_group_id": row.get("event_group_id"),
        "monitor_id": row.get("monitor_id"),
        "monitor_type": row.get("monitor_type"),
        "source_type": "parallel",
        "source_name": first_source.get("name"),
        "source_url": first_source.get("url"),
        "news_output": row.get("news_output"),
        "news_date": _parse_date(row.get("news_date")),
        "source_urls": source_urls,
        "full_data": {"source_webhook_id": row.get("id"), "source_row": row},
        "dedupe_hash": dedupe_hash,
    }


def sync(limit: int = 500, dry_run: bool = False) -> int:
    rows = fetch_creator_rows(limit=limit)
    count = 0
    for row in rows:
        record = to_creator_record(row)
        if dry_run:
            print(json.dumps(record, ensure_ascii=False, default=str)[:800])
        else:
            supabase.table("creator_raw_webhooks").upsert(record, on_conflict="dedupe_hash").execute()
        count += 1
    return count


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=500)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    print(json.dumps({"synced": sync(limit=args.limit, dry_run=args.dry_run)}))


if __name__ == "__main__":
    main()
