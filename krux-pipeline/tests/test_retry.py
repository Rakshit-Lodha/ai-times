from src.utils.retry import retry


class TestRetry:
    def test_succeeds_first_try(self):
        call_count = 0

        @retry(max_attempts=3, backoff_base=0)
        def succeed():
            nonlocal call_count
            call_count += 1
            return "ok"

        assert succeed() == "ok"
        assert call_count == 1

    def test_succeeds_on_second_attempt(self):
        call_count = 0

        @retry(max_attempts=3, backoff_base=0)
        def fail_once():
            nonlocal call_count
            call_count += 1
            if call_count < 2:
                raise ValueError("transient error")
            return "recovered"

        assert fail_once() == "recovered"
        assert call_count == 2

    def test_raises_after_max_attempts(self):
        call_count = 0

        @retry(max_attempts=3, backoff_base=0)
        def always_fail():
            nonlocal call_count
            call_count += 1
            raise RuntimeError("permanent error")

        import pytest
        with pytest.raises(RuntimeError, match="permanent error"):
            always_fail()

        assert call_count == 3

    def test_only_catches_specified_exceptions(self):
        call_count = 0

        @retry(max_attempts=3, backoff_base=0, exceptions=(ValueError,))
        def raise_type_error():
            nonlocal call_count
            call_count += 1
            raise TypeError("wrong type")

        import pytest
        with pytest.raises(TypeError):
            raise_type_error()

        # Should not retry — TypeError is not in exceptions tuple
        assert call_count == 1
