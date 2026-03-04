import time
import logging
import functools

logger = logging.getLogger(__name__)


def retry(max_attempts: int = 3, backoff_base: int = 2, exceptions: tuple = (Exception,)):
    """Retry decorator with exponential backoff."""

    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    if attempt == max_attempts:
                        raise
                    wait = backoff_base ** attempt
                    logger.warning(
                        "%s attempt %d/%d failed: %s. Retrying in %ds",
                        func.__name__, attempt, max_attempts, e, wait,
                    )
                    time.sleep(wait)
        return wrapper
    return decorator
