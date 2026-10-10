"""File-backed tables that replace the old Supabase database.

Each table is a JSON array on disk. The GitHub Actions workflow commits the
changed files after every run, so git is the database and its history is the
backup. Published articles and their images live inside krux-web so the site
can serve them directly.
"""
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable

_REPO_ROOT = Path(__file__).resolve().parent.parent.parent
PIPELINE_DATA_DIR = _REPO_ROOT / "krux-pipeline" / "data"
WEB_DATA_DIR = _REPO_ROOT / "krux-web" / "data"
IMAGE_DIR = _REPO_ROOT / "krux-web" / "public" / "article-images"
IMAGE_URL_PREFIX = "/article-images"

_TABLE_PATHS = {
    "webhooks": PIPELINE_DATA_DIR / "webhooks.json",
    "curation_audit": PIPELINE_DATA_DIR / "curation_audit.json",
    "curation_selected_items": PIPELINE_DATA_DIR / "curation_selected_items.json",
    "research_assistant": PIPELINE_DATA_DIR / "research_assistant.json",
    "hundred_word_articles": WEB_DATA_DIR / "hundred_word_articles.json",
}

Row = dict
Where = Callable[[Row], bool]


def _path(table: str) -> Path:
    return _TABLE_PATHS[table]


def _load(table: str) -> list[Row]:
    path = _path(table)
    if not path.exists():
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _save(table: str, rows: list[Row]) -> None:
    path = _path(table)
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".json.tmp")
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False, indent=1, default=str)
        f.write("\n")
    tmp.replace(path)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def parse_ts(value: str) -> datetime:
    """Parse a stored timestamp or a bare YYYY-MM-DD (treated as UTC midnight,
    the same way Postgres compared these strings before)."""
    dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def created_between(start: str, end: str) -> Where:
    lo, hi = parse_ts(start), parse_ts(end)
    return lambda row: bool(row.get("created_at")) and lo <= parse_ts(row["created_at"]) < hi


def select(table: str, where: Where | None = None) -> list[Row]:
    """Rows matching `where`, oldest first by created_at."""
    rows = [r for r in _load(table) if where is None or where(r)]
    return sorted(rows, key=lambda r: parse_ts(r["created_at"]) if r.get("created_at") else datetime.min.replace(tzinfo=timezone.utc))


def exists(table: str, where: Where) -> bool:
    return any(where(r) for r in _load(table))


def _next_id(rows: list[Row]) -> int | str:
    if any(isinstance(r.get("id"), str) for r in rows):
        return str(uuid.uuid4())
    return max((r.get("id") or 0 for r in rows), default=0) + 1


def insert(table: str, record: Row) -> Row:
    """Append a row, assigning an id (auto-increment, or a UUID for tables that
    used UUID keys in Supabase) and created_at."""
    rows = _load(table)
    row = {
        "id": _next_id(rows),
        "created_at": now_iso(),
        **record,
    }
    rows.append(row)
    _save(table, rows)
    return row


def update(table: str, where: Where, changes: Row) -> int:
    rows = _load(table)
    count = 0
    for r in rows:
        if where(r):
            r.update(changes)
            count += 1
    if count:
        _save(table, rows)
    return count


def delete(table: str, where: Where) -> int:
    rows = _load(table)
    kept = [r for r in rows if not where(r)]
    if len(kept) != len(rows):
        _save(table, kept)
    return len(rows) - len(kept)
