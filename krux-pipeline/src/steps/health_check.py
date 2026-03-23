import json
import logging
from datetime import datetime, timedelta, timezone
from pathlib import Path

import requests

from ..clients import supabase
from ..config import _require_env

logger = logging.getLogger(__name__)

_MONITOR_MAP_PATH = Path(__file__).resolve().parent.parent.parent.parent / "monitor_map.json"
_STALE_THRESHOLD_HOURS = 3
_WEBHOOK_GAP_HOURS = 26  # allow some buffer over 24h


def _load_monitor_map() -> dict[str, str]:
    try:
        with open(_MONITOR_MAP_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error("Could not load monitor_map.json: %s", e)
        return {}


def _check_parallel_monitors(api_key: str, monitor_map: dict[str, str]) -> list[str]:
    """Return list of alert messages for stale monitors."""
    alerts = []
    now = datetime.now(timezone.utc)

    for monitor_id, monitor_type in monitor_map.items():
        try:
            resp = requests.get(
                f"https://api.parallel.ai/v1alpha/monitors/{monitor_id}",
                headers={"x-api-key": api_key},
                timeout=30,
            )
            data = resp.json()
            status = data.get("status", "unknown")

            if status != "active":
                alerts.append(f"Monitor {monitor_type} ({monitor_id}) is {status}, not active")
                continue

            last_run = data.get("last_run_at")
            if not last_run:
                alerts.append(f"Monitor {monitor_type} ({monitor_id}) has never run")
                continue

            last_run_dt = datetime.fromisoformat(last_run.replace("Z", "+00:00"))
            hours_since = (now - last_run_dt).total_seconds() / 3600

            if hours_since > _STALE_THRESHOLD_HOURS:
                alerts.append(
                    f"Monitor {monitor_type} ({monitor_id}) last ran {hours_since:.1f}h ago"
                )
        except Exception as e:
            alerts.append(f"Monitor {monitor_type} ({monitor_id}) check failed: {e}")

    return alerts


def _check_recent_webhooks() -> list[str]:
    """Check if webhooks table has received entries recently."""
    alerts = []
    cutoff = (datetime.now(timezone.utc) - timedelta(hours=_WEBHOOK_GAP_HOURS)).isoformat()

    try:
        result = (
            supabase.table("webhooks")
            .select("id", count="exact")
            .gte("created_at", cutoff)
            .execute()
        )
        count = result.count if result.count is not None else len(result.data)
        if count == 0:
            alerts.append(f"No new webhooks in the last {_WEBHOOK_GAP_HOURS}h")
        else:
            logger.info("Webhooks health: %d entries in last %dh", count, _WEBHOOK_GAP_HOURS)
    except Exception as e:
        alerts.append(f"Webhook table check failed: {e}")

    return alerts


def _send_alert_email(alerts: list[str], resend_api_key: str, to_email: str) -> None:
    """Send alert email via Resend."""
    body_lines = ["The following issues were detected:\n"]
    for alert in alerts:
        body_lines.append(f"  • {alert}")
    body_lines.append("\nCheck Parallel dashboard and Render logs immediately.")

    try:
        resp = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {resend_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "from": "KRUX Alerts <alerts@krux.news>",
                "to": [to_email],
                "subject": f"⚠️ KRUX Pipeline Alert: {len(alerts)} issue(s) detected",
                "text": "\n".join(body_lines),
            },
            timeout=15,
        )
        if resp.status_code == 200:
            logger.info("Alert email sent to %s", to_email)
        else:
            logger.error("Resend API returned %d: %s", resp.status_code, resp.text)
    except Exception as e:
        logger.error("Failed to send alert email: %s", e)


def run() -> bool:
    """Run health checks. Returns True if healthy, False if alerts were raised."""
    logger.info("Running pipeline health check...")

    monitor_map = _load_monitor_map()
    if not monitor_map:
        logger.warning("No monitors to check (empty monitor_map.json)")
        return True

    all_alerts: list[str] = []

    # Check Parallel monitors
    try:
        parallel_api_key = _require_env("PARALLEL_API_KEY")
        all_alerts.extend(_check_parallel_monitors(parallel_api_key, monitor_map))
    except KeyError:
        logger.warning("PARALLEL_API_KEY not set, skipping monitor check")

    # Check webhook table
    all_alerts.extend(_check_recent_webhooks())

    if not all_alerts:
        logger.info("Health check passed: all monitors running, webhooks flowing")
        return True

    # Log all alerts
    logger.warning("Health check found %d issue(s):", len(all_alerts))
    for alert in all_alerts:
        logger.warning("  - %s", alert)

    # Send email alert
    try:
        resend_key = _require_env("RESEND_API_KEY")
        alert_email = _require_env("ALERT_EMAIL")
        _send_alert_email(all_alerts, resend_key, alert_email)
    except KeyError as e:
        logger.warning("Email alerting not configured (%s), skipping", e)

    return False
