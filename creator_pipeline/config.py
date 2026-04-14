import os
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(ROOT_DIR / ".env")

IST = ZoneInfo("Asia/Kolkata")


def require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise KeyError(f"Missing required environment variable: {name}")
    return value


def optional_env(name: str, default: str = "") -> str:
    return os.environ.get(name, default)


def today_range() -> tuple[str, str]:
    now = datetime.now(IST)
    tomorrow = now + timedelta(days=1)
    return now.strftime("%Y-%m-%d"), tomorrow.strftime("%Y-%m-%d")


def days_ago_range(days: int) -> tuple[str, str]:
    now = datetime.now(IST)
    start = now - timedelta(days=days)
    return start.strftime("%Y-%m-%d"), now.strftime("%Y-%m-%d")


SUPABASE_URL = require_env("SUPABASE_URL")
SUPABASE_KEY = require_env("SUPBASE_KEY")  # Existing project env keeps this typo.
OPENAI_API_KEY = optional_env("OPENAI_API_KEY")
PARALLEL_API_KEY = optional_env("PARALLEL_API_KEY")
YOUTUBE_API_KEY = optional_env("YOUTUBE_API_KEY")
SARVAM_API_KEY = optional_env("SARVAM_API_KEY")

CREATOR_WEBHOOK_URL = optional_env(
    "CREATOR_PARALLEL_WEBHOOK_URL",
    "https://ai-times-6utx.onrender.com/parallel-webhooks",
)
