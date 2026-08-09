"""Admin-only user and role management."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.core.security import require_role
from backend.database import get_db
from backend.models import User
from backend.schemas import RoleUpdate

router = APIRouter(prefix="/api/admin", tags=["admin"])


def _public(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "language": user.language,
        "created_at": user.created_at.isoformat(),
    }


@router.get("/users")
def users(
    _admin: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    return [_public(user) for user in db.query(User).order_by(User.id).all()]


@router.patch("/users/{user_id}/role")
def update_role(
    user_id: int,
    body: RoleUpdate,
    admin: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    if body.role not in {"admin", "researcher", "farmer"}:
        raise HTTPException(422, "Unknown role")
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(404, "User not found")
    if user.id == admin.id and body.role != "admin":
        other_admins = db.query(User).filter(User.role == "admin", User.id != admin.id).count()
        if other_admins == 0:
            raise HTTPException(409, "Create another admin before changing the last admin")
    user.role = body.role
    user.auth_version += 1
    db.commit()
    return _public(user)
