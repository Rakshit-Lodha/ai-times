"""One-shot export of Krux data out of Supabase into this repo.

Pulls every public table through a temporary edge function (which only trusts
this repo's GitHub Actions OIDC token) and downloads every image from the
public `article-image` bucket, converting them to WebP so the website can
serve them directly.
"""
import io
import json
import os
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.parse import unquote, urlparse

import requests
from PIL import Image

PROJECT = "https://wbssuitpowuljcvazlnd.supabase.co"
EXPORT_FN = f"{PROJECT}/functions/v1/krux-export"
ROOT = Path(__file__).resolve().parent.parent

PIPELINE_TABLES = ["webhooks", "curation_audit", "curation_selected_items", "research_assistant"]
WEB_TABLES = ["hundred_word_articles", "learn_stacks", "learn_stack_cards"]
ARCHIVE_TABLES = [
    "articles", "creator_raw_webhooks", "creator_topic_candidates",
    "creator_research_briefs", "creator_scripts",
]
IMAGE_DIR = ROOT / "krux-web" / "public" / "article-images"
BUCKET_PREFIX = "/storage/v1/object/public/article-image/"


def github_oidc_token() -> str:
    r = requests.get(
        os.environ["ACTIONS_ID_TOKEN_REQUEST_URL"],
        params={"audience": "krux-export"},
        headers={"Authorization": f"Bearer {os.environ['ACTIONS_ID_TOKEN_REQUEST_TOKEN']}"},
        timeout=30,
    )
    r.raise_for_status()
    return r.json()["value"]


def fetch_all(table: str) -> list[dict]:
    rows, off, page = [], 0, 500
    while True:
        # OIDC tokens are short-lived, so mint one per request.
        r = requests.get(
            EXPORT_FN,
            params={"table": table, "offset": off, "limit": page},
            headers={"Authorization": f"Bearer {github_oidc_token()}"},
            timeout=120,
        )
        r.raise_for_status()
        batch = r.json()
        rows.extend(batch)
        if len(batch) < page:
            return rows
        off += page


def write_json(path: Path, rows) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False, indent=1)
        f.write("\n")
    print(f"wrote {path.relative_to(ROOT)} ({len(rows)} rows)")


def convert(name: str) -> tuple[str, str | None]:
    out = IMAGE_DIR / (Path(name).stem + ".webp")
    err: Exception | None = None
    for _ in range(3):
        try:
            r = requests.get(PROJECT + BUCKET_PREFIX + name, timeout=120)
            r.raise_for_status()
            with Image.open(io.BytesIO(r.content)) as img:
                img = img.convert("RGB")
                if img.width > 1200:
                    img = img.resize((1200, round(img.height * 1200 / img.width)), Image.LANCZOS)
                img.save(out, "WEBP", quality=80, method=6)
            return name, out.name
        except Exception as e:  # noqa: BLE001
            err = e
    print(f"FAILED image {name}: {err}", file=sys.stderr)
    return name, None


def main() -> None:
    for t in PIPELINE_TABLES:
        write_json(ROOT / "krux-pipeline" / "data" / f"{t}.json", fetch_all(t))
    for t in ARCHIVE_TABLES:
        write_json(ROOT / "supabase-export" / f"{t}.json", fetch_all(t))

    objects = fetch_all("storage_objects")
    write_json(ROOT / "supabase-export" / "storage_objects.json", objects)

    IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    names = [o["name"] for o in objects if o["bucket_id"] == "article-image"]
    with ThreadPoolExecutor(max_workers=16) as pool:
        converted = dict(pool.map(convert, names))
    failed = [n for n, v in converted.items() if v is None]
    print(f"images: {len(names) - len(failed)} converted, {len(failed)} failed")

    def local_url(url: str | None) -> str | None:
        if not url or BUCKET_PREFIX not in url:
            return url
        name = unquote(urlparse(url).path.split(BUCKET_PREFIX, 1)[1])
        webp = converted.get(name)
        return f"/article-images/{webp}" if webp else url

    for t in WEB_TABLES:
        rows = fetch_all(t)
        for row in rows:
            for col in ("image_url", "cover_image_url"):
                if col in row:
                    row[col] = local_url(row[col])
        write_json(ROOT / "krux-web" / "data" / f"{t}.json", rows)

    if failed:
        sys.exit(f"{len(failed)} images failed to download")


if __name__ == "__main__":
    main()
