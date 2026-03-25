"""
story_selector.py — Query Supabase for recent stories, have Claude pick the ONE
best story for today's Short, and return it as an enriched dict.

Actual schema (discovered 2026-03-24):
  hundred_word_articles: id, event_id, headline, output, sources (JSON), news_date, topic, created_at
  research_assistant:    id, event_id, output, news_date, topic, created_at
"""

import json
import time

import anthropic
from supabase import create_client

from config import ANTHROPIC_API_KEY, CLAUDE_OPUS, SUPABASE_KEY, SUPABASE_URL
from prompts import STORY_SELECTION_SYSTEM


# ── Supabase helpers ──────────────────────────────────────────────────────────

def _fetch_articles(sb) -> list[dict]:
    """Fetch the 30 most recent articles ordered by created_at DESC."""
    resp = (
        sb.table("hundred_word_articles")
        .select("event_id, id, headline, output, sources, news_date, topic")
        .order("created_at", desc=True)
        .limit(30)
        .execute()
    )
    return resp.data or []


def _fetch_research(sb, event_ids: list[str]) -> dict[str, str]:
    """Return {event_id: research_text} from research_assistant."""
    if not event_ids:
        return {}
    resp = (
        sb.table("research_assistant")
        .select("event_id, output")
        .in_("event_id", event_ids)
        .execute()
    )
    return {row["event_id"]: row.get("output") or "" for row in (resp.data or [])}


def _parse_source_url(sources_raw) -> str:  # str | list | None
    """Extract first URL from the sources JSON field."""
    if not sources_raw:
        return ""
    try:
        if isinstance(sources_raw, str):
            sources = json.loads(sources_raw)
        else:
            sources = sources_raw
        if isinstance(sources, list) and sources:
            return sources[0].get("url") or ""
    except Exception:
        pass
    return ""


def _normalise(article: dict, research_map: dict[str, str]) -> dict:
    eid = str(article.get("event_id") or article.get("id") or "")
    return {
        "event_id":   eid,
        "headline":   article.get("headline") or "",
        "summary":    article.get("output") or "",
        "topic":      article.get("topic") or "",
        "source_url": _parse_source_url(article.get("sources")),
        "news_date":  article.get("news_date") or "",
        "research":   research_map.get(eid, ""),
    }


# ── Claude selection ──────────────────────────────────────────────────────────

def _call_claude_select(stories: list[dict]) -> dict:
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    candidates = [
        {
            "event_id":  s["event_id"],
            "headline":  s["headline"],
            "summary":   s["summary"][:500],
            "topic":     s["topic"],
            "research":  s["research"][:600] if s["research"] else "",
            "news_date": s["news_date"],
        }
        for s in stories
    ]

    user_msg = (
        f"Here are the most recent AI news stories. "
        f"Pick the ONE best for a cinematic short-form video:\n\n"
        f"{json.dumps(candidates, indent=2)}"
    )

    for attempt in range(1, 4):
        try:
            resp = client.messages.create(
                model=CLAUDE_OPUS,
                max_tokens=512,
                system=STORY_SELECTION_SYSTEM,
                messages=[{"role": "user", "content": user_msg}],
            )
            raw = resp.content[0].text.strip()
            if raw.startswith("```"):
                raw = raw.split("```")[1].lstrip("json").strip()
            return json.loads(raw)
        except Exception as exc:
            print(f"  [story_selector] Claude attempt {attempt} failed: {exc}")
            if attempt < 3:
                time.sleep(2 ** attempt)
            else:
                raise


# ── Public entry point ────────────────────────────────────────────────────────

def select_story() -> dict:
    """
    Returns a single story dict:
      event_id, headline, summary, research, source_url, news_date, topic,
      icp_reason, narrative_angle, tone
    """
    sb = create_client(SUPABASE_URL, SUPABASE_KEY)

    articles = _fetch_articles(sb)
    if not articles:
        raise RuntimeError("No articles found in hundred_word_articles")

    print(f"  Found {len(articles)} articles (most recent: {articles[0].get('news_date')})")

    event_ids = [str(a.get("event_id") or a.get("id") or "") for a in articles]
    research_map = _fetch_research(sb, event_ids)
    print(f"  Research available for {len(research_map)}/{len(articles)} articles")

    stories = [_normalise(a, research_map) for a in articles]

    print(f"  Calling Claude {CLAUDE_OPUS} to select best story from {len(stories)} candidates...")
    selection = _call_claude_select(stories)
    selected_id = selection.get("selected_event_id", "")

    matched = next((s for s in stories if s["event_id"] == selected_id), None)
    if matched is None:
        print(f"  Warning: event_id '{selected_id}' not matched — using first story")
        matched = stories[0]

    return {
        **matched,
        "icp_reason":      selection.get("icp_reason", ""),
        "narrative_angle": selection.get("narrative_angle", ""),
        "tone":            selection.get("tone", ""),
    }
