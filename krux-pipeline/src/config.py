import os
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from pathlib import Path

from dotenv import load_dotenv

# Load .env from repo root (one level up from krux-pipeline/)
_env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(_env_path)

IST = ZoneInfo("Asia/Kolkata")


def get_processing_dates(override_date: str | None = None) -> tuple[str, str]:
    """Return (date, next_date) strings for the pipeline run.

    Default: yesterday and today in IST.
    Override: parse the given YYYY-MM-DD string.
    """
    if override_date:
        d = datetime.strptime(override_date, "%Y-%m-%d")
        return override_date, (d + timedelta(days=1)).strftime("%Y-%m-%d")

    now = datetime.now(IST)
    yesterday = now - timedelta(days=1)
    return yesterday.strftime("%Y-%m-%d"), now.strftime("%Y-%m-%d")


def get_today_range() -> tuple[str, str]:
    """Return (today, tomorrow) in IST — for filtering rows created during this run."""
    now = datetime.now(IST)
    today = now.strftime("%Y-%m-%d")
    tomorrow = (now + timedelta(days=1)).strftime("%Y-%m-%d")
    return today, tomorrow


def _require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise KeyError(f"Missing required environment variable: {name}")
    return value


SUPABASE_URL = _require_env("SUPABASE_URL")
SUPABASE_KEY = _require_env("SUPBASE_KEY")  # typo preserved to match existing env
CLAUDE_API_KEY = _require_env("CLAUDE_API_KEY")
OPENAI_API_KEY = _require_env("OPENAI_API_KEY")
