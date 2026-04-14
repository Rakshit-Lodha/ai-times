import json
import logging

from . import selector, sync_webhooks


def run(dry_run: bool = False) -> dict:
    synced = sync_webhooks.sync(dry_run=dry_run)
    selected = selector.run(dry_run=dry_run) if synced else 0
    return {"webhooks_synced": synced, "candidates_selected": selected}


def main() -> None:
    logging.basicConfig(level=logging.INFO)
    print(json.dumps(run(), indent=2))


if __name__ == "__main__":
    main()

