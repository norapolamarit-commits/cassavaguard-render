#!/usr/bin/env python3
"""Download and verify the CC BY 4.0 India cassava training-only dataset."""
from __future__ import annotations

import argparse
import concurrent.futures
import datetime as dt
import hashlib
import json
import os
import tempfile
import urllib.request
from collections import Counter
from pathlib import Path

from backend.training.training_utils import atomic_write_json

DATASET_ID = "3832tx2cb2"
DATASET_VERSION = 1
DOI = "10.17632/3832tx2cb2.1"
LICENSE = "CC BY 4.0"
API_URL = f"https://data.mendeley.com/public-api/datasets/{DATASET_ID}"
CLASS_BY_FOLDER = {
    "3d07626f-3ee1-4939-bceb-91240420b718": "cbb",
    "d438a9d2-0798-4fcb-a1e7-6e3634440d6b": "cmd",
    "4f79bdab-0f9b-47cb-a31f-875c2609d314": "healthy",
}
HEADERS = {
    "Accept": "application/vnd.mendeley-public-dataset.1+json",
    "User-Agent": "CassavaGuard-training/1.0",
}


def _metadata() -> dict:
    request = urllib.request.Request(API_URL, headers=HEADERS)
    with urllib.request.urlopen(request, timeout=60) as response:
        metadata = json.loads(response.read())
    if metadata.get("id") != DATASET_ID or metadata.get("version") != DATASET_VERSION:
        raise RuntimeError("unexpected Mendeley dataset identity/version")
    return metadata


def _download(item: dict, output_dir: Path) -> tuple[str, bool]:
    class_name = CLASS_BY_FOLDER.get(item.get("folder_id"))
    if class_name is None:
        raise RuntimeError(f"unmapped Mendeley folder {item.get('folder_id')!r}")
    details = item["content_details"]
    expected = details["sha256_hash"]
    suffix = Path(item["filename"]).suffix.lower() or ".jpg"
    destination = output_dir / class_name / f"{item['id']}{suffix}"
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.is_file() and hashlib.sha256(destination.read_bytes()).hexdigest() == expected:
        return class_name, False

    request = urllib.request.Request(details["download_url"], headers=HEADERS)
    with urllib.request.urlopen(request, timeout=120) as response:
        payload = response.read()
    if hashlib.sha256(payload).hexdigest() != expected:
        raise RuntimeError(f"SHA-256 mismatch for {item['filename']}")
    fd, temporary_name = tempfile.mkstemp(prefix=".download-", dir=destination.parent)
    try:
        with os.fdopen(fd, "wb") as handle:
            handle.write(payload)
        os.replace(temporary_name, destination)
    finally:
        Path(temporary_name).unlink(missing_ok=True)
    return class_name, True


def main(argv=None) -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--workers", type=int, default=12)
    args = parser.parse_args(argv)
    if args.workers < 1:
        raise SystemExit("workers must be > 0")

    output_dir = args.output_dir.expanduser().resolve()
    metadata = _metadata()
    files = metadata.get("files", [])
    if len(files) != 228:
        raise RuntimeError(f"expected 228 published files, received {len(files)}")
    counts = Counter()
    downloaded = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = [pool.submit(_download, item, output_dir) for item in files]
        for future in concurrent.futures.as_completed(futures):
            class_name, created = future.result()
            counts[class_name] += 1
            downloaded += int(created)

    expected_counts = {"cbb": 49, "cmd": 88, "healthy": 91}
    if dict(sorted(counts.items())) != expected_counts:
        raise RuntimeError(f"class counts changed: {dict(counts)}")
    manifest = {
        "dataset_id": DATASET_ID,
        "version": DATASET_VERSION,
        "doi": DOI,
        "license": LICENSE,
        "source_url": f"https://data.mendeley.com/datasets/{DATASET_ID}/{DATASET_VERSION}",
        "retrieved_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "usage": "training_only; never validation or test",
        "label_mapping": {"CBB": "cbb", "CMD/CMV": "cmd", "CHL": "healthy"},
        "counts": expected_counts,
        "files": [
            {
                "id": item["id"],
                "published_filename": item["filename"],
                "class": CLASS_BY_FOLDER[item["folder_id"]],
                "sha256": item["content_details"]["sha256_hash"],
                "bytes": item["content_details"]["size"],
            }
            for item in files
        ],
    }
    atomic_write_json(output_dir / "source_manifest.json", manifest)
    print(json.dumps({"status": "ok", "downloaded": downloaded, **expected_counts}, indent=2))


if __name__ == "__main__":
    main()
