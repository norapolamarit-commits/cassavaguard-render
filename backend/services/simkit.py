"""Deterministic pseudo-random helpers.

Every environmental series (weather, NDVI, soil moisture …) is generated from a
stable hash seed so the platform behaves like a real data store: the same
field + date always returns the same value, history is consistent between
requests, and no external data feed is required for the demo deployment.
"""
import hashlib
import math


def h01(*parts) -> float:
    """Stable hash of parts -> float in [0, 1)."""
    key = "|".join(str(p) for p in parts)
    digest = hashlib.sha256(key.encode()).digest()
    return int.from_bytes(digest[:8], "big") / 2**64


def hrange(lo: float, hi: float, *parts) -> float:
    return lo + (hi - lo) * h01(*parts)


def smooth_noise(t: float, seed: str, octaves: int = 3) -> float:
    """Value-noise in [-1, 1] that varies smoothly with t."""
    total, amp, norm = 0.0, 1.0, 0.0
    for o in range(octaves):
        freq = 2 ** o
        x = t * freq
        i0, i1 = math.floor(x), math.floor(x) + 1
        v0 = h01(seed, o, i0) * 2 - 1
        v1 = h01(seed, o, i1) * 2 - 1
        frac = x - i0
        u = frac * frac * (3 - 2 * frac)  # smoothstep
        total += (v0 + (v1 - v0) * u) * amp
        norm += amp
        amp *= 0.5
    return total / norm


def clamp(v, lo, hi):
    return max(lo, min(hi, v))
