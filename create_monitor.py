import json
import os

import requests
from dotenv import load_dotenv
from httpx import Response
from parallel import Parallel

load_dotenv()

API_KEY = os.environ.get("PARALLEL_API_KEY")
if not API_KEY:
    raise ValueError("PARALLEL_API_KEY is missing in environment")

client = Parallel(api_key=API_KEY)

WEBHOOK_URL = "https://ai-times-6utx.onrender.com/parallel-webhooks"
MAP_FILE = os.path.join(os.path.dirname(__file__), "monitor_map.json")

MONITOR_CONFIGS = [
    {
        "monitor_type": "funding_models",
        "query": (
            "Track major AI funding, M&A, and model launch news. Prioritize rounds "
            ">= $25M, strategic investments, major model announcements, and material "
            "commercial partnerships."
        ),
    },
    {
        "monitor_type": "workflow_tools",
        "query": (
            "Track AI tool updates that improve workflows for working professionals "
            "(product, marketing, and design). Include practical feature launches, "
            "automation, integrations, and pricing or access changes."
        ),
    },
    {
        "monitor_type": "enterprise_adoption",
        "query": (
            "Track enterprise AI adoption, deployments, case studies with measurable "
            "impact, and operational incidents/outages/security events that affect "
            "business workflows."
        ),
    },
    {
        "monitor_type": "policy_reports",
        "query": (
            "Track significant AI policy/regulatory updates and high-signal reports "
            "or research outputs from major organizations (for example OpenAI, "
            "Anthropic, Google DeepMind, McKinsey, governments, and top institutions)."
        ),
    },
]


def load_map():
    if not os.path.exists(MAP_FILE):
        return {}
    with open(MAP_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data if isinstance(data, dict) else {}


def save_map(mapping):
    with open(MAP_FILE, "w", encoding="utf-8") as f:
        json.dump(mapping, f, indent=2, sort_keys=True)
        f.write("\n")


def fetch_existing_monitors():
    response = requests.get(
        "https://api.parallel.ai/v1alpha/monitors",
        headers={"x-api-key": API_KEY},
        timeout=30,
    )
    response.raise_for_status()
    payload = response.json()

    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict):
        if isinstance(payload.get("data"), list):
            return payload["data"]
        if isinstance(payload.get("monitors"), list):
            return payload["monitors"]
    return []


def find_monitor_by_type(existing_monitors, monitor_type):
    for monitor in existing_monitors:
        metadata = monitor.get("metadata") or {}
        if metadata.get("monitor_type") == monitor_type:
            return monitor
    return None


def find_legacy_general_monitor(existing_monitors):
    legacy_candidates = []
    for monitor in existing_monitors:
        metadata = monitor.get("metadata") or {}
        webhook = monitor.get("webhook") or {}
        webhook_url = webhook.get("url")
        if metadata.get("monitor_type"):
            continue
        if monitor.get("status") != "active":
            continue
        if webhook_url != WEBHOOK_URL:
            continue
        legacy_candidates.append(monitor)

    if not legacy_candidates:
        return None

    legacy_candidates.sort(key=lambda m: m.get("created_at", ""), reverse=True)
    return legacy_candidates[0]


def create_monitor(config):
    response = client.post(
        "/v1alpha/monitors",
        cast_to=Response,
        body={
            "query": config["query"],
            "cadence": "hourly",
            "webhook": {
                "url": WEBHOOK_URL,
                "event_types": ["monitor.event.detected"],
            },
            "metadata": {
                "monitor_type": config["monitor_type"],
                "version": "v1",
                "owner": "krux",
            },
        },
    ).json()
    return response


def main():
    existing_monitors = fetch_existing_monitors()
    monitor_map = load_map()

    for config in MONITOR_CONFIGS:
        existing = find_monitor_by_type(existing_monitors, config["monitor_type"])
        if existing:
            monitor_id = existing.get("monitor_id")
            print(f"Using existing {config['monitor_type']}: {monitor_id}")
        else:
            created = create_monitor(config)
            monitor_id = created.get("monitor_id")
            print(f"Created {config['monitor_type']}: {monitor_id}")
            print(f"Query: {created.get('query')}")
            print(f"Cadence: {created.get('cadence')}")
            print(f"Webhook URL: {created.get('webhook', {}).get('url')}")

        if monitor_id:
            monitor_map[monitor_id] = config["monitor_type"]

    legacy_monitor_id = os.environ.get("PARALLEL_LEGACY_MONITOR_ID")
    if legacy_monitor_id:
        monitor_map[legacy_monitor_id] = "general"
        print(f"Mapped legacy monitor to general: {legacy_monitor_id}")
    else:
        legacy_monitor = find_legacy_general_monitor(existing_monitors)
        if legacy_monitor:
            legacy_monitor_id = legacy_monitor.get("monitor_id")
            if legacy_monitor_id:
                monitor_map[legacy_monitor_id] = "general"
                print(f"Auto-mapped legacy monitor to general: {legacy_monitor_id}")
        else:
            print("No legacy active monitor found. Add old monitor id manually for general.")

    save_map(monitor_map)
    print(f"Saved monitor map to {MAP_FILE}")


if __name__ == "__main__":
    main()
