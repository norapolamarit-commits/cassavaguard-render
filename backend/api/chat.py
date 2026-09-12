"""Grounded advisory chatbot API."""
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.core.access import predictions_query
from backend.core.security import get_current_user
from backend.database import get_db
from backend.models import Prediction, User
from backend.services.advice_chatbot import answer

router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatIn(BaseModel):
    message: str = Field(min_length=1, max_length=500)
    language: str = Field(default="th", pattern="^(th|en)$")


@router.post("")
def chat(payload: ChatIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    latest = predictions_query(db, user).order_by(Prediction.created_at.desc()).first()
    context = None if latest is None else {"id": latest.id, "top_class": latest.top_class, "confidence": latest.confidence}
    return answer(payload.message, context, payload.language)
