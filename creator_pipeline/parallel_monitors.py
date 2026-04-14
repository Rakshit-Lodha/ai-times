import json
import os
from pathlib import Path

import requests
from httpx import Response
from parallel import Parallel

from .config import CREATOR_WEBHOOK_URL, PARALLEL_API_KEY

MAP_FILE = Path(__file__).resolve().parent.parent / "creator_monitor_map.json"

MONITOR_CONFIGS = [
    {
        "monitor_type": "paid_ads_growth",
        "query": (
            "Track practical paid ads and growth marketing updates for Indian business owners: "
            "Meta Ads, Google Ads, YouTube/Instagram ads, creative testing, tracking, attribution, "
            "retargeting, landing pages, CRO, AI ad tools, zero-to-one ad setup, and case studies."
        ),
    },
    {
        "monitor_type": "government_schemes_policy",
        "query": (
            "Track Indian government schemes, policy, grants, MSME, DPIIT, Startup India, RBI, "
            "SEBI, ONDC, GST, and compliance updates that founders, small businesses, ecommerce "
            "operators, and creators can practically use."
        ),
    },
    {
        "monitor_type": "startup_ideas_opportunities",
        "query": (
            "Track Indian startup ideas and opportunities from recent business shifts, funding, "
            "consumer behavior, regulation, distribution changes, new tools, and early categories "
            "that can become practical short-form video topics."
        ),
    },
    {
        "monitor_type": "ecommerce_growth",
        "query": (
            "Track ecommerce, D2C, ONDC, marketplace, logistics, payments, Shopify, WhatsApp commerce, "
            "and conversion updates useful for Indian business owners and operators."
        ),
    },
    {
        "monitor_type": "sales_negotiation",
        "query": (
            "Track practical sales and negotiation ideas, frameworks, objections, pricing, closing, "
            "B2B/B2C selling examples, and business communication lessons suitable for short videos."
        ),
    },
    {
        "monitor_type": "business_strategy",
        "query": (
            "Track business strategy stories, company pivots, brand case studies, pricing changes, "
            "business model shifts, founder lessons, and operational examples with practical lessons."
        ),
    },
    {
        "monitor_type": "marketing_trends",
        "query": (
            "Track marketing trends, brand campaigns, distribution tactics, creator marketing, AI marketing "
            "tools, and case studies that can become practical videos for founders and marketers."
        ),
    },
    {
        "monitor_type": "investing_finance",
        "query": (
            "Track practical investing and finance updates for Indian audiences: RBI, SEBI, markets, "
            "personal finance, taxes, founder finance, and business finance topics with clear implications."
        ),
    },
]


def load_map() -> dict:
    if not MAP_FILE.exists():
        return {}
    with MAP_FILE.open("r", encoding="utf-8") as f:
        data = json.load(f)
    return data if isinstance(data, dict) else {}


def save_map(mapping: dict) -> None:
    with MAP_FILE.open("w", encoding="utf-8") as f:
        json.dump(mapping, f, indent=2, sort_keys=True)
        f.write("\n")


def fetch_existing_monitors() -> list[dict]:
    response = requests.get(
        "https://api.parallel.ai/v1alpha/monitors",
        headers={"x-api-key": PARALLEL_API_KEY},
        timeout=30,
    )
    response.raise_for_status()
    payload = response.json()
    if isinstance(payload, dict):
        return payload.get("data") or payload.get("monitors") or []
    return payload if isinstance(payload, list) else []


def find_monitor(existing_monitors: list[dict], monitor_type: str) -> dict | None:
    for monitor in existing_monitors:
        metadata = monitor.get("metadata") or {}
        webhook = monitor.get("webhook") or {}
        if (
            monitor.get("status") == "active"
            and metadata.get("owner") == "creator_content"
            and metadata.get("monitor_type") == monitor_type
            and webhook.get("url") == CREATOR_WEBHOOK_URL
            and monitor.get("cadence") == "hourly"
        ):
            return monitor
    return None


def create_monitor(client: Parallel, config: dict) -> dict:
    return client.post(
        "/v1alpha/monitors",
        cast_to=Response,
        body={
            "query": config["query"],
            "cadence": "hourly",
            "webhook": {
                "url": CREATOR_WEBHOOK_URL,
                "event_types": ["monitor.event.detected"],
            },
            "metadata": {
                "owner": "creator_content",
                "monitor_type": config["monitor_type"],
                "version": "v1",
            },
        },
    ).json()


def main() -> None:
    if not PARALLEL_API_KEY:
        raise KeyError("Missing PARALLEL_API_KEY")

    client = Parallel(api_key=PARALLEL_API_KEY)
    existing_monitors = fetch_existing_monitors()
    monitor_map = {}

    for config in MONITOR_CONFIGS:
        existing = find_monitor(existing_monitors, config["monitor_type"])
        if existing:
            monitor_id = existing.get("monitor_id")
            print(f"Using existing {config['monitor_type']}: {monitor_id}")
        else:
            created = create_monitor(client, config)
            monitor_id = created.get("monitor_id")
            print(f"Created {config['monitor_type']}: {monitor_id}")

        if monitor_id:
            monitor_map[monitor_id] = config["monitor_type"]

    save_map(monitor_map)
    print(f"Saved creator monitor map to {MAP_FILE}")


if __name__ == "__main__":
    main()
