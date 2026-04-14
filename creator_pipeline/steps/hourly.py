import json
import logging

from . import selector


def run(dry_run: bool = False) -> dict:
    selected = selector.run(dry_run=dry_run)
    return {"candidates_selected": selected}


def main() -> None:
    logging.basicConfig(level=logging.INFO)
    print(json.dumps(run(), indent=2))


if __name__ == "__main__":
    main()
