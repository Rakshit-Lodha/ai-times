import argparse
import json
from pathlib import Path

from ..reference_library import (
    DEFAULT_REFERENCE_FILE,
    DEFAULT_STYLE_FILE,
    DEFAULT_TAGS_FILE,
    load_reference_examples,
    load_style_profile,
)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--reference-file", default=str(DEFAULT_REFERENCE_FILE))
    parser.add_argument("--tags-file", default=str(DEFAULT_TAGS_FILE))
    parser.add_argument("--style-file", default=str(DEFAULT_STYLE_FILE))
    args = parser.parse_args()

    rows = load_reference_examples(Path(args.reference_file), Path(args.tags_file))
    style_profile = load_style_profile(Path(args.style_file))
    preview = rows[:5]

    print(
        json.dumps(
            {
                "local_reference_transcripts": len(rows),
                "local_style_profile_chars": len(style_profile),
                "preview": preview,
            },
            ensure_ascii=False,
            default=str,
        )
    )


if __name__ == "__main__":
    main()

