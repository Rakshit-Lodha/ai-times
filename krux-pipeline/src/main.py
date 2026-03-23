import argparse
import logging
import sys
import time

from .config import get_processing_dates, get_today_range
from .steps import health_check, rss_monitor, content_selector, research, summary, images

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("krux-pipeline")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Krux daily content pipeline")
    parser.add_argument(
        "--date",
        help="Override date to process (YYYY-MM-DD). Default: yesterday.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Log output without writing to the database.",
    )
    parser.add_argument(
        "--step",
        type=int,
        choices=[0, 1, 2, 3, 4],
        help="Run only a specific step (0=rss, 1=curation, 2=research, 3=summary, 4=images).",
    )
    return parser.parse_args()


def run_pipeline() -> None:
    args = parse_args()
    start_time = time.time()

    date, next_date = get_processing_dates(args.date)
    today, tomorrow = get_today_range()
    dry_run = args.dry_run

    logger.info("=" * 60)
    logger.info("Krux Pipeline — processing news for %s", date)
    if dry_run:
        logger.info("DRY RUN mode — no database writes")
    if args.step:
        logger.info("Running only step %d", args.step)
    logger.info("=" * 60)

    results: dict = {"date": date, "errors": []}

    # ── Health Check ──
    if args.step is None:
        try:
            healthy = health_check.run()
            results["health_check"] = "passed" if healthy else "alerts_sent"
        except Exception as e:
            logger.error("Health check FAILED: %s", e, exc_info=True)
            results["errors"].append(f"health_check: {e}")

    # ── Step 0: RSS Feed Monitor ──
    if args.step is None or args.step == 0:
        try:
            rss_count = rss_monitor.run(dry_run=dry_run)
            results["rss_entries"] = rss_count
            logger.info("Step 0 complete: %d new RSS entries", rss_count)
        except Exception as e:
            logger.error("Step 0 FAILED: %s", e, exc_info=True)
            results["errors"].append(f"rss_monitor: {e}")

    # ── Step 1: Content Selection ──
    if args.step is None or args.step == 1:
        try:
            count = content_selector.run(date, next_date, dry_run=dry_run)
            results["curated_stories"] = count
            logger.info("Step 1 complete: %d stories curated", count)
        except Exception as e:
            logger.error("Step 1 FAILED: %s", e, exc_info=True)
            results["errors"].append(f"content_selector: {e}")
            if args.step is None:
                # Fatal — nothing downstream works without curation
                _print_summary(results, time.time() - start_time)
                sys.exit(1)

    # ── Step 2: Research ──
    if args.step is None or args.step == 2:
        try:
            topic_results = research.run(today, tomorrow, dry_run=dry_run)
            results["researched_events"] = topic_results
            logger.info("Step 2 complete: %s", topic_results)
        except Exception as e:
            logger.error("Step 2 FAILED: %s", e, exc_info=True)
            results["errors"].append(f"research: {e}")

    # ── Step 3: 100-Word Summaries ──
    if args.step is None or args.step == 3:
        try:
            summary_count = summary.run(today, tomorrow, dry_run=dry_run)
            results["summaries_generated"] = summary_count
            logger.info("Step 3 complete: %d summaries", summary_count)
        except Exception as e:
            logger.error("Step 3 FAILED: %s", e, exc_info=True)
            results["errors"].append(f"summary: {e}")

    # ── Step 4: Image Generation ──
    if args.step is None or args.step == 4:
        try:
            image_count = images.run(dry_run=dry_run)
            results["images_generated"] = image_count
            logger.info("Step 4 complete: %d images", image_count)
        except Exception as e:
            logger.error("Step 4 FAILED: %s", e, exc_info=True)
            results["errors"].append(f"images: {e}")

    elapsed = time.time() - start_time
    _print_summary(results, elapsed)


def _print_summary(results: dict, elapsed: float) -> None:
    errors = results.get("errors", [])
    logger.info("=" * 60)
    logger.info("PIPELINE SUMMARY")
    logger.info("  Date:       %s", results.get("date"))
    logger.info("  RSS:        %s", results.get("rss_entries", "—"))
    logger.info("  Curated:    %s", results.get("curated_stories", "—"))
    logger.info("  Researched: %s", results.get("researched_events", "—"))
    logger.info("  Summaries:  %s", results.get("summaries_generated", "—"))
    logger.info("  Images:     %s", results.get("images_generated", "—"))
    logger.info("  Errors:     %d", len(errors))
    if errors:
        for err in errors:
            logger.info("    - %s", err)
    logger.info("  Time:       %.1fs", elapsed)
    logger.info("=" * 60)


if __name__ == "__main__":
    run_pipeline()
