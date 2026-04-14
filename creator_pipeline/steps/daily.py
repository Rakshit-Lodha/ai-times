import json
import logging

from . import hourly, youtube_monitor


def run(dry_run: bool = False) -> dict:
    youtube_processed = youtube_monitor.run(youtube_monitor.DEFAULT_CREATORS)
    result = hourly.run(dry_run=dry_run)
    return {"youtube_processed": youtube_processed, **result}


def main() -> None:
    logging.basicConfig(level=logging.INFO)
    print(json.dumps(run(), indent=2))


if __name__ == "__main__":
    main()

