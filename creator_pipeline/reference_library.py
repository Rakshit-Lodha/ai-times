import ast
import csv
from pathlib import Path

DEFAULT_REFERENCE_FILE = Path("/Users/Rakshit.Lodha/Downloads/refrences_tej.json")
DEFAULT_TAGS_FILE = Path(__file__).resolve().parent.parent / "enriched_data_1.csv"
DEFAULT_STYLE_FILE = Path(__file__).resolve().parent / "data" / "tej_style_profile.md"
FALLBACK_STYLE_FILE = Path(__file__).resolve().parent.parent / "reference_analysis.txt"


def _to_int(value) -> int | None:
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return None


def _performance_score(views: int | None, likes: int | None, comments: int | None) -> int:
    views = views or 0
    likes = likes or 0
    comments = comments or 0
    if views >= 1_000_000:
        base = 100
    elif views >= 100_000:
        base = 90
    elif views >= 40_000:
        base = 80
    elif views >= 10_000:
        base = 70
    else:
        base = 45
    engagement_bonus = min(10, int(((likes + comments * 2) / max(views, 1)) * 1000))
    return min(100, base + engagement_bonus)


def _load_tags(path: Path = DEFAULT_TAGS_FILE) -> dict[str, dict]:
    if not path.exists():
        return {}
    tags = {}
    with path.open("r", encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            link = row.get("link")
            if not link:
                continue
            try:
                sub_topics = ast.literal_eval(row.get("tags.sub_topics") or "[]")
            except (ValueError, SyntaxError):
                sub_topics = []
            tags[link] = {
                "primary_topic": row.get("tags.primary_topic"),
                "topic_category": row.get("tags.topic_category"),
                "content_format": row.get("tags.content_format"),
                "sub_topics": sub_topics,
                "language": row.get("tags.language"),
            }
    return tags


def load_reference_examples(
    reference_file: Path = DEFAULT_REFERENCE_FILE,
    tags_file: Path = DEFAULT_TAGS_FILE,
) -> list[dict]:
    payload = ast.literal_eval(reference_file.read_text(encoding="utf-8"))
    tag_by_link = _load_tags(tags_file)
    rows = []

    def visit(node):
        if isinstance(node, dict) and "channel_id" in node and "creator_data" in node:
            creator = node.get("channel_id")
            for video in node.get("creator_data") or []:
                transcript_obj = video.get("transcript") or {}
                transcript = ""
                if isinstance(transcript_obj, dict) and transcript_obj:
                    transcript = next(iter(transcript_obj.values())) or ""
                link = video.get("link")
                tags = tag_by_link.get(link, {})
                views = _to_int(video.get("views"))
                likes = _to_int(video.get("likes"))
                comments = _to_int(video.get("comments"))
                rows.append(
                    {
                        "creator": creator,
                        "title": video.get("title"),
                        "link": link,
                        "views": views,
                        "likes": likes,
                        "comments": comments,
                        "duration_secs": video.get("duration_secs"),
                        "transcript": transcript,
                        **tags,
                        "performance_score": _performance_score(views, likes, comments),
                    }
                )
        elif isinstance(node, list):
            for item in node:
                visit(item)

    visit(payload)
    return rows


def load_style_profile(style_file: Path = DEFAULT_STYLE_FILE) -> str:
    if style_file.exists():
        return style_file.read_text(encoding="utf-8")
    if FALLBACK_STYLE_FILE.exists():
        return FALLBACK_STYLE_FILE.read_text(encoding="utf-8")
    return ""


def select_reference_examples(topic: dict, limit: int = 5) -> list[dict]:
    category = topic.get("category")
    content_format = topic.get("recommended_format")
    examples = load_reference_examples()
    if category:
        category_matches = [e for e in examples if e.get("topic_category") == category]
        if category_matches:
            examples = category_matches
    if content_format:
        format_matches = [e for e in examples if e.get("content_format") == content_format]
        if format_matches:
            examples = format_matches
    examples.sort(key=lambda e: e.get("performance_score") or 0, reverse=True)
    return examples[:limit]
