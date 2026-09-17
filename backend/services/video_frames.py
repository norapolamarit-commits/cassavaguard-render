"""Safe video-to-photogrammetry frame extraction using FFmpeg and Pillow."""
from __future__ import annotations

import json
from pathlib import Path
import shutil
import subprocess

import numpy as np
from PIL import Image, ImageOps
from scipy.ndimage import laplace


def runtime_status() -> dict:
    return {"ffmpeg": shutil.which("ffmpeg"), "ffprobe": shutil.which("ffprobe"), "available": bool(shutil.which("ffmpeg") and shutil.which("ffprobe"))}


def _probe(path: Path) -> dict:
    try:
        completed = subprocess.run([
            "ffprobe", "-v", "error", "-select_streams", "v:0",
            "-show_entries", "stream=width,height,duration:format=duration",
            "-of", "json", str(path),
        ], capture_output=True, text=True, timeout=30)
    except (FileNotFoundError, subprocess.TimeoutExpired) as exc:
        raise ValueError("video could not be decoded because ffprobe is unavailable") from exc
    if completed.returncode:
        raise ValueError("video could not be decoded")
    try:
        data = json.loads(completed.stdout)
    except json.JSONDecodeError as exc:
        raise ValueError("video could not be decoded") from exc
    if not data.get("streams"):
        raise ValueError("video has no visual stream")
    stream = data["streams"][0]
    duration = float(stream.get("duration") or data.get("format", {}).get("duration") or 0)
    if not 4 <= duration <= 90:
        raise ValueError("video duration must be 4-90 seconds")
    if int(stream.get("width", 0)) < 640 or int(stream.get("height", 0)) < 480:
        raise ValueError("video resolution must be at least 640x480")
    return {"duration_seconds": round(duration, 2), "width": int(stream["width"]), "height": int(stream["height"])}


def _hash(gray: np.ndarray) -> int:
    small = Image.fromarray(gray).resize((8, 8), Image.Resampling.BILINEAR)
    values = np.asarray(small, dtype=np.float32)
    bits = values > values.mean()
    return sum(int(bit) << index for index, bit in enumerate(bits.flat))


def extract(video_path: Path, output_dir: Path, target_frames: int = 30) -> dict:
    if not runtime_status()["available"]:
        raise RuntimeError("FFmpeg runtime is unavailable")
    metadata = _probe(video_path)
    candidates = output_dir / "_candidates"
    candidates.mkdir(parents=True, exist_ok=False)
    fps = max(2.0, min(5.0, target_frames * 1.8 / metadata["duration_seconds"]))
    completed = subprocess.run([
        "ffmpeg", "-v", "error", "-i", str(video_path), "-an",
        "-vf", f"fps={fps:.3f},scale='min(1920,iw)':-2",
        "-q:v", "2", str(candidates / "frame_%04d.jpg"),
    ], capture_output=True, text=True, timeout=180)
    if completed.returncode:
        raise RuntimeError(f"frame extraction failed: {completed.stderr[-1000:]}")
    rows = []
    for path in sorted(candidates.glob("*.jpg")):
        with Image.open(path) as opened:
            gray = np.asarray(ImageOps.grayscale(opened).resize((320, 240)), dtype=np.uint8)
        brightness = float(gray.mean())
        sharpness = float(laplace(gray.astype(np.float32)).var())
        rows.append({"path": path, "brightness": brightness, "sharpness": sharpness, "hash": _hash(gray)})
    if len(rows) < 12:
        raise ValueError("video produced fewer than 12 usable candidate frames")
    # Pick the sharpest non-extreme-exposure frame from evenly spaced time bins.
    selected = []
    bins = min(target_frames, len(rows))
    for index in range(bins):
        start, end = index * len(rows) // bins, (index + 1) * len(rows) // bins
        choices = [row for row in rows[start:end] if 25 <= row["brightness"] <= 235] or rows[start:end]
        choices.sort(key=lambda row: row["sharpness"], reverse=True)
        choice = next((row for row in choices if all((row["hash"] ^ old["hash"]).bit_count() >= 4 for old in selected[-3:])), choices[0])
        selected.append(choice)
    for index, row in enumerate(selected, 1):
        shutil.move(row["path"], output_dir / f"view_{index:02d}.jpg")
    shutil.rmtree(candidates)
    return {
        **metadata,
        "candidate_frames": len(rows),
        "selected_frames": len(selected),
        "fps_sampled": round(fps, 3),
        "mean_sharpness": round(float(np.mean([row["sharpness"] for row in selected])), 2),
        "selection": "time-stratified sharpness, exposure and perceptual-duplicate filtering",
    }
