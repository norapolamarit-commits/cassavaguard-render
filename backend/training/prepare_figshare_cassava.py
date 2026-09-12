"""Prepare the CC BY 4.0 Figshare Cassava Image Dataset3 for training.

Only the publisher's train split is materialized as extra training data. Its test
split remains sealed for later external-domain evaluation. Every image is decoded,
within-source duplicates are quarantined, and provenance/checksums are recorded.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import sys
import zipfile
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import urlopen

from PIL import Image

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT))

from backend.training.train_cnn_torch import (  # noqa: E402
    PERCEPTUAL_MAX_PHASH_HAMMING,
    _fingerprints_for_path,
    _hamming_hex,
)

DOI = "10.6084/m9.figshare.21769070.v2"
ARTICLE_URL = "https://figshare.com/articles/dataset/Cassava_Image_Dataset3/21769070"
DOWNLOAD_URL = "https://ndownloader.figshare.com/files/38630456"
EXPECTED_MD5 = "10ac3eb77b5f933235fe805957c0971d"
CLASSES = ("cbsd", "cmd", "healthy")


def _md5(path: Path) -> str:
    digest = hashlib.md5(usedforsecurity=False)
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _download(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(".partial")
    with urlopen(DOWNLOAD_URL, timeout=60) as response, temporary.open("wb") as handle:
        shutil.copyfileobj(response, handle)
    temporary.replace(path)


def prepare(archive: Path, output: Path) -> dict:
    archive, output = archive.resolve(), output.resolve()
    if not archive.exists():
        _download(archive)
    actual_md5 = _md5(archive)
    if actual_md5 != EXPECTED_MD5:
        raise RuntimeError(f"archive MD5 mismatch: {actual_md5}")

    output.mkdir(parents=True, exist_ok=True)
    for class_name in CLASSES:
        (output / class_name).mkdir(parents=True, exist_ok=True)

    counts = Counter()
    sealed_counts = Counter()
    removed = Counter()
    seen_exact = set()
    seen_perceptual: list[tuple[str, str]] = []
    with zipfile.ZipFile(archive) as bundle:
        for member in sorted(bundle.infolist(), key=lambda item: item.filename):
            parts = Path(member.filename).parts
            if member.is_dir() or len(parts) != 4 or parts[0] != "archive":
                continue
            split, class_name = parts[1], parts[2]
            if split not in {"train", "test"} or class_name not in CLASSES:
                continue
            if split == "test":
                sealed_counts[class_name] += 1
                continue
            temporary = output / ".candidate-image"
            with bundle.open(member) as source, temporary.open("wb") as target:
                shutil.copyfileobj(source, target)
            try:
                with Image.open(temporary) as image:
                    image.verify()
                exact, dhash, phash = _fingerprints_for_path(temporary)
                if exact in seen_exact:
                    removed["exact"] += 1
                    continue
                if any(
                    dhash == known_dhash
                    and _hamming_hex(phash, known_phash) <= PERCEPTUAL_MAX_PHASH_HAMMING
                    for known_dhash, known_phash in seen_perceptual
                ):
                    removed["perceptual"] += 1
                    continue
                seen_exact.add(exact)
                seen_perceptual.append((dhash, phash))
                target = output / class_name / f"{exact[:12]}__{Path(member.filename).name}"
                temporary.replace(target)
                counts[class_name] += 1
            finally:
                temporary.unlink(missing_ok=True)

    manifest = {
        "schema_version": 1,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "title": "Cassava Image Dataset3",
        "source_url": ARTICLE_URL,
        "doi": DOI,
        "authors": ["Viet Chau Nguyen"],
        "license": "CC BY 4.0",
        "license_url": "https://creativecommons.org/licenses/by/4.0/",
        "source_archive": {"url": DOWNLOAD_URL, "md5": actual_md5},
        "class_mapping": {name: name for name in CLASSES},
        "usage": "publisher train split -> CassavaGuard training_only",
        "accepted": sum(counts.values()),
        "accepted_per_class": dict(counts),
        "within_source_duplicates_removed": dict(removed),
        "sealed_external_test": {
            "used_for_training": False,
            "count": sum(sealed_counts.values()),
            "per_class": dict(sealed_counts),
        },
        "limitations": [
            "Only CBSD, CMD, and healthy labels map to the five-class runtime.",
            "Publisher metadata does not provide plant/field IDs.",
            "The training command performs another duplicate audit against all TFDS splits.",
        ],
    }
    (output / "source_manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    return manifest


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--archive", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args(argv)
    print(json.dumps(prepare(args.archive, args.output), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
