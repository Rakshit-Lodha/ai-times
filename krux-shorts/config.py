"""
config.py — Environment variable loading and shared constants.

Reads from the repo-root .env (one level up from krux-shorts/).
Handles the existing SUPBASE_KEY typo and CLAUDE_API_KEY alias.
"""

import os
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from dotenv import load_dotenv

_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_env_path)

IST = ZoneInfo("Asia/Kolkata")


def _require(*names: str) -> str:
    """Return the first env var from `names` that has a value."""
    for name in names:
        val = os.environ.get(name, "").strip()
        if val:
            return val
    raise KeyError(
        f"Missing required env var — tried: {', '.join(names)}"
    )


def today_ist() -> str:
    return datetime.now(IST).strftime("%Y-%m-%d")


# ── API keys ────────────────────────────────────────────────────────────────
# Anthropic: env may store as ANTHROPIC_API_KEY or CLAUDE_API_KEY
ANTHROPIC_API_KEY = _require("ANTHROPIC_API_KEY", "CLAUDE_API_KEY")
OPENAI_API_KEY    = _require("OPENAI_API_KEY")
# Supabase: existing infra uses the typo'd SUPBASE_KEY
SUPABASE_URL      = _require("SUPABASE_URL")
SUPABASE_KEY      = _require("SUPABASE_KEY", "SUPBASE_KEY")
FAL_KEY           = _require("FAL_KEY")

# Expose FAL_KEY to fal-client (reads from environment at import time)
os.environ["FAL_KEY"] = FAL_KEY

# ── Directories ─────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent
OUT_DIR  = BASE_DIR / "out"

for _d in [
    OUT_DIR / "images",
    OUT_DIR / "clips",
    OUT_DIR / "audio",
    OUT_DIR / "captions",
    OUT_DIR / "tmp",
]:
    _d.mkdir(parents=True, exist_ok=True)

# ── Model names ──────────────────────────────────────────────────────────────
CLAUDE_OPUS   = "claude-opus-4-5"
CLAUDE_SONNET = "claude-sonnet-4-5"
