"""Authentication routes: register, login, forgot/reset, profile."""
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from backend.config import EXPOSE_RESET_TOKEN
from backend.core.security import (
    create_access_token,
    get_current_user,
    hash_password,
    make_reset_token,
    password_needs_rehash,
    verify_password,
    verify_reset_token,
)
from backend.database import get_db
from backend.models import User
from backend.schemas import (ForgotIn, LoginIn, ProfileUpdate, RegisterIn,
                             ResetIn, TokenOut)
from backend.services import email_service

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _public(u: User) -> dict:
    return {"id": u.id, "email": u.email, "full_name": u.full_name,
            "role": u.role, "language": u.language}


@router.post("/register", response_model=TokenOut)
def register(body: RegisterIn, db: Session = Depends(get_db)):
    email = str(body.email).strip().lower()
    if db.query(User).filter_by(email=email).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")
    user = User(email=email, full_name=body.full_name.strip(), role="farmer",
                language=body.language, hashed_password=hash_password(body.password))
    db.add(user); db.commit(); db.refresh(user)
    return {"access_token": create_access_token(user), "token_type": "bearer", "user": _public(user)}


@router.post("/login", response_model=TokenOut)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # OAuth2 form uses `username` for the email field
    user = db.query(User).filter_by(email=form.username.strip().lower()).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password")
    if password_needs_rehash(user.hashed_password):
        user.hashed_password = hash_password(form.password)
        db.commit()
    return {"access_token": create_access_token(user), "token_type": "bearer", "user": _public(user)}


@router.post("/login-json", response_model=TokenOut)
def login_json(body: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(email=str(body.email).strip().lower()).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password")
    if password_needs_rehash(user.hashed_password):
        user.hashed_password = hash_password(body.password)
        db.commit()
    return {"access_token": create_access_token(user), "token_type": "bearer", "user": _public(user)}


@router.post("/forgot")
def forgot(body: ForgotIn, tasks: BackgroundTasks, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(email=str(body.email).strip().lower()).first()
    response = {"ok": True, "message": "If the account exists, a reset link was sent."}
    if user:
        raw_token, stored_token = make_reset_token()
        user.reset_token = stored_token
        db.commit()
        if email_service.smtp_configured():
            tasks.add_task(email_service.send_password_reset, user.email, raw_token)
        if EXPOSE_RESET_TOKEN:
            response["demo_token"] = raw_token
    return response


@router.post("/reset")
def reset(body: ResetIn, db: Session = Depends(get_db)):
    user = next(
        (candidate for candidate in db.query(User).filter(User.reset_token.isnot(None)).all()
         if verify_reset_token(body.token, candidate.reset_token)),
        None,
    )
    if not user:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired reset token")
    user.hashed_password = hash_password(body.new_password)
    user.reset_token = None
    user.auth_version += 1
    db.commit()
    return {"ok": True, "message": "Password updated."}


@router.get("/me")
def me(user: User = Depends(get_current_user)):
    return _public(user)


@router.patch("/me")
def update_me(body: ProfileUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if body.full_name is not None:
        user.full_name = body.full_name
    if body.language in ("th", "en"):
        user.language = body.language
    db.commit()
    return _public(user)
