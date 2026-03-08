from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch
from time import struct_time

import pytest

from src.feeds import FeedSource, FEEDS
from src.steps.rss_monitor import (
    _entry_guid,
    _entry_published_date,
    _format_news_output,
    _is_too_old,
    _strip_html,
    _is_already_seen,
    _process_feed,
    run,
)

SAMPLE_FEED = FeedSource("test_blog", "Test Blog", "https://example.com/feed.xml", "TestCo")


def _make_time_struct(dt: datetime):
    return dt.timetuple()


# ── entry_guid ──


def test_entry_guid_with_id():
    assert _entry_guid({"id": "abc-123", "link": "https://example.com"}) == "abc-123"


def test_entry_guid_fallback_to_link():
    assert _entry_guid({"link": "https://example.com/post"}) == "https://example.com/post"


def test_entry_guid_empty():
    assert _entry_guid({}) == ""


# ── entry_published_date ──


def test_entry_published_date_with_published():
    entry = {"published_parsed": _make_time_struct(datetime(2026, 3, 5))}
    assert _entry_published_date(entry) == "2026-03-05"


def test_entry_published_date_fallback_to_updated():
    entry = {"updated_parsed": _make_time_struct(datetime(2026, 1, 15))}
    assert _entry_published_date(entry) == "2026-01-15"


def test_entry_published_date_none():
    assert _entry_published_date({}) is None


# ── is_too_old ──


def test_is_too_old_recent():
    entry = {"published_parsed": _make_time_struct(datetime.now() - timedelta(days=2))}
    assert _is_too_old(entry) is False


def test_is_too_old_old():
    entry = {"published_parsed": _make_time_struct(datetime.now() - timedelta(days=10))}
    assert _is_too_old(entry) is True


def test_is_too_old_no_date():
    assert _is_too_old({}) is False


# ── strip_html ──


def test_strip_html():
    assert _strip_html("<p>Hello <b>world</b></p>") == "Hello world"


def test_strip_html_plain():
    assert _strip_html("no tags here") == "no tags here"


# ── format_news_output ──


def test_format_news_output_normal():
    entry = {"title": "Big Launch", "summary": "We launched a thing."}
    result = _format_news_output(entry, SAMPLE_FEED)
    assert result == "TestCo: Big Launch. We launched a thing."


def test_format_news_output_html_summary():
    entry = {"title": "Update", "summary": "<p>Some <b>HTML</b> content</p>"}
    result = _format_news_output(entry, SAMPLE_FEED)
    assert result == "TestCo: Update. Some HTML content"


def test_format_news_output_long_summary():
    entry = {"title": "Post", "summary": "x" * 600}
    result = _format_news_output(entry, SAMPLE_FEED)
    assert result.endswith("...")
    assert len(result) < 520  # title + truncated summary


def test_format_news_output_no_summary():
    entry = {"title": "Title Only"}
    result = _format_news_output(entry, SAMPLE_FEED)
    assert result == "TestCo: Title Only"


# ── is_already_seen ──


@patch("src.steps.rss_monitor.supabase")
def test_is_already_seen_true(mock_sb):
    mock_sb.table.return_value.select.return_value.eq.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(data=[{"id": 1}])
    assert _is_already_seen(SAMPLE_FEED, "guid-1") is True


@patch("src.steps.rss_monitor.supabase")
def test_is_already_seen_false(mock_sb):
    mock_sb.table.return_value.select.return_value.eq.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(data=[])
    assert _is_already_seen(SAMPLE_FEED, "guid-1") is False


# ── process_feed ──


@patch("src.steps.rss_monitor._is_already_seen", return_value=False)
@patch("src.steps.rss_monitor._fetch_feed")
@patch("src.steps.rss_monitor.supabase")
def test_process_feed_inserts_new(mock_sb, mock_fetch, mock_seen):
    now = datetime.now()
    mock_fetch.return_value = [
        {"id": "g1", "title": "Post 1", "summary": "S1", "link": "https://example.com/1", "published_parsed": _make_time_struct(now)},
        {"id": "g2", "title": "Post 2", "summary": "S2", "link": "https://example.com/2", "published_parsed": _make_time_struct(now)},
    ]
    count = _process_feed(SAMPLE_FEED)
    assert count == 2
    assert mock_sb.table.return_value.insert.call_count == 2


@patch("src.steps.rss_monitor._is_already_seen", return_value=True)
@patch("src.steps.rss_monitor._fetch_feed")
@patch("src.steps.rss_monitor.supabase")
def test_process_feed_skips_seen(mock_sb, mock_fetch, mock_seen):
    now = datetime.now()
    mock_fetch.return_value = [
        {"id": "g1", "title": "Old Post", "link": "https://example.com/1", "published_parsed": _make_time_struct(now)},
    ]
    count = _process_feed(SAMPLE_FEED)
    assert count == 0
    mock_sb.table.return_value.insert.assert_not_called()


@patch("src.steps.rss_monitor._is_already_seen", return_value=False)
@patch("src.steps.rss_monitor._fetch_feed")
@patch("src.steps.rss_monitor.supabase")
def test_process_feed_dry_run(mock_sb, mock_fetch, mock_seen):
    now = datetime.now()
    mock_fetch.return_value = [
        {"id": "g1", "title": "Post", "link": "https://example.com/1", "published_parsed": _make_time_struct(now)},
    ]
    count = _process_feed(SAMPLE_FEED, dry_run=True)
    assert count == 1
    mock_sb.table.return_value.insert.assert_not_called()


@patch("src.steps.rss_monitor._fetch_feed", side_effect=Exception("network error"))
def test_process_feed_fetch_failure(mock_fetch):
    count = _process_feed(SAMPLE_FEED)
    assert count == 0


@patch("src.steps.rss_monitor._is_already_seen", return_value=False)
@patch("src.steps.rss_monitor._fetch_feed")
@patch("src.steps.rss_monitor.supabase")
def test_process_feed_skips_old_entries(mock_sb, mock_fetch, mock_seen):
    old_date = datetime.now() - timedelta(days=10)
    mock_fetch.return_value = [
        {"id": "g1", "title": "Old", "link": "https://example.com/1", "published_parsed": _make_time_struct(old_date)},
    ]
    count = _process_feed(SAMPLE_FEED)
    assert count == 0


# ── run (all feeds) ──


@patch("src.steps.rss_monitor._process_feed", return_value=3)
def test_run_sums_all_feeds(mock_process):
    total = run(dry_run=False)
    assert total == 3 * len(FEEDS)
    assert mock_process.call_count == len(FEEDS)


@patch("src.steps.rss_monitor._process_feed", side_effect=[2, 0, 0, 1, 0, 0, 3, 1])
def test_run_processes_all_feeds(mock_process):
    total = run()
    assert total == 7
    assert mock_process.call_count == len(FEEDS)


# ── feeds registry ──


def test_feed_ids_unique():
    ids = [f.feed_id for f in FEEDS]
    assert len(ids) == len(set(ids))


def test_feeds_have_urls():
    for feed in FEEDS:
        assert feed.url
        assert feed.feed_id
        assert feed.company
