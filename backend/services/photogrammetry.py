"""Local COLMAP reconstruction jobs for excavated cassava root crowns.

The geometry is reconstructed automatically. Metric scale is calibrated from one
field measurement (the root crown's maximum span); monocular photographs alone
have an unavoidable scale ambiguity.
"""
from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
import json
from pathlib import Path
import re
import shutil
import subprocess
import threading
import time
import uuid

from backend.config import UPLOAD_DIR
from backend.services.root_weight_model import predict_from_volume

_POOL = ThreadPoolExecutor(max_workers=1, thread_name_prefix="cg-colmap")
_LOCK = threading.Lock()
_JOBS: dict[str, dict] = {}
_HEX = re.compile(r"^[0-9a-f]{32}$")


def runtime_status() -> dict:
    return {
        "colmap": shutil.which("colmap"),
        "trimesh": _has_trimesh(),
        "available": bool(shutil.which("colmap") and _has_trimesh()),
    }


def _has_trimesh() -> bool:
    try:
        import trimesh  # noqa: F401
        return True
    except ImportError:
        return False


def start(set_id: str, reference_span_cm: float) -> dict:
    if not _HEX.fullmatch(set_id):
        raise ValueError("invalid image set id")
    source = UPLOAD_DIR / "root_sets" / set_id
    images = [p for p in source.iterdir()] if source.is_dir() else []
    if len(images) < 12:
        raise ValueError("at least 12 overlapping views are required")
    if not 5 <= reference_span_cm <= 300:
        raise ValueError("reference_span_cm must be between 5 and 300")
    status = runtime_status()
    if not status["available"]:
        raise RuntimeError("photogrammetry runtime is unavailable")
    job_id = uuid.uuid4().hex
    with _LOCK:
        _JOBS[job_id] = {"job_id": job_id, "status": "queued", "progress": 0, "set_id": set_id}
    _POOL.submit(_run, job_id, source, reference_span_cm)
    return dict(_JOBS[job_id])


def get(job_id: str) -> dict:
    with _LOCK:
        if job_id not in _JOBS:
            raise KeyError(job_id)
        return dict(_JOBS[job_id])


def _update(job_id: str, **values) -> None:
    with _LOCK:
        _JOBS[job_id].update(values)


def _command(job_id: str, args: list[str], progress: int) -> None:
    _update(job_id, progress=progress, stage=args[1])
    completed = subprocess.run(args, text=True, capture_output=True, timeout=60 * 45)
    if completed.returncode:
        tail = (completed.stderr or completed.stdout)[-2000:]
        raise RuntimeError(f"{args[1]} failed: {tail}")


def _run(job_id: str, source: Path, reference_span_cm: float) -> None:
    work = UPLOAD_DIR / "reconstructions" / job_id
    try:
        work.mkdir(parents=True, exist_ok=False)
        database = work / "database.db"
        sparse = work / "sparse"
        dense = work / "dense"
        sparse.mkdir()
        _update(job_id, status="running", started_at=time.time(), progress=2)
        _command(job_id, ["colmap", "feature_extractor", "--database_path", str(database), "--image_path", str(source), "--ImageReader.single_camera", "1", "--FeatureExtraction.use_gpu", "0"], 8)
        # Root sets are intentionally small (12-40 views), so exhaustive matching
        # closes the first/last-view loop without needing an external vocabulary tree.
        _command(job_id, ["colmap", "exhaustive_matcher", "--database_path", str(database), "--FeatureMatching.use_gpu", "0"], 20)
        _command(job_id, ["colmap", "mapper", "--database_path", str(database), "--image_path", str(source), "--output_path", str(sparse)], 35)
        models = sorted(p for p in sparse.iterdir() if p.is_dir())
        if not models:
            raise RuntimeError("no camera model was reconstructed; increase overlap and avoid blur")
        _command(job_id, ["colmap", "image_undistorter", "--image_path", str(source), "--input_path", str(models[0]), "--output_path", str(dense), "--output_type", "COLMAP"], 50)
        mesh_path = dense / "meshed.ply"
        dense_method = "dense_patch_match_poisson"
        try:
            _command(job_id, ["colmap", "patch_match_stereo", "--workspace_path", str(dense), "--workspace_format", "COLMAP", "--PatchMatchStereo.geom_consistency", "1"], 62)
            fused = dense / "fused.ply"
            _command(job_id, ["colmap", "stereo_fusion", "--workspace_path", str(dense), "--workspace_format", "COLMAP", "--input_type", "geometric", "--output_path", str(fused)], 78)
            _command(job_id, ["colmap", "poisson_mesher", "--input_path", str(fused), "--output_path", str(mesh_path)], 88)
        except RuntimeError:
            # Homebrew's Apple-silicon build has CPU SIFT but no CUDA PatchMatch.
            # Sparse Delaunay remains useful for review, but is never production eligible.
            dense_method = "sparse_delaunay_fallback"
            _command(job_id, ["colmap", "delaunay_mesher", "--input_path", str(dense), "--input_type", "sparse", "--output_path", str(mesh_path)], 88)
        import trimesh
        loaded = trimesh.load(mesh_path, force="mesh")
        raw_span = float(max(loaded.extents))
        if raw_span <= 0:
            raise RuntimeError("invalid reconstructed scale")
        scale_cm = reference_span_cm / raw_span
        measurement_mesh = loaded if loaded.is_watertight else loaded.convex_hull
        volume_cm3 = abs(float(measurement_mesh.volume)) * scale_cm ** 3
        weight = predict_from_volume(max(200, min(20000, volume_cm3)))
        result = {
            "volume_cm3": round(volume_cm3, 1),
            "reference_span_cm": reference_span_cm,
            "mesh_watertight": bool(loaded.is_watertight),
            "volume_method": "watertight_mesh" if loaded.is_watertight else "convex_hull_upper_bound",
            "reconstruction_method": dense_method,
            "weight": weight,
            "mesh_path": f"uploads/reconstructions/{job_id}/dense/{mesh_path.name}",
            "production_eligible": bool(dense_method == "dense_patch_match_poisson" and loaded.is_watertight and weight["in_training_domain"]),
        }
        (work / "result.json").write_text(json.dumps(result, indent=2), encoding="utf-8")
        _update(job_id, status="complete", progress=100, result=result, finished_at=time.time())
    except Exception as exc:
        _update(job_id, status="failed", error=str(exc), finished_at=time.time())
