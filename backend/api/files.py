"""Short-lived signed access to prediction images and heatmaps."""
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from backend.config import UPLOAD_DIR
from backend.core.access import get_prediction
from backend.core.security import decode_asset_token
from backend.database import get_db
from backend.models import User

router = APIRouter(prefix="/api/files", tags=["files"])


@router.get("/{prediction_id}/{asset}")
def prediction_asset(
    prediction_id: int,
    asset: str,
    token: str = Query(..., min_length=20),
    db: Session = Depends(get_db),
):
    if asset not in {"image", "heatmap"}:
        raise HTTPException(404, "Asset not found")
    user_id = decode_asset_token(token, prediction_id, asset)
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(401, "Invalid asset token")
    prediction = get_prediction(db, prediction_id, user)
    relative = prediction.image_path if asset == "image" else prediction.heatmap_path
    if not relative:
        raise HTTPException(404, "Asset not found")

    path = (UPLOAD_DIR.parent / relative).resolve()
    upload_root = UPLOAD_DIR.resolve()
    try:
        path.relative_to(upload_root)
    except ValueError:
        raise HTTPException(404, "Asset not found")
    if not path.is_file():
        raise HTTPException(404, "Asset not found")
    return FileResponse(path, filename=Path(relative).name, content_disposition_type="inline")
