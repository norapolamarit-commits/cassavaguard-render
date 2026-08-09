"""Sentinel-2 vegetation indices with explicit provenance.

Live mode searches public Sentinel-2 Level-2A scenes through Element 84 Earth
Search and reads the public Cloud-Optimized GeoTIFF bands from AWS. Synthetic
mode is retained only for deterministic offline tests.
"""
from __future__ import annotations

import datetime as dt
import math
from concurrent.futures import ThreadPoolExecutor
from typing import Any

import numpy as np

from backend.config import (
    EARTH_SEARCH_STAC_URL,
    ENVIRONMENTAL_DATA_MODE,
    SATELLITE_GRID_RADIUS_M,
    SATELLITE_LOOKBACK_DAYS,
    SATELLITE_MAX_CLOUD_PCT,
)
from backend.services import weather_engine
from backend.services.provider_client import ProviderError, get_json, post_json
from backend.services.simkit import clamp, h01, smooth_noise

GRID = 12
COLLECTION = "sentinel-2-l2a"

INDEX_META = {
    "ndvi": {
        "name": "NDVI",
        "range": [-1, 1],
        "desc_en": "Normalized Difference Vegetation Index",
        "desc_th": "ดัชนีความสมบูรณ์พืช",
    },
    "ndwi": {
        "name": "NDMI",
        "range": [-1, 1],
        "desc_en": "Normalized Difference Moisture Index (NIR/SWIR)",
        "desc_th": "ดัชนีความชื้นพืช (NIR/SWIR)",
    },
    "savi": {
        "name": "SAVI",
        "range": [-1, 1],
        "desc_en": "Soil Adjusted Vegetation Index",
        "desc_th": "ดัชนีพืชปรับพื้นดิน",
    },
    "evi": {
        "name": "EVI",
        "range": [-1, 1],
        "desc_en": "Enhanced Vegetation Index",
        "desc_th": "ดัชนีพืชแบบปรับปรุง",
    },
}


def _source(item: dict | None = None) -> dict:
    if ENVIRONMENTAL_DATA_MODE == "synthetic":
        return {
            "mode": "synthetic",
            "provider": "CassavaGuard deterministic test generator",
            "kind": "generated_test_data",
            "is_observation": False,
        }
    properties = (item or {}).get("properties", {})
    return {
        "mode": "live",
        "provider": "Element 84 Earth Search / AWS Open Data",
        "kind": "Sentinel-2 Level-2A surface reflectance",
        "is_observation": True,
        "collection": COLLECTION,
        "scene_id": (item or {}).get("id"),
        "acquired_at": properties.get("datetime"),
        "platform": properties.get("platform"),
        "cloud_pct_scene": properties.get("eo:cloud_cover"),
        "license": "Copernicus Sentinel Data Terms",
        "url": "https://registry.opendata.aws/sentinel-2-l2a-cogs/",
    }


def _search_items(
    lat: float,
    lon: float,
    start: dt.date,
    end: dt.date,
    *,
    limit: int = 100,
) -> list[dict]:
    if start > end:
        raise ProviderError("Invalid Sentinel-2 search interval")
    epsilon = 0.0001
    body: dict[str, Any] = {
        "collections": [COLLECTION],
        "bbox": [lon - epsilon, lat - epsilon, lon + epsilon, lat + epsilon],
        "datetime": f"{start.isoformat()}T00:00:00Z/{end.isoformat()}T23:59:59Z",
        "query": {"eo:cloud_cover": {"lt": SATELLITE_MAX_CLOUD_PCT}},
        "sortby": [{"field": "properties.datetime", "direction": "asc"}],
        "limit": limit,
    }
    payload = post_json(
        f"{EARTH_SEARCH_STAC_URL}/search",
        body=body,
        cache_key=(
            f"stac:{round(lat, 4)}:{round(lon, 4)}:{start}:{end}:"
            f"{SATELLITE_MAX_CLOUD_PCT}:{limit}"
        ),
    )
    features = payload.get("features")
    if not isinstance(features, list):
        raise ProviderError("Earth Search returned an invalid feature collection")
    return [item for item in features if isinstance(item, dict)]


def _scene_date(item: dict) -> dt.date:
    try:
        return dt.datetime.fromisoformat(
            item["properties"]["datetime"].replace("Z", "+00:00")
        ).date()
    except (KeyError, TypeError, ValueError) as exc:
        raise ProviderError("Sentinel-2 scene is missing acquisition time") from exc


def _candidate_scenes(lat: float, lon: float, on: dt.date) -> list[dict]:
    today = dt.date.today()
    target = min(on, today)
    items = _search_items(
        lat,
        lon,
        target - dt.timedelta(days=SATELLITE_LOOKBACK_DAYS),
        min(today, target + dt.timedelta(days=7)),
        limit=60,
    )
    if not items:
        raise ProviderError(
            f"No Sentinel-2 scene below {SATELLITE_MAX_CLOUD_PCT:.0f}% cloud "
            f"near {target.isoformat()}"
        )
    return sorted(
        items,
        key=lambda item: (
            abs((_scene_date(item) - target).days),
            float(item.get("properties", {}).get("eo:cloud_cover", 100)),
        ),
    )


def _select_scene(lat: float, lon: float, on: dt.date) -> dict:
    return _candidate_scenes(lat, lon, on)[0]


def _read_asset_grid(
    item: dict,
    asset_name: str,
    lat: float,
    lon: float,
    *,
    size: int,
    radius_m: float,
    nearest: bool = False,
) -> np.ndarray:
    try:
        href = item["assets"][asset_name]["href"]
    except (KeyError, TypeError) as exc:
        raise ProviderError(f"Sentinel-2 scene lacks the {asset_name} band") from exc
    try:
        import rasterio
        from rasterio.enums import Resampling
        from rasterio.warp import transform
        from rasterio.windows import Window

        with rasterio.Env(
            AWS_NO_SIGN_REQUEST="YES",
            GDAL_DISABLE_READDIR_ON_OPEN="EMPTY_DIR",
            GDAL_HTTP_TIMEOUT="30",
            GDAL_HTTP_MAX_RETRY="2",
            CPL_VSIL_CURL_ALLOWED_EXTENSIONS=".tif",
        ):
            with rasterio.open(href) as dataset:
                x_values, y_values = transform(
                    "EPSG:4326", dataset.crs, [lon], [lat]
                )
                row, col = dataset.index(x_values[0], y_values[0])
                native_radius = max(
                    1,
                    int(
                        math.ceil(
                            radius_m
                            / max(abs(dataset.transform.a), abs(dataset.transform.e))
                        )
                    ),
                )
                window = Window(
                    col - native_radius,
                    row - native_radius,
                    native_radius * 2 + 1,
                    native_radius * 2 + 1,
                )
                return dataset.read(
                    1,
                    window=window,
                    out_shape=(size, size),
                    boundless=True,
                    fill_value=0,
                    resampling=Resampling.nearest if nearest else Resampling.bilinear,
                ).astype(np.float32)
    except ProviderError:
        raise
    except Exception as exc:
        raise ProviderError(
            f"Could not read Sentinel-2 {asset_name} pixels"
        ) from exc


def _scene_indices(
    item: dict,
    lat: float,
    lon: float,
    *,
    size: int,
    radius_m: float,
) -> dict:
    scl = _read_asset_grid(
        item, "scl", lat, lon, size=size, radius_m=radius_m, nearest=True
    ).astype(np.uint8)
    potential = np.isin(scl, [4, 5, 6, 7])
    if int(potential.sum()) == 0:
        raise ProviderError("Selected Sentinel-2 pixels are cloud-covered or nodata")
    red = _read_asset_grid(item, "red", lat, lon, size=size, radius_m=radius_m) / 10000.0
    nir = _read_asset_grid(item, "nir", lat, lon, size=size, radius_m=radius_m) / 10000.0
    swir = _read_asset_grid(item, "swir16", lat, lon, size=size, radius_m=radius_m) / 10000.0
    blue = _read_asset_grid(item, "blue", lat, lon, size=size, radius_m=radius_m) / 10000.0

    valid = potential & (red > 0) & (nir > 0) & (swir > 0) & (blue > 0)
    if int(valid.sum()) == 0:
        raise ProviderError("Selected Sentinel-2 pixels are cloud-covered or nodata")
    with np.errstate(divide="ignore", invalid="ignore"):
        ndvi = (nir - red) / (nir + red)
        ndwi = (nir - swir) / (nir + swir)
        savi = 1.5 * (nir - red) / (nir + red + 0.5)
        evi = 2.5 * (nir - red) / (nir + 6 * red - 7.5 * blue + 1)
    arrays = {}
    for key, array in {
        "ndvi": ndvi,
        "ndwi": ndwi,
        "savi": savi,
        "evi": evi,
    }.items():
        clean = np.where(valid & np.isfinite(array), np.clip(array, -1, 1), np.nan)
        arrays[key] = clean
    if not np.isfinite(arrays["ndvi"]).any():
        raise ProviderError("No valid vegetation-index pixels in selected scene")
    return {
        "arrays": arrays,
        "valid_pct": round(float(valid.mean() * 100), 1),
        "scene": item,
    }


def _scene_for_date(
    lat: float,
    lon: float,
    on: dt.date,
    *,
    size: int,
    radius_m: float,
) -> tuple[dict, dict]:
    last_error: ProviderError | None = None
    for item in _candidate_scenes(lat, lon, on)[:12]:
        try:
            return item, _scene_indices(
                item, lat, lon, size=size, radius_m=radius_m
            )
        except ProviderError as exc:
            last_error = exc
    raise ProviderError(
        f"No cloud-free Sentinel-2 pixels near {min(on, dt.date.today()).isoformat()}"
    ) from last_error


def _live_indices_on(lat: float, lon: float, on: dt.date) -> dict:
    item, result = _scene_for_date(lat, lon, on, size=3, radius_m=30)
    record = {
        "date": _scene_date(item).isoformat(),
        "requested_date": on.isoformat(),
        "valid_pct": result["valid_pct"],
        "data_source": _source(item),
    }
    for key, array in result["arrays"].items():
        record[key] = round(float(np.nanmedian(array)), 3)
    return record


def _live_timeline(lat: float, lon: float, months: int) -> list:
    today = dt.date.today()
    start = today - dt.timedelta(days=int((months - 1) * 30.44 + SATELLITE_LOOKBACK_DAYS))
    items = _search_items(lat, lon, start, today, limit=100)
    if not items:
        raise ProviderError("No Sentinel-2 scenes found for this field")
    candidate_groups: list[list[dict]] = []
    for offset in range(months - 1, -1, -1):
        target = today - dt.timedelta(days=int(offset * 30.44))
        candidates = sorted(
            [
            item for item in items if abs((_scene_date(item) - target).days) <= SATELLITE_LOOKBACK_DAYS
            ],
            key=lambda item: (
                abs((_scene_date(item) - target).days),
                float(item.get("properties", {}).get("eo:cloud_cover", 100)),
            ),
        )
        if candidates:
            candidate_groups.append(candidates[:12])

    def resolve(candidates: list[dict]):
        for chosen in candidates:
            try:
                result = _scene_indices(chosen, lat, lon, size=3, radius_m=30)
            except ProviderError:
                continue
            return chosen, result
        return None

    with ThreadPoolExecutor(max_workers=min(4, len(candidate_groups) or 1)) as pool:
        resolved = list(pool.map(resolve, candidate_groups))

    selected: list[tuple[dict, dict]] = []
    selected_ids: set[str] = set()
    for entry in resolved:
        if entry is None or entry[0].get("id") in selected_ids:
            continue
        selected.append(entry)
        selected_ids.add(entry[0].get("id"))

    series = []
    for item, result in selected:
        row = {
            "date": _scene_date(item).isoformat(),
            "valid_pct": result["valid_pct"],
            "data_source": _source(item),
        }
        for key, array in result["arrays"].items():
            row[key] = round(float(np.nanmedian(array)), 3)
        series.append(row)
    if not series:
        raise ProviderError("All selected Sentinel-2 scenes were cloud-covered at the field")
    return series


def _crop_stage_factor(planted: dt.date, on: dt.date) -> float:
    age_days = (on - planted).days % 365
    if age_days < 30:
        return 0.12 + 0.004 * age_days
    if age_days < 150:
        return 0.24 + 0.55 * (age_days - 30) / 120
    if age_days < 300:
        return 0.79 + 0.10 * math.sin((age_days - 150) / 150 * math.pi)
    return max(0.45, 0.79 - 0.0025 * (age_days - 300))


def _synthetic_field_ndvi(
    field_id: int,
    lat: float,
    lon: float,
    planted: dt.date,
    health: float,
    on: dt.date,
) -> float:
    stage = _crop_stage_factor(planted, on)
    rain30 = sum(day["rainfall_mm"] for day in weather_engine.history(lat, lon, 30))
    rain_boost = clamp((rain30 - 40) / 400, -0.08, 0.07)
    noise = 0.05 * smooth_noise(on.toordinal() / 16, f"ndvi{field_id}")
    health_term = (health / 100 - 0.5) * 0.22
    return round(
        clamp(0.18 + 0.62 * stage + rain_boost + noise + health_term, 0.05, 0.92),
        3,
    )


def field_ndvi(
    field_id: int,
    lat: float,
    lon: float,
    planted: dt.date,
    health: float,
    on: dt.date,
) -> float:
    if ENVIRONMENTAL_DATA_MODE == "live":
        return _live_indices_on(lat, lon, on)["ndvi"]
    return _synthetic_field_ndvi(field_id, lat, lon, planted, health, on)


def indices_on(
    field_id: int,
    lat: float,
    lon: float,
    planted: dt.date,
    health: float,
    on: dt.date,
) -> dict:
    if ENVIRONMENTAL_DATA_MODE == "live":
        return _live_indices_on(lat, lon, on)
    ndvi = _synthetic_field_ndvi(field_id, lat, lon, planted, health, on)
    rain30 = sum(day["rainfall_mm"] for day in weather_engine.history(lat, lon, 30))
    moisture = clamp(rain30 / 320, 0, 1)
    ndwi = round(
        clamp(
            -0.35
            + 0.75 * moisture
            + 0.35 * ndvi
            + 0.04 * smooth_noise(on.toordinal() / 9, f"w{field_id}"),
            -0.6,
            0.7,
        ),
        3,
    )
    savi = round(clamp(ndvi * 0.88 + 0.02, 0, 1), 3)
    evi = round(
        clamp(
            ndvi * 1.06
            - 0.05
            + 0.02 * smooth_noise(on.toordinal() / 11, f"e{field_id}"),
            0,
            1,
        ),
        3,
    )
    return {
        "date": on.isoformat(),
        "ndvi": ndvi,
        "ndwi": ndwi,
        "savi": savi,
        "evi": evi,
        "data_source": _source(),
    }


def timeline(
    field_id: int,
    lat: float,
    lon: float,
    planted: dt.date,
    health: float,
    months: int = 12,
) -> list:
    if ENVIRONMENTAL_DATA_MODE == "live":
        return _live_timeline(lat, lon, months)
    today = dt.date.today()
    return [
        indices_on(
            field_id,
            lat,
            lon,
            planted,
            health,
            today - dt.timedelta(days=int(month * 30.44)),
        )
        for month in range(months - 1, -1, -1)
    ]


def spatial_grid(
    field_id: int,
    lat: float,
    lon: float,
    planted: dt.date,
    health: float,
    index: str,
    on: dt.date,
) -> dict:
    if ENVIRONMENTAL_DATA_MODE == "live":
        item, result = _scene_for_date(
            lat,
            lon,
            on,
            size=GRID,
            radius_m=SATELLITE_GRID_RADIUS_M,
        )
        array = result["arrays"][index]
        finite = np.isfinite(array)
        mean = float(np.nanmean(array))
        cells = [
            [round(float(value), 3) if np.isfinite(value) else None for value in row]
            for row in array
        ]
        flat = [
            (float(array[row, col]), row, col)
            for row in range(GRID)
            for col in range(GRID)
            if finite[row, col]
        ]
        risk_zones = [
            {
                "row": row,
                "col": col,
                "value": round(value, 3),
                "severity": "high" if value < mean - 0.12 else "medium",
            }
            for value, row, col in sorted(flat)[:8]
            if value < mean - 0.06
        ]
        return {
            "index": index,
            "date": _scene_date(item).isoformat(),
            "requested_date": on.isoformat(),
            "grid_size": GRID,
            "mean": round(mean, 3),
            "cells": cells,
            "risk_zones": risk_zones,
            "valid_pct": result["valid_pct"],
            "data_source": _source(item),
        }

    base = indices_on(field_id, lat, lon, planted, health, on)[index]
    lo, hi = INDEX_META[index]["range"]
    cells, risk_zones = [], []
    for row_index in range(GRID):
        row = []
        for col_index in range(GRID):
            spatial = (
                smooth_noise(
                    row_index * 0.9 + col_index * 0.13,
                    f"g{field_id}{index}{col_index}",
                )
                * 0.5
                + smooth_noise(
                    col_index * 0.9 + row_index * 0.17,
                    f"h{field_id}{index}{row_index}",
                )
                * 0.5
            )
            drift = 0.25 * smooth_noise(
                on.toordinal() / 40 + row_index * 0.3 + col_index * 0.3,
                f"d{field_id}",
            )
            row.append(round(clamp(base + 0.14 * spatial + 0.05 * drift, lo, hi), 3))
        cells.append(row)
    flat = [
        (value, row_index, col_index)
        for row_index, row in enumerate(cells)
        for col_index, value in enumerate(row)
    ]
    mean = sum(value for value, _, _ in flat) / len(flat)
    for value, row_index, col_index in sorted(flat)[:8]:
        if value < mean - 0.06:
            risk_zones.append(
                {
                    "row": row_index,
                    "col": col_index,
                    "value": value,
                    "severity": "high" if value < mean - 0.12 else "medium",
                }
            )
    return {
        "index": index,
        "date": on.isoformat(),
        "grid_size": GRID,
        "mean": round(mean, 3),
        "cells": cells,
        "risk_zones": risk_zones,
        "valid_pct": 100.0,
        "data_source": _source(),
    }


def pass_timeline(field_id: int, lat: float, lon: float, days: int = 40) -> list:
    today = dt.date.today()
    if ENVIRONMENTAL_DATA_MODE == "live":
        items = _search_items(lat, lon, today - dt.timedelta(days=days), today, limit=60)
        return [
            {
                "date": _scene_date(item).isoformat(),
                "acquired_at": item.get("properties", {}).get("datetime"),
                "satellite": item.get("properties", {}).get("platform", "sentinel-2"),
                "scene_id": item.get("id"),
                "cloud_pct": round(
                    float(item.get("properties", {}).get("eo:cloud_cover", 0)), 1
                ),
                "usable": float(
                    item.get("properties", {}).get("eo:cloud_cover", 100)
                )
                < SATELLITE_MAX_CLOUD_PCT,
                "future": False,
                "data_source": _source(item),
            }
            for item in items
        ]
    offset = int(h01("pass", field_id) * 5)
    passes = []
    date = today - dt.timedelta(days=days)
    while date <= today + dt.timedelta(days=10):
        if (date.toordinal() + offset) % 5 == 0:
            cloud = round(100 * h01("cloud", field_id, date.isoformat()))
            passes.append(
                {
                    "date": date.isoformat(),
                    "satellite": (
                        "Sentinel-2A"
                        if (date.toordinal() // 5) % 2 == 0
                        else "Sentinel-2B"
                    ),
                    "cloud_pct": cloud,
                    "usable": cloud < 60,
                    "future": date > today,
                    "data_source": _source(),
                }
            )
        date += dt.timedelta(days=1)
    return passes


def constellation_status() -> list:
    if ENVIRONMENTAL_DATA_MODE == "live":
        get_json(
            f"{EARTH_SEARCH_STAC_URL}/",
            cache_key="earth-search:health",
            ttl=300,
        )
        return [
            {
                "name": "Sentinel-2 L2A via Earth Search",
                "status": "online",
                "revisit_days": 5,
                "resolution_m": 10,
                "last_pass": None,
                "data_source": _source(),
            }
        ]
    today = dt.date.today().isoformat()
    return [
        {
            "name": "Synthetic Sentinel-2A",
            "status": "synthetic",
            "revisit_days": 5,
            "resolution_m": 10,
            "last_pass": today,
            "data_source": _source(),
        }
    ]
