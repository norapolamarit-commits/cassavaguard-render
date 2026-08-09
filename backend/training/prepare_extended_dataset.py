"""Prepare real and synthetic data for CassavaGuard's seven pending classes.

The important contract is provenance, not just folder names:

* ``real`` contains externally sourced, labelled photographs and annotations.
* ``synthetic`` contains generated seed images.  They are train-only, require
  expert review, and are never eligible for validation/test metrics.

This script downloads the two verified Embrapa PDDB subsets and all 3,000
image/XML pairs in the Cassava Whitefly Dataset.  Every provider checksum is
verified before a file becomes visible at its final path.
"""
from __future__ import annotations

import argparse
import concurrent.futures
import datetime as dt
import hashlib
import json
import shutil
import sys
import time
import urllib.request
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

from PIL import Image

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(REPO_ROOT))

from backend.training.training_utils import atomic_write_json, sha256_file

DEFAULT_ROOT = (
    REPO_ROOT / "backend" / "training" / "data" / "extended_conditions"
)
USER_AGENT = "CassavaGuard-training/1.0"
MENDELEY_API = "https://data.mendeley.com/public-api"

EMBRAPA = {
    "cad": {
        "file_id": 5964,
        "filename": "cad_embrapa.zip",
        "md5": "1c7f57121034fdc7c44788922e88645a",
        "source_file": (
            "Mandioca (Cassava) - Antracnose (Anthracnose) - 1.zip"
        ),
    },
    "white_leaf_spot": {
        "file_id": 6079,
        "filename": "white_leaf_spot_embrapa.zip",
        "md5": "72457adeb3da9ef524467a4b920d15fc",
        "source_file": (
            "Mandioca (Cassava) - Mancha Branca (White leaf spot) - Cropped.zip"
        ),
    },
}

WHITEFLY_FOLDERS = {
    "low_abundance": {
        "annotations": "b5e0f578-596e-493c-b5eb-326e2ef53e6e",
        "images": "da811771-d327-44a5-aa1f-5a88696a7468",
    },
    "moderate_abundance": {
        "annotations": "5e86a0ad-cb1a-461d-b050-b248d3030eb9",
        "images": "07b95a3d-1893-479d-bb2a-87eb50b40b52",
    },
    "super_abundance": {
        "annotations": "9e526455-4d83-44a0-a45a-a5f433986ea9",
        "images": "d53cd521-04ae-4bea-9cf1-d452d4d6fa89",
    },
}

REAL_SOURCES = {
    "embrapa_pddb": {
        "name": "Image Database of Plant Disease Symptoms (PDDB)",
        "doi": "10.48432/XA1OVL",
        "url": "https://doi.org/10.48432/XA1OVL",
        "license": "Embrapa CC BY-NC 4.0",
        "commercial_use_allowed": False,
        "label_quality": "labelled by experienced plant pathologists",
    },
    "cassava_whitefly": {
        "name": "Cassava Whitefly Dataset",
        "doi": "10.17632/5g38399z9p.3",
        "url": "https://doi.org/10.17632/5g38399z9p.3",
        "license": "CC BY 4.0",
        "commercial_use_allowed": True,
        "annotation": "PASCAL VOC XML bounding boxes",
    },
    "ciat_commons_mealybug": {
        "name": "CIAT cassava mealybug photographs via Wikimedia Commons",
        "url": (
            "https://commons.wikimedia.org/wiki/"
            "File:Mealybug2_(4288382696).jpg"
        ),
        "license": "CC BY-SA 2.0",
        "commercial_use_allowed": True,
        "credit": "Neil Palmer / CIAT",
        "annotation": "image-level subject description; no object boxes",
    },
    "bugwood_nutrient": {
        "name": "Bugwood image 5356709 — cassava zinc deficiency",
        "url": "https://www.invasive.org/browse/detail.cfm?imgnum=5356709",
        "license": "CC BY 3.0",
        "commercial_use_allowed": True,
        "credit": "William M. Brown Jr., Bugwood.org",
        "annotation": "laboratory image with zinc-deficiency subject label",
    },
}

STATIC_REAL_IMAGES = {
    "mealybug": [
        {
            "filename": "ciat_mealybug_4288382630.jpg",
            "url": (
                "https://upload.wikimedia.org/wikipedia/commons/f/fd/"
                "Mealybug1_%284288382630%29.jpg"
            ),
            "sha1": "31f30c03bcd31583ad9771e2d3c9f487efb52689",
            "source": "ciat_commons_mealybug",
        },
        {
            "filename": "ciat_mealybug_4288382696.jpg",
            "url": (
                "https://upload.wikimedia.org/wikipedia/commons/1/1c/"
                "Mealybug2_%284288382696%29.jpg"
            ),
            "sha1": "74bc3430088170dfbaa20ec5ec50773ec392e3ff",
            "source": "ciat_commons_mealybug",
        },
        {
            "filename": "ciat_mealybug_4288382550.jpg",
            "url": (
                "https://upload.wikimedia.org/wikipedia/commons/f/fd/"
                "Mealybug3_%284288382550%29.jpg"
            ),
            "sha1": "b6d464d7358a296d210500fe1809b85a34ec8dd4",
            "source": "ciat_commons_mealybug",
        },
    ],
    "nutrient_def": [
        {
            "filename": "bugwood_5356709_zinc_deficiency.jpg",
            "url": "https://bugwoodcloud.org/images/1536x1024/5356709.jpg",
            "source": "bugwood_nutrient",
        },
    ],
}

SYNTHETIC_POLICY = {
    "origin": "synthetic",
    "use": "train_only_augmentation_seed",
    "evaluation_allowed": False,
    "production_evidence_allowed": False,
    "expert_review_required": True,
    "reason": (
        "Generated pathology images can contain biologically incorrect details; "
        "they must never enter validation/test splits or justify serving status."
    ),
}


def _request(url: str, *, accept_json: bool = False):
    headers = {"User-Agent": USER_AGENT}
    if accept_json:
        headers["Accept"] = "application/vnd.mendeley-public-dataset.1+json"
    return urllib.request.Request(url, headers=headers)


def _json(url: str):
    with urllib.request.urlopen(_request(url, accept_json=True), timeout=90) as response:
        return json.loads(response.read())


def _md5(path: Path) -> str:
    digest = hashlib.md5()  # nosec B324 - provider checksum, not security
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def _download_stream(
    url: str,
    destination: Path,
    *,
    expected_sha256: str | None = None,
    expected_sha1: str | None = None,
    expected_md5: str | None = None,
    attempts: int = 6,
) -> bool:
    """Download to a temporary sibling and atomically publish after verification."""
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.is_file():
        if expected_sha256 and sha256_file(destination) == expected_sha256:
            return False
        if expected_sha1:
            current_sha1 = hashlib.sha1(destination.read_bytes()).hexdigest()  # nosec B324
            if current_sha1 == expected_sha1:
                return False
        if expected_md5 and _md5(destination) == expected_md5:
            return False

    temporary = destination.with_name(f".{destination.name}.part")
    last_error: Exception | None = None
    for attempt in range(attempts):
        try:
            digest_sha = hashlib.sha256()
            digest_sha1 = hashlib.sha1()  # nosec B324 - provider checksum
            digest_md5 = hashlib.md5()  # nosec B324 - provider checksum
            with urllib.request.urlopen(_request(url), timeout=180) as response:
                with temporary.open("wb") as output:
                    while block := response.read(1024 * 1024):
                        output.write(block)
                        digest_sha.update(block)
                        digest_sha1.update(block)
                        digest_md5.update(block)
            if expected_sha256 and digest_sha.hexdigest() != expected_sha256:
                raise RuntimeError(f"SHA-256 mismatch for {destination.name}")
            if expected_sha1 and digest_sha1.hexdigest() != expected_sha1:
                raise RuntimeError(f"SHA-1 mismatch for {destination.name}")
            if expected_md5 and digest_md5.hexdigest() != expected_md5:
                raise RuntimeError(f"MD5 mismatch for {destination.name}")
            temporary.replace(destination)
            return True
        except Exception as exc:
            last_error = exc
            if attempt + 1 < attempts:
                time.sleep(min(2 ** attempt, 16))
    raise RuntimeError(f"Download failed for {destination.name}: {last_error}")


def _extract_images(archive: Path, destination: Path) -> list[Path]:
    destination.mkdir(parents=True, exist_ok=True)
    extracted: list[Path] = []
    with zipfile.ZipFile(archive) as bundle:
        for member in bundle.infolist():
            name = Path(member.filename).name
            if not name or Path(name).suffix.lower() not in {".jpg", ".jpeg", ".png"}:
                continue
            target = destination / name
            with bundle.open(member) as source, target.open("wb") as output:
                shutil.copyfileobj(source, output)
            with Image.open(target) as image:
                image.verify()
            extracted.append(target)
    return extracted


def prepare_embrapa(root: Path) -> dict:
    download_dir = root / "downloads"
    summary = {}
    for class_name, spec in EMBRAPA.items():
        archive = download_dir / spec["filename"]
        created = _download_stream(
            f"https://www.redape.dados.embrapa.br/api/access/datafile/{spec['file_id']}",
            archive,
            expected_md5=spec["md5"],
        )
        images = _extract_images(archive, root / "real" / class_name / "images")
        summary[class_name] = {
            "origin": "real",
            "source": "embrapa_pddb",
            "source_file": spec["source_file"],
            "archive_md5": spec["md5"],
            "archive_downloaded_now": created,
            "images": len(images),
            "annotation": "dataset-level expert diagnosis",
            "evaluation_allowed": len(images) >= 30,
        }
    return summary


def prepare_static_real_images(root: Path) -> dict:
    summary = {}
    for class_name, items in STATIC_REAL_IMAGES.items():
        destination_dir = root / "real" / class_name / "images"
        files = []
        for item in items:
            target = destination_dir / item["filename"]
            _download_stream(
                item["url"],
                target,
                expected_sha1=item.get("sha1"),
            )
            with Image.open(target) as image:
                image.verify()
            files.append({
                "file": target.name,
                "sha256": sha256_file(target),
                "source": item["source"],
            })
        summary[class_name] = {
            "origin": "real",
            "images": len(files),
            "files": files,
            "annotation": "image-level source label; no detection boxes",
            "evaluation_allowed": False,
        }
    return summary


def _whitefly_items(folder_id: str) -> list[dict]:
    url = (
        f"{MENDELEY_API}/datasets/5g38399z9p/files"
        f"?folder_id={folder_id}&version=3"
    )
    items = _json(url)
    if len(items) != 1000:
        raise RuntimeError(
            f"Expected 1,000 Whitefly files in {folder_id}; provider returned {len(items)}"
        )
    return items


def _download_mendeley_item(item: dict, destination: Path) -> bool:
    return _download_stream(
        item["content_details"]["download_url"],
        destination,
        expected_sha256=item["content_details"]["sha256_hash"],
    )


def _valid_pascal_voc(xml_path: Path, image_path: Path) -> int:
    tree = ET.parse(xml_path)
    root = tree.getroot()
    filename = (root.findtext("filename") or "").strip()
    if filename and Path(filename).stem != image_path.stem:
        raise RuntimeError(
            f"Annotation/image filename mismatch: {xml_path.name} -> {filename}"
        )
    boxes = 0
    for obj in root.findall("object"):
        box = obj.find("bndbox")
        if box is None:
            continue
        coords = [int(float(box.findtext(name, "0"))) for name in (
            "xmin", "ymin", "xmax", "ymax"
        )]
        if coords[0] < coords[2] and coords[1] < coords[3]:
            boxes += 1
    if boxes == 0:
        raise RuntimeError(f"No valid bounding box in {xml_path.name}")
    with Image.open(image_path) as image:
        image.verify()
    return boxes


def prepare_whitefly(root: Path, workers: int) -> dict:
    base = root / "real" / "whitefly"
    class_summary = {}
    total_downloaded = 0
    for abundance, folders in WHITEFLY_FOLDERS.items():
        items_by_kind = {
            kind: _whitefly_items(folder_id)
            for kind, folder_id in folders.items()
        }
        expected_bytes = sum(
            int(item.get("size", 0))
            for items in items_by_kind.values()
            for item in items
        )
        futures = []
        downloaded = 0
        with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as pool:
            for kind, items in items_by_kind.items():
                destination_dir = base / abundance / kind
                for item in items:
                    safe_name = Path(item["filename"]).name
                    futures.append(pool.submit(
                        _download_mendeley_item,
                        item,
                        destination_dir / safe_name,
                    ))
            for completed, future in enumerate(
                concurrent.futures.as_completed(futures), 1
            ):
                downloaded += int(future.result())
                if completed % 100 == 0 or completed == len(futures):
                    print(
                        f"[whitefly] {abundance}: {completed}/{len(futures)} "
                        f"verified ({downloaded} downloaded now)",
                        flush=True,
                    )

        image_dir = base / abundance / "images"
        annotation_dir = base / abundance / "annotations"
        images = {path.stem: path for path in image_dir.glob("*") if path.is_file()}
        annotations = {
            path.stem: path for path in annotation_dir.glob("*.xml") if path.is_file()
        }
        if images.keys() != annotations.keys():
            missing_xml = sorted(images.keys() - annotations.keys())[:5]
            missing_image = sorted(annotations.keys() - images.keys())[:5]
            raise RuntimeError(
                f"Whitefly pairs incomplete for {abundance}: "
                f"missing_xml={missing_xml}, missing_image={missing_image}"
            )
        boxes = sum(
            _valid_pascal_voc(annotations[stem], image)
            for stem, image in sorted(images.items())
        )
        total_downloaded += downloaded
        class_summary[abundance] = {
            "images": len(images),
            "annotations": len(annotations),
            "valid_boxes": boxes,
            "bytes": expected_bytes,
            "downloaded_now": downloaded,
        }
    return {
        "origin": "real",
        "source": "cassava_whitefly",
        "images": sum(item["images"] for item in class_summary.values()),
        "annotations": sum(item["annotations"] for item in class_summary.values()),
        "valid_boxes": sum(item["valid_boxes"] for item in class_summary.values()),
        "downloaded_now": total_downloaded,
        "annotation": "PASCAL VOC bounding boxes",
        "evaluation_allowed": True,
        "abundance_groups": class_summary,
    }


def synthetic_summary(root: Path) -> dict:
    synthetic_root = root / "synthetic"
    result = {}
    if not synthetic_root.exists():
        return result
    for class_dir in sorted(path for path in synthetic_root.iterdir() if path.is_dir()):
        files = []
        for path in sorted(class_dir.glob("*")):
            if path.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
                continue
            try:
                with Image.open(path) as image:
                    image.verify()
            except Exception:
                continue
            files.append({
                "file": path.name,
                "sha256": sha256_file(path),
            })
        if files:
            result[class_dir.name] = {**SYNTHETIC_POLICY, "images": files}
    return result


def write_manifest(root: Path, real: dict) -> dict:
    manifest = {
        "schema_version": 1,
        "generated_at": dt.datetime.now(dt.UTC).isoformat(),
        "root": str(root),
        "split_policy": {
            "real": "eligible after class-specific quality and leakage checks",
            "synthetic": "training only; never validation or test",
        },
        "sources": REAL_SOURCES,
        "real": real,
        "synthetic": synthetic_summary(root),
    }
    atomic_write_json(root / "dataset_manifest.json", manifest)
    return manifest


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-root", type=Path, default=DEFAULT_ROOT)
    parser.add_argument("--workers", type=int, default=12)
    parser.add_argument(
        "--skip-whitefly",
        action="store_true",
        help="Prepare only the smaller Embrapa subsets and the current manifest.",
    )
    args = parser.parse_args()
    root = args.data_root.resolve()
    root.mkdir(parents=True, exist_ok=True)

    real = prepare_embrapa(root)
    real.update(prepare_static_real_images(root))
    if args.skip_whitefly:
        print("[whitefly] skipped by request")
    else:
        real["whitefly"] = prepare_whitefly(root, max(1, args.workers))
    manifest = write_manifest(root, real)
    print(json.dumps({
        "manifest": str(root / "dataset_manifest.json"),
        "real": {
            key: value.get("images")
            for key, value in manifest["real"].items()
        },
        "synthetic_classes": sorted(manifest["synthetic"]),
    }, indent=2))


if __name__ == "__main__":
    main()
