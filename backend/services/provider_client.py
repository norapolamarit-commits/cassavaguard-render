"""Small, thread-safe HTTP client for live environmental-data providers."""
from __future__ import annotations

import copy
import threading
import time
from typing import Any

import httpx

from backend.config import PROVIDER_CACHE_TTL_SECONDS, PROVIDER_TIMEOUT_SECONDS


class ProviderError(RuntimeError):
    """A live provider could not return usable data."""


_cache: dict[str, tuple[float, Any]] = {}
_cache_lock = threading.Lock()


def _cached(key: str) -> Any | None:
    now = time.monotonic()
    with _cache_lock:
        record = _cache.get(key)
        if record is None:
            return None
        expires_at, value = record
        if expires_at <= now:
            _cache.pop(key, None)
            return None
        return copy.deepcopy(value)


def _store(key: str, value: Any, ttl: int) -> Any:
    with _cache_lock:
        _cache[key] = (time.monotonic() + ttl, copy.deepcopy(value))
    return value


def get_json(
    url: str,
    *,
    params: dict[str, Any] | None = None,
    cache_key: str | None = None,
    ttl: int = PROVIDER_CACHE_TTL_SECONDS,
) -> dict:
    key = cache_key or f"GET:{url}:{sorted((params or {}).items())}"
    hit = _cached(key)
    if hit is not None:
        return hit
    try:
        response = httpx.get(
            url,
            params=params,
            timeout=PROVIDER_TIMEOUT_SECONDS,
            follow_redirects=True,
            headers={"User-Agent": "CassavaGuard/1.0 environmental-data-client"},
        )
        response.raise_for_status()
        payload = response.json()
    except (httpx.HTTPError, ValueError) as exc:
        raise ProviderError(f"Provider request failed: {url}") from exc
    if not isinstance(payload, dict) or payload.get("error"):
        reason = payload.get("reason", "invalid provider response") if isinstance(payload, dict) else "invalid provider response"
        raise ProviderError(str(reason))
    return _store(key, payload, ttl)


def post_json(
    url: str,
    *,
    body: dict[str, Any],
    cache_key: str,
    ttl: int = PROVIDER_CACHE_TTL_SECONDS,
) -> dict:
    hit = _cached(cache_key)
    if hit is not None:
        return hit
    try:
        response = httpx.post(
            url,
            json=body,
            timeout=PROVIDER_TIMEOUT_SECONDS,
            follow_redirects=True,
            headers={"User-Agent": "CassavaGuard/1.0 environmental-data-client"},
        )
        response.raise_for_status()
        payload = response.json()
    except (httpx.HTTPError, ValueError) as exc:
        raise ProviderError(f"Provider request failed: {url}") from exc
    if not isinstance(payload, dict):
        raise ProviderError("Provider returned an invalid response")
    return _store(cache_key, payload, ttl)
