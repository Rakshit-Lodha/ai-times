import argparse
import json
import logging
from datetime import datetime

from ..clients import require_openai_client, supabase
from ..parallel_monitors import load_map
from ..prompts.topic_selector import SYSTEM_PROMPT
from ..utils.hash import stable_hash
from ..utils.json import safe_load_json
from ..utils.retry import retry

logger = logging.getLogger(__name__)


def fetch_raw_webhooks(limit: int = 80) -> list[dict]:
    monitor_map = load_map()
    monitor_ids = list(monitor_map.keys())
    if not monitor_ids:
        logger.warning("No creator monitor IDs found in creator_monitor_map.json.")
        return []

    result = (
        supabase.table("webhooks")
        .select("id, news_output, news_date, source_urls, monitor_type, monitor_id, event_group_id, created_at")
        .in_("monitor_id", monitor_ids)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )

    unique = []
    seen = set()
    for row in result.data:
        key = (row.get("news_output") or "").strip()
        if not key or key in seen:
            continue
        seen.add(key)
        unique.append(row)
    return unique


@retry(max_attempts=4)
def select_topics(raw_items: list[dict]) -> dict:
    response = require_openai_client().responses.create(
        model="gpt-5-nano",
        instructions=SYSTEM_PROMPT,
        input="Raw monitor events:\n\n" + json.dumps(raw_items, default=str, ensure_ascii=False),
    )
    return safe_load_json(response.output_text)


def save_candidates(selection: dict, dry_run: bool = False) -> int:
    count = 0
    for item in selection.get("items", []):
        candidate_key = stable_hash(
            {
                "title": item.get("title", "").lower().strip(),
                "category": item.get("category", "").lower().strip(),
                "source_urls": item.get("source_urls", []),
            }
        )
        record = {
            "candidate_key": candidate_key,
            "raw_webhook_ids": item.get("raw_webhook_ids", []),
            "source_type": "parallel",
            "title": item["title"],
            "summary": item.get("summary", ""),
            "category": item["category"],
            "suggested_angle": item.get("suggested_angle", ""),
            "why_relevant": item.get("why_relevant", ""),
            "recommended_format": item.get("recommended_format"),
            "language": item.get("language"),
            "score": int(item.get("score") or 0),
            "status": "new",
            "source_urls": item.get("source_urls", []),
            "metadata": {"selector_run_at": datetime.utcnow().isoformat()},
        }
        if dry_run:
            logger.info("[DRY RUN] Would save candidate: %s", record["title"])
        else:
            supabase.table("creator_topic_candidates").upsert(
                record, on_conflict="candidate_key"
            ).execute()
        count += 1
    return count


def run(limit: int = 80, dry_run: bool = False) -> int:
    raw_items = fetch_raw_webhooks(limit=limit)
    if not raw_items:
        logger.warning("No creator webhook rows found.")
        return 0
    selection = select_topics(raw_items)
    return save_candidates(selection, dry_run=dry_run)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=80)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    logging.basicConfig(level=logging.INFO)
    print(run(limit=args.limit, dry_run=args.dry_run))


if __name__ == "__main__":
    main()
