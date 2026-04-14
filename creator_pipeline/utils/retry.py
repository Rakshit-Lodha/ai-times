import functools
import logging
import time

logger = logging.getLogger(__name__)


def retry(max_attempts: int = 4, backoff_base: int = 2, exceptions: tuple = (Exception,)):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            last_error = None
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as exc:
                    last_error = exc
                    if attempt == max_attempts:
                        break
                    wait = backoff_base ** attempt
                    logger.warning(
                        "%s attempt %d/%d failed: %s. Retrying in %ds",
                        func.__name__,
                        attempt,
                        max_attempts,
                        exc,
                        wait,
                    )
                    time.sleep(wait)
            raise last_error

        return wrapper

    return decorator

