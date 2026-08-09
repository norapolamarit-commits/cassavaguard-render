"""Small in-process fixed-window limiter for the single-instance deployment.

For a multi-instance deployment, replace this store with Redis while keeping
the middleware contract unchanged.
"""
import threading
import time
from collections import defaultdict, deque

from fastapi import Request
from fastapi.responses import JSONResponse

from backend.config import TRUST_PROXY_HEADERS


_LIMITS = {
    "/api/auth/login": (10, 300),
    "/api/auth/login-json": (10, 300),
    "/api/auth/register": (5, 3600),
    "/api/auth/forgot": (5, 3600),
    "/api/auth/reset": (10, 3600),
    "/api/predict/image": (30, 60),
    "/api/predict/csv": (30, 60),
}
_events: dict[tuple[str, str], deque[float]] = defaultdict(deque)
_lock = threading.Lock()


def _client_ip(request: Request) -> str:
    if TRUST_PROXY_HEADERS:
        forwarded = request.headers.get("x-forwarded-for", "")
        if forwarded:
            return forwarded.split(",", 1)[0].strip()
    return request.client.host if request.client else "unknown"


async def rate_limit_middleware(request: Request, call_next):
    limit = _LIMITS.get(request.url.path)
    if limit and request.method == "POST":
        maximum, window = limit
        now = time.monotonic()
        key = (_client_ip(request), request.url.path)
        with _lock:
            events = _events[key]
            while events and events[0] <= now - window:
                events.popleft()
            if len(events) >= maximum:
                retry_after = max(1, int(window - (now - events[0])))
                return JSONResponse(
                    status_code=429,
                    content={"detail": "Too many requests. Please try again later."},
                    headers={"Retry-After": str(retry_after)},
                )
            events.append(now)
    return await call_next(request)
