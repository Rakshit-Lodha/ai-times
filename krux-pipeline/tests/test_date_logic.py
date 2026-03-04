from unittest.mock import patch
from datetime import datetime

from src.config import get_processing_dates, IST


class TestGetProcessingDates:
    def test_override_date(self):
        date, next_date = get_processing_dates("2026-02-28")
        assert date == "2026-02-28"
        assert next_date == "2026-03-01"

    def test_override_date_end_of_year(self):
        date, next_date = get_processing_dates("2026-12-31")
        assert date == "2026-12-31"
        assert next_date == "2027-01-01"

    @patch("src.config.datetime")
    def test_default_returns_yesterday(self, mock_dt):
        # Simulate 5:30 AM IST on March 5, 2026
        mock_now = datetime(2026, 3, 5, 5, 30, 0, tzinfo=IST)
        mock_dt.now.return_value = mock_now
        mock_dt.strptime = datetime.strptime

        date, next_date = get_processing_dates(None)
        assert date == "2026-03-04"
        assert next_date == "2026-03-05"

    @patch("src.config.datetime")
    def test_midnight_boundary(self, mock_dt):
        # 12:01 AM IST on March 5, 2026
        mock_now = datetime(2026, 3, 5, 0, 1, 0, tzinfo=IST)
        mock_dt.now.return_value = mock_now
        mock_dt.strptime = datetime.strptime

        date, next_date = get_processing_dates(None)
        assert date == "2026-03-04"
        assert next_date == "2026-03-05"


class TestOverrideDateFormat:
    def test_invalid_format_raises(self):
        import pytest
        with pytest.raises(ValueError):
            get_processing_dates("03-04-2026")

    def test_valid_format(self):
        date, next_date = get_processing_dates("2026-01-15")
        assert date == "2026-01-15"
        assert next_date == "2026-01-16"
