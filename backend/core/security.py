"""Password hashing (PBKDF2, stdlib) + JWT auth (PyJWT)."""
import base64
import datetime as dt
import hashlib
import hmac
import os
import secrets

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from backend.config import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    AUTH_REQUIRED,
    ASSET_TOKEN_EXPIRE_MINUTES,
    JWT_ALGORITHM,
    RESET_TOKEN_EXPIRE_MINUTES,
    SECRET_KEY,
)
from backend.database import get_db
from backend.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

_ITER = 600_000


def _is_canonical_jwt(token: str) -> bool:
    """Reject alternate base64url spellings with non-zero discarded pad bits."""
    try:
        segments = token.split(".")
        if len(segments) != 3:
            return False
        for segment in segments:
            decoded = base64.urlsafe_b64decode(
                segment + "=" * (-len(segment) % 4)
            )
            canonical = base64.urlsafe_b64encode(decoded).rstrip(b"=").decode()
            if not hmac.compare_digest(segment, canonical):
                return False
        return True
    except (ValueError, UnicodeError):
        return False


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, _ITER)
    return f"pbkdf2${_ITER}${salt.hex()}${dk.hex()}"


def verify_password(password: str, hashed: str) -> bool:
    try:
        _, iters, salt_hex, dk_hex = hashed.split("$")
        dk = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt_hex), int(iters))
        return hmac.compare_digest(dk.hex(), dk_hex)
    except Exception:
        return False


def password_needs_rehash(hashed: str) -> bool:
    try:
        return int(hashed.split("$")[1]) < _ITER
    except (IndexError, TypeError, ValueError):
        return True


def create_access_token(user: User) -> str:
    now = dt.datetime.now(dt.timezone.utc)
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "ver": user.auth_version,
        "iat": now,
        "exp": now + dt.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        "type": "access",
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=JWT_ALGORITHM)


def make_reset_token() -> tuple[str, str]:
    raw = secrets.token_urlsafe(32)
    expires = int((dt.datetime.now(dt.timezone.utc)
                   + dt.timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)).timestamp())
    digest = hashlib.sha256(raw.encode()).hexdigest()
    return raw, f"v1${expires}${digest}"


def verify_reset_token(raw: str, stored: str) -> bool:
    try:
        version, expires, digest = stored.split("$", 2)
        if version != "v1" or int(expires) < int(dt.datetime.now(dt.timezone.utc).timestamp()):
            return False
        return hmac.compare_digest(hashlib.sha256(raw.encode()).hexdigest(), digest)
    except (AttributeError, TypeError, ValueError):
        return False


def create_asset_token(user: User, prediction_id: int, asset: str) -> str:
    now = dt.datetime.now(dt.timezone.utc)
    return jwt.encode(
        {
            "sub": str(user.id),
            "prediction_id": prediction_id,
            "asset": asset,
            "iat": now,
            "exp": now + dt.timedelta(minutes=ASSET_TOKEN_EXPIRE_MINUTES),
            "type": "asset",
        },
        SECRET_KEY,
        algorithm=JWT_ALGORITHM,
    )


def decode_asset_token(token: str, prediction_id: int, asset: str) -> int:
    try:
        if not _is_canonical_jwt(token):
            raise ValueError
        payload = jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
        if (
            payload.get("type") != "asset"
            or int(payload.get("prediction_id", 0)) != prediction_id
            or payload.get("asset") != asset
        ):
            raise ValueError
        return int(payload["sub"])
    except (jwt.PyJWTError, KeyError, TypeError, ValueError):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired asset token")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    cred_exc = HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token",
                             headers={"WWW-Authenticate": "Bearer"})
    if not token:
        if AUTH_REQUIRED:
            raise cred_exc
        user = db.query(User).filter(User.email == "app@cassavaguard.local").first()
        if user is None:
            user = db.query(User).order_by(User.id).first()
        if user is None:
            raise HTTPException(
                status.HTTP_503_SERVICE_UNAVAILABLE,
                "No application user is configured",
            )
        return user
    try:
        if not _is_canonical_jwt(token):
            raise cred_exc
        payload = jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise cred_exc
    except jwt.PyJWTError:
        raise cred_exc
    try:
        user_id = int(payload.get("sub", 0))
    except (TypeError, ValueError):
        raise cred_exc
    user = db.get(User, user_id)
    if user is None or int(payload.get("ver", -1)) != user.auth_version:
        raise cred_exc
    return user


def require_role(*roles: str):
    def checker(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Insufficient permissions")
        return user
    return checker
