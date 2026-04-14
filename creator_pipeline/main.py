import argparse
import json
import logging

from .steps import hourly, selector, sync_webhooks


def main() -> None:
    parser = argparse.ArgumentParser(description="Creator daily content pipeline")
    parser.add_argument(
        "--step",
        choices=["sync", "selector", "youtube", "hourly", "all"],
        default="all",
        help="Pipeline step to run.",
    )
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO)
    results = {}
    if args.step == "hourly":
        results.update(hourly.run(dry_run=args.dry_run))
        print(json.dumps(results, indent=2))
        return
    if args.step in {"sync", "all"}:
        results["webhooks_synced"] = sync_webhooks.sync(dry_run=args.dry_run)
    if args.step in {"youtube", "all"}:
        from .steps import youtube_monitor

        results["youtube_processed"] = youtube_monitor.run(youtube_monitor.DEFAULT_CREATORS)
    if args.step in {"selector", "all"}:
        results["candidates_selected"] = selector.run(dry_run=args.dry_run)
    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
